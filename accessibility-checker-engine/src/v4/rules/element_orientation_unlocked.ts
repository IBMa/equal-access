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
import { getDefinedStyles, getMediaOrientationTransform, getRotationDegree} from "../util/CSSUtil";
import { VisUtil } from "../../v2/dom/VisUtil";
import { getCache, setCache } from "../util/CacheUtil";
import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";

export let element_orientation_unlocked: Rule = {
    id: "element_orientation_unlocked",
    context: "dom:*",
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
        
        //skip elements
        if (RPTUtil.getAncestor(ruleContext, ["script", "meta"]))
            return null;

        const nodeName = ruleContext.nodeName.toLowerCase();    
        
        let doc = FragmentUtil.getOwnerFragment(ruleContext) as any;
        let orientationTransforms = getCache(doc, "RPTUtil_MEDIA_ORIENTATION_TRANSFROM", null);
        if (!orientationTransforms) {
            orientationTransforms = getMediaOrientationTransform(ruleContext);
            setCache(doc, "RPTUtil_MEDIA_ORIENTATION_TRANSFROM", orientationTransforms);
        } 
        
        let media_transforms = [];
        Object.keys(orientationTransforms).forEach(key => {
            Object.keys(orientationTransforms[key]).forEach(tag => {
                if (tag === nodeName && Object.keys(orientationTransforms[key][tag]).length > 0)
                    media_transforms.push(orientationTransforms[key][tag].transform);    
            });
        });

        // elemenet is not in media orientation transform
        if (media_transforms.length === 0) return null;
        
        let ret = [];
        for (let i=0; i < media_transforms.length; i++) {
            const media_transform = media_transforms[i];
            let containsRotation = false;
            ['rotate', 'rotate3d', 'rotateZ', 'matrix', 'matrix3d'].forEach(rotation => {
                if (media_transform.includes(rotation)) containsRotation = true;
            });
            // no rotation transform, skip
            if (!containsRotation) continue;

            let degree = getRotationDegree(media_transform);
            
            // no or 360n degree rotation 
            if (degree === 0) { 
                ret.push(RulePass("pass"));
                continue;
            }
            /**
             * calculate the original page rotation transformation, example
             *  html { transform: rotate(2.5deg); }
            */
            const definedStyle = getDefinedStyles(ruleContext);
            
            /** 
             * compensate the media orientation with the page orientation
             * TODO: can it be contained in #1277 ?
             *   consider a case when a page transformation (not in media) is defined after the media transformation,  
             * and the media transform, therefore, is not actually applied or is overwritten by the page transformation. 
             *   const device_orientation = getDeviceOrientation();
            */
            if (definedStyle['transform']) {
                const page_degree = getRotationDegree(definedStyle['transform']);
                degree -= page_degree;
            }    
            
            // allow 1 degree floating range for the right angle
            if ((degree > 89 && degree < 91) || (degree > -91 && degree < -89))
                ret.push(RuleFail("fail_locked", [nodeName]));
            else ret.push(RulePass("pass"));
        }
        if (ret.length > 0)  
            return ret;
        return null; 
    }
}