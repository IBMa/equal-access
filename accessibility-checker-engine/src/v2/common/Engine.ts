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

import { DOMWalker } from "../dom/DOMWalker";
import { Context } from "./Context";
import { Config } from "../config/Config";
import { DOMMapper } from "../dom/DOMMapper";
import { DOMUtil } from "../dom/DOMUtil";
import { CacheUtil } from "../../v4/util/CacheUtil";
import { Issue, Rule, RuleContext, RuleContextHierarchy, RuleResult, eRuleConfidence } from "../../v4/api/IRule";
import { HelpMap, IEngine, NlsMap } from "../../v4/api/IEngine";
import { IMapper } from "../../v4/api/IMapper";
import { Report } from "../../v4/api/IReport";
import { VisUtil } from "../../v4/util/VisUtil";

class WrappedRule {
    ns: string;
    idx?: number;

    constructor (public rule: Rule, public parsedInfo : Context) {
        this.ns = this.parsedInfo.contextInfo[this.parsedInfo.contextInfo.length-1].namespace;
        Config.DEBUG && console.log("Added Rule:", rule.id, JSON.stringify(this.parsedInfo));
    }

    /**
     * This function is responsible converting the node into a snippet which can be added to report.
     *
     * Note: This function will take the node and extract the node name and the attributes and build the snippet based on this.
     *
     * TODO: Future, maybe we can extract more then just single line, add more info or even add closing tags etc...
     *
     * @param {HTMLElement} node - The html element to convert into element snippet with node name and attributes only.
     *
     * @return {String} nodeSnippet - return the element snippet of the element that was provided which only contains,
     *                                nodename and attributes. i.e. <table id=\"layout_table1\" role=\"presentation\">
     *
     * @memberOf this
     */
    static convertNodeToSnippet(node : Element) {
        // Variable Decleration
        var nodeSnippet = '';

        // Extract the node name and add it to the node snippet
        nodeSnippet += '<' + node.nodeName.toLowerCase();

        // Extract all the node attributes as an array
        var nodeAttributes = node.attributes;

        // In the case there are attributes on this node
        if (nodeAttributes !== null && typeof nodeAttributes !== 'undefined') {

            // Loop over all theses attributes and add the name and value to the nodeSnippet which will be returned
            for (var i = nodeAttributes.length - 1; i >= 0; i--) {
                if (nodeAttributes[i].name === "data-namewalk") continue;
                // Add the attribute name and value.
                nodeSnippet += ' ' + nodeAttributes[i].name + '="' + nodeAttributes[i].value + '"';
            }
        }

        // Close the node
        nodeSnippet += '>';

        // Return the node snippet
        return nodeSnippet;
    }

