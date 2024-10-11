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

import { CacheUtil } from "./CacheUtil";
import { DOMUtil } from "../../v2/dom/DOMUtil";
import { DOMWalker } from "../../v2/dom/DOMWalker";
import { DOMMapper } from "../../v2/dom/DOMMapper";
import { AriaUtil } from "./AriaUtil";

export class VisUtil {
    // This list contains a list of element tags which can not be hidden, when hidden is
    // added to theses elements it does not do anything at all.
    //  area --> area element is part of a map element and it can not be hidden because it is used to
    //           make an certian parts of an map interactive.
    //  param --> element can only be part of object elment and it cannot be hidden directly, it
    //            can only be hidden if the parent is hidden.
    //  audio --> If this element is hidden it will still play the music, so we should still trigger
    //            violations for this element.
    // Note: All element tags that are added here should be added as lowercase, as we are using indexOf to do the check.
    public static unhideableElements = ['area', 'param', 'audio'];

    // This list contains a list of elements tags which have display: none by default, since we have rules triggering
    // on theses elements we need to make then visible by default so that the rules can trigger regardless of the
    // Check Hidden Content option in the tools.
    //  script --> script elements have display: none by default
    //  link --> link elements have display: none by default, but the actually CSS script is still executed so we have to
    //            mark this element as visible at all times.
    //  style --> style elements have display: none by default, but the actually CSS script is still executed so we have to
    //            mark this element as visible at all times.
    //  head --> head elements have display: none by default, but it will still behave correct
    //  title --> title elements have display: none by default, but it will still display the title. remove title from the list because a title can be a child of a svg element too
    //  meta --> meta elements have display: none by default, but it will still perform the action that meta is suppose to
    //  base --> base elements have display: none by default, but it will still perform the action that meta is suppose to
    //  noscript --> noscript elements have display: none by default, but it will still perform the action that meta is suppose to
    //  template --> template elements have display: none by default, because they are just a mechanism for holding client-side content
    //               that is not to be rendered when a page is loaded. https://developer.mozilla.org/en/docs/Web/HTML/Element/template
    //  datalist --> datalist elements have display: none by default,
    public static hiddenByDefaultElements = ['script', 'link', 'style', 'head', 'meta', 'base', 'noscript', 'template', 'datalist']

