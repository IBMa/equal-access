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

import { ACBrowserManager } from "./lib/ACBrowserManager.js";
/** import { ACConfigManager } from "./lib/ACConfigManager.js";
import { ACEngineManager } from "./lib/ACEngineManager.js";
import { getComplianceHelper } from "./lib/ACHelper.js";
import { ACReportManager } from "./lib/ACReportManager.js";
import { eAssertResult, ICheckerReport, ICheckerResult, IConfig, IConfigUnsupported, ReportResult } from "./lib/api/IChecker.js";
import { IConfig, IConfigInternal } from "./lib/common/config/IConfig.js";
import { IBaselineReport } from "./lib/common/engine/IReport.js";
import { BaselineManager } from "./lib/common/report/BaselineManager.js";
*/
import { ACEngineManager } from "./lib/ACEngineManager.js";
import { getComplianceHelper } from "./lib/ACHelper.js";
import { eAssertResult, ICheckerReport, ICheckerResult, ReportResult } from "./lib/api/IChecker.js";
import { ACConfigManager } from "./lib/common/config/ACConfigManager.js";
import { IConfig, IConfigInternal } from "./lib/common/config/IConfig.js";
import { IBaselineReport } from "./lib/common/engine/IReport.js";
import { BaselineManager } from "./lib/common/report/BaselineManager.js";
import { ReporterManager } from "./lib/common/report/ReporterManager.js";

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
export function assertCompliance(report: IBaselineReport) : eAssertResult {
    return BaselineManager.assertCompliance(report)
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
    return ReporterManager.stringifyResults(report)
}

export function getConfig() : Promise<IConfig> {
    return ACConfigManager.getConfig();
}

export function getConfigUnsupported() : Promise<IConfigInternal> {
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
    return BaselineManager.getDiffResults(label);
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
    return BaselineManager.getBaseline(label);
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
    return BaselineManager.diffResultsWithExpected(actual, expected, clean);
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
    return BaselineManager.cleanComplianceObjectBeforeCompare(objectToClean);
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
