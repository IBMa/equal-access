/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Node-side XLSX reporter test.
 *
 * Runs in a Node (forks) pool so it can use fs/adm-zip directly.
 * Exercises ACReporterXLSX.generateSummary() end-to-end and verifies
 * the structure of the produced XLSX file.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import AdmZip from 'adm-zip'
import { ACReporterXLSX } from '../../src/lib/common/report/ACReporterXLSX.js'

// ---------------------------------------------------------------------------
// XLSX parser — identical helper to the one in the mocha test
// ---------------------------------------------------------------------------
function readXlsxSheets(filePath) {
    const zip = new AdmZip(filePath)
    // write-excel-file emits r:id before name, so extract each attribute independently.
    const wbXml = zip.getEntry('xl/workbook.xml').getData().toString('utf8')
    const relsXml = zip.getEntry('xl/_rels/workbook.xml.rels').getData().toString('utf8')

    const sheetNames = []
    const sheetRe = /<sheet ([^/]*\/?>)/g
    let m
    while ((m = sheetRe.exec(wbXml)) !== null) {
        const nameM = /name="([^"]+)"/.exec(m[1])
        const ridM = /r:id="([^"]+)"/.exec(m[1])
        if (nameM && ridM) sheetNames.push({ name: nameM[1], rId: ridM[1] })
    }

    const relMap = {}
    const relRe = /<Relationship[^>]+Id="([^"]+)"[^>]+Target="([^"]+)"/g
    while ((m = relRe.exec(relsXml)) !== null) relMap[m[1]] = m[2]

    const ssEntry = zip.getEntry('xl/sharedStrings.xml')
    const sharedStrings = []
    if (ssEntry) {
        const ssXml = ssEntry.getData().toString('utf8')
        const siRe = /<si>([\s\S]*?)<\/si>/g
        while ((m = siRe.exec(ssXml)) !== null) {
            let text = ''
            const tRe = /<t[^>]*>([^<]*)<\/t>/g
            let tm
            while ((tm = tRe.exec(m[1])) !== null) text += tm[1]
            sharedStrings.push(text)
        }
    }

    const result = {}
    for (const { name, rId } of sheetNames) {
        const target = relMap[rId]
        const sheetEntry = zip.getEntry(`xl/${target}`)
        if (!sheetEntry) continue
        // Use a sparse array indexed by actual Excel row number (1-based → 0-based).
        // The regex handles both self-closing (<c ... />) and content (<c ...>...</c>) forms.
        const sheetXml = sheetEntry.getData().toString('utf8')
        const rows = []
        const cellRe = /<c r="([A-Z]+)(\d+)"([^/]*?)(?:\/>|>([\s\S]*?)<\/c>)/g
        let cm
        while ((cm = cellRe.exec(sheetXml)) !== null) {
            let col = 0
            for (const ch of cm[1]) col = col * 26 + (ch.charCodeAt(0) - 64)
            col -= 1
            const rowNum = parseInt(cm[2]) - 1 // 0-based
            if (!rows[rowNum]) rows[rowNum] = []
            const inner = cm[4] ?? '' // undefined for self-closing tags
            const vMatch = /<v>([^<]*)<\/v>/.exec(inner)
            if (vMatch) {
                rows[rowNum][col] = /t="s"/.test(cm[3]) ? (sharedStrings[parseInt(vMatch[1])] ?? '') : vMatch[1]
            }
        }
        result[name] = rows
    }
    return result
}

function cell(sheets, sheetName, ref) {
    const col = ref.charCodeAt(0) - 65
    const row = parseInt(ref.slice(1)) - 1
    return sheets[sheetName]?.[row]?.[col] ?? ''
}

// ---------------------------------------------------------------------------
// Minimal stub data — compressed array format expected by uncompressReport()
// Indices: [startScan, url, pageTitle, label, scanProfile, numExecuted,
//           scanTime, ruleArchive, policies, reportLevels, issues[], counts]
// ---------------------------------------------------------------------------
function makeCompressedReport() {
    return [
        Date.now(),                    // 0 startScan
        'http://localhost/test.html',  // 1 url
        'XLSX vitest test page',       // 2 pageTitle
        'vitest-xlsx-test',            // 3 label
        '',                            // 4 scanProfile
        0,                             // 5 numExecuted
        0,                             // 6 scanTime
        'Latest',                      // 7 ruleArchive
        ['IBM_Accessibility'],          // 8 policies
        ['violation', 'potentialviolation', 'recommendation', 'potentialrecommendation', 'manual'], // 9 reportLevels
        [],                            // 10 issues (compressed results)
        { violation: 0, potentialviolation: 0, manual: 0, recommendation: 0, potentialrecommendation: 0, ignored: 0 }, // 11 counts
    ]
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('XLSX report generation (vitest/Node)', () => {
    let outputFolder
    let xlsxPath
    let sheets

    beforeAll(async () => {
        outputFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'vitest-xlsx-'))

        const config = {
            toolID: '4.0.0-test',
            ruleArchiveLabel: 'Latest Deployment',
            policies: ['IBM_Accessibility'],
            outputFolder,
            outputFilenameTimestamp: false,
        }

        const reporter = new ACReporterXLSX()
        const summaryData = [makeCompressedReport()]
        const rulesets = []

        const { summary } = await reporter.generateSummary(config, rulesets, Date.now(), summaryData)
        xlsxPath = path.join(outputFolder, 'results.xlsx')
        await summary(xlsxPath)

        expect(fs.existsSync(xlsxPath), `XLSX file not created at ${xlsxPath}`).toBe(true)
        sheets = readXlsxSheets(xlsxPath)
    })

    afterAll(() => {
        fs.rmSync(outputFolder, { recursive: true, force: true })
    })

    it('contains all expected sheet names', () => {
        expect(Object.keys(sheets)).toEqual(
            expect.arrayContaining(['Overview', 'Scan summary', 'Issue summary', 'Issues', 'Definition of fields'])
        )
    })

    it('Overview A1 is "Accessibility Scan Report"', () => {
        expect(cell(sheets, 'Overview', 'A1')).toBe('Accessibility Scan Report')
    })

    it('Overview A11 is "Summary"', () => {
        expect(cell(sheets, 'Overview', 'A11')).toBe('Summary')
    })

    it('Overview summary column headers are correct', () => {
        expect(cell(sheets, 'Overview', 'A12')).toBe('Total issues')
        expect(cell(sheets, 'Overview', 'B12')).toBe('Violations')
        expect(cell(sheets, 'Overview', 'C12')).toBe('Needs review')
        expect(cell(sheets, 'Overview', 'D12')).toBe('Recommendations')
        expect(cell(sheets, 'Overview', 'E12')).toBe('Archived')
    })

    it('Scan summary A1 is "Page title"', () => {
        expect(cell(sheets, 'Scan summary', 'A1')).toBe('Page title')
    })

    it('Issue summary A1 is "Issue summary"', () => {
        expect(cell(sheets, 'Issue summary', 'A1')).toBe('Issue summary')
    })

    it('Issues sheet header row is correct', () => {
        expect(cell(sheets, 'Issues', 'A1')).toBe('Page title')
        expect(cell(sheets, 'Issues', 'B1')).toBe('Page URL')
        expect(cell(sheets, 'Issues', 'C1')).toBe('Scan label')
        expect(cell(sheets, 'Issues', 'N1')).toBe('Help')
    })

    it('Definition of fields A1 is "Definition of fields"', () => {
        expect(cell(sheets, 'Definition of fields', 'A1')).toBe('Definition of fields')
    })
})