    /**
     * This function is responsible for checking if the node that is provied is
     * visible or not. Following is how the check is performed:
     *    1. Check if the current node is hidden with the following options:
     *       CSS --> dislay: none
     *       CSS --> visibility: hidden
     *       attribute --> hidden
     *    2. Check if the any of the current nodes parents are hidden with the same
     *       options listed in 1.
     *
     *    Note: If either current node or any of the parent nodes are hidden then this
     *          function will return false (node is not visible).
     *
     *    Note: nodes with CSS properties opacity:0 or filter:opacity(0%), or similar SVG mechanisms: 
     *      They are not considered hidden. Text hidden with these methods can still be selected or copied, 
     *      and user agents still expose it in their accessibility trees.  
     * 
     *    Note: nodes hidden off screen or behind another object: they are not considered hidden. 
     *      They are exposed in the accessibility tree and they can even name on-screen objects.
     * 
     * @parm {element} node The node which should be checked if it is visible or not.
     * @return {bool} false if the node is NOT visible, true otherwise
     *
     * @memberOf VisUtil
     */
     public static isNodeVisible(nodeIn: Node) : boolean {

        // Check the nodeType if this node, if this node is a text node then
        // we get the parentnode and set that as the node as a text nodes,
        // visibility is directly related to the parent node.
        if (nodeIn.nodeType === 3) {
            nodeIn = DOMWalker.parentNode(nodeIn);
        }
        let node = nodeIn as Element;
        // Set PT_NODE_HIDDEN to false for all the nodes, before the check and this will be changed to
        // true when we detect that the node is hidden. We have to set it to false so that we know
        // the rules has already been checked.
        CacheUtil.setCache(node, "PT_NODE_HIDDEN", CacheUtil.getCache(node, "PT_NODE_HIDDEN", false));

        // We should only allow nodeType element, and TextNode all other nodesTypes
        // we can return the visibility as visible.
        // Following nodes will be returned as visable by default, since we can not
        // actually change their visibility.
        //  Node.PROCESSING_INSTRUCTION_NODE --> 7
        //  Node.COMMENT_NODE                --> 8
        //  9 /* Node.DOCUMENT_NODE */               --> 9
        //  Node.DOCUMENT_TYPE_NODE          --> 10
        //  Node.DOCUMENT_FRAGMENT_NODE      --> 11
        if (node.nodeType !== 1) {
            return true;
        }

        // Make sure that the ownerDocument is present before moving forward
        // in detecting if the node is visible or not. In the case that ownerDocument
        // does not exist then we simply return node is visible by default.
        if (!node.ownerDocument) {
            return true;
        }

        // Variable Declaration
        let compStyle;
        let nodeName = node.nodeName.toLowerCase();

        // In the case this node is a script, link or style node, right away return node is visible
        // because scripts, links and style nodes can not be hidden by HTML attribute or CSS or are hidden by default. But we want to scan
        // the elements everytime as they render content still which is still visible to users.
        //  script --> script elements have display: none by default
        //  link --> link elements have display: none by default, but the actually CSS script is still executed so we have to
        //            mark this element as visible at all times.
        //  style --> style elements have display: none by default, but the actually CSS script is still executed so we have to
        //            mark this element as visible at all times.
        // datalist --> In the rendering, the datalist element represents nothing and it, along with its children, should be hidden.
        if (VisUtil.hiddenByDefaultElements != null && VisUtil.hiddenByDefaultElements != undefined && VisUtil.hiddenByDefaultElements.indexOf(nodeName) > -1) {
            //return true;
            return false;
        }

        // Check if this node is visible, we check couple of CSS properties and hidden attribute.
        // area, param and audio elements we do not check if they are hidden as it does not apply to them.
        // Check the unhideableElements array which is part of the rules, to check if this element is allowed to be hidden or not
        // in the case that the element is part of the unhideableElements array then we do not run the hidden check on this element,
        // and go stright to the parent node.
        // Array check elements like:
        //  area --> area element is part of a map element and it can not be hidden because it is used to
        //           make an certian parts of an map interactive.
        //  param --> element can only be part of object elment and it cannot be hidden directly, it
        //            can only be hidden if the parent is hidden.
        //  audio --> If this element is hidden it will still play the music, so we should still trigger
        //            violations for this element.
        // In the case that unhideableElements array is not defined then we just scan all elements and do no filtering at all.
        if (VisUtil.unhideableElements === null || VisUtil.unhideableElements === undefined || VisUtil.unhideableElements.indexOf(nodeName) === -1) {
            // Check if defaultView exists for this node, if it does then use this to run the getComputedStyle
            // function to get the CSS style for the node.
            if (node.ownerDocument.defaultView) {
                // Run the getComputedStyle on this node to fetch the CSS compuation of the node
                compStyle = node.ownerDocument.defaultView.getComputedStyle(node, null);
            }
            // In the case that defaultView does not exists return true to identify that this
            // node is visible, because were not able to detect if it was not.
            else {
                return true;
            }

            // Get the hidden element property and hidden attribute
            let hiddenAttribute = node.getAttribute("hidden");
            let hiddenPropertyCustom = CacheUtil.getCache(node, "PT_NODE_HIDDEN", undefined);
            // To get the hidden property we need to perform a special check as in some cases the hidden property will not be
            // a boolean, for theses cases we set it to false as we are not able to determine the true hidden condition.
            // The reason for this is because form elements are able to perform an override, so when we have id="hidden" for an element
            // which is under the form element then, node.hidden gives the element/list of elements which have id="hidden". Refer to
            // mozilla bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1267356
            let hiddenProperty = typeof (node as any).hidden === "boolean" ? (node as any).hidden : false;
            // If compStyle object is empty, node does't have hidden property, node does't have hidden attribute and does't have custom PT
            // hidden property then we can just return true (node visible) at this point.
            if (!compStyle &&
                !hiddenProperty && // this covers false, null, or undefined
                (hiddenAttribute === null || hiddenAttribute === undefined) &&
                !hiddenPropertyCustom // This covers false, null or undefined
            ) {
                return true;
            }

            // In the case that the compStyle is defined we check the following:
            //  CSS style display set to none
            //  CSS style visibility set to hidden
            //    Note: For this property since it is inherited, need to skip the check on parents as
            //          the parent can have hidden but the child can be visible. So we only check this property
            //          on child elements/elements that are passed to this function the first time.
            //  node hidden property set (node.hidden)
            //  node attribute hidden set (to any value)
            //  node custom hidden property ser (node.PT_NODE_HIDDEN)
            // If any of the above conditions are true then we return false as this element is not visible
            if ((compStyle !== null && ((compStyle.getPropertyValue('display') === 'none' ||
                (!CacheUtil.getCache(node, "Visibility_Check_Parent", null) && compStyle.getPropertyValue('visibility') === 'hidden'))) ||
                (compStyle.getPropertyValue('display') !== 'block'  && (hiddenProperty || hiddenAttribute != null || hiddenPropertyCustom)))) {
                // Set a custom expandos property on the the node to identify that it is hidden, so that we can uses
                // use this in the rules to determine if the node is hidden or not, if we need to.
                // Use expandos property instead of a hash map which stores the elements, adding/checking expandos
                // properties is a lot faster performance whise. For Hash map we need to store based on xpath, and to calculate
                // xpath it is more performance impact.
                CacheUtil.setCache(node, "PT_NODE_HIDDEN", true);
                return false;
            }

            // check content-visibility: if the content-visibility is hidden, then, return false as the element is not visible
            if (VisUtil.isContentHidden(node)) {
                CacheUtil.setCache(node, "PT_NODE_HIDDEN", true);
                return false;
            }
        }

        // Get the parentNode for this node, becuase we have to check all parents to make sure they do not have
        // the hidden CSS, property or attribute. Only keep checking until we are all the way back to the parentNode
        // element.
        let parentElement = DOMWalker.parentNode(node);

        // If the parent node exists and the nodetype is element (1), then run recursive call to perform the check
        // all the way up to the very parent node. Use recursive call here instead of a while loop so that we do not
        // have to duplicate the logic for checking if the node is visible or not for all the parents starting with
        // child node.
        if (parentElement != null && parentElement.nodeType === 1) {
            // When we have a parent element going through the isNodeVisible function we have to mark it as such
            // so that in the function we can skip checking visibility: hidden for parent elements since visibility: hidden
            // is inherited, which allows a child to have a different setting then the child. This property only needs to be checked
            // once for the first element that is passed down and that is all. Ignore it for all the parents that we iterate over.
            CacheUtil.setCache(parentElement as Element, "Visibility_Check_Parent", true);

            // Check upwards recursively, and save the results in an variable
            let nodeVisible = VisUtil.isNodeVisible(parentElement);

            // If the node is found to not be visible then add the custom PT_NODE_HIDDEN to true.
            // so that we can use this in the rules.
            if (!nodeVisible) {
                CacheUtil.setCache(node, "PT_NODE_HIDDEN", true);
            }

            // Check upwards recursively
            return nodeVisible;
        }

        // Return true (node is visible)
        return true;
    }

