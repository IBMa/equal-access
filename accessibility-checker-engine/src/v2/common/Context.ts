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

import { IMapResult } from "../api/IMapper";
import { RuleContextHierarchy } from "../api/IEngine";

// Context that will cause this rule to execute. 
// Context syntax:
//   Triggers:
//     aria:role - Triggers on element with ARIA role role
//     aria:role[attribute] - Triggers on elements with the equivalent logical 
//       aria- attribute (e.g., button[disabled] will trigger on 
//       <button disabled> or <div role="button" aria-disabled="true">)
//     role[attribute=value] - Similar to above, with case-sensitive match
//       to value
//     role[attribute~value] - Similar to above, with case-insensitive match
//     dom:element - Triggers on an element with the specified name
//     dom:element[attribute] - Triggers on a dom element with the specified attribute
//     dom:*[attribute] - Triggers on all elements with the specified attribute
//   Combining triggers:
//     trigger1 trigger2 - Triggers on elements with trigger2 within an 
//       element with trigger1
//     !trigger1 trigger2 - Triggers on elements with trigger2 not within
//       element with trigger1
//     trigger1>trigger2 - Triggers on elements with trigger2 with an
//       an immediate parent with trigger1
//     trigger1+trigger2 - Triggers on elements with trigger2 with an
//       immediate previous sibling with trigger1
//     trigger1~trigger2 - Triggers on elements with trigger2 with an
//       some earlier sibling with trigger1
//     context,context - Triggers on elements with either context
export class AttrInfo {
    constructor(
        public inclusive: boolean,
        public attr: string,
        public eq?: string,
        public value?: string
    ) {
        if (!inclusive 
                && ((typeof eq) !== "undefined" && eq.length > 0))
        {
            throw new Error("Cannot have !attr"+eq+" context");    
        }
        if (inclusive && (typeof eq) !== "undefined" && eq.length > 0 && ((typeof value) === "undefined" || value.length === 0)) {
            throw new Error("Cannot have equivalence check without a value");    
        }
    }

    public matches(context: IMapResult) {
        const ruleAttrPart = this; 
        const elemAttrs = context.attributes;
        if (!(ruleAttrPart.attr in elemAttrs)) {
            return !ruleAttrPart.inclusive
        } else if (!ruleAttrPart.inclusive) {
            return false;
        } else if (!ruleAttrPart.eq) {
            // inclusive match and I have that attribute and no equivalence defined
            return true;
        } else {
            // inclusive match and I have that attribute and equivalence defined
            const attrValue = elemAttrs[ruleAttrPart.attr];
            if (ruleAttrPart.eq === "=") {
                return ruleAttrPart.value === attrValue;
            } else if (ruleAttrPart.eq === "!=") {
                return ruleAttrPart.value !== attrValue;
            } else if (ruleAttrPart.eq === "~") {
                return ruleAttrPart.value === attrValue;
            } else if (ruleAttrPart.eq === "!~") {
                return ruleAttrPart.value !== attrValue;
            } else {
                throw new Error("Context equivalence operator not supported")
            }
        }
    }
}

export class PartInfo {
    constructor(
        public inclusive: boolean, 
        public namespace: string,
        public role: string, 
        public attrs: AttrInfo[], 
        public connector: string) {
            if (role === "*" && !inclusive) {
                throw new Error("!* context not supported");
            }
        }

    public matches( 
        contextHier: RuleContextHierarchy,
        hierLevel: number) : boolean 
    {
        const rulePart = this;
        let ruleRoleMatch = (rulePart.namespace in contextHier) && contextHier[rulePart.namespace][hierLevel]
            && (contextHier[rulePart.namespace][hierLevel].role === rulePart.role
                || contextHier[rulePart.namespace][hierLevel].role !== "none" && rulePart.role === "*");
        if (ruleRoleMatch 
            && rulePart.role === "*" 
            && rulePart.namespace === "dom" 
            && (contextHier[rulePart.namespace][hierLevel].role === "#text"
                || contextHier[rulePart.namespace][hierLevel].role === "/#text")) {
            ruleRoleMatch = false;
        }
        if (rulePart.inclusive && !ruleRoleMatch) return false;
        if (!rulePart.inclusive && !ruleRoleMatch) return true;

        // Match the attributes
        const ruleAttrs = rulePart.attrs;
        const elemContext = contextHier[rulePart.namespace][hierLevel];
        let match = true;
        for (const ruleAttrPart of ruleAttrs) {
            match = match && ruleAttrPart.matches(elemContext);
        }
        if (!rulePart.inclusive) match = !match;
        return match;
    }

}

export class Context {
    contextInfo : PartInfo[] = []

    constructor(context: string) {
        let contextHierMatches : string[] = context.match(/!?[/a-zA-Z:0-9*\-_]+(\[[^\]]+\])*[ >+~]?/g);
        let results : PartInfo[] = []
        for (const part of contextHierMatches) {
            let parts = part.match(/(!?)([/a-zA-Z:0-9*\-_]+)((\[[^\]]+\])*)([ >+~]?)/);
            let attrInfo : AttrInfo[] = [];
            for (const attrPart of parts[3].match(/\[([^\]]+)\]/g) || []) {
                let attrParts = attrPart.match(/\[(!?)([a-z:A-Z*\-_]+)(!?[=~])?([^\]]+)?\]/);
                attrInfo.push(new AttrInfo(
                    attrParts[1] !== "!",
                    attrParts[2].toLowerCase(),
                    attrParts[3],
                    attrParts[4]
                ));
            }
            parts[2] = parts[2].toLowerCase();
            const nsParts = parts[2].split(":");
            let incl = parts[1] !== "!";
            const ns = nsParts.shift();
            let role = nsParts.join(":");
            let partInfo = new PartInfo(incl, ns, role, attrInfo, parts[parts.length-1]);
            results.push(partInfo);
        }
        this.contextInfo = results;
    }

    static cleanContext(context: string) : string {
        context = context.toLowerCase().trim();
        context = context.replace(/ +!/g, " !");
        context = context.replace(/ +([>+~,])/g, "$1");
        context = context.replace(/([>+~,]) +/g, "$1");
        context = context.replace(/ +/g, " ");
        return context.trim();
    }

    static parse(context: string) {
        let contexts = Context.splitMultiple(Context.cleanContext(context));

        let retVal : Context[] = [];

        for (let i = 0; i < contexts.length; ++i) {
            let ctx = new Context(contexts[i]);
            retVal.push(ctx);
        }
        return retVal;
    }

    /**
     * Handles initial processing of splitting on comma - context,context
     * @param context 
     */
    static splitMultiple(context: string) : string[] {
        let contexts = [];
        if (context) {
            if (context.indexOf(",") === -1) {
                contexts.push(context);
            } else {
                for (const c of context.split(",")) {
                    contexts.push(c);
                }
            }
        }
        return contexts;
    }
}