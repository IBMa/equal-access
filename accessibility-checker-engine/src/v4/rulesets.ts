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

// This file comes from https://raw.githubusercontent.com/act-rules/act-tools/main/src/data/sc-urls.json
import * as SCURLs from "./sc-urls.json"
import { Guideline, eGuidelineCategory, eGuidelineType } from "./api/IGuideline";
const SCs = [];
for (const key in SCURLs) {
    SCs.push(SCURLs[key]);
}

const summaries = {
    "1.1.1": "All non-text content that is presented to the user has a text alternative that serves the equivalent purpose.",
    "1.2.1": "For prerecorded audio-only or video-only media, an alternative provides equivalent information.",
    "1.2.2": "Captions are provided for all prerecorded audio content in synchronized media.",
    "1.2.3": "An alternative for time-based media or audio description of the prerecorded video content is provided for synchronized media.",
    "1.2.4": "Captions are provided for all live audio content in synchronized media.",
    "1.2.5": "Audio description is provided for all prerecorded video content in synchronized media.",
    "1.3.1": "Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text.",
    "1.3.2": "When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined.",
    "1.3.3": "Instructions provided for understanding and operating content do not rely solely on sensory characteristics of components such as shape, size, visual location, orientation, or sound.",
    "1.3.4": "Content does not restrict its view and operation to a single display orientation, such as portrait or landscape.",
    "1.3.5": "The purpose of each input field that collects information about the user can be programmatically determined when the field serves a common purpose.",
    "1.4.1": "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.",
    "1.4.2": "If any audio plays automatically for more than 3 seconds, either a mechanism is available to pause or stop the audio, or a mechanism is available to control audio volume independently from the overall system volume level.",
    "1.4.3": "The visual presentation of text and images of text has a contrast ratio of at least 4.5:1, with a 3:1 ratio for large-scale text.",
    "1.4.4": "Text can be resized without assistive technology up to 200 percent without loss of content or functionality.",
    "1.4.5": "If the technologies being used can achieve the visual presentation, text should not be used to convey information rather than images of text.",
    "1.4.10": "Content can reflow without loss of information or functionality, and without requiring scrolling in two dimensions.",
    "1.4.11": "The parts of graphical objects required to understand the content, and the visual information required to identify UI components and states, have a contrast ratio of at least 3:1 against adjacent colors.",
    "1.4.12": "No loss of content or functionality occurs when users change letter, word and paragraph spacing, as well as line height.",
    "1.4.13": "Where hover or focus actions cause additional content to become visible and hidden, the additional content is dismissable, hoverable and persistent.",
    "2.1.1": "All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes.",
    "2.1.2": "If keyboard focus can be moved to a component using a keyboard interface, then focus can be moved away from that component using only a keyboard interface, and, if it requires more than unmodified arrow or tab keys or other standard exit methods, the user is advised of the method for moving focus away.",
    "2.1.4": "If a keyboard shortcut is implemented using only letter, punctuation, number or symbol characters, then the shortcut can be turned off, remapped or activated only on focus.",
    "2.2.1": "For each time limit that is set by the content, the user can turn off, adjust, or extend the limit.",
    "2.2.2": "For moving, blinking, scrolling, or auto-updating information, the user can pause, stop, hide or adjust the information.",
    "2.3.1": "Content does not contain anything that flashes more than three times in any one second period, or the flash is below the general flash and red flash thresholds.",
    "2.4.1": "A mechanism is available to bypass blocks of content that are repeated on multiple Web pages.",
    "2.4.2": "Web pages, non-web documents, and software have titles that describe topic or purpose.",
    "2.4.3": "If content can be navigated sequentially and the navigation sequences affect meaning or operation, focusable components receive focus in an order that preserves meaning and operability.",
    "2.4.4": "The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link content.",
    "2.4.5": "More than one way is available to locate a Web page within a set of Web pages, except where the Web Page is the result of, or a step in, a process.",
    "2.4.6": "Headings and labels describe topic or purpose.",
    "2.4.7": "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.",
    "2.4.11": "When an element receives focus, it is not entirely covered by other content.",
    "2.5.1": "All functionality that uses multipoint or path-based gestures for operation can be operated with a single pointer without a path-based gesture.",
    "2.5.2": "For functionality that can be operated using a single pointer, completion of the function is on the up-event with an ability to abort, undo or reverse the outcome.",
    "2.5.3": "For user interface components with labels that include text or images of text, the accessible name contains the text that is presented visually.",
    "2.5.4": "Functionality that can be operated by motion can also be operated by user interface components, and the motion trigger can be disabled.",
    "2.5.8": "The size of the target for pointer inputs is at least 24 by 24 CSS pixels.",
    "2.5.7": "All functionality that uses a dragging movement for operation can be achieved by a single pointer without dragging.",
    "3.1.1": "The default human language of Web pages, non-Web documents, or software can be programmatically determined.",
    "3.1.2": "The human language of each passage or phrase in the content can be programmatically determined.",
    "3.2.1": "When any component receives focus, it does not initiate a change of context.",
    "3.2.2": "Changing the setting of any user interface component does not automatically cause a change of context unless the user has been advised of the behavior before using the component.",
    "3.2.3": "Navigational mechanisms that are repeated on multiple Web pages within a set of Web pages occur in the same relative order each time they are repeated, unless a change is initiated by the user.",
    "3.2.4": "Components that have the same functionality within a set of Web pages are identified consistently.",
    "3.2.6": "Make it easier to find help and support. If a Web page contains help mechanisms they occur in the same order relative to other page content, unless a change is initiated by the user.",
    "3.3.1": "If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.",
    "3.3.2": "Labels or instructions are provided when content requires user input.",
    "3.3.3": "If an input error is automatically detected and suggestions for correction are known, then the suggestions are provided to the user, unless it would jeopardize the security or purpose of the content.",
    "3.3.4": "For content that cause legal commitments or financial transactions for the user to occur, that modify or delete user-controllable data in data storage systems, or that submit user test responses, the user can reverse, correct, or confirm the action.",
    "3.3.7": "Make it easier for users to complete multi-step processes. Don't ask for the same information twice in the same session.",
    "3.3.8": "Make logins possible with less mental effort. Don't make people solve, recall, or transcribe something to log in.",
    "4.1.1": "(Obsolete and removed) This requirement was originally adopted to address problems that assistive technology (AT) had directly parsing HTML. AT no longer has any need to directly parse HTML. Consequently, these problems either no longer exist or are addressed by other requirements.", 
    "4.1.2": "For all user interface components (including, but not limited to: form elements, links and components generated by scripts), the name and role can be programmatically determined; states, properties, and values that can be set by the user can be programmatically set; and notification of changes to these items is available to user agents, including assistive technologies.",
    "4.1.3": "In content implemented using markup languages, status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus.",
    "HTML": "The HTML specification issues that cause accessibility issues may be covered by other rules and will be reported under those accessibility requirements. However, some non-conforming HTML specification issues are still reported.",
    "ARIA": "The ARIA specification issues that cause accessibility issues may be covered by other rules and will be reported under those accessibility requirements. However, some non-conforming ARIA specification issues are still reported.",
}     

