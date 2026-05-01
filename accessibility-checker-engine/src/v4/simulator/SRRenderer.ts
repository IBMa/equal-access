import { AriaUtil } from "../util/AriaUtil";
import { SRNavigator } from "./SRNavigator";
import { ContainerChanges, NavigationMode, RenderResult } from "./SRTypes";
import { SRCursor } from "./SRCursor";
import { SR_RULES, CONTAINER_ENTER_RULES, CONTAINER_EXIT_RULES } from "./render_rules";
import { getLinkAnnouncement } from "./render_rules/common";

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
        const DEBUG = false;//mode === "tab_focus" && document.getElementById("fixture")?.getAttribute("class") === "tomtest";
        let startOfRender = SRNavigator.jumpCurrent(mode, walker);
        if (!startOfRender) return null;

        let endOfRenders = SRNavigator.jumpCurrentEnd(mode, startOfRender);
        if (!endOfRenders || endOfRenders.length === 0) {
            endOfRenders = [null];
        }
        DEBUG && console.log("AAAA", startOfRender.isStartTag(), startOfRender.getNode());
        DEBUG && console.log("BBBB", endOfRenders.map(val => val && val.isStartTag()), endOfRenders.map(val => val && val.getNode()));

        let endOfRender = endOfRenders[endOfRenders.length - 1];
        let renderStr = "";
        for (let candidateEnd of endOfRenders) {
            let candidateRenderStr = SRRenderer.renderRange(mode, startOfRender, candidateEnd);
            if (candidateRenderStr.trim().length > 0) {
                endOfRender = candidateEnd;
                renderStr = candidateRenderStr;
                break;
            }
        }
        if (renderStr === "") {
            renderStr = SRRenderer.renderRange(mode, startOfRender, endOfRender);
        }
        DEBUG && console.log("CCCC", renderStr);
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
        let iterWalker = startOfRender.clone();
        let elemStrs: string[] = [];
        let bContinue = true;
        let currentLink: Node = null;
        while (bContinue) {
            const elem = iterWalker.getElement();
            const node = iterWalker.getNode();
            const nodeType = node.nodeType;
            let renderStrs: string[] = [];
            let linkParent = AriaUtil.getAncestorWithRole(node, "link", true);
            if (linkParent && !["content", "text"].includes(new SRCursor(linkParent).getNameInfo()?.nameFrom)) {
                // We don't consider links that announce themselves
                linkParent = null;
            }
            for (const rule of SR_RULES) {
                let s = rule.test(mode, iterWalker);
                if (typeof s !== "undefined" && s !== null && s.trim().length > 0) {
                    if (nodeType === 1 && !iterWalker.isEndTag() && elem.getAttribute("aria-haspopup") === "menu") {
                        s = "[subMenu] "+s;
                    }
                    // Handle links
                    if (mode === "tab_focus") {
                        // We're in link mode
                        if (currentLink && (!linkParent || (linkParent && currentLink !== linkParent))) {
                            // We've added a string within a link (currentLink), but now we've left the link or moved to a new link
                            s = `${s} ${getLinkAnnouncement(new SRCursor(currentLink, false))}`;
                        }
                    } else {
                        if (linkParent && (!currentLink || (currentLink !== linkParent))) {
                            // We're in a link, and we haven't announced this link, or we've moved to a new link
                            s = `${getLinkAnnouncement(new SRCursor(linkParent, false))} ${s}`;
                        } 

                    }
                    if (s !== "") {
                        currentLink = linkParent;
                        elemStrs.push(s);
                    }
                    break;
                }
            }
            elemStrs.push(renderStrs.filter(s => s.trim().length > 0).join(" "))
            bContinue = iterWalker.next(() => true, SRNavigator.getSkipFunc(mode)) && SRCursor.compare(iterWalker, endOfRender) < 0;
        }
        if (mode === "tab_focus" && currentLink) {
            elemStrs.push(`${getLinkAnnouncement(new SRCursor(currentLink, false))}`);
        }
        let retVal = elemStrs.filter(s => s.trim().length > 0).join(" ");
        retVal = retVal.replace(/, \u0001([^\u0002]+)\u0002/g, (match, describedByText) => {
            const quotedText = `"${describedByText}"`;
            const unmarkedRetVal = retVal.replace(match, "");
            return unmarkedRetVal.includes(quotedText) || unmarkedRetVal.includes(describedByText) ? "" : `, ${quotedText}`;
        });
        retVal = retVal.replace(/[\u0001\u0002]/g, "");
        return retVal;
    }

}

