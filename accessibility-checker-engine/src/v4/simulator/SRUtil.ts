import { AriaUtil } from "../util/AriaUtil";
import { VisUtil } from "../util/VisUtil";

export namespace SRUtil {
    export function isModalDialogElement(node: Node) {
        if (node.nodeType !== 1) return false;
        const elem = node as HTMLElement;
        const role = AriaUtil.getResolvedRole(elem, true);
        return role === "dialog" && elem.getAttribute("aria-modal") === "true" && VisUtil.isNodeVisible(node)
    }

    /**
     * Generates a unique CSS selector for a specific HTML element
     * The selector is built using a combination of:
     * 1. Element tag name
     * 2. ID (if available)
     * 3. Classes (if available)
     * 4. Attributes (if needed)
     * 5. nth-child selectors for position in parent
     * 
     * @param element The HTML element to generate a selector for
     * @param optimized If true, creates a shorter but possibly less robust selector
     * @return A CSS selector string that uniquely identifies the element
     */
    export function getUniqueSelector(element: HTMLElement, optimized: boolean = false): string {
        // If the element has an ID, that's the most direct way to select it
        if (element.id) {
            return `#${CSS.escape(element.id)}`;
        }
        
        // If we're at the root or document element, return the tag name
        if (element.isSameNode(document.documentElement) || element.isSameNode(document.body)) {
            return element.tagName.toLowerCase();
        }
        
        // Start building the selector with the tag name
        let selector = element.tagName.toLowerCase();
        
        // Add classes if available and we're not optimizing for brevity
        if (element.classList.length && !optimized) {
            // Take up to 3 classes to avoid overly specific selectors
            const classes = Array.from(element.classList).slice(0, 3);
            selector += classes.map(cls => `.${CSS.escape(cls)}`).join('');
        }
        
        // Add distinguishing attributes if needed and not optimizing
        if (!optimized) {
            // Consider adding role, aria-label, or other distinctive attributes
            if (element.hasAttribute('role')) {
                selector += `[role="${CSS.escape(element.getAttribute('role') || '')}"]`;
            }
            
            if (element.hasAttribute('aria-label')) {
                const label = element.getAttribute('aria-label') || '';
                if (label.length <= 20) { // Avoid overly long selectors
                    selector += `[aria-label="${CSS.escape(label)}"]`;
                }
            }
            
            // For inputs, add type attribute
            if (element.tagName.toLowerCase() === 'input' && element.hasAttribute('type')) {
                selector += `[type="${CSS.escape(element.getAttribute('type') || '')}"]`;
            }
        }
        
        // If we have a parent node, determine position among siblings
        if (element.parentElement) {
            // Find all siblings with the same tag
            const siblings = Array.from(element.parentElement.children)
                .filter(child => child.tagName === element.tagName);
            
            // If there's more than one sibling with the same tag, add nth-child
            if (siblings.length > 1) {
                const index = siblings.indexOf(element) + 1;
                selector += `:nth-of-type(${index})`;
            }
            
            // If we're not at the root, recursively build the parent selector
            // but use optimized selectors for ancestors to keep the overall selector manageable
            return `${getUniqueSelector(element.parentElement, true)} > ${selector}`;
        }
        
        return selector;
    }
}