export let a11yRulesets: Guideline[] = [
    // {
    //     id: "DEBUG",
    //     name: "DEBUG Rules",
    //     category: eRuleCategory.ACCESSIBILITY,
    //     description: "Rules for debugging",
    //     checkpoints: [{
    //         num: "1",
    //         name: "Debug CP 1",
    //         wcagLevel: "A",
    //         summary: "Rules for Debug"
    //     }]
    // },
    {
        id: "EXTENSIONS",
        name: "Extension Rules",
        category: eGuidelineCategory.ACCESSIBILITY,
        description: "Rules for enabling the browser extensions",
        type: eGuidelineType.EXTENSION,
        checkpoints: [{
            num: "1",
            name: "Extension CP 1",
            wcagLevel: "A",
            summary: "Rules for Extension"
        }]
    },
    {
        id: "IBM_Accessibility",
        name: "IBM Accessibility 7.3",
        category: eGuidelineCategory.ACCESSIBILITY,
        description: "Rules for WCAG 2.0, 2.1, 2.2 A and AA plus additional IBM supplemental requirements.",
        // This ruleset has all 2.0 and 2.1 checkpoints that are A or AA
        checkpoints: SCs
            .filter(sc => (sc.level === "A" || sc.level === "AA" || sc.level === "NA") && (sc.wcagType === "2.0" || sc.wcagType === "2.1" || sc.wcagType === "2.2" || sc.wcagType === "NA"))
            .map(sc => ({
                num: sc.num,
                scId: sc.scId,
                name: sc.handle,
                wcagLevel: sc.level,
                summary: summaries[sc.num]
            }))
    },
    {
        id: "IBM_Accessibility_next",
        name: "IBM Accessibility next",
        category: eGuidelineCategory.ACCESSIBILITY,
        description: "Rules for WCAG 2.0, 2.1, 2.2 A and AA plus additional IBM supplemental requirements.",
        // This ruleset has all 2.0 and 2.1 checkpoints that are A or AA
        checkpoints: SCs
            .filter(sc => (sc.level === "A" || sc.level === "AA" || sc.level === "NA") && (sc.wcagType === "2.0" || sc.wcagType === "2.1" || sc.wcagType === "2.2" || sc.wcagType === "NA"))
            .map(sc => ({
                num: sc.num,
                scId: sc.scId,
                name: sc.handle,
                wcagLevel: sc.level,
                summary: summaries[sc.num]
            }))
    },
    {
        id: "WCAG_2_2",
        name: "WCAG 2.2 (A, AA)",
        category: eGuidelineCategory.ACCESSIBILITY,
        description: "Rules for WCAG 2.2 A & AA. This is the current W3C recommendation (specification). Content that conforms to WCAG 2.2 also conforms to WCAG 2.1.",
        // This ruleset has all 2.0 and 2.1 checkpoints that are A or AA
        checkpoints: SCs
            .filter(sc => (sc.level === "A" || sc.level === "AA") && (sc.wcagType === "2.0" || sc.wcagType === "2.1" || sc.wcagType === "2.2"))
            .map(sc => ({
                num: sc.num,
                scId: sc.scId,
                name: sc.handle,
                wcagLevel: sc.level,
                summary: summaries[sc.num]
            }))
    },
    {
        id: "WCAG_2_1",
        name: "WCAG 2.1 (A, AA)",
        category: eGuidelineCategory.ACCESSIBILITY,
        description: "Rules for WCAG 2.1 A & AA. Content that conforms to WCAG 2.1 also conforms to WCAG 2.0.",
        // This ruleset has all 2.0 and 2.1 checkpoints that are A or AA
        checkpoints: SCs
            .filter(sc => (sc.level === "A" || sc.level === "AA") && (sc.wcagType === "2.0" || sc.wcagType === "2.1"))
            .map(sc => ({
                num: sc.num,
                scId: sc.scId,
                name: sc.handle,
                wcagLevel: sc.level,
                summary: summaries[sc.num]
            }))
    },
    {
        id: "WCAG_2_0",
        name: "WCAG 2.0 (A, AA)",
        category: eGuidelineCategory.ACCESSIBILITY,
        description: "Rules for WCAG 2.0 A & AA. Referenced by US Section 508, but not the latest W3C recommendation.",
        // This ruleset has all 2.0 checkpoints that are A or AA
        checkpoints: SCs
            .filter(sc => (sc.level === "A" || sc.level === "AA") && (sc.wcagType === "2.0"))
            .map(sc => ({
                num: sc.num,
                scId: sc.scId,
                name: sc.handle,
                wcagLevel: sc.level,
                summary: summaries[sc.num]
            }))
    }
]
