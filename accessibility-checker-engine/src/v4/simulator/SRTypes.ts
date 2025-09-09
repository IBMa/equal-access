
/**
 * Result of a navigation operation
 */
export interface NavigationResult {
    /** Whether the navigation was successful */
    success: boolean;
    /** The result text if successful, or error message if not */
    message: string;
    /** The role of the element that was navigated to (if successful) */
    role?: string;
    /** The name of the element that was navigated to (if successful) */
    name?: string;
}

/**
 * Navigation mode types
 */
export type NavigationMode = "focus" | "item" | "link" | "heading" | "region" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | 
    "formcontrol" | "radio" | "button" | "checkbox" | "editbox" | "combo" | "graphic" | 
    "list" | "listitem" | "frame" | "article" | "paragraph" | "table" | "division" | 
    "tabcontrol" | "separator" | "clickable" | "mouseover" | "dom" | "tab_focus";

/**
 * Type for container changes
 */
export type ContainerChanges = { leaving: string[], entering: string[] }
