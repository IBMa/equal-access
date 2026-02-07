import { AriaUtil } from "../util/AriaUtil";
import { SRController } from "./SRController";
import { SRNavigator } from "./SRNavigator";
import { ContainerChanges, NavigationMode, RenderResult } from "./SRTypes";
import { SRCursor } from "./SRCursor";
import { SR_RULES, CONTAINER_ENTER_RULES, CONTAINER_EXIT_RULES } from "./render_rules";

/**
 * SRRenderer namespace provides functionality for simulating how screen readers
 * announce content to users. It contains rules for rendering different types of
 * elements and ARIA roles in various navigation modes.
 *
 * The renderer uses a rule-based system to determine what text should be announced
 * when navigating to, within, or away from elements based on their roles and properties.
 */
export namespace SRRenderer {
    /**
     * Generates the announcement text when entering an element
     *
     * This function looks up the appropriate rule based on the element's role or tag name
     * and applies it to generate the announcement text.
     *
     * @param mode - The current navigation mode
     * @param walker - Cursor at the current position
     * @param oldWalker - Optional cursor at the previous position
     * @returns Announcement text for entering the element, or null if no rule applies
     */
    export function renderEnter(mode: NavigationMode | "focus", walker: SRCursor, oldWalker?: SRCursor): string | null {        
        const DEBUG = false;
        for (const rule of CONTAINER_ENTER_RULES) {
            let s = rule.test(mode, walker, oldWalker);
            DEBUG && console.log(mode, walker, rule, s);
            if (typeof s !== "undefined" && s !== null) {
                return s;
            }
        }
        return null;
    }

    /**
     * Generates the announcement text when leaving an element
     *
     * Similar to renderEnter, but applies rules for leaving elements instead.
     *
     * @param mode - The current navigation mode
     * @param walker - Cursor at the current position
     * @param oldWalker - Optional cursor at the previous position
     * @returns Announcement text for leaving the element, or null if no rule applies
     */
    export function renderLeave(mode: NavigationMode, walker: SRCursor, oldWalker?: SRCursor): string | null  {
        for (const rule of CONTAINER_EXIT_RULES) {
            let s = rule.test(mode, walker, oldWalker);
            if (typeof s !== "undefined" && s !== null) {
                return s;
            }
        }
        return null;
    }

    /**
     * Renders the current element and any container changes
     *
     * This function combines announcements for:
     * - Containers being left
     * - Containers being entered
     * - The current element itself
     *
     * @param mode - The current navigation mode
     * @param walker - Cursor at the current position
     * @param containerChanges - Information about containers being entered or left
     * @returns Combined announcement text
     */
    export function renderCurrent(mode: NavigationMode, walker: SRCursor, containerChanges: ContainerChanges): RenderResult | null {
        let startOfRender = SRNavigator.jumpCurrent(mode, walker);
        if (!startOfRender) return null;
        let endOfRender = SRNavigator.jumpCurrentEnd(mode, startOfRender);
        let renderStr = SRRenderer.renderRange(mode, startOfRender, endOfRender);
        return {
            start: startOfRender,
            end: endOfRender,
            message: (containerChanges.leaving || []).concat(containerChanges.entering || []).concat([renderStr]).join(" ").replace(/\s+/g, " ")
        }
    }

    /**
     * Renders a range of elements between two cursors
     *
     * This function traverses the DOM from startOfRender to endOfRender,
     * applying rendering rules to each element and combining the results.
     *
     * @param mode - The current navigation mode
     * @param startOfRender - Cursor at the start of the range
     * @param endOfRender - Cursor at the end of the range
     * @returns Combined announcement text for the entire range
     */
    export function renderRange(mode: NavigationMode, startOfRender: SRCursor, endOfRender: SRCursor) : string {
        let lastIterWalker = null;
        let iterWalker = startOfRender.clone();
        let renderStrs = [];
        let bContinue = true;
        while (bContinue) {
            const elem = iterWalker.getElement();
            const node = iterWalker.getNode();
            const nodeType = node.nodeType;
            if (lastIterWalker) {
                const DEBUG = false;
                DEBUG && console.log(mode);
                const containerChanges = SRController.diffContainers(mode, iterWalker, lastIterWalker);
                renderStrs = renderStrs.concat(containerChanges.leaving.filter(s => s.trim().length > 0));
                renderStrs = renderStrs.concat(containerChanges.entering.filter(s => s.trim().length > 0));
            }
            lastIterWalker = iterWalker.clone();
            for (const rule of SR_RULES) {
                let s = rule.test(mode, iterWalker);
                if (typeof s !== "undefined" && s !== null) {
                    if (nodeType === 1 && elem.getAttribute("aria-haspopup") === "menu") {
                        s += "[subMenu] "+s;
                    }
                    if (s.trim().length > 0 && iterWalker.isStartTag() && !s.includes("[link") && nodeType === 1 && AriaUtil.getAncestorWithRole(elem, "link", true)) {
                        if (mode === "item") {
                            s = "[link] "+s;
                        } else {
                            s = s + " [link]";
                        }
                    }
                    if (s !== "") {
                        renderStrs.push(s);
                    }
                    break;
                }
            }
            bContinue = iterWalker.next(() => true, SRNavigator.getSkipFunc(mode)) && SRCursor.compare(iterWalker, endOfRender) < 0;
        }
        let retVal = renderStrs.filter(s => s.trim().length > 0).join(" ");
        retVal = retVal.replace(/\[link\]( \[link\])+/g, "[link]");
        if (retVal === "[link]") return "";
        return retVal;
    }

}

