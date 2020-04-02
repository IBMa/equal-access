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
    name: "IBM Accessibility January 2020",
    category: eRuleCategory.ACCESSIBILITY,
    "checkpoints": [
        {
            "num": "1.1.1",
            "name": "Non-text Content",
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
            "rules": []
        },
        {
            "num": "1.3.5",
            "name": "Identify Input Purpose",
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
            "rules": []
        },
        {
            "num": "1.4.10",
            "name": "Reflow",
            "rules": []
        },
        {
            "num": "1.4.11",
            "name": "Non-text Contrast",
            "rules": []
        },
        {
            "num": "1.4.12",
            "name": "Text Spacing",
            "rules": []
        },
        {
            "num": "1.4.13",
            "name": "Content on Hover or Focus",
            "rules": []
        },
        {
            "num": "2.1.1",
            "name": "Keyboard",
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
            "rules": []
        },
        {
            "num": "2.2.1",
            "name": "Timing Adjustable",
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
            "rules": []
        },
        {
            "num": "2.4.1",
            "name": "Bypass Blocks",
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
            "rules": []
        },
        {
            "num": "2.4.4",
            "name": "Link Purpose (In Context)",
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
            "rules": []
        },
        {
            "num": "2.4.6",
            "name": "Headings and Labels",
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
            "rules": []
        },
        {
            "num": "2.5.2",
            "name": "Pointer Cancellation",
            "rules": []
        },
        {
            "num": "2.5.3",
            "name": "Label in Name",
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
            "rules": []
        },
        {
            "num": "3.1.1",
            "name": "Language of Page",
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
            "rules": []
        },
        {
            "num": "3.2.4",
            "name": "Consistent Identification",
            "rules": []
        },
        {
            "num": "3.3.1",
            "name": "Error Identification",
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
            "rules": []
        },
        {
            "num": "3.3.4",
            "name": "Error Prevention (Legal, Financial, Data)",
            "rules": []
        },
        {
            "num": "4.1.1",
            "name": "Parsing",
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
,{
    id: "IBM_Accessibility_BETA",
    name: "IBM Accessibility Experimental",
    category: eRuleCategory.ACCESSIBILITY,
    "checkpoints": [
        {
            "num": "2.4.3",
            "name": "Focus Order",
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
        }
    ]
}
]

export { a11yRulesets }