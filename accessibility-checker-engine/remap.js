const fs = require("fs");
const path = require("path");

let remap = { "WCAG20_A_TargetAndText": "a_target_warning",
 "WCAG20_A_HasText": "a_text_purpose",
 "WCAG20_Applet_HasAlt": "applet_alt_exists",
 "HAAC_Application_Role_Text": "application_content_accessible",
 "WCAG20_Area_HasAlt": "area_alt_exists",
 "Rpt_Aria_InvalidTabindexForActivedescendant": "aria_activedescendant_tabindex_valid",
 "HAAC_ActiveDescendantCheck": "aria_activedescendant_valid",
 "Rpt_Aria_MultipleApplicationLandmarks": "aria_application_label_unique",
 "Rpt_Aria_ApplicationLandmarkLabel": "aria_application_labelled",
 "Rpt_Aria_MultipleArticleRoles_Implicit": "aria_article_label_unique",
 "Rpt_Aria_MultipleBannerLandmarks_Implicit": "aria_banner_label_unique",
 "Rpt_Aria_OneBannerInSiblingSet_Implicit": "aria_banner_single",
 "Rpt_Aria_MissingFocusableChild": "aria_child_tabbable",
 "Rpt_Aria_MultipleComplementaryLandmarks_Implicit": "aria_complementary_label_unique",
 "Rpt_Aria_ComplementaryLandmarkLabel_Implicit": "aria_complementary_label_visible",
 "Rpt_Aria_ComplementaryRequiredLabel_Implicit": "aria_complementary_labelled",
 "Rpt_Aria_OrphanedContent_Native_Host_Sematics": "aria_content_in_landmark",
 "Rpt_Aria_MultipleContentinfoLandmarks_Implicit": "aria_contentinfo_label_unique",
 "Rpt_Aria_ContentinfoWithNoMain_Implicit": "aria_contentinfo_misuse",
 "Rpt_Aria_MultipleContentinfoInSiblingSet_Implicit": "aria_contentinfo_single",
 "Rpt_Aria_MultipleDocumentRoles": "aria_document_label_unique",
 "Rpt_Aria_EventHandlerMissingRole_Native_Host_Sematics": "aria_eventhandler_role_valid",
 "Rpt_Aria_MultipleFormLandmarks_Implicit": "aria_form_label_unique",
 "HAAC_Aria_SvgAlt": "aria_graphic_labelled",
 "aria_hidden_focus_misuse": "aria_hidden_nontabbable",
 "Rpt_Aria_ValidIdRef": "aria_id_unique",
 "HAAC_Aria_ImgAlt": "aria_img_labelled",
 "Rpt_Aria_MissingKeyboardHandler": "aria_keyboard_handler_exists",
 "landmark_name_unique": "aria_landmark_name_unique",
 "Rpt_Aria_MultipleMainsRequireLabel_Implicit_2": "aria_main_label_unique",
 "Rpt_Aria_MultipleMainsVisibleLabel_Implicit": "aria_main_label_visible",
 "Rpt_Aria_MultipleNavigationLandmarks_Implicit": "aria_navigation_label_unique",
 "Rpt_Aria_RequiredParent_Native_Host_Sematics": "aria_parent_required",
 "Rpt_Aria_EmptyPropertyValue": "aria_attribute_exists",
 "Rpt_Aria_RequiredProperties": "aria_attribute_required",
 "Rpt_Aria_ValidProperty": "aria_attribute_allowed",
 "Rpt_Aria_ValidPropertyValue": "aria_attribute_value_valid",
 "Rpt_Aria_MultipleRegionsUniqueLabel_Implicit": "aria_region_label_unique",
 "Rpt_Aria_RegionLabel_Implicit": "aria_region_labelled",
 "Rpt_Aria_ValidRole": "aria_role_allowed",
 "Rpt_Aria_MultipleSearchLandmarks": "aria_search_label_unique",
 "Rpt_Aria_MultipleToolbarUniqueLabel": "aria_toolbar_label_unique",
 "Rpt_Aria_WidgetLabels_Implicit": "aria_widget_labelled",
 "RPT_Pre_ASCIIArt": "asciiart_alt_exists",
 "RPT_Blink_CSSTrigger1": "blink_css_review",
 "WCAG20_Blink_AlwaysTrigger": "blink_elem_deprecated",
 "RPT_Blockquote_HasCite": "blockquote_cite_exists",
 "HAAC_Canvas": "canvas_content_described",
 "HAAC_Video_HasNoTrack": "caption_track_exists",
 "combobox_autocomplete": "combobox_autocomplete_valid",
 "combobox_version": "combobox_design_valid",
 "combobox_haspopup": "combobox_haspopup_valid",
 "Valerie_Elem_DirValid": "dir_attribute_valid",
 "HAAC_Media_DocumentTrigger2": "download_keyboard_controllable",
 "HAAC_Accesskey_NeedLabel": "element_accesskey_labelled",
 "WCAG20_Elem_UniqueAccessKey": "element_accesskey_unique",
 "RPT_Elem_UniqueId": "element_id_unique",
 "RPT_Elem_EventMouseAndKey": "element_mouseevent_keyboard",
 "RPT_Embed_HasAlt": "embed_alt_exists",
 "WCAG20_Embed_HasNoEmbed": "embed_noembed_exists",
 "WCAG20_Text_Emoticons": "emoticons_alt_exists",
 "HAAC_Aria_ErrorMessage": "error_message_exists",
 "group_withInputs_hasName": "fieldset_label_valid",
 "WCAG20_Fieldset_HasLegend": "fieldset_legend_valid",
 "HAAC_Figure_label": "figure_label_exists",
 "RPT_Font_ColorInForm": "form_font_color",
 "WCAG20_Form_TargetAndText": "form_interaction_review",
 "RPT_Label_UniqueFor": "form_label_unique",
 "WCAG20_Form_HasSubmit": "form_submit_button_exists",
 "RPT_Form_ChangeEmpty": "form_submit_review",
 "Valerie_Frame_SrcHtml": "frame_src_valid",
 "WCAG20_Frame_HasTitle": "frame_title_exists",
 "RPT_Header_HasContent": "heading_content_exists",
 "RPT_Headers_FewWords": "heading_markup_misuse",
 "WCAG20_Html_HasLang": "html_lang_exists",
 "RPT_Html_SkipNav": "html_skipnav_exists",
 "WCAG20_Input_ExplicitLabelImage": "imagebutton_alt_exists",
 "HAAC_Img_UsemapAlt": "imagemap_alt_exists",
 "HAAC_BackgroundImg_HasTextOrTitle": "img_alt_background",
 "WCAG20_Img_PresentationImgHasNonNullAlt": "img_alt_decorative",
 "RPT_Img_AltCommonMisuse": "img_alt_misuse",
 "WCAG20_Img_TitleEmptyWhenAltNull": "img_alt_null",
 "WCAG20_Img_LinkTextNotRedundant": "img_alt_redundant",
 "WCAG20_Img_HasAlt": "img_alt_valid",
 "RPT_Img_UsemapValid": "img_ismap_misuse",
 "RPT_Img_LongDescription2": "img_longdesc_misuse",
 "WCAG21_Input_Autocomplete": "input_autocomplete_valid",
 "WCAG20_Input_RadioChkInFieldSet": "input_checkboxes_grouped",
 "WCAG20_Input_InFieldSet": "input_fields_grouped",
 "input_haspopup_invalid": "input_haspopup_conflict",
 "WCAG20_Input_LabelAfter": "input_label_after",
 "WCAG20_Input_LabelBefore": "input_label_before",
 "WCAG20_Input_ExplicitLabel": "input_label_exists",
 "WCAG20_Input_VisibleLabel": "input_label_visible",
 "WCAG20_Input_HasOnchange": "input_onchange_review",
 "HAAC_Input_Placeholder": "input_placeholder_label_visible",
 "Valerie_Label_HasContent": "label_content_exists",
 "WCAG21_Label_Accessible": "label_name_visible",
 "WCAG20_Label_RefValid": "label_ref_valid",
 "HAAC_List_Group_ListItem": "list_children_valid",
 "RPT_List_UseMarkup": "list_markup_review",
 "RPT_List_Misuse": "list_structure_proper",
 "RPT_Marquee_Trigger": "marquee_elem_avoid",
 "RPT_Media_AltBrief": "media_alt_brief",
 "RPT_Media_AudioVideoAltFilename": "media_alt_exists",
 "RPT_Media_AudioTrigger": "media_audio_transcribed",
 "RPT_Embed_AutoStart": "media_autostart_controllable",
 "HAAC_Audio_Video_Trigger": "media_keyboard_controllable",
 "RPT_Media_VideoObjectTrigger": "media_live_captioned",
 "RPT_Media_VideoReferenceTrigger": "media_track_available",
 "WCAG20_Meta_RedirectZero": "meta_redirect_optional",
 "RPT_Meta_Refresh": "meta_refresh_delay",
 "meta_viewport_zoom": "meta_viewport_zoomable",
 "Valerie_Noembed_HasContent": "noembed_content_exists",
 "WCAG20_Object_HasText": "object_text_exists",
 "WCAG20_Doc_HasTitle": "page_title_exists",
 "RPT_Title_Valid": "page_title_valid",
 "WCAG20_Script_FocusBlurs": "script_focus_blur_review",
 "RPT_Script_OnclickHTML2": "script_onclick_avoid",
 "RPT_Script_OnclickHTML1": "script_onclick_misuse",
 "WCAG20_Select_NoChangeAction": "script_select_review",
 "WCAG20_Select_HasOptGroup": "select_options_grouped",
 "WCAG20_Body_FirstAContainsSkipText_Native_Host_Sematics": "skip_main_described",
 "WCAG20_Body_FirstASkips_Native_Host_Sematics": "skip_main_exists",
 "RPT_Style_BackgroundImage": "style_background_decorative",
 "WCAG20_Style_BeforeAfter": "style_before_after_review",
 "RPT_Style_ColorSemantics1": "style_color_misuse",
 "RPT_Style_HinderFocus1": "style_focus_visible",
 "RPT_Style_Trigger2": "style_highcontrast_visible",
 "WCAG21_Style_Viewport": "style_viewport_resizable",
 "Valerie_Caption_HasContent": "table_caption_empty",
 "Valerie_Caption_InTable": "table_caption_nested",
 "RPT_Table_DataHeadingsAria": "table_headers_exists",
 "Valerie_Table_DataCellRelationships": "table_headers_related",
 "RPT_Table_LayoutTrigger": "table_layout_linearized",
 "WCAG20_Table_Scope_Valid": "table_scope_valid",
 "WCAG20_Table_Structure": "table_structure_misuse",
 "WCAG20_Table_CapSummRedundant": "table_summary_redundant",
 "RPT_Block_ShouldBeHeading": "text_block_heading",
 "IBMA_Color_Contrast_WCAG2AA": "text_contrast_sufficient",
 "RPT_Text_SensoryReference": "text_sensory_misuse",
 "IBMA_Focus_Tabbable": "widget_tabbable_exists",
 "IBMA_Focus_MultiTab": "widget_tabbable_single"
}

