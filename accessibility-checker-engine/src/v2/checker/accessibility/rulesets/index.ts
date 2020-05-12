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

import { Ruleset } from "../../Checker";
import { eRulePolicy, eRuleCategory } from "../../../api/IEngine";

let a11yRulesets: Ruleset[] = [
{
    id: "IBM_Accessibility",
    name: "IBM Accessibility",
    category: eRuleCategory.ACCESSIBILITY,
    description: "Rules for WCAG 2.1 (level A and level AA) plus additional IBM checklist supplemental requirements.",
    "checkpoints": [
        {
            "num": "1.1.1",
            "name": "Non-text Content",
            "summary": "All non-text content that is presented to the user has a text alternative that serves the equivalent purpose.",
            "rules": [
                {
                    id: "WCAG20_Input_ExplicitLabelImage",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Img_UsemapValid",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Object_HasText",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Applet_HasAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Input_ExplicitLabel",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Area_HasAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Img_AltCommonMisuse",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Img_LongDescription2",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Img_HasAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Pre_ASCIIArt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Media_AudioVideoAltFilename",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Img_LinkTextNotRedundant",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Img_TitleEmptyWhenAltNull",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Img_UsemapAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Text_Emoticons",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Img_PresentationImgHasNonNullAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Figure_label",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Media_AltBrief",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Embed_HasNoEmbed",
                    level: eRulePolicy.RECOMMENDATION
                },
                
                {
                    id: "RPT_Embed_HasAlt",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "Valerie_Noembed_HasContent",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_Canvas",
                    level: eRulePolicy.RECOMMENDATION
                }
            ]
        },
        {
            "num": "1.2.1",
            "name": "Audio-only and Video-only (Prerecorded)",
            "summary": "For prerecorded audio-only or video-only media, an alternative provides equivalent information.",
            "rules": [
                {
                    id: "HAAC_Video_HasNoTrack",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Media_AudioTrigger",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_Video_HasNoTrack",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.2.2",
            "name": "Captions (Prerecorded)",
            "summary": "Captions are provided for all prerecorded audio content in synchronized media.",
            "rules": [
                {
                    id: "HAAC_Video_HasNoTrack",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.2.3",
            "name": "Audio Description or Media Alternative (Prerecorded)",
            "summary": "An alternative for time-based media or audio description of the prerecorded video content is provided for synchronized media.",
            "rules": [
                {
                    id: "RPT_Media_VideoReferenceTrigger",
                    level: eRulePolicy.RECOMMENDATION
                }
            ]
        },
        {
            "num": "1.2.4",
            "name": "Captions (Live)",
            "summary": "Captions are provided for all live audio content in synchronized media.",
            "rules": [
                {
                    id: "HAAC_Video_HasNoTrack",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Media_VideoObjectTrigger",
                    level: eRulePolicy.RECOMMENDATION
                },
            ]
        },
        {
            "num": "1.2.5",
            "name": "Audio Description (Prerecorded)",
            "summary": "Audio description is provided for all prerecorded video content in synchronized media.",
            "rules": [
                {
                    id: "RPT_Media_VideoReferenceTrigger",
                    level: eRulePolicy.RECOMMENDATION
                }
            ]
        },
        {
            "num": "1.3.1",
            "name": "Info and Relationships",
            "summary": "Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text.",
            "rules": [
                {
                    id: "RPT_Headers_FewWords",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Blockquote_HasCite",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Blockquote_WrapsTextQuote",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Block_ShouldBeHeading",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Label_UniqueFor",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Style_BackgroundImage",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_List_UseMarkup",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Script_OnclickHTML1",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Fieldset_HasLegend",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Table_CapSummRedundant",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Table_Scope_Valid",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Input_RadioChkInFieldSet",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Valerie_Caption_HasContent",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Valerie_Caption_InTable",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Valerie_Table_DataCellRelationships",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Table_DataHeadingsAria",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Label_RefValid",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Style_BeforeAfter",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_List_Misuse",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Select_HasOptGroup",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "RPT_Script_OnclickHTML2",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Input_InFieldSet",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "RPT_Table_LayoutTrigger",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_BackgroundImg_HasTextOrTitle",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Table_Structure",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Style_Trigger2",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Table_SummaryAria3",
                    level: eRulePolicy.RECOMMENDATION
                },
                
            ]
        },
        {
            "num": "1.3.2",
            "name": "Meaningful Sequence",
            "summary": "When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined.",
            "rules": [
                {
                    id: "Valerie_Elem_DirValid",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Text_LetterSpacing",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.3.3",
            "name": "Sensory Characteristics",
            "summary": "Instructions provided for understanding and operating content do not rely solely on sensory characteristics of components such as shape, size, visual location, orientation, or sound.",
            "rules": [
                {
                    id: "RPT_Text_SensoryReference",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.3.4",
            "name": "Orientation",
            "summary": "Content does not restrict its view and operation to a single display orientation, such as portrait or landscape.",
            "rules": []
        },
        {
            "num": "1.3.5",
            "name": "Identify Input Purpose",
            "summary": "The purpose of each input field that collects information about the user can be programmatically determined when the field serves a common purpose.",
            "rules": [
                {
                    id: "WCAG21_Input_Autocomplete",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.4.1",
            "name": "Use of Color",
            "summary": "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.",
            "rules": [
                {
                    id: "RPT_Font_ColorInForm",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Style_ColorSemantics1",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.4.2",
            "name": "Audio Control",
            "summary": "If any audio plays automatically for more than 3 seconds, either a mechanism is available to pause or stop the audio, or a mechanism is available to control audio volume independently from the overall system volume level.",
            "rules": [
                {
                    id: "RPT_Embed_AutoStart",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.4.3",
            "name": "Contrast (Minimum)",
            "summary": "The visual presentation of text and images of text has a contrast ratio of at least 4.5:1, with a 3:1 ratio for large-scale text.",
            "rules": [
                {
                    id: "IBMA_Color_Contrast_WCAG2AA",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "IBMA_Color_Contrast_WCAG2AA_PV",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.4.4",
            "name": "Resize Text",
            "summary": "Text can be resized without assistive technology up to 200 percent without loss of content or functionality.",
            "rules": [
                {
                    id: "WCAG21_Style_Viewport",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.4.5",
            "name": "Images of Text",
            "summary": "If the technologies being used can achieve the visual presentation, text is used to convey information rather than images of text.",
            "rules": []
        },
        {
            "num": "1.4.10",
            "name": "Reflow",
            "summary": "Content can reflow without loss of information or functionality, and without requiring scrolling in two dimensions.",
            "rules": []
        },
        {
            "num": "1.4.11",
            "name": "Non-text Contrast",
            "summary": "The parts of graphical objects required to understand the content, and the visual information required to identify UI components and states, have a contrast ratio of at least 3:1 against adjacent colors.",
            "rules": []
        },
        {
            "num": "1.4.12",
            "name": "Text Spacing",
            "summary": "No loss of content or functionality occurs when users change letter, word and paragraph spacing, as well as line height.",
            "rules": []
        },
        {
            "num": "1.4.13",
            "name": "Content on Hover or Focus",
            "summary": "Where hover or focus actions cause additional content to become visible and hidden, the additional content is dismissable, hoverable and persistent.",
            "rules": []
        },
        {
            "num": "2.1.1",
            "name": "Keyboard",
            "summary": "All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes.",
            "rules": [
                {
                    id: "RPT_Elem_EventMouseAndKey",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "Rpt_Aria_InvalidTabindexForActivedescendant",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MissingFocusableChild",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MissingKeyboardHandler",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Audio_Video_Trigger",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Application_Role_Text",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.1.2",
            "name": "No Keyboard Trap",
            "summary": "If keyboard focus can be moved to a component using a keyboard interface, then focus can be moved away from that component using only a keyboard interface, and, if it requires more than unmodified arrow or tab keys or other standard exit methods, the user is advised of the method for moving focus away.",
            "rules": [
                {
                    id: "HAAC_Media_DocumentTrigger2",
                    level: eRulePolicy.RECOMMENDATION
                }
            ]
        },
        {
            "num": "2.1.4",
            "name": "Character Key Shortcuts",
            "summary": "If a keyboard shortcut is implemented using only letter, punctuation, number or symbol characters, then the shortcut can be turned off, remapped or activated only on focus.",
            "rules": []
        },
        {
            "num": "2.2.1",
            "name": "Timing Adjustable",
            "summary": "For each time limit that is set by the content, the user can turn off, adjust, or extend the limit.",
            "rules": [
                {
                    id: "RPT_Meta_Refresh",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Meta_RedirectZero",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.2.2",
            "name": "Pause, Stop, Hide",
            "summary": "For moving, blinking, scrolling, or auto-updating information, the user can pause, stop, hide or adjust the information.",
            "rules": [
                {
                    id: "RPT_Marquee_Trigger",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Blink_AlwaysTrigger",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Blink_CSSTrigger1",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.3.1",
            "name": "Three Flashes or Below Threshold",
            "summary": "Content does not contain anything that flashes more than three times in any one second period, or the flash is below the general flash and red flash thresholds.",
            "rules": []
        },
        {
            "num": "2.4.1",
            "name": "Bypass Blocks",
            "summary": "A mechanism is available to bypass blocks of content that are repeated on multiple Web pages.",
            "rules": [
                {
                    id: "WCAG20_Frame_HasTitle",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Html_SkipNav",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Valerie_Frame_SrcHtml",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleSearchLandmarks",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ComplementaryLandmarkLabel_Implicit",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "Rpt_Aria_MultipleApplicationLandmarks",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ApplicationLandmarkLabel",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleDocumentRoles",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Body_FirstASkips_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Body_FirstAContainsSkipText_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_OrphanedContent_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_RegionLabel_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleMainsVisibleLabel_Implicit",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "Rpt_Aria_MultipleBannerLandmarks_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleComplementaryLandmarks_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleContentinfoLandmarks_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleFormLandmarks_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleNavigationLandmarks_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleArticleRoles_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleGroupRoles_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleContentinfoInSiblingSet_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_OneBannerInSiblingSet_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ContentinfoWithNoMain_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ComplementaryRequiredLabel_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleRegionsUniqueLabel_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleMainsRequireLabel_Implicit_2",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.4.2",
            "name": "Page Titled",
            "summary": "Web pages, non-web documents, and software have titles that describe topic or purpose.",
            "rules": [
                {
                    id: "WCAG20_Doc_HasTitle",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Title_Valid",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.4.3",
            "name": "Focus Order",
            "summary": "If content can be navigated sequentially and the navigation sequences affect meaning or operation, focusable components receive focus in an order that preserves meaning and operability.",
            "rules": []
        },
        {
            "num": "2.4.4",
            "name": "Link Purpose (In Context)",
            "summary": "The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link content.",
            "rules": [
                {
                    id: "WCAG20_A_HasText",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.4.5",
            "name": "Multiple Ways",
            "summary": "More than one way is available to locate a Web page within a set of Web pages, except where the Web Page is the result of, or a step in, a process.",
            "rules": []
        },
        {
            "num": "2.4.6",
            "name": "Headings and Labels",
            "summary": "Headings and labels describe topic or purpose.",
            "rules": [
                {
                    id: "RPT_Header_HasContent",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.4.7",
            "name": "Focus Visible",
            "summary": "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.",
            "rules": [
                {
                    id: "RPT_Style_HinderFocus1",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Script_FocusBlurs",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.5.1",
            "name": "Pointer Gestures",
            "summary": "All functionality that uses multipoint or path-based gestures for operation can be operated with a single pointer without a path-based gesture.",
            "rules": []
        },
        {
            "num": "2.5.2",
            "name": "Pointer Cancellation",
            "summary": "For functionality that can be operated using a single pointer, completion of the function is on the up-event with an ability to abort, undo or reverse the outcome.",
            "rules": []
        },
        {
            "num": "2.5.3",
            "name": "Label in Name",
            "summary": "For user interface components with labels that include text or images of text, the accessible name contains the text that is presented visually.",
            "rules": [
                {
                    id: "WCAG21_Label_Accessible",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.5.4",
            "name": "Motion Actuation",
            "summary": "Functionality that can be operated by motion can also be operated by user interface components, and the motion trigger can be disabled.",
            "rules": []
        },
        {
            "num": "3.1.1",
            "name": "Language of Page",
            "summary": "The default human language of Web pages, non-Web documents, or software can be programmatically determined.",
            "rules": [
                {
                    id: "WCAG20_Html_HasLang",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "3.1.2",
            "name": "Language of Parts",
            "summary": "The human language of each passage or phrase in the content can be programmatically determined.",
            "rules": [
                {
                    id: "WCAG20_Elem_Lang_Valid",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "3.2.1",
            "name": "On Focus",
            "summary": "When any component receives focus, it does not initiate a change of context.",
            "rules": [
                {
                    id: "WCAG20_Select_NoChangeAction",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Script_FocusBlurs",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "3.2.2",
            "name": "On Input",
            "summary": "Changing the setting of any user interface component does not automatically cause a change of context unless the user has been advised of the behavior before using the component.",
            "rules": [
                {
                    id: "WCAG20_A_TargetAndText",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Form_HasSubmit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Form_TargetAndText",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Input_HasOnchange",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Form_ChangeEmpty",
                    level: eRulePolicy.RECOMMENDATION
                }
            ]
        },
        {
            "num": "3.2.3",
            "name": "Consistent Navigation",
            "summary": "Navigational mechanisms that are repeated on multiple Web pages within a set of Web pages occur in the same relative order each time they are repeated, unless a change is initiated by the user.",
            "rules": []
        },
        {
            "num": "3.2.4",
            "name": "Consistent Identification",
            "summary": "Components that have the same functionality within a set of Web pages are identified consistently.",
            "rules": []
        },
        {
            "num": "3.3.1",
            "name": "Error Identification",
            "summary": "If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.",
            "rules": [
                {
                    id: "HAAC_Aria_ErrorMessage",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "3.3.2",
            "name": "Labels or Instructions",
            "summary": "Labels or instructions are provided when content requires user input.",
            "rules": [
                {
                    id: "WCAG20_Input_LabelBefore",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Input_LabelAfter",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Accesskey_NeedLabel",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_Aria_Or_HTML5_Attr",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Input_Placeholder",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Input_VisibleLabel",
                    level: eRulePolicy.VIOLATION
                },
            ]
        },
        {
            "num": "3.3.3",
            "name": "Error Suggestion",
            "summary": "If an input error is automatically detected and suggestions for correction are known, then the suggestions are provided to the user, unless it would jeopardize the security or purpose of the content.",
            "rules": []
        },
        {
            "num": "3.3.4",
            "name": "Error Prevention (Legal, Financial, Data)",
            "summary": "For content that cause legal commitments or financial transactions for the user to occur, that modify or delete user-controllable data in data storage systems, or that submit user test responses, the user can reverse, correct, or confirm the action.",
            "rules": []
        },
        {
            "num": "4.1.1",
            "name": "Parsing",
            "summary": "In content implemented using markup languages, elements have complete start and end tags, elements are nested according to their specifications, elements do not contain duplicate attributes, and any IDs are unique, except where the specifications allow these features.",
            "rules": [
                {
                    id: "RPT_Elem_UniqueId",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Elem_UniqueAccessKey",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "4.1.2",
            "name": "Name, Role, Value",
            "summary": "For all user interface components (including, but not limited to: form elements, links and components generated by scripts), the name and role can be programmatically determined; states, properties, and values that can be set by the user can be programmatically set; and notification of changes to these items is available to user agents, including assistive technologies.",
            "rules": [
                {
                    id: "WCAG20_Input_ExplicitLabel",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Valerie_Label_HasContent",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ValidRole",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ValidPropertyValue",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ValidIdRef",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_RequiredProperties",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_EmptyPropertyValue",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ValidProperty",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Aria_ImgAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Canvas",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_Aria_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_RequiredChildren_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_RequiredParent_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_EventHandlerMissingRole_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_WidgetLabels_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_ARIA_11_Guideline",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_List_Group_ListItem",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_ActiveDescendantCheck",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleToolbarUniqueLabel",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_Must_Have_Text_Input",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_DOM_Focus",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_Autocomplete",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_Autocomplete_Invalid",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_Expanded",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_Popup",
                    level: eRulePolicy.VIOLATION
                }
            ]
        }
    ]    
},
{
    id: "WCAG_2_1",
    name: "WCAG 2.1",
    category: eRuleCategory.ACCESSIBILITY,
    description: "Rules for Web Content Accessibility Guidelines (WCAG ) 2.1level A and level AA. This is the current W3C recommendation and extends Web Content Accessibility Guidelines 2.0. Content that conforms to WCAG 2.1 also conforms to WCAG 2.0.", 
    "checkpoints": [
        {
            "num": "1.1.1",
            "name": "Non-text Content",
            "summary": "All non-text content that is presented to the user has a text alternative that serves the equivalent purpose.",
            "rules": [
                {
                    id: "WCAG20_Input_ExplicitLabelImage",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Img_UsemapValid",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Object_HasText",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Applet_HasAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Input_ExplicitLabel",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Area_HasAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Img_AltCommonMisuse",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Img_LongDescription2",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Img_HasAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Pre_ASCIIArt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Media_AudioVideoAltFilename",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Img_LinkTextNotRedundant",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Img_TitleEmptyWhenAltNull",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Img_UsemapAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Text_Emoticons",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Img_PresentationImgHasNonNullAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Figure_label",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Media_AltBrief",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Embed_HasNoEmbed",
                    level: eRulePolicy.RECOMMENDATION
                },
                
                {
                    id: "RPT_Embed_HasAlt",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "Valerie_Noembed_HasContent",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_Canvas",
                    level: eRulePolicy.RECOMMENDATION
                }
            ]
        },
        {
            "num": "1.2.1",
            "name": "Audio-only and Video-only (Prerecorded)",
            "summary": "For prerecorded audio-only or video-only media, an alternative provides equivalent information.",
            "rules": [
                {
                    id: "HAAC_Video_HasNoTrack",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Media_AudioTrigger",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_Video_HasNoTrack",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.2.2",
            "name": "Captions (Prerecorded)",
            "summary": "Captions are provided for all prerecorded audio content in synchronized media.",
            "rules": [
                {
                    id: "HAAC_Video_HasNoTrack",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.2.3",
            "name": "Audio Description or Media Alternative (Prerecorded)",
            "summary": "An alternative for time-based media or audio description of the prerecorded video content is provided for synchronized media.",
            "rules": [
                {
                    id: "RPT_Media_VideoReferenceTrigger",
                    level: eRulePolicy.RECOMMENDATION
                }
            ]
        },
        {
            "num": "1.2.4",
            "name": "Captions (Live)",
            "summary": "Captions are provided for all live audio content in synchronized media.",
            "rules": [
                {
                    id: "HAAC_Video_HasNoTrack",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Media_VideoObjectTrigger",
                    level: eRulePolicy.RECOMMENDATION
                },
            ]
        },
        {
            "num": "1.2.5",
            "name": "Audio Description (Prerecorded)",
            "summary": "Audio description is provided for all prerecorded video content in synchronized media.",
            "rules": [
                {
                    id: "RPT_Media_VideoReferenceTrigger",
                    level: eRulePolicy.RECOMMENDATION
                }
            ]
        },
        {
            "num": "1.3.1",
            "name": "Info and Relationships",
            "summary": "Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text.",
            "rules": [
                {
                    id: "RPT_Headers_FewWords",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Blockquote_HasCite",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Blockquote_WrapsTextQuote",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Block_ShouldBeHeading",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Label_UniqueFor",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Style_BackgroundImage",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_List_UseMarkup",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Script_OnclickHTML1",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Fieldset_HasLegend",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Table_CapSummRedundant",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Table_Scope_Valid",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Input_RadioChkInFieldSet",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Valerie_Caption_HasContent",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Valerie_Caption_InTable",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Valerie_Table_DataCellRelationships",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Table_DataHeadingsAria",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Label_RefValid",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Style_BeforeAfter",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_List_Misuse",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Select_HasOptGroup",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "RPT_Script_OnclickHTML2",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Input_InFieldSet",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "RPT_Table_LayoutTrigger",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_BackgroundImg_HasTextOrTitle",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Table_Structure",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Style_Trigger2",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Table_SummaryAria3",
                    level: eRulePolicy.RECOMMENDATION
                },
                
            ]
        },
        {
            "num": "1.3.2",
            "name": "Meaningful Sequence",
            "summary": "When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined.",
            "rules": [
                {
                    id: "Valerie_Elem_DirValid",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Text_LetterSpacing",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.3.3",
            "name": "Sensory Characteristics",
            "summary": "Instructions provided for understanding and operating content do not rely solely on sensory characteristics of components such as shape, size, visual location, orientation, or sound.",
            "rules": [
                {
                    id: "RPT_Text_SensoryReference",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.3.4",
            "name": "Orientation",
            "summary": "Content does not restrict its view and operation to a single display orientation, such as portrait or landscape.",
            "rules": []
        },
        {
            "num": "1.3.5",
            "name": "Identify Input Purpose",
            "summary": "The purpose of each input field that collects information about the user can be programmatically determined when the field serves a common purpose.",
            "rules": [
                {
                    id: "WCAG21_Input_Autocomplete",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.4.1",
            "name": "Use of Color",
            "summary": "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.",
            "rules": [
                {
                    id: "RPT_Font_ColorInForm",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Style_ColorSemantics1",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.4.2",
            "name": "Audio Control",
            "summary": "If any audio plays automatically for more than 3 seconds, either a mechanism is available to pause or stop the audio, or a mechanism is available to control audio volume independently from the overall system volume level.",
            "rules": [
                {
                    id: "RPT_Embed_AutoStart",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.4.3",
            "name": "Contrast (Minimum)",
            "summary": "The visual presentation of text and images of text has a contrast ratio of at least 4.5:1, with a 3:1 ratio for large-scale text.",
            "rules": [
                {
                    id: "IBMA_Color_Contrast_WCAG2AA",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "IBMA_Color_Contrast_WCAG2AA_PV",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.4.4",
            "name": "Resize Text",
            "summary": "Text can be resized without assistive technology up to 200 percent without loss of content or functionality.",
            "rules": [
                {
                    id: "WCAG21_Style_Viewport",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.4.5",
            "name": "Images of Text",
            "summary": "If the technologies being used can achieve the visual presentation, text is used to convey information rather than images of text.",
            "rules": []
        },
        {
            "num": "1.4.10",
            "name": "Reflow",
            "summary": "Content can reflow without loss of information or functionality, and without requiring scrolling in two dimensions.",
            "rules": []
        },
        {
            "num": "1.4.11",
            "name": "Non-text Contrast",
            "summary": "The parts of graphical objects required to understand the content, and the visual information required to identify UI components and states, have a contrast ratio of at least 3:1 against adjacent colors.",
            "rules": []
        },
        {
            "num": "1.4.12",
            "name": "Text Spacing",
            "summary": "No loss of content or functionality occurs when users change letter, word and paragraph spacing, as well as line height.",
            "rules": []
        },
        {
            "num": "1.4.13",
            "name": "Content on Hover or Focus",
            "summary": "Where hover or focus actions cause additional content to become visible and hidden, the additional content is dismissable, hoverable and persistent.",
            "rules": []
        },
        {
            "num": "2.1.1",
            "name": "Keyboard",
            "summary": "All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes.",
            "rules": [
                {
                    id: "RPT_Elem_EventMouseAndKey",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "Rpt_Aria_InvalidTabindexForActivedescendant",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MissingFocusableChild",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MissingKeyboardHandler",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Audio_Video_Trigger",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Application_Role_Text",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.1.2",
            "name": "No Keyboard Trap",
            "summary": "If keyboard focus can be moved to a component using a keyboard interface, then focus can be moved away from that component using only a keyboard interface, and, if it requires more than unmodified arrow or tab keys or other standard exit methods, the user is advised of the method for moving focus away.",
            "rules": [
                {
                    id: "HAAC_Media_DocumentTrigger2",
                    level: eRulePolicy.RECOMMENDATION
                }
            ]
        },
        {
            "num": "2.1.4",
            "name": "Character Key Shortcuts",
            "summary": "If a keyboard shortcut is implemented using only letter, punctuation, number or symbol characters, then the shortcut can be turned off, remapped or activated only on focus.",
            "rules": []
        },
        {
            "num": "2.2.1",
            "name": "Timing Adjustable",
            "summary": "For each time limit that is set by the content, the user can turn off, adjust, or extend the limit.",
            "rules": [
                {
                    id: "RPT_Meta_Refresh",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Meta_RedirectZero",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.2.2",
            "name": "Pause, Stop, Hide",
            "summary": "For moving, blinking, scrolling, or auto-updating information, the user can pause, stop, hide or adjust the information.",
            "rules": [
                {
                    id: "RPT_Marquee_Trigger",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Blink_AlwaysTrigger",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Blink_CSSTrigger1",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.3.1",
            "name": "Three Flashes or Below Threshold",
            "summary": "Content does not contain anything that flashes more than three times in any one second period, or the flash is below the general flash and red flash thresholds.",
            "rules": []
        },
        {
            "num": "2.4.1",
            "name": "Bypass Blocks",
            "summary": "A mechanism is available to bypass blocks of content that are repeated on multiple Web pages.",
            "rules": [
                {
                    id: "WCAG20_Frame_HasTitle",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Html_SkipNav",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Valerie_Frame_SrcHtml",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleSearchLandmarks",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ComplementaryLandmarkLabel_Implicit",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "Rpt_Aria_MultipleApplicationLandmarks",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ApplicationLandmarkLabel",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleDocumentRoles",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Body_FirstASkips_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Body_FirstAContainsSkipText_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_OrphanedContent_Native_Host_Sematics",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "Rpt_Aria_RegionLabel_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleMainsVisibleLabel_Implicit",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "Rpt_Aria_MultipleBannerLandmarks_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleComplementaryLandmarks_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleContentinfoLandmarks_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleFormLandmarks_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleNavigationLandmarks_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleArticleRoles_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleGroupRoles_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleContentinfoInSiblingSet_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_OneBannerInSiblingSet_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ContentinfoWithNoMain_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ComplementaryRequiredLabel_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleRegionsUniqueLabel_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleMainsRequireLabel_Implicit_2",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.4.2",
            "name": "Page Titled",
            "summary": "Web pages, non-web documents, and software have titles that describe topic or purpose.",
            "rules": [
                {
                    id: "WCAG20_Doc_HasTitle",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Title_Valid",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.4.3",
            "name": "Focus Order",
            "summary": "If content can be navigated sequentially and the navigation sequences affect meaning or operation, focusable components receive focus in an order that preserves meaning and operability.",
            "rules": []
        },
        {
            "num": "2.4.4",
            "name": "Link Purpose (In Context)",
            "summary": "The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link content.",
            "rules": [
                {
                    id: "WCAG20_A_HasText",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.4.5",
            "name": "Multiple Ways",
            "summary": "More than one way is available to locate a Web page within a set of Web pages, except where the Web Page is the result of, or a step in, a process.",
            "rules": []
        },
        {
            "num": "2.4.6",
            "name": "Headings and Labels",
            "summary": "Headings and labels describe topic or purpose.",
            "rules": [
                {
                    id: "RPT_Header_HasContent",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.4.7",
            "name": "Focus Visible",
            "summary": "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.",
            "rules": [
                {
                    id: "RPT_Style_HinderFocus1",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Script_FocusBlurs",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.5.1",
            "name": "Pointer Gestures",
            "summary": "All functionality that uses multipoint or path-based gestures for operation can be operated with a single pointer without a path-based gesture.",
            "rules": []
        },
        {
            "num": "2.5.2",
            "name": "Pointer Cancellation",
            "summary": "For functionality that can be operated using a single pointer, completion of the function is on the up-event with an ability to abort, undo or reverse the outcome.",
            "rules": []
        },
        {
            "num": "2.5.3",
            "name": "Label in Name",
            "summary": "For user interface components with labels that include text or images of text, the accessible name contains the text that is presented visually.",
            "rules": [
                {
                    id: "WCAG21_Label_Accessible",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.5.4",
            "name": "Motion Actuation",
            "summary": "Functionality that can be operated by motion can also be operated by user interface components, and the motion trigger can be disabled.",
            "rules": []
        },
        {
            "num": "3.1.1",
            "name": "Language of Page",
            "summary": "The default human language of Web pages, non-Web documents, or software can be programmatically determined.",
            "rules": [
                {
                    id: "WCAG20_Html_HasLang",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "3.1.2",
            "name": "Language of Parts",
            "summary": "The human language of each passage or phrase in the content can be programmatically determined.",
            "rules": [
                {
                    id: "WCAG20_Elem_Lang_Valid",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "3.2.1",
            "name": "On Focus",
            "summary": "When any component receives focus, it does not initiate a change of context.",
            "rules": [
                {
                    id: "WCAG20_Select_NoChangeAction",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Script_FocusBlurs",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "3.2.2",
            "name": "On Input",
            "summary": "Changing the setting of any user interface component does not automatically cause a change of context unless the user has been advised of the behavior before using the component.",
            "rules": [
                {
                    id: "WCAG20_A_TargetAndText",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Form_HasSubmit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Form_TargetAndText",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Input_HasOnchange",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Form_ChangeEmpty",
                    level: eRulePolicy.RECOMMENDATION
                }
            ]
        },
        {
            "num": "3.2.3",
            "name": "Consistent Navigation",
            "summary": "Navigational mechanisms that are repeated on multiple Web pages within a set of Web pages occur in the same relative order each time they are repeated, unless a change is initiated by the user.",
            "rules": []
        },
        {
            "num": "3.2.4",
            "name": "Consistent Identification",
            "summary": "Components that have the same functionality within a set of Web pages are identified consistently.",
            "rules": []
        },
        {
            "num": "3.3.1",
            "name": "Error Identification",
            "summary": "If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.",
            "rules": [
                {
                    id: "HAAC_Aria_ErrorMessage",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "3.3.2",
            "name": "Labels or Instructions",
            "summary": "Labels or instructions are provided when content requires user input.",
            "rules": [
                {
                    id: "WCAG20_Input_LabelBefore",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Input_LabelAfter",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Accesskey_NeedLabel",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_Aria_Or_HTML5_Attr",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Input_Placeholder",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Input_VisibleLabel",
                    level: eRulePolicy.VIOLATION
                },
            ]
        },
        {
            "num": "3.3.3",
            "name": "Error Suggestion",
            "summary": "If an input error is automatically detected and suggestions for correction are known, then the suggestions are provided to the user, unless it would jeopardize the security or purpose of the content.",
            "rules": []
        },
        {
            "num": "3.3.4",
            "name": "Error Prevention (Legal, Financial, Data)",
            "summary": "For content that cause legal commitments or financial transactions for the user to occur, that modify or delete user-controllable data in data storage systems, or that submit user test responses, the user can reverse, correct, or confirm the action.",
            "rules": []
        },
        {
            "num": "4.1.1",
            "name": "Parsing",
            "summary": "In content implemented using markup languages, elements have complete start and end tags, elements are nested according to their specifications, elements do not contain duplicate attributes, and any IDs are unique, except where the specifications allow these features.",
            "rules": [
                {
                    id: "RPT_Elem_UniqueId",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Elem_UniqueAccessKey",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "4.1.2",
            "name": "Name, Role, Value",
            "summary": "For all user interface components (including, but not limited to: form elements, links and components generated by scripts), the name and role can be programmatically determined; states, properties, and values that can be set by the user can be programmatically set; and notification of changes to these items is available to user agents, including assistive technologies.",
            "rules": [
                {
                    id: "WCAG20_Input_ExplicitLabel",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Valerie_Label_HasContent",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ValidRole",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ValidPropertyValue",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ValidIdRef",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_RequiredProperties",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_EmptyPropertyValue",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ValidProperty",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Aria_ImgAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Canvas",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_Aria_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_RequiredChildren_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_RequiredParent_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_EventHandlerMissingRole_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_WidgetLabels_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_ARIA_11_Guideline",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_List_Group_ListItem",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_ActiveDescendantCheck",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleToolbarUniqueLabel",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_Must_Have_Text_Input",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_DOM_Focus",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_Autocomplete",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_Autocomplete_Invalid",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_Expanded",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_Popup",
                    level: eRulePolicy.VIOLATION
                }
            ]
        }
    ]    
},
{
    id: "WCAG_2_0",
    name: "WCAG 2.0",
    category: eRuleCategory.ACCESSIBILITY,
    description: "Rules for Web Content Accessibility Guidelines 2.0level A and level AA, published asa W3C Recommendation December 2008.",
    "checkpoints": [
        {
            "num": "1.1.1",
            "name": "Non-text Content",
            "summary": "All non-text content that is presented to the user has a text alternative that serves the equivalent purpose.",
            "rules": [
                {
                    id: "WCAG20_Input_ExplicitLabelImage",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Img_UsemapValid",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Object_HasText",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Applet_HasAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Input_ExplicitLabel",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Area_HasAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Img_AltCommonMisuse",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Img_LongDescription2",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Img_HasAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Pre_ASCIIArt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Media_AudioVideoAltFilename",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Img_LinkTextNotRedundant",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Img_TitleEmptyWhenAltNull",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Img_UsemapAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Text_Emoticons",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Img_PresentationImgHasNonNullAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Figure_label",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Media_AltBrief",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Embed_HasNoEmbed",
                    level: eRulePolicy.RECOMMENDATION
                },
                
                {
                    id: "RPT_Embed_HasAlt",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "Valerie_Noembed_HasContent",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_Canvas",
                    level: eRulePolicy.RECOMMENDATION
                }
            ]
        },
        {
            "num": "1.2.1",
            "name": "Audio-only and Video-only (Prerecorded)",
            "summary": "For prerecorded audio-only or video-only media, an alternative provides equivalent information.",
            "rules": [
                {
                    id: "HAAC_Video_HasNoTrack",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Media_AudioTrigger",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_Video_HasNoTrack",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.2.2",
            "name": "Captions (Prerecorded)",
            "summary": "Captions are provided for all prerecorded audio content in synchronized media.",
            "rules": [
                {
                    id: "HAAC_Video_HasNoTrack",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.2.3",
            "name": "Audio Description or Media Alternative (Prerecorded)",
            "summary": "An alternative for time-based media or audio description of the prerecorded video content is provided for synchronized media.",
            "rules": [
                {
                    id: "RPT_Media_VideoReferenceTrigger",
                    level: eRulePolicy.RECOMMENDATION
                }
            ]
        },
        {
            "num": "1.2.4",
            "name": "Captions (Live)",
            "summary": "Captions are provided for all live audio content in synchronized media.",
            "rules": [
                {
                    id: "HAAC_Video_HasNoTrack",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Media_VideoObjectTrigger",
                    level: eRulePolicy.RECOMMENDATION
                },
            ]
        },
        {
            "num": "1.2.5",
            "name": "Audio Description (Prerecorded)",
            "summary": "Audio description is provided for all prerecorded video content in synchronized media.",
            "rules": [
                {
                    id: "RPT_Media_VideoReferenceTrigger",
                    level: eRulePolicy.RECOMMENDATION
                }
            ]
        },
        {
            "num": "1.3.1",
            "name": "Info and Relationships",
            "summary": "Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text.",
            "rules": [
                {
                    id: "RPT_Headers_FewWords",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Blockquote_HasCite",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Blockquote_WrapsTextQuote",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Block_ShouldBeHeading",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Label_UniqueFor",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Style_BackgroundImage",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_List_UseMarkup",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Script_OnclickHTML1",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Fieldset_HasLegend",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Table_CapSummRedundant",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Table_Scope_Valid",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Input_RadioChkInFieldSet",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Valerie_Caption_HasContent",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Valerie_Caption_InTable",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Valerie_Table_DataCellRelationships",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Table_DataHeadingsAria",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Label_RefValid",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Style_BeforeAfter",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_List_Misuse",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Select_HasOptGroup",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "RPT_Script_OnclickHTML2",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Input_InFieldSet",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "RPT_Table_LayoutTrigger",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_BackgroundImg_HasTextOrTitle",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Table_Structure",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Style_Trigger2",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Table_SummaryAria3",
                    level: eRulePolicy.RECOMMENDATION
                },
                
            ]
        },
        {
            "num": "1.3.2",
            "name": "Meaningful Sequence",
            "summary": "When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined.",
            "rules": [
                {
                    id: "Valerie_Elem_DirValid",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Text_LetterSpacing",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.3.3",
            "name": "Sensory Characteristics",
            "summary": "Instructions provided for understanding and operating content do not rely solely on sensory characteristics of components such as shape, size, visual location, orientation, or sound.",
            "rules": [
                {
                    id: "RPT_Text_SensoryReference",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.4.1",
            "name": "Use of Color",
            "summary": "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.",
            "rules": [
                {
                    id: "RPT_Font_ColorInForm",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Style_ColorSemantics1",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.4.2",
            "name": "Audio Control",
            "summary": "If any audio plays automatically for more than 3 seconds, either a mechanism is available to pause or stop the audio, or a mechanism is available to control audio volume independently from the overall system volume level.",
            "rules": [
                {
                    id: "RPT_Embed_AutoStart",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.4.3",
            "name": "Contrast (Minimum)",
            "summary": "The visual presentation of text and images of text has a contrast ratio of at least 4.5:1, with a 3:1 ratio for large-scale text.",
            "rules": [
                {
                    id: "IBMA_Color_Contrast_WCAG2AA",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "IBMA_Color_Contrast_WCAG2AA_PV",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.4.4",
            "name": "Resize Text",
            "summary": "Text can be resized without assistive technology up to 200 percent without loss of content or functionality.",
            "rules": [
                {
                    id: "WCAG21_Style_Viewport",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.4.5",
            "name": "Images of Text",
            "summary": "If the technologies being used can achieve the visual presentation, text is used to convey information rather than images of text.",
            "rules": []
        },
        {
            "num": "2.1.1",
            "name": "Keyboard",
            "summary": "All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes.",
            "rules": [
                {
                    id: "RPT_Elem_EventMouseAndKey",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "Rpt_Aria_InvalidTabindexForActivedescendant",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MissingFocusableChild",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MissingKeyboardHandler",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Audio_Video_Trigger",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Application_Role_Text",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.1.2",
            "name": "No Keyboard Trap",
            "summary": "If keyboard focus can be moved to a component using a keyboard interface, then focus can be moved away from that component using only a keyboard interface, and, if it requires more than unmodified arrow or tab keys or other standard exit methods, the user is advised of the method for moving focus away.",
            "rules": [
                {
                    id: "HAAC_Media_DocumentTrigger2",
                    level: eRulePolicy.RECOMMENDATION
                }
            ]
        },
        {
            "num": "2.2.1",
            "name": "Timing Adjustable",
            "summary": "For each time limit that is set by the content, the user can turn off, adjust, or extend the limit.",
            "rules": [
                {
                    id: "RPT_Meta_Refresh",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Meta_RedirectZero",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.2.2",
            "name": "Pause, Stop, Hide",
            "summary": "For moving, blinking, scrolling, or auto-updating information, the user can pause, stop, hide or adjust the information.",
            "rules": [
                {
                    id: "RPT_Marquee_Trigger",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Blink_AlwaysTrigger",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Blink_CSSTrigger1",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.3.1",
            "name": "Three Flashes or Below Threshold",
            "summary": "Content does not contain anything that flashes more than three times in any one second period, or the flash is below the general flash and red flash thresholds.",
            "rules": []
        },
        {
            "num": "2.4.1",
            "name": "Bypass Blocks",
            "summary": "A mechanism is available to bypass blocks of content that are repeated on multiple Web pages.",
            "rules": [
                {
                    id: "WCAG20_Frame_HasTitle",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Html_SkipNav",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Valerie_Frame_SrcHtml",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleSearchLandmarks",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ComplementaryLandmarkLabel_Implicit",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "Rpt_Aria_MultipleApplicationLandmarks",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ApplicationLandmarkLabel",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleDocumentRoles",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Body_FirstASkips_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Body_FirstAContainsSkipText_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_OrphanedContent_Native_Host_Sematics",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "Rpt_Aria_RegionLabel_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleMainsVisibleLabel_Implicit",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "Rpt_Aria_MultipleBannerLandmarks_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleComplementaryLandmarks_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleContentinfoLandmarks_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleFormLandmarks_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleNavigationLandmarks_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleArticleRoles_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleGroupRoles_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleContentinfoInSiblingSet_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_OneBannerInSiblingSet_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ContentinfoWithNoMain_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ComplementaryRequiredLabel_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleRegionsUniqueLabel_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleMainsRequireLabel_Implicit_2",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.4.2",
            "name": "Page Titled",
            "summary": "Web pages, non-web documents, and software have titles that describe topic or purpose.",
            "rules": [
                {
                    id: "WCAG20_Doc_HasTitle",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Title_Valid",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.4.3",
            "name": "Focus Order",
            "summary": "If content can be navigated sequentially and the navigation sequences affect meaning or operation, focusable components receive focus in an order that preserves meaning and operability.",
            "rules": []
        },
        {
            "num": "2.4.4",
            "name": "Link Purpose (In Context)",
            "summary": "The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link content.",
            "rules": [
                {
                    id: "WCAG20_A_HasText",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.4.5",
            "name": "Multiple Ways",
            "summary": "More than one way is available to locate a Web page within a set of Web pages, except where the Web Page is the result of, or a step in, a process.",
            "rules": []
        },
        {
            "num": "2.4.6",
            "name": "Headings and Labels",
            "summary": "Headings and labels describe topic or purpose.",
            "rules": [
                {
                    id: "RPT_Header_HasContent",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.4.7",
            "name": "Focus Visible",
            "summary": "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.",
            "rules": [
                {
                    id: "RPT_Style_HinderFocus1",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Script_FocusBlurs",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "3.1.1",
            "name": "Language of Page",
            "summary": "The default human language of Web pages, non-Web documents, or software can be programmatically determined.",
            "rules": [
                {
                    id: "WCAG20_Html_HasLang",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "3.1.2",
            "name": "Language of Parts",
            "summary": "The human language of each passage or phrase in the content can be programmatically determined.",
            "rules": [
                {
                    id: "WCAG20_Elem_Lang_Valid",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "3.2.1",
            "name": "On Focus",
            "summary": "When any component receives focus, it does not initiate a change of context.",
            "rules": [
                {
                    id: "WCAG20_Select_NoChangeAction",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Script_FocusBlurs",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "3.2.2",
            "name": "On Input",
            "summary": "Changing the setting of any user interface component does not automatically cause a change of context unless the user has been advised of the behavior before using the component.",
            "rules": [
                {
                    id: "WCAG20_A_TargetAndText",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Form_HasSubmit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Form_TargetAndText",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Input_HasOnchange",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Form_ChangeEmpty",
                    level: eRulePolicy.RECOMMENDATION
                }
            ]
        },
        {
            "num": "3.2.3",
            "name": "Consistent Navigation",
            "summary": "Navigational mechanisms that are repeated on multiple Web pages within a set of Web pages occur in the same relative order each time they are repeated, unless a change is initiated by the user.",
            "rules": []
        },
        {
            "num": "3.2.4",
            "name": "Consistent Identification",
            "summary": "Components that have the same functionality within a set of Web pages are identified consistently.",
            "rules": []
        },
        {
            "num": "3.3.1",
            "name": "Error Identification",
            "summary": "If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.",
            "rules": [
                {
                    id: "HAAC_Aria_ErrorMessage",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "3.3.2",
            "name": "Labels or Instructions",
            "summary": "Labels or instructions are provided when content requires user input.",
            "rules": [
                {
                    id: "WCAG20_Input_LabelBefore",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Input_LabelAfter",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Accesskey_NeedLabel",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_Aria_Or_HTML5_Attr",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Input_Placeholder",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Input_VisibleLabel",
                    level: eRulePolicy.VIOLATION
                },
            ]
        },
        {
            "num": "3.3.3",
            "name": "Error Suggestion",
            "summary": "If an input error is automatically detected and suggestions for correction are known, then the suggestions are provided to the user, unless it would jeopardize the security or purpose of the content.",
            "rules": []
        },
        {
            "num": "3.3.4",
            "name": "Error Prevention (Legal, Financial, Data)",
            "summary": "For content that cause legal commitments or financial transactions for the user to occur, that modify or delete user-controllable data in data storage systems, or that submit user test responses, the user can reverse, correct, or confirm the action.",
            "rules": []
        },
        {
            "num": "4.1.1",
            "name": "Parsing",
            "summary": "In content implemented using markup languages, elements have complete start and end tags, elements are nested according to their specifications, elements do not contain duplicate attributes, and any IDs are unique, except where the specifications allow these features.",
            "rules": [
                {
                    id: "RPT_Elem_UniqueId",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Elem_UniqueAccessKey",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "4.1.2",
            "name": "Name, Role, Value",
            "summary": "For all user interface components (including, but not limited to: form elements, links and components generated by scripts), the name and role can be programmatically determined; states, properties, and values that can be set by the user can be programmatically set; and notification of changes to these items is available to user agents, including assistive technologies.",
            "rules": [
                {
                    id: "WCAG20_Input_ExplicitLabel",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Valerie_Label_HasContent",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ValidRole",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ValidPropertyValue",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ValidIdRef",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_RequiredProperties",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_EmptyPropertyValue",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ValidProperty",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Aria_ImgAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Canvas",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_Aria_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_RequiredChildren_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_RequiredParent_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_EventHandlerMissingRole_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_WidgetLabels_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_ARIA_11_Guideline",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_List_Group_ListItem",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_ActiveDescendantCheck",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleToolbarUniqueLabel",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_Must_Have_Text_Input",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_DOM_Focus",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_Autocomplete",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_Autocomplete_Invalid",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_Expanded",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_Popup",
                    level: eRulePolicy.VIOLATION
                }
            ]
        }
    ]    
},
{
    id: "IBM_Accessibility_BETA",
    name: "IBM Accessibility Experimental",
    category: eRuleCategory.ACCESSIBILITY,
    description: "",
    "checkpoints": [
        {
            "num": "1.1.1",
            "name": "Non-text Content",
            "summary": "All non-text content that is presented to the user has a text alternative that serves the equivalent purpose.",
            "rules": [
                {
                    id: "WCAG20_Input_ExplicitLabelImage",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Img_UsemapValid",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Object_HasText",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Applet_HasAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Input_ExplicitLabel",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Area_HasAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Img_AltCommonMisuse",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Img_LongDescription2",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Img_HasAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Pre_ASCIIArt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Media_AudioVideoAltFilename",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Img_LinkTextNotRedundant",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Img_TitleEmptyWhenAltNull",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Img_UsemapAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Text_Emoticons",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Img_PresentationImgHasNonNullAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Figure_label",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Media_AltBrief",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Embed_HasNoEmbed",
                    level: eRulePolicy.RECOMMENDATION
                },
                
                {
                    id: "RPT_Embed_HasAlt",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "Valerie_Noembed_HasContent",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_Canvas",
                    level: eRulePolicy.RECOMMENDATION
                }
            ]
        },
        {
            "num": "1.2.1",
            "name": "Audio-only and Video-only (Prerecorded)",
            "summary": "For prerecorded audio-only or video-only media, an alternative provides equivalent information.",
            "rules": [
                {
                    id: "HAAC_Video_HasNoTrack",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Media_AudioTrigger",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_Video_HasNoTrack",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.2.2",
            "name": "Captions (Prerecorded)",
            "summary": "Captions are provided for all prerecorded audio content in synchronized media.",
            "rules": [
                {
                    id: "HAAC_Video_HasNoTrack",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.2.3",
            "name": "Audio Description or Media Alternative (Prerecorded)",
            "summary": "An alternative for time-based media or audio description of the prerecorded video content is provided for synchronized media.",
            "rules": [
                {
                    id: "RPT_Media_VideoReferenceTrigger",
                    level: eRulePolicy.RECOMMENDATION
                }
            ]
        },
        {
            "num": "1.2.4",
            "name": "Captions (Live)",
            "summary": "Captions are provided for all live audio content in synchronized media.",
            "rules": [
                {
                    id: "HAAC_Video_HasNoTrack",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Media_VideoObjectTrigger",
                    level: eRulePolicy.RECOMMENDATION
                },
            ]
        },
        {
            "num": "1.2.5",
            "name": "Audio Description (Prerecorded)",
            "summary": "Audio description is provided for all prerecorded video content in synchronized media.",
            "rules": [
                {
                    id: "RPT_Media_VideoReferenceTrigger",
                    level: eRulePolicy.RECOMMENDATION
                }
            ]
        },
        {
            "num": "1.3.1",
            "name": "Info and Relationships",
            "summary": "Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text.",
            "rules": [
                {
                    id: "RPT_Headers_FewWords",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Blockquote_HasCite",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Blockquote_WrapsTextQuote",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Block_ShouldBeHeading",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Label_UniqueFor",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Style_BackgroundImage",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_List_UseMarkup",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Script_OnclickHTML1",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Fieldset_HasLegend",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Table_CapSummRedundant",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Table_Scope_Valid",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Input_RadioChkInFieldSet",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Valerie_Caption_HasContent",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Valerie_Caption_InTable",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Valerie_Table_DataCellRelationships",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Table_DataHeadingsAria",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Label_RefValid",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Style_BeforeAfter",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_List_Misuse",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Select_HasOptGroup",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "RPT_Script_OnclickHTML2",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Input_InFieldSet",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "RPT_Table_LayoutTrigger",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_BackgroundImg_HasTextOrTitle",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Table_Structure",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Style_Trigger2",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Table_SummaryAria3",
                    level: eRulePolicy.RECOMMENDATION
                },
                
            ]
        },
        {
            "num": "1.3.2",
            "name": "Meaningful Sequence",
            "summary": "When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined.",
            "rules": [
                {
                    id: "Valerie_Elem_DirValid",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Text_LetterSpacing",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.3.3",
            "name": "Sensory Characteristics",
            "summary": "Instructions provided for understanding and operating content do not rely solely on sensory characteristics of components such as shape, size, visual location, orientation, or sound.",
            "rules": [
                {
                    id: "RPT_Text_SensoryReference",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.3.4",
            "name": "Orientation",
            "summary": "Content does not restrict its view and operation to a single display orientation, such as portrait or landscape.",
            "rules": []
        },
        {
            "num": "1.3.5",
            "name": "Identify Input Purpose",
            "summary": "The purpose of each input field that collects information about the user can be programmatically determined when the field serves a common purpose.",
            "rules": [
                {
                    id: "WCAG21_Input_Autocomplete",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.4.1",
            "name": "Use of Color",
            "summary": "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.",
            "rules": [
                {
                    id: "RPT_Font_ColorInForm",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Style_ColorSemantics1",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.4.2",
            "name": "Audio Control",
            "summary": "If any audio plays automatically for more than 3 seconds, either a mechanism is available to pause or stop the audio, or a mechanism is available to control audio volume independently from the overall system volume level.",
            "rules": [
                {
                    id: "RPT_Embed_AutoStart",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.4.3",
            "name": "Contrast (Minimum)",
            "summary": "The visual presentation of text and images of text has a contrast ratio of at least 4.5:1, with a 3:1 ratio for large-scale text.",
            "rules": [
                {
                    id: "IBMA_Color_Contrast_WCAG2AA",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "IBMA_Color_Contrast_WCAG2AA_PV",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.4.4",
            "name": "Resize Text",
            "summary": "Text can be resized without assistive technology up to 200 percent without loss of content or functionality.",
            "rules": [
                {
                    id: "WCAG21_Style_Viewport",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "1.4.5",
            "name": "Images of Text",
            "summary": "If the technologies being used can achieve the visual presentation, text is used to convey information rather than images of text.",
            "rules": []
        },
        {
            "num": "1.4.10",
            "name": "Reflow",
            "summary": "Content can reflow without loss of information or functionality, and without requiring scrolling in two dimensions.",
            "rules": []
        },
        {
            "num": "1.4.11",
            "name": "Non-text Contrast",
            "summary": "The parts of graphical objects required to understand the content, and the visual information required to identify UI components and states, have a contrast ratio of at least 3:1 against adjacent colors.",
            "rules": []
        },
        {
            "num": "1.4.12",
            "name": "Text Spacing",
            "summary": "No loss of content or functionality occurs when users change letter, word and paragraph spacing, as well as line height.",
            "rules": []
        },
        {
            "num": "1.4.13",
            "name": "Content on Hover or Focus",
            "summary": "Where hover or focus actions cause additional content to become visible and hidden, the additional content is dismissable, hoverable and persistent.",
            "rules": []
        },
        {
            "num": "2.1.1",
            "name": "Keyboard",
            "summary": "All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes.",
            "rules": [
                {
                    id: "RPT_Elem_EventMouseAndKey",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "Rpt_Aria_InvalidTabindexForActivedescendant",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MissingFocusableChild",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MissingKeyboardHandler",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Audio_Video_Trigger",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Application_Role_Text",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.1.2",
            "name": "No Keyboard Trap",
            "summary": "If keyboard focus can be moved to a component using a keyboard interface, then focus can be moved away from that component using only a keyboard interface, and, if it requires more than unmodified arrow or tab keys or other standard exit methods, the user is advised of the method for moving focus away.",
            "rules": [
                {
                    id: "HAAC_Media_DocumentTrigger2",
                    level: eRulePolicy.RECOMMENDATION
                }
            ]
        },
        {
            "num": "2.1.4",
            "name": "Character Key Shortcuts",
            "summary": "If a keyboard shortcut is implemented using only letter, punctuation, number or symbol characters, then the shortcut can be turned off, remapped or activated only on focus.",
            "rules": []
        },
        {
            "num": "2.2.1",
            "name": "Timing Adjustable",
            "summary": "For each time limit that is set by the content, the user can turn off, adjust, or extend the limit.",
            "rules": [
                {
                    id: "RPT_Meta_Refresh",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Meta_RedirectZero",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.2.2",
            "name": "Pause, Stop, Hide",
            "summary": "For moving, blinking, scrolling, or auto-updating information, the user can pause, stop, hide or adjust the information.",
            "rules": [
                {
                    id: "RPT_Marquee_Trigger",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Blink_AlwaysTrigger",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Blink_CSSTrigger1",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.3.1",
            "name": "Three Flashes or Below Threshold",
            "summary": "Content does not contain anything that flashes more than three times in any one second period, or the flash is below the general flash and red flash thresholds.",
            "rules": []
        },
        {
            "num": "2.4.1",
            "name": "Bypass Blocks",
            "summary": "A mechanism is available to bypass blocks of content that are repeated on multiple Web pages.",
            "rules": [
                {
                    id: "WCAG20_Frame_HasTitle",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Html_SkipNav",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Valerie_Frame_SrcHtml",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleSearchLandmarks",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ComplementaryLandmarkLabel_Implicit",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "Rpt_Aria_MultipleApplicationLandmarks",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ApplicationLandmarkLabel",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleDocumentRoles",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Body_FirstASkips_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Body_FirstAContainsSkipText_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_OrphanedContent_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_RegionLabel_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleMainsVisibleLabel_Implicit",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "Rpt_Aria_MultipleBannerLandmarks_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleComplementaryLandmarks_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleContentinfoLandmarks_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleFormLandmarks_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleNavigationLandmarks_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleArticleRoles_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleGroupRoles_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleContentinfoInSiblingSet_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_OneBannerInSiblingSet_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ContentinfoWithNoMain_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ComplementaryRequiredLabel_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleRegionsUniqueLabel_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleMainsRequireLabel_Implicit_2",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.4.2",
            "name": "Page Titled",
            "summary": "Web pages, non-web documents, and software have titles that describe topic or purpose.",
            "rules": [
                {
                    id: "WCAG20_Doc_HasTitle",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Title_Valid",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.4.3",
            "name": "Focus Order",
            "summary": "If content can be navigated sequentially and the navigation sequences affect meaning or operation, focusable components receive focus in an order that preserves meaning and operability.",
            "rules": [
                {
                    id: "IBMA_Focus_Tabbable",
                    level: eRulePolicy.VIOLATION
                }
                , {
                    id: "IBMA_Focus_MultiTab",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.4.4",
            "name": "Link Purpose (In Context)",
            "summary": "The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link content.",
            "rules": [
                {
                    id: "WCAG20_A_HasText",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.4.5",
            "name": "Multiple Ways",
            "summary": "More than one way is available to locate a Web page within a set of Web pages, except where the Web Page is the result of, or a step in, a process.",
            "rules": []
        },
        {
            "num": "2.4.6",
            "name": "Headings and Labels",
            "summary": "Headings and labels describe topic or purpose.",
            "rules": [
                {
                    id: "RPT_Header_HasContent",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.4.7",
            "name": "Focus Visible",
            "summary": "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.",
            "rules": [
                {
                    id: "RPT_Style_HinderFocus1",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Script_FocusBlurs",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.5.1",
            "name": "Pointer Gestures",
            "summary": "All functionality that uses multipoint or path-based gestures for operation can be operated with a single pointer without a path-based gesture.",
            "rules": []
        },
        {
            "num": "2.5.2",
            "name": "Pointer Cancellation",
            "summary": "For functionality that can be operated using a single pointer, completion of the function is on the up-event with an ability to abort, undo or reverse the outcome.",
            "rules": []
        },
        {
            "num": "2.5.3",
            "name": "Label in Name",
            "summary": "For user interface components with labels that include text or images of text, the accessible name contains the text that is presented visually.",
            "rules": [
                {
                    id: "WCAG21_Label_Accessible",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2.5.4",
            "name": "Motion Actuation",
            "summary": "Functionality that can be operated by motion can also be operated by user interface components, and the motion trigger can be disabled.",
            "rules": []
        },
        {
            "num": "3.1.1",
            "name": "Language of Page",
            "summary": "The default human language of Web pages, non-Web documents, or software can be programmatically determined.",
            "rules": [
                {
                    id: "WCAG20_Html_HasLang",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "3.1.2",
            "name": "Language of Parts",
            "summary": "The human language of each passage or phrase in the content can be programmatically determined.",
            "rules": [
                {
                    id: "WCAG20_Elem_Lang_Valid",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "3.2.1",
            "name": "On Focus",
            "summary": "When any component receives focus, it does not initiate a change of context.",
            "rules": [
                {
                    id: "WCAG20_Select_NoChangeAction",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Script_FocusBlurs",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "3.2.2",
            "name": "On Input",
            "summary": "Changing the setting of any user interface component does not automatically cause a change of context unless the user has been advised of the behavior before using the component.",
            "rules": [
                {
                    id: "WCAG20_A_TargetAndText",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "WCAG20_Form_HasSubmit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Form_TargetAndText",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Input_HasOnchange",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "RPT_Form_ChangeEmpty",
                    level: eRulePolicy.RECOMMENDATION
                }
            ]
        },
        {
            "num": "3.2.3",
            "name": "Consistent Navigation",
            "summary": "Navigational mechanisms that are repeated on multiple Web pages within a set of Web pages occur in the same relative order each time they are repeated, unless a change is initiated by the user.",
            "rules": []
        },
        {
            "num": "3.2.4",
            "name": "Consistent Identification",
            "summary": "Components that have the same functionality within a set of Web pages are identified consistently.",
            "rules": []
        },
        {
            "num": "3.3.1",
            "name": "Error Identification",
            "summary": "If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.",
            "rules": [
                {
                    id: "HAAC_Aria_ErrorMessage",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "3.3.2",
            "name": "Labels or Instructions",
            "summary": "Labels or instructions are provided when content requires user input.",
            "rules": [
                {
                    id: "WCAG20_Input_LabelBefore",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Input_LabelAfter",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Accesskey_NeedLabel",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_Aria_Or_HTML5_Attr",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Input_Placeholder",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Input_VisibleLabel",
                    level: eRulePolicy.VIOLATION
                },
            ]
        },
        {
            "num": "3.3.3",
            "name": "Error Suggestion",
            "summary": "If an input error is automatically detected and suggestions for correction are known, then the suggestions are provided to the user, unless it would jeopardize the security or purpose of the content.",
            "rules": []
        },
        {
            "num": "3.3.4",
            "name": "Error Prevention (Legal, Financial, Data)",
            "summary": "For content that cause legal commitments or financial transactions for the user to occur, that modify or delete user-controllable data in data storage systems, or that submit user test responses, the user can reverse, correct, or confirm the action.",
            "rules": []
        },
        {
            "num": "4.1.1",
            "name": "Parsing",
            "summary": "In content implemented using markup languages, elements have complete start and end tags, elements are nested according to their specifications, elements do not contain duplicate attributes, and any IDs are unique, except where the specifications allow these features.",
            "rules": [
                {
                    id: "RPT_Elem_UniqueId",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "WCAG20_Elem_UniqueAccessKey",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "4.1.2",
            "name": "Name, Role, Value",
            "summary": "For all user interface components (including, but not limited to: form elements, links and components generated by scripts), the name and role can be programmatically determined; states, properties, and values that can be set by the user can be programmatically set; and notification of changes to these items is available to user agents, including assistive technologies.",
            "rules": [
                {
                    id: "WCAG20_Input_ExplicitLabel",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Valerie_Label_HasContent",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ValidRole",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ValidPropertyValue",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ValidIdRef",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_RequiredProperties",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_EmptyPropertyValue",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_ValidProperty",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Aria_ImgAlt",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Canvas",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_Aria_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_RequiredChildren_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_RequiredParent_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_EventHandlerMissingRole_Native_Host_Sematics",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_WidgetLabels_Implicit",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_ARIA_11_Guideline",
                    level: eRulePolicy.RECOMMENDATION
                },
                {
                    id: "HAAC_List_Group_ListItem",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_ActiveDescendantCheck",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "Rpt_Aria_MultipleToolbarUniqueLabel",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_Must_Have_Text_Input",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_DOM_Focus",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_Autocomplete",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_Autocomplete_Invalid",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_Expanded",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "HAAC_Combobox_Popup",
                    level: eRulePolicy.VIOLATION
                }
            ]
        }
    ]    
}
]

export { a11yRulesets }