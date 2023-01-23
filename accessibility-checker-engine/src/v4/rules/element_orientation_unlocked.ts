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
import { getDefinedStyles, selectorMatchesElem, getMediaOrientationTransform } from "../util/CSSUtil";
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { VisUtil } from "../../v2/dom/VisUtil";
import { getCache, setCache } from "../util/CacheUtil";
import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";

export let element_orientation_unlocked: Rule = {
    id: "element_orientation_unlocked",
    context: "dom:*",
    //context: "dom:style, dom:*[style]",
    help: {
        "en-US": {
            "pass": "element_orientation_unlocked.html",
            "potential_text": "element_orientation_unlocked.html",
            "group": "element_orientation_unlocked.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "The element is not restricted to either landscape or portrait orientation using CSS transform property",
            "fail_locked": "The element <{0}> is restricted to either landscape or portrait orientation using CSS transform property",
            "group": "Elements should not be restricted to either landscape or portrait orientation using CSS transform property"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["1.3.4"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: ['b33eff'],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;

        //skip invisible element
        if (!VisUtil.isNodeVisible(ruleContext))
            return null;

        const transform_functions =["rotate", "rotate3d", "rotateZ", "matrix", "matrix3d"]; 

        const nodeName = ruleContext.nodeName.toLowerCase();    
        console.log("node=" + ruleContext.nodeName +", orientation=" +window.matchMedia("(orientation: landscape)").matches);
        if (ruleContext.nodeName === 'HTML') console.log("node=" + nodeName +", computedStyle=" + JSON.stringify(window.getComputedStyle(ruleContext).transform));
        let doc = FragmentUtil.getOwnerFragment(ruleContext) as any;

        // get the styles that changed
        let orientationTransforms = getCache(doc, "RPTUtil_MEDIA_ORIENTATION_TRANSFROM", null);
        if (!orientationTransforms) {
            orientationTransforms = getMediaOrientationTransform(ruleContext);
            console.log("node=" + nodeName +", orientationTransforms=" + JSON.stringify(orientationTransforms));
            setCache(doc, "RPTUtil_MEDIA_ORIENTATION_TRANSFROM", orientationTransforms);
        } else {
            console.log("cached node=" + ruleContext.nodeName +", orientationTransforms=" + JSON.stringify(orientationTransforms));
        }
        
        let mediaStyle = null;
        let stop = false;
        Object.keys(orientationTransforms).forEach(key => {
            console.log(key, orientationTransforms[key]);
            Object.keys(orientationTransforms[key]).forEach(tag => {
                console.log(tag, orientationTransforms[key]); console.log("tag=" + tag + ", " + nodeName +", mediastyle=" + JSON.stringify(orientationTransforms[key][tag]));
                if (tag === nodeName)
                    mediaStyle = orientationTransforms[key][tag];    
            });
        });

        // the elemenet is not in media orientation style
        if (mediaStyle === null ) return null;
        console.log("node=" + nodeName + ", mediastyle=" + mediaStyle.transform);
        
        //console.log("node=" + ruleContext.nodeName +", defined_styles=" +JSON.stringify(defined_styles));
        //console.log("node=" + ruleContext.nodeName +", styleSheets=" +JSON.stringify(ruleContext.ownerDocument.styleSheets));
        
        let passed = true;
        let walkNode = ruleContext.firstChild as Node;
        
        if (passed) return RulePass("pass");
        return RulePotential("potential_text");

    }
}