    /**
     * This function is responsible for finding the source location for a node, which can be added to a report.
     * Supports debug directives in the following forms:
     *   1. An attribute on the element itself:
     *        ibm-a11y-debug="file.ts:10:5"
     *   2. A comment node preceding the element (as a sibling or ancestor sibling):
     *        <!-- ibm-a11y-debug: file.ts:10:5 -->
     *   3. A wrapper element (e.g. div) whose first non-whitespace child is such a comment node.
     *   4. An ancestor element that carries the ibm-a11y-debug attribute.
     *
     * Traversal: checks the node itself for an inline attribute, then scans previous siblings at
     * each ancestor level upward (also checking each ancestor element's own inline attribute),
     * stopping if a blank or 'end' marker is found.
     *
     * @param {Node} node - The DOM node to find source info for
     * @return {string | null} - The source location string, or null if not found
     *
     * @memberOf this
     */
    static convertNodeToSource(node: Node, enabled: boolean=false): string {
        //console.log("Source Map enabled:", enabled);
        if (!enabled || !node) return null;
        
        const DEBUG_DIRECTIVE = "ibm-a11y-debug";

        /**
         * Typed result from extractDirective to avoid sentinel string collisions.
         *   { found: false }            — no directive on this node
         *   { found: true, stop: true } — directive is a scope-end marker (blank or 'end')
         *   { found: true, stop: false, source: string } — valid source location
         */
        type DirectiveResult =
            | { found: false }
            | { found: true; stop: true }
            | { found: true; stop: false; source: string };

        /**
         * Parses a source string into a DirectiveResult.
         * The source is the final resolved value — after any ':' separator has already been stripped.
         * A blank value or the exact word 'end' (case-insensitive) is a stop marker.
         */
        const parseSource = function (source: string): DirectiveResult {
            if (!source || source.toLowerCase() === 'end') {
                return { found: true, stop: true };
            }
            return { found: true, stop: false, source };
        };

        /**
         * Extracts the debug-directive comment value from a node.
         * Handles:
         *   - A comment node directly
         *   - A wrapper element (e.g. <div>) whose first non-whitespace child is a comment node
         *
         * Returns { found: true, stop: true } if the directive is blank or exactly 'end',
         * returns { found: true, stop: false, source } if a valid source is found,
         * or returns { found: false } if no directive is present on this node.
         */
        const extractDirective = function (elem: Node | null): DirectiveResult {
            if (!elem) return { found: false };

            let commentValue: string | null = null;

            if (elem.nodeType === Node.COMMENT_NODE) {
                // Direct comment node
                commentValue = elem.nodeValue;
            } else if (elem.nodeType === Node.ELEMENT_NODE) {
                // Element wrapper (e.g. <div><!-- ibm-a11y-debug: ... --></div>)
                // Find the first non-whitespace child node
                let child = elem.firstChild;
                while (child) {
                    if (child.nodeType === Node.TEXT_NODE) {
                        // Skip pure whitespace text nodes
                        if (child.nodeValue && child.nodeValue.trim().length > 0) {
                            // Non-whitespace text before a comment — not a directive wrapper
                            break;
                        }
                    } else if (child.nodeType === Node.COMMENT_NODE) {
                        commentValue = child.nodeValue;
                        break;
                    } else {
                        // Any other node type before a comment — not a directive wrapper
                        break;
                    }
                    child = child.nextSibling;
                }
            }

            if (commentValue !== null) {
                const trimmed = commentValue.trim();
                // Match exactly "ibm-a11y-debug" followed by end-of-string, whitespace, or ':'
                // This prevents "ibm-a11y-debug-extra" from being treated as a directive.
                if (trimmed === DEBUG_DIRECTIVE ||
                    trimmed.startsWith(DEBUG_DIRECTIVE + ':') ||
                    trimmed.startsWith(DEBUG_DIRECTIVE + ' ') ||
                    trimmed.startsWith(DEBUG_DIRECTIVE + '\t')) {
                    // Strip the directive name and optional leading whitespace
                    const afterDirective = trimmed.substring(DEBUG_DIRECTIVE.length).trimStart();
                    // Strip a single leading ':' separator if present
                    // (e.g. "ibm-a11y-debug: file.ts:10:5" → afterDirective = ": file.ts:10:5")
                    const source = afterDirective.startsWith(':')
                        ? afterDirective.substring(1).trim()
                        : afterDirective.trim();
                    return parseSource(source);
                }
            }

            return { found: false };
        };

        /**
         * Returns the ibm-a11y-debug attribute value from an element node as a DirectiveResult,
         * or { found: false } if absent. Recognises the 'end' stop marker just like comment directives.
         * The attribute value is the source directly (no ':' prefix), e.g. ibm-a11y-debug="file.ts:10:5".
         */
        const getInlineAttr = function (n: Node): DirectiveResult {
            if (n.nodeType !== Node.ELEMENT_NODE) return { found: false };
            const val = (n as Element).getAttribute(DEBUG_DIRECTIVE);
            if (val === null) return { found: false };
            // Attribute value is the source directly — no ':' separator to strip
            return parseSource(val.trim());
        };

        /**
         * Traverses left (previous siblings) then upward (parent) to find source info.
         * Does NOT check the starting element itself — only its preceding siblings and ancestors.
         * This avoids misidentifying a content node as its own source directive.
         *
         * At each ancestor level the function also checks the ancestor element's own inline
         * ibm-a11y-debug attribute, so that a parent element can annotate all its descendants.
         *
         * Sibling scanning stops at the first node that is recognised as a directive (found or stop).
         * Non-directive nodes (real content elements, text nodes) are skipped so that a directive
         * placed further back in the sibling list is still found even if content nodes intervene.
         * However, traversal does NOT cross element boundaries when scanning siblings — only
         * comment nodes and dedicated wrapper elements (whose sole first child is a comment) are
         * treated as transparent.
         *
         * Shadow DOM traversal: uses DOMWalker.parentNode() to cross shadow boundaries correctly,
         * including slotted content and nested Shadow DOM (shadow-in-shadow). When the parent
         * chain reaches a ShadowRoot, DOMWalker.parentNode() automatically resolves it to the
         * shadow host element in the outer DOM. A plain DocumentFragment with no host returns
         * null from DOMWalker.parentNode(), stopping traversal.
         *
         * Sibling traversal uses DOMWalker.previousSiblingNotOwnedBySlot() to skip nodes that
         * are assigned to slots (and therefore logically belong to a different part of the tree).
         *
         * Uses an iterative approach (rather than recursion) to safely handle deeply nested
         * DOM structures without risk of stack overflow.
         *
         * @param elem - The node whose context we are searching
         * @returns The source location string, or null if not found
         */
        const findSource = function (elem: Node | null): string | null {
            let current = elem;
            while (current) {
                // Scan previous siblings for a debug directive comment or wrapper element.
                // Use previousSiblingNotOwnedBySlot to skip nodes assigned to slots, which
                // logically belong to a different part of the composed tree.
                // Only comment nodes and dedicated wrapper elements are considered directives;
                // all other node types are skipped (they do not block further scanning).
                let prev = DOMWalker.previousSiblingNotOwnedBySlot(current);
                while (prev) {
                    const result = extractDirective(prev);
                    if (result.found) {
                        if (result.stop) return null;
                        return (result as { found: true; stop: false; source: string }).source;
                    }
                    prev = DOMWalker.previousSiblingNotOwnedBySlot(prev);
                }

                // No directive found among siblings — move up to parent.
                // Use DOMWalker.parentNode() instead of node.parentNode directly so that:
                //   1. Shadow DOM boundaries are crossed automatically (ShadowRoot → host element),
                //      supporting both regular and nested Shadow DOM (shadow-in-shadow).
                //   2. Slotted nodes are re-parented to their slot owner rather than their
                //      light-DOM parent, matching the composed (rendered) tree structure.
                //   3. Nodes with an ownerElement (e.g. iframe document roots) are re-parented
                //      to their owner element.
                const parent = DOMWalker.parentNode(current);

                if (!parent || parent.nodeType === Node.DOCUMENT_NODE) {
                    // Reached the top of the tree (or a plain DocumentFragment with no host)
                    // without finding a directive.
                    return null;
                }

                // Check the parent element's own inline attribute before continuing upward.
                // This allows a containing element to annotate all its descendants.
                // An 'end' inline attribute on the parent stops traversal entirely.
                const parentAttrResult = getInlineAttr(parent);
                if (parentAttrResult.found) {
                    if (parentAttrResult.stop) return null;
                    return (parentAttrResult as { found: true; stop: false; source: string }).source;
                }

                current = parent;
            }
            return null;
        };

        // First, check for an inline attribute directive on the element itself.
        // An 'end' attribute on the element itself stops traversal (returns null).
        const selfAttrResult = getInlineAttr(node);
        if (selfAttrResult.found) {
            if (selfAttrResult.stop) return null;
            return (selfAttrResult as { found: true; stop: false; source: string }).source;
        }

        // Then traverse the DOM to find a preceding comment directive or ancestor attribute
        return findSource(node);
    }

