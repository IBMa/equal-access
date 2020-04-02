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

import { Rule, RuleResult, RuleRender, RuleContext } from "../../api/IEngine";
import { DOMUtil } from "../../dom/DOMUtil";

let simRules: Rule[] = [
    {
        id: "LinkRule",
        context: "aria:/link",
        run: (context: RuleContext, options?: { [key: string]: any }): RuleResult | RuleResult[] => {
            if (options.mode === "ITEM" || options.mode === "LINK") {
                return RuleRender(0);
            }
        }
    },
    {
        id: "Button",
        context: "aria:button",
        run: (context: RuleContext, options?: { [key: string]: any }): RuleResult | RuleResult[] => {
            if (options.mode === "ITEM" || options.mode === "LINK") {
                return RuleRender(0,[context["dom"].node.textContent]);
            }
        }
    },
    {
        id: "ButtonEnd",
        context: "aria:/button",
        run: (context: RuleContext, options?: { [key: string]: any }): RuleResult | RuleResult[] => {
            if (options.mode === "ITEM" || options.mode === "LINK") {
                return RuleRender(0);
            }
        }
    },
    {
        id: "Headings",
        context: "aria:heading",
        run: (context: RuleContext, options?: { [key: string]: any }): RuleResult | RuleResult[] => {
            if (options.mode === "ITEM") {
                return RuleRender(0,[context["dom"].node.nodeName.substring(1)]);
            }
        }
    },
    {
        id: "Textbox",
        context: "aria:textbox",
        run: (context: RuleContext, options?: { [key: string]: any }): RuleResult | RuleResult[] => {
            if (options.mode === "ITEM" || options.mode === "LINK") {
                let elem = context["dom"].node as Element;
                return RuleRender(0,[
                    options.mode === "ITEM"?"":context["aria"].attributes.name,
                    (elem.nodeValue || elem.getAttribute("placeholder") || "")]);
            }
        }
    },
    {
        id: "TextRule",
        context: "aria:document !dom:script aria:text",
        run: (context: RuleContext, options?: { [key: string]: any }): RuleResult | RuleResult[] => {
            if (options.mode === "ITEM") {
                return RuleRender(0,[DOMUtil.cleanWhitespace(context["dom"].node.nodeValue)]);
            }
        }
    },
    {
        id: "ImgRule",
        context: "aria:document dom:img",
        run: (context: RuleContext, options?: { [key: string]: any }): RuleResult | RuleResult[] => {
            if (options.mode === "ITEM") {
                const elem = context["dom"].node as Element;
                return RuleRender(0,[elem.getAttribute("alt") || "NOALT"]);
            }
        }
    },
    {
        id: "EndBlock",
        context: "css:/computed[display~block]",
        run: (context: RuleContext, options?: { [key: string]: any }): RuleResult | RuleResult[] => {
            if (options.mode === "ITEM") {
                return RuleRender(0);
            }
        }
    },
    {
        id: "EndLink",
        context: "aria:/link,aria:/button,aria:/textbox",
        run: (context: RuleContext, options?: { [key: string]: any }): RuleResult | RuleResult[] => {
            if (options.mode === "LINK") {
                return RuleRender(0);
            }
        }
    }]
export { simRules }