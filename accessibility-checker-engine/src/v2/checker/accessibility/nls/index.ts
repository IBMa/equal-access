let a11yNls = {
    // JCH - DONE
    "RPT_List_Misuse": {
        0: "LIST elements missing, or improperly structured. Do not use list elements for formatting.",
        "Pass_0": "Rule Passed",
        "Potential_1": "LIST element is missing, or improperly structured. Do not use LIST elements for formatting."
    },
    // JCH - DONE
    "RPT_Marquee_Trigger": {
        0: "Avoid scrolling text created with the MARQUEE element.",
        "Passed_0": "Rule Passed",
        "Fail_1": "MARQUEE element is being used for scrolling text."
    },
    // JCH - DONE
    "RPT_Headers_FewWords": {
        0: "Make sure HEADER elements are used as a heading for a section and not used to format text for presentation.",
        "Pass_0": "Rule Passed",
        "Potential_1": "HEADER element is possibly being used for presentation."
    },
    // JCH - DONE
    "WCAG20_Input_ExplicitLabelImage": {
        0: "Provide alternative text for all image-type buttons.",
        "Pass_0": "Image button provides alternative text using the alt attribute",
        "Pass_1": "Image button provides alternative text using a WAI-ARIA label",
        "Pass_2": "Image button provides alternative text using the title attribute",
        "Fail": "Alternate text missing for image-type button."
    },
    // JCH - DONE
    "RPT_Img_UsemapValid": {
        0: "Provide text links that duplicate all server-side image map hot-spots.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Possibly missing text links that duplicate all server-side image map hot-spots."
    },
    // JCH - DONE
    "WCAG20_Object_HasText": {
        0: "Objects must contain inner text as alt text.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Object missing inner text as alt text."
    },
    // JCH - DONE
    "WCAG20_Applet_HasAlt": {
        0: "APPLET element must provide alt text and alternative content.",
        "Pass_0": "Rule Passed",
        "Fail_1": "APPLET element is missing alt text.",
        "Fail_2": "APPLET element contains alt attribute that duplicates the code attribute.",
        "Fail_3": "APPLET element provides alt text, but does not provide inner content."
    },
    // JCH - DONE
    "RPT_Media_AudioTrigger": {
        0: "Provide transcripts for all audio files.",
        "Pass_0": "Rule Passed",
        "Manual_1": "Confirm transcripts are provided for all audio files."
    },
    // JCH - DONE
    "RPT_Blockquote_HasCite": {
        0: "Make sure BLOCKQUOTE is used only for quotations, not indentation.",
        "Pass_0": "Rule Passed",
        "Potential_1": "BLOCKQUOTE possibly used for indentation."
    },
    // JCH - DONE
    "RPT_Meta_Refresh": {
        0: "Do not cause a page to refresh automatically.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Possibly a page is being caused to refresh automatically."
    },
    // JCH - DONE
    "WCAG20_Frame_HasTitle": {
        0: "IFrames must have a non-empty title attribute.",
        "Pass_0": "Rule Passed",
        "Fail_1": "IFrame is missing title attribute."
    },
    // JCH - DONE
    "WCAG20_Input_ExplicitLabel": {
        0: "Each form control must have associated label.",
        "Pass_0": "Rule Passed",
        //"Fail_1": "Form control element <{0}> has no associated label",-Pass
        "Fail_1": "Form control element `<{0}>` has no associated label",
        //"Fail_1": "Form control element {0} has no associated label", - Pass
        "Fail_2": "Form control with role {0} is missing associated label."
    },
    // JCH - DONE
    "RPT_Media_AltBrief": {
        0: "Alt text should be brief, if >150 characters, consider providing a separate additional description.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Possibly alt text is not brief (>150 characters)."
    },
    // JCH - DONE
    "WCAG20_A_TargetAndText": {
        0: "Avoid any change of context on input unless the user is informed prior to interacting with the component.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Possibly the user is not being informed that clicking on certain links or areas of a window will open pop-up windows or change the active window."
    },
    // JCH - DONE
    "WCAG20_Area_HasAlt": {
        0: "AREA elements must have non-empty alt text.",
        "Pass_0": "Rule Passed",
        "Fail_1": "AREA element is missing alt text."
    },
    // JCH - DONE
    "RPT_Media_ImgColorUsage": {
        0: "Do not use color as the only means to convey information, provide an additional non-color cue.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Possibly you are using color as the only means to convey information."
    },
    // JCH - DONE
    "WCAG20_Meta_RedirectZero": {
        0: "Do not use meta redirect with a time limit to cause an automatic page redirect to a new URL.", 
        "Pass_0": "Rule Passed",
        "Fail_1": "Meta redirect with a time limit is being used to cause an automatic page redirect to a new URL."
    },
    // JCH - DONE
    "RPT_Elem_Deprecated": {
        0: "Avoid use of obsolete language features if possible.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Obsolete language features are being used."
    },
    // JCH - DONE
    "RPT_Blockquote_WrapsTextQuote": {
        0: "Quotations should be marked with Q or BLOCKQUOTE elements.",
        "Pass_0": "Rule Passed",
        "Potential_1": "If the following text is a quotation, mark it as a Q or BLOCKQUOTE element: {0}."
    },
    // JCH - DONE
    "RPT_Elem_EventMouseAndKey": {
        0: "The elements with mouse event handler(s) should have corresponding keyboard handler(s).",
        "Pass_0": "Rule Passed",
        "Manual_1": "Confirm the {0} element with mouse event handler(s) {1} has a corresponding keyboard handler(s)."
    },
    // JCH - DONE
    "WCAG20_Doc_HasTitle": {
        0: "The page should have a title that correctly identifies the subject of the page.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Missing head element so there can be no title element present.",
        "Fail_2": "Missing title element in head element.",
        "Fail_3": "The title element is empty (no innerHTML)."
    },
    // JCH - DONE
    "RPT_Block_ShouldBeHeading": {
        0: "Use HEADER element to define text that looks like a heading where appropriate.", 
        "Pass_0": "Rule Passed",
        "Potential_1": "Possibly 'heading like' text is not using a HEADER element."
    },
    // JCH - DONE
    "WCAG20_Form_HasSubmit": {
        0: "Forms should contain a submit button or an image button.",
        "Pass_0": "Rule Passed",
        "Potential_1": "FORM possibly missing either a submit button or an image button."
    },
    // JCH - DONE
    "RPT_Elem_UniqueId": {
        0: "Element ids must be unique within the document.",
        "Pass_0": "Rule Passed",
        "Fail_1": "The {0} element has the id \"{1}\" that is empty.",
        "Fail_2": "The {0} element has the id \"{1}\" that is already in use."
    },
    // JCH - DONE
    "RPT_Font_ColorInForm": {
        0: "Color must not be used as the only way to indicate required form fields.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Possible use of color as the only way to indicate required form fields."
    },
    // JCH - DONE
    "RPT_Label_UniqueFor": {
        0: "Do not provide multiple LABELs for one form control.",
        "Pass_0": "Rule Passed",
        "Fail_1": "More than one label present for a form control."
    },
    // JCH - DONE
    "RPT_Img_AltCommonMisuse": {
        0: "Ensure that image alt text serves as an inline replacement of the image.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Possible image alt text not serving as an inline replacement of the image."
    },
    // JCH - DONE
    "RPT_Img_LongDescription2": {
        0: " The file extention designated by the longdesc attribute is not recognized as a reference to valid HTML content.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Possibly longdesc URL extension is not recognized as a reference to HTML content."
    },
    // JCH - DONE
    "WCAG20_Img_HasAlt": {
        0: "Images must have an alt attribute, and must be the empty string if decorative.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Image has non-empty alt attribute but the value consist only of whitespace.",
        "Fail_2": "Image is missing alt attribute."
    },
    // JCH - DONE
    "RPT_Style_BackgroundImage": {
        0: "Do not use CSS alone to include images that convey important information in images.", 
        "Pass_0": "Rule Passed",
        "Potential_1": "A CSS background image is detected. Check the background image does not convey any important information."
    },
    // JCH - DONE
    "RPT_Pre_ASCIIArt": {
        0: "Provide a text alternative for ASCII art.",
        "Pass_0": "Rule Passed",
        "Potential_1": "ASCII art is used without a text alternative."
    },
    // JCH - DONE
    "RPT_Media_VideoReferenceTrigger": {
        0: "For pre-recorded media, check that a user-selectable audio track includes an audio description.",
        "Pass_0": "Rule Passed",
        "Manual_1": "For pre-recorded media, confirm that a user-selectable audio track includes an audio description."
    },
    // JCH - DONE
    "RPT_Media_AudioVideoAltFilename": {
        0: "Do not use filenames or placeholder text as a descriptive label for audio or video media.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Filenames or placeholder text being used as a descriptive label for audio or video media."
    },
    // JCH - DONE
    "RPT_Style_ColorSemantics1": {
        0: "Combine color and descriptive markup to convey information.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Possible use of only color to convey information make sure the color is supported by descriptive markup ."
    },
    // JCH - DONE
    "WCAG20_Select_HasOptGroup": {
        0: "If there are groups of related options withinin a selection list, they should be grouped with optgroup.", 
        "Pass_0": "Rule Passed",
        "Potential_1": "Group of related options possibly missing optgroup."
    },
    // JCH - DONE
    "RPT_List_UseMarkup": {
        0: "Use proper HTML LIST elements to create lists.", 
        "Pass_0": "Rule Passed",
        "Potential_1": "List possibly not using proper HTML LIST elements."
    },
    // JCH - DONE
    "RPT_Script_OnclickHTML1": {
        0: "Do not use scripts to emulate links.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Possible use of a script to emulate a link."
    },
    // JCH - DONE
    "WCAG20_Table_Structure": {
        0: "TABLE elements with WAI-ARIA role of 'presentation' or role of 'none' should not have structural element(s) and/or attribute(s).",
        "Pass_0": "Rule Passed",
        "Fail_1": "The {0} element with WAI-ARIA 'presentation' role or 'none' role has structural element(s) and/or attribute(s) {1}."
    },
    // JCH - DONE
    "WCAG20_Img_AltTriggerNonDecorative": {
        0: "Use text to convey information rather than images of text.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Possible use of images of text are used to convey information rather than text."
    },
    // JCH - DONE
    "WCAG20_Blink_AlwaysTrigger": {
        0: "Do not use the BLINK element.",
        "Pass_0": "Rule Passed",
        "Fail_1": "BLINK element is being used."
    },
    // JCH - DONE
    "RPT_Blink_CSSTrigger1": {
        0: "Do not use the BLINK value of the text-decoration property for longer than five seconds.",
        "Pass_0": "Rule Passed",
        "Potential_1": "BLINK value of the text-decoration property is being used longer than five seconds."
    },
    // JCH - DONE
    "RPT_Html_SkipNav": {
        0: "Provide a mechanism to bypass blocks of content that are repeated on multiple Web pages.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Possibly a mechanism to bypass blocks of content that are repeated on multiple Web pages is not provided."
    },
    // JCH - DONE
    "RPT_Title_Valid": {
        0: "Provide a descriptive TITLE for Web pages.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Page TITLE must be non-empty",
        "Potential_2": "Page TITLE should be a descriptive title, rather than a filename."
    },
    // JCH - DONE
    "RPT_Header_HasContent": {
        0: "Provide descriptive headings for Web page sections.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Header missing descriptive content."
    },
    // JCH - DONE
    // JCH - 0: provides the general DAP message for the rule
    //       "Pass_i" ???
    //       "Fail_j" descriptive message for specific failure
    //       "Potential_k" descriptive message describing case when it is not a failure 
    //                     but needs other checking to confirm pass or
    "WCAG20_Html_HasLang": {
        //0: "Page must identify the default language of the document with a lang attribute", 
        //"Pass_0": "Page language detected as {0}",
        //"Fail_1": "Page detected as XHTML 1.0, but has neither lang nor xml:lang attributes.",
        //"Fail_2": "Page detected as XHTML, but does not have an xml:lang attribute.",
        //"Fail_3": "Page detected as HTML, but does not have a lang attribute.",
        //"Fail_4": "Page detected as XHTML 1.0 with lang and xml:lang attributes that do not match: '{0}', '{1}'.",
        //"Potential_5": "Page detected as XHTML 1.0 with only a lang attribute. Confirm that page is only delivered via text/html mime type",
        //"Potential_6": "Page detected as XHTML 1.0 with only an xml:lang attribute. Confirm that page is only delivered via xml mime type"
        0: "Page must identify the default language of the document with a `lang` attribute", 
        "Pass_0": "Page language detected as `\"{0}\"`",
        "Fail_1": "Page detected as XHTML 1.0, but has neither `lang` nor `xml:lang` attributes",
        "Fail_2": "Page detected as XHTML, but does not have an `xml:lang` attribute",
        "Fail_3": "Page detected as HTML, but does not have a `lang` attribute",
        "Fail_4": "Page detected as XHTML 1.0 with `lang` and `xml:lang` attributes that do not match: `\"{0}\"`, `\"{1}\"`",
        "Potential_5": "Page detected as XHTML 1.0 with only a `lang` attribute. Confirm that page is only delivered via text/html mime type",
        "Potential_6": "Page detected as XHTML 1.0 with only an `xml:lang` attribute. Confirm that page is only delivered via xml mime type"
    },
    // JCH - DONE
    "WCAG20_Form_TargetAndText": {
        0: "Inform the user that interacting with content will open pop-up windows or change the active window.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Possibly the user is not informed that interacting with content will open pop-up windows or change the active window."
    },
    // JCH - DONE
    "WCAG20_A_HasText": {
        0: "Hyperlinks must have a description of their purpose",
        "Pass_0": "Hyperlink has a description of its purpose",
        "Fail_1": "Hyperlink has no link text, label or image with a text alternative"
        //0: "Hyperlinks must contain link text or an image with alt text.",
        //"Pass_0": "Hyperlink contains content that is readable by assistive technologies.",
        //"Fail_1": "Hyperlink is missing link text or an image with alt text."
    },
    // JCH - DONE
    "WCAG20_Fieldset_HasLegend": {
        0: "Fieldsets must have a single, non-empty legend as its label.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Fieldset does not have a Legend.",
        "Fail_2": "Fieldset has more than one Legend.",
        "Fail_3": "Fieldset has Legend but Legend is empty."
    },
    // JCH - DONE
    "RPT_Media_VideoObjectTrigger": {
        0: "For live media (streaming video with audio), provide captions for audio content.",
        "Pass_0": "Rule Passed",
        "Manual_1": "Live media detected, confirm captions are provided for audio content."
    },
    // JCH - DONE
    "RPT_Text_SensoryReference": {
        0: "Usage of sensory words must be meaningful to users who may not have sensory perception of size, sound, shape, or location.",
        "Pass_0": "Rule Passed",
        "Potential_1": "If this instance of the word(s) {0} is part of instructions for using page content, ensure the instructions can be understood by a user who may not have sensory perception of size, sound, shape, or location."
    },
    // JCH - DONE
    "RPT_Embed_AutoStart": {
        0: "Provide mechanisms to pause or stop audio play and to control the volume.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Audio detected ensure that there are mechanisms to pause or stop audio play and to control the volume are provided."
    },
    // JCH - DONE
    "RPT_Style_HinderFocus1": {
        0: "Ensure that, with the border or outline, the keyboard focus indicator is visible to users.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Default border or outline keyboard focus indicator is modified by CSS so ensure that indicator is visible."
    },
    // JCH - DONE
    "WCAG20_Elem_Lang_Valid": {
        0: "Lang and/or xml:lang attribute on any element on the page to identify change in language must conform to BCP: 47.",
        "Pass_0": "Rule Passed",
        "Fail_1": "The lang and/or xml:lang attribute on any element on the page to identify change in language does not conform to BCP: 47."
    },
    // JCH - DONE
    "WCAG20_Img_LinkTextNotRedundant": {
        0: "Image alt text must not be redundant with adjacent link text.",
        "Pass_0": "Rule Passed",
        "Fail_1": "ANCHOR element image alt text is redundant with link text.",
        "Fail_2": "ANCHOR element link text before adjacent ANCHOR element has redundant image alt text.",
        "Fail_3": "ANCHOR element link text after adjacent ANCHOR element has redundant image alt text."
    },
    // JCH - DONE
    "RPT_Style_ExternalStyleSheet": {
        0: "Check external style sheets to ensure that CSS is not used to add images that convey important information in the content.",
        "Pass_0": "Rule Passed",
        "Potential_1": "External style sheets detected ensure that CSS does not add images that convey important information in the content."
    },
    // JCH - DONE
    "RPT_Header_Trigger": {
        0: "Check heading text to ensure that they correctly describe the subject of the web page sections.", 
        "Pass_0": "Rule Passed",
        "Potential_1": " Check heading text to ensure that they correctly describe the subject of the web page sections."
    },
    // JCH - DONE
    "RPT_Script_OnclickHTML2": {
        0: "Do not use scripts to emulate links.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Possible onclick events used in script to emulate a link."
    },
    // JCH - DONE
    "WCAG20_Table_CapSummRedundant": {
        0: "The summary must not duplicate the caption.",
        "Pass_0": "Rule Passed",
        "Fail_1": "The summary duplicates the caption."
    },
    // JCH - DONE
    "WCAG20_Input_LabelBefore": {
        0: "Text inputs and select elements must have a label before the input control.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Text input nested in label so label is not before the text input control.",
        "Fail_2": "Label is after the text input control."
    },
    // JCH - DONE
    "WCAG20_Input_LabelAfter": {
        0: "Check boxes and radio buttons must have a label after the input control.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Check box or radio button nested in label so label is not after the input control.",
        "Fail_2": "Label is before the Check box or radio button input control."
    },
    // JCH - DONE
    "WCAG20_Embed_HasNoEmbed": {
        0: "EMBED elements should be immediately followed by a non-embeded element.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Possibly an EMBED element is not immediately followed by a non-embeded element."
    },
    // JCH - DONE
    "WCAG20_Table_Scope_Valid": {
        0: "Valid values for scope attribute are row, col, rowgroup, or colgroup.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Value provided is invalid for the scope attribute."
    },
    // JCH - DONE
    "WCAG20_Img_TitleEmptyWhenAltNull": {
        0: "When image alt text is empty, the title must also be empty.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Image alt text is empty, but the title is not empty."
    },
    // JCH - DONE
    "WCAG20_Input_InFieldSet": {
        0: "Check that groups of logically related input elements are contained within a FIELDSET element.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Possibly groups of logically related INPUT elements are not contained within a FIELDSET element."
    },
    // JCH - DONE
    "WCAG20_Input_RadioChkInFieldSet": {
        0: "Use grouping roles or elements to identify related form controls.",
        "Pass_LoneNogroup": "{0} grouping not required for a control of this type",
        "Pass_Grouped": "{0} input is grouped with other related controls with the same name",
        "Pass_RadioNoName": "Radio input is not grouped, but passes because it has no name to group with other radio inputs",
        "Fail_ControlNameMismatch": "{0} input found that has the same name, \"{2}\" as a {1} input",
        "Potential_LoneCheckbox": "Checkbox input does not share a name with other checkboxes in this form and is not grouped. Check to ensure that the checkbox is not related to the other checkboxes. If it is, it should be grouped with the other checkboxes.",
        "Potential_UnnamedCheckbox": "Checkbox input does not have a name and is not in a group with other unnamed checkboxes. Check to ensure that the checkbox is not related to the other checkboxes. If it is, it should be grouped with the other checkboxes.",
        "Fail_NotGroupedOtherGrouped": "{0} input is not in the group with another {0} with the name \"{1}\"",
        "Fail_NotGroupedOtherNotGrouped": "{0} input and others with the name \"{1}\" are not grouped together",
        "Fail_NotSameGroup": "{0} input is in a different group than another {0} with the name \"{1}\""
    },
    // JCH - DONE
    "WCAG20_Select_NoChangeAction": {
        0: "Check that no action gets performed or change of context occur when a component receives focus (including keyboard focus).", 
        "Pass_0": "Rule Passed",
        "Potential_1": "It appears that actions get performed or changes of context occur when a component receives focus (including keyboard focus)."
    },
    // JCH - DONE
    "WCAG20_Input_HasOnchange": {
        0: "If changing an input's value changes the context, check that an explanation of the change is provided in advance to the user.",
        "Pass_0": "Rule Passed",
        "Potential_1": "If changing an input's value changes the context, check that an explanation of the change is provided in advance to the user."
    },
    // JCH - DONE
    "RPT_Embed_HasAlt": {
        0: "Provide alternative content for EMBED elements.",
        "Pass_0": "Rule Passed",
        "Potential_1": "EMBED element is possibly missing alternative content."
    },
    // JCH - DONE
    "Valerie_Noembed_HasContent": {
        0: "Provide descriptive text in NOEMBED elements.",
        "Pass_0": "Rule Passed",
        "Potential_1": "NOEMBED element possibly missing descriptive text."
    },
    // JCH - DONE
    "Valerie_Caption_HasContent": {
        0: "Provide a table caption with descriptive text.",
        "Pass_0": "Rule Passed",
        "Fail_1": "TABLE is missing caption with descriptive text."
    },
    // JCH - DONE
    "Valerie_Caption_InTable": {
        0: "CAPTION element must be nested inside of a TABLE element.",
        "Pass_0": "Rule Passed",
        "Fail_1": "CAPTION element for the TABLE is not nested inside the TABLE element."
    },
    // JCH - DONE
    "Valerie_Label_HasContent": {
        0: "A `<label>` element must have non-empty descriptive text that identifies the purpose of the interactive component",
        "Pass_Regular": "`<label>` element has accessible name with inner content",
        "Pass_AriaLabel": "`<label>` element has accessible name via `aria-label`",
        "Pass_LabelledBy": "`<label>` element has accessible name via `aria-labelledby`",
        "Fail_1": "The `<label>` element does not have descriptive text that identifies the expected input"
        //"Pass_Regular": "LABEL element has accessible name with inner content",
        //"Pass_AriaLabel": "LABEL element has accessible name via 'aria-label'",
        //"Pass_LabelledBy": "LABEL element has accessible name via 'aria-labelledby'",
        //"Fail_1": "LABEL element is missing descriptive text that identifies the expected input."
    },
    // JCH - DONE
    "Valerie_Elem_DirValid": {
        0: "Valid values for the 'dir' attribute are 'ltr', 'rtl' or 'auto'.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Invalid value used for the 'dir' attribute."
    },
    // JCH - DONE
    "Valerie_Frame_SrcHtml": {
        0: "Frames that contain content that is not HTML may not be accessible.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Frame may contain content that is not HTML."
    },
    // JCH - DONE
    "Valerie_Table_DataCellRelationships": {
        0: "For a complex data table, TH and TD elements must be related via scope or headers.",
        "Pass_0": "Rule Passed",
        "Fail_1": "TH or TD element is not related via scope or header for a complex table."
    },
    // JCH - DONE
    "RPT_Table_LayoutTrigger": {
        0: "Avoid using tables to format text documents in columns unless the table can be linearized.",
        "Pass_0": "Rule Passed",
        "Potential_1": "TABLE possibly being used to format text documents in columns and the table is not linearized."
    },
    // JCH - DONE
    "RPT_Table_DataHeadingsAria": {
        0: "For a data TABLE (i.e., the TABLE tag does not contain a WAI-ARIA 'presentation' role or 'none' role), identify headers for the table rows and columns.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Data TABLE does not contain at least one header row or header column."
    },
    // JCH - DONE
    "WCAG20_Label_RefValid": {
        0: "INPUT LABEL references must be valid",
        "Pass_0": "Rule Passed",
        "Fail_1": "The id \"{0}\" referenced by the 'for' attribute of a LABEL element is not a valid FORM INPUT element or an element with id \"{0}\" is either null or does not exist."
    },
    // JCH - DONE
    "WCAG20_Elem_UniqueAccessKey": {
        0: "'Accesskey' attribute values must be unique on the page.",
        "Pass_0": "Rule Passed",
        "Fail_1": "'Accesskey' attribute values are not unique on the page."
    },
    // JCH - DONE
    "WCAG20_Script_FocusBlurs": {
        0: "Do not use scripting to remove focus from content that normally receives focus.", 
        "Pass_0": "Rule Passed",
        "Potential_1": "Possible use of scripting to remove focus from content that normally receives focus."
    },
    // JCH - DONE
    "HAAC_Img_UsemapAlt": {
        0: "An image map and each AREA element in an image map must have a text alternative.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Image map or AREA element in an image map is missing a text alternative."
    },
    // JCH - DONE
    "WCAG20_Text_Emoticons": {
        0: "Provide text alternatives for emoticons.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Emoticons possibly missing text alternatives."
    },
    // JCH - DONE
    "WCAG20_Style_BeforeAfter": {
        0: "Do not use ::before and ::after pseudo-elements to insert non-decorative content.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Possible use of ::before and ::after pseudo-elements to insert non-decorative content."
    },
    // JCH - DONE
    "WCAG20_Text_LetterSpacing": {
        0: "Use CSS 'letter-spacing' to control spacing within a word.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Possibly not using CSS 'letter-spacing' to control spacing within a word."
    },
    // JCH - DONE
    "Rpt_Aria_ValidRole": {
        0: "Elements that use 'role' must reference a valid WAI-ARIA role.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Element role '{0}' is not a valid WAI-ARIA role."
    },
    // JCH - DONE
    "Rpt_Aria_ValidPropertyValue": {
        0: "WAI-ARIA values must be valid",
        "Pass_0": "Rule Passed",
        "Fail_1": "The value {0} specified for WAI-ARIA property {1} on element {2} is not valid. See rule help for remediation guidance."
    },
    // JCH - DONE
    "Rpt_Aria_ValidIdRef": {
        0: "Id references used in WAI-ARIA properties must be valid",
        "Pass_0": "Rule Passed",
        "Fail_1": "The id {0} specified for WAI-ARIA property {1} on element {2} is not valid. See rule help for remediation guidance."
    },
    // JCH - DONE
    "Rpt_Aria_RequiredProperties": {
        0: "When using a WAI-ARIA role, required properties must be defined",
        "Pass_0": "Rule Passed",
        "Fail_1": "An element with WAI-ARIA role {0} is missing the following required WAI-ARIA properties: {1}. See rule help for remediation guidance."
    },
    // JCH - DONE
    "Rpt_Aria_EmptyPropertyValue": {
        0: "When specifying a required WAI-ARIA attribute, the value must be non-empty",
        "Pass_0": "Rule Passed",
        "Fail_1": "The WAI-ARIA property {0} used by the element is missing the required value for the property. See rule help for remediation guidance."
    },
    // JCH - DONE
    "Rpt_Aria_ValidProperty": {
        0: "When specifying a required WAI-ARIA attribute, it must be a valid property for the role of the element.",
        "Pass_0": "Rule Passed",
        "Fail_1": "The attribute {0} referenced by the element {1} is not a valid WAI-ARIA State or Property."
    },
    // JCH - DONE
    "Rpt_Aria_InvalidTabindexForActivedescendant": {
        0: "'Tabindex' attribute values must be appropriate when using aria-activedescendant",
        "Pass_0": "Rule Passed",
        "Fail_1": "The {0} element with WAI-ARIA property 'aria-activedescendant' set to {1} does not have 'tabindex' attribute set to 0 or -1. See rule help for remediation guidance."
    },
    // JCH - DONE
    "Rpt_Aria_MissingFocusableChild": {
        0: "Tabindex values must be appropriate when using aria-activedescendant",
        "Pass_0": "Rule Passed",
        "Fail_1": "The descendent {0} element with WAI-ARIA role {1} does not have tabindex attribute set to 0 or -1 to be accessible by keyboard. See rule help for remediation guidance."
    },
    // JCH - DONE
    "Rpt_Aria_MissingKeyboardHandler": {
        0: "Keyboard handlers must be provided",
        "Pass_0": "Rule Passed",
        "Potential_1": "The {0} element with WAI-ARIA role {1} might not be keyboard accessible. See rule help for remediation guidance."
    },
    // JCH - DONE
    "WCAG20_Img_PresentationImgHasNonNullAlt": {
        0: "An Image with presentation role or with a role of none must have a null alt attribute.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Image with presentation role or with a role of none does not have null alt attribute."
    },
    // JCH - DONE
    "Rpt_Aria_MultipleSearchLandmarks": {
        0: "Multiple WAI-ARIA 'search' landmarks must have unique labels specified with 'aria-label' or 'aria-labelledby'.",
        "Pass_0": "Rule Passed",
        "Fail_1": "WAI-ARIA 'search' region does not have unique label specified with 'aria-label' or 'aria-labelledby'."
    },
    // JCH - DONE
    "Rpt_Aria_MultipleApplicationLandmarks": {
        0: "Multiple elements with WAI-ARIA application roles must have unique labels specified with 'aria-label' or 'aria-labelledby'.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Element with WAI-ARIA application role does not have unique label specified with 'aria-label' or 'aria-labelledby'."
    },
    // JCH - DONE
    "Rpt_Aria_ApplicationLandmarkLabel": {
        0: "An element with an WAI-ARIA 'application' role must have a label specified with aria-label or aria-labelledby.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Element with an WAI-ARIA 'application' role does not have a label specified with aria-label or aria-labelledby."
    },
    // JCH - DONE
    "Rpt_Aria_MultipleDocumentRoles": {
        0: "Multiple elements with the WAI-ARIA role 'document' do not have unique labels ({0}) specified by 'aria-label' or 'aria-labelledby'.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Element with the WAI-ARIA role 'document' does not have unique label specified with 'aria-label' or 'aria-labelledby'."
    },
    // JCH - DONE
    "WCAG20_Label_TargetInvisible": {
        0: "Do not label hidden INPUT elements (type=hidden).",
        "Pass_0": "Rule Passed",
        "Potential_1": "Hidden INPUT element (type=hidden) is possibly labelled."
    },
    // JCH - DONE
    "HAAC_Video_HasNoTrack": {
        0: "HTML5 Video element must contain a track element with kind=\"captions\" in the language of the video.",
        "Pass_0": "Rule Passed",
        "Fail_1": "HTML5 Video element is missing Track with an attribute kind=\"caption\" in the language of the video."
    },
    // JCH - DONE
    "HAAC_Audio_Video_Trigger": {
        0: "HTML5 audio and video elements must have keyboard accessible controls.",
        "Pass_0": "Rule Passed",
        "Manual_1": "Confirm HTML5 audio and video elements have keyboard accessible controls."
    },
    // JCH - DONE
    "HAAC_Input_HasRequired": {
        0: "If your application must be accessible in Internet Explorer 8, use aria-required instead of the HTML5 required property.",
        "Pass_0": "Rule Passed",
        "Potential_1": "If your application must be accessible in Internet Explorer 8, use aria-required instead of the HTML5 required property."
    },
    // JCH - DONE
    "HAAC_Aria_ImgAlt": {
        0: "The WAI-ARIA widget with IMG role must have a nonempty alternate text or a label.",
        "Pass_0": "Rule Passed",
        "Fail_1": "WAI-ARIA widget with IMG role missing nonempty alt attribute.",
        "Fail_2": "WAI-ARIA widget with IMG role missing nonempty aria-label or aria-labelledby.",
        "Fail_3": "WAI-ARIA widget with IMG role missing nonempty title attribute."
    },
    // JCH - DONE
    "HAAC_BackgroundImg_HasTextOrTitle": {
        0: "Verify that important background image information is conveyed when the system is in high contrast mode.",
        "Pass_0": "Rule Passed",
        "Manual_1": "Confirm that important background image information is conveyed when the system is available as text in high contrast mode."
    },
    // JCH - DONE
    "HAAC_Accesskey_NeedLabel": {
        0: "The 'accesskey' attribute assigned on an HTML element must have an associated label.",
        "Pass_0": "Rule Passed",
        "Potential_1": "The 'accesskey' assigned on an HTML element does not have an associated label."
    },
    // JCH - DONE
    "HAAC_Aria_Or_HTML5_Attr": {
        0: "Do not use the HTML5 attribute and the associated WAI-ARIA attribute such that it creates a conflict on any one input element.",
        "Pass_0": "Rule Passed",
        "Fail_1": "HTML 5 attribute is in conflict with the associated WAI-ARIA attribute in the element, use only one."
    },
    // JCH - DONE
    "HAAC_Canvas": {
        0: "Check accessibility of the CANVAS element.",
        "Pass_0": "Rule Passed",
        "Manual_1": "The CANVAS element needs manual checks to confirm if it is accessible."
    },
    // JCH - DONE
    "HAAC_Figure_label": {
        0: "The FIGURE element must have an associated label.",
        "Pass_0": "Rule Passed",
        "Fail_1": "The FIGURE element is missing an associated label."
    },
    // JCH - DONE
    "HAAC_Input_Placeholder": {
        0: "Do not use the HTML 5 placeholder as the only visible label.",
        "Pass_0": "Rule Passed",
        "Potential_1": "HTML 5 placeholder is the only visible label.",
        "Potential_2": "Additional visible label referenced by aria-labelledby is not valid."
    },
    // JCH - DONE
    "HAAC_Aria_Native_Host_Sematics": {
        0: "The WAI-ARIA role(s) and/or attribute(s) must be valid for the relevant element.",
        "Pass_0": "Rule Passed",
        "Fail_1": "The WAI-ARIA role or attribute {0} is not valid for the element {1}. See rule help for guidance."
    },
    // JCH - DONE
    "RPT_Form_ChangeEmpty": {
        0: "Do not automatically submit a form without warning the user.",
        "Pass_0": "Rule Passed",
        "Potential_1": "'Onchange' attribute is missing so it is possible that the form is submitted without warning the user."
    },
    // JCH - DONE
    "IBMA_Color_Contrast_WCAG2AA": {
        0: "Contrast of foreground and background must be sufficient to meet WCAG AA requirements.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Contrast of {0} with its background is not sufficient to meet WCAG AA minimum requirements for text of size {1}px and weight of {2}."
    },
    // JCH - DONE
    "IBMA_Color_Contrast_WCAG2AA_PV": {
        0: "Contrast of foreground and background must be sufficient to meet WCAG AA requirements.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Due to the use of image layers between the foreground and background or color gradient the calculated contrast of {0} may not be sufficient to meet WCAG AA requirements for text of size {1}px and weight of {2}."
    },
    // JCH - DONE
    "WCAG20_Body_FirstASkips_Native_Host_Sematics": {
        0: "The page must provide a link to skip directly to the main page content as the first link on each page or use WAI-ARIA landmarks.",
        "Pass_0": "Rule Passed",
        "Fail_1": "The page is missing a the WAI-ARIA MAIN landmark or a link to skip directly to the main page content as the first link on each page."
    },
    // JCH - DONE
    "WCAG20_Body_FirstAContainsSkipText_Native_Host_Sematics": {
        0: "Check that the description of the first hyperlink communicates that it links to the main content.", 
        "Pass_0": "Rule Passed",
        "Potential_1": "The description of the first hyperlink does not communicate that it links to the main content."
    },
    // JCH - DONE
    "Rpt_Aria_RequiredChildren_Native_Host_Sematics": {
        0: "An element with WAI-ARIA 'role' must contain required children.",
        "Pass_0": "Rule Passed",
        "Potential_1": "An element with WAI-ARIA 'role' {0} does not contain or own at least one child element with each of the following WAI-ARIA roles: {1}. See rule help for remediation guidance."
    },
    // JCH - DONE
    "Rpt_Aria_RequiredParent_Native_Host_Sematics": {
        0: "An element with WAI-ARIA role must be contained within a valid element.",
        "Pass_0": "Rule Passed",
        "Fail_1": "An element with WAI-ARIA role {0} is not contained in or owned by an element with one of the following WAI-ARIA roles: {1}. See rule help for remediation guidance."
    },
    // JCH - DONE
    "Rpt_Aria_EventHandlerMissingRole_Native_Host_Sematics": {
        0: "WAI-ARIA roles must be valid",
        "Pass_0": "Rule Passed",
        "Fail_1": "The {0} element with {1} does not have a valid WAI-ARIA role specified. See rule help for remediation guidance."
    },
    // JCH - DONE
    "Rpt_Aria_WidgetLabels_Implicit": {
        0: "An interactive element/widget must have an accessible name.",
        "Pass_0": "Rule Passed",
        "Fail_1": "An interactive element/widget does not have an accessible name."
    },
    // JCH - DONE
    "Rpt_Aria_OrphanedContent_Native_Host_Sematics": {
        0: "All content must reside within a HTML5 Sectioning element, WAI-ARIA landmark or labelled region role.", 
        "Pass_0": "Rule Passed",
        "Fail_1": "Orphan content found that does not reside within a WAI-ARIA landmark or labelled region role."
    },
    // JCH - DONE
    "Rpt_Aria_RegionLabel_Implicit": {
        0: "Elements containing a 'region' role must be labeled with an 'aria-label' or 'aria-labelledby'.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Section element with an implicit 'region' role is not labeled with an 'aria-label' or 'aria-labelledby'.",
        "Fail_2": "Element containing a 'region' role is not labeled with an 'aria-label' or 'aria-labelledby'."
    },
    // JCH - DONE
    "Rpt_Aria_MultipleMainsVisibleLabel_Implicit": {
        0: "Prefer 'aria-labelledby' over 'aria-label' on a 'main' landmark if a visible label, such as a  heading, is present.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple 'main' sections or landmarks are missing unique visible labels."
    },
    // JCH - DONE
    "Rpt_Aria_MultipleBannerLandmarks_Implicit": {
        0: "Multiple SECTION headings or 'banner' landmarks must have unique labels specified with 'aria-label' or 'aria-labelledby'.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple SECTION headings or 'banner' landmarks are missing unique labels."
    },
    // JCH - DONE
    "Rpt_Aria_MultipleComplementaryLandmarks_Implicit": {
        0: "Multiple ASIDE sections or 'complementary' landmarks must have unique labels specified with 'aria-label' or 'aria-labelledby'.", 
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple ‘aside’ sections or 'complementary' landmarks are missing unique labels."
    },
    // JCH - DONE
    "Rpt_Aria_MultipleContentinfoLandmarks_Implicit": {
        0: "Multiple FOOTER section or 'contentinfo' landmarks must have unique labels specified with aria-label or aria-labelledby.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple FOOTER section or 'contentinfo' landmarks are missing unique labels."
    },
    // JCH - DONE
    "Rpt_Aria_MultipleFormLandmarks_Implicit": {
        0: "Multiple 'form' section or landmarks must have unique labels specified with 'aria-label' or 'aria-labelledby'.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple 'form' section or landmarks are missing unique labels."
    },
    // JCH - DONE
    "Rpt_Aria_MultipleNavigationLandmarks_Implicit": {
        0: "Multiple 'navigation' sections or landmarks must have unique labels specified with 'aria-label' or 'aria-labelledby'.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple 'navigation' sections or landmarks are missing unique labels."
    },
    // JCH - DONE
    "Rpt_Aria_ComplementaryLandmarkLabel_Implicit": {
        0: "Prefer 'aria-labelledby' over 'aria-label' on a 'complementary' landmark if a visible label, such as a  heading, is present.",
        "Pass_0": "Rule Passed",
        "Fail_1": "'complementary' landmark is missing a visible label."
    },
    // JCH - DONE
    "Rpt_Aria_MultipleArticleRoles_Implicit": {
        0: "Multiple ARTICLE sections must have unique label specified by 'aria-label' or 'aria-labelledby'.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple ARTICLE sections are missing unique labels specified."
    },
    // JCH - DONE
    "Rpt_Aria_ArticleRoleLabel_Implicit": {
        0: "HTML5 ARTICLE sectioning element or element having a WAI-ARIA 'article' role must have a label specified with 'aria-label' or 'aria-labelledby'.", 
        "Pass_0": "Rule Passed",
        "Fail_1": "HTML5 ARTICLE sectioning element or element having a WAI-ARIA 'article' role does not have a label specified with 'aria-label' or 'aria-labelledby'."
    },
    // JCH - DONE
    "Rpt_Aria_MultipleGroupRoles_Implicit": {
        0: "Multiple elements with the WAI-ARIA role 'group' must not use the same label.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple elements with the WAI-ARIA role 'group' are using the same label ({0}) specified by aria-label or aria-labelledby."
    },
    // JCH - DONE
    "Rpt_Aria_GroupRoleLabel_Implicit": {
        0: "Elements with WAI-ARIA grouping roles must provide an 'aria-labelledby' or 'aria-label'.",
        "Pass_0": "Rule Passed",
        "Fail_1": "The {0} element with a WAI-ARIA grouping role {1} does not have the required label specified by 'aria-label' or 'aria-labelledby'."
    },
    // JCH - DONE
    "Rpt_Aria_MultipleContentinfoInSiblingSet_Implicit": {
        0: "Only one FOOTER or 'contentinfo' node is permitted in a set of siblings.", 
        "Pass_0": "Rule Passed",
        "Fail_1": "There is more than one FOOTER element or 'contentinfo' node in a set of siblings."
    },
    // JCH - DONE
    "Rpt_Aria_OneBannerInSiblingSet_Implicit": {
        0: "More than one HEADER element or 'banner' role in a set of sibling elements is not permitted.", 
        "Pass_0": "Rule Passed",
        "Fail_1": "There is more than one HEADER element or 'banner' landmark in a set of sibling elements."
    },
    // JCH - DONE
    "Rpt_Aria_ContentinfoWithNoMain_Implicit": {
        0: "A FOOTER element or element with WAI-ARIA 'contentinfo' role is not permitted without the presence of a 'main' role.", 
        "Pass_0": "Rule Passed",
        "Fail_1": "A FOOTER element or 'contentinfo' role is present, but main role is missing."
    },
    // JCH - DONE
    "Rpt_Aria_ComplementaryRequiredLabel_Implicit": {
        0: "ASIDE elements or elements having a WAI-ARIA 'complementary' role must have a label specified with 'aria-label' or 'aria-labelledby'.", 
        "Pass_0": "Rule Passed",
        "Fail_1": "ASIDE element or element having a WAI-ARIA 'complementary' role is missing a label specified with 'aria-label' or 'aria-labelledby'."
    },
    // JCH - DONE
    "Rpt_Aria_MultipleRegionsUniqueLabel_Implicit": {
        0: "Multiple SECTION elements or elements having a WAI-ARIA 'region' role must have unique labels specified with 'aria-label' or 'aria-labelledby'.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple SECTION elements or elements having a WAI-ARIA 'region' role is missing unique labels specified with aria-label or aria-labelledby."
    },
    // JCH - DONE
    "IBMA_Focus_Tabbable": {
        0: "Widgets must have at least one tabbable element.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Widget with role of {0} is missing at least one tabbable element."
    },
    // JCH - DONE
    "IBMA_Focus_MultiTab": {
        0: "Certain widgets must have no more than one tabbable element.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Widget with role of {0} has more than one tabbable element."
    },
    // JCH - DONE
    "WCAG20_Table_SummaryAria3": {
        0: "Complex data tables should have a 'summary' or an 'aria-describedby' which references a description.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Complex data table may be missing a 'summary' or an 'aria-describedby' which references a description."
    },
    // JCH - DONE
    "RPT_Style_Trigger2": {
        0: "Ensure Windows high contrast mode is supported for CSS background images.",
        "Pass_0": "Rule Passed",
        "Manual_1": "Confirm Windows high contrast mode is supported for CSS background images."
    },
    // JCH - DONE
    "Rpt_Aria_MultipleMainsRequireLabel_Implicit_2": {
        0: "Each page should have no more than one main section or landmark.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Page has multiple main sections or landmarks is missing unique labels."
    },
    // JCH - DONE
    "HAAC_Media_DocumentTrigger2": {
        0: "Ensure file download mechanism does not cause keyboard trap.",
        "Pass_0": "Rule Passed",
        "Manual_1": "Confirm file download mechanism does not cause keyboard trap."
    },
    // JCH - DONE
    "HAAC_Aria_ErrorMessage": {
        0: "Custom error message when triggered must be appropriately exposed.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Error message doesn't exist due to invalid reference ID.",
        "Fail_2": "Error message is not visible."
    },
    // JCH - DONE
    "HAAC_List_Group_ListItem": {
        0: "List widget using group role must limit children to listitem elements.",
        "Pass_0": "Rule Passed",
        "Fail_1": "List widget using group role has children that are not listitem elements."
    },
    // JCH - DONE
    "HAAC_ActiveDescendantCheck": {
        0: "Active descendant of composite widget with DOM focus must be valid.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Attribute 'aria-activedescendant' is empty.",
        "Fail_2": "Attribute 'aria-activedescendant' references a hidden node.",
        "Fail_3": "Element is not a combobox, and the referenced active-descendant is not a descendant and not owned by the element that referenced it.",
        "Fail_4": "Element is a combobox, and the referenced active-descendant is not controlled by this widget."
    },
    // JCH - DONE
    "HAAC_Application_Role_Text": {
        0: "Non-decorative static text or images within \"application\" role must receive accessible focus.",
        "Pass_0": "Rule Passed",
        "Potential_1": "Non-decorative static text or images within \"application\" role is not inside an 'article' or 'document' role and may not be accessible."
    },
    // JCH - DONE
    "Rpt_Aria_MultipleToolbarUniqueLabel": {
        0: "Multiple toolbar widgets on a page must have unique labels specified.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple toolbar widgets on a page are missing unique labels."
    },
    // JCH - DONE
    "HAAC_Combobox_ARIA_11_Guideline": {
        0: "Combobox widget must be coded to WAI-ARIA 1.1 Authoring Practices",
        "Pass_0": "Rule Passed",
        "Manual_1": "Confirm combobox widget is coded to WAI-ARIA 1.1 Authoring Practices"
    },
    // JCH - DONE
    "HAAC_Combobox_Must_Have_Text_Input": {
        0: "The combobox widget must have a valid text input element.",
        "Pass_0": "Rule Passed",
        "Fail_1": "The text input element is not valid for the combobox role."
    },
    // JCH - DONE
    "HAAC_Combobox_DOM_Focus": {
        0: "Initial DOM focus should be on its textbox when a combobox receives focus.",
        "Pass_0": "Rule Passed",
        "Fail_1": "Initial DOM focus is not on its textbox when the combobox receives focus."
    },
    // JCH - DONE
    "HAAC_Combobox_Autocomplete": {
        0: "The aria-autocomplete attribute must only be on the combobox’s text input element.",
        "Pass_0": "Rule Passed",
        "Fail_1": "The aria-autocomplete attribute is not on the combobox’s text input element."
    },
    // JCH - DONE
    "HAAC_Combobox_Autocomplete_Invalid": {
        0: "The aria-autocomplete attribute’s value is not supported on the combobox text input element.",
        "Pass_0": "Rule Passed",
        "Fail_1": "The aria-autocomplete attribute’s value is invalid for the combobox text input element."
    },
    // JCH - DONE
    "HAAC_Combobox_Expanded": {
        0: "The expanded combobox must own or control a valid popup type.",
        "Pass_0": "Rule Passed",
        "Fail_1": "The expanded combobox does not own or control a valid popup type."
    },
    // JCH - DONE
    "HAAC_Combobox_Popup": {
        0: "The 'aria-haspopup' attribute's value must match the combobox’s popup type.",
        "Pass_0": "Rule Passed",
        "Fail_1": "The aria-haspopup attribute's value does not match the combobox’s popup type."
    },
    // JCH - DONE
    "WCAG21_Style_Viewport": {
        0: "Text must scale upto 200% without loss of content or functionality.", 
        "Pass_0": "Rule Passed",
        "Potential_1": "Possible failure to resize text due to viewport units used on text."
    },
    // JCH - DONE
    "WCAG21_Label_Accessible": {
        0: "Accessible name must match or contain the visible label text.", 
        "Pass_0": "Rule Passed",
        "Fail_1": "Accessible name does not match or contain the visible label text."
    },
    // JCH - DONE
    "WCAG21_Input_Autocomplete": {
        0: "The autocomplete attributes token(s) used must be appropriate for the input form field.",
        "Pass_0": "Rule Passed",
        "Fail_1": "The autocomplete attributes token(s) used are not appropriate for the input form field."
    },
    // JCH - DONE
    "WCAG20_Input_VisibleLabel": {
        0: "The input component must have an associated visible label.", 
        "Pass_0": "Rule Passed",
        "Potential_1": "The input component is missing an associated visible label."
    }
}
export { a11yNls }