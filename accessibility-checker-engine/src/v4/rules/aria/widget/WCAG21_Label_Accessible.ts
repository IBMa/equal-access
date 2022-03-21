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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../../../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../../../api/IRule";
import { RPTUtil } from "../../../../v2/checker/accessibility/util/legacy";
import { DOMUtil } from "../../../../v2/dom/DOMUtil";
import { FragmentUtil } from "../../../../v2/checker/accessibility/util/fragment";

export let WCAG21_Label_Accessible: Rule = {
    id: "WCAG21_Label_Accessible",
    context: "aria:button,aria:checkbox,aria:gridcell,aria:link,aria:menuitem,aria:menuitemcheckbox,aria:menuitemradio,aria:option,aria:radio,aria:switch,aria:tab,aria:treeitem,dom:input,dom:textarea,dom:select,dom:output,dom:meter",
    help: {
        "en-US": {
            "Pass_0": "WCAG21_Label_Accessible.html",
            "Fail_1": "WCAG21_Label_Accessible.html",
            "group": "WCAG21_Label_Accessible.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "Accessible name does not match or contain the visible label text",
            "group": "Accessible name must match or contain the visible label text"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1"],
        "num": ["2.5.3"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_TWO
    }],
    // TODO: ACT: Review https://github.com/act-rules/act-rules.github.io/issues/1618
    act: "2ee8b8",
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        if (!RPTUtil.isNodeVisible(ruleContext) ||
            RPTUtil.isNodeDisabled(ruleContext)) {
            return null;
        }
        let passed = true;

        let nodeName = ruleContext.nodeName.toLowerCase();

        let isInputButton = false;
        let buttonTypes = ["button", "reset", "submit"/*, "image"*/];
        let inputType = null;
        if (nodeName === "input" && ruleContext.hasAttribute("type")) {
            inputType = ruleContext.getAttribute("type").toLowerCase();
            if (buttonTypes.indexOf(inputType) !== -1) {
                isInputButton = true;
            }
        }

        let theLabelBy = RPTUtil.getAriaAttribute(ruleContext, "aria-labelledby");
        if (theLabelBy && !isInputButton) {
            // skip the checks if it has an aria-labelledby since it takes precedence.
        } else {
            let theLabel = null;
            if (theLabelBy) {
                let labelValues = theLabelBy.split(/\s+/);
                for (let j = 0; j < labelValues.length; ++j) {
                    let elementById = FragmentUtil.getById(ruleContext, labelValues[j]);
                    if (elementById) {
                        theLabel = RPTUtil.getInnerText(elementById);
                        break;
                    }
                }
            } else {
                theLabel = RPTUtil.getAriaAttribute(ruleContext, "aria-label");
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
                let labelElem = RPTUtil.getLabelForElementHidden(ruleContext, true);
                if (!labelElem) {
                    let parentNode = DOMUtil.parentNode(ruleContext);
                    if (parentNode.nodeName.toLowerCase() === "label" /*&& RPTUtil.isFirstFormElement(parentNode, ruleContext)*/) {
                        let parentClone = parentNode.cloneNode(true);
                        // exclude all form elements from the label since they might also have inner content
                        labelElem = RPTUtil.removeAllFormElementsFromLabel(parentClone);
                    }
                }

                let element = labelElem ? labelElem : ruleContext;

                let elementsToSkipContentCheck = ["meter", "output", "progress", "select", "textarea"];
                if (!labelElem && elementsToSkipContentCheck.indexOf(nodeName) !== -1) {
                    text = ""; // skip content check for some elements
                } else {
                    // get the visible text
                    text = RPTUtil.getInnerText(element);
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
            let normalizedText = RPTUtil.normalizeSpacing(text).toLowerCase(); // Leading and trailing whitespace and difference in case sensitivity should be ignored.

            theLabel = theLabel.replace(nonalphanumeric, " "); // only consider alphanumeric characters
            let normalizedLabel = RPTUtil.normalizeSpacing(theLabel).toLowerCase();

            if (normalizedText.length > 1) { // skip non-text content. e.g. <button aria-label="close">X</button>
                let location = normalizedLabel.indexOf(normalizedText);

                // Avoid matching partial words.e.g. text "name" should not match 'surname' or 'names'
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