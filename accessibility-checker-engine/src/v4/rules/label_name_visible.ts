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

import { Rule, RuleResult, RuleFail, RuleContext, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { AriaUtil } from "../util/AriaUtil";
import { CommonUtil } from "../util/CommonUtil";
import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";
import { VisUtil } from "../util/VisUtil";
import { CSSUtil } from "../util/CSSUtil";
import { DOMWalker } from "../../v2/dom/DOMWalker";
import { AccNameUtil } from "../util/AccNameUtil";

export const label_name_visible: Rule = {
    id: "label_name_visible",
    context: "aria:button,aria:checkbox,aria:gridcell,aria:link,aria:menuitem,aria:menuitemcheckbox,aria:menuitemradio,aria:option,aria:radio,aria:switch,aria:tab,aria:treeitem,dom:input,dom:textarea,dom:select,dom:output,dom:meter",
    refactor: {
        "WCAG21_Label_Accessible": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "label_name_visible.html",
            "Fail_1": "label_name_visible.html",
            "group": "label_name_visible.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Accessible name matches or contains the visible label text",
            "Fail_1": "Accessible name does not match or contain the visible label text",
            "group": "Accessible name must match or contain the visible label text"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_2"],
        "num": ["2.5.3"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_TWO
    }],
    // TODO: ACT: Review https://github.com/act-rules/act-rules.github.io/issues/1618
    // https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA24
    act: "2ee8b8",
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        if (!VisUtil.isNodeVisible(ruleContext) ||
            CommonUtil.isNodeDisabled(ruleContext)) {
            return null;
        }

        // pass if the visible text uses Material Icon font
        if (CSSUtil.isMaterialIconFont(ruleContext)) 
            return RulePass("Pass_0");

        let passed = true;

        let nodeName = ruleContext.nodeName.toLowerCase();

        let isInputButton = false;
        //let buttonTypes = ["button", "reset", "submit"]; //"image"
        let inputType = null;
        if (nodeName === "input" && ruleContext.hasAttribute("type")) {
            inputType = ruleContext.getAttribute("type").toLowerCase();
            if (CommonUtil.form_button_types.indexOf(inputType) !== -1) {
                isInputButton = true;
            }
        }

        let theLabelBy = AriaUtil.getAriaAttribute(ruleContext, "aria-labelledby");
        if (theLabelBy && !CommonUtil.isIdReferToSelf(ruleContext, theLabelBy) && !isInputButton) {
            // skip the checks if it has an aria-labelledby since it takes precedence.
        } else {
            let theLabel = null;
            if (theLabelBy && !CommonUtil.isIdReferToSelf(ruleContext, theLabelBy)) {
                let labelValues = theLabelBy.split(/\s+/);
                for (let j = 0; j < labelValues.length; ++j) {
                    let elementById = FragmentUtil.getById(ruleContext, labelValues[j]);
                    if (elementById) {
                        theLabel = CommonUtil.getInnerText(elementById);
                        break;
                    }
                }
            } else {
                theLabel = AriaUtil.getAriaAttribute(ruleContext, "aria-label");
            }

            if (!theLabel) {
                return null;
            }
            
            let text = null;

            if (isInputButton) {
                /* Note: Disable the alt check in images until we get confirmation
                if (inputType==="image" && ruleContext.hasAttribute("alt")){
                    // use 'alt' attribute as visible text
                    text = ruleContext.getAttribute("alt");
                }else 
                */
                if (ruleContext.hasAttribute("value")) {
                    // use 'value' attribute as visible text
                    text = ruleContext.getAttribute("value");
                } else {
                    // use default value
                    if (inputType === "submit"/*||inputType==="image"*/) {
                        text = "submit";
                    } else if (inputType === "reset") {
                        text = "reset";
                    }
                }
            }


            if (!text) {
                // look for a <label> element
                let labelElem = CommonUtil.getLabelForElementHidden(ruleContext, true);
                if (!labelElem) {
                    let parentNode = DOMWalker.parentNode(ruleContext);
                    if (parentNode.nodeName.toLowerCase() === "label" /*&& RPTUtil.isFirstFormElement(parentNode, ruleContext)*/) {
                        let parentClone = parentNode.cloneNode(true);
                        // exclude all form elements from the label since they might also have inner content
                        labelElem = CommonUtil.removeAllFormElementsFromLabel(parentClone);
                    }
                }

                let element = labelElem ? labelElem : ruleContext;

                let elementsToSkipContentCheck = ["meter", "output", "progress", "select", "textarea"];
                if (!labelElem && elementsToSkipContentCheck.indexOf(nodeName) !== -1) {
                    text = ""; // skip content check for some elements
                } else {
                    // get the visible text only
                    text = CommonUtil.getOnScreenInnerText(element);
                }

                /* Note: Disable this alt check in images for now until we get confirmation
                // Look for the alt attribute of an image which is considered visible text.
                let hasImgAlt = false;
                if (element.firstChild != null) {
                    let nw = RPTUtil.new NodeWalker(element);
                    while (!hasImgAlt && nw.nextNode() && nw.node != element && nw.node != element.nextSibling) {
                        hasImgAlt = (nw.node.nodeName.toLowerCase() == "img" && RPTUtil.attributeNonEmpty(nw.node, "alt"));
                        if (hasImgAlt) {
                            text = text ? text + nw.node.getAttribute("alt") : nw.node.getAttribute("alt");
                        }
                    }
                }
                */
            }

            let nonalphanumeric = /[^a-zA-Z0-9]/g;

            text = text.replace(nonalphanumeric, " "); // only consider alphanumeric characters
            let normalizedText = CommonUtil.normalizeSpacing(text).toLowerCase(); // Leading and trailing whitespace and difference in case sensitivity should be ignored.

            theLabel = theLabel.replace(nonalphanumeric, " "); // only consider alphanumeric characters
            let normalizedLabel = CommonUtil.normalizeSpacing(theLabel).toLowerCase();

            if (normalizedText.length > 1) { // skip non-text content. e.g., <button aria-label="close">X</button>
                let location = normalizedLabel.indexOf(normalizedText);

                // Avoid matching partial words.e.g., text "name" should not match 'surname' or 'names'
                if (location >= 0 && normalizedLabel.length > normalizedText.length) {
                    let letters = /^[0-9a-zA-Z]+$/;
                    if ((location + normalizedText.length) < normalizedLabel.length) {
                        // check ending
                        let theChar = normalizedLabel.charAt(location + normalizedText.length);
                        if (theChar.match(letters)) {
                            passed = false;
                        }
                    }
                    if (passed && location > 0) {
                        // check beginning
                        let theChar = normalizedLabel.charAt(location - 1);
                        if (theChar.match(letters)) {
                            passed = false;
                        }
                    }
                }
                if (location === -1) { // check that visible text content of the target is contained within its accessible name.
                    passed = false;
                }
            }

        }

        if (!passed) {
            return RuleFail("Fail_1");
        } else {
            return RulePass("Pass_0");
        }
    }
}