let unitTestFiles = [
    "../accessibility-checker/test/mocha/aChecker.Fast/aChecker.Scans/aChecker.assertionCompliance.test.js",

]
// let importFile = fs.readFileSync(path.join("test", "v2", "checker", "Checker_ruleunit_test.js")).toString();
for (const file of unitTestFiles) {
    let s = fs.readFileSync(file).toString();
    for (const oldRuleId in remap) {
        let newRuleId = remap[oldRuleId];
        let oldRulePath = path.join("src", "v4", "rules", oldRuleId+".ts");
        let newRulePath = path.join("src", "v4", "rules", newRuleId+".ts");
        s = s.replaceAll(oldRuleId, newRuleId);
    }
    fs.writeFileSync(file, s);
    // if (fs.existsSync(path.join("help-v4", "en-US", oldRuleId+".html"))) {
    //     fs.renameSync(path.join("help-v4", "en-US", oldRuleId+".html"), path.join("help-v4", "en-US", newRuleId+".html"))
    // }
    // if (fs.existsSync(path.join("test", "v2", "checker", "accessibility", "rules", oldRuleId+"_ruleunit"))) {
        // fs.renameSync(path.join("test", "v2", "checker", "accessibility", "rules", oldRuleId+"_ruleunit"), path.join("test", "v2", "checker", "accessibility", "rules", newRuleId+"_ruleunit"))
    // }
    // fs.renameSync(oldRulePath, newRulePath);

    // let ruleFileStr = fs.readFileSync(oldRulePath).toString();

    // let m = ruleFileStr.match(/["']en-US["']\s*:\s*\{([^}]*)\}/);
    // let refactorSection = m[1].split(",");
    // for (let idx=0; idx<refactorSection.length; ++idx) {
    //     refactorSection[idx] = refactorSection[idx].replace(/(["'`][^"'`]*["'`])\s*:\s*["'`][^"'`]*["'`]/, "$1: $1");
    //     if (refactorSection[idx].indexOf(`"group": "group"`) !== -1) {
    //         refactorSection.splice(idx--, 1);
    //     }
    // }
    // refactorSection = refactorSection.join(",");
    // ruleFileStr = ruleFileStr.replaceAll(oldRuleId, newRuleId);
    // let helpIdx = ruleFileStr.indexOf("help");
    // let newRuleFileStr = `${ruleFileStr.substring(0,helpIdx)}refactor: {
    //     "${oldRuleId}": {${refactorSection}}
    // },
    // ${ruleFileStr.substring(helpIdx)}`;
    // fs.writeFileSync(oldRulePath, newRuleFileStr);

    // importFile = importFile.replaceAll(oldRuleId, newRuleId)    
}
// fs.writeFileSync(path.join("test", "v2", "checker", "Checker_ruleunit_test.js"), importFile);

