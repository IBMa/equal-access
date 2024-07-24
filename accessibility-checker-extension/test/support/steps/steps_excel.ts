import {Given, Then} from '@cucumber/cucumber';
import { Workbook } from 'exceljs';
import { join } from 'path';
import { PupUtil } from '../util/pup';
import { strict as assert } from "assert";

Given("excel file {string}", async function(filename: string) {
    const workbook = new Workbook();
    await workbook.xlsx.readFile(join(PupUtil.getTempDownloadFolder(), filename));
    this.excelFile = workbook;
});

Then ("Excel Sheet {string} Cell {string} is {string}", async function(sheetStr: string, cellStr: string, txt: string) {
    let workbook: Workbook = this.excelFile;
    let sheet = workbook.getWorksheet(sheetStr);
    if (!sheet) {
        assert.fail("Sheet does not exist");
    } else {
        let cell = sheet.getCell(cellStr);
        assert.strictEqual(cell.text, txt);
    }
});