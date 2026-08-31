const { defineConfig } = require('cypress')
const AdmZip = require('adm-zip')
const fs = require('fs')
const path = require('path')

// ---------------------------------------------------------------------------
// Helper — parse XLSX cell value using adm-zip (server-side only)
// ---------------------------------------------------------------------------
function readXlsxCell(filePath, sheetName, cellRef) {
    const zip = new AdmZip(filePath)

    // Map sheetName → file via workbook.xml + workbook.xml.rels
    // write-excel-file emits r:id before name, so extract attrs independently.
    const wbXml = zip.getEntry('xl/workbook.xml').getData().toString('utf8')
    const relsXml = zip.getEntry('xl/_rels/workbook.xml.rels').getData().toString('utf8')

    let rId = null
    const sheetTagRe = /<sheet ([^/]*\/?>)/g
    let sm
    while ((sm = sheetTagRe.exec(wbXml)) !== null) {
        const nameM = /name="([^"]+)"/.exec(sm[1])
        const ridM = /r:id="([^"]+)"/.exec(sm[1])
        if (nameM && nameM[1] === sheetName && ridM) { rId = ridM[1]; break }
    }
    if (!rId) throw new Error(`Sheet "${sheetName}" not found in workbook`)

    const relMatch = new RegExp(`<Relationship[^>]+Id="${rId}"[^>]+Target="([^"]+)"`).exec(relsXml)
    if (!relMatch) throw new Error(`Relationship ${rId} not found`)
    const target = relMatch[1] // e.g. "worksheets/sheet3.xml"

    // Read sharedStrings
    const ssEntry = zip.getEntry('xl/sharedStrings.xml')
    const sharedStrings = []
    if (ssEntry) {
        const ssXml = ssEntry.getData().toString('utf8')
        const siRe = /<si>([\s\S]*?)<\/si>/g
        let m
        while ((m = siRe.exec(ssXml)) !== null) {
            let text = ''
            const tRe = /<t[^>]*>([^<]*)<\/t>/g
            let tm
            while ((tm = tRe.exec(m[1])) !== null) text += tm[1]
            sharedStrings.push(text)
        }
    }

    // Parse cell — handle both <c r="X1" .../> and <c r="X1" ...>...</c> forms
    const col = cellRef.charCodeAt(0) - 65 // A→0
    const row = parseInt(cellRef.slice(1)) - 1 // 0-based
    const sheetXml = zip.getEntry(`xl/${target}`).getData().toString('utf8')

    const cellRe = /<c r="([A-Z]+)(\d+)"([^/]*?)(?:\/>|>([\s\S]*?)<\/c>)/g
    let cm
    while ((cm = cellRe.exec(sheetXml)) !== null) {
        if (parseInt(cm[2]) - 1 !== row) continue
        let c = 0
        for (const ch of cm[1]) c = c * 26 + (ch.charCodeAt(0) - 64)
        if (c - 1 !== col) continue
        const inner = cm[4] ?? ''
        const vMatch = /<v>([^<]*)<\/v>/.exec(inner)
        if (!vMatch) return ''
        if (/t="s"/.test(cm[3])) return sharedStrings[parseInt(vMatch[1])] ?? ''
        return vMatch[1]
    }
    return ''
}

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
        on('task', {
            accessibilityChecker: require('../plugin'),
            readXlsxCell({ filePath, sheetName, cellRef }) {
                return readXlsxCell(filePath, sheetName, cellRef)
            },
            xlsxSheetExists({ filePath, sheetName }) {
                const zip = new AdmZip(filePath)
                const wbXml = zip.getEntry('xl/workbook.xml').getData().toString('utf8')
                // Simple presence check — attribute order doesn't matter here
                return wbXml.includes(`name="${sheetName}"`)
            },
            fileExists(filePath) {
                return fs.existsSync(filePath)
            },
            resolveXlsxPath({ folder, filename }) {
                return path.resolve(process.cwd(), folder, filename)
            },
        })
    },
    baseUrl: 'http://localhost:8080/test/sample-html',
  },
})
