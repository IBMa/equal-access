/******************************************************************************
     Copyright:: 2020- IBM, Inc

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 *****************************************************************************/

import ReportUtil from "../../reportUtil";
import writeExcelFile from "write-excel-file/browser";
import { unzipSync, strFromU8, strToU8, zipSync } from "fflate";
import { IArchiveDefinition, IStoredReportMeta, StoredScanData } from "../../../../interfaces/interfaces";

// ─── XLSX table injection ──────────────────────────────────────────────────────
//
// write-excel-file has no native Excel table API. We post-process the Blob it
// produces: unzip it with fflate (already a transitive dep), inject the table
// definition XML, wire the sheet to reference it, and re-zip.
//
// The Issues sheet is always sheet index 3 (0-based) → sheetId "4".
// The table covers A1:<lastCol><lastRow> where lastCol = "N" (14 columns).
// TableStyleMedium2 + showRowStripes matches the original ExcelJS output.

const ISSUES_SHEET_ID = "4";
const TABLE_ID = "1";
const TABLE_COL_COUNT = 14;
const COL_LETTERS = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N"];

function colLetter(n: number): string { return COL_LETTERS[n - 1] ?? "A"; }

function tableXml(rowCount: number): string {
    const lastCol = colLetter(TABLE_COL_COUNT);
    const ref = `A1:${lastCol}${rowCount}`;
    const cols = [
        "Page title","Page URL","Scan label","Issue ID","Issue type",
        "Toolkit level","Checkpoint","WCAG level","Rule","Issue",
        "Element","Code","Xpath","Help",
    ].map((name, i) =>
        `<tableColumn id="${i+1}" name="${name}"/>`
    ).join("");
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"` +
        ` id="${TABLE_ID}" name="IssuesTable" displayName="IssuesTable" ref="${ref}"` +
        ` headerRowCount="1">` +
        `<autoFilter ref="${ref}"/>` +
        `<tableColumns count="${TABLE_COL_COUNT}">${cols}</tableColumns>` +
        `<tableStyleInfo name="TableStyleMedium2" showFirstColumn="0"` +
        ` showLastColumn="0" showRowStripes="1" showColumnStripes="0"/>` +
        `</table>`;
}

function tableRelsXml(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1"` +
        ` Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/table"` +
        ` Target="../tables/table${TABLE_ID}.xml"/>` +
        `</Relationships>`;
}

