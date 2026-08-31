import {Given, Then} from '@cucumber/cucumber';
import readExcelFile from 'read-excel-file/node';
import { join } from 'path';
import { PupUtil } from '../util/pup';
import { strict as assert } from "assert";

Given("excel file {string}", async function(filename: string) {
    const filePath = join(PupUtil.getTempDownloadFolder(), filename);
    // readExcelFile default export returns Sheet[] — each element is { sheet: string, data: Row[] }
    this.excelFile = await readExcelFile(filePath);
});

Then("Excel Sheet {string} Cell {string} is {string}", async function(sheetStr: string, cellStr: string, txt: string) {
    assert.ok(this.excelFile, 'No excel file loaded — use the "excel file" step first');

    const sheetObj = (this.excelFile as any[]).find((s: any) => s.sheet === sheetStr);
    if (!sheetObj) {
        assert.fail(`Sheet "${sheetStr}" does not exist in the workbook`);
    }

    // Parse cell reference like "A1", "B12", etc.
    const col = cellStr.charCodeAt(0) - 65; // 'A' → 0
    const row = parseInt(cellStr.slice(1)) - 1; // 1-based → 0-based
    const cellValue = sheetObj.data[row]?.[col];
    const cellText = cellValue != null ? String(cellValue) : "";
    assert.strictEqual(cellText, txt);
});
