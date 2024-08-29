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
import { ARIADefinitions } from "../../v2/aria/ARIADefinitions";
import { AriaUtil } from "../util/AriaUtil";

export let aria_attribute_allowed: Rule = {
    id: "aria_attribute_allowed",
    context: "dom:*",
    refactor: {
        "Rpt_Aria_ValidProperty": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1"
        }
    },
    help: {
        "en-US": {
            "group": `aria_attribute_allowed.html`,
            "Pass_0": `aria_attribute_allowed.html`,
            "Fail_1": `aria_attribute_allowed.html`
        }
    },
    messages: {
        "en-US": {
            "group": "ARIA attributes must be valid for the element's role",
            "Pass_0": "Rule Passed",
            "Fail_1": "The attribute(s) '{0}' referenced by the element <{1}> is not a valid ARIA state or property"
        }
    },
    rulesets: [{
        id: [ "IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_0", "WCAG_2_1", "WCAG_2_2"],
        num: "4.1.2", // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_ONE
    }],
    act: "5f99a7",
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let contextAttributes = ruleContext.attributes;
        
        // This gets all elements with attributes so we still have some
        // Out of Scope since not all attributes are aria 

        if (contextAttributes) {
            let propertyDataTypes = ARIADefinitions.propertyDataTypes;
            let failedProperties = "";
            let testedProperties = 0;
            for (let i = 0, length = contextAttributes.length; i < length; i++) {
                let attrName = contextAttributes[i].name;
                if (AriaUtil.isDefinedAriaAttribute(ruleContext, attrName)) {
                    testedProperties++;
                    // Now we just have aria attributes which can
                    // pass or fail based on whether there property is valid
                    let dataTypes = propertyDataTypes[attrName];
                    if (!dataTypes) { // if property is not in valid property list
                        // create failedProperties comma sep list
                        if (failedProperties.length == 0) {
                            failedProperties = attrName;
                        } else {
                            failedProperties = failedProperties + ", " + attrName;
                        }
                    }
                }
            }
            if (testedProperties == 0) {
                return null;
            } else if (failedProperties.length != 0) {
                return RuleFail("Fail_1", [failedProperties, ruleContext.nodeName.toLowerCase()]);
            } else {
                //return RulePass(1);
                return RulePass("Pass_0");
            }
        } else {
            return null;
        }
        // JCH - passing is based on all attributes not just aria attributes
        //       leading to OVER COUNTING so moved pass up
        //return RulePass(1);
    }
}
    