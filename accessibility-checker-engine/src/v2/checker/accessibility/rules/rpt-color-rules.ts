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
import { RPTUtil, RPTUtilStyle, NodeWalker } from "../util/legacy";

let a11yRulesColor: Rule[] = [
    {
        "id": "IBMA_Color_Contrast_WCAG2AA",
        "context": "dom:*",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as HTMLElement;
            let nodeName = ruleContext.nodeName.toLowerCase();
            // avoid diagnosing elements that are not visible
            if (!RPTUtil.isNodeVisible(ruleContext) ||
                (RPTUtil.hiddenByDefaultElements != null &&
                    RPTUtil.hiddenByDefaultElements != undefined &&
                    RPTUtil.hiddenByDefaultElements.indexOf(nodeName) > -1)) {
                return null;
            }

            // Ensure that this element has children with actual text.
            let childStr = "";
            let childNodes = ruleContext.childNodes;
            for (let i = 0; i < childNodes.length; ++i) {
                if (childNodes[i].nodeType == 3) {
                    childStr += childNodes[i].nodeValue;
                }
            }
            if (childStr.trim().length == 0)
                return null;

            let doc = ruleContext.ownerDocument;
            if (!doc) {
                return null;
            }
            let win = doc.defaultView;
            if (!win) {
                return null;
            }
            let style = win.getComputedStyle(ruleContext);

            // First determine the color contrast ratio
            let colorCombo = RPTUtil.ColorCombo(ruleContext);
            let fg = colorCombo.fg;
            let bg = colorCombo.bg;
            let ratio = fg.contrastRatio(bg);
            let weight = RPTUtilStyle.getWeightNumber(style.fontWeight);
            let size = RPTUtilStyle.getFontInPixels(style.fontSize);
            let isLargeScale = size >= 24 || size >= 18.6 && weight >= 700;
            let passed = ratio >= 4.5 || (ratio >= 3 && isLargeScale);
            let hasBackground = colorCombo.hasBGImage || colorCombo.hasGradient;

            let isDisabled = RPTUtil.isNodeDisabled(ruleContext);
            if (!isDisabled) {
                let control = RPTUtil.getControlOfLabel(ruleContext);
                if (control) {
                    isDisabled = RPTUtil.isNodeDisabled(control);
                }
            }
            RPTUtil.setCache(ruleContext, "EXT_Color_Contrast_WCAG2AA", {
                "ratio": ratio,
                "isLargeScale": isLargeScale,
                "weight": weight,
                "size": size,
                "hasBackground": hasBackground,
                "isDisabled": isDisabled
            });
            if (hasBackground) {
                // Allow other color rule to fire if we have a background
                return null;
            }

            // If element or parent is disabled, this rule does not apply (but may be 3:1 in future)
            if (!passed && isDisabled) {
                passed = true;
            }

            //return new ValidationResult(passed, [ruleContext], '', '', [ratio.toFixed(2), size, weight, fg.toHex(), bg.toHex(), colorCombo.hasBGImage, colorCombo.hasGradient]);
            if (!passed) {
                if (fg.toHex() === bg.toHex()) {
                    return RulePotential("Potential_1", [ratio.toFixed(2), size, weight, fg.toHex(), bg.toHex(), colorCombo.hasBGImage, colorCombo.hasGradient]);
                } else {
                    return RuleFail("Fail_1", [ratio.toFixed(2), size, weight, fg.toHex(), bg.toHex(), colorCombo.hasBGImage, colorCombo.hasGradient]);
                }
            } else {
                return RulePass("Pass_0",[ratio.toFixed(2), size, weight, fg.toHex(), bg.toHex(), colorCombo.hasBGImage, colorCombo.hasGradient]);
            }
        }
    },
    {
        "id": "IBMA_Color_Contrast_WCAG2AA_PV",
        "context": "dom:*",
        "dependencies": ["IBMA_Color_Contrast_WCAG2AA"],
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let nodeName = ruleContext.nodeName.toLowerCase();
            // avoid diagnosing disabled nodes or those that are not visible.
            if (RPTUtil.isNodeDisabled(ruleContext) ||
                !RPTUtil.isNodeVisible(ruleContext) ||
                (RPTUtil.hiddenByDefaultElements != null &&
                    RPTUtil.hiddenByDefaultElements != undefined &&
                    RPTUtil.hiddenByDefaultElements.indexOf(nodeName) > -1)) {
                return null;
            }
            let precalc = RPTUtil.getCache(ruleContext, "EXT_Color_Contrast_WCAG2AA", null);
            if (!precalc) return RulePass("Pass_0");
            let passed = precalc.ratio >= 4.5 || (precalc.ratio >= 3 && precalc.isLargeScale);

            // If element or parent is disabled, this rule does not apply (but may be 3:1 in future)
            if (!passed && precalc.isDisabled) {
                passed = true;
            }

            if (!passed) {
                return RulePotential("Potential_1", [precalc.ratio.toFixed(2), precalc.size, precalc.weight]);
            } else {
                return RulePass("Pass_0",[precalc.ratio.toFixed(2), precalc.size, precalc.weight]);
            }
        }
    },
    {
        "id": "IBMA_Link_Contrast_WCAG2AA",
        "context": "a[href] | *[onclick]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let thisColorCombo = RPTUtil.ColorCombo(ruleContext as HTMLElement);
            let cache = RPTUtil.getCache(ruleContext, "EXT_Link_Contrast_WCAG2AA", null)
            if (cache === null) {
                cache = {};

                // Ensure that this link has children with actual text.
                let childStr = "";
                let childNodes = ruleContext.childNodes;
                for (let i = 0; i < childNodes.length; ++i) {
                    if (childNodes[i].nodeType == 3) {
                        childStr += childNodes[i].nodeValue;
                    }
                }
                if (childStr.trim().length == 0)
                    return RulePass(1);

                // Define helpers
                let doc = ruleContext.ownerDocument;
                if (!doc) {
                    return RulePass(1);
                }
                let win = doc.defaultView;
                if (!win) {
                    return RulePass(1);
                }

                let isLink = function (node) {
                    return node.nodeType == 1 &&
                        ((node.nodeName.toUpperCase() == "A" && node.hasAttribute("href")) ||
                            node.hasAttribute("onclick"));
                };

                let isItem = function (node) {
                    if (node.nodeType != 1) return false;
                    if (node.nodeName.toUpperCase() == "BR")
                        return true;
                    let compStyle = node.ownerDocument.defaultView.getComputedStyle(node, null);
                    if (!compStyle) return false;
                    return compStyle.display != "inline";
                };

                let thisStyle = win.getComputedStyle(ruleContext);
                let thisWeight = RPTUtilStyle.getWeightNumber(thisStyle.fontWeight);
                let thisSize = RPTUtilStyle.getFontInPixels(thisStyle.fontSize);
                cache.isLargeScale = thisSize >= 24 || thisSize >= 18.6 && thisWeight >= 700;
                let testInfo = function (node) {
                    let style = win.getComputedStyle(node);
                    let weight = RPTUtilStyle.getWeightNumber(style.fontWeight);
                    let size = RPTUtilStyle.getFontInPixels(style.fontSize);

                    let colorComboOther = RPTUtil.ColorCombo(node);
                    let fgRatio = thisColorCombo.fg.contrastRatio(colorComboOther.fg);
                    let bgRatio = thisColorCombo.bg.contrastRatio(colorComboOther.bg);
                    let scaleChange = Math.abs(weight - thisWeight) >= 300
                        || Math.abs(size - thisSize) > 5
                        || style.textDecoration != thisStyle.textDecoration;
                    return {
                        "ratio": Math.max(fgRatio, bgRatio),
                        "fgRatio": fgRatio,
                        "bgRatio": bgRatio,
                        "scaleChange": scaleChange,
                        "colorCombo": colorComboOther
                    };
                };

                // Look for previous text
                let walkPrev = new NodeWalker(ruleContext);
                while (walkPrev.prevNode()) {
                    // If the previous is a link, or a newline, do nothing
                    if (isLink(walkPrev.node) || isItem(walkPrev.node))
                        break;
                    if (walkPrev.node.nodeType == 3 && walkPrev.node.nodeValue.trim().length > 0) {
                        walkPrev.node = walkPrev.node.parentNode;
                        cache.prev = testInfo(walkPrev.node);
                        break;
                    }
                }
                let walkNext = new NodeWalker(ruleContext, true);
                while (walkNext.nextNode()) {
                    // Find next text
                    // If the next is a link, or a newline, do nothing
                    if (isLink(walkNext.node) || isItem(walkNext.node))
                        break;
                    if (walkNext.node.nodeType == 3 && walkNext.node.textContent.trim().length > 0) {
                        walkNext.node = walkNext.node.parentNode;
                        cache.next = testInfo(walkNext.node);
                        break;
                    }
                }
            }
            RPTUtil.setCache(ruleContext, "EXT_Link_Contrast_WCAG2AA", cache);

            let isLargeScale = cache.isLargeScale;
            let passed = true;
            let ratio = 0;
            let otherColor = null;
            let goodRatio = isLargeScale ? 3 : 4.5;
            if (cache.prev) {
                passed = cache.prev.ratio >= goodRatio ||
                cache.prev.scaleChange;
                if (!passed) {
                    ratio = cache.prev.fgRatio;
                    otherColor = cache.prev.colorCombo;
                }
            } else if (cache.next) {
                passed = passed && cache.next.ratio >= goodRatio ||
                cache.next.scaleChange;
                if (!passed) {
                    ratio = cache.next.fgRatio;
                    otherColor = cache.next.colorCombo;
                }
            }
            if (!passed) {
                return RulePotential("Potential_1", [ratio.toFixed(2), thisColorCombo.fg.toHex(), otherColor.fg.toHex()]);
            } else {
                return RulePass("Pass_0");
            }
        }
    }
]

export { a11yRulesColor }