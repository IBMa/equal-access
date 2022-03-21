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

import { RPTUtil, RPTUtilStyle } from "../../../../v2/checker/accessibility/util/legacy";
import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../../../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../../../api/IRule";

export let IBMA_Color_Contrast_WCAG2AA: Rule = {
    id: "IBMA_Color_Contrast_WCAG2AA",
    context: "dom:*",
    help: {
        "en-US": {
            "group": `IBMA_Color_Contrast_WCAG2AA.html`,
            "Pass_0": `IBMA_Color_Contrast_WCAG2AA.html`,
            "Fail_1": `IBMA_Color_Contrast_WCAG2AA.html`,
            "Potential_1": `IBMA_Color_Contrast_WCAG2AA.html`
        }
    },
    messages: {
        "en-US": {
            "group": "The contrast ratio of text with its background must meet WCAG 2.1 AA requirements",
            "Pass_0": "Rule Passed",
            "Fail_1": "Text contrast of {0} with its background is less than the WCAG AA minimum requirements for text of size {1}px and weight of {2}",
            "Potential_1": "The foreground text and its background color are both detected as {3}. Verify the text meets the WCAG 2.1 AA requirements for minimum contrast"
        }
    },
    rulesets: [{
        id: ["IBM_Accessibility", "WCAG_2_0", "WCAG_2_1"],
        num: "1.4.3", // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
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


        // JCH clip INFO:
        //      The clip property lets you specify a rectangle to clip an absolutely positioned element. 
        //      The rectangle specified as four coordinates, all from the top-left corner of the element to be clipped.
        //      Property values:
        //          none        This is default. No clipping is done
        //          auto        No clipping will be done
        //          shape       The only valid value is: rect (top, right, bottom, left)
        //                      e.g., clip: rect(10px, 20px, 30px, 40px);
        //                      Note: the four values are in the same order as margin/padding
        //                      The rect values are positive pixel values, e.g., 10px, etc.
        //          margin-box  Uses the margin box as the reference box
        //          border-box  Uses the border box as the reference box
        //          padding-box Uses the padding box as the reference box
        //          content-box
        //          fill-box
        //          stroke-box
        //      NOTE: the CSS clip property is deprecated
        //      Also: clip only works if the element is absolutely positioned and can only do rectangles
        // check if element visible
        let visible = true;
        if (style.width !== "0" &&
            style.height !== "0" &&
            style.opacity !== "0" &&
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.overflow !== 'hidden' &&
            // left and right work with all absolute units
            (style.left === "auto" || (style.position === 'absolute' && parseInt(style.left.replace(/[^0-9.+-]/, '')) > 0)) &&
            (style.left === "auto" || (style.position === 'absolute' && parseInt(style.top.replace(/[^0-9.+-]/, '')) > 0))) {
            visible = true;
            // console.log("element IS visible");
            // console.log("CHECK COLOR CONTRAST unless to small");
        } else {
            visible = false;
            // console.log("element NOT visible");
        }
        if (visible === false) {
            // console.log("DO NOT CHECK COLOR CONTRAST");
            return null;
        }


        let clipHeight = -1;
        if (style.clip !== "auto") {
            let clipString = style.clip.toString();
            if (clipString.includes("rect")) {
                var reBrackets = /\((.*)\)/g;
                var listOfText = [];
                var found = reBrackets.exec(clipString);
                var foundArr = found[1].split(', ');
                for (let i = 0; i < foundArr.length; i++) {
                    // console.log("foundArr[",i,"] = ",foundArr[i]);
                    listOfText.push(foundArr[i]);
                };
            }
            // console.log("listOfText = ",listOfText);
            clipHeight = parseInt(listOfText[0].replace(/px/g, '')) - parseInt(listOfText[2].replace(/px/g, ''));
            clipHeight = Math.abs(clipHeight);
        }

        // JCH clip-path INFO:
        //      Excellent article on clip-path: https://ishadeed.com/article/clip-path/
        //      clip-path is a totally different animal with many, many different variations
        //      The goal was for it to not be as limited as clip
        //      The syntax is more complicated (as it does more) and it is different from clip,
        //      e.g., the above clip rectangle would be clip-path: inset(10px 20px 30px 40px);
        //      Note: there are no commas
        //      Also, it can take single values to make all sides the same, or 2 values (vert/hori).
        //      or 3 values (top/hori/bottom)
        //      And percentages can works as well as px
        //      
        //      Although there are five different shapes: inset (term used for rectangle), circle,
        //          ellipse, polygon, path - we will only concern ourselves with inset
        //      There are 7 box values: margin-box, border-box, padding-box, content-box, fill-box, stroke-box, view-box
        //      Box and shape values may be combined: clip-path: padding-box circle(50px at 0 100px);
        //      NOTE: the box values are NOT intuitive, see: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Shapes/From_box_values#margin-box
        //      
        //      So the key question is what amount of effort do we want to invest into clip-path
        // 

        // JCH don't do clip-path now 
        let clipPathHeight = -1;
        // if (style.clipPath !== "auto") {
        //     console.log("style.clipPath = ",style.clipPath);
        //     console.log("style.clipPath.toString = ",style.clipPath.toString());
        //     let clipString = style.clipPath.toString();
        //     if (clipString.includes("inset")) {
        //         var reBrackets = /\((.*)\)/g;
        //       var listOfText = [];
        //       var found = reBrackets.exec(clipString);
        //       var foundArr = found[1].split(' ');
        //       for (let i=0; i<foundArr.length; i++) {
        //         console.log("foundArr[",i,"] = ",foundArr[i]);
        //         listOfText.push(foundArr[i]);
        //       };
        //     }
        //     console.log("listOfText = ",listOfText);
        // clipPathHeight = parseInt(listOfText[0].replace(/px/g, '')) - parseInt(listOfText[2].replace(/px/g, ''));
        // clipPathHeight = Math.abs(clipHeight);
        // }
        // console.log("clipPathHeight = ", clipPathHeight);

        // if (style.position === "absolute" && style.clip === "rect(0px, 0px, 0px, 0px)" && style.overflow !== "visible") {
        // JCH arbitrarily use less that 7px for clipHeight
        if (style.position === "absolute" && clipHeight < 7 && clipHeight !== -1) {
            // console.log("DO NOT CHECK COLOR CONTRAST because too small");
            // Corner case where item is hidden (accessibility hiding technique)
            return null;
        }
        // First determine the color contrast ratio
        let colorCombo = RPTUtil.ColorCombo(ruleContext);
        let fg = colorCombo.fg;
        let bg = colorCombo.bg;
        let ratio = fg.contrastRatio(bg);
        // console.log("fg = ", fg, "   bg = ", bg, "   ratio = ", ratio);
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

        if (!isDisabled && nodeName === 'label' && RPTUtil.isDisabledByFirstChildFormElement(ruleContext)) {
            isDisabled = true;
        }

        if (!isDisabled && ruleContext.hasAttribute("id") && RPTUtil.isDisabledByReferringElement(ruleContext)) {
            isDisabled = true;
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
            return RulePass("Pass_0", [ratio.toFixed(2), size, weight, fg.toHex(), bg.toHex(), colorCombo.hasBGImage, colorCombo.hasGradient]);
        }
    }
}
