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
import { FragmentUtil } from "../util/fragment";
import { RPTUtil } from "../util/legacy";

let a11yRulesLabel: Rule[] = [

    {
        /**
         * Description: Raise if more than one <label> found with the same for value.
         * Origin: RPT 5.6
         */
        id: "RPT_Label_UniqueFor",
        context: "dom:label[for]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            // JCH - NO OUT OF SCOPE hidden in context
            let labelIds = RPTUtil.getCache(FragmentUtil.getOwnerFragment(ruleContext), "RPT_Label_Single", {})
            let id = ruleContext.getAttribute("for");
            let passed = !(id in labelIds);
            labelIds[id] = true;
            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    },
    {
        /**
         * Description: Trigger label has no content
         * Origin: RPT 5.6
         */
        id: "Valerie_Label_HasContent",
        context: "dom:label",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            if (RPTUtil.hasInnerContentHidden(ruleContext)) {
                return RulePass("Pass_Regular");
            } else if ((ruleContext.getAttribute("aria-label") || "").trim().length > 0) {
                return RulePass("Pass_AriaLabel");
            } else if (ruleContext.hasAttribute("aria-labelledby")) {
                let labelElem = FragmentUtil.getById(ruleContext, ruleContext.getAttribute('aria-labelledby'));
                if (labelElem && RPTUtil.hasInnerContent(labelElem)) {
                    return RulePass("Pass_LabelledBy");
                }
            }
            return RuleFail("Fail_1");
        }
    },
    {
        /**
         * Description: Trigger if label for points to an invalid id
         * Origin: WCAG 2.0 Technique F17
         */
        id: "WCAG20_Label_RefValid",
        context: "dom:label[for]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let id = ruleContext.getAttribute("for");
            let passed = false;
            let target = FragmentUtil.getById(ruleContext, id);
            if (target) {
                passed = true;
                // handles null and undefined
                if (!target.hasAttribute("role")) {
                    // Fail if we're pointing at something that is labelled by another mechanism
                    let nodeName = target.nodeName.toLowerCase();
                    passed = nodeName == "input" || nodeName == "select" || nodeName == "textarea"
                        || nodeName == "button" || nodeName == "datalist"
                        || nodeName == "optgroup" || nodeName == "option"
                        || nodeName == "keygen" || nodeName == "output"
                        || nodeName == "progress" || nodeName == "meter"
                        || nodeName == "fieldset" || nodeName == "legend";
                    if (target.nodeName.toLowerCase() == "input" && target.hasAttribute("type")) {
                        let type = target.getAttribute("type").toLowerCase();
                        passed = type == "text" || type == "password" || type == "file" ||
                            type == "checkbox" || type == "radio" ||
                            type == "hidden" || type == "search" || type == "tel" || type == "url" || type == "email" ||  //HTML 5
                            type == "date" || type == "number" || type == "range" || type == "image" || //HTML 5
                            type == "time" || type == "color" ||  // HTML 5
                            type == "datetime" || type == "month" || type == "week"; //HTML5.1
                    }
                }

                // Add one more check to make sure the target element is NOT hidden, in the case the target is hidden
                // flag a violation regardless of what the Check Hidden Content setting is.
                if (passed && !RPTUtil.isNodeVisible(target)) {
                    passed = false;
                }
            }
            let retToken : string[] = [];
            if (!passed) {
                retToken.push(id);
            }
            //return new ValidationResult(passed, [ruleContext], '', '', passed == true ? [] : [retToken]);
            if (!passed) {
                return RuleFail("Fail_1", retToken);
            } else {
                return RulePass("Pass_0");
            }
        }
    },
    {
        /**
         * Description: Trigger if label "for" points to an hidden element.
         * Note: RPT doesn't support querying style information, 
         * so this rule only addresses type="hidden" elements.
         * Origin: WCAG 2.0 Technique F68
         */
        id: "WCAG20_Label_TargetInvisible",
        context: "dom:label[for]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;

            let passed = true;
            let id = ruleContext.getAttribute("for");
            let target = FragmentUtil.getById(ruleContext, id);
            if (target) {
                passed = RPTUtil.getElementAttribute(target, "type") != "hidden";
            }
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },

    {
        /**
         * Description: Flag a violation if Accessible name does not match or contain the visible label text.
         * Origin: WCAG 2.1 Success Criterion 2.5.3: Label in Name
         */
        id: "WCAG21_Label_Accessible",
        context: "aria:button,aria:checkbox,aria:gridcell,aria:link,aria:menuitem,aria:menuitemcheckbox"
            +",aria:menuitemradio,aria:option,aria:radio,aria:switch,aria:tab,aria:treeitem"
            +",dom:input,dom:textarea,dom:select,dom:output,dom:meter",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
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
                        let parentNode = ruleContext.parentNode;
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

]

export { a11yRulesLabel }