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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass } from "../../../api/IEngine";
import { RPTUtil } from "../../accessibility/util/legacy";

let designRulesType: Rule[] = [{
    id: "DESIGN_Typography_Plex",
    context: "dom:*",
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        let inBody = false;
        let parentWalk = ruleContext;
        while (parentWalk) {
            if (parentWalk.nodeName.toLowerCase() === "style" || parentWalk.nodeName.toLowerCase() === "script") {
                inBody = false;
                break;
            }
            if (parentWalk.nodeName.toLowerCase() === "body") {
                inBody = true;
            }
            parentWalk = parentWalk.parentElement;
        }
        let hasText = false;
        let child : Node = ruleContext.firstChild;
        while (child) {
            if (child.nodeType === 3 && child.nodeValue.trim().length > 0) {
                hasText = true;
            }
            child = child.nextSibling;
        }
        if (!inBody || !hasText) {
            return null;
        }
        let doc = ruleContext.ownerDocument;
        let style = doc.defaultView.getComputedStyle(ruleContext);
        let fontFamily = style.fontFamily;
        if (fontFamily.substring(0, "\"IBM Plex".length) === "\"IBM Plex") {
            return RulePass(1,[fontFamily]);
        } else {
            return RuleFail(2, [fontFamily]);
        }
    }
},
{
    id: "DESIGN_Typography_TextAlignLeft",
    context: "dom:*",
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        let inBody = false;
        let parentWalk = ruleContext;
        while (parentWalk) {
            if (parentWalk.nodeName.toLowerCase() === "body") {
                inBody = true;
            }
            parentWalk = parentWalk.parentElement;
        }
        let hasText = (ruleContext.innerText || "").trim().length > 0;
        if (!inBody || !hasText) {
            return null;
        }
        let doc = ruleContext.ownerDocument;
        let style = doc.defaultView.getComputedStyle(ruleContext);
        let textAlign = style.textAlign;
        if (!textAlign || textAlign === "left" || textAlign === "start") {
            return RulePass(1);
        } else {
            return RuleFail(2);
        }
    }
}]
export { designRulesType }
