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

import { ACBrowserManager } from "./lib/ACBrowserManager";
import { ACConfigManager } from "./lib/ACConfigManager";
import { ACEngineManager } from "./lib/ACEngineManager";
import { getComplianceHelper } from "./lib/ACHelper";
import { ACReportManager } from "./lib/ACReportManager";
import { eAssertResult, ICheckerReport, ICheckerResult, IConfig, IConfigUnsupported, ReportResult } from "./lib/api/IChecker";
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
 * @param {(String|HTMLElement|DocumentNode|Puppeteer Page |)} content - Provide the context to scan, which includes the items from above.
 * @param {String} label - Provide a label for the scan that is being performed
 * @param {Function} callback - (optional) Provide callback function which will be executed once the results are extracted.
 * @return Promise with the ICheckerResult
 */
export function getCompliance(content: any,
    label: string,
    callback?: (report: ReportResult, webdriver) => void) : Promise<ICheckerResult>
{
    if (callback) {
        getComplianceHelper(content, label)
            .then((result) => {
                callback(result.report, result.webdriver);
            });
    } else {
        return getComplianceHelper(content, label);
    }
}

/**
 * This function is responsible for comparing the scan results with baseline or checking that there are
 * no violations which fall into the failsLevels levels. In the case a baseline is found then baseline will
 * be used to perform the check, in the case no baseline is provided then we comply with only failing if
 * there is a sinble violation which falls into failLevels.
 *
 * @param {ReportResult} actual - the actual results object provided by the user, this object should follow the
 *                          same format as outlined in the return of aChecker.buildReport function.
 *
 * @return {int} - return 0 in the case actual matches baseline or no violations fall into failsLevels,
 *                 return 1 in the case actual results does not match baseline results,
 *                 return 2 in the case that there is a failure based on failLevels (this means no baseline found).
 *                 return -1 in the case that there is an exception that occured in the results object which came from the scan engine.
 */
export function assertCompliance(report: ReportResult) : eAssertResult {
    return ACReportManager.assertCompliance(report)
}

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
export function stringifyResults(report: ICheckerReport) : string {
    return ACReportManager.stringifyResults(report)
}

export function getConfig() : Promise<IConfig> {
    return ACConfigManager.getConfig();
}

export function getConfigUnsupported() : Promise<IConfigUnsupported> {
    return ACConfigManager.getConfigUnsupported();
}

export function close() {
    return ACBrowserManager.close();
}

/**
 * This function is responsible for getting the diff results based on label for a scan that was already performed.
 *
 * @param {String} label - Provide a lable for which to get the diff results for.
 *
 * @return {Object} - return the diff results object from global space based on label provided, the object will be
 *                    in the same format as outlined in the return of aChecker.diffResultsWithExpected function.
 */
export function getDiffResults(label: string) {
    return ACReportManager.getDiffResults(label);
}

/**
 * This function is responsible for getting the baseline object for a label that was provided.
 *
 * @param {String} label - Provide a lable for which to get the baseline for.
 *
 * @return {Object} - return the baseline object from global space based on label provided, the object will be
 *                    in the same format as outlined in the return of aChecker.buildReport function.
 */
export function getBaseline(label: string) {
    return ACReportManager.getBaseline(label);
}

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
 */
export function diffResultsWithExpected(actual, expected, clean) {
    return ACReportManager.diffResultsWithExpected(actual, expected, clean);
}

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
 */
export function cleanComplianceObjectBeforeCompare(objectToClean) {
    return ACReportManager.cleanComplianceObjectBeforeCompare(objectToClean);
}

export function addRuleset(ruleset) {
    ACEngineManager.addRuleset(ruleset);
}

export async function getRuleset(rsId) {
    return ACEngineManager.getRuleset(rsId);
};

export async function getRulesets() {
    return ACEngineManager.getRulesets();
};

export async function getRules() {
    return ACEngineManager.getRules();
}

export const ruleIdToLegacyId = {
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
    "RPT_Elem_Deprecated": "256",
    "RPT_Blockquote_WrapsTextQuote": "263",
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
    "RPT_Header_Trigger": "1002",
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
    "WCAG20_Text_LetterSpacing": "1070",
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
    "HAAC_Aria_Or_HTML5_Attr": "1141",
    "HAAC_Canvas": "1143",
    "HAAC_Figure_label": "1144",
    "HAAC_Input_Placeholder": "1145",
    "RPT_Form_ChangeEmpty": "1147",
    "IBMA_Color_Contrast_WCAG2AA": "1148",
    "IBMA_Color_Contrast_WCAG2AA_PV": "1149",
    "WCAG20_Body_FirstASkips_Native_Host_Sematics": "1150",
    "WCAG20_Body_FirstAContainsSkipText_Native_Host_Sematics": "1151",
    "Rpt_Aria_RequiredChildren_Native_Host_Sematics": "1152",
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
