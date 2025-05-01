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

import { AriaUtil } from "../util/AriaUtil";
import { CommonUtil } from "../util/CommonUtil";
import { VisUtil } from "../util/VisUtil";
import { ColorUtil } from "../util/ColorUtil";
import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { DOMWalker } from "../../v2/dom/DOMWalker";
import { CSSUtil } from "../util/CSSUtil";

export const text_contrast_sufficient: Rule = {
    id: "text_contrast_sufficient",
    context: "dom:*",
    refactor: {
        "IBMA_Color_Contrast_WCAG2AA": {
            "Pass_0": "pass",
            "Fail_1": "fail_contrast",
            "Potential_1": "potential_same_color"
        },
        "IBMA_Color_Contrast_WCAG2AA_PV": {
            "pass_0": "pass",
            "potential_1": "potential_graphic_background"
        }
    },
    help: {
        "en-US": {
            "group": `text_contrast_sufficient.html`,
            "pass": `text_contrast_sufficient.html`,
            "fail_contrast": `text_contrast_sufficient.html`,
            "potential_same_color": `text_contrast_sufficient.html`,
            "potential_graphic_background": `text_contrast_sufficient.html`,
            "potential_text_shadow": `text_contrast_sufficient.html`
        }
    },
    messages: {
        "en-US": {
            "group": "The contrast ratio of text with its background must meet WCAG AA requirements",
            "pass": "The contrast ratio of text with its background meets WCAG AA requirements",
            "fail_contrast": "Text contrast of {0} with its background is less than the WCAG AA minimum requirements for text of size {1}px and weight of {2}",
            "potential_same_color": "The foreground text and its background color are both detected as {3}. Verify the text meets the WCAG AA requirements for minimum contrast",
            "potential_graphic_background": "Verify the contrast ratio of the text against the lightest and the darkest colors of the background meets the WCAG AA minimum requirements for text of size {1}px and weight of {2}",
            "potential_text_shadow": "Verify the contrast ratio of the text with shadow meets the WCAG AA minimum requirements for text of size {1}px and weight of {2}"
        }
    },
    rulesets: [{
        id: ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_0", "WCAG_2_1", "WCAG_2_2"],
        num: "1.4.3", // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_ONE
    }],
    act: ['afw4f7'],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        let nodeName = ruleContext.nodeName.toLowerCase();
        // avoid diagnosing elements that are not visible
        if (!VisUtil.isNodeVisible(ruleContext) ||
            (VisUtil.hiddenByDefaultElements != null &&
                VisUtil.hiddenByDefaultElements != undefined &&
                VisUtil.hiddenByDefaultElements.indexOf(nodeName) > -1)) {
            return null;
        }
        
        //TODO ? should only consider native disabled, ignore aria-disabled
        //skip disabled element
        if (CommonUtil.isNodeDisabled(ruleContext))
            return null;

        //skip elements
        if (CommonUtil.getAncestor(ruleContext, ["svg", "script", "meta", "style"]))
            return null;

        let doc = ruleContext.ownerDocument;
        if (!doc) {
            return null;
        }
    
        let win = doc.defaultView;
        if (!win) {
            return null;
        }

        // Ensure that this element has children with actual text.
        let childStr = CommonUtil.getNodeText(ruleContext);
        
        if (!CommonUtil.isShadowHostElement(ruleContext) || (CommonUtil.isShadowHostElement(ruleContext) && CommonUtil.getNodeText(ruleContext.shadowRoot) === '')) {
            if (childStr.trim().length == 0 )
                return null;
            
            // ignore if the text does not convey anything in human language
            /** 
             * (1) ignore non-alphanumeric or special characters in ASCI: ^(a-zA-Z\d\s)
             * (2) ignore non-printable unicode characters: \u0000-\u0008\u000B-\u001F\u007F-\u009F\u2000-\u200F\u2028-\u202F\u205F-\u206F\u3000\uFEFF
             *  see https://stackoverflow.com/questions/3770117/what-is-the-range-of-unicode-printable-characters
             * (3) for now not consider unicode special characters that are different in different languages
            */
            //let regex = /[^(a-zA-Z\d\s)\u0000-\u0008\u000B-\u001F\u007F-\u009F\u2000-\u200F\u2028-\u202F\u205F-\u206F\u3000\uFEFF]+/g;
            let regex = /[^(a-zA-Z\d\s)\^(\u4e00-\u9fff\u3400-\u4dbf)\u0000-\u0008\u000B-\u001F\u007F-\u009F\u2000-\u200F\u2028-\u202F\u205F-\u206F\u3000\uFEFF]+/g;
            childStr = childStr.trim().replace(regex, '');
            if (childStr.trim().length === 0)
                return null;
        }

        let elem = ruleContext;
        // the child elements (rather than shadow root) of a shadow host is either re-assigned to the shadow slot if the slot exists 
        // or not displayed, so shouldn't be checked from the light DOM, rather it should be checked as reassginged slot element(s) in the shadow DOM.
        if (CommonUtil.isShadowHostElement(ruleContext)) {
            // if it's direct text of a shadow host
            if (ruleContext.shadowRoot) {
                for (let node=ruleContext.firstChild; node; node=node.nextSibling) {
                    if (node.nodeType==3) {
                        //if multiple texts exist, only need to check one 
                        elem = (node as Text).assignedSlot;
                        break;
                    }   
                }
            }
            if (elem === null) return;
        }
        
        let style = win.getComputedStyle(elem);
        
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
        let colorCombo = ColorUtil.ColorCombo(elem);
        if (colorCombo === null) {
            //some exception occurred, or not able to get color combo for some reason
            console.log("unable to get color combo for element: " + elem.nodeName);
            return;
        }
        let fg = colorCombo.fg;
        let bg = colorCombo.bg;
        let ratio = fg.contrastRatio(bg);
        let weight = CSSUtil.getWeightNumber(style.fontWeight);
        let size = CSSUtil.getFontInPixels(style.fontSize, elem);
        let isLargeScale = size >= 24 || size >= 18.6 && weight >= 700;
        
        if (CSSUtil.containsCKJ(childStr)) {
            // https://github.com/act-rules/act-rules.github.io/pull/2121/files
            // for CJK, 22 pt or 18 pt with font-weight >= 700, 1pt = 1.333 px
            isLargeScale = size >= 29.3 || size >= 24 && weight >= 700;
        }    
        let passed = ratio >= 4.5 || (ratio >= 3 && isLargeScale);
        let hasBackground = colorCombo.hasBGImage || colorCombo.hasGradient;
        let textShadow = colorCombo.textShadow;
        let isDisabled = CommonUtil.isNodeDisabled(elem);
        if (!isDisabled) {
            let control = CommonUtil.getControlOfLabel(elem);
            if (control) {
                isDisabled = CommonUtil.isNodeDisabled(control);
            }
        }
        
        if (!isDisabled && nodeName === 'label' && CommonUtil.isDisabledByFirstChildFormElement(elem)) {
            isDisabled = true;
        }

        if (!isDisabled && ruleContext.hasAttribute("id") && CommonUtil.isDisabledByReferringElement(elem)) {
            isDisabled = true;
        }

        /**setCache(ruleContext, "EXT_Color_Contrast_WCAG2AA", {
            "ratio": ratio,
            "isLargeScale": isLargeScale,
            "weight": weight,
            "size": size,
            "hasBackground": hasBackground,
            "isDisabled": isDisabled
        });*/
        
        // If element or parent is disabled, this rule does not apply (but may be 3:1 in future)
        if (!passed && isDisabled) {
            passed = true;
        }
        if (!passed) {
            if (hasBackground) {
                // fire potential since a text on an image or gradient may be still viewable, depending on the text location on the gradient or image
                return RulePotential("potential_graphic_background", [ratio.toFixed(2), size, weight]);;
            } else if (textShadow) {
                // fire potential since a text with shadow may be still viewable, depending on the shadow efffects
                return RulePotential("potential_text_shadow", [ratio.toFixed(2), size, weight]);
            } else {
                if (fg.toHex() === bg.toHex()) {
                    return RulePotential("potential_same_color", [ratio.toFixed(2), size, weight, fg.toHex(), bg.toHex(), colorCombo.hasBGImage, colorCombo.hasGradient]);
                } else {
                    return RuleFail("fail_contrast", [ratio.toFixed(2), size, weight, fg.toHex(), bg.toHex(), colorCombo.hasBGImage, colorCombo.hasGradient]);
                }
            }    
        } else {
            return RulePass("pass", [ratio.toFixed(2), size, weight, fg.toHex(), bg.toHex(), colorCombo.hasBGImage, colorCombo.hasGradient]);
        }
    }
}
