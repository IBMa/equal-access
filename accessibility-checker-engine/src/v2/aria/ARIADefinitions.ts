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
// all references to WAI-ARIA specification is the WAI-ARIA 1.1
// https://www.w3.org/TR/wai-aria-1.1/

export class ARIADefinitions {
    static nameFromContent(role: string) : boolean {
        return (role in ARIADefinitions.designPatterns) 
            && ARIADefinitions.designPatterns[role].nameFrom 
            && ARIADefinitions.designPatterns[role].nameFrom.includes("contents");
    }

    /*
     * array of WAI-ARIA global states and properties
     * @see https://www.w3.org/TR/wai-aria-1.1/#global_states
     */
    static globalProperties : string[] = ["aria-atomic", "aria-busy", "aria-controls", "aria-current", "aria-describedby", 
        "aria-details", "aria-disabled", "aria-dropeffect", "aria-errormessage", "aria-flowto", "aria-grabbed", 
        "aria-haspopup", "aria-hidden", "aria-invalid", "aria-keyshortcuts", "aria-label", "aria-labelledby", 
        "aria-live", "aria-owns", "aria-relevant", "aria-roledescription"];

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
            values: ["page", "step", "location", "date", "time", "true", "false", "undefined"] //add underfined for empty value
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
            type: "http://www.w3.org/2001/XMLSchema#boolean"
        },
        "aria-invalid": {
            type: "http://www.w3.org/2001/XMLSchema#nmtoken",
            values: ["true", "false", "spelling", "grammar", "undefined"] //add underfined for empty value
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
     * - roleType: one of widget, landmark, etc.
     * - nameRequired: determines whether an accessible name is required for a widget (see ARIA spec.)
     * - nameFrom: determines how an accessible name is supplied (author or content - see ARIA spec.)
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
            presentationalChildren?: boolean
        }
    } = {
        "alert": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: false,
            nameFrom: ["author"]
        },

        "alertdialog": {
            container: null,
            props: ["aria-expanded", "aria-modal"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "application": {
            container: null,
            props: ["aria-activedescendant"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            nameRequired: true,
            nameFrom: ["author"]
        },

        "article": {
            container: null,
            props: ["aria-expanded", "aria-posinset", "aria-setsize"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null
        },

        "banner": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameFrom: ["author"]
        },

        "button": {
            container: null,
            props: ["aria-expanded", "aria-pressed"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "input[@type='button']",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"],
            presentationalChildren: true
        },
        "cell": {
            container: ["row"],
            props: ["aria-colindex", "aria-colspan", "aria-rowindex", "aria-rowspan", "aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            nameFrom: ["author", "contents"]
        },
        "checkbox": {
            container: null,
            props: ["aria-checked", "aria-readonly"], 
            reqProps: null, // "aria-checked" has a default
            reqChildren: null,
            htmlEquiv: "input[@type='checkbox']",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"]
        },

        "columnheader": {
            container: ["row"],
            props: ["aria-colindex", "aria-colspan", "aria-expanded", "aria-readonly", "aria-required", "aria-rowindex", "aria-rowspan", "aria-selected", "aria-sort"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            nameRequired: true,
            nameFrom: ["author", "contents"]
        },

        "combobox": {
            container: null,
            props: ["aria-expanded", "aria-activedescendant", "aria-autocomplete", "aria-orientation", "aria-readonly", "aria-required"],
            reqProps: ["aria-controls"],  // "aria-expanded" has a default
            reqChildren: ["listbox", "textbox", "tree", "grid", "dialog"], // This is bypassed in g1152
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "complementary": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameFrom: ["author"]
        },

        "contentinfo": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameFrom: ["author"]
        },

        "definition": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            nameFrom: ["author"]
        },

        "dialog": {
            container: null,
            props: ["aria-expanded", "aria-modal"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "directory": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            nameFrom: ["author"]
        },

        "document": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            nameRequired: false,
            nameFrom: ["author"]
        },

        "feed": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: ["article"],
            htmlEquiv: null
        },

        "figure": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null
        },

        "form": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark"
        },

        "grid": {
            container: null,
            props: ["aria-level", "aria-multiselectable", "aria-readonly", "aria-activedescendant", "aria-expanded", "aria-colcount", "aria-rowcount"],
            reqProps: null,
            reqChildren: ["row"],
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "gridcell": {
            container: ["row"],
            props: ["aria-readonly", "aria-selected", "aria-expanded", "aria-required", "aria-colindex", "aria-colspan", "aria-rowindex", "aria-rowspan"], 
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"]
        },

        "group": {
            container: null,
            props: ["aria-activedescendant", "aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null
        },

        "heading": {
            container: null,
            props: ["aria-level", "aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "h1 | h2 | h3 | h4 | h5 |h6",
            nameRequired: true,
            nameFrom: ["author", "contents"]
        },

        "img": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "img",
            nameRequired: true,
            nameFrom: ["author"],
            presentationalChildren: true
        },

        "link": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "a | link",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"]
        },

        "list": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: ["listitem"],
            htmlEquiv: null
        },

        "listbox": {
            container: null,
            props: ["aria-expanded", "aria-activedescendant", "aria-multiselectable", "aria-readonly", "aria-required", "aria-orientation"], 
            reqProps: null,
            reqChildren: ["option"],
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "listitem": {
            container: ["list", "group"],
            props: ["aria-expanded", "aria-level", "aria-posinset", "aria-setsize"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null
        },

        "log": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "main": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark"
        },

        "marquee": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"] 
        },

        "math": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            nameFrom: ["author"],
            presentationalChildren: true
        },

        "menu": {
            container: null,
            props: ["aria-expanded", "aria-activedescendant", "aria-orientation"],
            reqProps: null,
            reqChildren: ["menuitem", "menuitemcheckbox", "menuitemradio"],
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: false,
            nameFrom: ["author"]
        },

        "menubar": {
            container: null,
            props: ["aria-activedescendant", "aria-expanded", "aria-orientation"],
            reqProps: null,
            reqChildren: ["menuitem", "menuitemcheckbox", "menuitemradio"],
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: false, 
            nameFrom: ["author"]
        },

        "menuitem": {
            container: ["group", "menu", "menubar"],
            props: ["aria-posinset", "aria-setsize", "aria-expanded"], //aria-expanded is in ARIA 1.2. refer to github #801 for details
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"]
        },

        "menuitemcheckbox": {
            container: ["menu", "menubar"],
            props: ["aria-posinset", "aria-readonly", "aria-setsize", "aria-checked"],
            reqProps: null, // "aria-checked" has a default
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"]
        },

        "menuitemradio": {
            container: ["group", "menu", "menubar"],
            props: ["aria-setsize", "aria-posinset", "aria-readonly", "aria-checked"],
            reqProps: null, // "aria-checked" has a default
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"]
        },

        "navigation": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark"
        },

        "none": {
            container: null,
            props: [],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null
        },

        "note": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null
        },

        "option": {
            container: ["listbox"],
            props: ["aria-checked", "aria-selected", "aria-posinset", "aria-setsize"],
            reqProps: null, // "aria-selected" has a default
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"]
        },

        "presentation": {
            container: null,
            props: [],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null
        },

        "progressbar": {
            container: null,
            props: ["aria-expanded", "aria-valuetext", "aria-valuemax", "aria-valuemin", "aria-valuenow"],
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
            props: ["aria-posinset", "aria-setsize", "aria-checked"],
            reqProps: null, // "aria-checked" has a default
            reqChildren: null,
            htmlEquiv: "input[@type='radio']",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"]
        },

        "radiogroup": {
            container: null,
            props: ["aria-activedescendant", "aria-expanded", "aria-required", "aria-readonly", "aria-orientation"], 
            reqProps: null,
            reqChildren: ["radio"],
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "region": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "row": {
            container: ["grid", "treegrid", "table", "rowgroup"],
            props: ["aria-level", "aria-setsize", "aria-posinset", "aria-selected", "aria-activedescendant", "aria-expanded", "aria-colindex", "aria-rowindex"],
            reqProps: null,
            reqChildren: ["columnheader", "rowheader", "gridcell", "cell"],
            htmlEquiv: "tr"
        },

        "rowgroup": {
            container: ["grid", "table", "treegrid"],
            props: [],
            reqProps: null,
            reqChildren: ["row"],
            htmlEquiv: null
        },

        "rowheader": {
            container: ["row"],
            props: ["aria-expanded", "aria-sort", "aria-colindex", "aria-colspan", "aria-level", "aria-readonly", "aria-rowindex", "aria-rowspan", "aria-selected", "aria-required"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            nameRequired: true,
            nameFrom: ["contents", "author"]
        },

        "scrollbar": {
            container: null,
            props: ["aria-valuetext", "aria-orientation", "aria-valuenow", "aria-valuemax", "aria-valuemin"], 
            reqProps: ["aria-controls"], // "aria-orientation", "aria-valuenow", "aria-valuemax", "aria-valuemin" have defaults
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: false,
            nameFrom: ["author"],
            presentationalChildren: true
        },

        "search": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark"
        },

        "searchbox": { 
            container: null,
            props: ["aria-activedescendant", "aria-autocomplete", "aria-multiline", "aria-placeholder", "aria-readonly", "aria-required"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            nameRequired: true, 
            nameFrom: ["author"],
            roleType: "widget"
        },

        "separator": {
            container: null,
            props: ["aria-orientation", "aria-valuemax", "aria-valuemin", "aria-valuenow"], // when it is focusable, aria-valuetext is a valid one. It is added in the code.
            reqProps: null, // "aria-valuemax", "aria-valuemin", "aria-valuenow" have defaults
            reqChildren: null,
            htmlEquiv: null,
            presentationalChildren: true
        },

        "slider": {
            container: null,
            props: ["aria-orientation", "aria-valuetext", "aria-readonly", "aria-valuemax", "aria-valuenow", "aria-valuemin"],
            reqProps: null, // "aria-valuemax", "aria-valuenow", "aria-valuemin" have defaults
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"],
            presentationalChildren: true
        },

        "spinbutton": {
            container: null,
            props: ["aria-activedescendant", "aria-valuetext", "aria-required", "aria-readonly", "aria-valuemax", "aria-valuenow", "aria-valuemin"], 
            reqProps: null, // "aria-valuemax", "aria-valuenow", "aria-valuemin" have defaults
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "status": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameFrom: ["author"]
        },
        "switch": {
            container: null,
            props: ["aria-readonly", "aria-checked"],
            reqProps: null, // "aria-checked" has a default
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true, 
            nameFrom: ["author", "contents"]
        },

        "tab": {
            container: ["tablist"],
            props: ["aria-selected", "aria-expanded", "aria-posinset", "aria-setsize"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: false, 
            nameFrom: ["author", "contents"]
        },

        "table": {
            container: null,
            props: ["aria-colcount", "aria-rowcount", "aria-expanded"],
            reqProps: null,
            reqChildren: ["row"],
            htmlEquiv: null,
            roleType: null,
            nameFrom: ["author"],
            nameRequired: true
        },

        "tablist": {
            container: null,
            props: ["aria-activedescendant", "aria-multiselectable", "aria-level", "aria-orientation"],
            reqProps: null,
            reqChildren: ["tab"],
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: false, 
            nameFrom: ["author"]
        },
        
        "tabpanel": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "term": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "dt",
            roleType: null
        },

        "textbox": {
            container: null,
            props: ["aria-activedescendant", "aria-autocomplete", "aria-multiline", "aria-placeholder", "aria-readonly", "aria-required"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "input[@type='text']",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "timer": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "toolbar": {
            container: null,
            props: ["aria-activedescendant", "aria-expanded", "aria-orientation"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,

            // Although, not a widget according to the ARIA spec, Matt wants toolbars to be labeled
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "tooltip": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"] 
        },

        "tree": {
            container: null,
            props: ["aria-multiselectable", "aria-activedescendant", "aria-expanded", "aria-required", "aria-orientation"],
            reqProps: null,
            reqChildren: ["treeitem"],
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "treegrid": {
            container: null,
            props: ["aria-activedescendant", "aria-expanded", "aria-level", "aria-multiselectable", "aria-readonly", "aria-required", "aria-colcount", "aria-rowcount", "aria-orientation"], 
            reqProps: null,
            reqChildren: ["row"],
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"]
        },

        "treeitem": {
            container: ["tree", "group"],
            props: ["aria-checked", "aria-selected", "aria-expanded", "aria-level", "aria-posinset", "aria-setsize"],
            reqProps: null, // "aria-selected" has a default
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"]
        }
    } // end designPatterns

    // copied from https://www.w3.org/TR/html5/disabled-elements.html
    // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Forms
    static elementsAllowedDisabled = ["button", "input", "select", "textarea", "optgroup", "option", "menuitem", "fieldset"];
    static elementsAllowedRequired = ["input", "select", "textarea"];
    static elementsAllowedReadOnly = ["input", "textarea"];


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
            validRoles: ["presentation", "none", "document", "application", "feed", "main", "region"],
            globalAriaAttributesValid: true
        },
        "aside": {
            implicitRole: ["complementary"],
            validRoles: ["feed", "note", "presentation", "none", "region", "search"],
            globalAriaAttributesValid: true
        },
        "audio": {
            implicitRole: null,
            validRoles: ["application"],
            globalAriaAttributesValid: true
        },
        "base": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "body": {
            implicitRole: ["document"],
            validRoles: null,
            globalAriaAttributesValid: true
        },
        "caption": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: true
        },
        "canvas": {
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
        "details": {
            implicitRole: ["group"],
            validRoles: null,
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
            validRoles: ["group", "list", "presentation", "none"],
            globalAriaAttributesValid: true
        },
        "dt": {
            implicitRole: ["term"],
            validRoles: ["listitem"],
            globalAriaAttributesValid: true
        },
        "embed": {
            implicitRole: null,
            validRoles: ["application", "document", "presentation", "none", "img"],
            globalAriaAttributesValid: true
        },
        "figcaption": {
            implicitRole: null,
            validRoles: ["group", "presentation", "none"],
            globalAriaAttributesValid: true
        },
        "fieldset": {
            implicitRole: ["group"],
            validRoles: ["presentation", "none"],
            globalAriaAttributesValid: true
        },
        "figure": {
            implicitRole: ["figure"],
            validRoles: ["group", "presentation", "none"],
            globalAriaAttributesValid: true
        },
        "form": {
            implicitRole: ["form"],
            validRoles: ["search", "presentation", "none"],
            globalAriaAttributesValid: true
        },
        "head": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "hr": {
            implicitRole: ["separator"],
            validRoles: ["presentation", "none"],
            globalAriaAttributesValid: true
        },
        "html": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        /*
            For <iframe> role="presentation" is not allowed according the https://www.w3.org/TR/html-aria/#docconformance table.
            We have added the role=presentation in the allowed role list for backward compatibility of a DAP feature.
            DAP "Check iframes with role="presentation" should consider role="none" also. (role="none" is not added) since this feature might be deprecated later.
        */
        "iframe": { //seamless?
            implicitRole: null,
            validRoles: ["application", "document", "none", "img", "presentation"],
            globalAriaAttributesValid: true
        },
        "ins": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "del": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "keygen": {
            implicitRole: null,
            validRoles: null,
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
        "math": {
            implicitRole: ["math"],
            validRoles: null,
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
            validRoles: null,
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
            validRoles: ["directory", "group", "listbox", "menu", "menubar", "presentation", "none", "radiogroup", "tablist", "toolbar", "tree"],
            globalAriaAttributesValid: true
        },
        "optgroup": {
            implicitRole: ["group"],
            validRoles: null,
            globalAriaAttributesValid: true
        },
        "output": {
            implicitRole: ["status"],
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
        "progress": {
            implicitRole: ["progressbar"],
            validRoles: null,
            globalAriaAttributesValid: true
        },
        "script": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "section": {
            implicitRole: ["region"],
            validRoles: ["alert", "alertdialog", "application", "banner", "complementary", "contentinfo", "dialog", "document", "feed", "log", "main", "marquee", "navigation", "none", "presentation", "search", "status", "tabpanel"],
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
        "style": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "summary": {
            implicitRole: ["button"],
            validRoles: null,
            globalAriaAttributesValid: true
        },
        "svg": {
            implicitRole: null,
            validRoles: ["application", "document", "img"],
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
        "thead": {
            implicitRole: ["rowgroup"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "tfoot": {
            implicitRole: ["rowgroup"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "td": {
            implicitRole: ["cell"],
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
        "th": {
            implicitRole: ["columnheader", "rowheader"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "title": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "tr": {
            implicitRole: ["row"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "track": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "ul": {
            implicitRole: ["list"],
            validRoles: ["directory", "group", "listbox", "menu", "menubar", "radiogroup", "tablist", "toolbar", "tree", "presentation", "none"],
            globalAriaAttributesValid: true
        },
        "video": {
            implicitRole: null,
            validRoles: ["application"],
            globalAriaAttributesValid: true
        },
        /* p, pre, blockquote grouping content elements not listed elsewhere: */
        "p": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "pre": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "blockquote": {
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
                validRoles: ["button", "checkbox", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "tab", "switch", "treeitem"],
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
            "without-href": { //https://www.w3.org/TR/html51/semantics-embedded-content.html#elementdef-area
                implicitRole: ["link"],
                //roleCondition: " when href attribute is not present",
                validRoles: null,
                globalAriaAttributesValid: true
            }
        },
        "button": {
            "with-type-menu": {
                implicitRole: ["button"],
                //roleCondition: " with type=menu",
                validRoles: ["menuitem"],
                globalAriaAttributesValid: true
            },
            "without-type-menu": {
                implicitRole: ["button"],
                //roleCondition: " without type=menu",
                validRoles: ["checkbox", "link", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "switch", "tab"],
                globalAriaAttributesValid: true
            }
        },
        "footer": {
            "des-section-article": {
                implicitRole: null,
                validRoles: ["group", "presentation", "none"],
                globalAriaAttributesValid: true
            },
            "not-des-section-article": {
                implicitRole: ["contentinfo"],
                validRoles: ["group", "presentation", "none"],
                globalAriaAttributesValid: true
            }
        },
        "h1-6": {
            "h1-6-with-aria-level-positive-integer": {
                implicitRole: ["heading"],
                //roleCondition: " and implicit role is heading with aria-level=positive integer",
                validRoles: ["tab", "presentation", "none"],
                globalAriaAttributesValid: true
            },
            "h1-6-without-aria-level-positive-integer": {
                implicitRole: null,
                //roleCondition: " and implicit role is heading with aria-level=positive integer",
                validRoles: ["tab", "presentation", "none"],
                globalAriaAttributesValid: true
            }
        },
        "header": {
            "des-section-article": {
                implicitRole: null,
                //roleCondition: " and no implicit role when descendant of an article or section element",
                validRoles: ["group", "presentation", "none"],
                globalAriaAttributesValid: true
            },
            "not-des-section-article": {
                implicitRole: ["banner"],
                //roleCondition: " and implicit role is banner when not a descendant of an article or section element",
                validRoles: ["group", "presentation", "none"],
                globalAriaAttributesValid: true
            }

        },
        "hgroup": { //https://www.w3.org/TR/2011/WD-html5-author-20110705/wai-aria.html
            "with-aria-level": {
                implicitRole: ["heading"],
                //roleCondition: " and implicit role is heading when aria-level attribute is present",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "without-aria-level": {
                implicitRole: ["heading"],
                //roleCondition: " when aria-level attribute is not present",
                validRoles: null,
                globalAriaAttributesValid: true
            }
        },
        "img": {
            "img-with-empty-alt": {
                implicitRole: null,
                //roleCondition: " and no implicit role when empty alt attribute is present",
                validRoles: ["presentation", "none"],
                globalAriaAttributesValid: false
            },
            "img-without-empty-alt": {
                implicitRole: ["img"],
                //roleCondition: " and implicit role is img when empty alt attribute is not present",
                validRoles: ["any"],
                globalAriaAttributesValid: true
            }
        },
        "input": {
            "number": {
                implicitRole: ["spinbutton"],
                //roleCondition: " with type=number",
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
            "hidden": {
                implicitRole: null,
                //roleCondition: " with type=hidden",
                validRoles: null,
                globalAriaAttributesValid: false
            },
            "submit": {
                implicitRole: ["button"],
                //roleCondition: " with type=submit",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "checkbox-with-aria-pressed": {
                implicitRole: ["checkbox"],
                //roleCondition: " with type=checkbox and aria-pressed attribute is present",
                validRoles: ["button", "option", "menuitemcheckbox", "switch"],
                globalAriaAttributesValid: true
            },
            "checkbox-without-aria-pressed": {
                implicitRole: ["checkbox"],
                //roleCondition: " with type=checkbox and aria-pressed attribute is not present",
                validRoles: ["option", "menuitemcheckbox", "switch"],
                globalAriaAttributesValid: true
            },
            "reset": {
                implicitRole: ["button"],
                //roleCondition: " with type=reset",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "time": {
                implicitRole: null,
                //roleCondition: " with type=time",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "password": {
                implicitRole: null,
                //roleCondition: " with type=password",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "button": {
                implicitRole: ["button"],
                validRoles: ["link", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "switch", "tab"],
                globalAriaAttributesValid: true
            },
            "image": {
                implicitRole: ["button"],
                //roleCondition: " with type=image",
                validRoles: ["link", "menuitem", "menuitemcheckbox", "menuitemradio", "radio", "switch"],
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
            "datetime": {
                implicitRole: null,
                //roleCondition: " with type=datetime",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "file": {
                implicitRole: null,
                //roleCondition: " with type=file",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "month": {
                implicitRole: null,
                //roleCondition: " with type=month",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "week": {
                implicitRole: null,
                //roleCondition: " with type=week",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "search-no-list": {
                implicitRole: ["searchbox"],
                //roleCondition: " with type=search and no list attribute is present",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "search-list": {
                implicitRole: ["combobox"],
                //roleCondition: " with type=search and a list attribute is present",
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
            "text-no-list": {
                implicitRole: ["textbox"],
                //roleCondition: " with type=text and no list attribute is present",
                validRoles: ["combobox", "searchbox", "spinbutton"], //See https://www.w3.org/TR/html-aria/#docconformance and  Defect 1027
                globalAriaAttributesValid: true
            },
            "tel-no-list": {
                implicitRole: ["textbox"],
                //roleCondition: " with type=tel and no list attribute is present",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "url-no-list": {
                implicitRole: ["textbox"],
                //roleCondition: " with type=url and no list attribute is present",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "text-with-list": {
                implicitRole: ["combobox"],
                //roleCondition: " with type=text and a list attribute is present",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "tel-with-list": {
                implicitRole: ["combobox"],
                //roleCondition: " with type=tel and a list attribute is present",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "url-with-list": {
                implicitRole: ["combobox"],
                //roleCondition: " with type=url and a list attribute is present",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "default": { //https://www.w3.org/TR/html51/sec-forms.html#the-input-element
                implicitRole: null,
                //roleCondition: "",
                validRoles: null,
                globalAriaAttributesValid: true
            }
        },
        "li": {
            "parent-ol-or-ul": {
                implicitRole: ["listitem"],
                //roleCondition: " when the li element's parent is an ol or ul element",
                validRoles: ["menuitem", "menuitemcheckbox", "menuitemradio", "option", "presentation", "none", "radio", "separator", "tab", "treeitem"],
                globalAriaAttributesValid: true
            },
            "parent-not-ol-or-ul": { //TODO
                implicitRole: ["listitem"],
                //roleCondition: " when the li element's parent is not an ol or ul element", 
                validRoles: ["listitem", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "tab", "treeitem", "presentation"], // added form HTML 5.1
                globalAriaAttributesValid: true
            }

        },
        "link": {
            "with-href": { //link element with a href
                implicitRole: ["link"],
                //roleCondition: " when non-empty href attribute is present",
                validRoles: null,
                globalAriaAttributesValid: false //Task #978: we are following the html 5.3 requirements
            },
            "without-href": {
                implicitRole: null,
                //roleCondition: " when non-empty href attribute is not present",
                validRoles: null,
                globalAriaAttributesValid: false
            }
        },
        "menu": {
            "type-context": {
                implicitRole: ["menu"],
                validRoles: null,
                globalAriaAttributesValid: true
            }
        },
        "menuitem": {
            "type-command": {
                implicitRole: ["menuitem"],
                //roleCondition: " with type=command",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "type-checkbox": {
                implicitRole: ["menuitemcheckbox"],
                //roleCondition: " with type=checkbox",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "type-radio": {
                implicitRole: ["menuitemradio"],
                //roleCondition: " with type=radio",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "default": {
                implicitRole: ["menuitem"],
                //roleCondition: " without type=command, type=checkbox or type=radio",
                validRoles: null,
                globalAriaAttributesValid: true
            }
        },
        "option": {
            "list-suggestion-datalist": {
                implicitRole: ["option"],
                //roleCondition: " when option element is in a list of options or represents a suggestion in a datalist",
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "not-list-suggestion-datalist": {
                implicitRole: ["option"],
                //roleCondition: " when option element  is not in a list of options or does not represent a suggestion in a datalist",
                validRoles: ["menuitem", "menuitemradio", "separator"], // https://www.w3.org/TR/html5/forms.html#the-option-element
                globalAriaAttributesValid: true
            }
        },
        "select":{
            "no-multiple-attr-size-gt1": {
                // with a multiple attribute or a size attribute having value greater than 1
                implicitRole: ["combobox"],
                validRoles: ["menu"],
                globalAriaAttributesValid: true
            },
            "multiple-attr-size-gt1": {
                // with no multiple attribute and no size attribute having value greater than 1
                implicitRole: ["listbox"],
                validRoles: null,
                globalAriaAttributesValid: true
            }
        },
        "text-level-semantic-elements": {
            implicitRole: null,
            //roleCondition: "",
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "default": {
            implicitRole: null,
            //roleCondition: "",
            validRoles: ["any"],
            globalAriaAttributesValid: true
        }
    } // end of documentConformanceRequirementSpecialTags
    /*Text level semantic elements not listed elsewhere:em, strong, small, s, cite, q, dfn, abbr, time, code, var, samp, kbd, sub and sup, i, b, u, mark , ruby, rt, rp, bdi, bdo, br, wbr */
    static textLevelSemanticElements = ["em", "strong", "small", "s", "cite", "q", "dfn",
        "abbr", "time", "code", "var", "samp", "kbd", "sub", "sup", "i", "b", "u", "mark",
        "ruby", "rt", "rp", "bdi", "bdo", "br", "wbr"
    ]

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
