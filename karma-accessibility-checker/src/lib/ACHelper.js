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

/*******************************************************************************
 * NAME: ACHelper.js
 * DESCRIPTION: Used by karma-ibma to load all the core a11y scanning functions
 *              into the browser that karma launches, this includes:
 *              Performing the scan
 *              Parsing results to make them user friendly
 *              Comparing with baselines or failing on failon levels
 *******************************************************************************/

// Map window.__karma__.config.ACConfig to aChecker.Config for easy access
let aChecker = {
    "Config": window.__karma__.config.ACConfig
};
!(function () {
    // Specify if debug information should be printed or not
    aChecker.DEBUG = aChecker.Config.DEBUG;
    /**
     * This function is responsible performing a scan based on the context that is provided, following are
     * the supported context type:
     *    Single node (HTMLElement)
     *    Local file path (String)
     *    URL (String)
     *    document node
     *    data stream for html content (String)
     *
     *  Future Items
     *    Multiple node (Array of HTMLElements) ---> FUTURE
     *
     * @param {(String|HTMLElement|DocumentNode)} content - Provide the context to scan, which includes the items from above.
     * @param {String} label - Provide a label for the scan that is being performed
     * @param {Function} callback - Provide callback function which will be executed once the results are extracted.
     *
     * @return N/A - This function will not return any thing, as it is full asyn so scan will be performed and the call back
     *               function which was provided will be called which will perform the verification or anything that is needed.
     *
     * PUBLIC API
     *
     * @memberOf this
     */
    aChecker.getCompliance = function (content, label, callback, errCallback) {
        if (callback) {
            aChecker.getComplianceHelper(content, label)
                .then(function (result) {
                    callback(result.report, result.webdriver);
                })
                .catch((err) => {
                    console.error(err);
                    errCallback && errCallback(err);
                })
        } else {
            return aChecker.getComplianceHelper(content, label);
        }
    }

    aChecker.getComplianceHelper = async function (content, label) {

        aChecker.DEBUG && console.log("START 'aChecker.getComplianceHelper' function");

        // Variable Decleration
        let URL;

        // In the case that the label is null or undefined, throw an error using the karma API
        // window.__karma__.error with the message of the error.
        if (label === null || typeof label === "undefined" || label === undefined) {

            // Variable Decleration
            let testcaseWhichIsMissingRequiredLabel = null;
            let generalErrorMessageLabelNotProvided = "\n[Error] labelNotProvided: Label must be provided when calling aChecker.getCompliance.";

            // Get the caller of the aChecker.getCompliance function which will be the testcase that is calling this function
            // This way we can make it the error more descriptive and would help the user identify where the issues is.
            // We have to build and throw an Error() object and then using the try/catch to catch this error and then extract the
            // stack and parse it to get the 2nd element in the stack which will be the caller of this function which will be the
            // testcase which called this function.
            try {
                // Throw Error() object
                throw new Error();
            } catch (exception) {
                // Extract the stack trace from the error object and parse it to get the single one caller up which will be the 2nd index
                testcaseWhichIsMissingRequiredLabel = exception.stack.split("\n")[1];

                // Call the Karma error API, to send message to the Karma server that there was an error on the client side
                window.__karma__.error("Label was not provided at: " + testcaseWhichIsMissingRequiredLabel + generalErrorMessageLabelNotProvided);
            }
        }

        // Check to make sure that the label that is provided is unique with all the other ones
        // that we have gone through.
        let labelUnique = aChecker.isLabelUnique(label);

        // In the case that the label is not unique
        if (!labelUnique) {
            // Variable Decleration dependencies/tools-rules-html/v2/a11y/test/g471/Table-DataNoSummaryARIA.html
            let testcaseDoesNotUseUniqueLabel = null;
            let generalErrorMessageLabelNotUnique = "\n[Error] labelNotUnique: Label provided to aChecker.getCompliance should be unique across all testcases in a single karma-accessibility-checker session.";

            // Get the caller of the aChecker.getCompliance function which will be the testcase that is calling this function
            // This way we can make it the error more descriptive and would help the user identify where the issues is.
            // We have to build and throw an Error() object and then using the try/catch to catch this error and then extract the
            // stack and parse it to get the 2nd element in the stack which will be the caller of this function which will be the
            // testcase which called this function.
            try {
                // Throw Error() object
                throw new Error();
            } catch (exception) {
                // Extract the stack trace from the error object and parse it to get the single one caller up which will be the 2nd index
                testcaseDoesNotUseUniqueLabel = exception.stack.split("\n")[1];

                // Call the Karma error API, to send message to the Karma server that there was an error on the client side
                window.__karma__.error("Label \"" + label + "\" provided at: " + testcaseDoesNotUseUniqueLabel + " is not unique." + generalErrorMessageLabelNotUnique);
            }
        }

        // Get the Data when the scan is started
        // Start time will be in milliseconds elapsed since 1 January 1970 00:00:00 UTC up until now.
        let policies = aChecker.Config.policies;
        let curPol = null;
        if (policies) {
            curPol = JSON.parse(JSON.stringify(policies));
        }

        let result = null;
        try {
            // Handle local file and URL's
            if (typeof content === "string") {

                // Since this is a string, we consider this as either URL or local file
                // so build an iframe based on this and get the frame doc and then scan this.
                let contentObject = await aChecker.buildIframeAndGetDoc(content);

                // Only perform the scan if there was no exception creating the iframe
                if (typeof contentObject.details === "undefined") {
                    // Extract the URL from the content object from the buildIframeAndGetDoc function
                    let URL = contentObject.URLorLocalFileName;

                    // Extract the iframe window from the content object
                    let iframeWindow = contentObject.frameWindow;

                    try {
                        // Extract the document from the content object
                        let iframeDoc = iframeWindow.document;

                        // Perform the accessibility scan on the document or HTMLElement provided
                        result = await aChecker.runScan(iframeDoc, policies, URL, iframeDoc.title, label, iframeWindow);
                    } catch (e) {
                        // There was an error creating the iframe or extracting the iframe doc
                        // Send the error object back to the callback.
                        return Promise.reject({
                            result: 'EXCEPTION',
                            details: e
                        });
                    }
                } else {

                    // There was an error creating the iframe or extracting the iframe doc
                    // Send the error object back to the callback.
                    return Promise.reject(contentObject);
                }
            }
            // Handle Array of nodes
            else if (content instanceof Array) {
                // TODO: Supporting Array of nodes, possible future enhancenment
            }
            // Handle single node (HTMLElement)
            else if (content.nodeType === 1) {
                // In the case this is a node, there is nothing special that needs to be done at this time,
                // the engine will be able to handle this. Adding this block here as we may need to add some filtering
                // of rules or rule sets for this case depending on if a special ruleset needs to be created or not.
                content = content;

                // Perform the accessibility scan on the document or HTMLElement provided
                result = await aChecker.runScan(content, policies, URL, content.ownerDocument.title, label, null);
            }
            // handle scanning document
            else if (content.nodeType === 9) {
                // In the case this is a document element, simply send the document object to the engine for now
                // we will need to do some filtering to remove any karma related aspects, which requires to do a
                // document clone, and then string the karma scripts that are added and then send this document
                // to the engine.
                // TODO: Investigate best approach to perform filtering
                content = content;

                // Perform the accessibility scan on the document or HTMLElement provided
                result = await aChecker.runScan(content, policies, URL, content.title, label, null);
            }
        } catch (err) {
            window.__karma__.error(err.details);
            return null;
        }

        aChecker.DEBUG && console.log("END 'aChecker.getCompliance' function");
        return result;
    };

    aChecker.getRulesets = () => new ace.Checker().rulesets;
    aChecker.getRulesSync = () => {
        let checker = new ace.Checker();
        let retVal = [];
        for (const ruleId in checker.engine.ruleMap) {
            retVal.push(checker.engine.ruleMap[ruleId]);
        }
        return retVal;
    }
    /**
     * This function is responsible for running the scan by calling the IBMa.validate function with the
     * provided content.
     *
     * @param {(String|HTMLElement|DocumentNode)} content - Provide the context to scan, which includes the items from above.
     * @param {Array} policies - List of polices on which the accessibility scan should be run on.
     * @param {String} URL - The page URL in the case that it is a URL or local file scan.
     * @param {String} label - Provide a label for the scan that is being performed.
     * @param {Function} callback - Provide callback function which will be executed once the results are extracted.
     * @param {Object} iframeWindow - Iframe window object which was created if it is exists otherwise just null
     *
     * @return N/A - Calls the provided callback function with the scan results
     *
     * PRIVATE METHOD
     *
     * @memberOf this
     */
    aChecker.runScan = async function (content, policies, url, pageTitle, label, iframeWindow) {
        try {
            const valueToLevel = (reportValue) => {
                let reportLevel;
                if (reportValue[1] === "PASS") {
                    reportLevel = "pass";
                }
                else if ((reportValue[0] === "VIOLATION" || reportValue[0] === "RECOMMENDATION") && reportValue[1] === "MANUAL") {
                    reportLevel = "manual";
                }
                else if (reportValue[0] === "VIOLATION") {
                    if (reportValue[1] === "FAIL") {
                        reportLevel = "violation";
                    }
                    else if (reportValue[1] === "POTENTIAL") {
                        reportLevel = "potentialviolation";
                    }
                }
                else if (reportValue[0] === "RECOMMENDATION") {
                    if (reportValue[1] === "FAIL") {
                        reportLevel = "recommendation";
                    }
                    else if (reportValue[1] === "POTENTIAL") {
                        reportLevel = "potentialrecommendation";
                    }
                }
                return reportLevel;
            }

            const getCounts = (engineReport) => {
                let counts = {
                    violation: 0,
                    potentialviolation: 0,
                    recommendation: 0,
                    potentialrecommendation: 0,
                    manual: 0,
                    pass: 0,
                    ignored: 0,
                    elements: 0,
                    elementsViolation: 0,
                    elementsViolationReview: 0
                }
                let elementSet = new Set();
                let elementViolationSet = new Set();
                let elementViolationReviewSet = new Set();
                for (const issue of engineReport.results) {
                    elementSet.add(issue.path.dom);
                    if (issue.ignored) {
                        ++counts.ignored;
                    } else {
                        ++counts[issue.level];
                        if (issue.level === "violation") {
                            elementViolationSet.add(issue.path.dom);
                            elementViolationReviewSet.add(issue.path.dom);
                        } else if (issue.level === "potentialviolation" || issue.level === "manual") {
                            elementViolationReviewSet.add(issue.path.dom);
                        }
                    }
                }
                counts.elements = elementSet.size;
                counts.elementsViolation = elementViolationSet.size;
                counts.elementsViolationReview = elementViolationReviewSet.size
                return counts;
            }

            // Get the Data when the scan is started
            // Start time will be in milliseconds elapsed since 1 January 1970 00:00:00 UTC up until now.
            const startScan = Date.now();

            if (policies) {
                curPol = JSON.parse(JSON.stringify(policies));
            }
            let checker = new ace.Checker();
            let engineReport = await checker.check(content, policies);
            for (const result of engineReport.results) {
                delete result.node;
                result.level = valueToLevel(result.value)
            }
            let reportLevels = (aChecker.Config.reportLevels || []).concat(aChecker.Config.failLevels || []).map(lvl => lvl.toString());
            report.summary ||= {};
            report.summary.counts ||= getCounts(report);
            // Filter out pass results unless they asked for them in reports
            // We don't want to mess with baseline functions, but pass results can break the response object
            report.results = report.results.filter(result => reportLevels.includes(result.level) || result.level !== "pass");            

            ReporterManager.config = BaselineManager.config = aChecker.Config;

            if (engineReport && engineReport.results) {
                for (const issue of engineReport.results) {
                    issue.help = ReporterManager.getHelpUrl(issue);
                }
            }

            // If there is something to report...
            if (engineReport.results) {
                window.__karma__.info({
                    startScan,
                    url,
                    pageTitle,
                    label,
                    engineReport,
                    rulesets: checker.rulesets
                });
            }

            let filteredReport = ReporterManager.filterReport(engineReport, label);
            let { report } = ReporterManager.generateReport(aChecker.Config, null, {
                startScan,
                url,
                pageTitle,
                label,
                engineReport: filteredReport
            })

            // Call the user provided callback function after the filtering, building report and summary count tasks
            // call the user callback function with results and content object (this object can be document of Iframe which was created etc...)
            // The content will not be exposed to the user, unless they really need it. We use this to simplfy checking for violations.
            return {
                "report": report,
                "iframe": iframeWindow
            };
        } catch (err) {
            console.error(err);
            return Promise.reject(err);
        }
    };

    /**
     * This function is responsible for checking if the provided label is unique or not.
     *
     * @param {String} label - Provide the label which should be checked if it exists or not
     *
     * @return {boolean} labelExists - return false if the label is not unique, otherwise return true
     *
     * PRIVATE METHOD
     *
     * @memberOf this
     */
    aChecker.isLabelUnique = function (label) {
        return ReporterManager.isLabelUnique(label);
    };

    /**
     * This function is responsible for building an iframe object with the provided URL or local file.
     *
     * @param {String} URLorLocalFile - Provide a URL or local file to scan.
     * @param {Function} scanCallback - Provide the callback function which is to perform the scan after the
     *                                  iframe has been created and loaded with the content.
     *
     * @return - N/A - Calls the scanCallback function
     *
     * PRIVATE METHOD
     *
     * @memberOf this
     */
    aChecker.buildIframeAndGetDoc = async function (URLorLocalFileorContent) {
        return new Promise((resolve, reject) => {
            // Variable Decleration
            let isURLRegex = /^(ftp|http|https):\/\//;
            let isLocalFileRegex = new RegExp("\.(" + aChecker.Config.extensions.join("|") + ")$");
            let appendIframe = false;
            let URLorLocalFileName;

            // Get iframe and then remove it from the page
            let iframe = window.document.getElementById("localFileorURLIframe");

            // Remove the iframe if it exists
            if (iframe) {
                iframe.parentElement.removeChild(iframe);
            }

            // Create an iframe element in the body of the current document
            iframe = window.document.createElement('iframe');
            iframe.id = "localFileorURLIframe";

            // Set the width and height of the iframe to match with the current window size
            iframe.height = window.innerHeight + "px";
            iframe.width = window.innerWidth + "px";

            // In the case that we detect this is an URL or local file, simply set this as the iframe.src and
            // perform a scan on that iframe content.
            if (isURLRegex.test(URLorLocalFileorContent) || isLocalFileRegex.test(URLorLocalFileorContent)) {
                // Add an on load event to the iframe that is created which will perform the scan once
                // the content is loaded into the iframe.
                iframe.onload = function () {

                    // Variable Decleration
                    let iframeWindow = null;
                    let content = {};

                    try {
                        // Get the iframe document node
                        iframeWindow = this.contentWindow;
                        if (iframeWindow.document.body.getAttribute("class") === "neterror") {
                            reject({
                                result: "EXCEPTION",
                                details: "Network error: "+URLorLocalFileorContent
                            })
                        } else {
                            // Build object for what we are going to scan, return the document
                            resolve({
                                frameWindow: iframeWindow,
                                URLorLocalFileName: URLorLocalFileName
                            });
                        }

                    } catch (e) {
                        // Build content as an exception as we were not able to get the iframe document
                        // Posible access issues.
                        reject({
                            result: 'EXCEPTION',
                            details: e
                        });
                    }
                };

                // Detect if the provided string is URL or local file, in the case it is URL
                // simply set this as the source, otherwise use the file protocal.
                if (isURLRegex.test(URLorLocalFileorContent)) {
                    iframe.src = URLorLocalFileorContent;
                } else {
                    iframe.src = "file:///" + URLorLocalFileorContent;
                }

                // Extract this name and set it as the filename/URL
                URLorLocalFileName = iframe.src;
            }
            // In the case this is a string of all the html content, write this content to the iframe document.
            // This is mainly to allow support for rapid testing of local files, using preprocessor method and
            // dynamic testcase generation based on the files that were processed with html2js.
            else {

                // Append the iframe to the body current document that is active (this will be the karma page),
                // to write all content, to iframe need to append it to document.
                window.document.body.appendChild(iframe);

                // Mark iframw as already appended
                appendIframe = true;

                // Add an on load event to the iframe that is created which will perform the scan once
                // the content is loaded into the iframe.
                iframe.onload = function () {
                    // Get the iframe window
                    let iframeWindow = document.getElementById("localFileorURLIframe").contentWindow;

                    // Build object for what we are going to scan, return the document
                    let content = {
                        URLorLocalFileName: URLorLocalFileName,
                        frameWindow: iframeWindow
                    };

                    // Pass the content object to the scanCallback
                    resolve(content);
                };

                // Start to write the contents of the html file into the iframe document
                // This will include the entire html page, including the doc type and all.
                iframe.contentWindow.document.open();
                iframe.contentWindow.document.write(URLorLocalFileorContent);
                iframe.contentWindow.document.close();
            }

            // Append the iframe to body if not done already
            if (!appendIframe) {
                // Append the iframe to the body current document that is active (this will be the karma page)
                window.document.body.appendChild(iframe);
            }
        });
    };

    /**
     * This function is responsible for comparing the scan results with baseline or checking that there are
     * no violations which fall into the failsLevels levels. In the case a baseline is found then baseline will
     * be used to perform the check, in the case no baseline is provided then we comply with only failing if
     * there is a sinble violation which falls into failLevels.
     *
     * @param {Object} actual - the actual results object provided by the user, this object should follow the
     *                          same format as outlined in the return of aChecker.buildReport function.
     *
     * @return {int} - return 0 in the case actual matches baseline or no violations fall into failsLevels,
     *                 return 1 in the case actual results does not match baseline results,
     *                 return 2 in the case that there is a failure based on failLevels (this means no baseline found).
     *                 return -1 in the case that there is an exception that occured in the results object which came from the scan engine.
     *
     * PUBLIC API
     *
     * @memberOf this
     */
    aChecker.assertCompliance = function (actualResults) {
        return BaselineManager.assertCompliance(actualResults);
    };

    /**
     * This function is responsible for checking if any of the issues reported have any level that falls
     * into the failsLevel array.
     *
     * @param {Object} results - Provide the scan results, object which would be in the
     *                           the same format as outlined in the return of aChecker.buildReport function.
     *
     * @return {int} - return 1 in the case a single issue was found which is in the failsLevel array.
     *                 return -1 in the case that there is an exception that occured in the results object which came from the scan engine.
     *
     * PRIVATE METHOD
     *
     * @memberOf this
     */
    aChecker.compareBasedOnFailLevels = function (report) {
        return BaselineManager.compareBasedOnFailLevels(report);
    };

    /**
     * This function is responsible for comparing actual with expected and returning all the differences as an array.
     *
     * @param {Object} actual - Provide the actual object to be used for compare
     * @param {Object} expected - Provide the expected object to be used for compare
     * @param {boolean} clean - Provide a boolean if both the actual and expected objects need to be cleaned
     *                          cleaning refers to converting the objects to match with a basic compliance
     *                          compare of xpath and ruleId.
     *
     * @return {Object} differences - return an array of diff objects that were found, following is the format of the object:
     * [
     *     {
     *         "kind": "E",
     *         "path": [
     *             "reports",
     *             0,
     *             "issues",
     *             10,
     *             "xpath"
     *         ],
     *         "lhs": "/html[1]/body[1]/div[2]/table[5]",
     *         "rhs": "/html[1]/body[1]/div[2]/table[5]d",
     *     },
     *     {
     *         "kind": "E",
     *         "path": [
     *             "label"
     *         ],
     *         "lhs": "Table-layoutMultiple",
     *         "rhs": "dependencies/tools-rules-html/v2/a11y/test/g471/Table-layoutMultiple.html",
     *     }
     * ]
     *
     * PUBLIC API
     *
     * @memberOf this
     */
    aChecker.diffResultsWithExpected = function (actual, expected, clean) {
        return BaselineManager.diffResultsWithExpected(actual, expected, clean);
    };

    /**
     * This function is responsible for cleaning up the compliance baseline or actual results, based on
     * a pre-defined set of criterias, such as the following:
     *      1. No need to compare summary object
     *      2. Only need to compare the ruleId and xpath in for each of the issues
     *
     * @param {Object} objectToClean - Provide either an baseline or actual results object which would be in the
     *                                 the same format as outlined in the return of aChecker.buildReport function.
     *
     * @return {Object} objectToClean - return an object that was cleaned to only contain the information that is
     *                                  needed for compare. Following is a sample of how the cleaned object will look like:
     * {
     *     "label": "unitTestContent",
     *     "reports": [
     *         {
     *             "frameIdx": "0",
     *             "frameTitle": "Frame 0",
     *             "issues": [
     *                 {
     *                     "ruleId": "1",
     *                     "xpath": "/html[1]/head[1]/style[1]"
     *                 }
     *                 ....
     *             ]
     *         },
     *         {
     *             "frameIdx": "1",
     *             "frameTitle": "Frame 1",
     *             "issues": [
     *                 {
     *                     "ruleId": "471",
     *                     "xpath": "/html[1]/body[1]/div[2]/table[3]"
     *                 }
     *                 ....
     *             ]
     *         }
     *     ]
     * }
     *
     * PRIVATE METHOD
     *
     * @memberOf this
     */
    aChecker.cleanComplianceObjectBeforeCompare = function (objectToClean) {
        return BaselineManager.cleanComplianceObjectBeforeCompare(objectToClean);
    };

    aChecker.refactor;

    /**
     * This function is responsible for getting the baseline object for a label that was provided.
     *
     * @param {String} label - Provide a lable for which to get the baseline for.
     *
     * @return {Object} - return the baseline object from global space based on label provided, the object will be
     *                    in the same format as outlined in the return of aChecker.buildReport function.
     *
     * PUBLIC API
     *
     * @memberOf this
     */
    aChecker.getBaseline = function (label) {
        return BaselineManager.getBaseline(label);
    };

    /**
     * This function is responsible for getting the diff results based on label for a scan that was already performed.
     *
     * @param {String} label - Provide a lable for which to get the diff results for.
     *
     * @return {Object} - return the diff results object from global space based on label provided, the object will be
     *                    in the same format as outlined in the return of aChecker.diffResultsWithExpected function.
     *
     * PUBLIC API
     *
     * @memberOf this
     */
    aChecker.getDiffResults = function (label) {
        return BaselineManager.getDiffResults(label);
    };

    /**
     * This function is responsible for printing the scan results to console.
     *
     * @param {Object} results - Provide the results from the scan.
     *
     * @return {String} resultsString - String representation of the results/violations.
     *
     * PUBLIC API
     *
     * @memberOf this
     */
    aChecker.stringifyResults = function (report) {
        return ReporterManager.stringifyResults(report);
    };

    aChecker.ruleIdToLegacyId = {
        "list_structure_proper": "3",
        "marquee_elem_avoid": "5",
        "heading_markup_misuse": "7",
        "imagebutton_alt_exists": "10",
        "img_ismap_misuse": "11",
        "object_text_exists": "20",
        "applet_alt_exists": "21",
        "media_audio_transcribed": "24",
        "blockquote_cite_exists": "25",
        "meta_refresh_delay": "33",
        "frame_title_exists": "39",
        "input_label_exists": "41",
        "media_alt_brief": "99",
        "a_target_warning": "112",
        "area_alt_exists": "240",
        "RPT_Media_ImgColorUsage": "245",
        "meta_redirect_optional": "254",
        "element_attribute_deprecated": "256",
        "text_quoted_correctly": "263",
        "element_mouseevent_keyboard": "269",
        "page_title_exists": "273",
        "text_block_heading": "322",
        "form_submit_button_exists": "324",
        "element_id_unique": "377",
        "form_font_color": "394",
        "form_label_unique": "398",
        "img_alt_misuse": "453",
        "img_longdesc_misuse": "454",
        "img_alt_valid": "455",
        "style_background_decorative": "456",
        "asciiart_alt_exists": "458",
        "media_track_available": "511",
        "media_alt_exists": "460",
        "style_color_misuse": "466",
        "select_options_grouped": "467",
        "list_markup_review": "468",
        "script_onclick_misuse": "470",
        "table_structure_misuse": "471",
        "WCAG20_Img_AltTriggerNonDecorative": "473",
        "blink_elem_deprecated": "478",
        "blink_css_review": "479",
        "html_skipnav_exists": "481",
        "page_title_valid": "484",
        "heading_content_exists": "488",
        "html_lang_exists": "490",
        "form_interaction_review": "491",
        "a_text_purpose": "495",
        "fieldset_legend_valid": "497",
        "media_live_captioned": "501",
        "text_sensory_misuse": "502",
        "media_autostart_controllable": "503",
        "style_focus_visible": "506",
        "img_alt_redundant": "1000",
        "RPT_Style_ExternalStyleSheet": "1073",
        // "RPT_Header_Trigger": "1002",
        "script_onclick_avoid": "1007",
        "table_summary_redundant": "1011",
        "input_label_before": "1017",
        "input_label_after": "1018",
        "embed_noembed_exists": "1020",
        "table_scope_valid": "1025",
        "img_alt_null": "1027",
        "input_fields_grouped": "1028",
        "input_checkboxes_grouped": "1029",
        "script_select_review": "1035",
        "input_onchange_review": "1050",
        "embed_alt_exists": "1051",
        "noembed_content_exists": "1052",
        "table_caption_empty": "1053",
        "table_caption_nested": "1054",
        "label_content_exists": "1055",
        "dir_attribute_valid": "1056",
        "frame_src_valid": "1057",
        "table_headers_related": "1059",
        "table_layout_linearized": "1060",
        "table_headers_exists": "1061",
        "label_ref_valid": "1062",
        "element_accesskey_unique": "1063",
        "script_focus_blur_review": "1064",
        "imagemap_alt_exists": "1067",
        "emoticons_alt_exists": "1068",
        "style_before_after_review": "1069",
        "text_whitespace_valid": "1070",
        "aria_role_allowed": "1074",
        "aria_attribute_value_valid": "1076",
        "aria_id_unique": "1077",
        "aria_attribute_required": "1079",
        "aria_attribute_exists": "1082",
        "aria_attribute_allowed": "1083",
        "aria_activedescendant_tabindex_valid": "1084",
        "aria_child_tabbable": "1086",
        "aria_keyboard_handler_exists": "1087",
        "img_alt_decorative": "1090",
        "aria_search_label_unique": "1097",
        "aria_application_label_unique": "1099",
        "aria_application_labelled": "1100",
        "aria_document_label_unique": "1101",
        "WCAG20_Label_TargetInvisible": "1112",
        "caption_track_exists": "1117",
        "media_keyboard_controllable": "1119",
        "HAAC_Input_HasRequired": "1124",
        "aria_img_labelled": "1128",
        "img_alt_background": "1132",
        "element_accesskey_labelled": "1140",
        "aria_attribute_conflict": "1141",
        "canvas_content_described": "1143",
        "figure_label_exists": "1144",
        "input_placeholder_label_visible": "1145",
        "form_submit_review": "1147",
        "text_contrast_sufficient": "1148",
        "text_contrast_sufficient_PV": "1149",
        "skip_main_exists": "1150",
        "skip_main_described": "1151",
        "aria_child_valid": "1152",
        "aria_parent_required": "1153",
        "aria_eventhandler_role_valid": "1154",
        "aria_widget_labelled": "1156",
        "aria_content_in_landmark": "1157",
        "aria_region_labelled": "1158",
        "aria_main_label_visible": "1159",
        "aria_banner_label_unique": "1160",
        "aria_complementary_label_unique": "1161",
        "aria_contentinfo_label_unique": "1162",
        "aria_form_label_unique": "1163",
        "aria_navigation_label_unique": "1164",
        "aria_complementary_label_visible": "1165",
        "aria_article_label_unique": "1166",
        "Rpt_Aria_ArticleRoleLabel_Implicit": "1167",
        "Rpt_Aria_MultipleGroupRoles_Implicit": "1168",
        "Rpt_Aria_GroupRoleLabel_Implicit": "1169",
        "aria_contentinfo_single": "1170",
        "aria_banner_single": "1172",
        "aria_contentinfo_misuse": "1173",
        "aria_complementary_labelled": "1174",
        "aria_region_label_unique": "1176",
        "widget_tabbable_exists": "1177",
        "widget_tabbable_single": "1178",
        "style_highcontrast_visible": "1180",
        "aria_main_label_unique": "1182",
        "download_keyboard_controllable": "1183",
        "error_message_exists": "1184",
        "list_children_valid": "1185",
        "aria_activedescendant_valid": "1186",
        "application_content_accessible": "1187",
        "aria_toolbar_label_unique": "1188",
        "HAAC_Combobox_ARIA_11_Guideline": "1193",
        "HAAC_Combobox_Must_Have_Text_Input": "1194",
        "HAAC_Combobox_DOM_Focus": "1195",
        "HAAC_Combobox_Autocomplete": "1196",
        "HAAC_Combobox_Autocomplete_Invalid": "1197",
        "HAAC_Combobox_Expanded": "1198",
        "HAAC_Combobox_Popup": "1199",
        "style_viewport_resizable": "1200",
        "label_name_visible": "1202",
        "input_autocomplete_valid": "1203",
        "input_label_visible": "1204"
    }

})();