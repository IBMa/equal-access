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

'use strict';

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { ACReporterXLSX } from "../../../../src/mjs/lib/common/report/ACReporterXLSX.js";
import { expect } from "chai";
import AdmZip from "adm-zip";

// ---------------------------------------------------------------------------
// Helpers — parse XLSX (which is a ZIP) to extract sheet data
// ---------------------------------------------------------------------------

/**
 * Returns a map of sheetName → 2-D array of cell values (strings)
 * by reading the raw XML inside the XLSX zip.
 */
function readXlsxSheets(filePath) {
    const zip = new AdmZip(filePath);

    // Read workbook.xml to get sheet name → rId mapping.
    // write-excel-file emits r:id before name, so we extract each attribute
    // independently rather than relying on a fixed order.
    const wbXml = zip.getEntry("xl/workbook.xml").getData().toString("utf8");
    const sheetNames = [];
    const sheetRe = /<sheet ([^/]*\/?>)/g;
    let m;
    while ((m = sheetRe.exec(wbXml)) !== null) {
        const attrs = m[1];
        const nameM = /name="([^"]+)"/.exec(attrs);
        const ridM = /r:id="([^"]+)"/.exec(attrs);
        if (nameM && ridM) sheetNames.push({ name: nameM[1], rId: ridM[1] });
    }

    // Read workbook.xml.rels to map rId → sheet file
    const relsXml = zip.getEntry("xl/_rels/workbook.xml.rels").getData().toString("utf8");
    const relMap = {};
    const relRe = /<Relationship[^>]+Id="([^"]+)"[^>]+Target="([^"]+)"/g;
    while ((m = relRe.exec(relsXml)) !== null) {
        relMap[m[1]] = m[2];
    }

    // Read sharedStrings.xml
    const ssEntry = zip.getEntry("xl/sharedStrings.xml");
    const sharedStrings = [];
    if (ssEntry) {
        const ssXml = ssEntry.getData().toString("utf8");
        const siRe = /<si>([\s\S]*?)<\/si>/g;
        while ((m = siRe.exec(ssXml)) !== null) {
            // Collect all <t> text nodes within the <si>
            const tRe = /<t[^>]*>([^<]*)<\/t>/g;
            let text = "";
            let tm;
            while ((tm = tRe.exec(m[1])) !== null) {
                text += tm[1];
            }
            sharedStrings.push(text);
        }
    }

    // Parse each sheet's XML into a 2-D array
    const result = {};
    for (const { name, rId } of sheetNames) {
        const target = relMap[rId]; // e.g. "worksheets/sheet1.xml"
        const sheetEntry = zip.getEntry(`xl/${target}`);
        if (!sheetEntry) continue;
        const sheetXml = sheetEntry.getData().toString("utf8");

        // Use a sparse array indexed by actual Excel row number (1-based → 0-based index).
        // Rows can be sparse (e.g. rows 8–10 omitted when cells use merged spans).
        // The regex handles both self-closing (<c ... />) and content (<c ...>...</c>) forms.
        const rows = [];
        const cellRe = /<c r="([A-Z]+)(\d+)"([^/]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
        let cm;
        while ((cm = cellRe.exec(sheetXml)) !== null) {
            const colStr = cm[1];
            const rowNum = parseInt(cm[2]) - 1; // 0-based
            const attrs = cm[3];
            const inner = cm[4] ?? ""; // undefined for self-closing tags
            // Column index (A=0, B=1, …)
            let col = 0;
            for (const ch of colStr) col = col * 26 + (ch.charCodeAt(0) - 64);
            col -= 1;

            if (!rows[rowNum]) rows[rowNum] = [];
            const vMatch = /<v>([^<]*)<\/v>/.exec(inner);
            if (vMatch) {
                if (/t="s"/.test(attrs)) {
                    rows[rowNum][col] = sharedStrings[parseInt(vMatch[1])] ?? "";
                } else if (/t="inlineStr"/.test(attrs)) {
                    const tMatch = /<t>([^<]*)<\/t>/.exec(inner);
                    rows[rowNum][col] = tMatch ? tMatch[1] : "";
                } else {
                    rows[rowNum][col] = vMatch[1];
                }
            }
        }
        result[name] = rows;
    }
    return result;
}

/** Return the value at a cell reference like "A1", "B12" (1-based). */
function cell(sheets, sheetName, ref) {
    const col = ref.charCodeAt(0) - 65;
    const row = parseInt(ref.slice(1)) - 1;
    return (sheets[sheetName]?.[row]?.[col]) ?? "";
}

// ---------------------------------------------------------------------------
// Minimal stub data — compressed array format expected by uncompressReport()
// Indices: [startScan, url, pageTitle, label, scanProfile, numExecuted,
//           scanTime, ruleArchive, policies, reportLevels, issues[], counts]
// ---------------------------------------------------------------------------
function makeCompressedReport() {
    return [
        Date.now(),           // 0 startScan
        "http://localhost/test.html", // 1 url
        "XLSX mocha test page",       // 2 pageTitle
        "mocha-xlsx-test",            // 3 label
        "",                           // 4 scanProfile
        0,                            // 5 numExecuted
        0,                            // 6 scanTime
        "Latest",                     // 7 ruleArchive
        ["IBM_Accessibility"],         // 8 policies
        ["violation","potentialviolation","recommendation","potentialrecommendation","manual"], // 9 reportLevels
        [],                           // 10 issues (compressed results)
        { violation: 0, potentialviolation: 0, manual: 0, recommendation: 0, potentialrecommendation: 0, ignored: 0 }, // 11 counts
    ];
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("XLSX report generation", function () {
    this.timeout(30000);

    let xlsxPath;
    let sheets;
    let outputFolder;

    before(async function () {
        outputFolder = fs.mkdtempSync(path.join(os.tmpdir(), "achecker-xlsx-"));

        const config = {
            toolID: "4.0.0-test",
            ruleArchiveLabel: "Latest Deployment",
            policies: ["IBM_Accessibility"],
            outputFolder,
            outputFilenameTimestamp: false,
        };

        const reporter = new ACReporterXLSX();
        const { summary } = await reporter.generateSummary(config, [], Date.now(), [makeCompressedReport()]);

        xlsxPath = path.join(outputFolder, "results.xlsx");
        await summary(xlsxPath);

        expect(fs.existsSync(xlsxPath), `XLSX file not found at ${xlsxPath}`).to.be.true;
        sheets = readXlsxSheets(xlsxPath);
    });

    after(function () {
        fs.rmSync(outputFolder, { recursive: true, force: true });
    });

    it("XLSX file contains the expected sheet names", function () {
        expect(Object.keys(sheets)).to.include.members([
            "Overview",
            "Scan summary",
            "Issue summary",
            "Issues",
            "Definition of fields",
        ]);
    });

    it("Overview sheet A1 is 'Accessibility Scan Report'", function () {
        expect(cell(sheets, "Overview", "A1")).to.equal("Accessibility Scan Report");
    });

    it("Overview sheet A11 is 'Summary'", function () {
        expect(cell(sheets, "Overview", "A11")).to.equal("Summary");
    });

    it("Overview sheet summary column headers are correct", function () {
        expect(cell(sheets, "Overview", "A12")).to.equal("Total issues");
        expect(cell(sheets, "Overview", "B12")).to.equal("Violations");
        expect(cell(sheets, "Overview", "C12")).to.equal("Needs review");
        expect(cell(sheets, "Overview", "D12")).to.equal("Recommendations");
        expect(cell(sheets, "Overview", "E12")).to.equal("Archived");
    });

    it("Scan summary sheet A1 is 'Page title'", function () {
        expect(cell(sheets, "Scan summary", "A1")).to.equal("Page title");
    });

    it("Issue summary sheet A1 is 'Issue summary'", function () {
        expect(cell(sheets, "Issue summary", "A1")).to.equal("Issue summary");
    });

    it("Issues sheet header row has correct column names", function () {
        expect(cell(sheets, "Issues", "A1")).to.equal("Page title");
        expect(cell(sheets, "Issues", "B1")).to.equal("Page URL");
        expect(cell(sheets, "Issues", "C1")).to.equal("Scan label");
        expect(cell(sheets, "Issues", "N1")).to.equal("Help");
    });

    it("Definition of fields sheet A1 is 'Definition of fields'", function () {
        expect(cell(sheets, "Definition of fields", "A1")).to.equal("Definition of fields");
    });
});
