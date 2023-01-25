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
import { getDefinedStyles, getMediaOrientationTransform, getRotationDegree } from "../util/CSSUtil";
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
            "fail_locked": "element_orientation_unlocked.html",
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
        
        let media_transform = null;
        let stop = false;
        Object.keys(orientationTransforms).forEach(key => {
            console.log(key, orientationTransforms[key]);
            Object.keys(orientationTransforms[key]).forEach(tag => {
                console.log(tag, orientationTransforms[key]); console.log("tag=" + tag + ", " + nodeName +", mediastyle=" + JSON.stringify(orientationTransforms[key][tag]));
                if (tag === nodeName)
                    media_transform = orientationTransforms[key][tag].transform;    
            });
        });

        // the elemenet is not in media orientation style
        if (!media_transform) return null;
        console.log("node=" + nodeName + ", media_transform=" + media_transform);
        let containsRotation = false;
        ['rotate', 'rotate3d', 'rotateZ', 'matrix', 'matrix3d'].forEach(rotation => {
             if (media_transform.includes(rotation)) containsRotation = true;
        });
        // no rotation transform, skip
        if (!containsRotation) return null;

        const degree = getRotationDegree(media_transform);
        console.log("node=" + nodeName + ", degree=" + degree); 
        
        // no or 360n degree rotation 
        if (degree === 0) 
            return RulePass("pass");
        
        /**
         * calculate the original page rotation, example
         *  html { transform: rotate(2.5deg); }
        */
        const definedStyle = getDefinedStyles(ruleContext);
        console.log("defined node=" + nodeName + ", definedStyle=" + definedStyle['transform']); 
        // the original page roatation degree
        let page_degree = 0;
        if (definedStyle['transform'])
            page_degree = getRotationDegree(definedStyle['transform']);

        /** TODO: 
         *   consider an opposite case when a page transformation (not in media) is defined after the media transformation,  
         * and the media transform, therefore, is not actually applied or is overwritten. 
        */     
        const resolved_degree = degree - page_degree;
        console.log("final node=" + nodeName + ", resolved_degree=" + resolved_degree);

        // allow 1 degree floating range for the right angle
        if ((resolved_degree > 89 && resolved_degree < 91) || resolved_degree > -91 && resolved_degree < -89 )
            return RuleFail("fail_locked", [nodeName]);
        return RulePass("pass");
        
    }
}