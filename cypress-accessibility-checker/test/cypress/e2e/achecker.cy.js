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

    it('getCompliance() returns a report of the document', () => {
        cy.visit('no-violations.html')
            .getCompliance('getComplianceOfDocument no violations')
            .then((report) => {
                // console.warn(report);
                expect(report.results).to.have.lengthOf(0);
            });

        cy.visit('violations.html')
            .getCompliance('getComplianceOfDocument with violations')
            .then((report) => {
                // console.warn(report);
                expect(report.results).to.have.length.greaterThan(0);
            });
        cy.visit('potentialviolations.html')
            .getCompliance('getComplianceOfDocument with potential violations')
            .then((report) => {
                // console.warn(report);
                expect(report.results).to.have.length.greaterThan(0);
            });
    });
    context('assertCompliance()', () => {
        it('Is successful when there are no violations', () => {
            cy.visit('no-violations.html')
                .getCompliance('assert compliance rc 0 no baseline')
                .assertCompliance()
                .then((rc) => {console.warn("no-violations rc=" + rc);
                    return expect(rc).to.equal(0)
                });
        });

        it('Is successful when the baselines match', () => {
            cy.visit('violations.html')
                .getCompliance('violations')
                .assertCompliance(false)
                .then((rc) => {console.warn("violations rc=" + rc); expect(rc).to.equal(0)});
        });

        it('Fails when the baselines dont match', () => {
            // Compare no-violations to a violations baseline
            cy.visit('violations.html')
                .getCompliance('violations-no-match')
                .assertCompliance(false)
                .then((rc) => { console.warn("violations no match rc=" + rc);
                    expect(rc).to.equal(1);
                })
        });

        it('Fails when there are violations due to fail levels', () => {
            cy.visit('violations.html')
                .getCompliance('assert compliance rc 2')
                .assertCompliance(false) // Don't actually run the assertion in the command so we can check the output
                .then((rc) => {console.warn("violations rc2=" + rc);expect(rc).to.equal(2)});
        });
    });

    it('getBaseline() should return data from baseline scan', () => {
        cy.visit('violations.html').getCompliance('getBaseline test');

        cy.getBaseline('getBaseline test').then(
            (result) => expect(result).not.to.be.null
        );
    });

    it('getDiffResults() should return diff between scan and baseline', () => {
        // Compare violations to a no-violations baseline
        cy.visit('violations.html')
            .getCompliance('violations-no-match-diff')
            .assertCompliance(false)
            .then((rc) => {
                expect(rc).to.equal(1);
            })

        cy.getDiffResults('violations-no-match-diff').then((result) => {
            expect(result).not.to.be.null;
            result.forEach((obj) => expect(obj.kind).not.to.be.null); // Check object is what we expect
            result.forEach((obj) => expect(obj.kind).not.to.be.undefined);
        });
    });

    it('diffResultsWithExpected() should return a diff between actual and expected', () => {
        cy.visit('violations.html')
            .getCompliance('diff accessibility results with expected 1')
            .then((actual) => {
                cy.getBaseline('violations')
                    .then((expected) => {
                        return cy.diffResultsWithExpected(
                            actual,
                            expected,
                            true
                        );
                    })
                    .then((result) => {
                        // Check to see if the object has some expected properties
                        result.forEach((obj) => expect(obj.kind).not.to.be.null); // Check object is what we expect
                        result.forEach((obj) => expect(obj.kind).not.to.be.undefined);
                    });
            });
    });

    it('stringifyResults() should return stringified version of report', () => {
        cy.visit('violations.html')
            .getCompliance('stringify results 1')
            .stringifyResults()
            .then((stringResult) => expect(stringResult).to.contain('Scan:'));
    });

    it('getACheckerConfig() should return config block from config file', () => {
        cy.getACheckerConfig().then((config) => expect(config.toolID).not.to.be.null);
    });
});
