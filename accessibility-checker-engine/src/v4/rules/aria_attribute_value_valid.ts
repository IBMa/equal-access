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
import { ARIADefinitions } from "../../v2/aria/ARIADefinitions";

export let aria_attribute_value_valid: Rule = {
    id: "aria_attribute_value_valid",
    context: "dom:*",
    dependencies: ["aria_attribute_allowed"],
    refactor: {
        "Rpt_Aria_ValidPropertyValue": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1"
        }
    },
    help: {
        "en-US": {
            "group": "aria_attribute_value_valid.html",
            "Pass_0": "aria_attribute_value_valid.html",
            "Fail_1": "aria_attribute_value_valid.html"
        }
    },
    messages: {
        "en-US": {
            "group": "ARIA property values must be valid",
            "Pass_0": "Rule Passed",
            "Fail_1": "The value \"{0}\" specified for attribute '{1}' on element <{2}> is not valid"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["4.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: "6a7281",
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let valueArr = new Array();
        let attrNameArr = new Array();
        let dataTypeArr = new Array();
        let propertyDataTypes = ARIADefinitions.propertyDataTypes;
        let contextAttributes = ruleContext.attributes;
        let testedPropertyValues = 0;

        if (contextAttributes) {
            for (let i = 0, length = contextAttributes.length; i < length; i++) {
                let attrName = contextAttributes[i].name;
                if (AriaUtil.isDefinedAriaAttribute(ruleContext, attrName)) {
                    let dataTypes = propertyDataTypes[attrName];
                    let nodeValue = CommonUtil.normalizeSpacing(contextAttributes[i].nodeValue);
                    testedPropertyValues++;
                    if (dataTypes && dataTypes.values) {
                        if (dataTypes.values.indexOf(nodeValue) == -1) {
                            if (dataTypes.values.indexOf('undefined') != -1 && nodeValue.length == 0) {
                                //translate 'undefined' to mean ''
                            } else {
                                // aria-relevant is represented as a space delimited list of the following values: 
                                // additions, removals, text; or a single catch-all value all.
                                if (dataTypes.type === "http://www.w3.org/2001/XMLSchema#nmtokens") {
                                    let attrValues = contextAttributes[i].nodeValue.trim().split(" ");
                                    // if the value all is specified, it cannot have any other value
                                    if (attrValues.length > 1 && attrValues.includes("all")) {
                                        valueArr.push(contextAttributes[i].nodeValue.split(" "));
                                        attrNameArr.push(attrName);
                                        dataTypeArr.push(dataTypes.values.toString());
                                    } else {
                                        let hash = {};
                                        for (let j = 0; j < attrValues.length; j++) {
                                            // if the individual value is not in the list of allowed values
                                            if (attrValues[j] != "" && !dataTypes.values.includes(attrValues[j])) {
                                                if (!hash.hasOwnProperty(attrName)) {
                                                    hash[attrName] = true;
                                                    attrNameArr.push(attrName);
                                                }
                                                valueArr.push(attrValues[j]);
                                                dataTypeArr.push(dataTypes.values.toString());
                                            }
                                        }
                                    }
                                } else {
                                    valueArr.push(contextAttributes[i].nodeValue.split(" "));
                                    attrNameArr.push(attrName);
                                    dataTypeArr.push(dataTypes.values.toString());
                                }
                            }
                        }
                    } else if (dataTypes && dataTypes.type && dataTypes.type === "http://www.w3.org/2001/XMLSchema#int") {
                        let iVal = parseInt(nodeValue);
                        if (isNaN(iVal) || ("" + iVal !== nodeValue)) {
                            valueArr.push(nodeValue);
                            attrNameArr.push(attrName);
                        }
                    } else if (dataTypes && dataTypes.type && dataTypes.type == "http://www.w3.org/2001/XMLSchema#decimal") {
                        let fVal = parseFloat(nodeValue);
                        if (isNaN(fVal)) {
                            valueArr.push(nodeValue);
                            attrNameArr.push(attrName);
                        }
                    } else if (dataTypes && dataTypes.type && (dataTypes.type == "http://www.w3.org/2001/XMLSchema#boolean")) {
                        let tmpV = nodeValue.trim().toLowerCase();
                        if (tmpV !== "true" && tmpV !== "false") {
                            valueArr.push(nodeValue);
                            attrNameArr.push(attrName);
                        }
                    } else if (dataTypes && dataTypes.type && (dataTypes.type == "http://www.w3.org/2001/XMLSchema#string")) {
                    } else {
                        testedPropertyValues--;
                    }
                }
            }
        }
        let retMsg = new Array();
        let passed = attrNameArr.length == 0;
        retMsg.push(valueArr.join(", "));
        retMsg.push(attrNameArr.join(", "));
        retMsg.push(ruleContext.nodeName.toLowerCase());
        // retMsg.push (dataTypeArr.join(", "));
        //return new ValidationResult(passed, [ruleContext], attrNameArr, '', retMsg);
        if (testedPropertyValues == 0) {
            return null;
        } else if (!passed) {
            return RuleFail("Fail_1", retMsg);
        } else {
            return RulePass("Pass_0");
        }
    }
}