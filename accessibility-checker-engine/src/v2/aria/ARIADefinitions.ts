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

/*global OpenAjax*/
// all references to WAI-ARIA specification is the WAI-ARIA 1.2
// https://www.w3.org/TR/wai-aria-1.2/

export class ARIADefinitions {
    static nameFromContent(role: string) : boolean {
        return (role in ARIADefinitions.designPatterns) 
            && ARIADefinitions.designPatterns[role].nameFrom 
            && ARIADefinitions.designPatterns[role].nameFrom.includes("contents");
    }

    /*
     * array of WAI-ARIA global states and properties
     * @see https://www.w3.org/TR/wai-aria-1.2/#global_states
     */
    static globalProperties : string[] = ["aria-atomic", "aria-busy", "aria-controls", "aria-current", "aria-describedby", 
        "aria-details", "aria-dropeffect", "aria-flowto", "aria-grabbed", "aria-hidden", "aria-keyshortcuts",
        "aria-label", "aria-labelledby", "aria-live", "aria-owns", "aria-relevant", "aria-roledescription"];

    /*
     * XSD data types for all WAI-ARIA properties
     * along with valid values when the data type is NMTOKEN
     * WAI-ARIA properties data types explaned:
     *  type: Used to identify the type of values allowed for the WAI-ARIA property
     *  values: Used to identify specific values of an WAI-ARIA property when type is nmtoken
     *  hiddenIDRefSupported: Used to identify if the WAI-ARIA property supports referencing hidden ID
     *                          true: refers to WAI-ARIA property supports hidden ID references
     *                          false: refers to WAI-ARIA property does not support hidden ID references
     *                        Default value will be set to false, if not specified.
     */
    static propertyDataTypes : { 
        [prop: string] : { 
            type: string, 
            hiddenIDRefSupported?: boolean,
            values?: string[] 
        }
    } = {
        "aria-activedescendant": {
            type: "http://www.w3.org/2001/XMLSchema#idref",
            hiddenIDRefSupported: true
        },
        "aria-atomic": {
            type: "http://www.w3.org/2001/XMLSchema#boolean"
        },
        "aria-autocomplete": {
            type: "http://www.w3.org/2001/XMLSchema#nmtoken",
            values: ["inline", "list", "both", "none", "undefined"] //add undefined to handle value empty
        },
        "aria-busy": {
            type: "http://www.w3.org/2001/XMLSchema#boolean"
        },
        "aria-checked": {
            type: "http://www.w3.org/2001/XMLSchema#nmtoken",
            values: ["true", "false", "mixed", "undefined"]
        },
        "aria-colcount": {
            type: "http://www.w3.org/2001/XMLSchema#int"
        },
        "aria-colindex": {
            type: "http://www.w3.org/2001/XMLSchema#int"
        },
        "aria-colspan": {
            type: "http://www.w3.org/2001/XMLSchema#int"
        },
        "aria-controls": {
            type: "http://www.w3.org/2001/XMLSchema#idrefs",
            hiddenIDRefSupported: true
        },
        "aria-current": {
            type: "http://www.w3.org/2001/XMLSchema#nmtoken",
            values: ["page", "step", "location", "date", "time", "true", "false", "undefined"] //add undefined for empty value
        },
        "aria-describedby": {
            type: "http://www.w3.org/2001/XMLSchema#idrefs",
            hiddenIDRefSupported: true
        },
        "aria-details": {
            type: "http://www.w3.org/2001/XMLSchema#idrefs"
        },
        "aria-disabled": {
            type: "http://www.w3.org/2001/XMLSchema#boolean"
        },
        "aria-dropeffect": {
            type: "http://www.w3.org/2001/XMLSchema#nmtokens",
            values: ["copy", "move", "link", "execute", "popup", "none"]
        },
        "aria-errormessage": {
            type: "http://www.w3.org/2001/XMLSchema#idrefs",
            hiddenIDRefSupported: true
        },
        "aria-expanded": {
            type: "http://www.w3.org/2001/XMLSchema#nmtoken",
            values: ["true", "false", "undefined"]
        },
        "aria-flowto": {
            type: "http://www.w3.org/2001/XMLSchema#idrefs",
            hiddenIDRefSupported: false
        },
        "aria-grabbed": {
            type: "http://www.w3.org/2001/XMLSchema#nmtoken",
            values: ["true", "false", "undefined"]
        },
        "aria-haspopup": {
            type: "http://www.w3.org/2001/XMLSchema#nmtoken",
            values: ["true", "false", "menu", "listbox", "tree", "grid", "dialog"]
        },
        "aria-hidden": {
            type: "http://www.w3.org/2001/XMLSchema#nmtoken",
            values: ["true", "false", "undefined"]
        },
        "aria-invalid": {
            type: "http://www.w3.org/2001/XMLSchema#nmtoken",
            values: ["true", "false", "spelling", "grammar", "undefined"] //add undefined for empty value
        },
        "aria-keyshortcuts": {
            type: "http://www.w3.org/2001/XMLSchema#string"
        },
        "aria-label": {
            type: "http://www.w3.org/2001/XMLSchema#string"
        },
        "aria-labelledby": {
            type: "http://www.w3.org/2001/XMLSchema#idrefs",
            hiddenIDRefSupported: true
        },
        "aria-level": {
            type: "http://www.w3.org/2001/XMLSchema#int"
        },
        "aria-live": {
            type: "http://www.w3.org/2001/XMLSchema#nmtoken",
            values: ["off", "polite", "assertive"]
        },
        "aria-modal": {
            type: "http://www.w3.org/2001/XMLSchema#boolean"
        },
        "aria-multiline": {
            type: "http://www.w3.org/2001/XMLSchema#boolean"
        },
        "aria-multiselectable": {
            type: "http://www.w3.org/2001/XMLSchema#boolean"
        },
        "aria-orientation": {
            type: "http://www.w3.org/2001/XMLSchema#nmtoken",
            values: ["horizontal", "vertical", "undefined"]
        },
        "aria-owns": {
            type: "http://www.w3.org/2001/XMLSchema#idrefs",
            hiddenIDRefSupported: true
        },
        "aria-placeholder": {
            type: "http://www.w3.org/2001/XMLSchema#string"
        },
        "aria-posinset": {
            type: "http://www.w3.org/2001/XMLSchema#int"
        },
        "aria-pressed": {
            type: "http://www.w3.org/2001/XMLSchema#nmtoken",
            values: ["true", "false", "mixed", "undefined"]
        },
        "aria-readonly": {
            type: "http://www.w3.org/2001/XMLSchema#boolean"
        },
        "aria-relevant": {
            type: "http://www.w3.org/2001/XMLSchema#nmtokens",
            values: ["additions", "removals", "text", "all"]
        },
        "aria-required": {
            type: "http://www.w3.org/2001/XMLSchema#boolean"
        },
        "aria-roledescription": {
            type: "http://www.w3.org/2001/XMLSchema#string"
        },
        "aria-rowcount": {
            type: "http://www.w3.org/2001/XMLSchema#int"
        },
        "aria-rowindex": {
            type: "http://www.w3.org/2001/XMLSchema#int"
        },
        "aria-rowspan": {
            type: "http://www.w3.org/2001/XMLSchema#int"
        },
        "aria-selected": {
            type: "http://www.w3.org/2001/XMLSchema#nmtoken",
            values: ["true", "false", "undefined"]
        },
        "aria-setsize": {
            type: "http://www.w3.org/2001/XMLSchema#int"
        },
        "aria-sort": {
            type: "http://www.w3.org/2001/XMLSchema#nmtoken",
            values: ["ascending", "descending", "other", "none"]
        },
        "aria-valuemax": {
            type: "http://www.w3.org/2001/XMLSchema#decimal"
        },
        "aria-valuemin": {
            type: "http://www.w3.org/2001/XMLSchema#decimal"
        },
        "aria-valuenow": {
            type: "http://www.w3.org/2001/XMLSchema#decimal"
        },
        "aria-valuetext": {
            type: "http://www.w3.org/2001/XMLSchema#string"
        }
    }

