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

context('Accessibility checker tests', () => {
  it('getA11yCompliance() returns a report of the sent HTML', () => {
    const html = `
      <html>
        <head>
          <title>Test</title>
        </head>
        <body>
          <h1>Hello world</h1>
        </body>
      </html>
    `;
    cy.visit('no-violations.html')
      .getA11yCompliance(html, 'getCompliance fake html')
      .then((result) => {
        expect(result.report.results).to.have.length.greaterThan(0);
      });
  });

  it('getA11yComplianceOfDocument() returns a report of the document', () => {
    cy.visit('no-violations.html')
      .getA11yComplianceOfDocument('getComplianceOfDocument no violations')
      .then((result) => {
        console.warn(result);
        expect(result.report.results).to.have.lengthOf(0);
      });

    cy.visit('violations.html')
      .getA11yComplianceOfDocument('getComplianceOfDocument with violations')
      .then((result) => {
        console.warn(result);
        expect(result.report.results).to.have.length.greaterThan(0);
      });
  });

  context('assertA11yCompliance()', () => {
    it('Is successful when there are no violations', () => {
      cy.visit('no-violations.html')
        .getA11yComplianceOfDocument('assert compliance rc 0 no baseline')
        .assertA11yCompliance()
        .then((rc) => expect(rc).to.equal(0));
    });

    it('Is successful when the baselines match', () => {
      cy.visit('violations.html')
        .getA11yComplianceOfDocument('violations')
        .assertA11yCompliance(false)
        .then((rc) => expect(rc).to.equal(0));
    });

    it('Fails when the baselines dont match', () => {
      // Compare no-violations to a violations baseline
      cy.visit('no-violations.html')
        .getA11yComplianceOfDocument('violations')
        .assertA11yCompliance(false)
        .then((rc) => expect(rc).to.equal(1));
    });

    it('Fails when there are violations due to fail levels', () => {
      cy.visit('violations.html')
        .getA11yComplianceOfDocument('assert compliance rc 2')
        .assertA11yCompliance(false) // Don't actually run the assertion in the command so we can check the output
        .then((rc) => expect(rc).to.equal(2));
    });
  });

  it('getA11yBaseline() should return data from baseline scan', () => {
    cy.visit('violations.html').getA11yComplianceOfDocument('getBaseline test');

    cy.getA11yBaseline('violations').then(
      (result) => expect(result).not.to.be.null
    );
    cy.getA11yBaseline('no-violations').then(
      (result) => expect(result).not.to.be.null
    );
  });

  it('getA11yDiffResults() should return diff between scan and baseline', () => {
    // Compare violations to a no-violations baseline
    cy.visit('violations.html')
      .getA11yComplianceOfDocument('no-violations')
      .assertA11yCompliance(false)
      .then((rc) => expect(rc).to.be.equal(1));

    cy.getA11yDiffResults('no-violations').then((result) => {
      expect(result).not.to.be.null;
      result.forEach((obj) => expect(obj.item).not.to.be.null); // Check object is what we expect
    });
  });

  it('diffA11yResultsWithExpected() should return a diff between actual and expected', () => {
    cy.visit('violations.html')
      .getA11yComplianceOfDocument('diff a11y results with expected 1')
      .then((actual) => {
        cy.getA11yBaseline('violations')
          .then((expected) => {
            return cy.diffA11yResultsWithExpected(
              actual.report,
              expected,
              true
            );
          })
          .then((result) => {
            // Check to see if the object has some expected properties
            expect(result.path).not.to.be.null;
          });
      });
  });

  it('stringifyA11yResults() should return stringified version of report', () => {
    cy.visit('violations.html')
      .getA11yComplianceOfDocument('stringify results 1')
      .stringifyA11yResults()
      .then((stringResult) => expect(stringResult).to.contain('Scan:'));
  });

  it('getA11yConfig() should return config block from config file', () => {
    cy.getA11yConfig().then((config) => expect(config.toolID).not.to.be.null);
  });

  it('closeA11y() should free up resources', () => {
    // Hard to really test this, but make sure it doesn't break when calling it
    cy.closeA11y();
  });
});
