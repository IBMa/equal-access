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

import { ARIADefinitions } from "../../v2/aria/ARIADefinitions";
import { CacheUtil } from "./CacheUtil";
import { RuleContextHierarchy } from "../api/IRule";
import { AriaUtil } from "./AriaUtil";
import { VisUtil } from "./VisUtil";
import { DOMUtil } from "../../v2/dom/DOMUtil";
import { DOMWalker } from "../../v2/dom/DOMWalker";
import { NodeWalker } from "../../v2/dom/NodeWalker";
import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";

export class CommonUtil {

    public static tabTagMap = {
        "button": function (element): boolean {
            return !element.hasAttribute("disabled");
        },
        "iframe": true,
        "input": function (element): boolean {
            return element.getAttribute("type") !== "hidden" && !element.hasAttribute("disabled");
        },
        "select": function (element): boolean {
            return !element.hasAttribute("disabled");
        },
        "textarea": true,
        "div": function (element) {
            return element.hasAttribute("contenteditable");
        },
        "a": function (element) {
            // xlink:href?? see svg
            return element.hasAttribute("href");
        },
        "area": function (element) {
            return element.hasAttribute("href");
        },
        "audio": function (element) {
            return element.hasAttribute("controls");
        },
        "video": function (element) {
            return element.hasAttribute("controls");
        },
        "summary": function (element) {
            // first summary child of a details element is automatically focusable 
            return element.parentElement && element.parentElement.nodeName.toLowerCase() === 'details'
                && DOMUtil.sameNode([...element.parentElement.children].filter(elem => elem.nodeName.toLowerCase() === 'summary')[0], element);
        },
        "details": function (element) {
            //details element without a direct summary child is automatically focusable
            return element.children && [...element.children].filter(elem => elem.nodeName.toLowerCase() === 'summary').length === 0;
        }
    }

    public static wordCount(str): number {
        str = str.trim();
        if (str.length === 0) return 0;
        return str.split(/\s+/g).length;
    }

    /**
     * Note that this only detects if the element itself is in the tab order.
     * However, this element may delegate focus to another element via aria-activedescendant.
     * Also, focus varies by browser... sticking to things that are focusable on Chrome and Firefox.
     */
    public static isTabbable(element) {
        // Using https://allyjs.io/data-tables/focusable.html
        // Handle the explicit cases first
        if (!VisUtil.isNodeVisible(element)) return false;
        if (element.hasAttribute("tabindex")) {
            return parseInt(element.getAttribute("tabindex")) >= 0;
        }
        // Explicit cases handled - now the implicit
        let nodeName = element.nodeName.toLowerCase();
        if (nodeName in CommonUtil.tabTagMap) {
            let retVal = CommonUtil.tabTagMap[nodeName];
            if (typeof (retVal) === "function") {
                retVal = retVal(element);
            }
            return retVal;
        } else {
            return false;
        }
    }

    /**
     * Test if the ele node is focusable
     */
    public static isFocusable(ele) {
        if (ele === "undefined" || ele === null) {
            return false;
        }
        return CommonUtil.isTabbable(ele);
    }

    /* 
     * get conflict Aria and Html attributes
     * return: a list of Aria and Html attribute pairs that are conflict
    */
    public static isTableDescendant(contextHierarchies?: RuleContextHierarchy) {
        if (!contextHierarchies) return null;

        return contextHierarchies["aria"].filter(hier => ["table", "grid", "treegrid"].includes(hier.role));
    }

    public static tabIndexLEZero(elem) {
        if (CommonUtil.hasAttribute(elem, "tabindex")) {
            if (elem.getAttribute("tabindex").match(/^-?\d+$/)) {
                let tabindexValue = parseInt(elem.getAttribute("tabindex"));
                return tabindexValue === 0 || tabindexValue === -1;
            }
        }
        return false;
    }

    /**
     * get number of tabbable children
     * @param element 
     */
    public static getTabbableChildren(element) {
        let count = 0;
        // If node has children, look for tab stops in the children
        if (element.firstChild || element.nodeName.toUpperCase() === "IFRAME") {
            let nw = new DOMWalker(element);
            while (nw.nextNode() && nw.node != element) {
                if (nw.node.nodeType == 1 && !nw.bEndTag && CommonUtil.isTabbable(nw.node)) {
                    ++count;
                }
            }
        }
        return count;
    }

    public static normalizeSpacing(s) {
        if (!s) return '';
        return s.trim().replace(/\s+/g, ' ');
    };

    //TODO: function does not handle equivalents for roles: row, link, header, button
    // But it may not have to. Bug reports have been about radio buttons and checkboxes.
    public static isHtmlEquiv(node, htmlEquiv) {
        let retVal = false;
        if (node) {
            let nodeName = node.nodeName.toLowerCase();
            if (nodeName === "input") {
                let type = node.getAttribute("type").toLowerCase();
                if (type) {
                    if (htmlEquiv.indexOf("checkbox") != -1) {
                        retVal = type === "checkbox";
                    } else if (htmlEquiv.indexOf("radio") != -1) {
                        retVal = type === "radio";
                    }
                }
            }
        }
        return retVal;
    }

    public static nonExistantIDs(node, targetids) {
        let returnnotfoundids = '';
        if (CommonUtil.normalizeSpacing(targetids).length < 1) return returnnotfoundids;

        let targetArray = targetids.split(" ");
        let doc = node.ownerDocument;
        for (let i = 0; i < targetArray.length; i++) {
            let xp = "//*[@id='" + targetArray[i] + "']";
            let xpathResult = doc.evaluate(xp, node, doc.defaultNSResolver, 0 /* XPathResult.ANY_TYPE */, null);
            let r = xpathResult.iterateNext();
            if (!r) returnnotfoundids += targetArray[i] + ', ';
        }
        if (CommonUtil.normalizeSpacing(returnnotfoundids).length >= 2)
            returnnotfoundids = returnnotfoundids.substring(0, returnnotfoundids.length - 2);
        else
            returnnotfoundids = '';
        return returnnotfoundids;
    }

    public static getDocElementsByTag(elem, tagName) {
        let doc = FragmentUtil.getOwnerFragment(elem) as any;
        tagName = tagName.toLowerCase();
        let cache = CacheUtil.getCache(doc, "RPT_DOCELEMSBYTAG", {});
        if (!(tagName in cache)) {
            cache[tagName] = doc.querySelectorAll(tagName);
            CacheUtil.setCache(doc, "RPT_DOCELEMSBYTAG", cache);
        }
        return cache[tagName];
    }