    run(engine: Engine, context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy) : Issue[] {
        const startTime = new Date().getTime();
        let results: RuleResult | RuleResult[];
        try {
            results = this.rule.run(context, options, contextHierarchies);
        } catch (e) {
            const err: Error = e;
            console.error("RULE EXCEPTION:",this.rule.id, context.dom.rolePath, err.stack);
            throw e;
        }
        const endTime = new Date().getTime();
        if (!results) results = [];

        if (!(results instanceof Array)) {
            results = [results];
        }
        let retVal : Issue[] = [];
        for (const result of results) {
            const message = engine.getMessage(this.rule.id, result.reasonId, result.messageArgs);
            const path = {};
            for (const ns in context) {
                path[ns] = context[ns].rolePath
            }
            const ruleId = this.rule.id.replace(/^(.*)\$\$\d+$/, "$1");

            retVal.push({
                ruleId: ruleId,
                value: result.value,
                node: context["dom"].node,
                path: path,
                ruleTime: endTime-startTime,
                reasonId: result.reasonId,
                message: message,
                messageArgs: result.messageArgs,
                apiArgs: result.apiArgs,
                bounds: context["dom"].bounds,
                snippet: WrappedRule.convertNodeToSnippet(context["dom"].node as Element),
                source: WrappedRule.convertNodeToSource(context["dom"].node as Element, engine.isSourceMapEnabled())
            })
        }
        return retVal;
    }
}

