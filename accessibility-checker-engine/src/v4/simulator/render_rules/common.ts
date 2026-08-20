import { SRCursor } from "../SRCursor";
import { SRRendererRule } from "../SRRendererRule";
import { AriaUtil } from "../../util/AriaUtil";
import { ARIADefinitions } from "../../../v2/aria/ARIADefinitions";
import { DOMWalker } from "../../../v2/dom/DOMWalker";
import { VisUtil } from "../../util/VisUtil";
import { NavigationMode } from "../SRTypes";

/**
 * Provide the name, surrounded by the quoteCharBefore and quoteCharAfter and followed by the padding if the name exists
 * @param cursor The cursor for which to fetch the name
 * @param padding String to add after, if the name exists
 * @param quoteCharBefore The string to use as the leading quote, if the name exists
 * @param quoteCharBefore The string to use as the trailing quote, if the name exists
 * @returns 
 */
export function quoteNamePadAfter(cursor: SRCursor, padding?: string, quoteCharBefore?: string, quoteCharAfter?: string) {
    return cursor.getName() 
        ? `${quoteName(cursor)}${padding || ", "}`
        : "";
}

/**
 * Provide the name, surrounded by quotes and preceded by the padding if the name exists
 * @param cursor The cursor for which to fetch the name
 * @param padding String to add before, if the name exists (defaults to ", ")
 * @returns The quoted name with leading padding, or empty string if no name exists
 */
export function quoteNamePadBefore(cursor: SRCursor, padding?: string) {
    return cursor.getName()
        ? `${padding || ", "}${quoteName(cursor)}`
        : "";
}

/**
 * Provide the name surrounded by quote characters
 * @param cursor The cursor for which to fetch the name
 * @param quoteCharBefore The string to use as the leading quote (defaults to ")
 * @param quoteCharAfter The string to use as the trailing quote (defaults to ")
 * @returns The quoted name, or empty string if no name exists
 */
export function quoteName(cursor: SRCursor, quoteCharBefore?: string, quoteCharAfter?: string) {
    return cursor.getName()
        ? `${quoteCharBefore || '"'}${cursor.getName()}${quoteCharAfter || '"'}`
        : "";
}

/**
 * Get the role description for an element, using aria-roledescription if present
 * Falls back to the provided default role name if aria-roledescription is not specified or empty
 * @param cursor The cursor positioned at the element
 * @param defaultRole The default role name to use if aria-roledescription is not present
 * @returns The role description (either custom or default)
 */
export function getRoleDescription(cursor: SRCursor, defaultRole: string): string {
    const elem = cursor.getElement();
    if (!elem) return defaultRole;
    
    const roleDescription = elem.getAttribute("aria-roledescription");
    if (roleDescription && roleDescription.trim().length > 0) {
        return roleDescription.trim();
    }
    
    return defaultRole;
}

/**
 * Generate the screen reader announcement for a link element
 * Distinguishes between same-page links (anchors) and regular links
 * @param cursor The cursor positioned at the link element
 * @param mode The navigation mode (affects announcement order)
 * @returns The formatted link announcement string
 */
export function getLinkAnnouncement(cursor: SRCursor, mode?: NavigationMode): string {
    let href: string = ((cursor.getNode() as any).href) || "";
    let announceStr = "";
    if (href.startsWith(document.location.href) && href.charAt(document.location.href.length) === "#") {
        announceStr = `same page link`;
    } else {
        announceStr = `link`;
    }
    let nameInfo = cursor.getNameInfo();
    if (nameInfo && !["content", "text"].includes(nameInfo.nameFrom)) {
        if (mode === "tab_focus") {
            return `[${quoteNamePadAfter(cursor)}${announceStr}]`;
        } else {
            return `[${announceStr}${quoteNamePadBefore(cursor)}]`;
        }
    }
    return `[${announceStr}]`;
}

/**
 * Get the description text from aria-describedby references
 * Resolves all IDs in aria-describedby and concatenates their text content
 * @param elem The element with aria-describedby attribute
 * @param mode The navigation mode (returns empty string in "item" mode)
 * @returns The formatted description text with leading comma and quotes, or empty string
 */
function getDescribedByAnnouncements(elem: HTMLElement, mode?: string): string {
    const describedBy = elem.getAttribute("aria-describedby");
    if (!describedBy) return "";
    const descriptionElems = describedBy
        .split(/\s+/)
        .map(id => document.getElementById(id))
        .filter(descElem => !!descElem) as HTMLElement[];

    const descriptionText = descriptionElems
        .map(descElem => descElem.textContent?.trim())
        .filter(text => !!text)
        .join(" ");

    if (!descriptionText || descriptionText.length === 0) return "";
    if (mode === "item") return `, \u0001${descriptionText}\u0002`;
    return `, "${descriptionText}"`;
}

/**
 * Get state announcements for disabled, readonly, required, and invalid attributes
 * @param elem The element to check for state attributes
 * @returns A string with state announcements (e.g., ", disabled", ", read only", ", required", ", invalid")
 */
function getStateAnnouncements(elem: HTMLElement): string {
    let states = "";
    
    // Check for disabled state (both attribute and aria-disabled)
    if (elem.hasAttribute("disabled") || elem.getAttribute("aria-disabled") === "true") {
        states += ", disabled";
    }
    
    // Check for readonly state (both attribute and aria-readonly)
    if (elem.hasAttribute("readonly") || elem.getAttribute("aria-readonly") === "true") {
        states += ", read only";
    }
    
    // Check for required state (both attribute and aria-required)
    if (elem.hasAttribute("required") || elem.getAttribute("aria-required") === "true") {
        states += ", required";
        // A required <select> whose selected value is "" is implicitly invalid —
        // JAWS and NVDA announce "invalid entry" in this case.
        if (elem.nodeName.toUpperCase() === "SELECT" && (elem as HTMLSelectElement).validity.valueMissing) {
            states += ", invalid entry";
        }
    }

    // Check for invalid state (aria-invalid)
    if (elem.getAttribute("aria-invalid") === "true") {
        states += ", invalid";
    }
    
    return states;
}

/**
 * Check if a listitem contains interactive/widget elements
 * Screen readers typically don't read the accessible name of a listitem when it contains interactive elements
 * Uses DOMWalker to properly traverse shadow DOM and other complex structures
 */
function listitemContainsInteractiveElement(cursor: SRCursor): boolean {
    const elem = cursor.getElement();
    if (!elem) return false;
    
    // Use DOMWalker to traverse the entire subtree including shadow DOM
    const walker = new DOMWalker(elem, false, elem, false);
    
    // Walk through all descendants
    while (walker.nextNode()) {
        // Only check element nodes at start tags
        if (walker.node.nodeType === 1 && !walker.bEndTag) {
            const role = AriaUtil.getResolvedRole(walker.node as HTMLElement);
            if (role && ARIADefinitions.designPatterns[role] && ARIADefinitions.designPatterns[role].roleType === 'widget') {
                return true;
            }
        }
    }
    return false;
}