    /**
     * This function is responsible for get a list of all the child elemnts which match the tag
     * name provided.
     *
     * Note: This is a wrapper function to: AriaUtil.getChildByTagHidden
     *
     * @parm {element} parentElem - The parent element
     * @parm {string} tagName - The tag to search for under the parent element
     * @parm {boolean} ignoreHidden - true if hidden elements with the tag should ignored from the list
     *                                false if the hidden elements should be added
     *
     * @return {List} retVal - list of all the elements which matched the tag under the parent that were provided.
     *
     * @memberOf AriaUtil
     */
    public static getChildByTag(parentElem, tagName) {
        return CommonUtil.getChildByTagHidden(parentElem, tagName, false, false);
    }

    /**
     * This function is responsible for get a list of all the child elemnts which match the tag
     * name provided.
     *
     * @parm {element} parentElem - The parent element
     * @parm {string} tagName - The tag to search for under the parent element
     * @parm {boolean} ignoreHidden - true if hidden elements with the tag should ignored from the list
     *                                false if the hidden elements should be added
     * @parm {bool} considerHiddenSetting - true or false based on if hidden setting should be considered.
     *
     * @return {List} retVal - list of all the elements which matched the tag under the parent that were provided.
     *
     * @memberOf AriaUtil
     */
    public static getChildByTagHidden(parentElem, tagName, ignoreHidden, considerHiddenSetting) {
        // Variable Decleration
        let retVal = [];
        let child = parentElem.firstChild;

        // Loop over all the child elements of the parent to build a list of all the elements that
        // match the tagName provided
        while (child != null) {

            // Only include the children into the return array if they match with tagname.
            if (child.nodeName.toLowerCase() === tagName) {

                // In the case that ignorehidden was set to true, then perform a isNodeVisible check
                // and in the case the node is not visilble we more to theses then move to the next node.
                // Perform a couple of checks to determine if hidden elements should be ignored or not.
                //  1. When ignoreHidden is set to true upfront, then perform a isNodeVisible
                //  2. If considerHiddenSetting option is set to true then we perform the check to consider the
                //     Check Hidden Content that is provided.
                //  2.1. Only run isNodeVisible check if hidden content should NOT be checked. In the case that hidden content is to,
                //       be scanned then we can just scan everything as normal. In the case that the current node is hidden we do not
                //       add it to the roleToElems hash at all or even do any checking for it at all.
                if ((ignoreHidden || (considerHiddenSetting && !CommonUtil.shouldCheckHiddenContent(child))) && !VisUtil.isNodeVisible(child)) {
                    // Move on to the next element
                    child = child.nextSibling;

                    continue;
                }

                // Push the element
                retVal.push(child);
            }

            // Move to the next sibling element
            child = child.nextSibling;
        }
        return retVal;
    }

    /**
         * This function is responsible for finding a list of elements that match given roles(s).
         * This function by defauly will not consider Check Hidden Setting at all.
         * This function by defauly will not consider implicit roles.
         * Note: This is a wrapper function to: AriaUtil.getElementsByRoleHidden
         *
         * @parm {document} doc - The document node
         * @parm {list or string} roles - List or single role for which to return elements based on.
         *
         * @return {List} retVal - list of all the elements which matched the role(s) that were provided.
         *
         * @memberOf AriaUtil
         */
    public static getElementsByRole(doc, roles) {
        return CommonUtil.getElementsByRoleHidden(doc, roles, false, false);
    }

    /**
     * This function is responsible for finding a list of elements that match given roles(s).
     * This function aslo finds elements with implicit roles.
     * This function will also consider elements that are hidden based on the if the Check
     * Hidden Content settings should be considered or not.
     *
     * @parm {document} doc - The document node
     * @parm {list or string} roles - List or single role for which to return elements based on.
     * @parm {bool} considerHiddenSetting - true or false based on if hidden setting should be considered.
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {List} retVal - list of all the elements which matched the role(s) that were provided.
     *
     * @memberOf AriaUtil
     */
    public static getElementsByRoleHidden(doc, roles, considerHiddenSetting, considerImplicitRoles?) {
        
        // In the case that the role to element assoication is already made, and available in the global hasAttribute
        // we can just use that one instead of building a new one.
        let roleToElems = null;
        if (considerImplicitRoles) {
            roleToElems = CacheUtil.getCache(doc, "AriaUtil_GETELEMENTSBY_ROLE_IMPLICIT", null);
        } else {
            roleToElems = CacheUtil.getCache(doc, "AriaUtil_GETELEMENTSBY_ROLE", null);
        }


        // Build the new role to element, this is where we loop through all the elements and extract all the
        // elements bsaed on roles.
        if (roleToElems === null) {
            // Re-initialize the roleToElems hash
            roleToElems = {};

            // Get the body of the doc
            let root = doc.body;

            // Keep looping until we are at the very parent node of the entire page, so that we can loop through
            // all the nodes.
            while (DOMWalker.parentNode(root) !== null) {
                // Get the parentNode
                root = DOMWalker.parentNode(root);
            }
            // Build a nodewalter based of the root node, this node walter will be use loop over all the nodes
            // and build the roles to Element coralation
            //let nw = new NodeWalker(root);
            let nw = new DOMWalker(root);
            // Loop over the entire doc/list of nodes to build the role to element map
            // Note: This will build an roleToElems hash which is in the following format.
            // roleToElems = {
            //    document: [{div},{abbr},{var}],
            //    main: [{div}],
            //    navigation: [{div}]
            // }
            while (nw.nextNode()) {
                if (!nw.elem()) continue;
                // Only check the elements which have the role attribute assiciated to them
                if (!nw.bEndTag) {

                    let wRoles = [];
                    //check if the node has role attributes
                    if (nw.elem() && nw.elem().hasAttribute("role")) {
                        // Extract all the roles that are assigned to this element, can have multiple roles on one
                        // element split by space, so we need to extract all of them into an array.
                        wRoles = nw.elem().getAttribute("role").split(" ");
                    }

                    if (nw.elem() && wRoles.length === 0 && considerImplicitRoles) {
                        //check if there are any implicit roles for this element.
                        let implicitRole = AriaUtil.getImplicitRole(nw.node);
                        if (implicitRole !== null && implicitRole.length > 0)
                            wRoles = implicitRole;
                    }

                    if (wRoles.length === 0) {
                        continue;
                    }

                    // Following are the steps that are executed at this stage to determine if the node should be classified as hidden
                    // or not.
                    //  1. If considerHiddenSetting option is set to true then we perform the check to consider the
                    //     Check Hidden Content that is provided.
                    //  2. Only run isNodeVisible check if hidden content should NOT be checked. In the case that hidden content is to,
                    //     be scanned then we can just scan everything as normal. In the case that the current node is hidden we do not
                    //     add it to the roleToElems hash at all or even do any checking for it at all.
                    //
                    // Note: The if conditions uses short-circuiting so if the first condition is not true it will not check the next one,
                    //       so on and so forth.
                    if (considerHiddenSetting && CommonUtil.shouldNodeBeSkippedHidden(nw.node)) {
                        continue;
                    }

                    // Loop through all the roles and assigned this node to all thes roles
                    for (let i = 0; i < wRoles.length; ++i) {
                        // In the case that the role key is not already in the roleToElems hash, construct the
                        // add the key and assign empty array.
                        if (!(wRoles[i] in roleToElems)) {
                            roleToElems[wRoles[i]] = [];
                        }

                        // Add the node to the array for the role
                        roleToElems[wRoles[i]].push(nw.node);
                    }
                }
            }

            // Set the roleToElems hash map as a global variable
            if (considerImplicitRoles) {
                CacheUtil.setCache(doc, "AriaUtil_GETELEMENTSBY_ROLE_IMPLICIT", roleToElems);
            } else {
                CacheUtil.setCache(doc, "AriaUtil_GETELEMENTSBY_ROLE", roleToElems);
            }

        }

        // Initilize the return value
        let retVal = [];

        // Handle the cases where the provided role is a string and not an array,
        // for this case we take the string and put it into an array
        if (typeof (roles) === "string") {
            let role = roles;
            roles = [];
            roles.push(role);
        }

        // Loop through the roles that were provided and find the list of elements for this roles
        // and add them to the return value.
        if (roles.length) {
            // loop over all the roles
            for (let i = 0; i < roles.length; ++i) {
                // Extract the role from the array
                let nextRole = roles[i];
                // Fetch the list of all the elements for this role
                let copyRoles = roleToElems[nextRole];

                // If there are elements to copy to another array, then perform the copy
                if (copyRoles) {
                    // Loop over all the elements which are to be copied
                    for (let j = 0; j < copyRoles.length; ++j) {
                        // Add this element to the return val
                        retVal.push(copyRoles[j]);
                    }
                }
            }
        }

        return retVal;
    }