export class Engine implements IEngine {
    public static getLanguages() {
        const env = typeof process !== "undefined" && typeof (process as any).nodeType === "undefined" && process.env;
        // If all else fails, default to US English
        let nodeLang = "en-US";
        if (env) {
            nodeLang = env.LANG || env.LANGUAGE || env.LC_ALL || env.LC_MESSAGES;
            if (nodeLang && nodeLang.length > 0) {
                nodeLang = nodeLang.split(".")[0].replace(/_/g,"-");
            } else {
                nodeLang = "en-US";
            }
        }
        return typeof navigator !== "undefined" && navigator.languages || [nodeLang];
    }
    mappers : { [namespace: string] : IMapper } = {};
    ruleMap : { [id: string]: Rule } = {};
    wrappedRuleMap : { [id: string]: WrappedRule } = {};
    nlsMap : NlsMap = {}
    helpMap : HelpMap = {}
    sourceMapEnabled: boolean = false;

    private inclRules: {
        [nsRole: string]: WrappedRule[]
    } = {}

    private exclRules: {
        [nsRole: string]: WrappedRule[]
    } = {}

    constructor() {
        // Need a DOM Mapper as a minimum
        this.addMapper(new DOMMapper());
    }

    run(root: Document | Node, options?: {}): Promise<Report> {
        if (root === null) {
            return Promise.reject("null document");
        }
        if (root.nodeType === 9 /* Node.DOCUMENT_NODE */) {
            root = (root as Document).documentElement;
        }
        root.ownerDocument && ((root.ownerDocument as any).PT_CHECK_HIDDEN_CONTENT = false);
        const numNodesVisited = CacheUtil.clearCaches(root);
        const walker = new DOMWalker(root, false, root, true);
        const retVal : Report = {
            results: [],
            numExecuted: 0,
            ruleTime: 0,
            totalTime: 0
        }
        const start = new Date().getTime();        
        // Reset the role mappers
        for (const namespace in this.mappers) {
            this.mappers[namespace].reset(root);
        }

        // Initialize the context detector
        let currentNodeCount = 0;
        let lastReportedPercent = -1;
        do {
            currentNodeCount++;
            
            // Report progress at each percentage milestone
            const currentPercent = Math.floor((currentNodeCount / numNodesVisited) * 100);
            if (currentPercent > lastReportedPercent) {
                if (numNodesVisited > 10000) {
                    // if (currentPercent > 6) break;
                    console.log(`Progress: ${currentPercent}% (${currentNodeCount}/${numNodesVisited} nodes)`);
                    // const ruleTimes = retVal.results.reduce((prev, cur) => {
                    //     prev[cur.ruleId] = (prev[cur.ruleId] || 0)+cur.ruleTime;
                    //     return prev;
                    // }, {});
                    // for (const ruleId in ruleTimes) {
                    //     if (ruleTimes[ruleId] > 10000) {
                    //         console.log(`${ruleId}: ${ruleTimes[ruleId]}`);
                    //     }
                    // }
                    // console.groupEnd();
                }
                lastReportedPercent = currentPercent;
            }
            // Get the context information from the rule mappers
            const contextHierarchies : RuleContextHierarchy = {};
            for (const namespace in this.mappers) {
                if (!walker.bEndTag) {
                    contextHierarchies[namespace] = this.mappers[namespace].openScope(walker.node);
                    // if (namespace === "dom" && walker.node.nodeType === 1 /* Node.ELEMENT_NODE */) {
                        // const elem = walker.node as Element;
                        // let id;
                        // if (elem.hasAttribute("id") && (id = elem.getAttribute("id").trim()).length > 0) {
                            // if (root.ownerDocument.getElementById(id) === elem) {
                                // contextHierarchies["dom"][contextHierarchies["dom"].length-1].rolePath = "//*[@id='"+id+"']";
                            // }
                        // }
                    // }
                } else {
                    contextHierarchies[namespace] = this.mappers[namespace].closeScope(walker.node);
                }
            }
            
            if (walker.node.nodeType !== 11 
                && (VisUtil.isNodeVisible(walker.node)
                    // || walker.node.nodeName.toLowerCase() === "head"
                    || walker.node.nodeName.toLowerCase() === "meta"
                    || walker.node.nodeName.toLowerCase() === "style"
                    || walker.node.nodeName.toLowerCase() === "datalist"
                    || walker.node.nodeName.toLowerCase() === "param"
                    || !DOMUtil.getAncestor(walker.node, ["body"])
                )
            ) {
                let context : RuleContext = {};
                for (const ns in contextHierarchies) {
                    const nsHier = contextHierarchies[ns];
                    const lastHier = nsHier[nsHier.length-1];
                    context[ns] = lastHier; 
                }

                let matchingRules = this.getMatchingRules(contextHierarchies);
                let depMatch = {}
                for (const matchingRule of matchingRules) {
                    let fulfillsDependencies = true;
                    for (const dep of matchingRule.rule.dependencies || []) {
                        if (!depMatch[dep]) fulfillsDependencies = false;
                    }
                    if (fulfillsDependencies) {
                        let results : Issue[] = [];
                        let start = new Date().getTime();
                        try {
                            results = matchingRule.run(this, context, options, contextHierarchies);
                        } catch (err) {
                            // Wrapper shows error in console. Skip this rule as N/A
                            // We don't want to kill the engine
                        }
                        // If out of scope, it fulfills the dependency
                        if (results.length === 0) {
                            depMatch[matchingRule.rule.id] = true;
                        }
                        for (const result of results) {
                            retVal.results.push(result);
                            retVal.ruleTime += result.ruleTime;
                            retVal.numExecuted++;
                            if (result.value[1] === eRuleConfidence.PASS) {
                                depMatch[result.ruleId] = true;
                            }
                        }
                    }
                }
            }
        } while (walker.nextNode());
        CacheUtil.clearCaches(root);
        retVal.totalTime = new Date().getTime()-start;
        return Promise.resolve(retVal);
    }

