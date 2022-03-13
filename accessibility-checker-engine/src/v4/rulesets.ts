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

import { Ruleset } from "./checker/Checker";
import { eRulePolicy, eRuleCategory, eToolkitLevel, eRulesetType } from "../v2/api/IEngine";

export let a11yRulesets: Ruleset[] = [
    {
        id: "EXTENSIONS",
        name: "Extension Rules",
        category: eRuleCategory.ACCESSIBILITY,
        description: "Rules for enabling the browser extensions",
        type: eRulesetType.EXTENSION,
        checkpoints: [{
            num: "1",
            name: "Extension CP 1",
            wcagLevel: "A",
            summary: "Rules for Extension"
        }]
    },
    {
        id: "IBM_Accessibility",
        name: "IBM Accessibility",
        category: eRuleCategory.ACCESSIBILITY,
        description: "Rules for WCAG 2.1 AA plus additional IBM checklist supplemental requirements.",
        checkpoints: [
            {
                num: "1.1.1",
                name: "Non-text Content",
                wcagLevel: "A",
                summary: "All non-text content that is presented to the user has a text alternative that serves the equivalent purpose."
            },
            {
                num: "1.2.1",
                name: "Audio-only and Video-only (Prerecorded)",
                wcagLevel: "A",
                summary: "For prerecorded audio-only or video-only media, an alternative provides equivalent information."
            },
            {
                num: "1.2.2",
                name: "Captions (Prerecorded)",
                wcagLevel: "A",
                summary: "Captions are provided for all prerecorded audio content in synchronized media."
            },
            {
                num: "1.2.3",
                name: "Audio Description or Media Alternative (Prerecorded)",
                wcagLevel: "A",
                summary: "An alternative for time-based media or audio description of the prerecorded video content is provided for synchronized media."
            },
            {
                num: "1.2.4",
                name: "Captions (Live)",
                wcagLevel: "AA",
                summary: "Captions are provided for all live audio content in synchronized media."
            },
            {
                num: "1.2.5",
                name: "Audio Description (Prerecorded)",
                wcagLevel: "AA",
                summary: "Audio description is provided for all prerecorded video content in synchronized media."
            },
            {
                num: "1.3.1",
                name: "Info and Relationships",
                wcagLevel: "A",
                summary: "Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text."
            },
            {
                num: "1.3.2",
                name: "Meaningful Sequence",
                wcagLevel: "A",
                summary: "When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined."
            },
            {
                num: "1.3.3",
                name: "Sensory Characteristics",
                wcagLevel: "A",
                summary: "Instructions provided for understanding and operating content do not rely solely on sensory characteristics of components such as shape, size, visual location, orientation, or sound."
            },
            {
                num: "1.3.4",
                name: "Orientation",
                wcagLevel: "AA",
                summary: "Content does not restrict its view and operation to a single display orientation, such as portrait or landscape."
            },
            {
                num: "1.3.5",
                name: "Identify Input Purpose",
                wcagLevel: "AA",
                summary: "The purpose of each input field that collects information about the user can be programmatically determined when the field serves a common purpose."
            },
            {
                num: "1.4.1",
                name: "Use of Color",
                wcagLevel: "A",
                summary: "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element."
            },
            {
                num: "1.4.2",
                name: "Audio Control",
                wcagLevel: "A",
                summary: "If any audio plays automatically for more than 3 seconds, either a mechanism is available to pause or stop the audio, or a mechanism is available to control audio volume independently from the overall system volume level."
            },
            {
                num: "1.4.3",
                name: "Contrast (Minimum)",
                wcagLevel: "AA",
                summary: "The visual presentation of text and images of text has a contrast ratio of at least 4.5:1, with a 3:1 ratio for large-scale text."
            },
            {
                num: "1.4.4",
                name: "Resize Text",
                wcagLevel: "AA",
                summary: "Text can be resized without assistive technology up to 200 percent without loss of content or functionality."
            },
            {
                num: "1.4.5",
                name: "Images of Text",
                wcagLevel: "AA",
                summary: "If the technologies being used can achieve the visual presentation, text is used to convey information rather than images of text."
            },
            {
                num: "1.4.10",
                name: "Reflow",
                wcagLevel: "AA",
                summary: "Content can reflow without loss of information or functionality, and without requiring scrolling in two dimensions."
            },
            {
                num: "1.4.11",
                name: "Non-text Contrast",
                wcagLevel: "AA",
                summary: "The parts of graphical objects required to understand the content, and the visual information required to identify UI components and states, have a contrast ratio of at least 3:1 against adjacent colors."
            },
            {
                num: "1.4.12",
                name: "Text Spacing",
                wcagLevel: "AA",
                summary: "No loss of content or functionality occurs when users change letter, word and paragraph spacing, as well as line height."
            },
            {
                num: "1.4.13",
                name: "Content on Hover or Focus",
                wcagLevel: "AA",
                summary: "Where hover or focus actions cause additional content to become visible and hidden, the additional content is dismissable, hoverable and persistent."
            },
            {
                num: "2.1.1",
                name: "Keyboard",
                wcagLevel: "A",
                summary: "All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes."
            },
            {
                num: "2.1.2",
                name: "No Keyboard Trap",
                wcagLevel: "A",
                summary: "If keyboard focus can be moved to a component using a keyboard interface, then focus can be moved away from that component using only a keyboard interface, and, if it requires more than unmodified arrow or tab keys or other standard exit methods, the user is advised of the method for moving focus away."
            },
            {
                num: "2.1.4",
                name: "Character Key Shortcuts",
                wcagLevel: "A",
                summary: "If a keyboard shortcut is implemented using only letter, punctuation, number or symbol characters, then the shortcut can be turned off, remapped or activated only on focus."
            },
            {
                num: "2.2.1",
                name: "Timing Adjustable",
                wcagLevel: "A",
                summary: "For each time limit that is set by the content, the user can turn off, adjust, or extend the limit."
            },
            {
                num: "2.2.2",
                name: "Pause, Stop, Hide",
                wcagLevel: "A",
                summary: "For moving, blinking, scrolling, or auto-updating information, the user can pause, stop, hide or adjust the information."
            },
            {
                num: "2.3.1",
                name: "Three Flashes or Below Threshold",
                wcagLevel: "A",
                summary: "Content does not contain anything that flashes more than three times in any one second period, or the flash is below the general flash and red flash thresholds."
            },
            {
                num: "2.4.1",
                name: "Bypass Blocks",
                wcagLevel: "A",
                summary: "A mechanism is available to bypass blocks of content that are repeated on multiple Web pages."
            },
            {
                num: "2.4.2",
                name: "Page Titled",
                wcagLevel: "A",
                summary: "Web pages, non-web documents, and software have titles that describe topic or purpose."
            },
            {
                num: "2.4.3",
                name: "Focus Order",
                wcagLevel: "A",
                summary: "If content can be navigated sequentially and the navigation sequences affect meaning or operation, focusable components receive focus in an order that preserves meaning and operability."
            },
            {
                num: "2.4.4",
                name: "Link Purpose (In Context)",
                wcagLevel: "A",
                summary: "The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link content."
            },
            {
                num: "2.4.5",
                name: "Multiple Ways",
                wcagLevel: "AA",
                summary: "More than one way is available to locate a Web page within a set of Web pages, except where the Web Page is the result of, or a step in, a process."
            },
            {
                num: "2.4.6",
                name: "Headings and Labels",
                wcagLevel: "AA",
                summary: "Headings and labels describe topic or purpose."
            },
            {
                num: "2.4.7",
                name: "Focus Visible",
                wcagLevel: "AA",
                summary: "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible."
            },
            {
                num: "2.5.1",
                name: "Pointer Gestures",
                wcagLevel: "A",
                summary: "All functionality that uses multipoint or path-based gestures for operation can be operated with a single pointer without a path-based gesture."
            },
            {
                num: "2.5.2",
                name: "Pointer Cancellation",
                wcagLevel: "A",
                summary: "For functionality that can be operated using a single pointer, completion of the function is on the up-event with an ability to abort, undo or reverse the outcome."
            },
            {
                num: "2.5.3",
                name: "Label in Name",
                wcagLevel: "A",
                summary: "For user interface components with labels that include text or images of text, the accessible name contains the text that is presented visually."
            },
            {
                num: "2.5.4",
                name: "Motion Actuation",
                wcagLevel: "A",
                summary: "Functionality that can be operated by motion can also be operated by user interface components, and the motion trigger can be disabled."
            },
            {
                num: "3.1.1",
                name: "Language of Page",
                wcagLevel: "A",
                summary: "The default human language of Web pages, non-Web documents, or software can be programmatically determined."            },
            {
                num: "3.1.2",
                name: "Language of Parts",
                wcagLevel: "AA",
                summary: "The human language of each passage or phrase in the content can be programmatically determined."
            },
            {
                num: "3.2.1",
                name: "On Focus",
                wcagLevel: "A",
                summary: "When any component receives focus, it does not initiate a change of context."
            },
            {
                num: "3.2.2",
                name: "On Input",
                wcagLevel: "A",
                summary: "Changing the setting of any user interface component does not automatically cause a change of context unless the user has been advised of the behavior before using the component."
            },
            {
                num: "3.2.3",
                name: "Consistent Navigation",
                wcagLevel: "AA",
                summary: "Navigational mechanisms that are repeated on multiple Web pages within a set of Web pages occur in the same relative order each time they are repeated, unless a change is initiated by the user."
            },
            {
                num: "3.2.4",
                name: "Consistent Identification",
                wcagLevel: "AA",
                summary: "Components that have the same functionality within a set of Web pages are identified consistently."
            },
            {
                num: "3.3.1",
                name: "Error Identification",
                wcagLevel: "A",
                summary: "If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.",
            },
            {
                num: "3.3.2",
                name: "Labels or Instructions",
                wcagLevel: "A",
                summary: "Labels or instructions are provided when content requires user input."
            },
            {
                num: "3.3.3",
                name: "Error Suggestion",
                wcagLevel: "AA",
                summary: "If an input error is automatically detected and suggestions for correction are known, then the suggestions are provided to the user, unless it would jeopardize the security or purpose of the content."
            },
            {
                num: "3.3.4",
                name: "Error Prevention (Legal, Financial, Data)",
                wcagLevel: "AA",
                summary: "For content that cause legal commitments or financial transactions for the user to occur, that modify or delete user-controllable data in data storage systems, or that submit user test responses, the user can reverse, correct, or confirm the action."
            },
            {
                num: "4.1.1",
                name: "Parsing",
                wcagLevel: "A",
                summary: "In content implemented using markup languages, elements have complete start and end tags, elements are nested according to their specifications, elements do not contain duplicate attributes, and any IDs are unique, except where the specifications allow these features."
            },
            {
                num: "4.1.2",
                name: "Name, Role, Value",
                wcagLevel: "A",
                summary: "For all user interface components (including, but not limited to: form elements, links and components generated by scripts), the name and role can be programmatically determined; states, properties, and values that can be set by the user can be programmatically set; and notification of changes to these items is available to user agents, including assistive technologies."
            },
            {
                num: "4.1.3",
                name: "Status Messages",
                wcagLevel: "AA",
                summary: "In content implemented using markup languages, status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus."
            }
        ]
    },
    {
        id: "WCAG_2_1",
        name: "WCAG 2.1 (A, AA)",
        category: eRuleCategory.ACCESSIBILITY,
        description: "Rules for WCAG 2.1 AA. This is the current W3C recommendation. Content that conforms to WCAG 2.1 also conforms to WCAG 2.0.",
        checkpoints: [
            {
                num: "1.1.1",
                name: "Non-text Content",
                wcagLevel: "A",
                summary: "All non-text content that is presented to the user has a text alternative that serves the equivalent purpose."
            },
            {
                num: "1.2.1",
                name: "Audio-only and Video-only (Prerecorded)",
                wcagLevel: "A",
                summary: "For prerecorded audio-only or video-only media, an alternative provides equivalent information."
            },
            {
                num: "1.2.2",
                name: "Captions (Prerecorded)",
                wcagLevel: "A",
                summary: "Captions are provided for all prerecorded audio content in synchronized media."
            },
            {
                num: "1.2.3",
                name: "Audio Description or Media Alternative (Prerecorded)",
                wcagLevel: "A",
                summary: "An alternative for time-based media or audio description of the prerecorded video content is provided for synchronized media."
            },
            {
                num: "1.2.4",
                name: "Captions (Live)",
                wcagLevel: "AA",
                summary: "Captions are provided for all live audio content in synchronized media."
            },
            {
                num: "1.2.5",
                name: "Audio Description (Prerecorded)",
                wcagLevel: "AA",
                summary: "Audio description is provided for all prerecorded video content in synchronized media."
            },
            {
                num: "1.3.1",
                name: "Info and Relationships",
                wcagLevel: "A",
                summary: "Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text."
            },
            {
                num: "1.3.2",
                name: "Meaningful Sequence",
                wcagLevel: "A",
                summary: "When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined."
            },
            {
                num: "1.3.3",
                name: "Sensory Characteristics",
                wcagLevel: "A",
                summary: "Instructions provided for understanding and operating content do not rely solely on sensory characteristics of components such as shape, size, visual location, orientation, or sound."
            },
            {
                num: "1.3.4",
                name: "Orientation",
                wcagLevel: "A",
                summary: "Content does not restrict its view and operation to a single display orientation, such as portrait or landscape."
            },
            {
                num: "1.3.5",
                name: "Identify Input Purpose",
                wcagLevel: "AA",
                summary: "The purpose of each input field that collects information about the user can be programmatically determined when the field serves a common purpose."
            },
            {
                num: "1.4.1",
                name: "Use of Color",
                wcagLevel: "A",
                summary: "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element."
            },
            {
                num: "1.4.2",
                name: "Audio Control",
                wcagLevel: "A",
                summary: "If any audio plays automatically for more than 3 seconds, either a mechanism is available to pause or stop the audio, or a mechanism is available to control audio volume independently from the overall system volume level."
            },
            {
                num: "1.4.3",
                name: "Contrast (Minimum)",
                wcagLevel: "AA",
                summary: "The visual presentation of text and images of text has a contrast ratio of at least 4.5:1, with a 3:1 ratio for large-scale text."
            },
            {
                num: "1.4.4",
                name: "Resize Text",
                wcagLevel: "AA",
                summary: "Text can be resized without assistive technology up to 200 percent without loss of content or functionality."
            },
            {
                num: "1.4.5",
                name: "Images of Text",
                wcagLevel: "AA",
                summary: "If the technologies being used can achieve the visual presentation, text is used to convey information rather than images of text."
            },
            {
                num: "1.4.10",
                name: "Reflow",
                wcagLevel: "AA",
                summary: "Content can reflow without loss of information or functionality, and without requiring scrolling in two dimensions."
            },
            {
                num: "1.4.11",
                name: "Non-text Contrast",
                wcagLevel: "AA",
                summary: "The parts of graphical objects required to understand the content, and the visual information required to identify UI components and states, have a contrast ratio of at least 3:1 against adjacent colors."
            },
            {
                num: "1.4.12",
                name: "Text Spacing",
                wcagLevel: "AA",
                summary: "No loss of content or functionality occurs when users change letter, word and paragraph spacing, as well as line height."
            },
            {
                num: "1.4.13",
                name: "Content on Hover or Focus",
                wcagLevel: "AA",
                summary: "Where hover or focus actions cause additional content to become visible and hidden, the additional content is dismissable, hoverable and persistent."
            },
            {
                num: "2.1.1",
                name: "Keyboard",
                wcagLevel: "A",
                summary: "All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes."
            },
            {
                num: "2.1.2",
                name: "No Keyboard Trap",
                wcagLevel: "A",
                summary: "If keyboard focus can be moved to a component using a keyboard interface, then focus can be moved away from that component using only a keyboard interface, and, if it requires more than unmodified arrow or tab keys or other standard exit methods, the user is advised of the method for moving focus away."
            },
            {
                num: "2.1.4",
                name: "Character Key Shortcuts",
                wcagLevel: "A",
                summary: "If a keyboard shortcut is implemented using only letter, punctuation, number or symbol characters, then the shortcut can be turned off, remapped or activated only on focus."
            },
            {
                num: "2.2.1",
                name: "Timing Adjustable",
                wcagLevel: "A",
                summary: "For each time limit that is set by the content, the user can turn off, adjust, or extend the limit."
            },
            {
                num: "2.2.2",
                name: "Pause, Stop, Hide",
                wcagLevel: "A",
                summary: "For moving, blinking, scrolling, or auto-updating information, the user can pause, stop, hide or adjust the information."
            },
            {
                num: "2.3.1",
                name: "Three Flashes or Below Threshold",
                wcagLevel: "A",
                summary: "Content does not contain anything that flashes more than three times in any one second period, or the flash is below the general flash and red flash thresholds."
            },
            {
                num: "2.4.1",
                name: "Bypass Blocks",
                wcagLevel: "A",
                summary: "A mechanism is available to bypass blocks of content that are repeated on multiple Web pages."
            },
            {
                num: "2.4.2",
                name: "Page Titled",
                wcagLevel: "A",
                summary: "Web pages, non-web documents, and software have titles that describe topic or purpose."
            },
            {
                num: "2.4.3",
                name: "Focus Order",
                wcagLevel: "A",
                summary: "If content can be navigated sequentially and the navigation sequences affect meaning or operation, focusable components receive focus in an order that preserves meaning and operability."
            },
            {
                num: "2.4.4",
                name: "Link Purpose (In Context)",
                wcagLevel: "A",
                summary: "The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link content."
            },
            {
                num: "2.4.5",
                name: "Multiple Ways",
                wcagLevel: "AA",
                summary: "More than one way is available to locate a Web page within a set of Web pages, except where the Web Page is the result of, or a step in, a process."
            },
            {
                num: "2.4.6",
                name: "Headings and Labels",
                wcagLevel: "AA",
                summary: "Headings and labels describe topic or purpose."
            },
            {
                num: "2.4.7",
                name: "Focus Visible",
                wcagLevel: "AA",
                summary: "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible."
            },
            {
                num: "2.5.1",
                name: "Pointer Gestures",
                wcagLevel: "A",
                summary: "All functionality that uses multipoint or path-based gestures for operation can be operated with a single pointer without a path-based gesture."
            },
            {
                num: "2.5.2",
                name: "Pointer Cancellation",
                wcagLevel: "A",
                summary: "For functionality that can be operated using a single pointer, completion of the function is on the up-event with an ability to abort, undo or reverse the outcome."
            },
            {
                num: "2.5.3",
                name: "Label in Name",
                wcagLevel: "A",
                summary: "For user interface components with labels that include text or images of text, the accessible name contains the text that is presented visually."
            },
            {
                num: "2.5.4",
                name: "Motion Actuation",
                wcagLevel: "A",
                summary: "Functionality that can be operated by motion can also be operated by user interface components, and the motion trigger can be disabled."
            },
            {
                num: "3.1.1",
                name: "Language of Page",
                wcagLevel: "A",
                summary: "The default human language of Web pages, non-Web documents, or software can be programmatically determined."            },
            {
                num: "3.1.2",
                name: "Language of Parts",
                wcagLevel: "AA",
                summary: "The human language of each passage or phrase in the content can be programmatically determined."
            },
            {
                num: "3.2.1",
                name: "On Focus",
                wcagLevel: "A",
                summary: "When any component receives focus, it does not initiate a change of context."
            },
            {
                num: "3.2.2",
                name: "On Input",
                wcagLevel: "A",
                summary: "Changing the setting of any user interface component does not automatically cause a change of context unless the user has been advised of the behavior before using the component."
            },
            {
                num: "3.2.3",
                name: "Consistent Navigation",
                wcagLevel: "AA",
                summary: "Navigational mechanisms that are repeated on multiple Web pages within a set of Web pages occur in the same relative order each time they are repeated, unless a change is initiated by the user."
            },
            {
                num: "3.2.4",
                name: "Consistent Identification",
                wcagLevel: "AA",
                summary: "Components that have the same functionality within a set of Web pages are identified consistently."
            },
            {
                num: "3.3.1",
                name: "Error Identification",
                wcagLevel: "A",
                summary: "If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.",
                
            },
            {
                num: "3.3.2",
                name: "Labels or Instructions",
                wcagLevel: "A",
                summary: "Labels or instructions are provided when content requires user input."
            },
            {
                num: "3.3.3",
                name: "Error Suggestion",
                wcagLevel: "AA",
                summary: "If an input error is automatically detected and suggestions for correction are known, then the suggestions are provided to the user, unless it would jeopardize the security or purpose of the content."
            },
            {
                num: "3.3.4",
                name: "Error Prevention (Legal, Financial, Data)",
                wcagLevel: "AA",
                summary: "For content that cause legal commitments or financial transactions for the user to occur, that modify or delete user-controllable data in data storage systems, or that submit user test responses, the user can reverse, correct, or confirm the action."
            },
            {
                num: "4.1.1",
                name: "Parsing",
                wcagLevel: "A",
                summary: "In content implemented using markup languages, elements have complete start and end tags, elements are nested according to their specifications, elements do not contain duplicate attributes, and any IDs are unique, except where the specifications allow these features."
            },
            {
                num: "4.1.2",
                name: "Name, Role, Value",
                wcagLevel: "A",
                summary: "For all user interface components (including, but not limited to: form elements, links and components generated by scripts), the name and role can be programmatically determined; states, properties, and values that can be set by the user can be programmatically set; and notification of changes to these items is available to user agents, including assistive technologies."
            },
            {
                num: "4.1.3",
                name: "Status Messages",
                wcagLevel: "AA",
                summary: "In content implemented using markup languages, status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus."
            }
        ]
    },
    {
        id: "WCAG_2_0",
        name: "WCAG 2.0 (A, AA)",
        category: eRuleCategory.ACCESSIBILITY,
        description: "Rules for WCAG 2.0 AA. Referenced by US Section 508, but not the latest W3C recommendation.",
        checkpoints: [
            {
                num: "1.1.1",
                name: "Non-text Content",
                wcagLevel: "A",
                summary: "All non-text content that is presented to the user has a text alternative that serves the equivalent purpose."
            },
            {
                num: "1.2.1",
                name: "Audio-only and Video-only (Prerecorded)",
                wcagLevel: "A",
                summary: "For prerecorded audio-only or video-only media, an alternative provides equivalent information."
            },
            {
                num: "1.2.2",
                name: "Captions (Prerecorded)",
                wcagLevel: "A",
                summary: "Captions are provided for all prerecorded audio content in synchronized media."
            },
            {
                num: "1.2.3",
                name: "Audio Description or Media Alternative (Prerecorded)",
                wcagLevel: "A",
                summary: "An alternative for time-based media or audio description of the prerecorded video content is provided for synchronized media."
            },
            {
                num: "1.2.4",
                name: "Captions (Live)",
                wcagLevel: "AA",
                summary: "Captions are provided for all live audio content in synchronized media."
            },
            {
                num: "1.2.5",
                name: "Audio Description (Prerecorded)",
                wcagLevel: "AA",
                summary: "Audio description is provided for all prerecorded video content in synchronized media."
            },
            {
                num: "1.3.1",
                name: "Info and Relationships",
                wcagLevel: "A",
                summary: "Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text."
            },
            {
                num: "1.3.2",
                name: "Meaningful Sequence",
                wcagLevel: "A",
                summary: "When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined."
            },
            {
                num: "1.3.3",
                name: "Sensory Characteristics",
                wcagLevel: "A",
                summary: "Instructions provided for understanding and operating content do not rely solely on sensory characteristics of components such as shape, size, visual location, orientation, or sound."
            },
            {
                num: "1.4.1",
                name: "Use of Color",
                wcagLevel: "A",
                summary: "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element."
            },
            {
                num: "1.4.2",
                name: "Audio Control",
                wcagLevel: "A",
                summary: "If any audio plays automatically for more than 3 seconds, either a mechanism is available to pause or stop the audio, or a mechanism is available to control audio volume independently from the overall system volume level."
            },
            {
                num: "1.4.3",
                name: "Contrast (Minimum)",
                wcagLevel: "AA",
                summary: "The visual presentation of text and images of text has a contrast ratio of at least 4.5:1, with a 3:1 ratio for large-scale text."
            },
            {
                num: "1.4.4",
                name: "Resize Text",
                wcagLevel: "AA",
                summary: "Text can be resized without assistive technology up to 200 percent without loss of content or functionality."
            },
            {
                num: "1.4.5",
                name: "Images of Text",
                wcagLevel: "AA",
                summary: "If the technologies being used can achieve the visual presentation, text is used to convey information rather than images of text."
            },
            {
                num: "2.1.1",
                name: "Keyboard",
                wcagLevel: "A",
                summary: "All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes."
            },
            {
                num: "2.1.2",
                name: "No Keyboard Trap",
                wcagLevel: "A",
                summary: "If keyboard focus can be moved to a component using a keyboard interface, then focus can be moved away from that component using only a keyboard interface, and, if it requires more than unmodified arrow or tab keys or other standard exit methods, the user is advised of the method for moving focus away."
            },
            {
                num: "2.2.1",
                name: "Timing Adjustable",
                wcagLevel: "A",
                summary: "For each time limit that is set by the content, the user can turn off, adjust, or extend the limit."
            },
            {
                num: "2.2.2",
                name: "Pause, Stop, Hide",
                wcagLevel: "A",
                summary: "For moving, blinking, scrolling, or auto-updating information, the user can pause, stop, hide or adjust the information."
            },
            {
                num: "2.3.1",
                name: "Three Flashes or Below Threshold",
                wcagLevel: "A",
                summary: "Content does not contain anything that flashes more than three times in any one second period, or the flash is below the general flash and red flash thresholds."
            },
            {
                num: "2.4.1",
                name: "Bypass Blocks",
                wcagLevel: "A",
                summary: "A mechanism is available to bypass blocks of content that are repeated on multiple Web pages."
            },
            {
                num: "2.4.2",
                name: "Page Titled",
                wcagLevel: "A",
                summary: "Web pages, non-web documents, and software have titles that describe topic or purpose."
            },
            {
                num: "2.4.3",
                name: "Focus Order",
                wcagLevel: "A",
                summary: "If content can be navigated sequentially and the navigation sequences affect meaning or operation, focusable components receive focus in an order that preserves meaning and operability."
            },
            {
                num: "2.4.4",
                name: "Link Purpose (In Context)",
                wcagLevel: "A",
                summary: "The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link content."
            },
            {
                num: "2.4.5",
                name: "Multiple Ways",
                wcagLevel: "AA",
                summary: "More than one way is available to locate a Web page within a set of Web pages, except where the Web Page is the result of, or a step in, a process."
            },
            {
                num: "2.4.6",
                name: "Headings and Labels",
                wcagLevel: "AA",
                summary: "Headings and labels describe topic or purpose."
            },
            {
                num: "2.4.7",
                name: "Focus Visible",
                wcagLevel: "AA",
                summary: "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible."
            },
            {
                num: "3.1.1",
                name: "Language of Page",
                wcagLevel: "A",
                summary: "The default human language of Web pages, non-Web documents, or software can be programmatically determined."            },
            {
                num: "3.1.2",
                name: "Language of Parts",
                wcagLevel: "AA",
                summary: "The human language of each passage or phrase in the content can be programmatically determined."
            },
            {
                num: "3.2.1",
                name: "On Focus",
                wcagLevel: "A",
                summary: "When any component receives focus, it does not initiate a change of context."
            },
            {
                num: "3.2.2",
                name: "On Input",
                wcagLevel: "A",
                summary: "Changing the setting of any user interface component does not automatically cause a change of context unless the user has been advised of the behavior before using the component."
            },
            {
                num: "3.2.3",
                name: "Consistent Navigation",
                wcagLevel: "AA",
                summary: "Navigational mechanisms that are repeated on multiple Web pages within a set of Web pages occur in the same relative order each time they are repeated, unless a change is initiated by the user."
            },
            {
                num: "3.2.4",
                name: "Consistent Identification",
                wcagLevel: "AA",
                summary: "Components that have the same functionality within a set of Web pages are identified consistently."
            },
            {
                num: "3.3.1",
                name: "Error Identification",
                wcagLevel: "A",
                summary: "If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.",
                
            },
            {
                num: "3.3.2",
                name: "Labels or Instructions",
                wcagLevel: "A",
                summary: "Labels or instructions are provided when content requires user input."
            },
            {
                num: "3.3.3",
                name: "Error Suggestion",
                wcagLevel: "AA",
                summary: "If an input error is automatically detected and suggestions for correction are known, then the suggestions are provided to the user, unless it would jeopardize the security or purpose of the content."
            },
            {
                num: "3.3.4",
                name: "Error Prevention (Legal, Financial, Data)",
                wcagLevel: "AA",
                summary: "For content that cause legal commitments or financial transactions for the user to occur, that modify or delete user-controllable data in data storage systems, or that submit user test responses, the user can reverse, correct, or confirm the action."
            },
            {
                num: "4.1.1",
                name: "Parsing",
                wcagLevel: "A",
                summary: "In content implemented using markup languages, elements have complete start and end tags, elements are nested according to their specifications, elements do not contain duplicate attributes, and any IDs are unique, except where the specifications allow these features."
            },
            {
                num: "4.1.2",
                name: "Name, Role, Value",
                wcagLevel: "A",
                summary: "For all user interface components (including, but not limited to: form elements, links and components generated by scripts), the name and role can be programmatically determined; states, properties, and values that can be set by the user can be programmatically set; and notification of changes to these items is available to user agents, including assistive technologies."
            }
        ]
    }
]