/**
 * Check if an iframe's content can be accessed (not cross-origin)
 * Attempts to access the iframe's document to determine if it's accessible
 * @param iframe The iframe element to check
 * @returns true if the iframe content is accessible, false if cross-origin or blocked
 */
function canAccessFrame(iframe) {
    try {
        // This throws a DOMException for cross-origin frames
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        return doc !== null;
    } catch (e) {
        return false;
        // if (e instanceof DOMException && e.name === 'SecurityError') {
        //     return false; // Cross-origin, access blocked
        // }
        // throw e; // Re-throw unexpected errors
    }
}

export const RULES: SRRendererRule[] = [
    // Single role rules - alphabetically sorted
    
    // Button role
    new SRRendererRule({
        roles: ["button"],
        elems: [],
        modes: ["item", "button", "tab_focus"],
        tests: [
            (cursor: SRCursor, _oldCursor?: SRCursor, mode?: string) => {
                if (!cursor.isStartTag()) return null;
                const elem = cursor.getNode() as HTMLElement;
                const roleDesc = getRoleDescription(cursor, "button");
                if (elem.getAttribute("aria-pressed") === "true") {
                    return `[toggle ${roleDesc}, pressed${quoteNamePadBefore(cursor)}${getDescribedByAnnouncements(elem, mode)}]`;
                }
                return null;
            },
            (cursor: SRCursor, _oldCursor?: SRCursor, mode?: string) => {
                if (!cursor.isStartTag()) return null;
                const elem = cursor.getNode() as HTMLElement;
                const roleDesc = getRoleDescription(cursor, "button");
                if (elem.getAttribute("aria-pressed") === "false") {
                    return `[toggle ${roleDesc}, not pressed${quoteNamePadBefore(cursor)}${getDescribedByAnnouncements(elem, mode)}]`;
                }
                return null;
            },
            (cursor: SRCursor, _oldCursor?: SRCursor, mode?: string) => {
                if (cursor.isEndTag()) return undefined;
                let expandStr = "";
                const elem = cursor.getElement();
                const roleDesc = getRoleDescription(cursor, "button");
                if (["menu", "true"].includes(elem.getAttribute("aria-haspopup"))) {
                    expandStr += ", menu";
                }
                if (elem.hasAttribute("aria-expanded")) {
                    expandStr += `, ${elem.getAttribute("aria-expanded") === "true" ? "expanded" : "collapsed"}`;
                }
                expandStr += getStateAnnouncements(elem);
                return `[${quoteNamePadAfter(cursor)}${roleDesc}${expandStr}${getDescribedByAnnouncements(elem, mode)}]`;
            },
            (cursor: SRCursor) => { if (cursor.isEndTag()) return ""; }
        ]
    }),

    // Checkbox role
    new SRRendererRule({
        roles: ["checkbox"],
        elems: [],
        modes: ["item", "checkbox", "tab_focus"],
        tests: [
            (cursor: SRCursor, _oldCursor?: SRCursor, mode?: string) => {
                if (cursor.isStartTag()) {
                    const elem = cursor.getNode() as HTMLInputElement;
                    const roleDesc = getRoleDescription(cursor, "checkbox");
                    let stateStr = "";
                    if (elem.getAttribute("aria-checked") === "mixed") {
                        stateStr = "half checked";
                    } else {
                        let bChecked = false;
                        if (elem.hasAttribute("aria-checked")) {
                            bChecked = elem.getAttribute("aria-checked") === "true";
                        } else {
                            bChecked = elem.checked;
                        }
                        stateStr = bChecked ? "checked" : "not checked";
                    }
                    stateStr += getStateAnnouncements(cursor.getElement());
                    return `[${roleDesc}, ${stateStr}${quoteNamePadBefore(cursor)}${getDescribedByAnnouncements(cursor.getElement(), mode)}]`
                } else {
                    return "";
                }
            }
        ]
    }),

    // Cell, Columnheader, and Rowheader roles
    new SRRendererRule({
        roles: ["cell", "columnheader", "rowheader"],
        elems: [],
        modes: ["item", "table"],
        tests: [
            (cursor: SRCursor) => {
                if (!cursor.isStartTag()) return null;
                
                // Get the cell element
                const cellElem = cursor.getElement();
                if (!cellElem) return null;
                
                // Check if the cell has any visible content by checking:
                // 1. Text content (trimmed)
                // 2. Child elements with roles (buttons, links, etc.)
                // 3. Images with alt text
                
                const textContent = cellElem.textContent?.trim() || "";
                
                // Check for child elements with interactive roles or content
                const walker = new DOMWalker(cellElem, false, cellElem, false);
                let hasContent = textContent.length > 0;
                
                if (!hasContent) {
                    // Check for elements that would have content (buttons, links, images, etc.)
                    while (walker.nextNode()) {
                        if (walker.node.nodeType === 1 && !walker.bEndTag) {
                            const elem = walker.node as HTMLElement;
                            const role = AriaUtil.getResolvedRole(elem);
                            
                            // Check for interactive elements or elements with accessible names
                            if (role && ARIADefinitions.designPatterns[role]) {
                                hasContent = true;
                                break;
                            }
                            
                            // Check for images with alt text
                            if (elem.nodeName.toUpperCase() === "IMG" && elem.hasAttribute("alt")) {
                                hasContent = true;
                                break;
                            }
                        }
                    }
                }
                
                // If the cell is empty, return "[blank]"
                if (!hasContent) {
                    return "[blank]";
                }
                
                // Otherwise, return null to let default rendering continue
                return null;
            }
        ]
    }),

    // Combobox role
    new SRRendererRule({
        roles: ["combobox"],
        elems: [],
        modes: ["item", "combo", "tab_focus"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.isEndTag()) return "";
                const roleDesc = getRoleDescription(cursor, "combo box");
                const elem = cursor.getElement();
                let state = "";
                if (cursor.getNode().nodeName.toUpperCase() === "SELECT") {
                    state = ", collapsed";

                    const selectElem = cursor.getElement() as HTMLSelectElement;
                    let valueElem = selectElem.selectedIndex >= 0 ? selectElem.options[selectElem.selectedIndex] : null;
                    let valueStr = "";
                    if (valueElem) {
                        let temp = new SRCursor(valueElem, false);
                        valueStr = quoteNamePadBefore(temp, ", ");
                    }
                    state += getStateAnnouncements(elem);
                    return `[${quoteNamePadAfter(cursor)}${roleDesc}${state}${valueStr}]`;
                } else if (cursor.getNode().nodeName.toUpperCase() === "INPUT") {
                    if (elem.hasAttribute("aria-expanded")) {
                        state = `, ${elem.getAttribute("aria-expanded") === "true" ? "expanded" : "collapsed"}`;
                    }
                    state += getStateAnnouncements(elem);
                    return `[${quoteNamePadAfter(cursor)}${roleDesc}${state}, has auto complete, editable, opens list]`;
                } else {
                    if (elem.hasAttribute("aria-expanded")) {
                        state = `, ${elem.getAttribute("aria-expanded") === "true" ? "expanded" : "collapsed"}`;
                        if (elem.hasAttribute("aria-autocomplete")) {
                            state += `, has auto complete`;
                        }
                    }
                    state += getStateAnnouncements(elem);

                    // Determine the current value to announce:
                    // 1. If expanded and aria-controls points to a listbox, use the aria-selected option text
                    // 2. Otherwise use the combobox element's own text content
                    let valueStr = "";
                    const controlsId = elem.getAttribute("aria-controls");
                    const popup = controlsId ? document.getElementById(controlsId) : null;
                    if (popup) {
                        const selectedOption = popup.querySelector("[role='option'][aria-selected='true']") as HTMLElement | null;
                        if (selectedOption) {
                            valueStr = `, "${(selectedOption.textContent || "").trim()}"`;
                        }
                    }
                    if (!valueStr) {
                        const textContent = (elem.textContent || "").trim();
                        if (textContent) {
                            valueStr = `, "${textContent}"`;
                        }
                    }

                    return `[${quoteNamePadAfter(cursor)}${roleDesc}${state}${valueStr}]`;
                }
            }
        ]
    }),

    // Listbox role - covers <select size> / <select multiple>
    new SRRendererRule({
        roles: ["listbox"],
        elems: [],
        modes: ["item", "combo", "tab_focus"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.isEndTag()) return "";
                const roleDesc = getRoleDescription(cursor, "list box");
                const elem = cursor.getElement();
                let state = "";

                if (cursor.getNode().nodeName.toUpperCase() === "SELECT") {
                    const selectElem = cursor.getElement() as HTMLSelectElement;
                    const selectedOptions = Array.from(selectElem.options).filter(o => o.selected);
                    const valueStr = selectedOptions
                        .map(o => quoteNamePadBefore(new SRCursor(o, false), ", "))
                        .join("");
                    state += getStateAnnouncements(elem);
                    return `[${quoteNamePadAfter(cursor)}${roleDesc}${state}${valueStr}]`;
                }
                // ARIA listbox (non-select)
                state += getStateAnnouncements(elem);
                const textContent = (elem.textContent || "").trim();
                const valueStr = textContent ? `, "${textContent}"` : "";
                return `[${quoteNamePadAfter(cursor)}${roleDesc}${state}${valueStr}]`;
            }
        ]
    }),

    // Default role (fallback)
    new SRRendererRule({
        roles: ["default"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => cursor.isStartTag() ?
                `!!<${cursor.getRole()}>${(cursor.getNameInfo()?.name + "")}!!` :
                `!!</${cursor.getRole()}>!!`
        ]
    }),

    // Deletion role
    new SRRendererRule({
        roles: ["deletion"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => (cursor.isStartTag() && `[deleted]` || "")
        ]
    }),

    // Dialog role
    new SRRendererRule({
        roles: ["dialog"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                return cursor.isEndTag() ? `[End of dialog]` : `[Start of dialog${quoteNamePadBefore(cursor)}`;
            }
        ]
    }),

    // Contenteditable (editable region) - elements with contenteditable="true" (or "")
    // Must come before the generic/document rule so it takes precedence.
    // Screen readers (JAWS/NVDA) announce these as an editable section when entering
    // and "out of section" when leaving.
    // We use a broad element list (covering the most common host elements) plus
    // "generic" and "paragraph" roles so both bare <div> and labelled variants are caught.
    // The test function always checks the attribute and bails out when:
    //   - the attribute is absent or "false"
    //   - an explicit ARIA role overrides the semantics (e.g. role="textbox")
    new SRRendererRule({
        roles: ["generic", "paragraph"],
        elems: ["DIV", "SPAN", "P", "SECTION", "ARTICLE", "HEADER", "FOOTER", "MAIN", "ASIDE", "NAV", "LI", "TD", "TH", "PRE", "BLOCKQUOTE", "FIGURE", "FIGCAPTION", "DETAILS", "SUMMARY"],
        modes: ["item", "tab_focus"],
        tests: [
            (cursor: SRCursor, _oldCursor?: SRCursor, mode?: string) => {
                const elem = cursor.getElement();
                if (!elem) return null;
                const ce = elem.getAttribute("contenteditable");
                if (ce !== "true" && ce !== "") return null;
                // Defer to the explicit-role rule when an author provides a concrete ARIA role
                // (e.g. role="textbox") — those roles carry richer semantics and their own rules.
                if (elem.hasAttribute("role")) return null;
                // <p> retains its "paragraph" semantics even when editable.
                const isParagraph = cursor.getRole() === "paragraph" || elem.nodeName.toUpperCase() === "P";
                if (cursor.isEndTag()) {
                    return mode === "item" ? (isParagraph ? "[out of paragraph]" : "[out of section]") : "";
                }
                // aria-readonly is not a supported state on contenteditable elements —
                // screen readers (JAWS/NVDA) ignore it entirely, so we exclude it here.
                // Only disabled is meaningful (it overrides the editable semantics).
                let stateAnnouncements = "";
                if (elem.hasAttribute("disabled") || elem.getAttribute("aria-disabled") === "true") {
                    stateAnnouncements = ", disabled";
                }
                const containerWord = isParagraph ? "paragraph" : "section";
                // In tab_focus mode, only append textContent when the accessible name
                // is extrinsic (aria-label / aria-labelledby, i.e. nameFrom ≠ "content"/"text").
                // When nameFrom IS "content", jumpCurrentEnd already walks children so
                // appending again would duplicate the text.
                const nameInfo = cursor.getNameInfo();
                const nameFromContent = !nameInfo || ["content", "text"].includes(nameInfo.nameFrom);
                const textContent = (mode === "tab_focus" && !nameFromContent) ? elem.textContent?.trim() : "";
                const contentSuffix = textContent ? ` ${textContent}` : "";
                return `[${quoteNamePadAfter(cursor)}${containerWord}, editable${stateAnnouncements}]${contentSuffix}`;
            }
        ]
    }),

    // Document role
    new SRRendererRule({
        roles: ["document", "generic"],
        elems: [],
        modes: ["item"],
        tests: [
            () => ""
        ]
    }),

    // Graphics document role
    new SRRendererRule({
        roles: ["graphics-document"],
        elems: [],
        modes: ["item", "image"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.isStartTag() && !cursor.getNameInfo()?.name && cursor.getNameInfo()?.name !== "") {
                    // Don't announce unlabeled graphics that are hidden inside links or headings
                    const parentHeadingOrLink = cursor.getCurrentOrParentByRoleClone(["heading", "link"]);
                    if (parentHeadingOrLink && VisUtil.isNodeHiddenFromAT(cursor.getElement())) {
                        return "";
                    }
                    return "[Unlabeled graphic]";
                }
                return null;
            },
            (cursor: SRCursor) => (cursor.isStartTag() && (cursor.getNameInfo()?.name === "")) ? "" : null,
            (cursor: SRCursor) => (cursor.isStartTag() && cursor.getNameInfo()?.name && `[graphic${quoteNamePadBefore(cursor)}]`) || null,
            (cursor: SRCursor) => (cursor.isEndTag()) ? "" : null
        ]
    }),

    // Heading role
    new SRRendererRule({
        roles: ["heading"],
        elems: [],
        modes: ["item", "tab_focus"],
        tests: [
            (cursor: SRCursor, _oldCursor: SRCursor, mode: NavigationMode) => {
                if (mode === "tab_focus" && cursor.isStartTag()) return "";
                if (mode === "item" && cursor.isEndTag()) return "";
                let level: string;
                const node = cursor.getElement();
                if (node.ariaLevel) {
                    // Explicit aria-level attribute
                    level = node.ariaLevel;
                } else if (node.getAttribute('role') === 'heading') {
                    // role="heading" without aria-level defaults to 2
                    level = '2';
                } else {
                    // Native heading element (h1-h6), extract number from tag name
                    level = node.nodeName.substring(1);
                }

                let nameInfo = cursor.getNameInfo();
                if ((!nameInfo || ["content", "text"].includes(nameInfo.nameFrom)) && !(node.textContent || "").trim()) {
                    return "";
                }

                if (nameInfo && !["content", "text"].includes(nameInfo.nameFrom)) {
                    return `[heading level ${level}${quoteNamePadBefore(cursor)}]`;
                } else {
                    return `[heading level ${level}]`;
                }
            }
        ]
    }),

    // -- in heading mode
    new SRRendererRule({
        roles: ["heading"],
        elems: [],
        modes: ["heading", "h1", "h2", "h3", "h4", "h5", "h6"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.isStartTag()) {
                    const node = cursor.getNode() as HTMLElement;
                    let level: string;
                    
                    if (node.ariaLevel) {
                        // Explicit aria-level attribute
                        level = node.ariaLevel;
                    } else if (node.getAttribute('role') === 'heading') {
                        // role="heading" without aria-level defaults to 2
                        level = '2';
                    } else {
                        // Native heading element (h1-h6), extract number from tag name
                        level = node.nodeName.substring(1);
                    }

                    let nameInfo = cursor.getNameInfo();
                    if ((!nameInfo || ["content", "text"].includes(nameInfo.nameFrom)) && !(node.textContent || "").trim()) {
                        return "";
                    }
                    
                    return `[${quoteNamePadAfter(cursor)}heading level ${level}]`;
                }
                return "";
            }
        ]
    }),

    // Image role
    new SRRendererRule({
        roles: ["img"],
        elems: [],
        modes: ["item", "image"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.isEndTag()) {
                    return "";
                } else {
                    if (!cursor.getNameInfo()?.name && cursor.getNameInfo()?.name !== "") {
                        // Don't announce unlabeled graphics that are hidden inside links or headings
                        // (these were only included because of the SKIP_ITEM_BEHAVIOR change)
                        const parentHeadingOrLink = cursor.getCurrentOrParentByRoleClone(["heading", "link"]);
                        if (parentHeadingOrLink && VisUtil.isNodeHiddenFromAT(cursor.getElement())) {
                            return "";
                        }
                        return "[Unlabeled graphic]"
                    } else if (cursor.getNameInfo()?.name === "") {
                        return "";
                    } else {
                        return `[graphic${quoteNamePadBefore(cursor)}]`
                    }
                }
            }
        ]
    }),

    // Insertion role
    new SRRendererRule({
        roles: ["insertion"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => (cursor.isStartTag() && `[inserted]` || "")
        ]
    }),

    // Link role
    new SRRendererRule({
        roles: ["link"],
        elems: [],
        modes: ["item", "region", "link", "tab_focus"],
        tests: [
            (cursor: SRCursor, _oldCursor: SRCursor, mode: NavigationMode) => {
                if (cursor.isStartTag() && !["content", "text"].includes(cursor.getNameInfo()?.nameFrom)) {
                    return getLinkAnnouncement(cursor, mode);
                }
                return null;
            }
        ]
    }),

    // Listitem role
    new SRRendererRule({
        roles: ["listitem"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                let isOrdered: boolean | undefined;
                let parentListElem: HTMLElement | undefined;
                let walkParents = DOMWalker.parentNode(cursor.getNode());
                while (typeof isOrdered === "undefined" && walkParents) {
                    if (walkParents.nodeType === 1) {
                        const elem = walkParents as HTMLElement;
                        if (elem.hasAttribute("role")) {
                            if (elem.getAttribute("role") === "list") {
                                isOrdered = false;
                                parentListElem = elem;
                            }
                        } else if (elem.nodeName.toUpperCase() === "UL") {
                            isOrdered = false;
                            parentListElem = elem;
                        } else if (elem.nodeName.toUpperCase() === "OL") {
                            isOrdered = true;
                            parentListElem = elem;
                        }
                    }
                    walkParents = DOMWalker.parentNode(walkParents);
                }
                
                // Check if listitem contains interactive elements
                // Screen readers don't read the accessible name when interactive elements are present
                const hasInteractiveContent = listitemContainsInteractiveElement(cursor);
                const nameToUse = hasInteractiveContent ? "" : (cursor.getNameInfo()?.name || "");
                
                let retStr = "";
                if (!isOrdered) {
                    const elem = cursor.getElement();
                    if ((elem.nodeName.toUpperCase() === "LI" && window.getComputedStyle(elem).listStyleType === "none")
                        || elem.nodeName.toUpperCase() !== "LI")
                    {
                        retStr = cursor.isStartTag() ? `${nameToUse}` : "";
                    } else {
                        retStr = cursor.isStartTag() ? `[bullet] ${nameToUse}` : "";
                    }
                } else {
                    // For ordered lists, count sibling listitems and account for start attribute
                    let count = 1; // Start at 1 by default
                    
                    // Get the start attribute if it exists on the <ol> element
                    if (parentListElem && parentListElem.nodeName.toUpperCase() === 'OL' &&
                        parentListElem.hasAttribute('start')) {
                        const startValue = parseInt(parentListElem.getAttribute('start') || '1', 10);
                        count = isNaN(startValue) ? 1 : startValue;
                    }
                    
                    // Count previous sibling listitems at the same level using DOMWalker
                    const currentElem = cursor.getElement();
                    let sibling = DOMWalker.previousSiblingNotOwnedBySlot(currentElem);
                    while (sibling) {
                        // Only count direct siblings that are listitems (element nodes only)
                        if (sibling.nodeType === 1) {
                            const siblingElem = sibling as HTMLElement;
                            if (siblingElem.getAttribute('role') === 'listitem' ||
                                siblingElem.nodeName.toUpperCase() === 'LI') {
                                count++;
                            }
                        }
                        sibling = DOMWalker.previousSiblingNotOwnedBySlot(sibling);
                    }
                    
                    retStr = cursor.isStartTag() ? `${count}. ${nameToUse}` : "";
                }
                return retStr;
            }
        ]
    }),

    // Math role
    new SRRendererRule({
        roles: ["math"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => cursor.isEndTag() ? `[math content]` : ""
        ]
    }),

    // Link role
    new SRRendererRule({
        roles: ["menuitem"],
        elems: [],
        modes: ["item", "tab_focus", "region"],
        tests: [
            (cursor: SRCursor) => {
                let retVal = "";
                if (cursor.isStartTag()) {
                    // let isSubMenuContainer = false;
                    // for (let checkChildren=cursor.getNode().firstChild; !isSubMenuContainer && checkChildren !== null; checkChildren = checkChildren.nextSibling) {
                    //     isSubMenuContainer = checkChildren.nodeName.toUpperCase() === "UL";
                    // }
                    // if (isSubMenuContainer) return "[????menu]";
                    let expandStr = "";
                    const elem = cursor.getElement();
                    if (elem.getAttribute("aria-haspopup") === "true") {
                        expandStr += ", sub-menu";
                    }
                    if (elem.hasAttribute("aria-expanded")) {
                        expandStr += `, ${elem.getAttribute("aria-expanded") === "true" ? "expanded" : "collapsed"}`;
                    }

                    retVal = `[menu${expandStr}`;
                    let nameInfo = cursor.getNameInfo();
                    if (nameInfo && !["content", "text"].includes(nameInfo.nameFrom)) {
                        retVal += quoteNamePadBefore(cursor);
                    }
                    retVal += "]";
                }
                return retVal;
            }
        ]
    }),

    // Meter role
    new SRRendererRule({
        roles: ["meter"],
        elems: [],
        modes: ["item", "tab_focus"],
        tests: [
            (cursor: SRCursor) => cursor.isStartTag() ? `[progress bar, ${((cursor.getNode() as HTMLInputElement).value)}]` : ""
        ]
    }),

    // Progressbar role
    new SRRendererRule({
        roles: ["progressbar"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => cursor.isStartTag() ? `[progress bar, ${((cursor.getNode() as HTMLInputElement).value)}]` : ""
        ]
    }),

    // Radio role
    new SRRendererRule({
        roles: ["radio"],
        elems: [],
        modes: ["item", "tab_focus"],
        tests: [
            (cursor: SRCursor, _oldCursor?: SRCursor, mode?: string) => {
                if (cursor.isStartTag()) {
                    const roleDesc = getRoleDescription(cursor, "radio button");
                    let bChecked = false;
                    if (cursor.getElement().hasAttribute("aria-checked")) {
                        bChecked = cursor.getElement().getAttribute("aria-checked") === "true";
                    } else {
                        bChecked = (cursor.getNode() as any).checked;
                    }
                    let stateStr = getStateAnnouncements(cursor.getElement());
                    return `[${roleDesc}, ${bChecked ? "checked" : "not checked"}${stateStr}${quoteNamePadBefore(cursor)}${getDescribedByAnnouncements(cursor.getElement(), mode)}]`
                } else {
                    return "";
                }
            }
        ]
    }),

    // Searchbox role
    new SRRendererRule({
        roles: ["searchbox"],
        elems: [],
        modes: ["item", "tab_focus"],
        tests: [
            (cursor: SRCursor) => cursor.isStartTag() ? `[${quoteNamePadAfter(cursor)}edit]` : ""
        ]
    }),

    // Separator role
    new SRRendererRule({
        roles: ["separator"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => (cursor.isStartTag() && `[separator]` || "")
        ]
    }),

    // Slider role
    new SRRendererRule({
        roles: ["slider"],
        elems: [],
        modes: ["item", "tab_focus"],
        tests: [
            (cursor: SRCursor, _oldCursor?: SRCursor, mode?: string) => {
                if (!cursor.isStartTag()) return "";
                const roleDesc = getRoleDescription(cursor, "slider");
                const elem = cursor.getElement();
                // Check for aria-valuenow first, then fall back to native value property
                const value = elem.hasAttribute("aria-valuenow")
                    ? elem.getAttribute("aria-valuenow")
                    : (cursor.getNode() as any).value;
                return `[${quoteNamePadAfter(cursor)}${roleDesc}, ${value}${getDescribedByAnnouncements(cursor.getElement(), mode)}]`;
            }
        ]
    }),

    // Spinbutton role
    new SRRendererRule({
        roles: ["spinbutton"],
        elems: [],
        modes: ["item", "tab_focus"],
        tests: [
            (cursor: SRCursor, _oldCursor?: SRCursor, mode?: string) => {
                if (!cursor.isStartTag()) return "";
                const roleDesc = getRoleDescription(cursor, "spinbutton");
                return `[${quoteNamePadAfter(cursor)}${roleDesc}, editable${getDescribedByAnnouncements(cursor.getElement(), mode)}]`;
            }
        ]
    }),

    // Tab role
    new SRRendererRule({
        roles: ["tab"],
        elems: [],
        modes: ["item", "tab_focus"],
        tests: [
            (cursor: SRCursor) => {
                if (!cursor.isStartTag()) return "";
                const roleDesc = getRoleDescription(cursor, "tab");
                return `[${roleDesc}${(cursor.getNode() as HTMLElement).getAttribute("aria-selected") === "true" ? ", selected" : ""}${quoteNamePadBefore(cursor)}]`;
            }
        ]
    }),

    // Tablist role
    new SRRendererRule({
        roles: ["tablist"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.getNameInfo() === null) return null;
                if (cursor.isStartTag()) {
                    return `[group start${quoteNamePadBefore(cursor)}]`;
                } else {
                    return `[group end${quoteNamePadBefore(cursor)}]`;
                }
            }
        ]
    }),

    // Tabpanel role
    new SRRendererRule({
        roles: ["tabpanel"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.getNameInfo() === null) return null;
                if (cursor.isStartTag()) {
                    return `[Tab panel start${quoteNamePadBefore(cursor)}]`;
                } else {
                    return `[Tab panel end${quoteNamePadBefore(cursor)}]`;
                }
            }
        ]
    }),

    // Text role
    new SRRendererRule({
        roles: ["text"],
        elems: [],
        modes: ["item", "link", "tab_focus", "region"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.isEndTag() || !cursor.getParentElement()?.getElement()) return null;
                const elem = cursor.getParentElement()?.getElement();
                if (elem.ownerDocument.defaultView.getComputedStyle(elem).textDecorationLine === "line-through") {
                    return `[strikethrough] ${(cursor.getNameInfo()?.name + "")} [end strikethrough]`;
                }
                return `${(cursor.getNameInfo()?.name + "")}`;
            }
        ]
    }),

    // -- in heading mode
    new SRRendererRule({
        roles: ["text"],
        elems: [],
        modes: ["heading"],
        tests: [
            (cursor: SRCursor) => ""
        ]
    }),

    // Textbox role
        new SRRendererRule({
            roles: ["textbox"],
            elems: [],
            modes: ["item", "tab_focus"],
            tests: [
                (cursor: SRCursor, _oldCursor?: SRCursor, mode?: string) => {
                    const elem = cursor.getElement();
                    if (cursor.isEndTag()) {
                        return mode === "item" && elem.nodeName.toUpperCase() === "TEXTAREA" ? "[out of edit]" : "";
                    }
    
                    if (!cursor.isStartTag()) {
                        return "";
                    }
    
                    let attributes = "";
                    if (elem.hasAttribute("placeholder") && elem.getAttribute("placeholder").trim().length > 0) {
                        attributes += `, placeholder: ${elem.getAttribute("placeholder")}`;
                    }
                    attributes += getStateAnnouncements(elem);
    
                    const isMultiline = elem.nodeName.toUpperCase() === "TEXTAREA" || elem.getAttribute("aria-multiline") === "true";
                    const describedBy = getDescribedByAnnouncements(elem, mode);
    
                    if (isMultiline) {
                        const textContent = mode === "tab_focus" ? elem.textContent?.trim() : "";
                        const contentSuffix = textContent ? ` ${textContent}` : "";
                        return `[${quoteNamePadAfter(cursor)}edit, multiline${attributes}${describedBy}]${contentSuffix}`;
                    }
    
                    return `[${quoteNamePadAfter(cursor)}edit${attributes}${describedBy}]`;
                }
            ]
        }),

    // Treeitem role
    new SRRendererRule({
        roles: ["treeitem"],
        elems: [],
        modes: ["item", "tab_focus"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.isEndTag()) return "";
                
                const elem = cursor.getElement();
                
                // Build the announcement string without the name (let content render separately)
                let announcement = `[treeview item`;
                
                // Add selected state if present
                if (elem.getAttribute("aria-selected") === "true") {
                    announcement += ", selected";
                }
                
                // Add expanded/collapsed state if present
                if (elem.hasAttribute("aria-expanded")) {
                    announcement += elem.getAttribute("aria-expanded") === "true" ? ", expanded" : ", collapsed";
                }
                
                // Add level if explicitly set or calculate from nesting
                let level = elem.getAttribute("aria-level");
                if (level) {
                    announcement += `, level ${level}`;
                } else {
                    // Calculate level by counting parent treeitems or groups using DOMWalker for shadow DOM support
                    let calculatedLevel = 1;
                    let parent = DOMWalker.parentElement(elem);
                    while (parent) {
                        const parentRole = AriaUtil.getResolvedRole(parent);
                        if (parentRole === "group" || parentRole === "tree") {
                            // Check if this group is inside a treeitem
                            let groupParent = DOMWalker.parentElement(parent);
                            while (groupParent) {
                                const groupParentRole = AriaUtil.getResolvedRole(groupParent);
                                if (groupParentRole === "treeitem") {
                                    calculatedLevel++;
                                    break;
                                } else if (groupParentRole === "tree") {
                                    break;
                                }
                                groupParent = DOMWalker.parentElement(groupParent);
                            }
                        }
                        parent = DOMWalker.parentElement(parent);
                    }
                    if (calculatedLevel > 1) {
                        announcement += `, level ${calculatedLevel}`;
                    }
                }
                
                // Add position information (aria-posinset/aria-setsize or calculate)
                let position = elem.getAttribute("aria-posinset");
                let setSize = elem.getAttribute("aria-setsize");
                
                if (!position || !setSize) {
                    // Calculate position by counting siblings with same role using DOMWalker for shadow DOM support
                    let pos = 0;
                    let total = 0;
                    const parent = DOMWalker.parentElement(elem);
                    if (parent) {
                        // Iterate through children to count treeitems
                        let child = DOMWalker.firstChildNotOwnedBySlot(parent);
                        while (child) {
                            if (child.nodeType === 1) { // Element node
                                const childElem = child as HTMLElement;
                                if (AriaUtil.getResolvedRole(childElem) === "treeitem") {
                                    total++;
                                    if (childElem === elem) {
                                        pos = total;
                                    }
                                }
                            }
                            child = child.nextSibling;
                        }
                    }
                    position = pos.toString();
                    setSize = total.toString();
                }
                
                announcement += `, ${position} of ${setSize}] `;
                
                return announcement;
            }
        ]
    }),

    // HTML Element rules

    // Preformatted text line rendering: when cursor is at a <pre> element with
    // preLineIndex set, render only that line of the pre's text content.
    // This rule fires inside renderRange for per-line item stops.
    new SRRendererRule({
        roles: [],
        elems: ["PRE"],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.isEndTag()) return "";
                if (cursor.preLineIndex === undefined) return null; // let container_enter handle it
                const fullText = (cursor.getNode() as HTMLElement).textContent ?? "";
                const rawLines = fullText.split("\n");
                let start = 0;
                while (start < rawLines.length && rawLines[start].trim() === "") start++;
                let end = rawLines.length - 1;
                while (end >= start && rawLines[end].trim() === "") end--;
                const lines = rawLines.slice(start, end + 1);
                return lines[cursor.preLineIndex] ?? "";
            }
        ]
    }),

    new SRRendererRule({
        roles: [],
        elems: ["BODY"],
        modes: ["item", "tab_focus"],
        tests: [
            (cursor: SRCursor) => {
                // Suppress [Start/End of document] for iframe subdocument bodies.
                // When the inner body is entered from an <iframe>, diffContainers emits
                // the ["name", frame] container-enter announcement instead. Suppressing
                // the document title announcements here avoids double-announcements.
                const body = cursor.getNode() as HTMLElement;
                if (body.ownerDocument !== document) return "";
                const titleStr = cursor.getNode().ownerDocument.title;
                return cursor.isEndTag() ? `[End of document${titleStr.trim().length > 0 ? ": " + titleStr.trim() : ""}]` : `[Start of document${titleStr.trim().length > 0 ? ": " + titleStr.trim() : ""}]`
            }
        ]
    }),

    // Inline frame (<iframe>) — tab_focus mode: announces the frame as a tab stop.
    // A titled iframe announces its accessible name; an untitled one announces just "frame".
    // (The item-mode announcement is handled by diffContainers emitting the container_enter
    // IFRAME rule when crossing into the subdocument — no separate SR_RULE needed for item mode.)
    // When role="none" or role="presentation" is set, screen readers treat the frame as a
    // generic grouping — announce "grouping" instead of "frame".
    new SRRendererRule({
        roles: [],
        elems: ["IFRAME"],
        modes: ["tab_focus"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.isEndTag()) return null;
                const role = (cursor.getElement() as HTMLElement).getAttribute("role");
                const label = (role === "none" || role === "presentation") ? "grouping" : "frame";
                return `[${quoteNamePadAfter(cursor)}${label}]`;
            }
        ]
    }),

    new SRRendererRule({
        roles: [],
        elems: ["BR"],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                try {
                    let walk = cursor.clone();
                    // Walk until we hit the beginning of the page, find another BR, or find something with a name
                    while (walk.previous(() => true) && walk.getNode().nodeName.toUpperCase() !== "BR" && walk.getNameInfo() && walk.getNameInfo().name.trim().length === 0);
                    return walk.getNode().nodeName.toUpperCase() === "BR" ? "[blank]" : null;
                } catch (err) {
                    console.error(err);
                }
            }
        ]
    }),

    new SRRendererRule({
        roles: [],
        elems: ["DL"],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => ""
        ]
    }),

    new SRRendererRule({
        roles: [],
        elems: ["INPUT"],
        modes: ["item", "tab_focus"],
        tests: [
            (cursor: SRCursor, _oldCursor?: SRCursor, mode?: string) => (cursor.isStartTag() && cursor.getElement()?.getAttribute("type") === "password" && `[${quoteNamePadAfter(cursor)}edit, protected${getDescribedByAnnouncements(cursor.getElement(), mode)}]`) || null,
            (cursor: SRCursor, _oldCursor?: SRCursor, mode?: string) => {
                if (cursor.isStartTag() && cursor.getElement()?.getAttribute("type") === "file") {
                    let value = (cursor.getElement() as HTMLInputElement)?.value || "";
                    value = value === "" ? "No file chosen" : value.substring("C:\\fakepath\\".length);
                    return `[${quoteNamePadAfter(cursor)}button${getDescribedByAnnouncements(cursor.getElement(), mode)}] [${quoteNamePadAfter(cursor)}${value}]`;
                }
                return null;
            },
            (cursor: SRCursor, _oldCursor?: SRCursor, mode?: string) => {
                if (cursor.isStartTag() && cursor.getElement()?.getAttribute("type") === "color") {
                    const val = (cursor.getElement() as HTMLInputElement).value;
                    const r = (Number(`0x${val.substring(1, 3)}`) * 100.0 / Number("0xff")).toFixed(0);
                    const g = (Number(`0x${val.substring(3, 5)}`) * 100.0 / Number("0xff")).toFixed(0);
                    const b = (Number(`0x${val.substring(5)}`) * 100.0 / Number("0xff")).toFixed(0);
                    return `[${quoteNamePadAfter(cursor)}clickable${getDescribedByAnnouncements(cursor.getElement(), mode)}] [${r}% red ${g}% green ${b}% blue]`;
                }
                return null;
            },
            (cursor: SRCursor, _oldCursor?: SRCursor, mode?: string) => {
                if (cursor.isStartTag() && cursor.getElement()?.getAttribute("type") === "month") {
                    const val = (cursor.getElement() as HTMLInputElement).value;
                    let y = "0";
                    let m = "0";
                    if (val.trim().length > 0) {
                        let date = new Date(val);
                        y = "" + date.getFullYear();
                        m = "" + (date.getMonth() + 1);
                    }
                    return `[${quoteNamePadAfter(cursor)}clickable${getDescribedByAnnouncements(cursor.getElement(), mode)}] [spin button, ${m}] [spin button, ${y}] [menu button] [subMenu] Show month picker`;
                }
                return null;
            },
            (cursor: SRCursor, _oldCursor?: SRCursor, mode?: string) => {
                if (cursor.isStartTag() && cursor.getElement()?.getAttribute("type") === "date") {
                    const val = (cursor.getElement() as HTMLInputElement).value;
                    let y = "0";
                    let m = "0";
                    let day = "0";
                    if (val.trim().length > 0) {
                        let date = new Date(val);
                        y = "" + date.getFullYear();
                        m = "" + (date.getMonth() + 1);
                        day = "" + (date.getDate());
                    }
                    return `[${quoteNamePadAfter(cursor)}clickable${getDescribedByAnnouncements(cursor.getElement(), mode)}] [spin button, ${m}] / [spin button, ${day}] / [spin button, ${y}] [menu button] [subMenu] Show date picker`;
                }
                return null;
            },
            (cursor: SRCursor, _oldCursor?: SRCursor, mode?: string) => {
                if (cursor.isStartTag() && cursor.getElement()?.getAttribute("type") === "datetime-local") {
                    const val = (cursor.getElement() as HTMLInputElement).value; // 2025-09-12T04:20
                    let y = "0";
                    let m = "0";
                    let day = "0";
                    let hour = "0";
                    let min = "0";
                    let ampm = "0";
                    if (val.trim().length > 0) {
                        let date = new Date(val);
                        y = "" + date.getFullYear();
                        m = "" + (date.getMonth() + 1);
                        day = "" + (date.getDate());
                        if (date.getHours() === 0 || date.getHours() === 12) {
                            hour = "12";
                        } else if (date.getHours() < 12) {
                            hour = "" + date.getHours();
                        } else {
                            hour = "" + (date.getHours() - 12);
                        }
                        min = "" + date.getMinutes();
                        ampm = date.getHours() >= 12 ? "pm" : "am";
                    }
                    return `[${quoteNamePadAfter(cursor)}clickable${getDescribedByAnnouncements(cursor.getElement(), mode)}] [spin button, ${m}] / [spin button, ${day}] / [spin button, ${y}] [spin button, ${hour}] : [spin button, ${min}] [spin button, ${ampm}]  [menu button] [subMenu] Show local date and time picker`;
                }
                return null;
            },
            (cursor: SRCursor, _oldCursor?: SRCursor, mode?: string) => {
                if (cursor.isStartTag() && cursor.getElement()?.getAttribute("type") === "time") {
                    const val = (cursor.getElement() as HTMLInputElement).value; // 2025-09-12T04:20
                    let hour = "0";
                    let min = "0";
                    let ampm = "0";
                    if (val.trim().length > 0) {
                        let date = val.split(":");
                        let hours = parseInt(date[0]);
                        if (hours === 0 || hours === 12) {
                            hour = "12";
                        } else if (hours < 12) {
                            hour = "" + hours;
                        } else {
                            hour = "" + (hours - 12);
                        }
                        min = date[1];
                        ampm = hours >= 12 ? "pm" : "am";
                    }
                    return `[${quoteNamePadAfter(cursor)}grouping clickable${getDescribedByAnnouncements(cursor.getElement(), mode)} [spin button, ${hour}] : [spin button, ${min}] [spin button, ${ampm}] [menu button] [subMenu] Show time picker [out of grouping]`;
                }
                return null;
            },
            (cursor: SRCursor, _oldCursor?: SRCursor, mode?: string) => {
                if (cursor.isStartTag() && cursor.getElement()?.getAttribute("type") === "week") {
                    const val = (cursor.getElement() as HTMLInputElement).value; // 2025-W38
                    let year = "0";
                    let week = "0";
                    if (val.trim().length > 0) {
                        let date = val.split(/-W/);
                        year = date[0];
                        week = date[1];
                    }
                    return `[${quoteNamePadAfter(cursor)}clickable${getDescribedByAnnouncements(cursor.getElement(), mode)}] [spin button, ${week}], [spin button, ${year}] [menu button] [subMenu] Show week picker`;
                }
                return null;
            },
            (cursor: SRCursor) => cursor.getElement()?.getAttribute("type") === "hidden" ? "" : null,
            (cursor: SRCursor) => (cursor.isStartTag() && `!![${quoteNamePadAfter(cursor)}input!!]${cursor.getElement().outerHTML}`) || null
        ]
    }),

    new SRRendererRule({
        roles: [],
        elems: ["LI"],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                // Check if listitem contains interactive elements
                // Screen readers don't read the accessible name when interactive elements are present
                const hasInteractiveContent = listitemContainsInteractiveElement(cursor);
                const nameToUse = hasInteractiveContent ? "" : (cursor.getNameInfo()?.name || "");
                
                const elem = cursor.getElement();
                if (window.getComputedStyle(elem).listStyleType === "none") {
                    return cursor.isStartTag() ? `${nameToUse}` : "";
                } else {
                    return cursor.isStartTag() ? `[bullet] ${nameToUse}` : "";
                }
            }
        ]
    }),

    // MathML elements
    new SRRendererRule({
        roles: [],
        elems: ["MFRAC"],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => cursor.isStartTag() ? `[fraction]` : `[end fraction]`
        ]
    }),

    new SRRendererRule({
        roles: [],
        elems: ["MROW"],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                // Only announce over on the end tag
                if (cursor.isStartTag()) return undefined;
                let fraction = cursor.getCurrentOrParentByRoleClone([], ["mfrac"]);
                if (fraction && fraction.getElement().querySelectorAll("mrow")[0]?.isSameNode(cursor.getNode())) {
                    return "[over]";
                }
            }
        ]
    }),

    new SRRendererRule({
        roles: [],
        elems: ["MSQRT"],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => cursor.isStartTag() ? `[square root]` : `[end root]`
        ]
    }),

    new SRRendererRule({
        roles: [],
        elems: ["MSUP"],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.isEndTag()) return undefined;
                const mi = cursor.getElement().querySelector("mi")?.innerHTML || "";
                const mn = cursor.getElement().querySelector("mn")?.innerHTML || "";
                if (mn === "2") return `${mi} [squared]`;
                if (mn === "3") return `${mi} [cubed]`;
                return `${mi} [to the ${mn}]`;
            }
        ]
    }),

    // Summary element — the disclosure button for a <details> widget.
    // <summary> has implicitRole: null in ARIADefinitions so no role-based
    // button rule fires.  We add an explicit element rule that announces it as
    // a button with the collapsed / expanded state from the parent <details>.
    new SRRendererRule({
        roles: [],
        elems: ["SUMMARY"],
        modes: ["item", "button", "tab_focus"],
        tests: [
            (cursor: SRCursor, _oldCursor?: SRCursor, mode?: string) => {
                if (cursor.isEndTag()) return "";
                const summaryElem = cursor.getElement();
                if (!summaryElem) return null;
                // Only the first <summary> that is a direct child of <details>
                // acts as the disclosure button.
                const detailsParent = summaryElem.parentElement;
                if (!detailsParent || detailsParent.nodeName.toUpperCase() !== "DETAILS") return null;
                const firstSummary = Array.from(detailsParent.children).find(
                    c => c.nodeName.toUpperCase() === "SUMMARY"
                );
                if (!firstSummary || !firstSummary.isSameNode(summaryElem)) return null;
                const stateStr = detailsParent.hasAttribute("open") ? "expanded" : "collapsed";
                // <summary> has implicitRole: null so AccNameUtil may not compute a name;
                // read aria-label first, then fall back to visible text content.
                const ariaLabel = summaryElem.getAttribute("aria-label")?.trim();
                const textContent = summaryElem.textContent?.trim() || "";
                const label = ariaLabel || textContent;
                const labelStr = label ? `"${label}", ` : "";
                // Description: prefer explicit aria-describedby; when aria-label is the
                // name source, the subtree text becomes the description (accname-1.2 §4.3).
                let descStr = getDescribedByAnnouncements(summaryElem, mode);
                if (!descStr && ariaLabel && textContent) {
                    descStr = mode === "item" ? `, \u0001${textContent}\u0002` : `, "${textContent}"`;
                }
                return `[${labelStr}button, ${stateStr}${descStr}]`;
            }
        ]
    }),

    // Multiple roles rules - placed at the bottom
    
    // Default mode rules - Container elements (multiple roles)
    new SRRendererRule({
        roles: ["article", "banner", "blockquote", "caption", "cell", "code", "columnheader",
            "complementary", "contentinfo", "figure", "form", "group", "list", "main",
            "mark", "navigation", "region", "row", "rowheader", "search", "table", "toolbar"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => ""
        ]
    }),

    // Default mode rules - Elements that screen readers typically ignore (multiple roles)
    new SRRendererRule({
        roles: ["paragraph", "rowgroup", "status", "strong", "subscript", "superscript",
            "term", "time", "none", "presentation"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => ""
        ]
    }),
]