async function injectTable(blob: Blob, issueRowCount: number): Promise<Blob> {
    // 1. Unzip
    const arrayBuf = await blob.arrayBuffer();
    const files = unzipSync(new Uint8Array(arrayBuf));

    // 2. Add xl/tables/table1.xml
    files[`xl/tables/table${TABLE_ID}.xml`] = strToU8(tableXml(issueRowCount));

    // 3. Patch (or create) xl/worksheets/_rels/sheet4.xml.rels to add the table relationship
    const relsKey = `xl/worksheets/_rels/sheet${ISSUES_SHEET_ID}.xml.rels`;
    const existingRels = files[relsKey] ? strFromU8(files[relsKey]) : null;
    if (existingRels && existingRels.includes("<Relationships")) {
        // Insert before closing tag
        files[relsKey] = strToU8(existingRels.replace(
            "</Relationships>",
            `<Relationship Id="rIdTbl"` +
            ` Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/table"` +
            ` Target="../tables/table${TABLE_ID}.xml"/>` +
            `</Relationships>`
        ));
    } else {
        files[relsKey] = strToU8(tableRelsXml());
    }

    // 4. Patch xl/worksheets/sheet4.xml to add <tableParts> before </worksheet>
    const sheetKey = `xl/worksheets/sheet${ISSUES_SHEET_ID}.xml`;
    const sheetXml = strFromU8(files[sheetKey]);
    files[sheetKey] = strToU8(sheetXml.replace(
        "</worksheet>",
        `<tableParts count="1"><tablePart r:id="rIdTbl"/></tableParts></worksheet>`
    ));

    // 5. Patch [Content_Types].xml to register the table XML content type
    const ctKey = "[Content_Types].xml";
    const ctXml = strFromU8(files[ctKey]);
    files[ctKey] = strToU8(ctXml.replace(
        "</Types>",
        `<Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml"` +
        ` PartName="/xl/tables/table${TABLE_ID}.xml"/></Types>`
    ));

    // 6. Re-zip and return as Blob
    const zipped = zipSync(files);
    return new Blob([zipped], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
}

function perc(a: number, b: number) {
    return parseInt((((a) / b) * 100).toFixed(0));
}

// ─── Cell style helpers ────────────────────────────────────────────────────────

function hdr(value: any, extra: any = {}): any {
    return { value, backgroundColor: "#403151", textColor: "#FFFFFF", fontFamily: "Calibri", fontSize: 16, alignVertical: "center", align: "left", ...extra };
}

function colHdr(value: any, bg: string, textColor = "#000000", extra: any = {}): any {
    return { value, backgroundColor: bg, textColor, fontFamily: "Calibri", fontSize: 12, borderColor: "#A6A6A6", borderStyle: "thin", alignVertical: "center", align: "center", ...extra };
}

function bd(value: any, extra: any = {}): any {
    return { value, fontFamily: "Calibri", fontSize: 12, textColor: "#000000", borderColor: "#A6A6A6", borderStyle: "thin", alignVertical: "center", ...extra };
}

// ─── Sheet builders ────────────────────────────────────────────────────────────

function buildOverviewSheet(storedScans: IStoredReportMeta[], archives: IArchiveDefinition[]): any {
    let violations = 0, needsReviews = 0, recommendations = 0, hidden = 0;
    for (const s of storedScans) {
        violations    += (s.counts.Violation        || 0);
        needsReviews  += (s.counts["Needs review"]  || 0);
        recommendations += (s.counts.Recommendation || 0);
        hidden        += (s.counts.Hidden            || 0);
    }
    const totalIssues = violations + needsReviews + recommendations;
    const lastScan = storedScans[storedScans.length - 1];
    const uniqueURLs = new Set(storedScans.map(s => s.pageURL)).size;

    const columns = [
        { width: 15.1 }, { width: 15.9 }, { width: 16.23 }, { width: 19.4 }, { width: 15.9 }
    ];

    const rowMeta = [
        { key1: "Tool:",        key2: "IBM Equal Access Accessibility Checker" },
        { key1: "Version:",     key2: chrome.runtime.getManifest().version },
        // @ts-ignore
        { key1: "Rule set:",    key2: (lastScan.ruleset === "Latest Deployment") ? archives[1].name : lastScan.ruleset },
        { key1: "Guidelines:",  key2: lastScan.guideline },
        { key1: "Report date:", key2: new Date(lastScan.timestamp) },
        { key1: "Platform:",    key2: navigator.userAgent },
        { key1: "Scans:",       key2: storedScans.length },
        { key1: "Pages:",       key2: uniqueURLs },
    ];

    const data: any[][] = [];

    // Row 1: title spanning 5 cols
    data.push([hdr("Accessibility Scan Report", { height: 27, columnSpan: 5 }), null, null, null, null]);

    // Rows 2–9: metadata (key in col A, value spanning B–D)
    for (let i = 0; i < rowMeta.length; i++) {
        const h = i === 5 ? 36 : 12; // Platform row is taller
        data.push([
            { value: rowMeta[i].key1, fontFamily: "Calibri", fontSize: 12, textColor: "#000000", align: "left", height: h },
            { value: rowMeta[i].key2, fontFamily: "Calibri", fontSize: 12, textColor: "#000000", align: "left", wrap: i === 5, columnSpan: 4 },
            null, null, null
        ]);
    }

    // Row 10: blank
    data.push([null]);

    // Row 11: "Summary" title
    data.push([hdr("Summary", { height: 27, columnSpan: 5 }), null, null, null, null]);

    // Row 12: column headers
    data.push([
        colHdr("Issues",           "#000000", "#FFFFFF", { height: 16 }),
        colHdr("Violations",       "#E4AAAF"),
        colHdr("Needs review",     "#F4E08A"),
        colHdr("Recommendations",  "#96A9D7"),
        colHdr("Hidden",           "#BFBFBF"),
    ]);

    // Row 13: values
    data.push([
        bd(totalIssues,     { align: "center", height: 27 }),
        bd(violations,      { align: "center" }),
        bd(needsReviews,    { align: "center" }),
        bd(recommendations, { align: "center" }),
        bd(hidden,          { align: "center" }),
    ]);

    return { data, sheet: "Overview", columns };
}

function buildScanSummarySheet(storedScans: IStoredReportMeta[]): any {
    const columns = [
        { width: 27.0 }, { width: 46.0 }, { width: 20.17 }, { width: 18.5 },
        { width: 17.17 }, { width: 17.17 }, { width: 17.17 }, { width: 17.17 },
        { width: 17.17 }, { width: 17.17 },
    ];

    const hBase = { backgroundColor: "#403151", textColor: "#FFFFFF", fontFamily: "Calibri", fontSize: 12, borderColor: "#A6A6A6", borderStyle: "thin", alignVertical: "center", height: 39 };

    const data: any[][] = [];

    data.push([
        { value: "Page title",    ...hBase, align: "left" },
        { value: "Page url",      ...hBase, align: "left" },
        { value: "Scan label",    ...hBase, align: "left" },
        { value: "Base scan",     ...hBase, align: "left" },
        colHdr("Violations",      "#E4AAAF", "#000000", { height: 39 }),
        colHdr("Needs review",    "#F4E08A", "#000000", { height: 39 }),
        colHdr("Recommendations", "#96A9D7", "#000000", { height: 39 }),
        colHdr("Hidden",          "#BFBFBF", "#000000", { height: 39 }),
        colHdr("% elements without violations",                        "#000000", "#FFFFFF", { height: 39, wrap: true }),
        colHdr("% elements without violations or items to review",     "#000000", "#FFFFFF", { height: 39, wrap: true }),
    ]);

    for (const storedScan of storedScans) {
        const violations = storedScan.storedScanData.filter((r: StoredScanData) => r[4] === "Violation");
        const potentials = storedScan.storedScanData.filter((r: StoredScanData) => r[4] === "Needs review");
        const violationXpaths = violations.map((r: StoredScanData) => r[12]);
        const reviewXpaths    = potentials.map((r: StoredScanData) => r[12]);
        const violationPlusPotentialXpaths = violationXpaths.concat(reviewXpaths);
        const violationUniqueElements = new Set(violationXpaths).size;
        const violationPlusPotentialUniqueElements = new Set(violationPlusPotentialXpaths).size;
        const tested = (storedScan.testedUniqueElements || 0);

        const tStyle = { fontFamily: "Calibri", fontSize: 12, textColor: "#000000", alignVertical: "center", height: 37, wrap: true };
        const nStyle = { ...tStyle, align: "center", borderColor: "#A6A6A6", borderStyle: "thin" };
        data.push([
            { value: storedScan.pageTitle, ...tStyle, align: "left" },
            { value: storedScan.pageURL,   ...tStyle, align: "left" },
            { value: storedScan.label,     ...tStyle, align: "left" },
            { value: "none",               ...tStyle, align: "left" },
            { value: storedScan.counts["Violation"]     || 0, ...nStyle },
            { value: storedScan.counts["Needs review"]  || 0, ...nStyle },
            { value: storedScan.counts["Recommendation"]|| 0, ...nStyle },
            { value: storedScan.counts["Hidden"]        || 0, ...nStyle },
            { value: perc(tested - violationUniqueElements, tested),                         ...nStyle },
            { value: perc(tested - violationPlusPotentialUniqueElements, tested),            ...nStyle },
        ]);
    }

    return { data, sheet: "Scan summary", columns };
}

// ─── Issue summary helpers ─────────────────────────────────────────────────────

type IssueDef = { issueDef: string; hidden: boolean };

function countDuplicatesInArray(array: IssueDef[]): { [key: string]: [number, number] } {
    const dup: { [k: string]: number } = {};
    const hid: { [k: string]: number } = {};
    for (const item of array) {
        if (!item.hidden) {
            dup[item.issueDef] = (dup[item.issueDef] || 0) + 1;
            hid[item.issueDef] = (hid[item.issueDef] || 0);
        } else {
            dup[item.issueDef] = (dup[item.issueDef] || 0);
            hid[item.issueDef] = (hid[item.issueDef] || 0) + 1;
        }
    }
    const final: { [k: string]: [number, number] } = {};
    for (const k of Object.keys({ ...dup, ...hid })) {
        final[k] = [dup[k] || 0, hid[k] || 0];
    }
    return final;
}

function levelSubRows(bg: string, textColor: string, label: string,
    count: number, hiddenCount: number,
    rowValues: { [k: string]: [number, number] }): any[][] {
    const rows: any[][] = [];

    // Sub-header row
    rows.push([
        { value: `     ${label}`, backgroundColor: bg, textColor, fontFamily: "Calibri", fontSize: 12, borderColor: "#A6A6A6", borderStyle: "thin", alignVertical: "center", align: "left", height: 18 },
        { value: count,       backgroundColor: bg, textColor, fontFamily: "Calibri", fontSize: 12, borderColor: "#A6A6A6", borderStyle: "thin", alignVertical: "center", align: "right" },
        { value: hiddenCount, backgroundColor: bg, textColor, fontFamily: "Calibri", fontSize: 12, borderColor: "#A6A6A6", borderStyle: "thin", alignVertical: "center", align: "center" },
    ]);

    // Individual issue rows sorted desc by visible count
    const sorted = Object.entries(rowValues).sort((a, b) => b[1][0] - a[1][0]);
    for (const [msg, [vis, hid]] of sorted) {
        rows.push([
            { value: "     " + msg, fontFamily: "Calibri", fontSize: 12, textColor: "#000000", borderColor: "#A6A6A6", borderStyle: "thin", alignVertical: "center", align: "left", height: 14 },
            { value: vis,           fontFamily: "Calibri", fontSize: 12, textColor: "#000000", borderColor: "#A6A6A6", borderStyle: "thin", alignVertical: "center", align: "right" },
            { value: hid,           fontFamily: "Calibri", fontSize: 12, textColor: "#000000", borderColor: "#A6A6A6", borderStyle: "thin", alignVertical: "center", align: "center" },
        ]);
    }
    return rows;
}

function levelRows(title: string, counts: number[],
    V: IssueDef[], NR: IssueDef[], R: IssueDef[]): any[][] {
    const rows: any[][] = [];
    const hiddenCount = counts[4];

    // Level header row
    rows.push([
        { value: title, backgroundColor: "#403151", textColor: "#FFFFFF", fontFamily: "Calibri", fontSize: 16, alignVertical: "center", align: "left", height: 27 },
        { value: counts[0], backgroundColor: "#403151", textColor: "#FFFFFF", fontFamily: "Calibri", fontSize: 16, alignVertical: "center", align: "right" },
        { value: hiddenCount, backgroundColor: "#403151", textColor: "#FFFFFF", fontFamily: "Calibri", fontSize: 16, alignVertical: "center", align: "center", borderColor: "#A6A6A6", borderStyle: "thin" },
    ]);

    const vValues  = countDuplicatesInArray(V);
    const nrValues = countDuplicatesInArray(NR);
    const rValues  = countDuplicatesInArray(R);

    const hiddenV  = Object.values(vValues).reduce((s, [,h]) => s + h, 0);
    const hiddenNR = Object.values(nrValues).reduce((s, [,h]) => s + h, 0);
    const hiddenR  = Object.values(rValues).reduce((s, [,h]) => s + h, 0);

    rows.push(...levelSubRows("#E4AAAF", "#000000", "Violation",     counts[1], hiddenV,  vValues));
    rows.push(...levelSubRows("#F4E08A", "#000000", "Needs review",  counts[2], hiddenNR, nrValues));
    rows.push(...levelSubRows("#96A9D7", "#000000", "Recommendation",counts[3], hiddenR,  rValues));

    return rows;
}

function buildIssueSummarySheet(storedScans: IStoredReportMeta[]): any {
    const columns = [{ width: 155.51 }, { width: 21.16 }, { width: 18.0 }];

    const lvl = [1,2,3,4].map(() => ({ counts: [0,0,0,0,0], V: [] as IssueDef[], NR: [] as IssueDef[], R: [] as IssueDef[] }));

    for (const storedScan of storedScans) {
        for (const row of storedScan.storedScanData) {
            const lv = row[5];
            if (lv < 1 || lv > 4) continue;
            const L = lvl[lv - 1];
            const isHidden = !!row[14];
            if (!isHidden) L.counts[0]++;
            if (row[4] === "Violation")     { if (!isHidden) L.counts[1]++; L.V.push({issueDef: row[9], hidden: isHidden}); }
            if (row[4] === "Needs review")  { if (!isHidden) L.counts[2]++; L.NR.push({issueDef: row[9], hidden: isHidden}); }
            if (row[4] === "Recommendation"){ if (!isHidden) L.counts[3]++; L.R.push({issueDef: row[9], hidden: isHidden}); }
            if (isHidden) L.counts[4]++;
        }
    }

    const totalIssues = lvl.reduce((s, l) => s + l.counts[0], 0);
    const totalHidden = lvl.reduce((s, l) => s + l.counts[4], 0);

    const data: any[][] = [];

    // Row 1: title
    data.push([
        { value: "Issue summary", backgroundColor: "#403151", textColor: "#FFFFFF", fontFamily: "Calibri", fontSize: 16, alignVertical: "center", align: "left", height: 27, columnSpan: 3 },
        null, null
    ]);

    // Row 2: description + column headers
    data.push([
        { value: "     In the IBM Equal Access Toolkit, issues are divided into four levels (1-3). Tackle the levels in order to address some of the most impactful issues first.", fontFamily: "Calibri", fontSize: 12, textColor: "#000000", alignVertical: "center", align: "left", height: 20 },
        { value: "Issues", backgroundColor: "#E3E3E3", textColor: "#000000", fontFamily: "Calibri", fontSize: 12, borderColor: "#A6A6A6", borderStyle: "thin", alignVertical: "center", align: "right" },
        { value: "Hidden issues", backgroundColor: "#E3E3E3", textColor: "#000000", fontFamily: "Calibri", fontSize: 12, borderColor: "#A6A6A6", borderStyle: "thin", alignVertical: "center", align: "center" },
    ]);

    // Row 3: totals
    data.push([
        { value: "Issues found:", backgroundColor: "#000000", textColor: "#FFFFFF", fontFamily: "Calibri", fontSize: 16, alignVertical: "center", align: "left", height: 27 },
        { value: totalIssues, backgroundColor: "#000000", textColor: "#FFFFFF", fontFamily: "Calibri", fontSize: 16, alignVertical: "center", align: "right" },
        { value: totalHidden, backgroundColor: "#000000", textColor: "#FFFFFF", fontFamily: "Calibri", fontSize: 16, alignVertical: "center", align: "center", borderColor: "#A6A6A6", borderStyle: "thin" },
    ]);

    // Row 4: blank header row with "Number of issues" label
    data.push([
        { value: null, borderColor: "#A6A6A6", borderStyle: "thin", height: 20 },
        null, null
    ]);

    // Levels 1–4
    const titles = [
        "Level 1 - the most essential issues to address",
        "Level 2 - the next most important issues",
        "Level 3 - necessary to meet requirements",
        "Level 4 - further recommended improvements to accessibility",
    ];
    for (let i = 0; i < 4; i++) {
        data.push(...levelRows(titles[i], lvl[i].counts, lvl[i].V, lvl[i].NR, lvl[i].R));
    }

    return { data, sheet: "Issue summary", columns };
}

function buildIssuesSheet(storedScans: IStoredReportMeta[]): any {
    const columns = [
        { width: 18.0 }, { width: 20.5 }, { width: 21.0 }, { width: 18.5 },
        { width: 23.0 }, { width: 17.17 }, { width: 17.17 }, { width: 17.17 },
        { width: 17.17 }, { width: 17.17 }, { width: 14.0 }, { width: 17.17 },
        { width: 43.0 }, { width: 17.17 },
    ];

    const hStyle = { backgroundColor: "#403151", textColor: "#FFFFFF", fontFamily: "Calibri", fontSize: 12, borderColor: "#A6A6A6", borderStyle: "thin", align: "center", alignVertical: "center", wrap: true, height: 24 };

    const data: any[][] = [];

    data.push([
        { value: "Page title",    ...hStyle },
        { value: "Page URL",      ...hStyle },
        { value: "Scan label",    ...hStyle },
        { value: "Issue ID",      ...hStyle },
        { value: "Issue type",    ...hStyle },
        { value: "Toolkit level", ...hStyle },
        { value: "Checkpoint",    ...hStyle },
        { value: "WCAG level",    ...hStyle },
        { value: "Rule",          ...hStyle },
        { value: "Issue",         ...hStyle },
        { value: "Element",       ...hStyle },
        { value: "Code",          ...hStyle },
        { value: "Xpath",         ...hStyle },
        { value: "Help",          ...hStyle },
    ]);

    for (const storedScan of storedScans) {
        for (const r of storedScan.storedScanData) {
            const dStyle = { fontFamily: "Calibri", fontSize: 12, textColor: "#000000", borderColor: "#A6A6A6", borderStyle: "thin", height: 14, alignVertical: "center" };
            data.push([
                { value: r[0],  ...dStyle, align: "left" },
                { value: r[1],  ...dStyle, align: "left" },
                { value: storedScan.label, ...dStyle, align: "center" },
                { value: r[3],  ...dStyle, align: "left" },
                { value: r[14] ? "Hidden:" + r[4] : r[4], ...dStyle, align: "center" },
                { value: Number.isNaN(r[5]) ? "n/a" : r[5],  ...dStyle, align: "center" },
                { value: r[6],  ...dStyle, align: "left" },
                { value: Number.isNaN(r[5]) ? "n/a" : r[7],  ...dStyle, align: "center" },
                { value: r[8],  ...dStyle, align: "left" },
                { value: r[9],  ...dStyle, align: "left" },
                { value: r[10], ...dStyle, align: "center" },
                { value: r[11], ...dStyle, align: "left" },
                { value: r[12], ...dStyle, align: "left" },
                { value: r[13], ...dStyle, align: "left" },
            ]);
        }
    }

    // stickyRowsCount freezes the header row while scrolling.
    // Row banding and autofilter come from the real Excel table injected in injectTable().
    return { data, sheet: "Issues", columns, stickyRowsCount: 1, _issueRowCount: data.length };
}

function buildDefinitionsSheet(): any {
    const columns = [{ width: 41.51 }, { width: 119.51 }];

    const titleStyle   = { backgroundColor: "#403151", textColor: "#FFFFFF", fontFamily: "Calibri", fontSize: 20, alignVertical: "center", align: "left" };
    const sectionStyle = { backgroundColor: "#403151", textColor: "#FFFFFF", fontFamily: "Calibri", fontSize: 16, alignVertical: "center", align: "left" };
    const subHdrStyle  = { backgroundColor: "#CCC0DA", textColor: "#000000", fontFamily: "Calibri", fontSize: 16, borderColor: "#A6A6A6", borderStyle: "thin", alignVertical: "center", align: "left" };
    const dataStyle    = { fontFamily: "Calibri", fontSize: 12, textColor: "#000000", align: "left", height: 12 };

    const summaryDefs = [
        { key1: "Page",            key2: "Identifies the page or html file that was scanned." },
        { key1: "Scan label",      key2: "Label for the scan. Default values can be edited in the Accessibility Checker before saving this report, or programmatically assigned in automated testing." },
        { key1: "Base scan",       key2: "Scan label for a previous scan against which this scan was compared. Only new issues are reported when a base scan is used." },
        { key1: "Violations",      key2: "Accessibility failures that need to be corrected." },
        { key1: "Needs review",    key2: "Issues that may not be a violation. These need a manual review to identify whether there is an accessibility problem." },
        { key1: "Recommendations", key2: "Opportunities to apply best practices to further improve accessibility." },
        { key1: "Hidden",          key2: "Issues the user has selected to be hidden from view and subtracted from the issue counts." },
        { key1: "% elements without violations",                      key2: "Percentage of elements on the page that had no violations found." },
        { key1: "% elements without violations or items to review",   key2: "Percentage of elements on the page that had no violations found and no items to review." },
        { key1: "Level 1,2,3",     key2: "Priority level defined by the IBM Equal Access Toolkit. See https://www.ibm.com/able/toolkit/plan/overview#pace-of-completion for details." },
    ];

    const issuesDefs = [
        { key1: "Page",            key2: "Identifies the page or html file that was scanned." },
        { key1: "Scan label",      key2: "Label for the scan. Default values can be edited in the Accessibility Checker before saving this report, or programmatically assigned in automated testing." },
        { key1: "Issue ID",        key2: "Identifier for this issue within this page. Rescanning the same page will produce the same issue ID. " },
        { key1: "Issue type",      key2: "Violation, needs review, or recommendation" },
        { key1: "Toolkit level",   key2: "1, 2 or 3. Priority level defined by the IBM Equal Access Toolkit. See https://www.ibm.com/able/toolkit/plan/overview#pace-of-completion for details" },
        { key1: "Checkpoint",      key2: "Web Content Accessibility Guidelines (WCAG) checkpoints this issue falls into." },
        { key1: "WCAG level",      key2: "A, AA or AAA. WCAG level for this issue." },
        { key1: "Rule",            key2: "Name of the accessibility test rule that detected this issue." },
        { key1: "Issue",           key2: "Message describing the issue." },
        { key1: "Element",         key2: "Type of HTML element where the issue is found." },
        { key1: "Code",            key2: "Actual HTML element where the issue is found." },
        { key1: "Xpath",           key2: "Xpath of the HTML element where the issue is found." },
        { key1: "Help",            key2: "Link to a more detailed description of the issue and suggested solutions." },
    ];

    const data: any[][] = [];

    data.push([{ value: "Definition of fields", ...titleStyle, height: 36, columnSpan: 2 }, null]);
    data.push([{ value: null, height: 12, columnSpan: 2 }, null]);
    data.push([{ value: "Scan summary and Issue summary", ...sectionStyle, height: 20, columnSpan: 2 }, null]);
    data.push([{ value: "Field", ...subHdrStyle, height: 16 }, { value: "Definition", ...subHdrStyle }]);
    for (const row of summaryDefs) {
        data.push([{ value: row.key1, ...dataStyle }, { value: row.key2, ...dataStyle }]);
    }
    data.push([{ value: null, height: 12, columnSpan: 2 }, null]);
    data.push([{ value: "Issues", ...sectionStyle, height: 20, columnSpan: 2 }, null]);
    data.push([{ value: "Field", ...subHdrStyle, height: 16 }, { value: "Definition", ...subHdrStyle }]);
    for (const row of issuesDefs) {
        data.push([{ value: row.key1, ...dataStyle }, { value: row.key2, ...dataStyle }]);
    }

    return { data, sheet: "Definition of fields", columns };
}

// ─── Public API ────────────────────────────────────────────────────────────────

export default class MultiScanReport {

    public static async multiScanXlsxDownload(storedScans: IStoredReportMeta[], archives: IArchiveDefinition[]) {
        const blob = await MultiScanReport.generateBlob(storedScans, archives);
        const fileName = ReportUtil.single_page_report_file_name(storedScans[storedScans.length - 1].pageTitle);
        ReportUtil.download_file(blob, fileName);
    }

    public static async generateBlob(storedScans: IStoredReportMeta[], archives: IArchiveDefinition[]): Promise<Blob> {
        const issuesSheet = buildIssuesSheet(storedScans);
        const issueRowCount: number = issuesSheet._issueRowCount;
        delete issuesSheet._issueRowCount;

        const sheets = [
            buildOverviewSheet(storedScans, archives),
            buildScanSummarySheet(storedScans),
            buildIssueSummarySheet(storedScans),
            issuesSheet,
            buildDefinitionsSheet(),
        ];
        const blob = await writeExcelFile(sheets).toBlob();
        return injectTable(blob, issueRowCount);
    }

    /** @deprecated Use generateBlob() instead */
    public static async generateWorkbook(storedScans: IStoredReportMeta[], archives: IArchiveDefinition[]) {
        // Returns a pseudo-workbook whose only capability is xlsx.writeBuffer(),
        // preserved for any callers that may still call this method.
        return {
            xlsx: {
                writeBuffer: async () => {
                    const blob = await MultiScanReport.generateBlob(storedScans, archives);
                    return await blob.arrayBuffer();
                }
            }
        };
    }
}
