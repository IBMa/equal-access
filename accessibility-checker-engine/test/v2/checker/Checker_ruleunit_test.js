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
    "RPT_List_Misuse": "3",
    "RPT_Marquee_Trigger": "5",
    "RPT_Headers_FewWords": "7",
    "WCAG20_Input_ExplicitLabelImage": "10",
    "RPT_Img_UsemapValid": "11",
    "WCAG20_Object_HasText": "20",
    "WCAG20_Applet_HasAlt": "21",
    "RPT_Media_AudioTrigger": "24",
    "RPT_Blockquote_HasCite": "25",
    "RPT_Meta_Refresh": "33",
    "WCAG20_Frame_HasTitle": "39",
    "WCAG20_Input_ExplicitLabel": "41",
    "RPT_Media_AltBrief": "99",
    "WCAG20_A_TargetAndText": "112",
    "WCAG20_Area_HasAlt": "240",
    "RPT_Media_ImgColorUsage": "245",
    "WCAG20_Meta_RedirectZero": "254",
    "element_attribute_deprecated": "256",
    "text_quoted_correctly": "263",
    "RPT_Elem_EventMouseAndKey": "269",
    "WCAG20_Doc_HasTitle": "273",
    "RPT_Block_ShouldBeHeading": "322",
    "WCAG20_Form_HasSubmit": "324",
    "RPT_Elem_UniqueId": "377",
    "RPT_Font_ColorInForm": "394",
    "RPT_Label_UniqueFor": "398",
    "RPT_Img_AltCommonMisuse": "453",
    "RPT_Img_LongDescription2": "454",
    "WCAG20_Img_HasAlt": "455",
    "RPT_Style_BackgroundImage": "456",
    "RPT_Pre_ASCIIArt": "458",
    "RPT_Media_VideoReferenceTrigger": "511",
    "RPT_Media_AudioVideoAltFilename": "460",
    "RPT_Style_ColorSemantics1": "466",
    "WCAG20_Select_HasOptGroup": "467",
    "RPT_List_UseMarkup": "468",
    "RPT_Script_OnclickHTML1": "470",
    "WCAG20_Table_Structure": "471",
    "WCAG20_Img_AltTriggerNonDecorative": "473",
    "WCAG20_Blink_AlwaysTrigger": "478",
    "RPT_Blink_CSSTrigger1": "479",
    "RPT_Html_SkipNav": "481",
    "RPT_Title_Valid": "484",
    "RPT_Header_HasContent": "488",
    "WCAG20_Html_HasLang": "490",
    "WCAG20_Form_TargetAndText": "491",
    "WCAG20_A_HasText": "495",
    "WCAG20_Fieldset_HasLegend": "497",
    "RPT_Media_VideoObjectTrigger": "501",
    "RPT_Text_SensoryReference": "502",
    "RPT_Embed_AutoStart": "503",
    "RPT_Style_HinderFocus1": "506",
    "WCAG20_Img_LinkTextNotRedundant": "1000",
    "RPT_Style_ExternalStyleSheet": "1073",
    // "RPT_Header_Trigger": "1002",
    "RPT_Script_OnclickHTML2": "1007",
    "WCAG20_Table_CapSummRedundant": "1011",
    "WCAG20_Input_LabelBefore": "1017",
    "WCAG20_Input_LabelAfter": "1018",
    "WCAG20_Embed_HasNoEmbed": "1020",
    "WCAG20_Table_Scope_Valid": "1025",
    "WCAG20_Img_TitleEmptyWhenAltNull": "1027",
    "WCAG20_Input_InFieldSet": "1028",
    "WCAG20_Input_RadioChkInFieldSet": "1029",
    "WCAG20_Select_NoChangeAction": "1035",
    "WCAG20_Input_HasOnchange": "1050",
    "RPT_Embed_HasAlt": "1051",
    "Valerie_Noembed_HasContent": "1052",
    "Valerie_Caption_HasContent": "1053",
    "Valerie_Caption_InTable": "1054",
    "Valerie_Label_HasContent": "1055",
    "Valerie_Elem_DirValid": "1056",
    "Valerie_Frame_SrcHtml": "1057",
    "Valerie_Table_DataCellRelationships": "1059",
    "RPT_Table_LayoutTrigger": "1060",
    "RPT_Table_DataHeadingsAria": "1061",
    "WCAG20_Label_RefValid": "1062",
    "WCAG20_Elem_UniqueAccessKey": "1063",
    "WCAG20_Script_FocusBlurs": "1064",
    "HAAC_Img_UsemapAlt": "1067",
    "WCAG20_Text_Emoticons": "1068",
    "WCAG20_Style_BeforeAfter": "1069",
    "text_whitespace_valid": "1070",
    "Rpt_Aria_ValidRole": "1074",
    "Rpt_Aria_ValidPropertyValue": "1076",
    "Rpt_Aria_ValidIdRef": "1077",
    "Rpt_Aria_RequiredProperties": "1079",
    "Rpt_Aria_EmptyPropertyValue": "1082",
    "Rpt_Aria_ValidProperty": "1083",
    "Rpt_Aria_InvalidTabindexForActivedescendant": "1084",
    "Rpt_Aria_MissingFocusableChild": "1086",
    "Rpt_Aria_MissingKeyboardHandler": "1087",
    "WCAG20_Img_PresentationImgHasNonNullAlt": "1090",
    "Rpt_Aria_MultipleSearchLandmarks": "1097",
    "Rpt_Aria_MultipleApplicationLandmarks": "1099",
    "Rpt_Aria_ApplicationLandmarkLabel": "1100",
    "Rpt_Aria_MultipleDocumentRoles": "1101",
    "WCAG20_Label_TargetInvisible": "1112",
    "HAAC_Video_HasNoTrack": "1117",
    "HAAC_Audio_Video_Trigger": "1119",
    "HAAC_Input_HasRequired": "1124",
    "HAAC_Aria_ImgAlt": "1128",
    "HAAC_BackgroundImg_HasTextOrTitle": "1132",
    "HAAC_Accesskey_NeedLabel": "1140",
    "aria_attribute_conflict": "1141",
    "HAAC_Canvas": "1143",
    "HAAC_Figure_label": "1144",
    "HAAC_Input_Placeholder": "1145",
    "RPT_Form_ChangeEmpty": "1147",
    "IBMA_Color_Contrast_WCAG2AA": "1148",
    "IBMA_Color_Contrast_WCAG2AA_PV": "1149",
    "WCAG20_Body_FirstASkips_Native_Host_Sematics": "1150",
    "WCAG20_Body_FirstAContainsSkipText_Native_Host_Sematics": "1151",
    "aria_child_valid": "1152",
    "Rpt_Aria_RequiredParent_Native_Host_Sematics": "1153",
    "Rpt_Aria_EventHandlerMissingRole_Native_Host_Sematics": "1154",
    "Rpt_Aria_WidgetLabels_Implicit": "1156",
    "Rpt_Aria_OrphanedContent_Native_Host_Sematics": "1157",
    "Rpt_Aria_RegionLabel_Implicit": "1158",
    "Rpt_Aria_MultipleMainsVisibleLabel_Implicit": "1159",
    "Rpt_Aria_MultipleBannerLandmarks_Implicit": "1160",
    "Rpt_Aria_MultipleComplementaryLandmarks_Implicit": "1161",
    "Rpt_Aria_MultipleContentinfoLandmarks_Implicit": "1162",
    "Rpt_Aria_MultipleFormLandmarks_Implicit": "1163",
    "Rpt_Aria_MultipleNavigationLandmarks_Implicit": "1164",
    "Rpt_Aria_ComplementaryLandmarkLabel_Implicit": "1165",
    "Rpt_Aria_MultipleArticleRoles_Implicit": "1166",
    "Rpt_Aria_ArticleRoleLabel_Implicit": "1167",
    "Rpt_Aria_MultipleGroupRoles_Implicit": "1168",
    "Rpt_Aria_GroupRoleLabel_Implicit": "1169",
    "Rpt_Aria_MultipleContentinfoInSiblingSet_Implicit": "1170",
    "Rpt_Aria_OneBannerInSiblingSet_Implicit": "1172",
    "Rpt_Aria_ContentinfoWithNoMain_Implicit": "1173",
    "Rpt_Aria_ComplementaryRequiredLabel_Implicit": "1174",
    "Rpt_Aria_MultipleRegionsUniqueLabel_Implicit": "1176",
    "IBMA_Focus_Tabbable": "1177",
    "IBMA_Focus_MultiTab": "1178",
    "RPT_Style_Trigger2": "1180",
    "Rpt_Aria_MultipleMainsRequireLabel_Implicit_2": "1182",
    "HAAC_Media_DocumentTrigger2": "1183",
    "HAAC_Aria_ErrorMessage": "1184",
    "HAAC_List_Group_ListItem": "1185",
    "HAAC_ActiveDescendantCheck": "1186",
    "HAAC_Application_Role_Text": "1187",
    "Rpt_Aria_MultipleToolbarUniqueLabel": "1188",
    "HAAC_Combobox_ARIA_11_Guideline": "1193",
    "HAAC_Combobox_Must_Have_Text_Input": "1194",
    "HAAC_Combobox_DOM_Focus": "1195",
    "HAAC_Combobox_Autocomplete": "1196",
    "HAAC_Combobox_Autocomplete_Invalid": "1197",
    "HAAC_Combobox_Expanded": "1198",
    "HAAC_Combobox_Popup": "1199",
    "WCAG21_Style_Viewport": "1200",
    "WCAG21_Label_Accessible": "1202",
    "WCAG21_Input_Autocomplete": "1203",
    "WCAG20_Input_VisibleLabel": "1204"
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