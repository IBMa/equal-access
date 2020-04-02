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

 describe("aChecker.getCompliance", function () {
    var firstUnitTestFile;

    // All the html unit testscases will be stored in the window.__html__ by the preprocessor
    var unitTestcaseHTML = window.__html__;

    // Loop over all the unitTestcase html/htm files to find the first file that we can test
    for (var unitTestFile in unitTestcaseHTML) {
        // Make sure the unit testcase we are trying to scan is actually and html/htm files, if it is not
        // just move on to the next one.
        if (/\.(html?|svg)$/i.test(unitTestFile)) {
            firstUnitTestFile = unitTestFile;
            break;
        }
    }

    beforeEach(function () {
        spyOn(window.IBMa, "validate").and.callFake(function (doc, policies, callback) {
            callback({
                result: 'EXCEPTION',
                details: new Error
            });
        });
    });

    it("Internal error from engine", function (done) {

        // Perform the accessibility scan using the IBMaScan Wrapper
        aChecker.getCompliance(window.__html__[firstUnitTestFile],
            firstUnitTestFile,
            function (data) {

                expect(data.details instanceof Error).toBe(true);

                // Mark the testcases as done.
                done();
            });
    });

    it("Internal error from engine, aChecker.assertCompliance should return -1", function (done) {

        // Perform the accessibility scan using the IBMaScan Wrapper
        aChecker.getCompliance(window.__html__[firstUnitTestFile],
            firstUnitTestFile,
            function (data) {
                expect(aChecker.assertCompliance(data)).toBe(-1);

                // Mark the testcases as done.
                done();
            });
    });

    it("Internal error from engine, aChecker.compareBasedOnFailLevels should return -1", function (done) {

        // Perform the accessibility scan using the IBMaScan Wrapper
        aChecker.getCompliance(window.__html__[firstUnitTestFile],
            firstUnitTestFile,
            function (data) {
                expect(aChecker.compareBasedOnFailLevels(data)).toBe(-1);

                // Mark the testcases as done.
                done();
            });
    });

    afterEach(function () {
        window.IBMa.validate.calls.reset();
        window.IBMa.validate.and.callThrough();
    });
});
