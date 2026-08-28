import {Given, Then} from '@cucumber/cucumber';
import readExcelFile from 'read-excel-file/node';
import { join } from 'path';
import { PupUtil } from '../util/pup';
import { strict as assert } from "assert";

Given("excel file {string}", async function(filename: string) {
    const filePath = join(PupUtil.getTempDownloadFolder(), filename);
    const sheets = await readExcelFile(filePath);
    this.excelFile = sheets;
});

Then ("Excel Sheet {string} Cell {string} is {string}", async function(sheetStr: string, cellStr: string, txt: string) {
    // read-excel-file returns sheets as an array; we need to find by sheet name
    // re-read to get named sheets
    const filePath = join(PupUtil.getTempDownloadFolder(), this.excelFileName);
    const allSheets = await readExcelFile(filePath);
    // Find the sheet with matching name — readExcelFile returns array of { sheet, data }
    const sheetObj = allSheets.find((s: any) => s.sheet === sheetStr);
    if (!sheetObj) {
        assert.fail(`Sheet "${sheetStr}" does not exist`);
    }
    // Parse cell reference like "A1", "B3", etc.
    const col = cellStr.charCodeAt(0) - 65; // 'A' = 0
    const row = parseInt(cellStr.slice(1)) - 1;
    const cellValue = sheetObj.data[row]?.[col];
    const cellText = cellValue != null ? String(cellValue) : "";
    assert.strictEqual(cellText, txt);
});
