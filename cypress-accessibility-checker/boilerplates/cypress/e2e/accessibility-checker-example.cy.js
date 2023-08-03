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
import "cypress-accessibility-checker";

context('Accessibility checker example', () => {
    it('Scan website that contains failures', () => {
        // Replace URL with application URL
        cy.visit('http://localhost:8080/sample-html/example-html-file.html')
            .getCompliance('example-nobaseline') // Label should be unique per call to the function
            .assertCompliance()
            .then(result => {
                // This is 2 because there are errors and no baseline
                expect(result).to.equal(2)
            })

        cy.visit('http://localhost:8080/sample-html/example-html-file.html')
            .getCompliance('example-baseline') // Label should be unique per call to the function
            .assertCompliance()
            .then(result => {
                // This is 0 because a matching baseline exists to ignore the reported issues
                expect(result).to.equal(0)
            })
    });
});