    /**
     * return true if the node or its ancestor is hidden by CSS content-visibility:hidden
     * At this time, CSS content-visibility is partially supported by Chrome & Edge, but not supported by Firefox
     * The implementation TEMPORARILY follows the Chrome test results:
     *   if content-visibility:hidden
     *      if the element is block-level (default or specified by the user), then the element and its children are normally hidden;
     *      if the element is inline (default or specified by the user), then the element and its children are normally NOT hidden; 
     * 
     * @param node
     */
    public static isContentHidden(node: Element) : boolean {
        if (!node) return false;

        const vis = CacheUtil.getCache(node, "PT_NODE_ContentHidden", undefined);
        if (vis !== undefined) return vis;    

        const style =  getComputedStyle(node);
        if (!style) {
            CacheUtil.setCache(node, "PT_NODE_ContentHidden", false);
            return false;
        }
        const content_visibility = style.getPropertyValue("content-visibility");
        if (content_visibility !== 'hidden') {
            CacheUtil.setCache(node, "PT_NODE_ContentHidden", false);
            return false;  
        } 
        const display = style.getPropertyValue("display"); 
        // inline element only
        if (display === 'inline') {
            CacheUtil.setCache(node, "PT_NODE_ContentHidden", false);
            return false;
        }  
        
        CacheUtil.setCache(node, "PT_NODE_ContentHidden", true);
        return true;
    }

    /**
     * return true if the node is offscreen by CSS position
     * @param node
     */
    public static isElementOffscreen(node: HTMLElement) : boolean {
        if (!node) return false;
        const vis = CacheUtil.getCache(node , "PT_NODE_Offscreen", undefined);
        if (vis !== undefined) return vis;  

        const mapper : DOMMapper = new DOMMapper();
        const bounds = mapper.getUnadjustedBounds(node);;    
        
        if (!bounds) {
            CacheUtil.setCache(node, "PT_NODE_Offscreen", false); 
            return false;
        }
        
        if (bounds['height'] === 0 || bounds['width'] === 0 || bounds['top'] < 0 || bounds['left'] < 0) {
            CacheUtil.setCache(node, "PT_NODE_Offscreen", true);
            return true;
        } 

        CacheUtil.setCache(node, "PT_NODE_Offscreen", false);
        return false;
    }

    /**
     * return true if the node or its ancestor is natively hidden or aria-hidden = 'true'
     * @param node
     */
    public static isNodeHiddenFromAT(node: Element) : boolean {
        const vis = CacheUtil.getCache(node, "PT_NODE_HiddenFromAT", undefined);
        if (vis !== undefined) return vis;   

        if (!VisUtil.isNodeVisible(node) || node.getAttribute("aria-hidden") === 'true') {
            CacheUtil.setCache(node, "PT_NODE_HiddenFromAT", true);
            return true;
        }    
        let ancestor = DOMUtil.getAncestorWithAttribute(node, "aria-hidden", "true");
        if (ancestor) {
            CacheUtil.setCache(node, "PT_NODE_HiddenFromAT", true);
            return true;
        }
        CacheUtil.setCache(node, "PT_NODE_HiddenFromAT", false);    
        return false;
    }

    /**
     * return true if the node or its ancestor is natively hidden or aria-hidden = 'true'
     * @param node
     */
    public static isNodePresentational(node: Element) : boolean {
        const role = AriaUtil.getResolvedRole(node);
        if (role && (role === 'none' || role === 'presentation')) return true;
        return false;
    }
}