    enableRules(ruleIds: string[]) {
        for (const ruleId in this.ruleMap) {
            this.ruleMap[ruleId].enabled = false;
        }
        for (const ruleId of ruleIds || []) {
            if (!(ruleId in this.ruleMap)) {
                console.warn("WARNING: Rule Id",ruleId,"could not be enabled.");
            } else {
                this.ruleMap[ruleId].enabled = true;
            }
        }
    }

    getRule(ruleId: string): Rule {
        return this.ruleMap[ruleId];
    }

    getRulesIds() : string[] {
        let retVal = [];
        for (const ruleId in this.ruleMap) {
            retVal.push(ruleId);
        }
        return retVal;
    }

    addRules(rules: Rule[]) {
        for (const rule of rules) {
            this.addRule(rule, true);
        }
        this._sortRules();
    }

    addRule(rule: Rule, skipSort?: boolean) {
        let ctxs :Context[] = Context.parse(rule.context);
        let idx = 0;
        const ruleId = rule.id;
        if (ruleId in this.ruleMap) {
            console.log("WARNING: Rule",ruleId,"already added to engine. Ignoring...");
            return;
        }
        this.ruleMap[ruleId] = rule;
        for (const ctx of ctxs) {
            let wrapId = ruleId;
            if (idx >= 1) {
                wrapId = ruleId+"$$"+idx;
            }
            ++idx;
            let wrappedRule = new WrappedRule(rule,ctx);
            this.wrappedRuleMap[wrapId] = wrappedRule;
            let parts = wrappedRule.parsedInfo.contextInfo;
            let lastPart = parts[parts.length-1];
            let triggerRole = lastPart.namespace+":"+lastPart.role;
            if (lastPart.inclusive) {
                this.inclRules[triggerRole] = this.inclRules[triggerRole] || [];
                this.inclRules[triggerRole].push(wrappedRule);
            } else {
                this.exclRules[triggerRole] = this.exclRules[triggerRole] || [];
                this.exclRules[triggerRole].push(wrappedRule);
            }
        }
        if (!skipSort) {
            this._sortRules();
        }
    }

    enableSourceMap(enable: boolean) {
        this.sourceMapEnabled = enable;
    }

    isSourceMapEnabled() : boolean {
        return this.sourceMapEnabled;
    }
    
