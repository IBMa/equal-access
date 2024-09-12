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

export type IDocumentConformanceRequirement = {
    implicitRole: string[],
    validRoles: string[],
    globalAriaAttributesValid: boolean,
    otherAllowedAriaAttributes?: string[], 
    otherDisallowedAriaAttributes?: string[],
    otherRolesForAttributes?: string[], //roles, other than implicit and valid roles, whose attributes are also allowed
    // a few elements (such as datalist, html, caption) that have an implicit role but disallow some or all attributes allowed for the role.
    allowAttributesFromImplicitRole?: boolean,
    prohibitedAriaAttributesWhenNoImplicitRole?: string[]  //some elements (var,abbr etc.) have no implicit role but naming prohibited   
}

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
        "aria-details", "aria-flowto", "aria-hidden", "aria-keyshortcuts",
        "aria-label", "aria-labelledby", "aria-live", "aria-owns", "aria-relevant", "aria-roledescription"
        // the following are deprecated in ARIA 1.2, will indicate deprecation in individual role
        , 'aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'
    ];

    //properties contains id(s) that refer to other element(s)
    static referenceProperties : string[] = ["aria-owns", "aria-controls", "aria-describedby", "aria-labelledby", "aria-flowto", "aria-activedescendant"];

    // deprecated roles
    static globalDeprecatedRoles : string[] = [
        'directory', 'doc-biblioentry', 'doc-endnote'
    ];

    // the following are deprecated in ARIA 1.1 for all the roles
    static globalDeprecatedProperties : string[] = [
        'aria-grabbed', 'aria-dropeffect'
    ];
    
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
            type: "http://www.w3.org/2001/XMLSchema#idref",
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
            deprecated?: boolean,
            deprecatedProps?: string[]
            prohibitedProps?: string[]
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
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "alertdialog": {
            container: null,
            props: ["aria-modal"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "window",
            nameRequired: true,
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "application": {
            container: null,
            props: ["aria-activedescendant", "aria-expanded"],
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
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "banner": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "blockquote": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "button": {
            container: null,
            props: ["aria-expanded", "aria-pressed"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "button | input[@type='button']",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"],
            presentationalChildren: true,
            deprecatedProps: ['aria-errormessage', 'aria-invalid'] 
        },

        "caption": {
            container: ["figure", "grid", "table", "treegrid"],
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"],
            prohibitedProps: ["aria-label", "aria-labelledby"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "cell": {
            container: ["row"],
            props: ["aria-colindex", "aria-colspan", "aria-rowindex", "aria-rowspan"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "td",
            roleType: "structure",
            nameFrom: ["author", "contents"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "checkbox": {
            container: null,
            props: ["aria-expanded", "aria-readonly", "aria-required"],
            reqProps: ["aria-checked"],
            reqChildren: null,
            htmlEquiv: "input[@type='checkbox']",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"],
            presentationalChildren: true,
            deprecatedProps: ['aria-haspopup'] 
        },

        "code": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"],
            prohibitedProps: ["aria-label", "aria-labelledby"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "columnheader": {
            container: ["row"],
            props: ["aria-colindex", "aria-colspan", "aria-expanded", "aria-readonly", "aria-required", "aria-rowindex", "aria-rowspan", "aria-selected", "aria-sort"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "th[@scope='col']",
            roleType: "structure",
            nameRequired: true,
            nameFrom: ["author", "contents"] 
        },

        "combobox": {
            container: null,
            props: ["aria-controls", "aria-activedescendant", "aria-autocomplete", "aria-readonly", "aria-required"],
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
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "comment": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameRequired: false,
            nameFrom: ["author", "contents"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "contentinfo": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "definition": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"],
            prohibitedProps: ["aria-label", "aria-labelledby"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "deletion": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"],
            prohibitedProps: ["aria-label", "aria-labelledby"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "dialog": {
            container: null,
            props: ["aria-modal"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "window",
            nameRequired: true,
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },
        "directory": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["author"],
            deprecated: true,
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid']  
        }, 
        "doc-abstract": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-acknowledgments": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-afterword": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-appendix": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-backlink": {
            container: null,
            props: ["aria-disabled", "aria-expanded", "aria-haspopup"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "a | link",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"]
        },
        "doc-biblioentry": {
            container: ["list"],
            props: ["aria-level", "aria-posinset", "aria-setsize"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "li",
            roleType: "structure",
            nameRequired: true,
            nameFrom: ["author"]
        },
        "doc-bibliography": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-biblioref": {
            container: null,
            props: ["aria-disabled", "aria-expanded", "aria-haspopup"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "a | link",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"]
        },
        "doc-chapter": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-colophon": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: true,
            nameFrom: ["author"]
        },
        "doc-conclusion": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-cover": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "img",
            roleType: "structure",
            nameRequired: false,
            nameFrom: ["author"],
            presentationalChildren: true
        },
        "doc-credit": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-credits": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-dedication": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-endnote": {
            container: ["list"],
            props: ["aria-level", "aria-posinset", "aria-setsize"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "li",
            roleType: "structure",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-endnotes": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: true,
            nameFrom: ["author"]
        },
        "doc-epigraph": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-epilogue": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-errata": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-example": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-footnote": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-foreword": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-glossary": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-glossref": {
            container: null,
            props: ["aria-disabled", "aria-expanded", "aria-haspopup"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "a | link",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"]
        },
        "doc-index": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-introduction": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-noteref": {
            container: null,
            props: ["aria-disabled", "aria-expanded", "aria-haspopup"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "a | link",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"]
        },
        "doc-notice": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-pagebreak": {
            container: null,
            props: ["aria-orientation"], // aria-disabled, aria-valuemax, aria-valuemin, aria-valuetext are valid if focusable. This is handled in the code.
            reqProps: null, // aria-valuenow is required if focusable. This is handled in the code.
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure", // or widget if focusable
            nameRequired: true,
            nameFrom: ["author", "contents"],
            presentationalChildren: true
        },
        "doc-pagelist": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-pagefooter": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameFrom: ["prohibited"],
            prohibitedProps: ["aria-label", "aria-labelledby"],
        },
        "doc-pageheader": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameFrom: ["prohibited"],
            prohibitedProps: ["aria-label", "aria-labelledby"],
        },
        "doc-part": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-preface": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-prologue": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-pullquote": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-qna": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-subtitle": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameRequired: false,
            nameFrom: ["author", "contents"]
        },
        "doc-tip": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "doc-toc": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: false,
            nameFrom: ["author"]
        },
        "document": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameRequired: false,
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "emphasis": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"],
            prohibitedProps: ["aria-label", "aria-labelledby"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "feed": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: ["article"],
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "figure": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "form": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "form",
            roleType: "landmark",
            nameRequired: true,
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "generic": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "div | span",
            roleType: "structure",
            nameFrom: ["prohibited"],
            prohibitedProps: ["aria-label", "aria-labelledby", "aria-roledescription"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
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
            nameFrom: ["author"]
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
            props: ["aria-activedescendant", "aria-colcount", "aria-multiselectable", "aria-readonly", "aria-rowcount"],
            reqProps: null,
            reqChildren: ["row", "rowgroup"], // rowgroup is not required, but it is allowed
            htmlEquiv: "table",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"],
            deprecatedProps: ['aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
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
            props: ["aria-activedescendant"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["author"],
            deprecatedProps: ['aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "heading": {
            container: null,
            props: null,
            reqProps: ["aria-level"],
            reqChildren: null,
            htmlEquiv: "h1 | h2 | h3 | h4 | h5 | h6",
            roleType: "structure",
            nameRequired: true,
            nameFrom: ["author", "contents"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
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
            presentationalChildren: true,
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "image": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "img",
            roleType: "structure",
            nameRequired: true,
            nameFrom: ["author"],
            presentationalChildren: true,
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "insertion": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"],
            prohibitedProps: ["aria-label", "aria-labelledby"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "link": {
            container: null,
            props: ["aria-expanded"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "a | link",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"],
            deprecatedProps: ['aria-errormessage', 'aria-invalid'] 
        },

        "list": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: ["listitem"],
            htmlEquiv: "ol | ul",
            roleType: "structure",
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "listbox": {
            container: null,
            props: ["aria-activedescendant", "aria-expanded", "aria-multiselectable", "aria-orientation", "aria-readonly", "aria-required"],
            reqProps: null,
            reqChildren: ["group", "option"], // group is not required, but it is allowed
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"],
            deprecatedProps: ['aria-haspopup'] 
        },

        "listitem": {
            container: ["list"],
            props: ["aria-level", "aria-posinset", "aria-setsize"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "li",
            roleType: "structure",
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "log": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "liveRegion",
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "main": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "mark": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "mark",
            roleType: "structure",
            nameFrom: ["prohibited"],
            prohibitedProps: ["aria-label", "aria-labelledby"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "marquee": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "liveRegion",
            nameRequired: true,
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "math": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["author"],
            presentationalChildren: false,
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "menu": {
            container: null,
            props: ["aria-activedescendant", "aria-orientation"],
            reqProps: null,
            reqChildren: ["group", "menuitem", "menuitemcheckbox", "menuitemradio"], // group is not required, but it is allowed
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: false,
            nameFrom: ["author"],
            deprecatedProps: ['aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "menubar": {
            container: null,
            props: ["aria-activedescendant", "aria-orientation"],
            reqProps: null,
            reqChildren: ["group", "menuitem", "menuitemcheckbox", "menuitemradio"], // group is not required, but it is allowed
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: false, 
            nameFrom: ["author"],
            deprecatedProps: ['aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "menuitem": {
            container: ["group", "menu", "menubar"], // group only counts as a valid container if it is contained in a menu or menubar
            props: ["aria-expanded", "aria-posinset", "aria-setsize"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"],
            deprecatedProps: ['aria-errormessage', 'aria-invalid'] 
        },
        
        "menuitemcheckbox": {
            container: ["group", "menu", "menubar"], // group only counts as a valid container if it is contained in a menu or menubar
            props: ["aria-expanded", "aria-posinset", "aria-setsize"],
            reqProps: ["aria-checked"],
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"],
            presentationalChildren: true,
            deprecatedProps: ['aria-errormessage', 'aria-invalid'] 
        },

        "menuitemradio": {
            container: ["group", "menu", "menubar"], // group only counts as a valid container if it is contained in a menu or menubar
            props: ["aria-expanded", "aria-posinset", "aria-setsize"],
            reqProps: ["aria-checked"],
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"],
            presentationalChildren: true,
            deprecatedProps: ['aria-errormessage', 'aria-invalid'] 
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
            presentationalChildren: true,
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "navigation": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "none": {
            container: null,
            props: [],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"],
            prohibitedProps: ["aria-label", "aria-labelledby"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "note": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "option": {
            container: ["group", "listbox"], // group only counts as a valid container if it is contained in a listbox
            props: ["aria-selected", "aria-checked", "aria-posinset", "aria-setsize"],
            reqProps: null, // "aria-selected" has a default
            reqChildren: null,
            htmlEquiv: "option",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"],
            presentationalChildren: true,
            deprecatedProps: ['aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "paragraph": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"],
            prohibitedProps: ["aria-label", "aria-labelledby"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "presentation": {
            container: null,
            props: [],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"],
            prohibitedProps: ["aria-label", "aria-labelledby"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
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
            presentationalChildren: true,
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "radio": {
            container: null,
            props: ["aria-posinset", "aria-setsize"],
            reqProps: ["aria-checked"],
            reqChildren: null,
            htmlEquiv: "input[@type='radio']",
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"],
            presentationalChildren: true,
            deprecatedProps: ['aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "radiogroup": {
            container: null,
            props: ["aria-activedescendant", "aria-orientation", "aria-readonly", "aria-required"],
            reqProps: null,
            reqChildren: ["radio"],
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"],
            deprecatedProps: ['aria-haspopup'] 
        },

        "region": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameRequired: true,
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "row": {
            container: ["grid", "rowgroup", "table", "treegrid"],
            props: ["aria-activedescendant", "aria-colindex", "aria-expanded", "aria-level", "aria-posinset", "aria-rowindex", "aria-selected", "aria-setsize"],
            reqProps: null,
            reqChildren: ["cell", "columnheader", "gridcell", "rowheader"],
            htmlEquiv: "tr",
            roleType: "structure",
            nameFrom: ["author", "contents"],
            deprecatedProps: ['aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "rowgroup": {
            container: ["grid", "table", "treegrid"],
            props: [],
            reqProps: null,
            reqChildren: ["row"],
            htmlEquiv: "tbody | tfoot | thead",
            roleType: "structure",
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "rowheader": {
            container: ["row"],
            props: ["aria-colindex", "aria-colspan", "aria-expanded", "aria-readonly", "aria-required", "aria-rowindex", "aria-rowspan", "aria-selected", "aria-sort"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "th[@scope='row']",
            roleType: "structure",
            nameRequired: true,
            nameFrom: ["author", "contents"]
        },

        "scrollbar": {
            container: null,
            props: ["aria-orientation", "aria-valuemax", "aria-valuemin", "aria-valuetext"],
            reqProps: ["aria-controls", "aria-valuenow"],
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: false,
            nameFrom: ["author"],
            presentationalChildren: true,
            deprecatedProps: ['aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "search": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "landmark",
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "searchbox": {
            container: null,
            props: ["aria-activedescendant", "aria-autocomplete", "aria-multiline", "aria-placeholder", "aria-readonly", "aria-required"],
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
            presentationalChildren: true,
            deprecatedProps: ['aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "slider": {
            container: null,
            props: ["aria-orientation", "aria-readonly", "aria-valuemax", "aria-valuemin", "aria-valuetext"],
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
            props: ["aria-activedescendant", "aria-readonly", "aria-required", "aria-valuemax", "aria-valuemin", "aria-valuenow", "aria-valuetext"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"],
            deprecatedProps: ['aria-haspopup'] 
        },

        "status": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "liveRegion",
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "strong": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"],
            prohibitedProps: ["aria-label", "aria-labelledby"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "subscript": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"],
            prohibitedProps: ["aria-label", "aria-labelledby"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "suggestion": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"],
            prohibitedProps: ["aria-label", "aria-labelledby"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "superscript": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"],
            prohibitedProps: ["aria-label", "aria-labelledby"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "switch": {
            container: null,
            props: ["aria-expanded", "aria-readonly", "aria-required"],
            reqProps: ["aria-checked"],
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"],
            presentationalChildren: true,
            deprecatedProps: ['aria-haspopup'] 
        },

        "tab": {
            container: ["tablist"],
            props: ["aria-expanded", "aria-posinset", "aria-selected", "aria-setsize"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"],
            presentationalChildren: true,
            deprecatedProps: ['aria-errormessage', 'aria-invalid'] 
        },

        "table": {
            container: null,
            props: ["aria-colcount", "aria-rowcount"],
            reqProps: null,
            reqChildren: ["row", "rowgroup", "caption"], // rowgroup and caption are not required, but it is allowed
            htmlEquiv: "table",
            roleType: "structure",
            nameRequired: true,
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "tablist": {
            container: null,
            props: ["aria-activedescendant", "aria-multiselectable", "aria-orientation"],
            reqProps: null,
            reqChildren: ["tab"],
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: false, 
            nameFrom: ["author"],
            deprecatedProps: ['aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "tabpanel": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "term": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: "dfn",
            roleType: "structure",
            nameFrom: ["prohibited"],
            prohibitedProps: ["aria-label", "aria-labelledby"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
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

        "time": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["prohibited"],
            prohibitedProps: ["aria-label", "aria-labelledby"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "timer": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "liveRegion",
            nameFrom: ["author"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "toolbar": {
            container: null,
            props: ["aria-activedescendant", "aria-orientation"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameFrom: ["author"],
            deprecatedProps: ['aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "tooltip": {
            container: null,
            props: null,
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "structure",
            nameRequired: false, // ARIA 1.2 has this as nameRequired: true, but ARIA 1.3 removed it because it makes no sense to require a name on a tooltip.
            nameFrom: ["author", "contents"],
            deprecatedProps: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid'] 
        },

        "tree": {
            container: null,
            props: ["aria-activedescendant", "aria-multiselectable", "aria-orientation", "aria-required"],
            reqProps: null,
            reqChildren: ["group", "treeitem"], // group is not required, but it is allowed
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"],
            deprecatedProps: ['aria-haspopup'] 
        },

        "treegrid": {
            container: null,
            props: ["aria-activedescendant", "aria-colcount", "aria-multiselectable", "aria-orientation", "aria-readonly", "aria-required", "aria-rowcount"],
            reqProps: null,
            reqChildren: ["row", "rowgroup"], // rowgroup is not required, but it is allowed
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author"],
            deprecatedProps: ['aria-haspopup'] 
        },

        "treeitem": {
            container: ["group", "tree"],
            props: ["aria-checked", "aria-expanded", "aria-level", "aria-posinset", "aria-selected", "aria-setsize"],
            reqProps: null,
            reqChildren: null,
            htmlEquiv: null,
            roleType: "widget",
            nameRequired: true,
            nameFrom: ["author", "contents"],
            deprecatedProps: ['aria-errormessage', 'aria-invalid'] 
        },
    } // end designPatterns

    // copied from https://html.spec.whatwg.org/multipage/semantics-other.html#disabled-elements
    // https://html.spec.whatwg.org/multipage/input.html#input-type-attr-summary
    static elementsAllowedDisabled = ["button", "input", "select", "textarea", "optgroup", "option", "fieldset"]; // also form-associated custom element
    static elementsAllowedRequired = ["select", "textarea"]; // remove 'input' and add to the individual element, becuase required is not supported on input@type="range", "color", "hidden" or any button types
    static elementsAllowedReadOnly = ["textarea"]; // remove 'input' and add to the individual element, because readonly is not supported on input@type="checkbox", "radio", "range", "color", "file", hidden" or any button types


    /* https://www.w3.org/TR/html-aria/#docconformance
        * documentConformanceRequirement contains properties of the tags related to role without any additional attribute value
        * documentConformanceRequirementSpecialTags contains those tags that require special considerations
        */
    static documentConformanceRequirement: {
        [role: string]: IDocumentConformanceRequirement
    } = {
        "abbr": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true,
            prohibitedAriaAttributesWhenNoImplicitRole: ["aria-label", "aria-labelledby"]
        },
        "address": {
            implicitRole: ["group"],
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
            validRoles: ["doc-dedication", "doc-example", "doc-footnote", "doc-glossary", "doc-pullquote", "doc-tip", "feed", "none", "note", "presentation", "region", "search"],
            globalAriaAttributesValid: true
        },
        "audio": {
            implicitRole: null,
            validRoles: ["application"],
            globalAriaAttributesValid: true
        },
        "b": {
            implicitRole: ["generic"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "base": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "bdi": {
            implicitRole: ["generic"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "bdo": {
            implicitRole: ["generic"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "blockquote": {
            implicitRole: ["blockquote"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "body": {
            implicitRole: ["generic"],
            validRoles: null,
            otherDisallowedAriaAttributes: ['aria-hidden'],
            globalAriaAttributesValid: true
        },
        "br": {
            implicitRole: null,
            validRoles: ["none", "presentation"],
            globalAriaAttributesValid: false,
            otherAllowedAriaAttributes: ["aria-hidden"]
        },
        "button": {
            implicitRole: ["button"],
            validRoles: ["checkbox", "combobox", "gridcell", "link", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "slider", "switch", "tab", "treeitem"],
            globalAriaAttributesValid: true
        },
        "canvas": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "caption": {
            implicitRole: ['caption'],
            validRoles: null,
            globalAriaAttributesValid: true,
            allowAttributesFromImplicitRole: false
        },
        "cite": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true,
            prohibitedAriaAttributesWhenNoImplicitRole: ["aria-label", "aria-labelledby"]
        },
        "code": {
            implicitRole: ["code"],
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
            implicitRole: ["generic"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "datalist": {
            implicitRole: ["listbox"],
            validRoles: null,
            globalAriaAttributesValid: false,
            allowAttributesFromImplicitRole: false
        },
        "dd": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: true
        },
        "del": {
            implicitRole: ["deletion"],
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
            globalAriaAttributesValid: true,
            prohibitedAriaAttributesWhenNoImplicitRole: ["aria-label", "aria-labelledby"]
        },
        "form": {
            implicitRole: ["form"],
            validRoles: ["none", "presentation", "search"],
            globalAriaAttributesValid: true
        },
        "head": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "hgroup": {
            implicitRole: ["generic"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
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
        "hr": {
            implicitRole: ["separator"],
            validRoles: ["doc-pagebreak", "none", "presentation"],
            globalAriaAttributesValid: true
        },
        "html": {
            implicitRole: ["document"],
            validRoles: null,
            globalAriaAttributesValid: false,
            allowAttributesFromImplicitRole: false
        },
        "i": {
            implicitRole: ["generic"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "iframe": {
            implicitRole: null,
            validRoles: ["application", "document", "img", "none", "presentation"],
            globalAriaAttributesValid: true
        },
        "ins": {
            implicitRole: ["insertion"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "kbd": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true,
            prohibitedAriaAttributesWhenNoImplicitRole: ["aria-label", "aria-labelledby"]
        },
        "label": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: true,
            prohibitedAriaAttributesWhenNoImplicitRole: ["aria-label", "aria-labelledby"]
        },
        "legend": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: true,
            prohibitedAriaAttributesWhenNoImplicitRole: ["aria-label", "aria-labelledby"]
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
            globalAriaAttributesValid: true,
            prohibitedAriaAttributesWhenNoImplicitRole: ["aria-label", "aria-labelledby"]
        },
        "math": {
            implicitRole: ["math"],
            validRoles: null,
            globalAriaAttributesValid: true
        },
        "menu": {
            implicitRole: ["list"],
            validRoles: ["group", "listbox", "menu", "menubar", "none", "presentation", "radiogroup", "tablist", "toolbar", "tree"],
            globalAriaAttributesValid: true
        },
        "meta": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "meter": {
            implicitRole: ["meter"],
            validRoles: null,
            globalAriaAttributesValid: true,
            otherDisallowedAriaAttributes: ['aria-valuemax', 'aria-valuemin'],
            allowAttributesFromImplicitRole: false
        },
        "nav": {
            implicitRole: ["navigation"],
            validRoles: ["doc-index", "doc-pagelist", "doc-toc", "menu", "menubar", "tablist", "none", "presentation"],
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
            validRoles: ["group", "listbox", "menu", "menubar", "none", "presentation", "radiogroup", "tablist", "toolbar", "tree"],
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
            globalAriaAttributesValid: true,
            otherDisallowedAriaAttributes: ["aria-selected"]
        },
        "output": {
            implicitRole: ["status"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "p": {
            implicitRole: ["paragraph"],
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
            globalAriaAttributesValid: false,
            otherAllowedAriaAttributes: ["aria-hidden"] 
        },
        "pre": {
            implicitRole: ["generic"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "progress": {
            implicitRole: ["progressbar"],
            validRoles: null,
            globalAriaAttributesValid: true,
            otherDisallowedAriaAttributes: ["aria-valuemax"] 
        },
        "q": {
            implicitRole: ["generic"],
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
            globalAriaAttributesValid: true,
            prohibitedAriaAttributesWhenNoImplicitRole: ["aria-label", "aria-labelledby"]
        },
        "ruby": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "s": {
            implicitRole: ["deletion"],
            validRoles: ["any"],
            globalAriaAttributesValid: true,
            otherDisallowedAriaAttributes: ["aria-label", "aria-labelledby"]
        },
        "samp": {
            implicitRole: ["generic"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "script": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "search": {
            implicitRole: ['search'],
            validRoles: ['search', 'form', 'group', 'none', 'presentation', 'region'],
            globalAriaAttributesValid: true
        },
        "slot": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "small": {
            implicitRole: ["generic"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "source": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "span": {
            implicitRole: ["generic"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "strong": {
            implicitRole: ["strong"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "style": {
            implicitRole: null,
            validRoles: null,
            globalAriaAttributesValid: false
        },
        "sub": {
            implicitRole: ["subscript"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "sup": {
            implicitRole: ["superscript"],
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
            implicitRole: ["time"],
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
            implicitRole: ["generic"],
            validRoles: ["any"],
            globalAriaAttributesValid: true
        },
        "ul": {
            implicitRole: ["list"],
            validRoles: ["group", "listbox", "menu", "menubar", "none", "presentation", "radiogroup", "tablist", "toolbar", "tree"],
            globalAriaAttributesValid: true
        },
        "var": {
            implicitRole: null,
            validRoles: ["any"],
            globalAriaAttributesValid: true,
            prohibitedAriaAttributesWhenNoImplicitRole: ["aria-label", "aria-labelledby"]
        },
        "video": {
            implicitRole: null,
            validRoles: ["application"],
            globalAriaAttributesValid: true
        },
        "wbr": {
            implicitRole: null,
            validRoles: ["none", "presentation"],
            globalAriaAttributesValid: false,
            otherAllowedAriaAttributes: ["aria-hidden"]
        }
    } // end documentConformanceRequirement

    static documentConformanceRequirementSpecialTags: {
        [role: string]: {
            [key: string] : IDocumentConformanceRequirement
        } | IDocumentConformanceRequirement
    } = {
        "a": {
            "with-href": {
                implicitRole: ["link"],
                //roleCondition: " when non-empty href attribute is present",
                validRoles: ["button", "checkbox", "doc-backlink", "doc-biblioref", "doc-glossref", "doc-noteref", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "switch", "tab", "treeitem"],
                globalAriaAttributesValid: true,
                otherDisallowedAriaAttributes: ["aria-disabled=true"]
            },
            "without-href": {
                implicitRole: ["generic"],
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
                implicitRole: ["generic"],
                //roleCondition: " when href attribute is not present",
                validRoles: ["button", "link"],
                globalAriaAttributesValid: true
            }
        },
// TODO
//        "autonomous custom element": {
//            implicitRole: ["Role exposed from author defined ElementInternals. Otherwise no corresponding role."],
//            validRoles: ["If role defined by ElementInternals", "any role", "no role Otherwise"],
//            globalAriaAttributesValid: true
//        },
        "div": {
            "child-dl": {
                implicitRole: ["generic"],
                validRoles: ["presentation", "none"],
                globalAriaAttributesValid: true
            },
            "no-child-dl": {
                implicitRole: ["generic"],
                validRoles: ["any"],
                globalAriaAttributesValid: true
            }
        },
        "figure": {
            "child-figcaption": {
                implicitRole: ["figure"],
                validRoles: ['doc-example'],
                globalAriaAttributesValid: true
            },
            "no-child-figcaption": {
                implicitRole: ["figure"],
                validRoles: ["any"],
                globalAriaAttributesValid: true
            }
        },
        "footer": {
            "des-section-article-aside-main-nav": {
                implicitRole: ["generic"],
                //roleCondition: " when descendant of an article, aside, main, nav or section element",
                validRoles: ["doc-footnote", "group", "none", "presentation"],
                globalAriaAttributesValid: true
            },
            "other": {
                implicitRole: ["contentinfo"],
                //roleCondition: " when not a descendant of an article, aside, main, nav or section element",
                validRoles: ["doc-footnote", "group", "none", "presentation"],
                globalAriaAttributesValid: true
            }
        },
// TODO
//        "form-associated custom element": {
//            implicitRole: ["Role exposed from author defined ElementInternals. Otherwise 'generic'."],
//            validRoles: ["If role defined by ElementInternals", "form-related roles: button", "checkbox", "combobox", "group", "listbox", "progressbar", "radio", "radiogroup", "searchbox", "slider", "spinbutton", "switch", "textbox", "no role Otherwise"],
//            globalAriaAttributesValid: true
//        },

        "header": {
            "des-section-article-aside-main-nav": {
                implicitRole: ["generic"],
                //roleCondition: " when descendant of an article, aside, main, nav or section element",
                validRoles: ["group", "none", "presentation"],
                globalAriaAttributesValid: true
            },
            "other": {
                implicitRole: ["banner"],
                //roleCondition: " when not a descendant of an article, aside, main, nav or section element",
                validRoles: ["group", "none", "presentation"],
                globalAriaAttributesValid: true
            }

        },
        "img": {
            "img-with-accname": {
                implicitRole: ["img"],
                //roleCondition: "when accessible name presents",
                validRoles: ["button", "checkbox", "doc-cover", "link", "menuitem", "menuitemcheckbox", "menuitemradio", "meter", "option", "progressbar", "radio", "scrollbar", "separator", "slider", "switch", "tab", "treeitem"],
                globalAriaAttributesValid: true
            },
            "img-without-accname-empty-alt": {
                implicitRole: ["presentation", "none"],
                //roleCondition: "when no accessible name presents and alt=''",
                validRoles: null,
                globalAriaAttributesValid: false, 
                otherAllowedAriaAttributes: ["aria-hidden=true"]
            },
            "img-without-accname-no-alt": {
                implicitRole: ["img"],
                //roleCondition: "when neither accessible name no alt presents",
                validRoles: ["presentation", "none"],
                globalAriaAttributesValid: false, 
                otherAllowedAriaAttributes: ["aria-hidden=true"]
            }
        },
        "input": {
            "button": {
                implicitRole: ["button"],
                validRoles: ["checkbox", "combobox", "gridcell", "link", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "slider", "switch", "tab", "treeitem"],
                globalAriaAttributesValid: true
            },
            "checkbox-with-aria-pressed": {
                implicitRole: ["checkbox"],
                //roleCondition: " with type=checkbox and aria-pressed attribute is present",
                validRoles: ["menuitemcheckbox", "option", "switch", "button"],
                globalAriaAttributesValid: true,
                otherAllowedAriaAttributes: ["aria-required"],
                otherDisallowedAriaAttributes: ["aria-checked"]
            },
            "checkbox-without-aria-pressed": {
                implicitRole: ["checkbox"],
                //roleCondition: " with type=checkbox and aria-pressed attribute is not present",
                validRoles: ["menuitemcheckbox", "option", "switch"],
                globalAriaAttributesValid: true,
                otherAllowedAriaAttributes: ["aria-required"],
                otherDisallowedAriaAttributes: ["aria-checked"]
            },
            "color": {
                implicitRole: null,
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "date": {
                implicitRole: null,
                validRoles: null,
                globalAriaAttributesValid: true,
                otherAllowedAriaAttributes: ["aria-required", "aria-readonly"],
                otherRolesForAttributes: ["textbox"]
            },
            "datetime-local": {
                implicitRole: null,
                validRoles: null,
                globalAriaAttributesValid: true,
                otherAllowedAriaAttributes: ["aria-required", "aria-readonly"],
                otherRolesForAttributes: ["textbox"]
            },
            "email-no-list": {
                implicitRole: ["textbox"],
                //roleCondition: " with type=email and no list attribute is present",
                validRoles: null,
                globalAriaAttributesValid: true,
                otherAllowedAriaAttributes: ["aria-placeholder", "aria-required", "aria-readonly"],
                otherRolesForAttributes: ["textbox"]
            },
            "email-with-list": {
                implicitRole: ["combobox"],
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "file": {
                implicitRole: null,
                validRoles: null,
                globalAriaAttributesValid: true,
                otherAllowedAriaAttributes: ["aria-required"],
            },
            "hidden": {
                implicitRole: null,
                validRoles: null,
                globalAriaAttributesValid: false
            },
            "image": {
                implicitRole: ["button"],
                validRoles: ["checkbox", "gridcell", "link", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "slider", "switch", "tab", "treeitem"],
                globalAriaAttributesValid: true
            },
            "month": {
                implicitRole: null,
                validRoles: null,
                globalAriaAttributesValid: true,
                otherAllowedAriaAttributes: ["aria-readonly"],
                otherRolesForAttributes: ["textbox"]
            },
            "number": {
                implicitRole: ["spinbutton"],
                validRoles: null,
                globalAriaAttributesValid: true,
                otherAllowedAriaAttributes: ["aria-placeholder", "aria-required", "aria-readonly"],
            },
            "password": {
                implicitRole: null,
                validRoles: null,
                globalAriaAttributesValid: true,
                otherAllowedAriaAttributes: ["aria-placeholder", "aria-required", "aria-readonly"],
                otherRolesForAttributes: ["textbox"]
            },
            "radio": {
                implicitRole: ["radio"],
                validRoles: ["menuitemradio"],
                globalAriaAttributesValid: true,
                otherAllowedAriaAttributes: ["aria-required"],
                otherDisallowedAriaAttributes: ["aria-checked"]
            },
            "range": {
                implicitRole: ["slider"],
                validRoles: null,
                globalAriaAttributesValid: true,
                otherDisallowedAriaAttributes: ["aria-valuemax", "aria-valuemin"]
            },
            "reset": {
                implicitRole: ["button"],
                validRoles: ["checkbox", "combobox", "gridcell", "link", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "slider", "switch", "tab", "treeitem"],
                globalAriaAttributesValid: true
            },
            "search-no-list": {
                implicitRole: ["searchbox"],
                validRoles: null,
                globalAriaAttributesValid: true,
                otherAllowedAriaAttributes: ["aria-placeholder", "aria-required", "aria-readonly"]
            },
            "search-with-list": {
                implicitRole: ["combobox"],
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "submit": {
                implicitRole: ["button"],
                validRoles: ["checkbox", "combobox", "gridcell", "link", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "slider", "switch", "tab", "treeitem"],
                globalAriaAttributesValid: true
            },
            "tel-no-list": {
                implicitRole: ["textbox"],
                validRoles: null,
                globalAriaAttributesValid: true,
                otherAllowedAriaAttributes: ["aria-placeholder", "aria-required", "aria-readonly"]
            },
            "tel-with-list": {
                implicitRole: ["combobox"],
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "text-no-list": {
                implicitRole: ["textbox"],
                validRoles: ["combobox", "searchbox", "spinbutton"],
                globalAriaAttributesValid: true,
                otherAllowedAriaAttributes: ["aria-placeholder", "aria-required", "aria-readonly"]
            },
            "text-with-list": {
                implicitRole: ["combobox"],
                validRoles: null,
                globalAriaAttributesValid: true
                // otherDisallowedAriaAttributes: ["aria-haspopup"]  // covered in a different rule
            },
            "time": {
                implicitRole: null,
                validRoles: null,
                globalAriaAttributesValid: true,
                otherAllowedAriaAttributes: ["aria-readonly"],
                otherRolesForAttributes: ["textbox"]
            },
            "url-no-list": {
                implicitRole: ["textbox"],
                validRoles: null,
                globalAriaAttributesValid: true,
                otherAllowedAriaAttributes: ["aria-placeholder", "aria-required", "aria-readonly"]
            },
            "url-with-list": {
                implicitRole: ["combobox"],
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "week": {
                implicitRole: null,
                validRoles: null,
                globalAriaAttributesValid: true,
                otherAllowedAriaAttributes: ["aria-readonly"],
                otherRolesForAttributes: ["textbox"]
            },
            "default-with-list": {
                // input with a missing or invalid type, with a list attribute
                implicitRole: ["combobox"],
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "default-no-list": {
                // input with a missing or invalid type, with a list attribute
                implicitRole: ["textbox"],
                validRoles: null,
                globalAriaAttributesValid: true
            }
        },
        "li": {
            "child-of-list-role": {
                implicitRole: ['listitem'],
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "no-child-of-list-role": {
                implicitRole: ['generic'],
                validRoles: ["any"],
                globalAriaAttributesValid: true
            }
        },
        "section": {
            "with-name": {
                implicitRole: ["region"],
                validRoles: ["alert", "alertdialog", "application", "banner", "complementary", "contentinfo", "dialog", "doc-abstract", "doc-acknowledgments", "doc-afterword", "doc-appendix", "doc-bibliography", "doc-chapter", "doc-colophon", "doc-conclusion", "doc-credit", "doc-credits", "doc-dedication", "doc-endnotes", "doc-epigraph", "doc-epilogue", "doc-errata", "doc-example", "doc-foreword", "doc-glossary", "doc-index", "doc-introduction", "doc-notice", "doc-pagelist", "doc-part", "doc-preface", "doc-prologue", "doc-pullquote", "doc-qna", "doc-toc", "document", "feed", "group", "log", "main", "marquee", "navigation", "none", "note", "presentation", "search", "status", "tabpanel"],
                globalAriaAttributesValid: true
            },
            "without-name": {
                implicitRole: null,
                validRoles: ["alert", "alertdialog", "application", "banner", "complementary", "contentinfo", "dialog", "doc-abstract", "doc-acknowledgments", "doc-afterword", "doc-appendix", "doc-bibliography", "doc-chapter", "doc-colophon", "doc-conclusion", "doc-credit", "doc-credits", "doc-dedication", "doc-endnotes", "doc-epigraph", "doc-epilogue", "doc-errata", "doc-example", "doc-foreword", "doc-glossary", "doc-index", "doc-introduction", "doc-notice", "doc-pagelist", "doc-part", "doc-preface", "doc-prologue", "doc-pullquote", "doc-qna", "doc-toc", "document", "feed", "group", "log", "main", "marquee", "navigation", "none", "note", "presentation", "search", "status", "tabpanel"],
                globalAriaAttributesValid: true
            }
        },
        "select": {
            "no-multiple-attr-size-gt1": {
                //roleCondition: " with a multiple attribute or a size attribute having value greater than 1"
                implicitRole: ["combobox"],
                validRoles: ["menu"],
                globalAriaAttributesValid: true,
                otherDisallowedAriaAttributes: ["aria-multiselectable"]
            },
            "multiple-attr-size-gt1": {
                //roleCondition: " with no multiple attribute and no size attribute having value greater than 1"
                implicitRole: ["listbox"],
                validRoles: null,
                globalAriaAttributesValid: true,
                otherDisallowedAriaAttributes: ["aria-multiselectable"]
            }
        },
        "summary": {
            "first-summary-of-detail": {
                implicitRole: null,
                validRoles: null,
                globalAriaAttributesValid: true,
                otherAllowedAriaAttributes: ["aria-disabled", "aria-haspopup"]
            },
            "no-first-summary-of-detail": {
                implicitRole: null,
                validRoles: ["any"],
                globalAriaAttributesValid: true
            }
        },
        "tbody": {
            "des-table": {
                implicitRole: ["rowgroup"],
                validRoles: ["any"],
                globalAriaAttributesValid: true
            },
            "des-grid": {
                implicitRole: ["rowgroup"],
                validRoles: ["any"],
                globalAriaAttributesValid: true
            },
            "des-treegrid": {
                implicitRole: ["rowgroup"],
                validRoles: ["any"],
                globalAriaAttributesValid: true
            },
            "des-other": {
                implicitRole: null,
                validRoles: ["any"],
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
            "des-treegrid": {
                implicitRole: ["gridcell"],
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "des-other": {
                implicitRole: null,
                validRoles: ["any"],
                globalAriaAttributesValid: true
            }
        },
        "th": {
            "des-table-grid-treegrid-row-scope": {
                implicitRole: ["rowheader", "cell"],
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "des-table-grid-treegrid-column-scope": {
                implicitRole: ["columnheader", "cell"],
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
            "des-treegrid": {
                implicitRole: ["row"],
                validRoles: null,
                globalAriaAttributesValid: true
            },
            "des-other": {
                implicitRole: null,
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

    // map aria attribute to the corresponding native attribute, apply to any element applicable
    // note this mapping is for the related attributes in the same element without checking the parent tree.
    // refer to https://w3c.github.io/html-aria/
    static relatedAriaHtmlAttributes: {
        [ariaAttr: string] : {
            conflict: {
                ariaAttributeValue: string | null,
                htmlAttributeNames: string[],
                htmlAttributeValues: string[] | null
            }[],
            overlapping?: {    
                ariaAttributeValue: string | null,
                htmlAttributeNames: string[],
                htmlAttributeValues: string[] | null
            }[]
        } 
    } =  {
        "aria-checked": {
            conflict: [{
                ariaAttributeValue: "false",
                htmlAttributeNames: ["checked"],
                htmlAttributeValues: null
            }],
            overlapping: [{    
                ariaAttributeValue: "true",
                htmlAttributeNames: ["checked"],
                htmlAttributeValues: null
            }]
        },    
        "aria-disabled": {
            conflict: [{
                ariaAttributeValue: "false",
                htmlAttributeNames: ["disabled"],
                htmlAttributeValues: null
            }],
            overlapping: [{    
                ariaAttributeValue: "true",
                htmlAttributeNames: ["disabled"],
                htmlAttributeValues: null
            }]
        },
        "aria-hidden": {
            conflict: [{
                ariaAttributeValue: "false",
                htmlAttributeNames: ["hidden"],
                htmlAttributeValues: ["hidden,null"]
            },
            {
                ariaAttributeValue: "true",
                htmlAttributeNames: ["hidden"],
                htmlAttributeValues: ["until-found"]
            }],
            overlapping: [{    
                ariaAttributeValue: "true",
                htmlAttributeNames: ["hidden"],
                htmlAttributeValues: ["hidden,null"]
            }]
        },    
        "aria-placeholder": {
            conflict: [{
                ariaAttributeValue: null,
                htmlAttributeNames: ["placeholder"],
                htmlAttributeValues: null
            }]
        },    
        "aria-valuemax": {
            conflict: [{
                ariaAttributeValue: null,
                htmlAttributeNames: ["max"],
                htmlAttributeValues: null
            }]
            //overlap case covered in the role definition: Authors SHOULD NOT use aria-valuemax on any element which allows the max attribute. Use the max attribute instead. 
        },    
        "aria-valuemin": {
            conflict: [{
                ariaAttributeValue: null,
                htmlAttributeNames: ["min"],
                htmlAttributeValues: null
            }]
            ////overlap case covered in the role definition:Authors SHOULD NOT use aria-valuemin on any element which allows the min attribute. Use the min attribute instead.
        },    
        "aria-readonly": {
            conflict: [{
                ariaAttributeValue: "false",
                htmlAttributeNames: ["readonly", "contenteditable", "iscontenteditable"],
                htmlAttributeValues: [null, "false", "false"]
            }],
            overlapping: [{    
                ariaAttributeValue: "true",
                htmlAttributeNames: ["readonly", "contenteditable", "iscontenteditable"],
                htmlAttributeValues: [null, "true", "true"]
            }]
        },
        "aria-required": {
            conflict: [{
                ariaAttributeValue: "false",
                htmlAttributeNames: ["required"],
                htmlAttributeValues: null
            }],
            overlapping: [{    
                ariaAttributeValue: "true",
                htmlAttributeNames: ["required"],
                htmlAttributeValues: null
            }]
        },        
        "aria-colspan": {
            conflict: [{
                // conflict occurs if both values are different
                ariaAttributeValue: "VALUE",
                htmlAttributeNames: ["colspan"],
                htmlAttributeValues: ["VALUE"]
            }],
            overlapping: [{    
                // overlap occurs if both exists
                ariaAttributeValue: null,
                htmlAttributeNames: ["colspan"],
                htmlAttributeValues: null
            }]
        },
        "aria-rowspan": {
            conflict: [{
                // conflict occurs if both values are different
                ariaAttributeValue: "VALUE",
                htmlAttributeNames: ["rowspan"],
                htmlAttributeValues: ["VALUE"]
            }],
            overlapping: [{   
                // overlap occurs if both exists 
                ariaAttributeValue: null,
                htmlAttributeNames: ["rowspan"],
                htmlAttributeValues: null
            }]
        },
        "aria-autocomplete": {
            conflict: [{
                // conflict occurs if both exists, aria value is only for custom widget, rather than native
                ariaAttributeValue: null,
                htmlAttributeNames: ["autocomplete"],
                htmlAttributeValues: null
            }]
        }  
    }

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
