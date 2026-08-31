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

/// <reference types="cypress" />

// Helper: assert a cell in the XLSX via the server-side task.
function assertCell(xlsxPath, sheet, cellRef, expected) {
    cy.task('readXlsxCell', { filePath: xlsxPath, sheetName: sheet, cellRef })
        .should('equal', expected);
}

context('XLSX report generation', () => {
    let xlsxPath;

    before(() => {
        // Run a scan to populate the reporter, then flush via onRunComplete.
        cy.visit('no-violations.html')
            .getCompliance('xlsx-report-test')
            .then(() => {
                cy.task('accessibilityChecker', { task: 'onRunComplete', data: {} });
            });

        // Resolve the XLSX path from the outputFolder declared in .achecker.yml
        cy.task('resolveXlsxPath', { folder: 'results', filename: 'results.xlsx' })
            .then((p) => { xlsxPath = p; });
    });

    it('XLSX file is created', () => {
        cy.task('fileExists', xlsxPath).should('be.true');
    });

    it('contains the expected sheet names', () => {
        for (const sheet of ['Overview', 'Scan summary', 'Issue summary', 'Issues', 'Definition of fields']) {
            cy.task('xlsxSheetExists', { filePath: xlsxPath, sheetName: sheet })
                .should('be.true', `Expected sheet "${sheet}" to exist`);
        }
    });

    it('Overview A1 is "Accessibility Scan Report"', () => {
        assertCell(xlsxPath, 'Overview', 'A1', 'Accessibility Scan Report');
    });

    it('Overview A11 is "Summary"', () => {
        assertCell(xlsxPath, 'Overview', 'A11', 'Summary');
    });

    it('Overview summary column headers are correct', () => {
        assertCell(xlsxPath, 'Overview', 'A12', 'Total issues');
        assertCell(xlsxPath, 'Overview', 'B12', 'Violations');
        assertCell(xlsxPath, 'Overview', 'C12', 'Needs review');
        assertCell(xlsxPath, 'Overview', 'D12', 'Recommendations');
        assertCell(xlsxPath, 'Overview', 'E12', 'Archived');
    });

    it('Scan summary A1 is "Page title"', () => {
        assertCell(xlsxPath, 'Scan summary', 'A1', 'Page title');
    });

    it('Issue summary A1 is "Issue summary"', () => {
        assertCell(xlsxPath, 'Issue summary', 'A1', 'Issue summary');
    });

    it('Issues sheet header columns are correct', () => {
        assertCell(xlsxPath, 'Issues', 'A1', 'Page title');
        assertCell(xlsxPath, 'Issues', 'B1', 'Page URL');
        assertCell(xlsxPath, 'Issues', 'C1', 'Scan label');
        assertCell(xlsxPath, 'Issues', 'N1', 'Help');
    });

    it('Definition of fields A1 is "Definition of fields"', () => {
        assertCell(xlsxPath, 'Definition of fields', 'A1', 'Definition of fields');
    });
});