    _sortRules() {
        for (const role in this.inclRules) {
            this.inclRules[role].sort((ruleA: WrappedRule, ruleB: WrappedRule) => {
                const hasDepA = ruleA.rule.dependencies && ruleA.rule.dependencies.length > 0;
                const hasDepB = ruleB.rule.dependencies && ruleB.rule.dependencies.length > 0;
                // If B depends on A, sort A before B
                if (hasDepB && ruleB.rule.dependencies.includes(ruleA.rule.id)) return -1;
                // If A depends on B, sort B before A
                if (hasDepA && ruleA.rule.dependencies.includes(ruleB.rule.id)) return 1;
                // Otherwise, doesn't matter
                return 0;
            });
        }
        for (const role in this.exclRules) {
            this.exclRules[role].sort((ruleA: WrappedRule, ruleB: WrappedRule) => {
                const hasDepA = ruleA.rule.dependencies && ruleA.rule.dependencies.length > 0;
                const hasDepB = ruleB.rule.dependencies && ruleB.rule.dependencies.length > 0;
                // If B depends on A, sort A before B
                if (hasDepB && ruleB.rule.dependencies.includes(ruleA.rule.id)) return -1;
                // If A depends on B, sort B before A
                if (hasDepA && ruleA.rule.dependencies.includes(ruleB.rule.id)) return 1;
                // Otherwise, doesn't matter
                return 0;
            });
        }
    }

    addNlsMap(map: NlsMap) {
        for (const key in map) {
            this.nlsMap[key] = map[key];
        }
    }

    addHelpMap(map: HelpMap) {
        for (const key in map) {
            this.helpMap[key] = map[key];
        }
    }

    getMessage(ruleId: string, ruleIdx: number | string, msgArgs?: string[]): string {
        let splitter = ruleId.indexOf("$$");
        if (splitter >= 0) {
            ruleId = ruleId.substring(0,splitter);
        }
        if (!(ruleId in this.nlsMap)) return ruleId;
        let messageTemplate = this.nlsMap[ruleId][ruleIdx || 0];
        if (!messageTemplate) return ruleId+"_"+ruleIdx;
        return messageTemplate.replace(/\{(\d+)\}/g,
            (matchedStr, matchedNum, matchedIndex) => msgArgs[matchedNum]
        );
    }

    getHelp(ruleId: string, reasonId: number | string, archiveId?: string): string {
        if (!archiveId) {
            // Set to the latest
            archiveId = "latest";
        }
        return `${Config.helpRoot}/${archiveId}/doc${this.getHelpRel(ruleId, reasonId)}`;
    }

    getHelpRel(ruleId: string, ruleIdx: number | string): string {
        let splitter = ruleId.indexOf("$$");
        if (splitter >= 0) {
            ruleId = ruleId.substring(0,splitter);
        }
        if (!(ruleId in this.helpMap)) return ruleId;
        ruleIdx = ruleIdx || 0;
        let helpStr = null;
        if (ruleIdx in this.helpMap[ruleId]) {
            helpStr = this.helpMap[ruleId][ruleIdx || 0];
        } else {
            helpStr = this.helpMap[ruleId][0];
        }

        if (!helpStr) return ruleId+"_"+ruleIdx;
        return helpStr;
    }

    addMapper(mapper: IMapper) {
        this.mappers[mapper.getNamespace()] = mapper;
    }