    /*
     * design patterns for concrete WAI-ARIA roles
     * legitimate keys for each role include:
     *
     * - container: appropriate container(s) for that role
     * - props: states and properties that may be associated with this role (in addition to the global states and properties listed above)
     * - reqProps: required states or properties for this role
     * - reqChildren: required children for this role
     * - htmlEquiv: HTML equivalent for this role
     * - roleType: one of widget, structure, landmark, liveRegion, window (as seen in https://www.w3.org/TR/wai-aria-1.2/#roles_categorization)
     * - nameRequired: determines whether an accessible name is required for a widget (see ARIA spec.)
     * - nameFrom: determines how an accessible name is supplied (author or content - see ARIA spec.)
     * - deprecated: if present, indicates that the role is deprecated, and provides a list of alternative role(s)
     */
    static designPatterns : {
        [role: string]: {
            container: string[],
            props: string[],
            reqProps: string[],
            reqChildren: string[],
            htmlEquiv: string,
            roleType?: string,
            nameRequired?: boolean,
            nameFrom?: string[],
            presentationalChildren?: boolean,
            deprecated?: string[]
        }
    } = {
        "alert": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "liveRegion",
            nameRequired: false,
            nameFrom: ["author"]
        },

        "alertdialog": {
            container: null,
            props: ["aria-modal"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "window",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "application": {
            container: null,
            props: ["aria-activedescendant", "aria-disabled", "aria-errormessage", "aria-expanded", "aria-haspopup", "aria-invalid"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure", // or can be "widget"
            nameRequired: true,
            nameFrom: ["author"]
        },

        "article": {
            container: null,
            props: ["aria-posinset", "aria-setsize"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["author"]
        },

        "banner": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameFrom: ["author"]
        },

        "blockquote": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["author"]
        },

        "button": {
            container: null,
            props: ["aria-disabled", "aria-expanded", "aria-haspopup", "aria-pressed"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "button | input[@type='button']",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"],
            presentationalChildren: true
        },

        "caption": {
            container: ["figure", "grid", "table", "treegrid"],
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"]
        },

        "cell": {
            container: ["row"],
            props: ["aria-colindex", "aria-colspan", "aria-rowindex", "aria-rowspan"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "td",
            roleType: "structure",
            nameFrom: ["author", "contents"]
        },

        "checkbox": {
            container: null,
            props: ["aria-disabled", "aria-errormessage", "aria-expanded", "aria-invalid", "aria-readonly", "aria-required"],
            reqProps: ["aria-checked"],
            reqChildren: null,
            htmlEquiv: "input[@type='checkbox']",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"],
            presentationalChildren: true
        },

        "code": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"]
        },

        "columnheader": {
            container: ["row"],
            props: ["aria-colindex", "aria-colspan", "aria-disabled", "aria-errormessage", "aria-expanded", "aria-haspopup", "aria-invalid", "aria-readonly", "aria-required", "aria-rowindex", "aria-rowspan", "aria-selected", "aria-sort"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "th[@scope='col']",
            roleType: "structure",
            nameRequired: true,
            nameFrom: ["author", "contents"]
        },

        "combobox": {
            container: null,
            props: ["aria-controls", "aria-activedescendant", "aria-autocomplete", "aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid", "aria-readonly", "aria-required"],
            reqProps: ["aria-expanded"], // aria-controls isn't actually required when aria-expanded="false"
            reqChildren: [],
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "complementary": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameFrom: ["author"]
        },

        "contentinfo": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameFrom: ["author"]
        },

        "definition": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["author"]
        },

        "deletion": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"]
        },

        "dialog": {
            container: null,
            props: ["aria-modal"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "window",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "directory": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["author"],
            deprecated: ["list"] // TODO
        },

        "document": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameRequired: false,
            nameFrom: ["author"]
        },

        "emphasis": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"]
        },

