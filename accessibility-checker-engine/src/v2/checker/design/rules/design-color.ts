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
import { DOMUtil } from "../../../dom/DOMUtil";
import { RPTUtil } from "../../accessibility/util/legacy";

const PALETTE = [
    "#2c080a", "#4f0408", "#750e13", "#a51920", "#da1e28", "#fb4b53", "#ff767c", "#ffa4a9", "#fcd0d3", "#fff0f1", "#2a0a16", "#4f0027", "#760a3a", "#a11950", "#d12765", "#ee538b", "#fa75a6", "#ffa0c2", "#ffcfe1", "#fff0f6", "#1e1033", "#321260", "#4f2196", "#6e32c9", "#8a3ffc", "#a970ff", "#bb8eff", "#d0b0ff", "#e6d6ff", "#f7f1ff", "#051243", "#051b75", "#0530ad", "#054ada", "#0062ff", "#418cff", "#6ea6ff", "#97c1ff", "#c9deff", "#edf4ff", "#07192b", "#002749", "#003d73", "#0058a1", "#0072c3", "#1193e8", "#30b0ff", "#6ccaff", "#b3e6ff", "#e3f6ff", "#081a1c", "#002b30", "#004548", "#006161", "#007d79", "#009e9a", "#00bab6", "#20d5d2", "#87eded", "#dbfbfb", "#081b09", "#012e0e", "#054719", "#10642a", "#198038", "#24a249", "#3dbb61", "#56d679", "#9deeb2", "#dafbe4", "#000000", "#13171a", "#202529", "#373d42", "#50565b", "#697077", "#868d95", "#9fa5ad", "#b9bfc7", "#d8dce3", "#f2f4f8", "#ffffff", "#000000", "#171717", "#252525", "#3d3d3d", "#565656", "#6f6f6f", "#8c8c8c", "#a4a4a4", "#bebebe", "#dcdcdc", "#f3f3f3", "#ffffff", "#000000", "#1a1717", "#272424", "#403c3c", "#595555", "#726e6e", "#8f8b8b", "#a7a2a2", "#c1bcbb", "#e0dbda", "#f7f3f1", "#ffffff"
]

let designRulesColor: Rule[] = [{
    id: "DESIGN_COLOR_Palette_Foreground",
    context: "dom:*",
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        let hasText = false;
        let child: Node = ruleContext.firstChild;
        while (child) {
            if (child.nodeType === 3 && child.nodeValue.trim().length > 0) {
                hasText = true;
            }
            child = child.nextSibling;
        }
        let inBody = false;
        let parentWalk : Element = ruleContext;
        while (parentWalk) {
            if (parentWalk.nodeName.toLowerCase() === "body") {
                inBody = true;
            }
            parentWalk = DOMUtil.parentElement(parentWalk);
        }
        if (!hasText || !inBody) {
            return null;
        }
        let colorCombo = RPTUtil.ColorCombo(ruleContext);
        let fg = colorCombo.fg.toHex();
        if (PALETTE.indexOf(fg) !== -1) {
            return RulePass(1,[fg]);
        } else {
            return RuleFail(2, [fg]);
        }
    }
},
{
    /**
     * Description: Trigger if the link text is empty or content under link is hidden
     * Origin: WCAG 2.0 Technique H30, H91
     */
    id: "DESIGN_COLOR_Palette_Background",
    context: "dom:*",
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        let parentWalk = DOMUtil.parentElement(ruleContext);
        while (parentWalk) {
            if (RPTUtil.getCache(parentWalk, "DESIGN_COLOR_Palette_Background", null)) {
                return null;
            }
            parentWalk = DOMUtil.parentElement(parentWalk);
        }
        let colorCombo = RPTUtil.ColorCombo(ruleContext);
        let bg = colorCombo.bg.toHex();
        if (PALETTE.indexOf(bg) !== -1) {
            return RulePass(1,[bg])
        } else {
            RPTUtil.setCache(ruleContext, "DESIGN_COLOR_Palette_Background", true);
            return RuleFail(2, [bg]);
        }
    }
}
]
export { designRulesColor }