    private static match(rule: WrappedRule,
        contextHier: RuleContextHierarchy) : boolean
    {
        let ruleParts = rule.parsedInfo.contextInfo;
        let partIdx = ruleParts.length-1;
        let curNS = ruleParts[partIdx].namespace;
        let curHier = contextHier[curNS][contextHier[curNS].length-1];
        const contextNode = curHier.node;

        // If the end of the rule part doesn't match the end of the hierarchy, we don't have a match
        if (!ruleParts[partIdx].matches(contextHier, contextHier[curNS].length-1)) {
            return false;
        }
        // If there was only one part, we have a match
        if (ruleParts.length === 1) {
            return true;
        }
        // Need to deal with parent parts. To walk the hierarchy, these need to be
        // all in the same namespace. Confirm that is true.
        curNS = ruleParts[0].namespace;
        curHier = contextHier[curNS][contextHier[curNS].length-1];
        --partIdx;
        if (ruleParts.slice(0, ruleParts.length-1).some(part => part.namespace !== curNS)) {
            console.error(`[ERROR] Rule ${rule.rule.id} has inconsitent parent namespaces`);
            return false;
        }
        // If the target node matches the end of the hierarchy, move up past it, otherwise, start at the end
        let hierIdx = contextHier[curNS].length - (curHier.node.isSameNode(contextNode) ? 2 : 1);
        while (hierIdx >= 0 && partIdx >= 0) {
            const part = ruleParts[partIdx];
            const matchesPart = ruleParts[partIdx].matches(contextHier, hierIdx);
            if (part.connector === ">") {
                if (!matchesPart) {
                    // Direct parent check and doesn't match
                    return false;
                } else {
                    // Direct parent check and does match
                    --partIdx;
                    --hierIdx;
                }
            } else if (part.connector === " ") {
                if (part.inclusive) {
                    // inclusive ancestor match
                    if (matchesPart) {
                        --partIdx;
                    }
                    // If doesn't match, just move up the role hierarchy
                    --hierIdx;
                } else if (!matchesPart) {
                    // exclusive ancestor match and current matches
                    return false;
                } else {
                    // exclusive ancestor match and current doesn't match - check for other ancestors
                    let parentMatch = false;
                    for (let searchIdx = hierIdx-1; !parentMatch && searchIdx >= 0; --searchIdx) {
                        parentMatch = !ruleParts[partIdx].matches(contextHier, searchIdx);
                    }
                    if (parentMatch) return false;
                    else --partIdx;
                }
            } else {
                throw new Error("Context connector "+part.connector+" is not supported");
            }
        }
        return partIdx === -1;
    }

    private getMatchingRules(ctxHier : RuleContextHierarchy) : WrappedRule[] {
        let matches : WrappedRule[] = [];
        function addMatches(rules: WrappedRule[]) {
            for (const rule of rules) {
                if (rule.rule.enabled && Engine.match(rule, ctxHier)) {
                    matches.push(rule);
                }
            }
        }
        for (const ns in ctxHier) {
            let role = ns+":"+(ctxHier[ns].length > 0 ? ctxHier[ns][ctxHier[ns].length-1].role : "none");
            if (role in this.inclRules) {
                addMatches(this.inclRules[role]);
            }
            for (const xRole in this.exclRules) {
                if (xRole !== role) {
                    addMatches(this.exclRules[xRole]);
                }
            }
            if (role !== ns+":none") {
                if (role.startsWith(ns+":/")) {
                    if (ns+":/*" in this.inclRules) {
                        addMatches(this.inclRules[ns+":/*"])
                    }
                } else {
                    if (ns+":*" in this.inclRules) {
                        addMatches(this.inclRules[ns+":*"])
                    }
                }
            }
        }
        return this.sortDeps(matches);
    }

    /**
     * Sorts the rules in order to execute dependencies in the correct order
     * @param inRules List of wrapped rules to sort
     * @returns Sorted list of wrapped rules
     */
    sortDeps(inRules: WrappedRule[]) {
        let depRules: WrappedRule[] = [];
        for (const rule of inRules) {
            depRules.push(rule);
        }
        
        let retVal : WrappedRule[] = [];
        let idToRule = {};
        // Iterate through the rules. If that rule's dependencies can be met by rules already in the list, add it to the list
        // Repeat until no changes are made to the satisfied list
        // If a rule cannot be satisfied, it will never execute, so it can be dropped.
        let change = false;
        do {
            change = false;
            for (let idx=0; idx<depRules.length; ++idx) {
                const depRule = depRules[idx];
                if (depRule.rule.id in idToRule) continue;
                let allMatch = true;
                if (depRule.rule.dependencies && depRule.rule.dependencies.length > 0) {
                    for (const depId of depRule.rule.dependencies) {
                        if (!(depId in idToRule)) {
                            allMatch = false;
                        }
                    }
                }
                // if (depRule.rule.prereqs && depRule.rule.prereqs.length > 0) {
                //     for (const depId of depRule.rule.prereqs) {
                //         if (!(depId in idToRule)) {
                //             allMatch = false;
                //         }                        
                //     }
                // }
                if (allMatch) {
                    change = true;
                    retVal.push(depRule);
                    idToRule[depRule.rule.id] = true;
                    depRules.splice(idx--, 1);
                }
            }
        } while (change);
        return retVal;
    }
}