        "feed": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: ["article"],
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["author"]
        },

        "figure": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["author"]
        },

        "form": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "form",
            roleType: "landmark",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "generic": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"]
        },

        "graphics-document": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            nameRequired: true,
            nameFrom: ["author"]
        },
        
        "graphics-object": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            nameRequired: false,
            nameFrom: ["contents", "author"]
        },
        
        "graphics-symbol": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            nameRequired: true,
            nameFrom: ["author"],
            presentationalChildren: true
        },
        
        "grid": {
            container: null,
            props: ["aria-activedescendant", "aria-colcount", "aria-disabled", "aria-multiselectable", "aria-readonly", "aria-rowcount"],
            reqProps: null,
            reqChildren: ["row", "rowgroup"], // rowgroup is not required, but it is allowed
            htmlEquiv: "table",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "gridcell": {
            container: ["row"],
            props: ["aria-colindex", "aria-colspan", "aria-disabled", "aria-errormessage", "aria-expanded", "aria-haspopup", "aria-invalid", "aria-readonly", "aria-required", "aria-rowindex", "aria-rowspan", "aria-selected"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "td",
            roleType: "widget",
            nameFrom: ["author", "contents"]
        },

        "group": {
            container: null,
            props: ["aria-activedescendant", "aria-disabled"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["author"]
        },

        "heading": {
            container: null,
            props: null,
            reqProps: ["aria-level"],
            reqChildren: null,
            htmlEquiv: "h1 | h2 | h3 | h4 | h5 | h6",
            roleType: "structure",
            nameRequired: true,
            nameFrom: ["author", "contents"]
        },

        "img": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "img",
            roleType: "structure",
            nameRequired: true,
            nameFrom: ["author"],
            presentationalChildren: true
        },

        "insertion": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"]
        },

        "link": {
            container: null,
            props: ["aria-disabled", "aria-expanded", "aria-haspopup"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "a | link",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"]
        },

        "list": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: ["listitem"],
            htmlEquiv: "ol | ul",
            roleType: "structure",
            nameFrom: ["author"]
        },

        "listbox": {
            container: null,
            props: ["aria-activedescendant", "aria-disabled", "aria-errormessage", "aria-expanded", "aria-invalid", "aria-multiselectable", "aria-orientation", "aria-readonly", "aria-required"],
            reqProps: null,
            reqChildren: ["group", "option"], // group is not required, but it is allowed
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "listitem": {
            container: ["directory", "list"],
            props: ["aria-level", "aria-posinset", "aria-setsize"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "li",
            roleType: "structure",
            nameFrom: ["author"]
        },

        "log": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "liveRegion",
            nameFrom: ["author"]
        },

        "main": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameFrom: ["author"]
        },

        "marquee": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "liveRegion",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "math": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["author"],
            presentationalChildren: false
        },

        "menu": {
            container: null,
            props: ["aria-activedescendant", "aria-disabled", "aria-orientation"],
            reqProps: null,
            reqChildren: ["group", "menuitem", "menuitemcheckbox", "menuitemradio"], // group is not required, but it is allowed
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: false,
            nameFrom: ["author"]
        },

        "menubar": {
            container: null,
            props: ["aria-activedescendant", "aria-disabled", "aria-orientation"],
            reqProps: null,
            reqChildren: ["group", "menuitem", "menuitemcheckbox", "menuitemradio"], // group is not required, but it is allowed
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: false, 
            nameFrom: ["author"]
        },

        "menuitem": {
            container: ["group", "menu", "menubar"], // group only counts as a valid container if it is contained in a menu or menubar
            props: ["aria-disabled", "aria-expanded", "aria-haspopup", "aria-posinset", "aria-setsize"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"]
        },

        "menuitemcheckbox": {
            container: ["group", "menu", "menubar"], // group only counts as a valid container if it is contained in a menu or menubar
            props: ["aria-disabled", "aria-expanded", "aria-haspopup", "aria-posinset", "aria-setsize"],
            reqProps: ["aria-checked"],
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"],
            presentationalChildren: true
        },

        "menuitemradio": {
            container: ["group", "menu", "menubar"], // group only counts as a valid container if it is contained in a menu or menubar
            props: ["aria-disabled", "aria-expanded", "aria-haspopup", "aria-posinset", "aria-setsize"],
            reqProps: ["aria-checked"],
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"],
            presentationalChildren: true
        },

        "meter": {
            container: null,
            props: ["aria-valuemax", "aria-valuemin", "aria-valuetext"],
            reqProps: ["aria-valuenow"],
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameRequired: true,
            nameFrom: ["author"],
            presentationalChildren: true
        },

        "navigation": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameFrom: ["author"]
        },

        "none": {
            container: null,
            props: [],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
        },

        "note": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["author"]
        },

        "option": {
            container: ["group", "listbox"], // group only counts as a valid container if it is contained in a listbox
            props: ["aria-selected", "aria-checked", "aria-disabled", "aria-posinset", "aria-setsize"],
            reqProps: null, // "aria-selected" has a default
            reqChildren: null,
            htmlEquiv: "option",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"],
            presentationalChildren: true
        },

        "paragraph": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"]
        },

        "presentation": {
            container: null,
            props: [],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
        },

        "progressbar": {
            container: null,
            props: ["aria-valuemax", "aria-valuemin", "aria-valuenow", "aria-valuetext"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"],
            presentationalChildren: true
        },

        "radio": {
            container: null,
            props: ["aria-disabled", "aria-posinset", "aria-setsize"],
            reqProps: ["aria-checked"],
            reqChildren: null,
            htmlEquiv: "input[@type='radio']",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"],
            presentationalChildren: true
        },

        "radiogroup": {
            container: null,
            props: ["aria-activedescendant", "aria-disabled", "aria-errormessage", "aria-invalid", "aria-orientation", "aria-readonly", "aria-required"],
            reqProps: null,
            reqChildren: ["radio"],
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "region": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "row": {
            container: ["grid", "rowgroup", "table", "treegrid"],
            props: ["aria-activedescendant", "aria-colindex", "aria-disabled", "aria-expanded", "aria-level", "aria-posinset", "aria-rowindex", "aria-selected", "aria-setsize"],
            reqProps: null,
            reqChildren: ["cell", "columnheader", "gridcell", "rowheader"],
            htmlEquiv: "tr",
            roleType: "structure",
            nameFrom: ["author", "contents"]
        },

        "rowgroup": {
            container: ["grid", "table", "treegrid"],
            props: [],
            reqProps: null,
            reqChildren: ["row"],
            htmlEquiv: "tbody | tfoot | thead",
            roleType: "structure",
            nameFrom: ["author"]
        },

        "rowheader": {
            container: ["row"],
            props: ["aria-colindex", "aria-colspan", "aria-disabled", "aria-errormessage", "aria-expanded", "aria-haspopup", "aria-invalid", "aria-readonly", "aria-required", "aria-rowindex", "aria-rowspan", "aria-selected", "aria-sort"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "th[@scope='row']",
            roleType: "structure",
            nameRequired: true,
            nameFrom: ["author", "contents"]
        },

        "scrollbar": {
            container: null,
            props: ["aria-disabled", "aria-orientation", "aria-valuemax", "aria-valuemin", "aria-valuetext"],
            reqProps: ["aria-controls", "aria-valuenow"],
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: false,
            nameFrom: ["author"],
            presentationalChildren: true
        },

        "search": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameFrom: ["author"]
        },

        "searchbox": {
            container: null,
            props: ["aria-activedescendant", "aria-autocomplete", "aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid", "aria-multiline", "aria-placeholder", "aria-readonly", "aria-required"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "input[@type='search']",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "separator": {
            container: null,
            props: ["aria-orientation"], // aria-disabled, aria-valuemax, aria-valuemin, aria-valuetext are valid if focusable. This is handled in the code.
            reqProps: null, // aria-valuenow is required if focusable. This is handled in the code.
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure", // or widget if focusable
            nameFrom: ["author"],
            presentationalChildren: true
        },

        "slider": {
            container: null,
            props: ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid", "aria-orientation", "aria-readonly", "aria-valuemax", "aria-valuemin", "aria-valuetext"],
            reqProps: ["aria-valuenow"],
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"],
            presentationalChildren: true
        },

        "spinbutton": {
            container: null,
            props: ["aria-activedescendant", "aria-disabled", "aria-errormessage", "aria-invalid", "aria-readonly", "aria-required", "aria-valuemax", "aria-valuemin", "aria-valuenow", "aria-valuetext"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "status": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "liveRegion",
            nameFrom: ["author"]
        },

        "strong": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"]
        },

        "subscript": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"]
        },

        "superscript": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"]
        },

        "switch": {
            container: null,
            props: ["aria-disabled", "aria-errormessage", "aria-expanded", "aria-invalid", "aria-readonly", "aria-required"],
            reqProps: ["aria-checked"],
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"],
            presentationalChildren: true
        },

        "tab": {
            container: ["tablist"],
            props: ["aria-disabled", "aria-expanded", "aria-haspopup", "aria-posinset", "aria-selected", "aria-setsize"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameFrom: ["author", "contents"],
            presentationalChildren: true
        },

        "table": {
            container: null,
            props: ["aria-colcount", "aria-rowcount"],
            reqProps: null,
            reqChildren: ["row", "rowgroup"], // rowgroup is not required, but it is allowed
            htmlEquiv: "table",
            roleType: "structure",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "tablist": {
            container: null,
            props: ["aria-activedescendant", "aria-disabled", "aria-multiselectable", "aria-orientation"],
            reqProps: null,
            reqChildren: ["tab"],
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: false, 
            nameFrom: ["author"]
        },

        "tabpanel": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "term": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "dfn",
            roleType: "structure",
            nameFrom: ["author"]
        },

        "textbox": {
            container: null,
            props: ["aria-activedescendant", "aria-autocomplete", "aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid", "aria-multiline", "aria-placeholder", "aria-readonly", "aria-required"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "input[@type='text']",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "time": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["author"]
        },

        "timer": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "liveRegion",
            nameFrom: ["author"]
        },

        "toolbar": {
            container: null,
            props: ["aria-activedescendant", "aria-disabled", "aria-orientation"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["author"]
        },

        "tooltip": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameRequired: false, // ARIA 1.2 has this as nameRequired: true, but ARIA 1.3 removed it because it makes no sense to require a name on a tooltip.
            nameFrom: ["author", "contents"]
        },

        "tree": {
            container: null,
            props: ["aria-activedescendant", "aria-disabled", "aria-errormessage", "aria-invalid", "aria-multiselectable", "aria-orientation", "aria-required"],
            reqProps: null,
            reqChildren: ["group", "treeitem"], // group is not required, but it is allowed
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "treegrid": {
            container: null,
            props: ["aria-activedescendant", "aria-colcount", "aria-disabled", "aria-errormessage", "aria-invalid", "aria-multiselectable", "aria-orientation", "aria-readonly", "aria-required", "aria-rowcount"],
            reqProps: null,
            reqChildren: ["row", "rowgroup"], // rowgroup is not required, but it is allowed
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "treeitem": {
            container: ["group", "tree"],
            props: ["aria-checked", "aria-disabled", "aria-expanded", "aria-haspopup", "aria-level", "aria-posinset", "aria-selected", "aria-setsize"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"]
        },
    } // end designPatterns

    // copied from https://html.spec.whatwg.org/multipage/semantics-other.html#disabled-elements
    // https://html.spec.whatwg.org/multipage/input.html#input-type-attr-summary
    static elementsAllowedDisabled = ["button", "input", "select", "textarea", "optgroup", "option", "fieldset"]; // also form-associated custom element
    static elementsAllowedRequired = ["input", "select", "textarea"]; // required is not supported on input@type="range", "color", "hidden" or any button types
    static elementsAllowedReadOnly = ["input", "textarea"]; // readonly is not supported on input@type="checkbox", "radio", "range", "color", "file", hidden" or any button types


    /* https://www.w3.org/TR/html-aria/#docconformance
        * documentConformanceRequirement contains properties of the tags related to role without any additional attribute value
        * documentConformanceRequirementSpecialTags contains those tags that require special considerations
        */
    static documentConformanceRequirement: { 
        [role: string]: {
            implicitRole: string[],
            validRoles: string[],
            globalAriaAttributesValid: boolean
        }
    } = {
        "abbr": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "address": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "article": {
            implicitRole: ["article"],
            validRoles: ["application", "document", "feed", "main", "none", "presentation", "region"],
            globalAriaAttributesValid: true
        },
        "aside": {
            implicitRole: ["complementary"],
            validRoles: ["doc-dedication", "doc-example", "doc-footnote", "doc-pullquote", "doc-tip", "feed", "none", "note", "presentation", "region", "search"],
            globalAriaAttributesValid: true
        },
        "audio": {
            implicitRole: null,
            validRoles: ["application"],
            globalAriaAttributesValid: true
        },
        "b": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "base": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "bdi": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "bdo": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "blockquote": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "body": {
            implicitRole: ["document"],
            validRoles: null,
            globalAriaAttributesValid: true
        },
        "br": {
            implicitRole: null,
            validRoles: ["none", "presentation"],
            globalAriaAttributesValid: true
        },
        "button": {
            implicitRole: ["button"],
            validRoles: ["checkbox", "link", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "switch", "tab"],
            globalAriaAttributesValid: true
        },
        "canvas": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "caption": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: true
        },
        "cite": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "code": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "col": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "colgroup": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "data": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "datalist": {
            implicitRole: ["listbox"],
            validRoles: null,
            globalAriaAttributesValid: true
        },
        "dd": {
            implicitRole: ["definition"],
            validRoles: null,
            globalAriaAttributesValid: true
        },
        "del": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "details": {
            implicitRole: ["group"],
            validRoles: null,
            globalAriaAttributesValid: true
        },
        "dfn": {
            implicitRole: ["term"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "dialog": {
            implicitRole: ["dialog"],
            validRoles: ["alertdialog"],
            globalAriaAttributesValid: true
        },
        "div": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "dl": {
            implicitRole: null,
            validRoles: ["group", "list", "none", "presentation"],
            globalAriaAttributesValid: true
        },
        "dt": {
            implicitRole: ["term"],
            validRoles: ["listitem"],
            globalAriaAttributesValid: true
        },
        "em": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "embed": {
            implicitRole: null,
            validRoles: ["application", "document", "img", "none", "presentation"],
            globalAriaAttributesValid: true
        },
        "fieldset": {
            implicitRole: ["group"],
            validRoles: ["none", "presentation", "radiogroup"],
            globalAriaAttributesValid: true
        },
        "figcaption": {
            implicitRole: null,
            validRoles: ["group", "none", "presentation"],
            globalAriaAttributesValid: true
        },
        "head": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "h1": {
            implicitRole: ["heading"],
            validRoles: ["doc-subtitle", "none", "presentation", "tab"],
            globalAriaAttributesValid: true
        },
        "h2": {
            implicitRole: ["heading"],
            validRoles: ["doc-subtitle", "none", "presentation", "tab"],
            globalAriaAttributesValid: true
        },
        "h3": {
            implicitRole: ["heading"],
            validRoles: ["doc-subtitle", "none", "presentation", "tab"],
            globalAriaAttributesValid: true
        },
        "h4": {
            implicitRole: ["heading"],
            validRoles: ["doc-subtitle", "none", "presentation", "tab"],
            globalAriaAttributesValid: true
        },
        "h5": {
            implicitRole: ["heading"],
            validRoles: ["doc-subtitle", "none", "presentation", "tab"],
            globalAriaAttributesValid: true
        },
        "h6": {
            implicitRole: ["heading"],
            validRoles: ["doc-subtitle", "none", "presentation", "tab"],
            globalAriaAttributesValid: true
        },
        "hgroup": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "hr": {
            implicitRole: ["separator"],
            validRoles: ["doc-pagebreak", "none", "presentation"],
            globalAriaAttributesValid: true
        },
        "html": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "i": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "iframe": {
            implicitRole: null,
            validRoles: ["application", "document", "img", "none", "presentation"],
            globalAriaAttributesValid: true
        },
        "ins": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "kbd": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "label": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: true
        },
        "legend": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: true
        },
        "li": {
            implicitRole: ["listitem"],
            validRoles: ["doc-biblioentry", "doc-endnote", "menuitem", "menuitemcheckbox", "menuitemradio", "none", "option", "presentation", "radio", "separator", "tab", "treeitem"],
            globalAriaAttributesValid: true
        },
        "link": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "main": {
            implicitRole: ["main"],
            validRoles: null,
            globalAriaAttributesValid: true
        },
        "map": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "mark": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "math": {
            implicitRole: ["math"],
            validRoles: null,
            globalAriaAttributesValid: true
        },
        "menu": {
            implicitRole: ["list"],
            validRoles: ["directory", "group", "listbox", "menu", "menubar", "none", "presentation", "radiogroup", "tablist", "toolbar", "tree"],
            globalAriaAttributesValid: true
        },
        "meta": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "meter": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: true
        },
        "nav": {
            implicitRole: ["navigation"],
            validRoles: ["doc-index", "doc-pagelist", "doc-toc", "menu", "menubar", "tablist"],
            globalAriaAttributesValid: true
        },
        "noscript": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "object": {
            implicitRole: null,
            validRoles: ["application", "document", "img"],
            globalAriaAttributesValid: true
        },
        "ol": {
            implicitRole: ["list"],
            validRoles: ["directory", "group", "listbox", "menu", "menubar", "none", "presentation", "radiogroup", "tablist", "toolbar", "tree"],
            globalAriaAttributesValid: true
        },
        "optgroup": {
            implicitRole: ["group"],
            validRoles: null,
            globalAriaAttributesValid: true
        },
        "option": {
            implicitRole: ["option"],
            validRoles: null,
            globalAriaAttributesValid: true
        },
        "output": {
            implicitRole: ["status"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "p": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "param": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "picture": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "pre": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "progress": {
            implicitRole: ["progressbar"],
            validRoles: null,
            globalAriaAttributesValid: true
        },
        "q": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "rp": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "rt": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "ruby": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "s": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "samp": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "script": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "slot": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "small": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "source": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "span": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "strong": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "style": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "sub": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "summary": {
            implicitRole: ["button"],
            validRoles: null,
            globalAriaAttributesValid: true
        },
        "sup": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "svg": {
            implicitRole: ["graphics-document"], // as defined by SVG AAM
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "table": {
            implicitRole: ["table"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "tbody": {
            implicitRole: ["rowgroup"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "template": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "textarea": {
            implicitRole: ["textbox"],
            validRoles: null,
            globalAriaAttributesValid: true
        },
        "tfoot": {
            implicitRole: ["rowgroup"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "thead": {
            implicitRole: ["rowgroup"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "time": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "title": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "track": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "u": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "ul": {
            implicitRole: ["list"],
            validRoles: ["directory", "group", "listbox", "menu", "menubar", "none", "presentation", "radiogroup", "tablist", "toolbar", "tree"],
            globalAriaAttributesValid: true
        },
        "var": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "video": {
            implicitRole: null,
            validRoles: ["application"],
            globalAriaAttributesValid: true
        },
        "wbr": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        }
    } // end documentConformanceRequirement

    static documentConformanceRequirementSpecialTags: {

    } = {
        "a": {
            "with-href": {
                implicitRole: ["link"],
                //roleCondition: " when non-empty href attribute is present",
                validRoles: ["button", "checkbox", "doc-backlink", "doc-biblioref", "doc-glossref", "doc-noteref", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "switch", "tab", "treeitem"],
                globalAriaAttributesValid: true
            },
            "without-href": {
                implicitRole: null,
                //roleCondition: " when href attribute is not present",
                validRoles: ["any"],
                globalAriaAttributesValid: true
            }
        },
        "area": {
            "with-href": {
                implicitRole: ["link"],
                //roleCondition: " when non-empty href attribute is present",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "without-href": {
                implicitRole: null,
                //roleCondition: " when href attribute is not present",
                validRoles: null,
                globalAriaAttributesValid: true
            }
        },
// TODO
//        "autonomous custom element": {
//            implicitRole: ["Role exposed from author defined ElementInternals. Otherwise no corresponding role."],
//            validRoles: ["If role defined by ElementInternals", "any role", "no role Otherwise"],
//            globalAriaAttributesValid: true
//        },

        "figure": {
            "child-figcaption": {
                implicitRole: ["figure"],
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "no-child-figcaption": {
                implicitRole: ["figure"],
                validRoles: ["any"],
                globalAriaAttributesValid: true
            }
        },
        "footer": {
            "des-section-article": {
                implicitRole: null,
                //roleCondition: " when descendant of an article, aside, main, nav or section element",
                validRoles: ["doc-footnote", "group", "none", "presentation"],
                globalAriaAttributesValid: true
            },
            "not-des-section-article": {
                implicitRole: ["contentinfo"],
                //roleCondition: " when not a descendant of an article, aside, main, nav or section element",
                validRoles: ["doc-footnote", "group", "none", "presentation"],
                globalAriaAttributesValid: true
            }
        },
        "form": {
            "with-name": {
                implicitRole: ["form"],
                //roleCondition: " when accessible name is present",
                validRoles: ["none", "presentation", "search"],
                globalAriaAttributesValid: true
            },
            "without-name": {
                implicitRole: null,
                //roleCondition: " when accessible name is not present",
                validRoles: ["none", "presentation", "search"],
                globalAriaAttributesValid: true
            }
        },
// TODO
//        "form-associated custom element": {
//            implicitRole: ["Role exposed from author defined ElementInternals. Otherwise no corresponding role."],
//            validRoles: ["If role defined by ElementInternals", "form-related roles: button", "checkbox", "combobox", "group", "listbox", "progressbar", "radio", "radiogroup", "searchbox", "slider", "spinbutton", "switch", "textbox", "no role Otherwise"],
//            globalAriaAttributesValid: true
//        },

        "header": {
            "des-section-article": {
                implicitRole: null,
                //roleCondition: " when descendant of an article, aside, main, nav or section element",
                validRoles: ["group", "none", "presentation"],
                globalAriaAttributesValid: true
            },
            "not-des-section-article": {
                implicitRole: ["banner"],
                //roleCondition: " when not a descendant of an article, aside, main, nav or section element",
                validRoles: ["group", "none", "presentation"],
                globalAriaAttributesValid: true
            }

        },
        "img": {
            "img-with-alt-text": {
                implicitRole: ["img"],
                //roleCondition: " when alt attribute has text (is not empty)",
                validRoles: ["button", "checkbox", "doc-cover", "link", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "progressbar", "scrollbar", "separator", "slider", "switch", "tab", "treeitem"],
                globalAriaAttributesValid: true
            },
            "img-with-empty-alt": {
                implicitRole: ["presentation"],
                //roleCondition: " when alt attribute is empty",
                validRoles: null,
                globalAriaAttributesValid: false // TODO aria-hidden="true" is allowed
            },
            "img-without-alt": {
                implicitRole: ["img"],
                //roleCondition: " when alt attribute, aria-label, or aria-labelledby are not present",
                validRoles: null,
                globalAriaAttributesValid: false // TODO aria-hidden="true" is allowed
            }
        },
        "input": {
            "button": {
                implicitRole: ["button"],
                validRoles: ["link", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "switch", "tab"],
                globalAriaAttributesValid: true
            },
            "checkbox-with-aria-pressed": {
                implicitRole: ["checkbox"],
                //roleCondition: " with type=checkbox and aria-pressed attribute is present",
                validRoles: ["button"],
                globalAriaAttributesValid: true
            },
            "checkbox-without-aria-pressed": {
                implicitRole: ["checkbox"],
                //roleCondition: " with type=checkbox and aria-pressed attribute is not present",
                validRoles: ["menuitemcheckbox", "option", "switch"],
                globalAriaAttributesValid: true
            },
            "color": {
                implicitRole: null,
                //roleCondition: " with type=color",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "date": {
                implicitRole: null,
                //roleCondition: " with type=date",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "datetime-local": {
                implicitRole: null,
                //roleCondition: " with type=datetime",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "email-no-list": {
                implicitRole: ["textbox"],
                //roleCondition: " with type=email and no list attribute is present",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "email-with-list": {
                implicitRole: ["combobox"],
                //roleCondition: " with type=email and a list attribute is present",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "file": {
                implicitRole: null,
                //roleCondition: " with type=file",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "hidden": {
                implicitRole: null,
                //roleCondition: " with type=hidden",
                validRoles: null,
                globalAriaAttributesValid: false
            },
            "image": {
                implicitRole: ["button"],
                //roleCondition: " with type=image",
                validRoles: ["link", "menuitem", "menuitemcheckbox", "menuitemradio", "radio", "switch"],
                globalAriaAttributesValid: true
            },
            "month": {
                implicitRole: null,
                //roleCondition: " with type=month",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "number": {
                implicitRole: ["spinbutton"],
                //roleCondition: " with type=number",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "password": {
                implicitRole: null,
                //roleCondition: " with type=password",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "radio": {
                implicitRole: ["radio"],
                //roleCondition: " with type=radio",
                validRoles: ["menuitemradio"],
                globalAriaAttributesValid: true
            },
            "range": {
                implicitRole: ["slider"],
                //roleCondition: " with type=radio",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "reset": {
                implicitRole: ["button"],
                //roleCondition: " with type=reset",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "search-no-list": {
                implicitRole: ["searchbox"],
                //roleCondition: " with type=search and no list attribute is present",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "search-with-list": {
                implicitRole: ["combobox"],
                //roleCondition: " with type=search and a list attribute is present",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "submit": {
                implicitRole: ["button"],
                //roleCondition: " with type=submit",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "tel-no-list": {
                implicitRole: ["textbox"],
                //roleCondition: " with type=tel and no list attribute is present",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "tel-with-list": {
                implicitRole: ["combobox"],
                //roleCondition: " with type=tel and a list attribute is present",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "text-no-list": {
                implicitRole: ["textbox"],
                //roleCondition: " with type=text and no list attribute is present",
                validRoles: ["combobox", "searchbox", "spinbutton"],
                globalAriaAttributesValid: true
            },
            "text-with-list": {
                implicitRole: ["combobox"],
                //roleCondition: " with type=text and a list attribute is present",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "time": {
                implicitRole: null,
                //roleCondition: " with type=time",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "url-no-list": {
                implicitRole: ["textbox"],
                //roleCondition: " with type=url and no list attribute is present",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "url-with-list": {
                implicitRole: ["combobox"],
                //roleCondition: " with type=url and a list attribute is present",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "week": {
                implicitRole: null,
                //roleCondition: " with type=week",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "default": {
                implicitRole: null,
                //roleCondition: "",
                validRoles: null,
                globalAriaAttributesValid: true
            }
        },
        "section": {
            "with-name": {
                implicitRole: ["region"],
                //roleCondition: " when accessible name is present",
                validRoles: ["alert", "alertdialog", "application", "banner", "complementary", "contentinfo", "dialog", "doc-abstract", "doc-acknowledgments", "doc-afterword", "doc-appendix", "doc-bibliography", "doc-chapter", "doc-colophon", "doc-conclusion", "doc-credit", "doc-credits", "doc-dedication", "doc-endnotes", "doc-epigraph", "doc-epilogue", "doc-errata", "doc-example", "doc-foreword", "doc-glossary", "doc-index", "doc-introduction", "doc-notice", "doc-pagelist", "doc-part", "doc-preface", "doc-prologue", "doc-pullquote", "doc-qna", "doc-toc", "document", "feed", "log", "main", "marquee", "navigation", "none", "note", "presentation", "search", "status", "tabpanel"],
                globalAriaAttributesValid: true
            },
            "without-name": {
                implicitRole: null,
                //roleCondition: " when accessible name is not present",
                validRoles: ["alert", "alertdialog", "application", "banner", "complementary", "contentinfo", "dialog", "doc-abstract", "doc-acknowledgments", "doc-afterword", "doc-appendix", "doc-bibliography", "doc-chapter", "doc-colophon", "doc-conclusion", "doc-credit", "doc-credits", "doc-dedication", "doc-endnotes", "doc-epigraph", "doc-epilogue", "doc-errata", "doc-example", "doc-foreword", "doc-glossary", "doc-index", "doc-introduction", "doc-notice", "doc-pagelist", "doc-part", "doc-preface", "doc-prologue", "doc-pullquote", "doc-qna", "doc-toc", "document", "feed", "log", "main", "marquee", "navigation", "none", "note", "presentation", "search", "status", "tabpanel"],
                globalAriaAttributesValid: true
            },
        },
        "select": {
            "no-multiple-attr-size-gt1": {
                //roleCondition: " with a multiple attribute or a size attribute having value greater than 1"
                implicitRole: ["combobox"],
                validRoles: ["menu"],
                globalAriaAttributesValid: true
            },
            "multiple-attr-size-gt1": {
                //roleCondition: " with no multiple attribute and no size attribute having value greater than 1"
                implicitRole: ["listbox"],
                validRoles: null,
                globalAriaAttributesValid: true
            }
        },
        "td": {
            "des-table": {
                implicitRole: ["cell"],
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "des-grid": {
                implicitRole: ["gridcell"],
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "des-other": {
                implicitRole: null,
                validRoles: ["any"],
                globalAriaAttributesValid: true
            },
        },
        "th": {
            "des-table": {
                implicitRole: ["columnheader", "rowheader", "cell"],
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "des-grid": {
                implicitRole: ["columnheader", "rowheader", "gridcell"],
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "des-other": {
                implicitRole: null,
                validRoles: ["any"],
                globalAriaAttributesValid: true
            }
        },
        "tr": {
            "des-table": {
                implicitRole: ["row"],
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "des-grid": {
                implicitRole: ["row"],
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "des-other": {
                implicitRole: ["row"],
                validRoles: ["any"],
                globalAriaAttributesValid: true
            }
        },
        "default": {
            implicitRole: null,
            //roleCondition: "",
            validRoles: ["any"],
            globalAriaAttributesValid: true
        }
    } // end of documentConformanceRequirementSpecialTags

    static containers = []
};

let containerArray = [];

for (const roleDesign in ARIADefinitions.designPatterns) {
    const containers = ARIADefinitions.designPatterns[roleDesign].container;
    if (containers !== null) {
        for (const container of containers) {
            if (containerArray.indexOf(container) == -1) {
                containerArray.push(container);
            }
        }
    }
}
ARIADefinitions.containers = containerArray;
