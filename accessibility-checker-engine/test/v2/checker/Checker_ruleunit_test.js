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

'use strict';

let ace = require('../../../src/index');

const mapRuleToG = {
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

let mapGToRule = {}
for (const key in mapRuleToG) {
    mapGToRule[mapRuleToG[key]] = key;
}

// Describe this Suite of testscases, describe is a test Suite and 'it' is a testcase.
describe("Rule Unit Tests", function() {
    // Variable Decleration
    let originalTimeout;

    // All the html unit testscases will be stored in the window.__html__ by the preprocessor
    let unitTestcaseHTML = window.__html__;

    // Loop over all the unitTestcase html/htm files and perform a scan for them
    for (let unitTestFile in unitTestcaseHTML) {

        // Get the extension of the file we are about to scan
        let fileExtension = unitTestFile.substr(unitTestFile.lastIndexOf('.') + 1);

        // Make sure the unit testcase we are trying to scan is actually and html/htm files, if it is not
        // just move on to the next one.
        if (fileExtension !== 'html' && fileExtension !== 'htm' && fileExtension !== 'svg') {
            continue;
        }

        // This function is used to execute for each of the unitTestFiles, we have to use this type of function
        // to allow dynamic creation/execution of the Unit Testcases. This is like forcing an syncronous execution
        // for the testcases. Which is needed to make sure that all the tests run in the same order.
        // For now we do not need to consider threaded execution because over all theses testscases will take at
        // most half 1 sec * # of testcses (500ms * 780)
        (function(unitTestFile) {

            // Description of the test case that will be run.
            describe("Load Test: " + unitTestFile, function() {

                // Function to run before every testcase (it --> is a testcase)
                // This before function allows to add async support to a testcase.
                // The testcase will not run until the done function is called
                beforeEach(function() {
                    // Extract the current jasmine DEFAULT_TIMEOUT_INTERVAL value to restore later on
                    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

                    // Set the DEFAULT_TIMEOUT_INTERVAL to 3min seconds, to allow for the DAP scan to finish.
                    jasmine.DEFAULT_TIMEOUT_INTERVAL = 180000;
                });

                // The Individual testcase for each of the unittestcases.
                // Note the done that is passed in, this is used to wait for asyn functions.
                it('a11y scan should match expected value', async function() {

                    // Extract the unitTestcase data file from the unitTestcase hash map.
                    // This will contain the full content of the testcase file. Includes the document
                    // object also.
                    let unitTestDataFileContent = unitTestcaseHTML[unitTestFile];

                    // Create an iframe element in the body of the current document
                    let iframe = document.createElement('iframe');
                    iframe.id = "unitTestcaseIframe";

                    // Append the iframe to the body
                    document.body.appendChild(iframe);

                    // Start to write the contents of the html file into the iframe document
                    // This will include the entire html page, including the doc type and all.
                    iframe.contentWindow.document.open();
                    iframe.contentWindow.document.write(unitTestDataFileContent);
                    iframe.contentWindow.document.close();

                    // Get the iframe window
                    let iframeWin = document.getElementById("unitTestcaseIframe").contentWindow;

                    // Get the iframe document that was just created
                    let iframeDoc = iframeWin.document;
                    // If we have a script with the UnitTest and it hasn't finished loading (can happen with linked CSS)
                    // Wait until the load is complete
                    let scripts = iframeDoc.querySelectorAll("script");
                    for (const script of scripts) {
                        if (script.innerHTML.includes("UnitTest")) {
                            while (!iframeWin.UnitTest) {
                                await new Promise((resolve, reject) => setTimeout(resolve, 1));
                            }
                        }
                    }

                    let checker = new ace.Checker();
                    let report = await checker.check(iframeDoc, null);
                    expect(report.results).toBeDefined();

                    // Extract the ruleCoverage object from the unit testcases that is loaded on to the iframe.
                    let expectedInfo = iframeWin.UnitTest;
                    let legacyExpectedInfo = iframeWin.OpenAjax &&
                        iframeWin.OpenAjax.a11y &&
                        iframeWin.OpenAjax.a11y.ruleCoverage;
                    if (expectedInfo && expectedInfo.ruleIds) {
                        let filtReport = [];
                        for (const issue of report.results) {
                            delete issue.node;
                            delete issue.ruleTime;
                            delete issue.bounds;
                            delete issue.help;
                            delete issue.source;
                            if (expectedInfo.ruleIds.includes(issue.ruleId)) {
                                // These are too variable between runs - don't test these
                                delete issue.snippet;
                                filtReport.push(issue);
                            }
                        }
                        expect(filtReport).withContext(JSON.stringify(filtReport, null, 2)).toEqual(expectedInfo.results);
                    } else if (legacyExpectedInfo) {
                        let expectedInfo = {}
                        let actualInfo = {}
                        for (const item of legacyExpectedInfo) {
                            if (checker.engine.getRule(mapGToRule[item.ruleId])) {
                                expectedInfo[item.ruleId] = [];
                                actualInfo[item.ruleId] = [];
                                for (let xpath of item.failedXpaths) {
                                    xpath = xpath.replace(/([^\]])\//g, "$1[1]/");
                                    if (!xpath.endsWith("]")) xpath += "[1]";
                                    expectedInfo[item.ruleId].push(xpath);
                                }
                            } else {
                                console.log("WARNING:",item.ruleId,"does not exist in current ruleset");
                            }
                        }
                        for (const issue of report.results) {
                            delete issue.node;
                            delete issue.ruleTime;
                            delete issue.bounds;
                            delete issue.help;
                            delete issue.source;
                            const ruleId = mapRuleToG[issue.ruleId];
                            if (ruleId in expectedInfo && issue.value[1] !== "PASS") {
                                actualInfo[ruleId].push(issue.path.dom);
                            }
                        }
                        for (const ruleId in expectedInfo) {
                            expectedInfo[ruleId].sort();
                            actualInfo[ruleId].sort();
                        }
                        expect(actualInfo).withContext("\nExpected:" + JSON.stringify(expectedInfo, null, 2) + "\nActual:" + JSON.stringify(actualInfo, null, 2)).toEqual(expectedInfo);
                    }

                    // let violationsData = data.report.fail;

                    // // In the case that the violationData is not defined then trigger an error right away.
                    // if (violationsData) {

                    //     // Only try to verify results if there are baseline/expected results to actually verify
                    //     if (expectedInfo) {

                    //         // Decleare the actualMap which will store all the actual xpath results
                    //         let actualMap = {};

                    //         // Loop over all the violation Data and extract the gID and the xpath for the gId and
                    //         // add it to the actual Map.
                    //         violationsData.forEach(function (actual) {

                    //             // Create a new array in the case that one does not exists
                    //             actualMap[actual.ruleId] = actualMap[actual.ruleId] || [];

                    //             // Fix up the xPath as we need to replace [1] with space so that it can actually match correctly.
                    //             let fixComp = actual.component.replace(/\[1\]/g, "");

                    //             // Add the fixed xPath to the actual map for the gId
                    //             actualMap[actual.ruleId].push(fixComp);
                    //         });

                    //         // Loop over all the expected Infor objects and fix up the xPath so that it is ready for compare
                    //         expectedInfo.forEach(function (expected) {
                    //             // Temp array to store all the fixed xpaths
                    //             let temp = [];

                    //             // Fix all the xPaths that are in the failedXpaths array
                    //             expected.failedXpaths.forEach(function (xpath) {
                    //                 temp.push(xpath.replace(/\[1\]/g, ""));
                    //             });

                    //             // Reasign the temp fixed xpath to failedXpath
                    //             expected.failedXpaths = temp;
                    //         });

                    //         // Loop over all the expected xPaths and make sure they are present in the actual results.
                    //         // TODO: Add support for checking passed xPath here also.
                    //         expectedInfo.forEach(function (expected) {

                    //             // In the case the xPath exists in the actualMap then sort them
                    //             if (actualMap[expected.ruleId]) {
                    //                 actualMap[expected.ruleId] = actualMap[expected.ruleId].sort();
                    //             }

                    //             // In the case the failedXpaths exists in the expected object then sort them
                    //             if (expected.failedXpaths) {
                    //                 expected.failedXpaths = expected.failedXpaths.sort();
                    //             }

                    //             // In the case that the expected failed map is empty and we found violations triggered for this rule then mark this as failed.
                    //             if (expected.failedXpaths.length == 0) {
                    //                 expect(typeof (actualMap[expected.ruleId])).toEqual('undefined', "\nShould trigger NO violations, but triggered for rule: " + expected.ruleId + " with " + actualMap[expected.ruleId]);
                    //             }
                    //             // In the case that the expected rule rule to be triggered is not triggered then throw error as this test failed
                    //             else if (!(expected.ruleId in actualMap)) {
                    //                 expect(false).toBe(true, "\nShould trigger violations, but triggered none: " + expected.ruleId + " " + expected.failedXpaths);
                    //             }
                    //             // Verify the results match using toEqual, this will compare whe whole object
                    //             else {
                    //                 expect(expected.failedXpaths).toEqual(actualMap[expected.ruleId]);
                    //             }
                    //         });
                    //    }  else {
                    //    	expect(false).toEqual(true, "\nThere is no baseline defined for: " + unitTestFile);
                    //    }
                    // } else {
                    //     expect(false).toEqual(true, "\nWas unable to scan: " + unitTestFile);
                    // }

                    // Mark the testcases as done.
                    // done();

                    //                        data.report.fail.forEach(function (violation) {
                    //                            // Extract all the information for each individual violation
                    //                            let severity = violation.severity;
                    //                            let severityCode = violation.severityCode;
                    //                            let message = violation.message;
                    //                            let component = violation.component;
                    //                            let componentNode = violation.componentNode;
                    //                            let ruleId = violation.ruleId;
                    //                            let lineNumber = violation.lineNumber;
                    //                            let levelCode = violation.levelCode;
                    //                            let level = violation.level;
                    //                            let help = violation.help;
                    //                            let msgArgs = violation.msgArgs;
                    //                            let filterHidden = violation.filterHidden;
                    //
                    //                            // Build the individual violations report to make it more readable to the user.
                    //                            let individualViolationBuilt = severity + ", " + message + ", " + component + ", " +
                    //                                ruleId + ", " + lineNumber + ", " + level + ", " + help;
                    //
                    //                            // Log the report for now.
                    //                            console.log(individualViolationBuilt);
                    //                        });
                    // });
                });

                // Function to run after every testcase (it --> is a testcase)
                // This function will reset the DEFAULT_TIMEOUT_INTERVAL for a testcase in jasmine
                afterEach(function() {

                    // Get iframe and then remove it from the page
                    let iframe = document.getElementById("unitTestcaseIframe");
                    iframe.parentElement.removeChild(iframe);

                    // Reset the Jasmine timeout
                    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
                });
            });
        }(unitTestFile));
    }
});