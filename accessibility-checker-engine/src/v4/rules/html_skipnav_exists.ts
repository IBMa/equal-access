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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { RPTUtil } from "../util/AriaUtil";
import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";
    
export let html_skipnav_exists: Rule = {
    id: "html_skipnav_exists",
    context: "dom:html",
    refactor: {
        "RPT_Html_SkipNav": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"
        }
    },
    help: {
        "en-US": {
            "group": `html_skipnav_exists.html`,
            "Pass_0": `html_skipnav_exists.html`,
            "Potential_1": `html_skipnav_exists.html`
        }
    },
    messages: {
        "en-US": {
            "group": "Provide a way to bypass blocks of content that are repeated on multiple Web pages",
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify there is a way to bypass blocks of content that are repeated on multiple Web pages"
        }
    },
    rulesets: [{
        id: [ "IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_0", "WCAG_2_1", "WCAG_2_2"],
        num: "2.4.1", // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let passed = false;
        let frames = RPTUtil.getDocElementsByTag(ruleContext, "frame");
        let headers = RPTUtil.getDocElementsByTag(ruleContext, "h1");

        if ((frames != null && frames.length > 0) || (headers != null && headers.length > 0)) {
            // If frames or headings are used, pass
            passed = true;
        } else {
            // Look for skip anchors
            let anchors = RPTUtil.getDocElementsByTag(ruleContext, "a");
            let targets = {};
            for (let idx = 0; !passed && idx < anchors.length; ++idx) {
                if (anchors[idx].hasAttribute("href")) {
                    let href = anchors[idx].href;
                    if (typeof href !== typeof "") {
                        if (href.baseVal) {
                            href = href.baseVal;
                        } else {
                            href = "";
                        }
                    }
                    let tmpLocation;
                    if (typeof ((ruleContext.ownerDocument as any).locationFromDAP) != "undefined" && (ruleContext.ownerDocument as any).locationFromDAP != null) { // DAP sets it
                        tmpLocation = (ruleContext.ownerDocument as any).locationFromDAP;
                    } else { // server scan has the location object
                        tmpLocation = ruleContext.ownerDocument.location;
                    }
                    let docHref = "";
                    if (tmpLocation) {
                        docHref = tmpLocation.href;
                    }
                    // Fix weird bugs with how various parsers report on file: url's:
                    if (href.startsWith("file:///")) href = "file:/" + href.substring("file:///".length);
                    if (docHref.startsWith("file:///")) docHref = "file:/" + docHref.substring("file:///".length);

                    if (href.charAt(0) == "#" || href.startsWith(docHref + "#")) {
                        let target = RPTUtil.getFileAnchor(href);
                        if (FragmentUtil.getById(ruleContext, target) != null)
                            passed = true;
                        else
                            targets[target] = true;
                    }
                } else if (anchors[idx].hasAttribute("name")) {
                    // Assume forward jumping targets
                    let name = anchors[idx].getAttribute("name");
                    if (name.indexOf("#") != -1)
                        name = RPTUtil.getFileAnchor(name);
                    passed = name in targets;
                }
            }
        }
        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");
    }
}
