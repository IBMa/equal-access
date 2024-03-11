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
import { NodeWalker, RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { DOMWalker } from "../../v2/dom/DOMWalker";
import { getDefinedStyles, getComputedStyle, getPixelsFromStyle } from "../util/CSSUtil";
import { VisUtil } from "../../v2/dom/VisUtil";

export let text_block_heading: Rule = {
    id: "text_block_heading",
    context: "dom:p, dom:div, dom:br",
    refactor: {
        "RPT_Block_ShouldBeHeading": {
            "Pass_0": "pass",
            "Potential_1": "potential_heading"}
    },
    help: {
        "en-US": {
            "pass": "text_block_heading.html",
            "potential_heading": "text_block_heading.html",
            "group": "text_block_heading.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "Heading text uses a heading element or role",
            "potential_heading": "Confirm this text {0} is used as a heading and if so, modify to use a heading element or role”",
            "group": "Heading text should use a heading element or role"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.3.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        //skip the check if the element is hidden or disabled
        if (RPTUtil.isNodeDisabled(ruleContext) || !VisUtil.isNodeVisible(ruleContext))
            return null;

        // Don't trigger if we're not in the body or if we're in a script
        if (RPTUtil.getAncestor(ruleContext, ["body"]) === null || RPTUtil.getAncestor(ruleContext, ["script"]) !== null) 
            return null;

        const validateParams = {
            numWords: {
                value: 10,
                type: "integer"
            }
        }

        let bodyStyle = null;
        let body = ruleContext.ownerDocument.getElementsByTagName("body");
        if (body != null) 
            bodyStyle = getComputedStyle(body[0]);

        let numWords = validateParams.numWords.value;
        let wordsSeen = 0;
        let wordStr: string[] = [];
        let emphasizedText = false;
        let nw = new NodeWalker(ruleContext);

        let passed = false;
        while (!passed &&
            nw.nextNode() &&
            nw.node !== ruleContext &&
            nw.node !== DOMWalker.parentNode(ruleContext) &&
            !["br", "div", "p"].includes(nw.node.nodeName.toLowerCase())) // Don't report twice
        {
            let nwName = nw.node.nodeName.toLowerCase();
            if (nw.node.nodeType !== 1 ) continue;
            let style = getDefinedStyles(nw.node as HTMLElement);
            if ((nwName === "b" || nwName === "strong" || nwName === "u" || nwName === "font"
                || style['font-weight'] === 'bold' || style['font-weight'] >= 700
                ||  (style['font-size'] && style['font-size'].includes("large")) 
                || (style['font-size'] && bodyStyle['font-size'] && getPixelsFromStyle(style['font-size'],nw.node)  > bodyStyle['font-size'])) 
                && !RPTUtil.shouldNodeBeSkippedHidden(nw.node)) {
                let nextStr = RPTUtil.getInnerText(nw.node);
                let wc = RPTUtil.wordCount(nextStr);
                if (wc > 0) {
                    wordStr.push(nextStr);
                    emphasizedText = true;
                    wordsSeen += wc;
                }
                passed = wordsSeen > numWords;
                // Skip this node because it's emphasized
                nw.bEndTag = true;
            } else {
                let role = RPTUtil.getResolvedRole(nw.node as HTMLElement);
                // ignore the text that is not emphasized
                // ignore the element which has a role except 'generic', 'paragraph' or 'strong'
                // ignore applet element that is deprecated anyway
                passed = (nwName === "#text" && nw.node.nodeValue.trim().length > 0) || 
                      (role !== null && role !== 'generic' && role !== 'paragraph' && role !== 'strong') || nwName === "applet";
            }
        }
        if (wordsSeen == 0) passed = true;

        if (passed) {
            return null;
        } else {
            return RulePotential("potential_heading", [wordStr.join(" ")]);
        }
    }
}