    /**
         * a target is en element that accept a pointer action (click or touch)
         * 
         */
    public static isTarget(element) {
        if (!element) return false;

        if (element.hasAttribute("tabindex") || CommonUtil.isTabbable(element)) return true;

        const roles = AriaUtil.getRoles(element, true);
        if (!roles && roles.length === 0)
            return false;

        let tagProperty = AriaUtil.getElementAriaProperty(element);
        let allowedRoles = AriaUtil.getAllowedAriaRoles(element, tagProperty);
        if (!allowedRoles || allowedRoles.length === 0)
            return false;

        let parent = element.parentElement;
        // datalist, fieldset, optgroup, etc. may be just used for grouping purpose, so go up to the parent
        while (parent && roles.some(role => role === 'group'))
            parent = parent.parentElement;

        if (parent && (parent.hasAttribute("tabindex") || CommonUtil.isTabbable(parent))) {
            const target_roles = ["listitem", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "switch", "treeitem"];
            if (allowedRoles.includes('any') || roles.some(role => target_roles.includes(role)))
                return true;
        }
        return false;
    }

    public static getFileExt(url) {
        let m = url.match(/\.(([^;?#\.]|^$)+)([;?#]|$)/);
        if (m != null && m.length >= 2) {
            return "." + m[1];
        }
        return "";
    }
    public static getFileAnchor(url) {
        let m = url.match(/#(([^;?\.]|^$)+)([;?]|$)/);
        if (m != null && m.length >= 2) {
            return m[1];
        }
        return "";
    }
    public static checkObjEmbed(node, extTest, mimeTest) {
        let nodeName = node.nodeName.toLowerCase();

        if (nodeName != "object" && nodeName != "embed" &&
            nodeName != "a" && nodeName != "area") return false;
        let retVal = false;
        // Check mime type
        if (!retVal && node.hasAttribute("type")) {
            let mime = node.getAttribute("type").toLowerCase();
            retVal = mimeTest(mime);
        }
        if (!retVal && node.hasAttribute("codetype")) {
            let mime = node.getAttribute("codetype");
            retVal = mimeTest(mime);
        }

        // Check the filename
        if (!retVal) {
            let filename = "";
            if (nodeName === "embed") {
                filename = node.getAttribute("src");
            } else if (nodeName === "a" || nodeName === "area") {
                filename = node.getAttribute("href");
            } else if (node.hasAttribute("data")) {
                filename = node.getAttribute("data");
            }
            if (filename === null) filename = "";
            let ext = CommonUtil.getFileExt(filename);
            retVal = extTest(ext);
        }

        // Check for filenames in the params
        if (!retVal && nodeName === "object") {
            // In the case that Check Hidden Option is set then comply with that setting
            let params = CommonUtil.getChildByTagHidden(node, "param", false, true);
            for (let i = 0; !retVal && params != null && i < params.length; ++i) {
                retVal = params[i].hasAttribute("value") &&
                    extTest(CommonUtil.getFileExt(params[i].getAttribute("value")));
            }
        }
        return retVal;
    }
    public static isAudioObjEmbedLink(node) {
        return CommonUtil.checkObjEmbed(node, CommonUtil.isAudioExt, function (mime) {
            return mime.startsWith("audio")
        });
    }
    public static isAudioExt(ext) {
        let audio_extensions = [".aif", ".aifc", ".aiff", ".air", ".asf", ".au", ".cda",
            ".dsm", ".dss", ".dwd", ".iff", ".kar", ".m1a", ".med",
            ".mp2", ".mp3", ".mpa", ".pcm", ".ra", ".ram", ".rm",
            ".sam", ".sf", ".sf2", ".smp", ".snd", ".svx", ".ul",
            ".voc", ".wav", ".wma", ".wve"
        ];
        return CommonUtil.valInArray(ext.toLowerCase(), audio_extensions);
    }
    public static isVideoObjEmbedLink(node) {
        return CommonUtil.checkObjEmbed(node, CommonUtil.isVideoExt, function (mime) {
            return mime.startsWith("video") ||
                mime.startsWith("application/x-shockwave-flash");
        });
    }
    public static isVideoExt(ext) {
        let video_extensions = [".asf", ".avi", ".divx", ".dv", ".m1v", ".m2p", ".m2v", ".moov",
            ".mov", ".mp4", ".mpeg", ".mpg", ".mpv", ".ogm", ".omf", ".qt",
            ".rm", ".rv", ".smi", ".smil", ".swf", ".vob", ".wmv", ".rmvb",
            ".mvb"
        ];
        return CommonUtil.valInArray(ext.toLowerCase(), video_extensions);
    }
    public static isImageObjEmbedLink(node) {
        return CommonUtil.checkObjEmbed(node, CommonUtil.isImgExt, function (mime) {
            return mime.startsWith("image");
        });
    }
    public static isImgExt(ext) {
        let image_extensions = [".bmp", ".gif", ".jpg", ".jpeg", ".pcx", ".png"];
        return CommonUtil.valInArray(ext.toLowerCase(), image_extensions);
    }
    public static isHtmlExt(ext) {
        let html_extensions = [".asp", ".aspx", ".cfm", ".cfml", ".cgi", ".htm", ".html", ".shtm",
            ".shtml", ".php", ".pl", ".py", ".shtm", ".shtml", ".xhtml"
        ];
        return CommonUtil.valInArray(ext.toLowerCase(), html_extensions);
    }

    public static hasTriggered(doc, id) {
        return CacheUtil.getCache(doc, id, false);
    }
    public static triggerOnce(doc, id, passed) {
        if (passed) return true;
        let triggered = CacheUtil.getCache(doc, id, false);
        CacheUtil.setCache(doc, id, true);
        return triggered;
    }

    /* determine if the given value exists in the given array */
    public static valInArray(value, arr) {
        for (let idx in arr) {
            if (arr[idx] === value) return true;
        }
        return false;
    }

    /**
     * return the ancestor of the given element
     * @param tagNames string, array, or dictionary containing the tags to search for
     */
    public static getAncestor(element, tagNames) {
        let walkNode = element;
        while (walkNode !== null) {
            let thisTag = walkNode.nodeName.toLowerCase();
            if (typeof (tagNames) === "string") {
                if (thisTag === tagNames.toLowerCase()) {
                    break;
                }
            } else if (tagNames.length) {
                for (let idx in tagNames) {
                    if (tagNames[idx] === thisTag)
                        return walkNode;
                }
            } else if (thisTag in tagNames) {
                break;
            }
            walkNode = DOMWalker.parentNode(walkNode);
        }
        return walkNode;
    }

    // return true if element1 and element2 are siblings
    public static isSibling(element1, element2) {
        if (element1 && element2) {
            let node = null;
            if (DOMWalker.parentNode(element1) && DOMWalker.parentNode(element1).firstChild) {
                node = DOMWalker.parentNode(element1).firstChild;
            }

            while (node) {
                if (node === element2) return true;
                node = node.nextSibling;
            }
        }
        return false;
    }

    public static isDescendant(parent, child) {
        let node = DOMWalker.parentNode(child);
        while (node != null) {
            if (node === parent) {
                return true;
            }
            node = DOMWalker.parentNode(node);
        }
        return false;
    }

    //check if the first form control child is disabled
    public static isDisabledByFirstChildFormElement(element) {
        let formElements = ["input", "textarea", "select", "keygen", "progress", "meter", "output"];
        if (element.firstChild != null) {
            //let nw = new NodeWalker(element);
            let nw = new DOMWalker(element);
            while (nw.nextNode()) {
                if (formElements.includes(nw.node.nodeName.toLowerCase())) {
                    if (CommonUtil.isNodeDisabled(nw.node))
                        return true;
                    return false;
                }
            }
        }
        return false;
    }

    public static isDisabledByReferringElement(element) {
        let id = element.getAttribute("id");
        let doc = element.ownerDocument;
        let root = doc.body;
        while (DOMWalker.parentNode(root) !== null) {
            // Get the parentNode
            root = DOMWalker.parentNode(root);
        }
        //let nw = new NodeWalker(root);
        let nw = new DOMWalker(root);
        while (nw.nextNode()) {
            // check the element whose 'aria-describedby' equals to the id
            if (nw.node && nw.node.nodeType === 1 && nw.elem()) {
                let AriaDescribedbyIDArray = (nw.elem().getAttribute("aria-describedby") || "").split(" ");
                if (AriaDescribedbyIDArray.includes(id) && CommonUtil.isNodeDisabled(nw.node)) {
                    return true;
                }
            }

        }
    }

    /** get element containing label for the given element
         * @deprecated Deprecated because the function name is misleading. Use getLabelForElement(element) instead
         */
    public static getInputLabel(element) {
        return CommonUtil.getLabelForElement(element);
    }

    /**
     * This function is responsible for getting the element containing the label for the given element.
     *
     * Note: This is a wrapper function to: AriaUtil.getLabelForElementHidden
     *
     * @parm {element} element - The element for which to get the label element for.
     *
     * @return {element} element - return the element for the label, otherwise null
     *
     * @memberOf AriaUtil
     */
    public static getLabelForElement(element) {
        return CommonUtil.getLabelForElementHidden(element, false);
    }

    /**
     * This function is responsible for getting the element containing the label for the given element.
     *
     * This function will return null if the containing lable element is hidden, when the ignoreHidden option
     * is set to true.
     *
     * @parm {element} element - The element for which to get the label element for.
     * @parm {boolean} ignoreHidden - true if hidden elements with label should be ignored from the list
     *                                false if the hidden elements should be added
     *
     * @return {element} element - return the element for the label, otherwise null
     *
     * @memberOf AriaUtil
     */
    public static getLabelForElementHidden(element: Element, ignoreHidden) {
        // Check if the global AriaUtil_LABELS hash is available, as this will contain the label nodes based on
        // for attribute.
        //if (!getCache(element.ownerDocument,"AriaUtil_LABELS", null)) {
        let root = element.getRootNode();
        if (!CacheUtil.getCache((root.nodeType === 11) ? <ShadowRoot>root : <Document>root, "AriaUtil_LABELS", null)) {
            // Variable Decleration
            let idToLabel = {}

            // Get all the label elements in the entire doc
            let labelNodes = CommonUtil.getDocElementsByTag(element, "label");
            // Loop over all the label nodes, in the case the label node has a for attribute,
            // extract that attribute and add this node to the hash if it is visible.
            for (let i = 0; i < labelNodes.length; ++i) {

                if (labelNodes[i].hasAttribute("for")) {
                    // If ignore hidden is specified and the node is not visible we do not add it to the
                    // labelNodes hash.
                    if (ignoreHidden && !VisUtil.isNodeVisible(labelNodes[i])) {
                        continue;
                    }

                    idToLabel[labelNodes[i].getAttribute("for")] = labelNodes[i];
                }
            }

            // Add the built hash to the ownerDocument (document), to be used later to fast retrival
            //setCache(element.ownerDocument, "AriaUtil_LABELS", idToLabel);
            CacheUtil.setCache((root.nodeType === 11) ? <ShadowRoot>root : <Document>root, "AriaUtil_LABELS", idToLabel);
        }

        // If this element has an id attribute, get the corosponding label element
        if (element.hasAttribute("id")) {
            // Fetch the id attribute
            let ctrlId = element.getAttribute("id");
            // Return the corosponding label element.
            // Note: in the case that the the id is not found in the hash that means, it does not exists or is hidden
            if (ctrlId.trim().length > 0) {
                //return getCache(element.getRootNode().ownerDocument,"AriaUtil_LABELS",{})[ctrlId];
                return CacheUtil.getCache((root.nodeType === 11) ? <ShadowRoot>root : <Document>root, "AriaUtil_LABELS", {})[ctrlId];
            }
        }
        return null;
    }

    /* Return specified element attribute if present else return null */
    public static getElementAttribute(element, attr) {
        //return (element && element.hasAttribute && element.hasAttribute(attr)) ? element.getAttribute(attr) : null;
        if (!attr || !element || !element.hasAttribute || !element.hasAttribute(attr)) return null;
        const atrValue = element.getAttribute(attr)
        if (!ARIADefinitions.referenceProperties.includes(attr))
            return atrValue;

        //attr is a reference to other elements(s)
        const values = atrValue.split(/ +/g);
        //ignore if none of the referred element(s) exist or all point to the element itself
        let exist = false;
        for (let id = 0; values < values.length; ++id) {
            const referred = document.getElementById(values[id]);
            if (referred && !DOMUtil.sameNode(referred, element)) {
                exist = true;
                break;
            }
        }
        return exist ? atrValue : null;
    }

    // Return true if element has valid implicit label
    public static hasImplicitLabel(element) {
        let parentNode = CommonUtil.getAncestor(element, "label");
        // Test  a) if the parent is a label which is the implicit label
        //       b) if the form element is the first child of the label
        //       c) if the form element requires an implicit or explicit label : "input",  "textarea", "select", "keygen", "progress", "meter", "output"
        //       d) form elements which may have a label: button
        // form elements that do not require implicit or explicit label element are:
        // "optgroup", "option", "datalist"(added later). These were handled differently in the main rule, might need to refactor the code later

        if (parentNode && parentNode.tagName.toLowerCase() === "label" && CommonUtil.isFirstFormElement(parentNode, element)) {
            let parentClone = parentNode.cloneNode(true);
            // exclude all form elements from the label since they might also have inner content
            parentClone = CommonUtil.removeAllFormElementsFromLabel(parentClone);
            return CommonUtil.hasInnerContentHidden(parentClone);
        } else {
            return false;
        }
    }

    public static isFirstFormElement(parentNode, element) {
        let formElementsRequiringLabel = ["input", "textarea", "select", "keygen", "progress", "meter", "output"];
        if (parentNode.firstChild != null) {
            //let nw = new NodeWalker(parentNode);
            let nw = new DOMWalker(parentNode);
            while (nw.nextNode()) {
                if (formElementsRequiringLabel.indexOf(nw.node.nodeName.toLowerCase()) !== -1) {
                    return nw.node === element;
                }
            }
        }
        return false;
    }

    // check if the element is a shadow host or descendant of a shadow host, but not a descedant of the shadow root of the host (to be assigned to shadow slot or ignored)  
    public static isShadowHostElement(element: Element) {
        if (CommonUtil.isShadowElement(element))
            return false;
        let walkNode: Element = element;
        while (walkNode) {
            if (walkNode.shadowRoot) return true;
            walkNode = DOMWalker.parentElement(walkNode);
        }
        return false;
    }

    //check if an element is in a shadow tree
    public static isShadowElement(element: Element) {
        let root = element.getRootNode();
        if (root.toString() === "[object ShadowRoot]")
            return true;
        return false;
    }

    public static removeAllFormElementsFromLabel(element) {
        let formElements = ["input", "textarea", "select", "button", "datalist", "optgroup", "option", "keygen", "output", "progress", "meter"];
        let childNodes = element.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            if (formElements.indexOf(childNodes[i].nodeName.toLowerCase()) > -1) {
                element.removeChild(childNodes[i]);
            }
        }
        return element;
    }

    /**
         * @param element 
         * @param idStr 
         * @returns true if any one (if multiple Ids) id points to itself
         */
    public static isIdReferToSelf(element, idStr: String) {
        if (!idStr || idStr.trim() === '') return false;
        let ids = idStr.trim().split(" ");
        for (let j = 0, length = ids.length; j < length; ++j) {
            let referredNode = FragmentUtil.getById(element, ids[j]);
            if (referredNode && DOMUtil.sameNode(referredNode, element)) return true;
        }
        return false;
    }

    /* Determine the node depth of the given element */
    public static nodeDepth(element) {
        let depth = 0;
        let walkNode = element;
        while (walkNode !== null) {
            walkNode = DOMWalker.parentNode(walkNode);
            depth = depth + 1;
        }
        return depth;
    }

    /* compare node order of the 2 given nodes */
    /* returns
     *   0 if the nodes are equal
     *   1 if node b is before node a
     *  -1 if node a is before node b
     *   2 if node a is nested in node b
     *  -2 if node b is nested in node a
     *   null if either node is null or their parent nodes are not equal
     */
    public static compareNodeOrder(nodeA, nodeB) {
        if (nodeA === nodeB) return 0;

        let aDepth = CommonUtil.nodeDepth(nodeA);
        let bDepth = CommonUtil.nodeDepth(nodeB);
        if (bDepth > aDepth) {
            for (let i = 0; i < bDepth - aDepth; ++i)
                nodeB = DOMWalker.parentNode(nodeB);
            if (nodeA === nodeB) // Node B nested in Node A
                return -2;
        } else if (aDepth > bDepth) {
            for (let i = 0; i < aDepth - bDepth; ++i)
                nodeA = DOMWalker.parentNode(nodeA);
            if (nodeA === nodeB) // Node A nested in Node B
                return 2;
        }
        while (nodeA != null && nodeB != null && DOMWalker.parentNode(nodeA) != DOMWalker.parentNode(nodeB)) {
            nodeA = DOMWalker.parentNode(nodeA);
            nodeB = DOMWalker.parentNode(nodeB);
        }
        if (nodeA === null || nodeB === null || DOMWalker.parentNode(nodeA) != DOMWalker.parentNode(nodeB)) return null;
        while (nodeB != null && nodeB != nodeA)
            nodeB = nodeB.previousSibling;
        if (nodeB === null) // nodeB before nodeA
            return 1;
        else return -1;
    }

    /**
     *  Determine if the given attribute of the given element is not empty
     *  @memberOf AriaUtil
     */
    public static attributeNonEmpty(element, attrStr) {
        return element.hasAttribute(attrStr) && element.getAttribute(attrStr).trim().length > 0;
    }

    /* Return a pointer to the given frame, null if not found */
    public static getFrameByName(ruleContext, frameName) {
        let window = ruleContext.ownerDocument.defaultView;
        let frameList = [window];
        let idx = 0;
        while (idx < frameList.length) {
            try {
                if (frameList[idx].name === frameName) return frameList[idx];
                for (let i = 0; i < frameList[idx].frames.length; ++i) {
                    try {
                        // Ensure it's a real frame and avoid recursion
                        if (frameList[idx].frames[i] && !frameList.includes(frameList[idx].frames[i])) {
                            frameList.push(frameList[idx].frames[i]);
                        }
                    } catch (e) { }
                }
            } catch (e) { }
            ++idx;
        }
        return null;
    }

    public static defaultNSResolver(prefix) {
        let uri;
        switch (prefix) {
            case 'html':
                uri = 'http://www.w3.org/1999/xhtml';
            case 'x2':
                uri = 'http://www.w3.org/TR/xhtml2';
            case 'x':
                uri = 'http://www.w3.org/1999/xhtml';
            case 'xhtml':
                uri = 'http://www.w3.org/1999/xhtml';
            default:
                uri = null;
        }
        return uri;
    }

    //checking if only the inner text is empty or not
    public static isInnerTextOnlyEmpty(element) {
        // Get the innerText of the element
        let text = element.innerText;

        if ((text === undefined || text === null || text.trim().length === 0) && element.nodeName.toLowerCase() !== 'slot' && element.textContent !== undefined) {
            //ignore slot because its text will be filled by the corresponding content in the light DOM 
            // innerText is sometimes 'undefined' in headless mode, or null if the element is invisible or not erxpanded 
            // so we try textContent as a workaround
            text = element.textContent
        }

        let retVal = !(text !== null && text.trim().length > 0);
        if (element.nodeType === 1 && element.nodeName.toLowerCase() === "slot") {
            //TODO: need to conside its own content, a slot may have its own content or assigned content
            for (const slotElem of element.assignedNodes()) {
                retVal = retVal && CommonUtil.isInnerTextEmpty(slotElem);
            }
        }

        // Trim the inner text and verify that it is not empty.
        return retVal;
    }

    /* Return the inner text of the given element */
    public static getInnerText(element) {
        let retVal = element.innerText;
        if (retVal === undefined || retVal === null || retVal.trim() === "")
            retVal = element.textContent;
        return retVal;
    }

    /**
     * return onscreen innerText.
     * This function should return the same result as innerText if no offscreen content exists
     *
     * @parm {element} node The node which should be checked it has inner text or not.
     * @return {null | string} null if element has empty inner text, text otherwise
     *
     * @memberOf AriaUtil
     */
    public static getOnScreenInnerText(element) {
        if (!element) return null;
        if (element.nodeType === 3) return element.nodeValue();

        let text = "";
        //let nw = new NodeWalker(element);
        let nw = new DOMWalker(element);
        // Loop over all the childrens of the element to get the text
        while (nw.nextNode() && nw.node !== element && nw.node !== element.parentNode) {
            if (nw.bEndTag) continue;
            if ((nw.node.nodeType === 1 && (VisUtil.hiddenByDefaultElements.includes(nw.node.nodeName.toLowerCase())) || !VisUtil.isNodeVisible(nw.node) || VisUtil.isElementOffscreen(nw.node))) {
                if (nw.node.nextSibling) {
                    if (nw.node.nextSibling.nodeType === 3 && nw.node.nextSibling.nodeValue !== null)
                        text += nw.node.nextSibling.nodeValue;
                    nw.node = nw.node.nextSibling;
                    continue;
                } else
                    break;
            }
            if (nw.node.nodeType === 3 && nw.node.nodeValue !== null) {
                text += nw.node.nodeValue.trim(); 
            }    
        }
        return text.trim();
    }

    /** Return the text content of the given node 
     *  this is different than innerText or textContent that return text content of a node and its descendants
    */
    public static getNodeText(element) {
        if (!element) return "";
        let text = "";
        let childNodes = element.childNodes;
        for (let i = 0; i < childNodes.length; ++i) {
            if (childNodes[i].nodeType == 3) {
                text += childNodes[i].nodeValue;
            }
        }
        return text;
    }

    /**
     * This function is responsible for checking if elements inner text is empty or not.
     *
     * @parm {element} node The node which should be checked it has inner text or not.
     * @return {bool} true if element has empty inner text, false otherwise
     *
     * @memberOf AriaUtil
     */
    public static isInnerTextEmpty(element) {
        // Get the innerText of the element
        let text = CommonUtil.getInnerText(element);

        // Trim the inner text and verify that it is not empty.
        return !(text != null && text.trim().length > 0);
    }

    public static hasInnerContent(element) {
        let text = CommonUtil.getInnerText(element);
        let hasContent = (text != null && text.trim().length > 0);

        if (element.firstChild != null) {
            //let nw = new NodeWalker(element);
            let nw = new DOMWalker(element);
            while (!hasContent && nw.nextNode()) {
                hasContent = (nw.node.nodeName.toLowerCase() === "img" &&
                    CommonUtil.attributeNonEmpty(nw.node, "alt"));
            }
        }
        return hasContent;
    }

    /**
     * This function is responsible for determine if an element has inner content.
     * This function also considers cases where inner text is hidden, which now will
     * be classified as does not have hidden content.
     *
     * @parm {element} node The node which should be checked it has inner text or not.
     * @return {bool} true if element has empty inner text, false otherwise
     *
     * @memberOf AriaUtil
     */
    public static hasInnerContentHidden(element) {
        return CommonUtil.hasInnerContentHiddenHyperLink(element, false);
    }

    public static svgHasName(element: SVGElement) {
        return CommonUtil.attributeNonEmpty(element, "aria-label")
            || CommonUtil.attributeNonEmpty(element, "aria-labelledby")
            || !!element.querySelector(":scope > title");
    }

    public static hasInnerContentHiddenHyperLink(element, hyperlink_flag) {
        if (!element) return false;
        // Variable Decleration
        let childElement = element.firstElementChild;
        let hasContent = false;

        // In the case that the childElement is not null then we need to check each of the elements
        // to make sure that the elements are not all hidden.
        if (childElement != null) {
            // Get the nodewalter of the element node, so that we can loop over it and verify
            // that the elements under the element are not completly hidden.
            //let nw = new NodeWalker(element);
            let nw = new DOMWalker(element);
            // Loop over all the nodes until there are no more nodes or we have determine that there is content under
            // this parent element.
            while (!hasContent && nw.nextNode() && nw.node != element) {
                // Get the next node
                let node = nw.node;

                // In the case an img element is present with alt then we can mark this as pass
                // otherwise keep checking all the other elements. Make sure that this image element is not hidden.
                hasContent = (
                    node.nodeName.toLowerCase() === "img"
                    && (CommonUtil.attributeNonEmpty(node, "alt") || CommonUtil.attributeNonEmpty(node, "title"))
                    && VisUtil.isNodeVisible(node)
                ) || (
                        node.nodeName.toLowerCase() === "svg"
                        && CommonUtil.svgHasName(node as any)
                    );

                // Now we check if this node is of type element, visible
                if (!hasContent && node.nodeType === 1 && VisUtil.isNodeVisible(node)) {
                    // Check if the innerText of the element is empty or not
                    hasContent = !CommonUtil.isInnerTextOnlyEmpty(node);
                    if (!hasContent && hyperlink_flag === true) {
                        hasContent = CommonUtil.attributeNonEmpty(node, "aria-label") || CommonUtil.attributeNonEmpty(node, "aria-labelledby");
                        let doc = node.ownerDocument;
                        if (doc) {
                            let win = doc.defaultView;
                            if (win) {
                                let cStyle = win.getComputedStyle(node as any);
                                if (!hasContent && cStyle != null) {
                                    //                                       console.log(cStyle.backgroundImage);
                                    //                                       console.log(cStyle.content)
                                    hasContent = ((cStyle.backgroundImage && cStyle.backgroundImage.indexOf) || cStyle.content) && CommonUtil.attributeNonEmpty(node, "alt");
                                }
                            }
                        }

                    }
                }

                // Check for cases where there is text node after an element under the parent
                // In the case we detect nodetype as text node and the patent of the text node is
                // the same element we are checking has Inner content for then get the inner content of this
                // text node.
                if (node.nodeType === 3 && DOMWalker.parentElement(node) === element) {
                    // Check if the innerText of the element is empty or not
                    hasContent = !CommonUtil.isInnerTextEmpty(node);
                }
            }
        }
        // In the case there are no child elements then we can simply perform the check for only innertext
        // the img with alt case will be covered in the above if, as img is considers as an element.
        else {
            // Check if the innerText of the element is empty or not
            hasContent = !CommonUtil.isInnerTextEmpty(element);
        }

        return hasContent;
    }

    public static hasInnerContentOrAlt(element) {
        let text = CommonUtil.getInnerText(element);
        let hasContent = (text != null && text.trim().length > 0) || CommonUtil.attributeNonEmpty(element, "alt");

        if (element.firstChild != null) {
            //let nw = new NodeWalker(element);
            let nw = new DOMWalker(element);
            while (!hasContent && nw.nextNode() && nw.node != element) {
                hasContent = (nw.node.nodeName.toLowerCase() === "img" &&
                    CommonUtil.attributeNonEmpty(nw.node, "alt"));
                if (!hasContent
                    && (AriaUtil.hasRole(nw.node, "button", true) || AriaUtil.hasRole(nw.node, "textbox"))
                    && (AriaUtil.hasAriaLabel(nw.node) || CommonUtil.attributeNonEmpty(nw.node, "title") || CommonUtil.getLabelForElementHidden(nw.elem(), true))) {
                    hasContent = true;
                }

            }
        }
        return hasContent;
    }

    public static concatUniqueArrayItem(item: string, arr: string[]): string[] {
        arr.indexOf(item) === -1 && item !== null ? arr.push(item) : false;
        return arr;
    }

    public static concatUniqueArrayItemList(itemList: string[], arr: string[]): string[] {
        for (let i = 0; itemList !== null && i < itemList.length; i++) {
            arr = CommonUtil.concatUniqueArrayItem(itemList[i], arr);
        }
        return arr;
    }

    /**
     * remove array items from a given array
     * @param itemList items to be removed from arr
     * @param arr the array
     * @returns 
     */
    public static reduceArrayItemList(itemList: string[], arr: string[]): string[] {
        if (arr && arr.length > 0 && itemList && itemList.length > 0) {
            let result = arr.filter((value) => {
                return !itemList.includes(value);
            });
            return result;
        }
        return arr;
    }

    public static getScopeForTh(element) {
        /** https://www.w3.org/TR/html5/tabular-data.html#header-and-data-cell-semantics
         * A header cell anchored at the slot with coordinate (x, y) with width width and height height is 
         * said to be a column header if any of the following conditions are true:
         * * The cell's scope attribute is in the column state, or
         * * The cell's scope attribute is in the auto state, and there are no data cells in any of 
         *   the cells covering slots with y-coordinates y .. y+height-1.
         * A header cell anchored at the slot with coordinate (x, y) with width width and height height is
         * said to be a row header if any of the following conditions are true:
         * * The cell's scope attribute is in the row state, or
         * * The cell's scope attribute is in the auto state, the cell is not a column header, and there are
         *   no data cells in any of the cells covering slots with x-coordinates x .. x+width-1.
         */
        // Note: auto is default scope

        // Easiest answer is if scope is specified
        if (element.hasAttribute("scope")) {
            let scope = element.getAttribute("scope").toLowerCase();
            if (scope === "row" || scope === 'rowgroup') return "row";
            if (scope === "col" || scope === 'colgroup') return "column";
        }

        // scope is auto, default (without a scope) or invalid value.
        // if all the sibling elements are th, then return "columnheader" 
        var siblings = element => [...element.parentElement.children].filter(node => node.nodeType === 1 && node.tagName != "TH");
        if (siblings === null || siblings.length === 0)
            return "column";
        else return "row";
    }

    public static getControlOfLabel(node: Node) {
        // Handle the easy case of label -> for
        let labelAncestor = CommonUtil.getAncestor(node, "label");
        if (labelAncestor) {
            if (labelAncestor.hasAttribute("for")) {
                return FragmentUtil.getById(node, labelAncestor.getAttribute("for"));
            }
        }

        // Create a dictionary containing ids of parent nodes
        let idDict = {};
        let parentWalk = node;
        while (parentWalk) {
            if (parentWalk.nodeType === 1 /* Node.ELEMENT_NODE */) {
                const ancestor = parentWalk as Element;
                if (ancestor.hasAttribute("id")) {
                    idDict[ancestor.getAttribute("id")] = true;
                }
            }
            parentWalk = DOMWalker.parentNode(parentWalk);
        }

        // Iterate through controls that use aria-labelledby and see if any of them reference one of my ancestor ids
        const inputsUsingLabelledBy = node.ownerDocument.querySelectorAll("*[aria-labelledby]");
        for (let idx = 0; idx < inputsUsingLabelledBy.length; ++idx) {
            const inputUsingLabelledBy = inputsUsingLabelledBy[idx];
            const ariaLabelledBy = inputUsingLabelledBy.getAttribute("aria-labelledby");
            const sp = ariaLabelledBy.split(" ");
            for (const id of sp) {
                if (id in idDict && !CommonUtil.isIdReferToSelf(node, (node as Element).getAttribute("aria-labelledby"))) {
                    return inputUsingLabelledBy;
                }
            }
        }

        // Find the cases where we're within an aria labelledby
        return null;
    }

    /**
     * This function is responsible for checking if the node that is provied is
     * disabled or not. Following is how the check is performed:
     *    1. Check if the current node is disabled with the following options:
     *       attribute --> disabled
     *         Also needs to be "button", "input", "select", "textarea", "optgroup", "option",
     *         "menuitem", "fieldset" nodes (in array elementsAllowedDisabled)
     *       attribute --> aria-disabled="true"
     *    2. Check if any of the current nodes parents are disabled with the same
     *       options listed in 1.
     *
     *    Note: If either current node or any of the parent nodes are disabled then this
     *          function will return true (node is disabled).
     *
     * @parm {HTMLElement} node - The node which should be checked if it is disabled or not.
     * @return {bool} true if the node is disabled, false otherwise
     *
     * @memberOf AriaUtil
     */
    public static isNodeDisabled(node) {

        // Set PT_NODE_DISABLED to false for all the nodes, before the check and this will be changed to
        // true when we detect that the node is disabled. We have to set it to false so that we know
        // the node has already been checked. Only set it to false if the setting is undefined or null
        // as if it is defined we do not wnat to reset it. As if it is true then we should make use of it
        // to speed up the check.
        let PT_NODE_DISABLED = CacheUtil.getCache(node, "PT_NODE_DISABLED", false);

        // Check the nodeType of this node, if this node is a text node then
        // we get the parentnode and set that as the node as a text nodes,
        // disabled is directly related to the parent node.
        if (node.nodeType === 3) {
            node = DOMWalker.parentNode(node);
        }

        // Variable Declaration
        let nodeName = node.nodeName.toLowerCase();

        // Get the disabled element property, disabled and aria-disabled attribute and check that it is true
        let disabledAttribute = node.hasAttribute("disabled");
        let disabledPropertyCustom = PT_NODE_DISABLED;
        let ariaDisabledAttribute = node.hasAttribute('aria-disabled') && node.getAttribute("aria-disabled") === 'true';

        // If this node has disabled attribute and the node allows disabled attribute, then return true.
        // Disabled attribute is only allowed on "button", "input", "select", "textarea", "optgroup", "option", "menuitem", "fieldset"
        // In the case aria-disabled is set to true, then also return true
        if (disabledPropertyCustom || (disabledAttribute && ARIADefinitions.elementsAllowedDisabled.indexOf(nodeName) > -1) || ariaDisabledAttribute) {
            PT_NODE_DISABLED = true;
            CacheUtil.setCache(node, "PT_NODE_DISABLED", PT_NODE_DISABLED);
            return true;
        }

        // Get the parentNode for this node, becuase we have to check all parents to make sure they do not have
        // disabled attribute. Only keep checking until we are all the way back to the parentNode
        // element.
        let parentElement = DOMWalker.parentNode(node);

        // If the parent node exists and the nodetype is element (1), then run recursive call to perform the check
        // all the way up to the very parent node. Use recursive call here instead of a while loop so that we do not
        // have to duplicate the logic for checking if the node is disabled or not for all the parents starting with
        // child node.
        if (parentElement != null && parentElement.nodeType === 1) {
            // Check upwards recursively, and save the results in an variable
            let nodeDisabled = CommonUtil.isNodeDisabled(parentElement);

            // If the node is found to be disabled then add the custom PT_NODE_DISABLED to true.
            // so that we can use this next time, to quickly determine if node is disabled or not.
            // This is extra percaution, the isNodeDisabled function already sets this.
            if (nodeDisabled) {
                PT_NODE_DISABLED = true;
            }

            // Check upwards recursively
            CacheUtil.setCache(node, "PT_NODE_DISABLED", PT_NODE_DISABLED);
            return nodeDisabled;
        }

        // Return false (node is not disabled)
        return false;
    }

    /**
     * This function is responsible for determine if hidden content should be checked
     * in rules.
     *
     * @parm {element} node - A node so that the document can be accessed to check for the
     *                        option. Can be document element or a simple node element.
     * @return {bool} true if hidden content should be checked, false otherwise
     *
     * @memberOf AriaUtil
     */
    public static shouldCheckHiddenContent(node) {
        return false;
    }

    /**
     * This function is responsible for determining if node should be skipped from checking or not, based
     * on the Check Hidden Content settings and if the node is visible or not.
     *
     * @parm {element} node - Node to check if it is visible or not based on the Check Hidden Content
     *                        setting.
     *
     * @return {bool} true if node should be skipped, false otherwise
     *
     * @memberOf AriaUtil
     */
    public static shouldNodeBeSkippedHidden(node) {
        // Following are the steps that are executed at this stage to determine if the node should be classified as hidden
        // or not.
        //  1. Only run isNodeVisible check if hidden content should NOT be checked. In the case that hidden content is to,
        //     be scanned then we can just scan everything as normal. In the case that the current node is hidden we
        //     return true to identify that the node should not be scanned/added to any hash/array.
        //
        // Note: The if conditions uses short-circuiting so if the first condition is not true it will not check the next one,
        //       so on and so forth.
        if (!CommonUtil.shouldCheckHiddenContent(node) && !VisUtil.isNodeVisible(node)) {
            return true;
        }

        return false;
    }

    public static isfocusableByDefault(node) {
        var focusableElements = ['input', 'select', 'button', 'textarea', 'option', 'area'];
        if (node.nodeName.toLowerCase() === "a" && CommonUtil.hasAttribute(node, 'href')) return true;
        if (node.nodeName.toLowerCase() === "area" && CommonUtil.hasAttribute(node, 'href')) return true;
        if (focusableElements.indexOf(node.nodeName.toLowerCase()) != -1) return true;
        return false;
    }

    /**
     * This function check if a non-tabable node has valid tabable content.
     * If it is tabable (the tabindex is not speicified or is not -1), returns false;
     * If it is non-tabable, but a child is tabable and does not have element content, returns false;
     * Otherwise, returns true.
     */
    public static nonTabableChildCheck(element: Element): boolean {
        if (!element.hasAttribute("tabindex") ||
            (parseInt(element.getAttribute("tabindex")) != -1)) {
            return false;
        }
        //let nw = new NodeWalker(element);
        let nw = new DOMWalker(element);
        while (nw.nextNode()) {
            let child = nw.elem();
            if (child === null) { // Text node. usually is a cartridge return.
                continue;
            }
            if (child.hasAttribute("tabindex") &&
                (parseInt(child.getAttribute("tabindex")) != -1) &&
                !CommonUtil.hasInnerContent(child)) {
                return false;
            }
        }
        return true;
    }

    public static hasAttribute(element, attributeName) {
        var hasAttribute = false;
        if (element.hasAttribute) {
            hasAttribute = element.hasAttribute(attributeName);
        } else if (element.attributes && element.attributes.getNamedItem) {
            var attr = element.attributes.getNamedItem(attributeName);
            hasAttribute = attr && attr.specified;
        }
        return hasAttribute;
    }

}