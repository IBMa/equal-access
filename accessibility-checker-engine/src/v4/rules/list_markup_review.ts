/******************************************************************************
  Copyright:: 2022- IBM, Inc
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

import { Rule, RuleResult, RuleContext, RulePotential, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { AriaUtil } from "../util/AriaUtil";
import { CommonUtil } from "../util/CommonUtil";
import { VisUtil } from "../util/VisUtil";

// Matches unordered list item prefixes: •, ◦, ▪, ▸, ►, ✓, ✗, ✦, –, —, *, -, o
const UNORDERED_BULLET_PATTERN = /^[ \t]*[•◦▪▸►✓✗✦\-–—*o][ \t]+\S/;

// Matches ordered list item prefixes: 1. 1) (1) a. a) (a) A. A) i. ii. iii. etc.
const ORDERED_ITEM_PATTERN = /^[ \t]*(?:\(?\d+[.)]\)?|\(?[a-zA-Z][.)]\)?|\(?(?:i{1,3}|iv|vi{0,3}|ix|xi{0,3}|xiv|xv)[.)]\)?)[ \t]+\S/i;

const LIST_ITEM_PATTERN = new RegExp(
    UNORDERED_BULLET_PATTERN.source + "|" + ORDERED_ITEM_PATTERN.source,
    "i"
);

// Block-level elements that act as boundaries between independent content groups
const BLOCK_ELEMENTS = new Set([
    "blockquote", "center", "dir", "div", "form",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "hr", "br", "menu", "p", "pre", "table",
    "section", "article", "aside", "nav", "header", "footer",
    "figure", "figcaption", "details", "summary", "dialog",
    "script", "style", "label",
    "ul", "ol", "dl", "li", "dt", "dd"
]);

// Inline elements whose text content is treated as part of the surrounding text run
const INLINE_ELEMENTS = new Set([
    "a", "abbr", "acronym", "b", "bdo", "big", "br", "button", "cite",
    "code", "dfn", "em", "i", "img", "input", "kbd", "label", "map",
    "object", "output", "q", "samp", "select", "small", "span",
    "strong", "sub", "sup", "textarea", "time", "tt", "u", "var"
]);

// Returns the combined text of a node and its inline descendants, normalised to single spaces
function getShallowText(node: Node): string {
    let text = "";
    node.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
            text += child.nodeValue ?? "";
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            const tag = (child as Element).nodeName.toLowerCase();
            if (INLINE_ELEMENTS.has(tag)) {
                text += getShallowText(child);
            }
        }
    });
    return text.replace(/\s+/g, " ");
}

// Returns trimmed non-empty lines from a node, splitting on newlines and <br> boundaries
function getLinesFromNode(node: Node): string[] {
    const lines: string[] = [];

    function walk(n: Node) {
        if (n.nodeType === Node.TEXT_NODE) {
            (n.nodeValue ?? "").split(/\r?\n/).forEach(p => {
                const trimmed = p.trim();
                if (trimmed.length > 0) lines.push(trimmed);
            });
        } else if (n.nodeType === Node.ELEMENT_NODE) {
            const elem = n as Element;
            const tag = elem.nodeName.toLowerCase();
            if (tag === "br") {
                lines.push("\x00");
                return;
            }
            if (BLOCK_ELEMENTS.has(tag)) return;
            
            // Skip elements with list-related or widget roles
            const role = elem.getAttribute("role");
            if (role) {
                const roles = AriaUtil.getRolesWithTypes(elem, ["widget"]);
                CommonUtil.concatUniqueArrayItemList(
                    ["caption", "code", "columnheader", "figure", "list", "listitem", "math", "meter", "rowheader"],
                    roles
                );
                if (roles.length > 0) return;
            }
            
            n.childNodes.forEach(walk);
        }
    }

    walk(node);
    return lines.filter(l => l !== "\x00");
}

// Returns the maximum number of consecutive list-item-like lines found among
// the direct children of parent, treating <br> and whitespace-only text as separators
function maxConsecutiveListItems(parent: Element): number {
    let maxRun = 0;
    let currentRun = 0;
    let currentLineText = "";  // accumulate text across inline siblings until <br>

    parent.childNodes.forEach((child) => {
        const tag = child.nodeName.toLowerCase();

        if (tag === "br") {
            // test the accumulated line
            const trimmed = currentLineText.trim();
            if (trimmed.length > 0) {
                if (LIST_ITEM_PATTERN.test(trimmed)) {
                    maxRun = Math.max(maxRun, ++currentRun);
                } else {
                    currentRun = 0;
                }
            }
            currentLineText = "";
            return;
        }

        if (child.nodeType === Node.TEXT_NODE) {
            const raw = child.nodeValue ?? "";
            if (raw.trim().length === 0) return;
            // if there are embedded newlines, flush on each
            const segs = raw.split(/\r?\n/);
            segs.forEach((seg, i) => {
                if (i > 0) {
                    const trimmed = currentLineText.trim();
                    if (trimmed.length > 0) {
                        if (LIST_ITEM_PATTERN.test(trimmed)) {
                            maxRun = Math.max(maxRun, ++currentRun);
                        } else {
                            currentRun = 0;
                        }
                    }
                    currentLineText = "";
                }
                currentLineText += seg;
            });
            return;
        }

        if (child.nodeType === Node.ELEMENT_NODE) {
            const elem = child as Element;
            if (BLOCK_ELEMENTS.has(tag)) {
                // flush current line before block boundary
                const trimmed = currentLineText.trim();
                if (trimmed.length > 0 && LIST_ITEM_PATTERN.test(trimmed)) {
                    maxRun = Math.max(maxRun, ++currentRun);
                }
                currentLineText = "";
                currentRun = 0;
                return;
            }
            if (INLINE_ELEMENTS.has(tag)) {
                currentLineText += getShallowText(elem);
            } else {
                currentRun = 0;
                currentLineText = "";
            }
        }
    });

    // flush any remaining line at end of container
    const trimmed = currentLineText.trim();
    if (trimmed.length > 0 && LIST_ITEM_PATTERN.test(trimmed)) {
        maxRun = Math.max(maxRun, ++currentRun);
    }

    return maxRun;
}

// Returns true if 2+ consecutive <br>-separated lines within element match the list-item pattern
function hasBrSeparatedListLines(element: Element): boolean {
    let run = 0;
    for (const line of getLinesFromNode(element)) {
        if (LIST_ITEM_PATTERN.test(line)) {
            if (++run >= 2) return true;
        } else {
            run = 0;
        }
    }
    return false;
}

export const list_markup_review: Rule = {
    id: "list_markup_review",
    context: "dom:*",
    refactor: {
        "RPT_List_UseMarkup": {
            "Potential_1": "Potential_1"
        }
    },
    help: {
        "en-US": {
            "potential_list": "list_markup_review.html",
            "group": "list_markup_review.html"
        }
    },
    messages: {
        "en-US": {
            "potential_list": "Verify this is a list and if so, modify to use proper HTML elements for the list",
            "group": "Proper HTML elements should be used to create a list"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.3.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        const nodeName = ruleContext.nodeName.toLowerCase();

        if (CommonUtil.isNodeDisabled(ruleContext) || VisUtil.hiddenByDefaultElements.includes(nodeName))
            return null;

        if (CommonUtil.getAncestor(ruleContext, ["body"]) === null)
            return null;

        if (CommonUtil.getAncestor(ruleContext, ["script", "style", "label"]) !== null)
            return null;

        // Only check block-level and table-cell elements first —
        // td/th must be checked before the ancestor role check since
        // table/row/cell ARIA roles would otherwise cause an early exit
        if (nodeName === "td" || nodeName === "th") {
            if (maxConsecutiveListItems(ruleContext) >= 2)
                return RulePotential("potential_list");
            if (hasBrSeparatedListLines(ruleContext))
                return RulePotential("potential_list");
            return null;
        }

        // Skip elements that already have semantic list, widget, or structural roles
        const roles = AriaUtil.getRolesWithTypes(ruleContext, ["widget"]);
        CommonUtil.concatUniqueArrayItemList(
            ["caption", "code", "columnheader", "figure", "list", "listitem", "math", "meter", "rowheader"],
            roles
        );
        if (AriaUtil.getAncestorWithRoles(ruleContext, roles) !== null)
            return null;

        // Only check block-level elements to avoid duplicate reports
        if (!BLOCK_ELEMENTS.has(nodeName) && nodeName !== "body" && nodeName !== "li")
            return null;

        if (["ul", "ol", "dl", "menu"].includes(nodeName))
            return null;

        if (maxConsecutiveListItems(ruleContext) >= 2)
            return RulePotential("potential_list");

        if (hasBrSeparatedListLines(ruleContext))
            return RulePotential("potential_list");

        return null;
    }
}