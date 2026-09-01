"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACReporterXLSX = void 0;
const IConfig_js_1 = require("../config/IConfig.js");
const IGuideline_js_1 = require("../engine/IGuideline.js");
const IRule_js_1 = require("../engine/IRule.js");
const ReporterManager_js_1 = require("./ReporterManager.js");
// Lazy-load write-excel-file — will be null if not installed
let writeExcelLoadPromise = null;
let writeExcelWarningShown = false;
function loadWriteExcel() {
    if (!writeExcelLoadPromise) {
        const moduleName = "write-excel-file/node";
        writeExcelLoadPromise = Promise.resolve(`${moduleName}`).then(s => __importStar(require(s))).then(module => { var _a; return (_a = module.default) !== null && _a !== void 0 ? _a : module; })
            .catch(() => null);
    }
    return writeExcelLoadPromise;
}
function showWriteExcelWarning() {
    if (!writeExcelWarningShown) {
        writeExcelWarningShown = true;
        console.warn("Warning: write-excel-file is not installed. XLSX report generation is disabled.");
        console.warn("To enable XLSX reports, install write-excel-file: npm install write-excel-file");
    }
}
function dropDupes(arr) {
    let dupes = {};
    return arr.filter(item => {
        if (item.toString() in dupes) {
            return false;
        }
        {
            return dupes[item.toString()] = true;
        }
    });
}
// Convert ExcelJS-style ARGB (FFRRGGBB) to 6-digit hex (#RRGGBB)
function argbToHex(argb) {
    if (!argb || argb.length < 6)
        return "#000000";
    // Strip leading alpha if 8 chars
    const rgb = argb.length === 8 ? argb.slice(2) : argb;
    return `#${rgb}`;
}
// Helper: cell with dark purple header style
function headerCell(value, columnSpan) {
    const cell = {
        value,
        backgroundColor: "#403151",
        textColor: "#FFFFFF",
        fontFamily: "Calibri",
        fontSize: 16,
        alignVertical: "center",
        align: "left",
        height: 36,
    };
    if (columnSpan && columnSpan > 1)
        cell.columnSpan = columnSpan;
    return cell;
}
// Helper: standard data cell
function dataCell(value, opts) {
    return Object.assign({ value, fontFamily: "Calibri", fontSize: 12, textColor: "#000000" }, opts);
}
// Helper: bordered cell
function borderedCell(value, opts) {
    return Object.assign({ value, fontFamily: "Calibri", fontSize: 12, textColor: "#000000", borderColor: "#A6A6A6", borderStyle: "thin" }, opts);
}
// ─── XLSX table injection ──────────────────────────────────────────────────────
// write-excel-file has no native Excel table API. We post-process the output
// file: unzip it with Node's built-in zlib, inject the table definition XML,
// wire the sheet to reference it, and re-zip.
//
// The Issues sheet is always sheet index 3 (0-based) → sheetId "4".
// TableStyleMedium2 + showRowStripes matches the original ExcelJS output.
const ISSUES_SHEET_ID = "4";
const ISSUES_TABLE_ID = "1";
const ISSUES_COL_COUNT = 14;
const ISSUES_COL_NAMES = [
    "Page title", "Page URL", "Scan label", "Issue ID", "Issue type",
    "Toolkit level", "Checkpoint", "WCAG level", "Rule", "Issue",
    "Element", "Code", "Xpath", "Help",
];
function buildTableXml(rowCount) {
    const lastCol = "ABCDEFGHIJKLMN"[ISSUES_COL_COUNT - 1];
    const ref = `A1:${lastCol}${rowCount}`;
    const cols = ISSUES_COL_NAMES.map((name, i) => `<tableColumn id="${i + 1}" name="${name}"/>`).join("");
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"` +
        ` id="${ISSUES_TABLE_ID}" name="IssuesTable" displayName="IssuesTable" ref="${ref}" headerRowCount="1">` +
        `<autoFilter ref="${ref}"/>` +
        `<tableColumns count="${ISSUES_COL_COUNT}">${cols}</tableColumns>` +
        `<tableStyleInfo name="TableStyleMedium2" showFirstColumn="0"` +
        ` showLastColumn="0" showRowStripes="1" showColumnStripes="0"/>` +
        `</table>`;
}
function injectTableIntoFile(filePath, issueRowCount) {
    return __awaiter(this, void 0, void 0, function* () {
        let AdmZip;
        try {
            // webpackIgnore prevents Cypress/webpack from trying to bundle this Node-only module.
            // The try/catch ensures graceful degradation if adm-zip is not installed.
            AdmZip = require(/* webpackIgnore: true */ "adm-zip");
        }
        catch (_a) {
            // adm-zip not available — skip table injection gracefully
            return;
        }
        const zip = new AdmZip(filePath);
        // 1. Add xl/tables/table1.xml
        const tableXml = buildTableXml(issueRowCount);
        zip.addFile(`xl/tables/table${ISSUES_TABLE_ID}.xml`, Buffer.from(tableXml, "utf8"));
        // 2. Patch xl/worksheets/_rels/sheet4.xml.rels
        const relsPath = `xl/worksheets/_rels/sheet${ISSUES_SHEET_ID}.xml.rels`;
        const relsEntry = zip.getEntry(relsPath);
        const tableRel = `<Relationship Id="rIdTbl"` +
            ` Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/table"` +
            ` Target="../tables/table${ISSUES_TABLE_ID}.xml"/>`;
        if (relsEntry) {
            const existing = relsEntry.getData().toString("utf8");
            zip.updateFile(relsPath, Buffer.from(existing.replace("</Relationships>", tableRel + "</Relationships>"), "utf8"));
        }
        else {
            zip.addFile(relsPath, Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
                `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
                tableRel + `</Relationships>`, "utf8"));
        }
        // 3. Patch xl/worksheets/sheet4.xml — add <tableParts> before </worksheet>
        const sheetPath = `xl/worksheets/sheet${ISSUES_SHEET_ID}.xml`;
        const sheetXml = zip.getEntry(sheetPath).getData().toString("utf8");
        zip.updateFile(sheetPath, Buffer.from(sheetXml.replace("</worksheet>", `<tableParts count="1"><tablePart r:id="rIdTbl"/></tableParts></worksheet>`), "utf8"));
        // 4. Patch [Content_Types].xml
        const ctPath = "[Content_Types].xml";
        const ctXml = zip.getEntry(ctPath).getData().toString("utf8");
        zip.updateFile(ctPath, Buffer.from(ctXml.replace("</Types>", `<Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml"` +
            ` PartName="/xl/tables/table${ISSUES_TABLE_ID}.xml"/></Types>`), "utf8"));
        zip.writeZip(filePath);
    });
}
class ACReporterXLSX {
    name() {
        return "xlsx";
    }
    generateReport(_reportData) {
    }
    generateSummary(config, rulesets, endReport, summaryData) {
        return __awaiter(this, void 0, void 0, function* () {
            let storedReport = ReporterManager_js_1.ReporterManager.uncompressReport(summaryData[0]);
            let cfgRulesets = rulesets.filter(rs => config.policies.includes(rs.id));
            let policyInfo = {};
            for (const rs of cfgRulesets) {
                for (const cp of rs.checkpoints) {
                    for (const rule of cp.rules) {
                        policyInfo[rule.id] = policyInfo[rule.id] || {
                            tkLevels: [],
                            cps: []
                        };
                        policyInfo[rule.id].tkLevels.push(rule.toolkitLevel);
                        policyInfo[rule.id].cps.push(cp);
                    }
                }
            }
            for (const ruleId in policyInfo) {
                policyInfo[ruleId].tkLevels = dropDupes(policyInfo[ruleId].tkLevels);
                policyInfo[ruleId].tkLevels.sort();
            }
            let startScan = new Date(storedReport.engineReport.summary.startScan);
            let reportFilename = `results_${startScan.toISOString().replace(/:/g, "-")}.xlsx`;
            if (config.outputFilenameTimestamp === false) {
                reportFilename = `results.xlsx`;
            }
            return {
                summaryPath: reportFilename,
                summary: (filename) => __awaiter(this, void 0, void 0, function* () {
                    const writeExcelFile = yield loadWriteExcel();
                    if (!writeExcelFile) {
                        showWriteExcelWarning();
                        return;
                    }
                    const issuesSheet = ACReporterXLSX.createIssuesSheet(config, policyInfo, summaryData);
                    const issueRowCount = issuesSheet._issueRowCount;
                    delete issuesSheet._issueRowCount;
                    const sheets = [
                        ACReporterXLSX.createOverviewSheet(config, summaryData),
                        ACReporterXLSX.createScanSummarySheet(config, summaryData),
                        ACReporterXLSX.createIssueSummarySheet(config, policyInfo, summaryData),
                        issuesSheet,
                        ACReporterXLSX.createDefinitionsSheet(),
                    ];
                    yield writeExcelFile(sheets).toFile(filename);
                    yield injectTableIntoFile(filename, issueRowCount);
                })
            };
        });
    }
    static createOverviewSheet(config, compressedScans) {
        let violations = 0;
        let needsReviews = 0;
        let recommendations = 0;
        let archived = 0;
        let totalIssues = 0;
        let startScan = 0;
        for (const compressedScan of compressedScans) {
            let storedScan = ReporterManager_js_1.ReporterManager.uncompressReport(compressedScan);
            if (startScan === 0)
                startScan = storedScan.engineReport.summary.startScan;
            const counts = storedScan.engineReport.summary.counts;
            violations += counts.violation;
            needsReviews += counts.potentialviolation + counts.manual;
            recommendations += counts.recommendation + counts.potentialrecommendation;
            archived += counts.ignored;
        }
        totalIssues = violations + needsReviews + recommendations + archived;
        const columns = [
            { width: 15.1 },
            { width: 15.9 },
            { width: 16.23 },
            { width: 19.4 },
            { width: 15 },
        ];
        const rowData = [
            { key1: 'Tool:', key2: 'IBM Equal Access Accessibility Checker' },
            { key1: 'Version:', key2: config.toolID },
            { key1: 'Rule set:', key2: config.ruleArchiveLabel },
            { key1: 'Guidelines:', key2: config.policies.join(", ") },
            { key1: 'Report date:', key2: new Date(startScan).toLocaleString() },
            { key1: 'Scans:', key2: "" + compressedScans.length },
        ];
        const data = [];
        // Row 1: Title spanning 5 cols
        data.push([
            { value: "Accessibility Scan Report", backgroundColor: "#403151", textColor: "#FFFFFF", fontFamily: "Calibri", fontSize: 16, alignVertical: "center", align: "left", height: 27, columnSpan: 5 },
            null, null, null, null
        ]);
        // Rows 2–7: metadata key/value pairs
        for (const row of rowData) {
            data.push([
                dataCell(row.key1, { align: "left", height: 12 }),
                { value: row.key2, fontFamily: "Calibri", fontSize: 12, textColor: "#000000", align: "left", columnSpan: 4 },
                null, null, null
            ]);
        }
        // Row 8: blank spacer
        data.push([null]);
        // Row 9: blank spacer
        data.push([null]);
        // Row 10: blank spacer
        data.push([null]);
        // Row 11: "Summary" title spanning 5 cols
        data.push([
            { value: "Summary", backgroundColor: "#403151", textColor: "#FFFFFF", fontFamily: "Calibri", fontSize: 16, alignVertical: "center", align: "left", height: 27, columnSpan: 5 },
            null, null, null, null
        ]);
        // Row 12: column headers
        data.push([
            borderedCell("Total issues", { align: "center", alignVertical: "center", backgroundColor: "#000000", textColor: "#FFFFFF", height: 16 }),
            borderedCell("Violations", { align: "center", alignVertical: "center", backgroundColor: "#E4AAAF", textColor: "#000000" }),
            borderedCell("Needs review", { align: "center", alignVertical: "center", backgroundColor: "#F4E08A", textColor: "#000000" }),
            borderedCell("Recommendations", { align: "center", alignVertical: "center", backgroundColor: "#96A9D7", textColor: "#000000" }),
            borderedCell("Archived", { align: "center", alignVertical: "center", backgroundColor: "#FFFFFF", textColor: "#000000" }),
        ]);
        // Row 13: values
        data.push([
            borderedCell(totalIssues, { align: "center", alignVertical: "center", height: 27 }),
            borderedCell(violations, { align: "center", alignVertical: "center" }),
            borderedCell(needsReviews, { align: "center", alignVertical: "center" }),
            borderedCell(recommendations, { align: "center", alignVertical: "center" }),
            borderedCell(archived, { align: "center", alignVertical: "center" }),
        ]);
        return { data, sheet: "Overview", columns };
    }
    static createScanSummarySheet(config, compressedScans) {
        const columns = [
            { width: 27.0 },
            { width: 46.0 },
            { width: 20.17 },
            { width: 18.5 },
            { width: 17.17 },
            { width: 17.17 },
            { width: 17.17 },
            { width: 17.17 },
            { width: 17.17 },
        ];
        const headerStyle = { backgroundColor: "#403151", textColor: "#FFFFFF", fontFamily: "Calibri", fontSize: 12, borderColor: "#A6A6A6", borderStyle: "thin", alignVertical: "center", height: 39 };
        const countHeaderStyle = Object.assign(Object.assign({}, headerStyle), { align: "center", wrap: true });
        const data = [];
        // Row 1: header row
        data.push([
            Object.assign(Object.assign({ value: "Page title" }, headerStyle), { align: "left" }),
            Object.assign(Object.assign({ value: "Page url" }, headerStyle), { align: "left" }),
            Object.assign(Object.assign({ value: "Scan label" }, headerStyle), { align: "left" }),
            Object.assign(Object.assign({ value: "Violations" }, countHeaderStyle), { backgroundColor: "#E4AAAF", textColor: "#000000" }),
            Object.assign(Object.assign({ value: "Needs review" }, countHeaderStyle), { backgroundColor: "#F4E08A", textColor: "#000000" }),
            Object.assign(Object.assign({ value: "Recommendations" }, countHeaderStyle), { backgroundColor: "#96A9D7", textColor: "#000000" }),
            Object.assign(Object.assign({ value: "Archived" }, countHeaderStyle), { backgroundColor: "#FFFFFF", textColor: "#000000" }),
            Object.assign({ value: "% elements without violations" }, countHeaderStyle),
            Object.assign({ value: "% elements without violations or items to review" }, countHeaderStyle),
        ]);
        for (const compressedScan of compressedScans) {
            let storedScan = ReporterManager_js_1.ReporterManager.uncompressReport(compressedScan);
            let counts = storedScan.engineReport.summary.counts;
            const textStyle = { fontFamily: "Calibri", fontSize: 12, textColor: "#000000", alignVertical: "center", height: 37, wrap: true };
            const numStyle = Object.assign(Object.assign({}, textStyle), { align: "center", borderColor: "#A6A6A6", borderStyle: "thin" });
            data.push([
                Object.assign(Object.assign({ value: storedScan.pageTitle }, textStyle), { align: "left" }),
                Object.assign(Object.assign({ value: storedScan.engineReport.summary.URL }, textStyle), { align: "left" }),
                Object.assign(Object.assign({ value: storedScan.label }, textStyle), { align: "left" }),
                Object.assign({ value: counts.violation }, numStyle),
                Object.assign({ value: counts.potentialviolation + counts.manual }, numStyle),
                Object.assign({ value: counts.recommendation + counts.potentialrecommendation }, numStyle),
                Object.assign({ value: counts.ignored }, numStyle),
                Object.assign({ value: counts.elements > 0 ? parseFloat((100 * (counts.elements - counts.elementsViolation) / counts.elements).toFixed(0)) : 0 }, numStyle),
                Object.assign({ value: counts.elements > 0 ? parseFloat((100 * (counts.elements - counts.elementsViolationReview) / counts.elements).toFixed(0)) : 0 }, numStyle),
            ]);
        }
        return { data, sheet: "Scan summary", columns };
    }
    static buildIssueSummaryLevelRows(fillColor, textColor, title, levelCount, levelrowValues) {
        const rows = [];
        // Level type title row (e.g. "Violations")
        rows.push([
            { value: `     ${title}`, backgroundColor: fillColor, textColor, fontFamily: "Calibri", fontSize: 12, borderColor: "#A6A6A6", borderStyle: "thin", alignVertical: "center", align: "left", height: 18 },
            { value: levelCount, backgroundColor: fillColor, textColor, fontFamily: "Calibri", fontSize: 12, borderColor: "#A6A6A6", borderStyle: "thin", alignVertical: "center", align: "right" },
        ]);
        // Individual issue message rows, sorted descending by count
        const rowArray = [];
        for (const property in levelrowValues) {
            rowArray.push(["     " + property, parseInt(`${levelrowValues[property]}`)]);
        }
        rowArray.sort((a, b) => b[1] - a[1]);
        for (const [msg, count] of rowArray) {
            rows.push([
                { value: msg, fontFamily: "Calibri", fontSize: 12, textColor: "#000000", borderColor: "#A6A6A6", borderStyle: "thin", alignVertical: "center", align: "left", height: 14 },
                { value: count, fontFamily: "Calibri", fontSize: 12, textColor: "#000000", borderColor: "#A6A6A6", borderStyle: "thin", alignVertical: "center", align: "right" },
            ]);
        }
        return rows;
    }
    static buildIssueSummaryTKLevelRows(title, levelCounts, levelVrowValues, levelNRrowValues, levelRrowValues, levelArowValues) {
        const rows = [];
        // Level title row (e.g. "Level 1 - the most essential...")
        rows.push([
            { value: title, backgroundColor: "#403151", textColor: "#FFFFFF", fontFamily: "Calibri", fontSize: 16, alignVertical: "center", align: "left", height: 27 },
            { value: levelCounts[0], backgroundColor: "#403151", textColor: "#FFFFFF", fontFamily: "Calibri", fontSize: 16, alignVertical: "center", align: "right" },
        ]);
        rows.push(...ACReporterXLSX.buildIssueSummaryLevelRows("#E4AAAF", "#000000", "Violation", levelCounts[1], levelVrowValues));
        rows.push(...ACReporterXLSX.buildIssueSummaryLevelRows("#F4E08A", "#000000", "Needs review", levelCounts[2], levelNRrowValues));
        rows.push(...ACReporterXLSX.buildIssueSummaryLevelRows("#96A9D7", "#000000", "Recommendation", levelCounts[3], levelRrowValues));
        if (levelCounts[4] > 0) {
            rows.push(...ACReporterXLSX.buildIssueSummaryLevelRows("#CCCCCC", "#000000", "Archived", levelCounts[4], levelArowValues));
        }
        return rows;
    }
    static createIssueSummarySheet(config, policyInfo, compressedScans) {
        let violations = 0;
        let needsReviews = 0;
        let recommendations = 0;
        let archive = 0;
        let totalIssues = 0;
        for (let i = 0; i < compressedScans.length; i++) {
            let storedScan = ReporterManager_js_1.ReporterManager.uncompressReport(compressedScans[i]);
            let counts = storedScan.engineReport.summary.counts;
            violations += counts.violation;
            needsReviews += counts.potentialviolation + counts.manual;
            recommendations += counts.recommendation + counts.potentialrecommendation;
            archive += counts.ignored;
        }
        totalIssues = violations + needsReviews + recommendations;
        let level1Counts = [0, 0, 0, 0, 0];
        let level2Counts = [0, 0, 0, 0, 0];
        let level3Counts = [0, 0, 0, 0, 0];
        let level4Counts = [0, 0, 0, 0, 0];
        let level1V = [];
        let level2V = [];
        let level3V = [];
        let level4V = [];
        let level1NR = [];
        let level2NR = [];
        let level3NR = [];
        let level4NR = [];
        let level1R = [];
        let level2R = [];
        let level3R = [];
        let level4R = [];
        let level1A = [];
        let level2A = [];
        let level3A = [];
        let level4A = [];
        for (const compressedScan of compressedScans) {
            let scan = ReporterManager_js_1.ReporterManager.uncompressReport(compressedScan);
            for (const issue of scan.engineReport.results) {
                if (!(issue.ruleId in policyInfo)) {
                    policyInfo[issue.ruleId] = { tkLevels: [], cps: [] };
                }
                let levelCounts, levelV, levelNR, levelR, levelA;
                const issuePolicyInfo = policyInfo[issue.ruleId];
                if (issuePolicyInfo.tkLevels.includes(IGuideline_js_1.eToolkitLevel.LEVEL_ONE)) {
                    levelCounts = level1Counts;
                    levelV = level1V;
                    levelNR = level1NR;
                    levelR = level1R;
                    levelA = level1A;
                }
                else if (issuePolicyInfo.tkLevels.includes(IGuideline_js_1.eToolkitLevel.LEVEL_TWO)) {
                    levelCounts = level2Counts;
                    levelV = level2V;
                    levelNR = level2NR;
                    levelR = level2R;
                    levelA = level2A;
                }
                else if (issuePolicyInfo.tkLevels.includes(IGuideline_js_1.eToolkitLevel.LEVEL_THREE)) {
                    levelCounts = level3Counts;
                    levelV = level3V;
                    levelNR = level3NR;
                    levelR = level3R;
                    levelA = level3A;
                }
                else if (issuePolicyInfo.tkLevels.includes(IGuideline_js_1.eToolkitLevel.LEVEL_FOUR)) {
                    levelCounts = level4Counts;
                    levelV = level4V;
                    levelNR = level4NR;
                    levelR = level4R;
                    levelA = level4A;
                }
                if (issue.value[1] !== IRule_js_1.eRuleConfidence.PASS) {
                    ++levelCounts[0];
                }
                if (issue.ignored) {
                    ++levelCounts[4];
                    levelA.push(issue.message.substring(0, 32767));
                }
                else if (issue.level === IConfig_js_1.eRuleLevel.violation) {
                    ++levelCounts[1];
                    levelV.push(issue.message.substring(0, 32767));
                }
                else if (issue.level === IConfig_js_1.eRuleLevel.potentialviolation || issue.level === IConfig_js_1.eRuleLevel.manual) {
                    ++levelCounts[2];
                    levelNR.push(issue.message.substring(0, 32767));
                }
                else if (issue.level === IConfig_js_1.eRuleLevel.recommendation || issue.level === IConfig_js_1.eRuleLevel.potentialrecommendation) {
                    ++levelCounts[3];
                    levelR.push(issue.message.substring(0, 32767));
                }
            }
        }
        // @ts-ignore
        let level1VrowValues = ACReporterXLSX.countDuplicatesInArray(level1V);
        // @ts-ignore
        let level1NRrowValues = ACReporterXLSX.countDuplicatesInArray(level1NR);
        // @ts-ignore
        let level1RrowValues = ACReporterXLSX.countDuplicatesInArray(level1R);
        // @ts-ignore
        let level1ArowValues = ACReporterXLSX.countDuplicatesInArray(level1A);
        // @ts-ignore
        let level2VrowValues = ACReporterXLSX.countDuplicatesInArray(level2V);
        // @ts-ignore
        let level2NRrowValues = ACReporterXLSX.countDuplicatesInArray(level2NR);
        // @ts-ignore
        let level2RrowValues = ACReporterXLSX.countDuplicatesInArray(level2R);
        // @ts-ignore
        let level2ArowValues = ACReporterXLSX.countDuplicatesInArray(level2A);
        // @ts-ignore
        let level3VrowValues = ACReporterXLSX.countDuplicatesInArray(level3V);
        // @ts-ignore
        let level3NRrowValues = ACReporterXLSX.countDuplicatesInArray(level3NR);
        // @ts-ignore
        let level3RrowValues = ACReporterXLSX.countDuplicatesInArray(level3R);
        // @ts-ignore
        let level3ArowValues = ACReporterXLSX.countDuplicatesInArray(level3A);
        // @ts-ignore
        let level4VrowValues = ACReporterXLSX.countDuplicatesInArray(level4V);
        // @ts-ignore
        let level4NRrowValues = ACReporterXLSX.countDuplicatesInArray(level4NR);
        // @ts-ignore
        let level4RrowValues = ACReporterXLSX.countDuplicatesInArray(level4R);
        // @ts-ignore
        let level4ArowValues = ACReporterXLSX.countDuplicatesInArray(level4A);
        const columns = [
            { width: 155.51 },
            { width: 21.16 },
        ];
        const data = [];
        // Row 1: "Issue summary" title spanning 2 cols
        data.push([
            { value: "Issue summary", backgroundColor: "#403151", textColor: "#FFFFFF", fontFamily: "Calibri", fontSize: 16, alignVertical: "center", align: "left", height: 27, columnSpan: 2 },
            null
        ]);
        // Row 2: description spanning 2 cols
        data.push([
            { value: "     In the IBM Equal Access Toolkit, issues are divided into three levels (1-3). Tackle the levels in order to address some of the most impactful issues first.", fontFamily: "Calibri", fontSize: 12, textColor: "#000000", alignVertical: "center", align: "left", height: 20, columnSpan: 2 },
            null
        ]);
        // Row 3: "Total issues found:" with value
        data.push([
            { value: "Total issues found:", backgroundColor: "#000000", textColor: "#FFFFFF", fontFamily: "Calibri", fontSize: 16, alignVertical: "center", align: "left", height: 27 },
            { value: totalIssues, backgroundColor: "#000000", textColor: "#FFFFFF", fontFamily: "Calibri", fontSize: 16, alignVertical: "center", align: "right" },
        ]);
        // Row 4: "Number of issues" label
        data.push([
            { value: null, borderColor: "#A6A6A6", borderStyle: "thin", height: 20 },
            { value: "Number of issues", fontFamily: "Calibri", fontSize: 12, textColor: "#000000", borderColor: "#A6A6A6", borderStyle: "thin", alignVertical: "center", align: "right" },
        ]);
        data.push(...ACReporterXLSX.buildIssueSummaryTKLevelRows("Level 1 - the most essential issues to address", level1Counts, level1VrowValues, level1NRrowValues, level1RrowValues, level1ArowValues));
        data.push(...ACReporterXLSX.buildIssueSummaryTKLevelRows("Level 2 - the next most important issues", level2Counts, level2VrowValues, level2NRrowValues, level2RrowValues, level2ArowValues));
        data.push(...ACReporterXLSX.buildIssueSummaryTKLevelRows("Level 3 - necessary to meet requirements", level3Counts, level3VrowValues, level3NRrowValues, level3RrowValues, level3ArowValues));
        data.push(...ACReporterXLSX.buildIssueSummaryTKLevelRows("Level 4 - further recommended improvements to accessibility", level4Counts, level4VrowValues, level4NRrowValues, level4RrowValues, level4ArowValues));
        return { data, sheet: "Issue summary", columns };
    }
    static createIssuesSheet(config, policyInfo, compressedScans) {
        const valueMap = {
            "VIOLATION": {
                "POTENTIAL": "Needs review",
                "FAIL": "Violation",
                "PASS": "Pass",
                "MANUAL": "Needs review"
            },
            "RECOMMENDATION": {
                "POTENTIAL": "Recommendation",
                "FAIL": "Recommendation",
                "PASS": "Pass",
                "MANUAL": "Recommendation"
            },
            "INFORMATION": {
                "POTENTIAL": "Needs review",
                "FAIL": "Violation",
                "PASS": "Pass",
                "MANUAL": "Recommendation"
            }
        };
        const columns = [
            { width: 18.0 },
            { width: 20.5 },
            { width: 21.0 },
            { width: 18.5 },
            { width: 17.0 },
            { width: 17.17 },
            { width: 17.17 },
            { width: 17.17 },
            { width: 17.17 },
            { width: 17.17 },
            { width: 14.00 },
            { width: 17.17 },
            { width: 43.00 },
            { width: 17.17 },
        ];
        // Header and data row colors are intentionally omitted — the Excel table
        // (TableStyleMedium2 + showRowStripes) applied by injectTableIntoFile() provides all coloring.
        const hStyle = { fontFamily: "Calibri", fontSize: 12, align: "center", alignVertical: "center", wrap: true, height: 24 };
        const data = [];
        // Header row
        data.push([
            Object.assign({ value: "Page title" }, hStyle),
            Object.assign({ value: "Page URL" }, hStyle),
            Object.assign({ value: "Scan label" }, hStyle),
            Object.assign({ value: "Issue ID" }, hStyle),
            Object.assign({ value: "Issue type" }, hStyle),
            Object.assign({ value: "Toolkit level" }, hStyle),
            Object.assign({ value: "Checkpoint" }, hStyle),
            Object.assign({ value: "WCAG level" }, hStyle),
            Object.assign({ value: "Rule" }, hStyle),
            Object.assign({ value: "Issue" }, hStyle),
            Object.assign({ value: "Element" }, hStyle),
            Object.assign({ value: "Code" }, hStyle),
            Object.assign({ value: "Xpath" }, hStyle),
            Object.assign({ value: "Help" }, hStyle),
        ]);
        for (const compressedScan of compressedScans) {
            let storedScan = ReporterManager_js_1.ReporterManager.uncompressReport(compressedScan);
            for (const item of storedScan.engineReport.results) {
                if (!(item.ruleId in policyInfo)) {
                    policyInfo[item.ruleId] = { tkLevels: [], cps: [] };
                }
                let polInfo = policyInfo[item.ruleId];
                let cps = polInfo.cps.filter(cp => {
                    let ruleInfo = cp.rules.find(ruleInfo => ruleInfo.id === item.ruleId && (!ruleInfo.reasonCodes || ruleInfo.reasonCodes.includes("" + item.reasonId)));
                    return !!ruleInfo;
                });
                let wcagLevels = dropDupes(cps.map(cp => cp.wcagLevel));
                wcagLevels.sort();
                let cpStrs = dropDupes(cps.map(cp => `${cp.num} ${cp.name}`));
                cpStrs.sort();
                const dStyle = { fontFamily: "Calibri", fontSize: 12, height: 14 };
                data.push([
                    Object.assign(Object.assign({ value: storedScan.pageTitle }, dStyle), { align: "left", alignVertical: "center" }),
                    Object.assign(Object.assign({ value: storedScan.engineReport.summary.URL }, dStyle), { align: "left", alignVertical: "center" }),
                    Object.assign(Object.assign({ value: storedScan.label }, dStyle), { align: "center", alignVertical: "center" }),
                    Object.assign(Object.assign({ value: ACReporterXLSX.stringHash(item.ruleId + item.path.dom) }, dStyle), { align: "left", alignVertical: "center" }),
                    Object.assign(Object.assign({ value: `${valueMap[item.value[0]][item.value[1]]}${item.ignored ? ` (Archived)` : ``}` }, dStyle), { align: "center", alignVertical: "center" }),
                    Object.assign(Object.assign({ value: polInfo.tkLevels.join(", ") }, dStyle), { align: "center", alignVertical: "center" }),
                    Object.assign(Object.assign({ value: cpStrs.join("; ") }, dStyle), { align: "left", alignVertical: "center" }),
                    Object.assign(Object.assign({ value: wcagLevels.join(", ") }, dStyle), { align: "center", alignVertical: "center" }),
                    Object.assign(Object.assign({ value: item.ruleId }, dStyle), { align: "left", alignVertical: "center" }),
                    Object.assign(Object.assign({ value: item.message.substring(0, 32767) }, dStyle), { align: "left", alignVertical: "center" }),
                    Object.assign(Object.assign({ value: ACReporterXLSX.get_element(item.snippet) }, dStyle), { align: "center", alignVertical: "center" }),
                    Object.assign(Object.assign({ value: item.snippet.substring(0, 32767) }, dStyle), { align: "left", alignVertical: "center" }),
                    Object.assign(Object.assign({ value: item.path.dom }, dStyle), { align: "left", alignVertical: "center" }),
                    Object.assign(Object.assign({ value: item.help }, dStyle), { align: "left", alignVertical: "center" }),
                ]);
            }
        }
        return { data, sheet: "Issues", columns, stickyRowsCount: 1, _issueRowCount: data.length };
    }
    static createDefinitionsSheet() {
        const columns = [
            { width: 41.51 },
            { width: 119.51 },
        ];
        const titleStyle = { backgroundColor: "#403151", textColor: "#FFFFFF", fontFamily: "Calibri", fontSize: 20, alignVertical: "center", align: "left" };
        const sectionStyle = { backgroundColor: "#403151", textColor: "#FFFFFF", fontFamily: "Calibri", fontSize: 16, alignVertical: "center", align: "left" };
        const subHeaderStyle = { backgroundColor: "#CCC0DA", textColor: "#000000", fontFamily: "Calibri", fontSize: 16, borderColor: "#A6A6A6", borderStyle: "thin", alignVertical: "center", align: "left" };
        const dataStyle = { fontFamily: "Calibri", fontSize: 12, textColor: "#000000", align: "left", height: 12 };
        const summaryRowData = [
            { key1: 'Page', key2: 'Identifies the page or html file that was scanned.' },
            { key1: 'Scan label', key2: 'Label for the scan. Default values can be edited in the Accessibility Checker before saving this report, or programmatically assigned in automated testing.' },
            { key1: 'Violations', key2: 'Accessibility failures that need to be corrected.' },
            { key1: 'Needs review', key2: 'Issues that may not be a violation. These need a manual review to identify whether there is an accessibility problem.' },
            { key1: 'Recommendations', key2: 'Opportunities to apply best practices to further improve accessibility.' },
            { key1: '% elements without violations', key2: 'Percentage of elements on the page that had no violations found.' },
            { key1: '% elements without violations or items to review', key2: 'Percentage of elements on the page that had no violations found and no items to review.' },
            { key1: 'Level 1,2,3', key2: 'Priority level defined by the IBM Equal Access Toolkit. See https://www.ibm.com/able/toolkit/plan/overview#pace-of-completion for details.' }
        ];
        const issuesRowData = [
            { key1: 'Page', key2: 'Identifies the page or html file that was scanned.' },
            { key1: 'Scan label', key2: 'Label for the scan. Default values can be edited in the Accessibility Checker before saving this report, or programmatically assigned in automated testing.' },
            { key1: 'Issue ID', key2: 'Identifier for this issue within this page. Rescanning the same page will produce the same issue ID. ' },
            { key1: 'Issue type', key2: 'Violation, needs review, or recommendation' },
            { key1: 'Toolkit level', key2: '1, 2 or 3. Priority level defined by the IBM Equal Access Toolkit. See https://www.ibm.com/able/toolkit/plan/overview#pace-of-completion for details' },
            { key1: 'Checkpoint', key2: 'Web Content Accessibility Guidelines (WCAG) checkpoints this issue falls into.' },
            { key1: 'WCAG level', key2: 'A, AA or AAA. WCAG level for this issue.' },
            { key1: 'Rule', key2: 'Name of the accessibility test rule that detected this issue.' },
            { key1: 'Issue', key2: 'Message describing the issue.' },
            { key1: 'Element', key2: 'Type of HTML element where the issue is found.' },
            { key1: 'Code', key2: 'Actual HTML element where the issue is found.' },
            { key1: 'Xpath', key2: 'Xpath of the HTML element where the issue is found.' },
            { key1: 'Help', key2: 'Link to a more detailed description of the issue and suggested solutions.' },
        ];
        const data = [];
        // Row 1: "Definition of fields" title spanning 2 cols
        data.push([
            Object.assign(Object.assign({ value: "Definition of fields" }, titleStyle), { height: 36, columnSpan: 2 }),
            null
        ]);
        // Row 2: blank
        data.push([{ value: null, height: 12, columnSpan: 2 }, null]);
        // Row 3: "Scan summary and Issue summary" section header
        data.push([
            Object.assign(Object.assign({ value: "Scan summary and Issue summary" }, sectionStyle), { height: 20, columnSpan: 2 }),
            null
        ]);
        // Row 4: "Field / Definition" subheader
        data.push([
            Object.assign(Object.assign({ value: "Field" }, subHeaderStyle), { height: 16 }),
            Object.assign({ value: "Definition" }, subHeaderStyle),
        ]);
        // Rows 5–12: scan summary definitions
        for (const row of summaryRowData) {
            data.push([
                Object.assign({ value: row.key1 }, dataStyle),
                Object.assign({ value: row.key2 }, dataStyle),
            ]);
        }
        // Row 13: blank (separator between sections) — kept simple
        data.push([{ value: null, height: 12, columnSpan: 2 }, null]);
        // Row 14: "Issues" section header
        data.push([
            Object.assign(Object.assign({ value: "Issues" }, sectionStyle), { height: 20, columnSpan: 2 }),
            null
        ]);
        // Row 15: "Field / Definition" subheader
        data.push([
            Object.assign(Object.assign({ value: "Field" }, subHeaderStyle), { height: 16 }),
            Object.assign({ value: "Definition" }, subHeaderStyle),
        ]);
        // Rows 16–28: issues definitions
        for (const row of issuesRowData) {
            data.push([
                Object.assign({ value: row.key1 }, dataStyle),
                Object.assign({ value: row.key2 }, dataStyle),
            ]);
        }
        return { data, sheet: "Definition of fields", columns };
    }
    static countDuplicatesInArray(array) {
        let count = {};
        array.forEach(item => {
            if (count[item]) {
                //@ts-ignore
                count[item] += 1;
                return;
            }
            //@ts-ignore
            count[item] = 1;
        });
        return count;
    }
    static get_element(code) {
        if (code) {
            const ind_s = code.indexOf(' ');
            const ind_br = code.indexOf('>');
            return (ind_s > 0 && ind_s < ind_br) ? code.substring(1, ind_s) : code.substring(1, ind_br);
        }
        return '';
    }
    static format_date(timestamp) {
        var date = new Date(timestamp);
        return date.getFullYear() + '-' + ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
            ("00" + date.getDate()).slice(-2) + "-" +
            ("00" + date.getHours()).slice(-2) + "-" +
            ("00" + date.getMinutes()).slice(-2) + "-" +
            ("00" + date.getSeconds()).slice(-2);
    }
    // From https://github.com/darkskyapp/string-hash/blob/master/index.js
    static stringHash(str) {
        var hash = 5381, i = str.length;
        while (i) {
            hash = (hash * 33) ^ str.charCodeAt(--i);
        }
        return hash >>> 0;
    }
}
exports.ACReporterXLSX = ACReporterXLSX;
//# sourceMappingURL=ACReporterXLSX.js.map