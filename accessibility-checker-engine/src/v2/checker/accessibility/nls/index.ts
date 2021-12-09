// No {tokens} in passive messages, such as 0: "a passive message..."
// No back-ticks used in messages here in .ts file type, use <, ", '
// Changes in messages usually require corresponding change in test cases
//
let a11yNls = {
    // AU - DONE
    "landmark_name_unique": {
        0: "Multiple landmarks of the same role should have a unique 'aria-labelledby' or 'aria-label' or be nested in a different parent",
        "Pass_0": "Multiple \"{0}\" landmarks with the same parent are disambiguated by unique 'aria-label' or 'aria-labelledby'",
        // Fail_0 occurs when we have: not disabmiguted by same parent, labels are blank: "" == "", or same aria-label/labelledby
        "Fail_0": "Multiple \"{0}\" landmarks are not disambiguated, because they have the same \"{1}\" label" 

    },
    // JCH - DONE
    "RPT_List_Misuse": {
        0: "List elements should only be used for lists of related items",
        "Pass_0": "Rule Passed",
        "Potential_1": "List element is missing or improperly structured"
    },
    // JCH - DONE
    "RPT_Marquee_Trigger": {
        0: "The <marquee> element is obsolete and should not be used",
        "Passed_0": "Rule Passed",
        "Fail_1": "Scrolling content found that uses the obsolete <marquee> element"
    },
    // JCH - DONE
    "RPT_Headers_FewWords": {
        0: "Heading elements must not be used for presentation",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify that the heading element is a genuine heading"
    },
    // JCH - DONE
    "WCAG20_Input_ExplicitLabelImage": {
        0: "The <input> element of type \"image\" should have a text alternative",
        "Pass_0": "Image button provides alternative text using the 'alt' attribute",
        "Pass_1": "Image button provides alternative text using a ARIA label",
        "Pass_2": "Image button provides alternative text using the 'title' attribute",
        "Fail": "The <input> element of type \"image\" has no text alternative"
    },
    // JCH - DONE
    "RPT_Img_UsemapValid": {
        0: "Server-side image map hot-spots must have duplicate text links",
        "Pass_0": "Rule Passed",
        "Potential_1": "Server-side image map hot-spots do not have duplicate text links"
    },
    // JCH - DONE
    "WCAG20_Object_HasText": {
        0: "<object> elements must have a text alternative for the content rendered by the object",
        "Pass_0": "Rule Passed",
        "Fail_1": "An <object> element does not have a text alternative"
    },
    // JCH - DONE
    "WCAG20_Applet_HasAlt": {
        0: "<applet> elements must provide an 'alt' attribute and an alternative description",
        "Pass_0": "Rule Passed",
        "Fail_1": "An <applet> element does not have an 'alt' attribute that provides a short text alternative",
        "Fail_2": "The 'alt' attribute value for an <applet> element duplicates the 'code' attribute",
        "Fail_3": "An <applet> element provides alternative text, but does not provide inner content"
    },
    // JCH - DONE
    "RPT_Media_AudioTrigger": {
        0: "Audio information should also be available in text form",
        "Pass_0": "Rule Passed",
        "Manual_1": "Provide transcripts for audio files"
    },
    // JCH - DONE
    "RPT_Blockquote_HasCite": {
        0: "Use <blockquote> only for quotations, not indentation",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify that <blockquote> is used only for quotations, not indentation"
    },
    // JCH - DONE
    "RPT_Meta_Refresh": {
        0: "Pages should not refresh automatically",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify page is not being caused to refresh automatically"
    },
    // JCH - DONE
    "WCAG20_Frame_HasTitle": {
        0: "Inline frames must have a unique, non-empty 'title' attribute",
        "Pass_0": "Rule Passed",
        "Fail_1": "Inline frame does not have a 'title' attribute"
    },
    // JCH - DONE
    "WCAG20_Input_ExplicitLabel": {
        0: "Each form control must have an associated label",
        "Pass_0": "Rule Passed",
        "Fail_1": "Form control element <{0}> has no associated label",
        "Fail_2": "Form control with \"{0}\" role has no associated label"
    },
    // JCH - DONE
    "RPT_Media_AltBrief": {
        0: "Alternative text in 'alt' attribute should be brief (<150 characters)",
        "Pass_0": "Rule Passed",
        "Potential_1": "Text alternative is more than 150 characters"
    },
    // JCH - DONE
    "WCAG20_A_TargetAndText": {
        0: "Users should be warned in advance if their input action will open a new window or otherwise change their context",
        "Pass_0": "Rule Passed",
        "Potential_1": "Inform the user when their input action will open a new window or otherwise change their context"
    },
    // JCH - DONE
    "WCAG20_Area_HasAlt": {
        0: "<area> elements in an image map must have a text alternative",
        "Pass_0": "Rule Passed",
        "Fail_1": "<area> element in an image map has no text alternative"
    },
    // JCH - DONE
    "RPT_Media_ImgColorUsage": {
        0: "Do not use color as the only means to convey information, provide an additional non-color cue",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify color is not the only means to convey information"
    },
    // JCH - DONE
    "WCAG20_Meta_RedirectZero": {
        0: "Page should not automatically refresh without warning or option to turn it off or adjust the time limit", 
        "Pass_0": "Rule Passed",
        "Fail_1": "Check page does not automatically refresh without warning or options"
    },
    // JCH - DONE
    "RPT_Elem_Deprecated": {
        0: "Avoid use of obsolete language features if possible",
        "Pass_0": "Rule Passed",
        "Potential_1": "Obsolete language features are being used"
    },
    // JCH - DONE
    "RPT_Blockquote_WrapsTextQuote": {
        0: "Quotations should be marked with <q> or <blockquote> elements",
        "Pass_0": "Rule Passed",
        "Potential_1": "If the following text is a quotation, mark it as a <q> or <blockquote> element: {0}"
    },
    // JCH - DONE
    "RPT_Elem_EventMouseAndKey": {
        0: "All interactive content with mouse event handlers must have equivalent keyboard access",
        "Pass_0": "Rule Passed",
        "Manual_1": "Confirm the <{0}> element with mouse event handler(s) '{1}' has a corresponding keyboard handler(s)"
    },
    // JCH - DONE
    "WCAG20_Doc_HasTitle": {
        0: "The page should have a title that correctly identifies the subject of the page",
        "Pass_0": "Rule Passed",
        "Fail_1": "Missing <head> element so there can be no <title> element present",
        "Fail_2": "Missing <title> element in <head> element",
        "Fail_3": "The <title> element is empty (no innerHTML)"
    },
    // JCH - DONE
    "RPT_Block_ShouldBeHeading": {
        0: "Heading text must use a heading element", 
        "Pass_0": "Rule Passed",
        "Potential_1": "Check if this text should be marked up as a heading: {0}"
    },
    // JCH - DONE
    "WCAG20_Form_HasSubmit": {
        0: "A <form> element should have a submit button or an image button",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify the <form> element has a submit button or an image button"
    },
    // JCH - DONE
    "RPT_Elem_UniqueId": {
        0: "Element 'id' attribute values must be unique within a document",
        "Pass_0": "Rule Passed",
        "Fail_1": "The <{0}> element has the id \"{1}\" that is empty",
        "Fail_2": "The <{0}> element has the id \"{1}\" that is already in use"
    },
    // JCH - DONE
    "RPT_Font_ColorInForm": {
        0: "Combine color and descriptive markup to indicate required form fields",
        "Pass_0": "Rule Passed",
        "Potential_1": "Check color is not used as the only visual means to convey which fields are required"
    },
    // JCH - DONE
    "RPT_Label_UniqueFor": {
        0: "Form controls should have exactly one label",
        "Pass_0": "Rule Passed",
        "Fail_1": "Form control has more than one label"
    },
    // JCH - DONE
    "RPT_Img_AltCommonMisuse": {
        0: "'alt' attribute value must be a good inline replacement for the image",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify that the file name serves as a good inline replacement for the image"
    },
    // JCH - DONE
    "RPT_Img_LongDescription2": {
        0: " The 'longdesc' attribute must reference HTML content",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify that the file designated by the 'longdesc' attribute contains valid HTML content (file extension not recognized)"
    },
    // JCH - DONE
    "WCAG20_Img_HasAlt": {
        0: "Images must have an 'alt' attribute with a short text alternative if they convey meaning, or 'alt=\"\" if decorative",
        "Pass_0": "Rule Passed",
        "Fail_1": "Image 'alt' attribute value consists only of whitespace",
        "Fail_2": "Image does not have an 'alt' attribute short text alternative",
        "Fail_3": "Image does not have an 'alt' attribute and 'title' attribute value consists only of whitespace"
    },
    // JCH - DONE
    "RPT_Style_BackgroundImage": {
        0: "Images included by using CSS alone must not convey important information", 
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify the CSS background image does not convey important information"
    },
    // JCH - DONE
    "RPT_Pre_ASCIIArt": {
        0: "ASCII art must have a text alternative",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify that ASCII art has a text alternative"
    },
    // JCH - DONE
    "RPT_Media_VideoReferenceTrigger": {
        0: "Pre-recorded media should have an audio track that describes visual information",
        "Pass_0": "Rule Passed",
        "Manual_1": "Verify availability of a user-selectable audio track with description of visual content"
    },
    // JCH - DONE
    "RPT_Media_AudioVideoAltFilename": {
        0: "Audio or video on the page must have a short text alternative that describes the media content",
        "Pass_0": "Rule Passed",
        "Potential_1": "Filename used as label for embedded audio or video"
    },
    // JCH - DONE
    "RPT_Style_ColorSemantics1": {
        0: "Combine color and descriptive markup to convey information",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify color is not used as the only visual means of conveying information"
    },
    // JCH - DONE
    "WCAG20_Select_HasOptGroup": {
        0: "Groups of related options within a selection list should be grouped with <optgroup>", 
        "Pass_0": "Rule Passed",
        "Potential_1": "Group of related options may need <optgroup>"
    },
    // JCH - DONE
    "RPT_List_UseMarkup": {
        0: "Use proper HTML list elements to create lists", 
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify whether this is a list that should use HTML list elements"
    },
    // JCH - DONE
    "RPT_Script_OnclickHTML1": {
        0: "Scripts should not be used to emulate links",
        "Pass_0": "Rule Passed",
        "Potential_1": "Possible use of a script to emulate a link"
    },
    // JCH - DONE
    "WCAG20_Table_Structure": {
        0: "Table elements with 'role=\"presentation\" or 'role=\"none\" should not have structural elements or attributes",
        "Pass_0": "Rule Passed",
        "Fail_1": "The <{0}> element with \"presentation\" role or \"none\" role has structural element(s) and/or attribute(s) '{1}'"
    },
    // JCH - DONE
    "WCAG20_Img_AltTriggerNonDecorative": {
        0: "Convey information with text rather than images of text",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify that images of text are not used to convey information"
    },
    // JCH - DONE
    "WCAG20_Blink_AlwaysTrigger": {
        0: "Content that blinks persistently must not be used",
        "Pass_0": "Rule Passed",
        "Fail_1": "Content found that blinks persistently"
    },
    // JCH - DONE
    "RPT_Blink_CSSTrigger1": {
        0: "Do not use the \"blink\" value of the 'text-decoration' property for longer than five seconds",
        "Pass_0": "Rule Passed",
        "Potential_1": "Check the \"blink\" value of the CSS 'text-decoration' property is not used for more than than five seconds"
    },
    // JCH - DONE
    "RPT_Html_SkipNav": {
        0: "Provide a way to bypass blocks of content that are repeated on multiple Web pages",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify there is a way to bypass blocks of content that are repeated on multiple Web pages"
    },
    // JCH - DONE
    "RPT_Title_Valid": {
        0: "Page <title> should be a descriptive title, rather than a filename",
        "Pass_0": "Rule Passed",
        "Fail_1": "Page <title> is empty",
        "Potential_2": "Verify that using the filename as the page <title> value is descriptive"
    },
    // JCH - DONE
    "RPT_Header_HasContent": {
        0: "Heading elements must provide descriptive text",
        "Pass_0": "Rule Passed",
        "Fail_1": "Heading element has no descriptive content"
    },
    // JCH - DONE
    // JCH - 0: provides the general DAP message for the rule
    //       "Pass_i" ???
    //       "Fail_j" descriptive message for specific failure
    //       "Potential_k" descriptive message describing case when it is not a failure 
    //                     but needs other checking to confirm pass or
    "WCAG20_Html_HasLang": {
        0: "Page must identify the default language of the document with a 'lang' attribute", 
        "Pass_0": "Page language detected as \"{0}\"",
        "Fail_1": "Page detected as XHTML 1.0, but has neither 'lang' nor 'xml:lang' attributes",
        "Fail_2": "Page detected as XHTML, but does not have an 'xml:lang' attribute",
        "Fail_3": "Page detected as HTML, but does not have a 'lang' attribute",
        "Fail_4": "Page detected with 'lang' and 'xml:lang' attributes and primary languages do not match: \"{0}\", \"{1}\"",
        "Fail_5": "Page detected with 'lang' and 'xml:lang' attributes that do not match: \"{0}\", \"{1}\"",
        "Potential_5": "Page detected as XHTML 1.0 with only a 'lang' attribute. Confirm that page is only delivered via text/html mime type",
        "Potential_6": "Page detected as XHTML 1.0 with only an 'xml:lang' attribute. Confirm that page is only delivered via xml mime type"
    },
    // JCH - DONE
    "WCAG20_Form_TargetAndText": {
        0: "User should be informed in advance when interacting with content causes a change of context",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify that interacting with content will not open pop-up windows or change the active window without informing the user"
    },
    // JCH - DONE
    "WCAG20_A_HasText": {
        0: "Hyperlinks must have a text description of their purpose",
        "Pass_0": "Hyperlink has a description of its purpose",
        "Fail_1": "Hyperlink has no link text, label or image with a text alternative"
    },
    // JCH - DONE
    "WCAG20_Fieldset_HasLegend": {
        0: " <fieldset> elements must have a single, non-empty <legend> as a label",
        "Pass_0": "Rule Passed",
        "Fail_1": "<fieldset> element does not have a <legend>",
        "Fail_2": "<fieldset> element has more than one <legend>",
        "Fail_3": "<fieldset> element <legend> is empty"
    },
    // JCH - DONE
    "RPT_Media_VideoObjectTrigger": {
        0: "Live media (streaming video with audio) should have captions for audio content",
        "Pass_0": "Rule Passed",
        "Manual_1": "Verify captions are provided for live media (streaming video with audio)"
    },
    // JCH - DONE
    "RPT_Text_SensoryReference": {
        0: "Instructions must be meaningful without shape or location words",
        "Pass_0": "Rule Passed",
        "Potential_1": "If the word(s) '{0}' is part of instructions for using page content, check it is still understandable without this location or shape information"
    },
    // JCH - DONE
    "RPT_Embed_AutoStart": {
        0: "Mechanism must be available to pause or stop and control the volume of the audio that plays automatically",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify there is a mechanism to pause or stop and control the volume for the audio that plays automatically"
    },
    // JCH - DONE
    "RPT_Style_HinderFocus1": {
        0: "The keyboard focus indicator must be highly visible when default border or outline is modified by CSS",
        "Pass_0": "Rule Passed",
        "Potential_1": "Check the keyboard focus indicator is highly visible when using CSS elements for border or outline"
    },
    // JCH - DONE
    "WCAG20_Elem_Lang_Valid": {
        0: "The language of content must be valid and specified in accordance with BCP 47",
        "Pass_0": "Lang has a valid primary lang and conforms to BCP 47",
        "Fail_1": "Specified 'lang' attribute does not include a valid primary language",
        "Fail_2": "Specified 'lang' attribute does not conform to BCP 47",
        "Fail_3": "Specified 'lang' attribute does not include a valid primary language",
        "Fail_4": "Specified 'xml:lang' attribute does not conform to BCP 47",
    },
    // JCH - DONE
    "WCAG20_Img_LinkTextNotRedundant": {
        0: "The text alternative for an image within a link should not repeat the link text or adjacent link text",
        "Pass_0": "Rule Passed",
        "Fail_1": "Link text is repeated in an image 'alt' value within the same link",
        "Fail_2": "Link text of previous link is repeated in image 'alt' value of a link",
        "Fail_3": "Image 'alt' value within a link is repeated in link text of the link after"
    },
    // JCH - DONE
    "RPT_Style_ExternalStyleSheet": {
        0: "Check external style sheets to ensure that CSS is not used to add images that convey important information in the content.",
        "Pass_0": "Rule Passed",
        "Potential_1": "External style sheets detected ensure that CSS does not add images that convey important information in the content."
    },
    // JCH - DONE
    "RPT_Header_Trigger": {
        0: "Heading text should correctly describe the subject of the web page sections", 
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify that heading text correctly describes the subject of each web page section"
    },
    // JCH - DONE
    "RPT_Script_OnclickHTML2": {
        0: "Scripts should not be used to emulate links",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify that 'onclick' events are not used in script to emulate a link"
    },
    // JCH - DONE
    "WCAG20_Table_CapSummRedundant": {
        0: "The table summary must not duplicate the caption",
        "Pass_0": "Rule Passed",
        "Fail_1": "The table summary duplicates the caption"
    },
    // JCH - DONE
    "WCAG20_Input_LabelBefore": {
        0: "Text inputs and <select> elements must have a label before the input control",
        "Pass_0": "Rule Passed",
        "Fail_1": "Text input is nested in label such that input precedes the label text",
        "Fail_2": "Label text is located after its associated text input or <select> element"
    },
    // JCH - DONE
    "WCAG20_Input_LabelAfter": {
        0: "Checkboxes and radio buttons must have a label after the input control",
        "Pass_0": "Rule Passed",
        "Fail_1": "Checkbox or radio button is nested in label, so label is not after the input control",
        "Fail_2": "Label text is located before its associated checkbox or radio button element"
    },
    // JCH - DONE
    "WCAG20_Embed_HasNoEmbed": {
        0: "<embed> elements should be immediately followed by a non-embedded element",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify that the <embed> element is immediately followed by a non-embedded element"
    },
    // JCH - DONE
    //       "Fail_2" added per HTML 5 spec
    "WCAG20_Table_Scope_Valid": {
        0: "Value for 'scope' attribute must be \"row\", \"col\", \"rowgroup\", or \"colgroup\"",
        "Pass_0": "Rule Passed",
        "Fail_1": "Value provided is invalid for the 'scope' attribute",
        "Fail_2": "The 'scope' attribute should only be used on a <th> element"
    },
    // JCH - DONE
    "WCAG20_Img_TitleEmptyWhenAltNull": {
        0: "When the image 'alt' attribute is empty, the 'title' attribute must also be empty",
        "Pass_0": "Rule Passed",
        "Fail_1": "The image 'alt' attribute is empty, but the 'title' attribute is not empty"
    },
    // JCH - DONE
    "WCAG20_Input_InFieldSet": {
        0: "Groups of logically related input elements should be contained within a <fieldset> element",
        "Pass_0": "Rule Passed",
        "Potential_1": "Use the <fieldset> element to group logically related input elements"
    },
    // JCH - DONE
    "WCAG20_Input_RadioChkInFieldSet": {
        0: "Related sets of radio buttons or checkboxes should be programmatically grouped",
        "Pass_LoneNogroup": "{0} grouping not required for a control of this type",
        "Pass_Grouped": "{0} input is grouped with other related controls with the same name",
        "Pass_RadioNoName": "Radio input is not grouped, but passes because it has no name to group with other radio inputs",
        "Fail_ControlNameMismatch": "{0} input found that has the same name, \"{2}\" as a {1} input",
        "Potential_LoneCheckbox": "Verify that this ungrouped checkbox input is not related to other checkboxes",
        "Potential_UnnamedCheckbox": "Verify that this un-named, ungrouped checkbox input is not related to other checkboxes",
        "Fail_NotGroupedOtherGrouped": "{0} input is not in the group with another {0} with the name \"{1}\"",
        "Fail_NotGroupedOtherNotGrouped": "{0} input and others with the name \"{1}\" are not grouped together",
        "Fail_NotSameGroup": "{0} input is in a different group than another {0} with the name \"{1}\""
    },
    // JCH - DONE
    "WCAG20_Select_NoChangeAction": {
        0: "No changes of context should occur when a selection value receives focus", 
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify that no change of context or action occurs when selection options in this component receive focus"
    },
    // JCH - DONE
    "WCAG20_Input_HasOnchange": {
        0: "Verify that any changes of context are explained in advance to the user",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify that any changes of context are explained in advance to the user"
    },
    // JCH - DONE
    "RPT_Embed_HasAlt": {
        0: "Provide alternative content for <embed> elements",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify that the <embed> element has alternative content"
    },
    // JCH - DONE
    "Valerie_Noembed_HasContent": {
        0: "<noembed> elements should contain descriptive text",
        "Pass_0": "Rule Passed",
        "Potential_1": "Add descriptive text to the <noembed> element"
    },
    // JCH - DONE
    "Valerie_Caption_HasContent": {
        0: "A <caption> element for a <table> element must contain descriptive text",
        "Pass_0": "Rule Passed",
        "Fail_1": "The <table> element has an empty <caption> element"
    },
    // JCH - DONE
    "Valerie_Caption_InTable": {
        0: "The <caption> element must be nested inside the associated <table> element",
        "Pass_0": "Rule Passed",
        "Fail_1": "<caption> element is not nested inside a <table> element"
    },
    // JCH - DONE
    "Valerie_Label_HasContent": {
        0: "A <label> element must have non-empty descriptive text that identifies the purpose of the interactive component",
        "Pass_Regular": "<label> element has accessible name with inner content",
        "Pass_AriaLabel": "<label> element has accessible name via 'aria-label'",
        "Pass_LabelledBy": "<label> element has accessible name via 'aria-labelledby'",
        "Fail_1": "The <label> element does not have descriptive text that identifies the expected input"
    },
    // JCH - DONE
    "Valerie_Elem_DirValid": {
        0: "'dir' attribute value must be \"ltr\", \"rtl\", or \"auto\"",
        "Pass_0": "Rule Passed",
        "Fail_1": "Invalid value used for the 'dir' attribute"
    },
    // JCH - DONE
    "Valerie_Frame_SrcHtml": {
        0: "A <frame> containing non-HTML content must be made accessible",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify <frame> content is accessible"
    },
    // JCH - DONE
    "Valerie_Table_DataCellRelationships": {
        0: "For a complex data table, all <th> and <td> elements must be related via 'header' or 'scope' attributes",
        "Pass_0": "Rule Passed",
        "Fail_1": "Complex table does not have headers for each cell properly defined with 'header' or 'scope'"
    },
    // JCH - DONE
    "RPT_Table_LayoutTrigger": {
        0: "Avoid using tables to format text documents in columns unless the table can be linearized",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify table is not being used to format text content in columns unless the table can be linearized"
    },
    // JCH - DONE
    "RPT_Table_DataHeadingsAria": {
        0: "Data table must identify headers",
        "Pass_0": "Rule Passed",
        "Fail_1": "Table has no headers identified"
    },
    // JCH - DONE
    "WCAG20_Label_RefValid": {
        0: "The 'for' attribute must reference a non-empty, unique 'id' attribute of an <input> element",
        "Pass_0": "Rule Passed",
        "Fail_1": "The value \"{0}\" of the 'for' attribute is not the 'id' of a valid <input> element"
    },
    // JCH - DONE
    "WCAG20_Elem_UniqueAccessKey": {
        0: "'accesskey' attribute values on each element must be unique for the page",
        "Pass_0": "Rule Passed",
        "Fail_1": "'accesskey' attribute value on the element is not unique"
    },
    // JCH - DONE
    "WCAG20_Script_FocusBlurs": {
        0: "Scripting must not remove focus from content that normally receives focus", 
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify script does not remove focus from content that normally receives focus"
    },
    // JCH - DONE
    "HAAC_Img_UsemapAlt": {
        0: "An image map and each <area> element in an image map must have text alternative(s)",
        "Pass_0": "Rule Passed",
        "Fail_1": "Image map or child <area> has no text alternative"
    },
    // JCH - DONE
    "WCAG20_Text_Emoticons": {
        0: "Emoticons must have a short text alternative that describes their purpose",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify that emoticons have a text alternative"
    },
    // JCH - DONE
    "WCAG20_Style_BeforeAfter": {
        0: "Do not use CSS '::before' and '::after' pseudo-elements to insert non-decorative content",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify the '::before' and '::after' pseudo-elements do not insert non-decorative content"
    },
    // JCH - DONE
    "WCAG20_Text_LetterSpacing": {
        0: "Use CSS 'letter-spacing' to control spacing within a word",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify space characters are not being used to create space between the letters of a word"
    },
    // JCH - DONE
    "Rpt_Aria_ValidRole": {
        0: "Elements must have a valid 'role' per ARIA specification",
        "Pass_0": "Rule Passed",
        "Fail_1": "Some of the 'role's defined on the element are not valid per ARIA specification",
        "Fail_2": "The 'role' defined on the element is not valid per ARIA specification"
    },
    "table_aria_descendants": {
        0: "Table structure elements cannot specify an explicit 'role' within table containers",
        "explicit_role": "An explicit ARIA 'role' is not valid for <{0}> element within a ARIA role '{1}' per the ARIA in HTML specification"
    },
    // JCH - DONE
    "Rpt_Aria_ValidPropertyValue": {
        0: "ARIA property values must be valid",
        "Pass_0": "Rule Passed",
        "Fail_1": "The value \"{0}\" specified for attribute '{1}' on element <{2}> is not valid"
    },
    // JCH - DONE
    "Rpt_Aria_ValidIdRef": {
        0: "The ARIA property must reference a non-empty unique id of an existing element that is visible",
        "Pass_0": "Rule Passed",
        "Fail_1": "The 'id' \"{0}\" specified for the ARIA property '{1}' value is not valid"
    },
    // JCH - DONE
    "Rpt_Aria_RequiredProperties": {
        0: "When using a ARIA role on an element, the required attributes for that role must be defined",
        "Pass_0": "Rule Passed",
        "Fail_1": "An element with ARIA role '{0}' does not have the required ARIA attribute(s): '{1}'"
    },
    // JCH - DONE
    "Rpt_Aria_EmptyPropertyValue": {
        0: "When specifying a required ARIA attribute, the value must not be empty",
        "Pass_0": "Rule Passed",
        "Fail_1": "The element attribute(s): '{0}' value is empty"
    },
    // JCH - DONE
    "Rpt_Aria_ValidProperty": {
        0: "ARIA attributes must be valid for the element's role",
        "Pass_0": "Rule Passed",
        "Fail_1": "The attribute(s) '{0}' referenced by the element <{1}> is not a valid ARIA state or property"
    },
    // JCH - DONE
    "Rpt_Aria_InvalidTabindexForActivedescendant": {
        0: "Element using 'aria-activedescendant' property must have its 'tabindex' attribute value set to 0 or -1 to be keyboard accessible",
        "Pass_0": "Rule Passed",
        "Fail_1": "The <{0}> element using 'aria-activedescendant' set to \"{1}\" does not have its 'tabindex' attribute value set to 0 or -1"
    },
    // JCH - DONE
    "Rpt_Aria_MissingFocusableChild": {
        0: "UI component must have at least one focusable child element for keyboard access",
        "Pass_0": "Rule Passed",
        "Fail_1": "The descendent <{0}> element with \"{1}\" role has no focusable child element"
    },
    // JCH - DONE
    "Rpt_Aria_MissingKeyboardHandler": {
        0: "Interactive WAI_ARIA UI components must provide keyboard access",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify the <{0}> element with \"{1}\" role has keyboard access"
    },
    // JCH - DONE
    "WCAG20_Img_PresentationImgHasNonNullAlt": {
        0: "Image designated as decorative must have 'alt=\"\"",
        "Pass_0": "Rule Passed",
        "Fail_1": "Image designated as decorative has non-null 'alt' attribute"
    },
    // JCH - DONE
    "Rpt_Aria_MultipleSearchLandmarks": {
        0: "Each element with \"search\" role must have a unique label that describes its purpose",
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple elements with \"search\" role do not have unique labels"
    },
    // JCH - DONE
    "Rpt_Aria_MultipleApplicationLandmarks": {
        0: "Each element with \"application\" role must have a unique label that describes its purpose",
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple elements with \"application\" role do not have unique labels"
    },
    // JCH - DONE
    "Rpt_Aria_ApplicationLandmarkLabel": {
        0: "An element with \"application\" role must have a label that describes its purpose",
        "Pass_0": "Rule Passed",
        "Fail_1": "Element with \"application\" role does not have a label"
    },
    // JCH - DONE
    "Rpt_Aria_MultipleDocumentRoles": {
        0: "All elements with a \"document\" role must have unique labels",
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple elements with a \"document\" role do not have unique labels"
    },
    // JCH - DONE
    "WCAG20_Label_TargetInvisible": {
        0: "Do not label hidden <input> elements ('type=\"hidden\")",
        "Pass_0": "Rule Passed",
        "Potential_1": "Hidden <input> element ('type=\"hidden\") is possibly labelled"
    },
    // JCH - DONE
    "HAAC_Video_HasNoTrack": {
        0: "A <video> element must have a text alternative for any meaningful audio content",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify that captions are available for any meaningful audio or provide a caption track for the <video> element"
    },
    // JCH - DONE
    "HAAC_Audio_Video_Trigger": {
        0: "Media using <audio> and/or <video> elements must have keyboard accessible controls",
        "Pass_0": "Rule Passed",
        "Manual_1": "Verify media using <audio> and/or <video> elements have keyboard accessible controls"
    },
    // JCH - DONE
    "HAAC_Input_HasRequired": {
        0: "If the application must be accessible in Internet Explorer 8, use 'aria-required' instead of the HTML5 'required' property",
        "Pass_0": "Rule Passed",
        "Potential_1": "If the application must be accessible in Internet Explorer 8, use 'aria-required' instead of the HTML5 'required' property"
    },
    // JCH - DONE
    "HAAC_Aria_ImgAlt": {
        0: "An element with \"img\" role must have a non-empty label",
        "Pass_0": "Rule Passed",
        "Fail_1": "Element with \"img\" role has no label",
        "Fail_2": "Element with \"img\" role has no label or an empty label",
        "Fail_3": "Element with \"img\" role missing non-empty 'aria-label' or 'aria-labelledby'"
    },
    "HAAC_Aria_SvgAlt": {
        0: "An element with a graphics role must have a non-empty label",
        "Pass_0": "Rule Passed",
        "Fail_1": "Element with \"{0}\" graphics role has no label",
        "Fail_2": "Element with \"{0}\" graphics role has no label or an empty label",
        "Fail_3": "Element with \"{0}\" graphics role missing non-empty 'aria-label' or 'aria-labelledby'"
    },
    // JCH - DONE
    "HAAC_BackgroundImg_HasTextOrTitle": {
        0: "Background images that convey important information must have a text alternative that describes the image",
        "Pass_0": "Rule Passed",
        "Manual_1": "Verify important background image information has a text alternative in system high contrast mode"
    },
    // JCH - DONE
    "HAAC_Accesskey_NeedLabel": {
        0: "An HTML element with an assigned 'accesskey' attribute must have an associated label",
        "Pass_0": "Rule Passed",
        "Potential_1": "The HTML element with an assigned 'accesskey' attribute does not have an associated label"
    },
    // JCH - DONE
    "HAAC_Aria_Or_HTML5_Attr": {
        0: "HTML5 attributes must not conflict with the associated ARIA attribute used on an input element",
        "Pass_0": "Rule Passed",
        "Fail_1": "HTML5 attribute is in conflict with the associated ARIA attribute used on an input element"
    },
    // JCH - DONE
    "HAAC_Canvas": {
        0: "The <canvas> element may not be accessible",
        "Pass_0": "Rule Passed",
        "Manual_1": "Verify accessibility of the <canvas> element"
    },
    // JCH - DONE
    "HAAC_Figure_label": {
        0: "A <figure> element must have an associated label",
        "Pass_0": "Rule Passed",
        "Fail_1": "The <figure> element does not have an associated label"
    },
    // JCH - DONE
    "HAAC_Input_Placeholder": {
        0: "HTML5 'placeholder' attribute must not be used as a visible label replacement",
        "Pass_0": "Rule Passed",
        "Potential_1": "HTML5 placeholder is the only visible label",
        "Potential_2": "Additional visible label referenced by 'aria-labelledby' is not valid"
    },
    // JCH - DONE
    "aria_semantics_role": {
        0: "ARIA roles must be valid for the element to which they are assigned",
        "Pass_0": "Rule Passed",
        "Fail_1": "The ARIA role '{0}' is not valid for the element <{1}>",
        "Fail_2": "The ARIA role '{0}' is not valid for the element <{1}> and may be ignored by the browser since the element is focusable"
    },
    "aria_semantics_attribute": {
        0: "ARIA attributes must be valid for the element and ARIA role to which they are assigned",
        "Pass_0": "Rule Passed",
        "Fail_1": "The ARIA attribute '{0}' is not valid for the element <{1}> with ARIA role '{2}'"
    },
    // JCH - DONE
    "RPT_Form_ChangeEmpty": {
        0: "A form should not be submitted automatically without warning the user",
        "Pass_0": "Rule Passed",
        "Potential_1": "Confirm the form does not submit automatically without warning"
    },
    // JCH - DONE
    "IBMA_Color_Contrast_WCAG2AA": {
        0: "The contrast ratio of text with its background must meet WCAG 2.1 AA requirements",
        "Pass_0": "Rule Passed",
        "Fail_1": "Text contrast of {0} with its background is less than the WCAG AA minimum requirements for text of size {1}px and weight of {2}",
        "Potential_1": "The foreground text and its background color are both detected as {3}. Verify the text meets the WCAG 2.1 AA requirements for minimum contrast"
    },
    // JCH - DONE
    "IBMA_Color_Contrast_WCAG2AA_PV": {
        0: "The contrast ratio of text with its background (i.e. background with a color gradient or a background image) must meet WCAG 2.1 AA requirements",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify the contrast ratio of the text against the lightest and the darkest colors of the background meets the WCAG 2.1 AA minimum requirements for text of size {1}px and weight of {2}"
    },
    // JCH - DONE
    "WCAG20_Body_FirstASkips_Native_Host_Sematics": {
        0: "Pages must provide a way to skip directly to the main content",
        "Pass_0": "Rule Passed",
        "Fail_1": "The page does not provide a way to quickly navigate to the main content (ARIA \"main\" landmark or a skip link)"
    },
    // JCH - DONE
    "WCAG20_Body_FirstAContainsSkipText_Native_Host_Sematics": {
        0: "The description of a hyperlink used to skip content must communicate where it links to", 
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify that if this hyperlink skips content, the description communicates where it links to"
    },
    // JCH - DONE
    "Rpt_Aria_RequiredChildren_Native_Host_Sematics": {
        0: "An element with a ARIA role must contain required children",
        "Pass_0": "Rule Passed",
        "Potential_1": "The element with role \"{0}\" does not contain or own at least one child element with each of the following roles: \"{1}\""
    },
    // JCH - DONE
    "Rpt_Aria_RequiredParent_Native_Host_Sematics": {
        0: "An element with an implicit or explicit role must be contained within a valid element",
        "Pass_0": "Rule Passed",
        "Fail_1": "The element with role \"{0}\" is not contained in or owned by an element with one of the following roles: \"{1}\""
    },
    // JCH - DONE
    "Rpt_Aria_EventHandlerMissingRole_Native_Host_Sematics": {
        0: "Elements with event handlers must have a valid ARIA role",
        "Pass_0": "Rule Passed",
        "Fail_1": "The <{0}> element with '{1}' does not have a valid ARIA role specified"
    },
    // JCH - DONE
    "Rpt_Aria_WidgetLabels_Implicit": {
        0: "Interactive component must have a programmatically associated name",
        "Pass_0": "Rule Passed",
        "Fail_1": "Interactive component with ARIA role '{0}' does not have a programmatically associated name"
    },
    // JCH - DONE
    "Rpt_Aria_OrphanedContent_Native_Host_Sematics": {
        0: "All content must reside within an element with a landmark role", 
        "Pass_0": "Rule Passed",
        "Fail_1": "Content is not within a landmark element"
    },
    // JCH - DONE
    "Rpt_Aria_RegionLabel_Implicit": {
        0: "Each element with \"region\" role must have a label that describes its purpose",
        "Pass_0": "Rule Passed",
        "Fail_1": "Section element with an implicit \"region\" role is not labeled with an 'aria-label' or 'aria-labelledby'",
        "Fail_2": "The element with \"region\" role is not labeled with an 'aria-label' or 'aria-labelledby'"
    },
    // JCH - DONE
    "Rpt_Aria_MultipleMainsVisibleLabel_Implicit": {
        0: "Each element with \"main\" role should have a unique visible label that describes its purpose",
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple elements with \"main\" role do not have unique visible labels"
    },
    // JCH - DONE
    "Rpt_Aria_MultipleBannerLandmarks_Implicit": {
        0: "Each element with \"banner\" role must have a unique label that describes its purpose",
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple elements with \"banner\" role do not have unique labels"
    },
    // JCH - DONE
    "Rpt_Aria_MultipleComplementaryLandmarks_Implicit": {
        0: "Each element with \"complementary\" role must have a unique label that describes its purpose", 
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple elements with \"complementary\" role do not have unique labels"
    },
    // JCH - DONE
    "Rpt_Aria_MultipleContentinfoLandmarks_Implicit": {
        0: "Each element with \"contentinfo\" role must have a unique label that describes its purpose",
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple elements with \"contentinfo\" role do not have unique labels"
    },
    // JCH - DONE
    "Rpt_Aria_MultipleFormLandmarks_Implicit": {
        0: "Each element with \"form\" role must have a unique label that describes its purpose",
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple elements with \"form\" role do not have unique labels"
    },
    // JCH - DONE
    "Rpt_Aria_MultipleNavigationLandmarks_Implicit": {
        0: "Each element with \"navigation\" role must have a unique label that describes its purpose",
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple elements with \"navigation\" role do not have unique labels"
    },
    // JCH - DONE
    "Rpt_Aria_ComplementaryLandmarkLabel_Implicit": {
        0: "Each element with \"complementary\" role should have a visible label that describes its purpose",
        "Pass_0": "Rule Passed",
        "Fail_1": "The element with \"complementary\" role does not have a visible label"
    },
    // JCH - DONE
    "Rpt_Aria_MultipleArticleRoles_Implicit": {
        0: "Each element with \"article\" role must have a unique label that describes its purpose",
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple elements with \"article\" role do not have unique labels"
    },
    // JCH - DONE
    "Rpt_Aria_ArticleRoleLabel_Implicit": {
        0: "An element with \"article\" role must have a label that describes its purpose", 
        "Pass_0": "Rule Passed",
        "Fail_1": "The element with \"article\" role does not have a label"
    },
    // JCH - DONE
    "Rpt_Aria_MultipleGroupRoles_Implicit": {
        0: "Each element with \"group\" role must have a unique label that describes its purpose",
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple elements with \"group\" role do not have unique labels"
    },
    // JCH - DONE
    "Rpt_Aria_GroupRoleLabel_Implicit": {
        0: "An element with \"group\" role should have a unique label that describes its purpose",
        "Pass_0": "Rule Passed",
        "Fail_1": "The <{0}> element with \"group\" role does not have a label"
    },
    // JCH - DONE
    "Rpt_Aria_MultipleContentinfoInSiblingSet_Implicit": {
        0: "A page, document or application should only have one element with \"contentinfo\" role", 
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple elements with \"contentinfo\" role found on a page"
    },
    // JCH - DONE
    "Rpt_Aria_OneBannerInSiblingSet_Implicit": {
        0: "There must be only one element with \"banner\" role on the page", 
        "Pass_0": "Rule Passed",
        "Fail_1": "There is more than one element with \"banner\" role on the page"
    },
    // JCH - DONE
    "Rpt_Aria_ContentinfoWithNoMain_Implicit": {
        0: "An element with \"contentinfo\" role is only permitted with an element with \"main\" role", 
        "Pass_0": "Rule Passed",
        "Fail_1": "The element with \"contentinfo\" role is present without an element with \"main\" role"
    },
    // JCH - DONE
    "Rpt_Aria_ComplementaryRequiredLabel_Implicit": {
        0: "An element with \"complementary\" role must have a label", 
        "Pass_0": "Rule Passed",
        "Fail_1": "The element with \"complementary\" role does not have a label"
    },
    // JCH - DONE
    "Rpt_Aria_MultipleRegionsUniqueLabel_Implicit": {
        0: "Each element with a \"region\" role must have a unique label",
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple elements with \"region\" role do not have unique labels"
    },
    // JCH - DONE
    "IBMA_Focus_Tabbable": {
        0: "Component must have at least one tabbable element",
        "Pass_0": "Rule Passed",
        "Potential_1": "Component with \"{0}\" role does not have a tabbable element"
    },
    // JCH - DONE
    "IBMA_Focus_MultiTab": {
        0: "Certain components must have no more than one tabbable element",
        "Pass_0": "Rule Passed",
        "Potential_1": "Component with \"{0}\" role has more than one tabbable element"
    },
    // JCH - DONE
    "RPT_Style_Trigger2": {
        0: "Windows high contrast mode must be supported when using CSS to include, position or alter non-decorative content",
        "Pass_0": "Rule Passed",
        "Manual_1": "Confirm Windows high contrast mode is supported when using CSS to include, position or alter non-decorative content"
    },
    // JCH - DONE
    "Rpt_Aria_MultipleMainsRequireLabel_Implicit_2": {
        0: "Elements with \"main\" role must have unique labels",
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple elements with \"main\" role do not have unique labels"
    },
    // JCH - DONE
    "HAAC_Media_DocumentTrigger2": {
        0: "File download mechanisms should be keyboard-operable and preserve page focus location",
        "Pass_0": "Rule Passed",
        "Manual_1": "Verify that the file download mechanism does not cause a keyboard trap"
    },
    // JCH - DONE
    "HAAC_Aria_ErrorMessage": {
        0: "A custom error message must reference a valid 'id' value and when triggered the message must be appropriately exposed",
        "Pass_0": "Rule Passed",
        "Fail_1": "Custom error message has invalid reference 'id' value",
        "Fail_2": "Custom error message is not visible"
    },
    // JCH - DONE
    "HAAC_List_Group_ListItem": {
        0: "List component with \"group\" role must limit children to <listitem> elements",
        "Pass_0": "Rule Passed",
        "Fail_1": "List component with \"group\" role has children that are not <listitem> elements"
    },
    // JCH - DONE
    "HAAC_ActiveDescendantCheck": {
        0: "The 'aria-activedescendant' property must reference the 'id' of a non-empty, non-hidden active child element",
        "Pass_0": "Rule Passed",
        "Fail_1": "The 'aria-activedescendant' property is empty",
        "Fail_2": "The 'aria-activedescendant' property references a hidden node",
        "Fail_3": "Element is not a combobox, and the referenced active-descendant element is not a valid descendant",
        "Fail_4": "Element is a combobox, and the referenced active-descendant element is not controlled by this component"
    },
    // JCH - DONE
    "HAAC_Application_Role_Text": {
        0: "Non-decorative static text and image content within an element with \"application\" role must be accessible",
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify that the non-decorative static text and image content within an element with \"application\" role are accessible"
    },
    // JCH - DONE
    "Rpt_Aria_MultipleToolbarUniqueLabel": {
        0: "All toolbar components on a page must have unique labels specified",
        "Pass_0": "Rule Passed",
        "Fail_1": "Multiple toolbar components do not have unique labels"
    },
    "combobox_version": {
        0: "The combobox design pattern must be valid for ARIA 1.2",
        "Pass_1.0": "The combobox design pattern is detected as ARIA 1.0, which is allowed by ARIA 1.2",
        "Fail_1.1": "The combobox design pattern is detected as ARIA 1.1, which is not allowed by ARIA 1.2",
        "Pass_1.2": "The combobox design pattern is detected as ARIA 1.2"
    },
    "combobox_popup_reference": {
        0: "The 'aria-controls' (for ARIA 1.2) or the 'aria-owns' (for ARIA 1.0) attribute of the expanded combobox must reference a valid popup 'id' value",
        "Pass_expanded": "The combobox popup referenced by 'aria-controls' (ARIA 1.2) or 'aria-owns' (ARIA 1.0) exists and is visible",
        "Pass_collapsed": "The combobox popup in its collapsed state does not reference any visible popup as required",
        "Fail_1.0_missing_owns": "The 'aria-owns' attribute of the expanded combobox is missing",
        "Fail_1.2_missing_controls": "The 'aria-controls' attribute of the expanded combobox is missing",
        "Fail_1.0_popup_reference_missing": "The 'aria-owns' attribute \"{0}\" of the expanded combobox does not reference a valid popup 'id' value",
        "Fail_1.2_popup_reference_missing": "The 'aria-controls' attribute \"{0}\" of the expanded combobox does not reference a valid popup 'id' value",
        "Fail_combobox_expanded_hidden": "The combobox 'aria-expanded' attribute is true, but the combobox popup is not visible",
        "Fail_combobox_collapsed_visible": "The combobox 'aria-expanded' attribute is false, but the combobox popup is visible"
    },
    "combobox_haspopup": {
        0: "The combobox attribute 'aria-haspopup' value must be appropriate for the role of the element referenced by 'aria-controls' (ARIA 1.2) or 'aria-owns' (ARIA 1.0)",
        "Pass": "The 'aria-controls' (ARIA 1.2) or 'aria-owns' (ARIA 1.0) appropriately references a valid popup 'id' value",
        "Fail_popup_role_invalid": "The 'role' value \"{0}\" of the popup element \"{1}\" should be one of \"listbox\", \"grid\", \"tree\" or \"dialog\"",
        "Fail_combobox_popup_role_mismatch": "The value of the combobox 'aria-haspopup' attribute \"{0}\" does not match the 'role' value of the popup element \"{1}\""
    },    
    "combobox_focusable_elements": {
        0: "Tabbable focus for the combobox must be allowed only on the text input, except when using a dialog popup",
        "Pass": "DOM focus is allowed only on the combobox element as required",
        "Fail_not_tabbable": "The combobox element does not allow DOM focus as required",
        "Fail_tabbable_child": "The popup of the combobox has DOM focus or has 'aria-activedescendant' defined, which is not allowed"
    },
    "combobox_active_descendant": {
        0: "'aria-activedescendant' must be used to define focus within the combobox popup, except when using a dialog popup",
        "Pass": "'aria-activedescendant' is used appropriately for this combobox",
        "Fail_missing": "The element referenced by 'aria-activedescendant' \"{0}\" does not exist",
        "Fail_not_in_popup": "The element referenced by 'aria-activedescendant' \"{0}\" does not exist within the popup referenced by 'id' \"{1}\"",
        "Fail_active_role_invalid": "The 'aria-activedescendant' \"{0}\" references an element with the roles \"{1}\", which does not have a valid ARIA role of 'option', 'gridcell', 'row', or 'treeitem'",
        "Fail_active_not_selected": "The 'aria-activedescendant' \"{0}\" references an element that does not have 'aria-selected' set to true",
    },
    "combobox_autocomplete": {
        0: "A combobox that supports autocompletion behavior must have the 'aria-autocomplete' attribute only on its text input element with a valid value; a value of '\"inline\"' is not supported",
        "Pass": "The combobox does not use 'aria-autocomplete' value '\"inline\"' nor does it have 'aria-autocomplete' defined within the popup",
        "Fail_1": "The combobox has the 'aria-autocomplete' attribute incorrectly set on an element within the popup referenced by \"{0}\"",
        "Fail_inline": "The combobox does not support an 'aria-autocomplete' attribute value set to '\"inline\"' "
    },
    // JCH - DONE
    "WCAG21_Style_Viewport": {
        0: "Text must scale up to 200% without loss of content or functionality", 
        "Pass_0": "Rule Passed",
        "Potential_1": "Verify that text sized using viewport units can be resized up to 200%"
    },
    // JCH - DONE
    "WCAG21_Label_Accessible": {
        0: "Accessible name must match or contain the visible label text", 
        "Pass_0": "Rule Passed",
        "Fail_1": "Accessible name does not match or contain the visible label text"
    },
    // JCH - DONE
    "WCAG21_Input_Autocomplete": {
        0: "The 'autocomplete' attribute's token(s) must be appropriate for the input form field",
        "Pass_0": "Rule Passed",
        "Fail_1": "The 'autocomplete' attribute's token(s) are not appropriate for the input form field"
    },
    // JCH - DONE
    "WCAG20_Input_VisibleLabel": {
        0: "An input element must have an associated visible label", 
        "Pass_0": "Rule Passed",
        "Potential_1": "The input element does not have an associated visible label"
    },
    "meta_viewport_zoom": {
        0: "The 'meta[name=viewport]' should not prevent the browser zooming the content", 
        "Pass_0": "The 'meta[name=viewport]' does not prevent the browser zooming the content",
        "Potential_1": "Confirm the 'meta[name=viewport]' with \"{0}\" can be zoomed by user"
    },
    "aria_hidden_focus_misuse": {
        0: "A focusable element should not be within the subtree of an element with 'aria-hidden' set to \"true\"", 
        "Pass_0": "Rule Passed",
        "Fail_1": "Element \"{0}\" should not be focusable within the subtree of an element with an 'aria-hidden' attribute with value 'true'"
    },
    "table_headers_ref_valid": {
        0: "The 'headers' attribute should refer to a valid cell in the same table", 
        "Pass_0": "Rule Passed",
        "Fail_1": "The 'headers' attribute value \"{0}\" does not reference a valid 'id' in this document",
        "Fail_2": "The 'headers' attribute value \"{0}\" refers to itself",
        "Fail_3": "The 'headers' attribute value \"{0}\" does not refer to a cell in the same table",
        "Fail_4": "The 'headers' attribute value \"{0}\" does not refer to a cell indicated with <th> or a role of \"columnheader\" or \"rowheader\""
    }
}
export { a11yNls }
