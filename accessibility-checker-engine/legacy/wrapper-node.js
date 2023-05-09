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

var ace = module.exports;
var IBMa = module.exports = {};
var mapRuleToG = IBMa.mapRuleToG = {
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

IBMa.checker = new ace.Checker();
IBMa.Config = {};
IBMa.Config.DEBUG = false;
IBMa.Config.loaded = true;
IBMa.Config.addMetadata = function() {}
IBMa.Config.nlsMap = {}
IBMa.Config.locale = "en-us";
IBMa.Config.rs = {}
for (var idx = 0; idx < IBMa.checker.rulesets.length; ++idx) {
    var ruleset = IBMa.checker.rulesets[idx];
    IBMa.Config.rs[ruleset.id] = ruleset;
}

IBMa.Config.getNLS = function(code, args) {
    var m = code.match(/(.*)!!(.*)?/);
    var msgCode = "";
    var reasonCode = 0;
    if (m) {
        msgCode = m[1];
        reasonCode = m[2];
    } else {
        msgCode = code;
    }
    if (!args) {
        reasonCode = 0;
    }
    return IBMa.checker.engine.getMessage(msgCode, reasonCode, args);
}

IBMa.Config.getAllRulesets = function() {
    return IBMa.Config.rs;
}

IBMa.Scan = {}
IBMa.GSALoader = {}
IBMa.GSALoader.initStarted = true;
IBMa.GSALoader.init = function (cb) {
    setTimeout(cb,0);
}

IBMa.validate = function (doc, policies, callback, progressCallback) {
    const levelLookup = {
        "VIOLATION": {
            "PASS": null,
            "FAIL": "level.violation",
            "POTENTIAL": "level.potentialviolation",
            "MANUAL": "level.manual"
        },
        "RECOMMENDATION": {
            "PASS": null,
            "FAIL": "level.recommendation",
            "POTENTIAL": "level.recommendation",
            "MANUAL": "level.manual"
        },
        "INFORMATION": {
            "PASS": null,
            "FAIL": null,
            "POTENTIAL": null,
            "MANUAL": null
        }
    }

    IBMa.checker.check(doc.documentElement || doc, policies)
        .then(function(report) {
            var retVal = {
                "counts": {
                    "level.violation": 0,
                    "level.potentialviolation": 0,
                    "level.recommendation": 0,
                    "level.potentialrecommendation": 0,
                    "level.manual": 0
                },
                "report": {
                    "numChecked": report.numExecuted,
                    "numTrigger": 0,
                    "ruleTime": report.ruleTime,
                    "totalTime": report.totalTime,
                    "docTitle": doc.title,
                    "issues": []
                },
                "issueMessages": IBMa.Config.nlsMap
            }
            for (var idx=0; idx<report.results.length; ++idx) {
                var result = report.results[idx];
                var origVal = result.value;
                var levelString = levelLookup[origVal[0]][origVal[1]];
                if (levelString) {
                    retVal.counts[levelString]++;
                    retVal.report.numTrigger++;
                    var messageCode = result.ruleId+"!!"+result.reasonId;
                    retVal.issueMessages[result.ruleId] = IBMa.checker.engine.nlsMap[result.ruleId][0];
                    retVal.issueMessages[messageCode] = IBMa.checker.engine.nlsMap[result.ruleId][result.reasonId];
                    retVal.report.issues.push({
                        "severityCode": "eISInformation",
                        "messageCode": messageCode,
                        "ruleId": result.ruleId in IBMa.mapRuleToG ? IBMa.mapRuleToG[result.ruleId] : result.ruleId.replace(/_/g,""),
                        "component": result.path.dom,
                        "msgArgs": result.messageArgs,
                        "pofId": result.reasonCode,
                        "bounds": result.bounds || {
                            "left": 0,
                            "top": 0,
                            "height": 0,
                            "width": 0
                        },
                        "level": levelString.substring(levelString.indexOf(".")+1),
                        "xpath": result.path.dom,
                        "snippet": result.snippet,
                        "help": IBMa.checker.engine.getHelp(result.ruleId, result.reasonId)
                    })
                }
            }
            callback(retVal);
        })
}
