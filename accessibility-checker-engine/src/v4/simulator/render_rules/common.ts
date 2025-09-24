import { SRCursor } from "../SRCursor";
import { SRRendererRule } from "../SRRendererRule";

function padNameAfter(cursor: SRCursor) {
    return cursor.getName()?cursor.getName()+" ":"";
}

function padNameBefore(cursor: SRCursor) {
    return cursor.getName()?" "+cursor.getName():"";
}

export let RULES: SRRendererRule[] = [
    // Single role rules - alphabetically sorted
    
    // Button role
    new SRRendererRule({
        roles: ["button"],
        elems: [],
        modes: ["item", "button", "tab_focus"],
        tests: [
            (cursor: SRCursor) => (cursor.isStartTag() && (cursor.getNode() as HTMLElement).getAttribute("aria-pressed") === "true") ?
                `[toggle button, pressed] ${cursor.getNameInfo()?.name || ""}` : null,
            (cursor: SRCursor) => (cursor.isStartTag() && (cursor.getNode() as HTMLElement).getAttribute("aria-pressed") === "false") ?
                `[toggle button, not pressed] ${cursor.getNameInfo()?.name || ""}` : null,
            (cursor: SRCursor) => {
                if (cursor.isEndTag()) return undefined;
                let expandStr = "";
                const elem = cursor.getElement();
                if (elem.getAttribute("aria-haspopup") === "true") {
                    expandStr += ", menu";
                }
                if (elem.hasAttribute("aria-expanded")) {
                    expandStr += `, ${elem.getAttribute("aria-expanded") === "true" ? "expanded" : "collapsed"}`;
                }
                return `${cursor.getNameInfo()?.name || ""} [button${expandStr}]`;
            },
            (cursor: SRCursor) => { if (cursor.isEndTag()) return ""; }
        ]
    }),

    // Checkbox role
    new SRRendererRule({
        roles: ["checkbox"],
        elems: [],
        modes: ["item", "checkbox", "tab_focus"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.isStartTag()) {
                    const elem = cursor.getNode() as HTMLInputElement;
                    if (elem.getAttribute("aria-checked") === "mixed") {
                        return `[checkbox, half checked]${padNameBefore(cursor)}`
                    } else {
                        return `[checkbox, ${elem.checked ? "checked" : "not checked"}]${padNameBefore(cursor)}`
                    }
                } else {
                    return "";
                }
            }
        ]
    }),

    // Combobox role
    new SRRendererRule({
        roles: ["combobox"],
        elems: [],
        modes: ["item", "combo", "tab_focus"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.isEndTag()) return "";
                let state = "";
                let value = "";
                if (cursor.getNode().nodeName.toUpperCase() === "SELECT") {
                    state = ", collapsed";

                    const optionId = (cursor.getNode() as any).value;
                    let valueElem = cursor.getElement().querySelector(`option[value='${optionId}']`);
                    let temp = new SRCursor(valueElem, false);
                    value = temp.getNameInfo()?.name ? ` ${temp.getNameInfo()?.name}` : "";
                    return `${padNameAfter(cursor)}[combo box${state}]${value}`;
                } else if (cursor.getNode().nodeName.toUpperCase() === "INPUT" && !cursor.getElement().hasAttribute("role")) {
                    return `${padNameAfter(cursor)}[combo box, has auto complete, editable, opens list]`;
                } else {
                    const elem = cursor.getElement();
                    if (elem.hasAttribute("aria-expanded")) {
                        state = `, ${elem.getAttribute("aria-expanded") === "true" ? "expanded" : "collapsed"}`;
                        if (elem.hasAttribute("aria-autocomplete")) {
                            state += `, has auto complete`;
                        }
                        state += `, editable, opens list`
                    }
                    return `[combo box${state}]${value}`;
                }
            }
        ]
    }),

    // Default role (fallback)
    new SRRendererRule({
        roles: ["default"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => cursor.isStartTag() ?
                `!!<${cursor.getRole()}>${(cursor.getNameInfo()?.name + "")}!!` :
                `!!</${cursor.getRole()}>!!`
        ]
    }),

    // Deletion role
    new SRRendererRule({
        roles: ["deletion"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => (cursor.isStartTag() && `[deleted]` || "")
        ]
    }),

    // Dialog role
    new SRRendererRule({
        roles: ["dialog"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                return cursor.isEndTag() ? `[End of dialog]` : `[Start of dialog:${padNameBefore(cursor)}`;
            }
        ]
    }),

    // Document role
    new SRRendererRule({
        roles: ["document", "generic"],
        elems: [],
        modes: ["item"],
        tests: [
            () => ""
        ]
    }),

    // Graphics document role
    new SRRendererRule({
        roles: ["graphics-document"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => (cursor.isStartTag() && !cursor.getNameInfo()?.name && cursor.getNameInfo()?.name !== "" && "[Unlabeled graphic]") || null,
            (cursor: SRCursor) => (cursor.isStartTag() && (cursor.getNameInfo()?.name === "")) ? "" : null,
            (cursor: SRCursor) => (cursor.isStartTag() && cursor.getNameInfo()?.name && `[graphic] ${cursor.getNameInfo()?.name || ""}`) || null,
            (cursor: SRCursor) => (cursor.isEndTag()) ? "" : null
        ]
    }),

    // Heading role
    new SRRendererRule({
        roles: ["heading"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                let retVal = "";
                if (cursor.isStartTag()) {
                    retVal = `[heading level ${(cursor.getNode() as HTMLElement).ariaLevel || cursor.getNode().nodeName.substring(1)}]`;
                    let nameInfo = cursor.getNameInfo();
                    if (nameInfo && !["content", "text"].includes(nameInfo.nameFrom)) {
                        retVal += ` ${cursor.getNameInfo()?.name || ""}`;
                    }
                }
                return retVal;
            }
        ]
    }),

    // -- in heading mode
    new SRRendererRule({
        roles: ["heading"],
        elems: [],
        modes: ["heading", "h1", "h2", "h3", "h4", "h5", "h6"],
        tests: [
            (cursor: SRCursor) => {
                let retVal = "";
                if (cursor.isStartTag()) {
                    let nameInfo = cursor.getNameInfo();
                    if (nameInfo) {
                        retVal = `${cursor.getNameInfo()?.name || ""} `;
                    }
                    retVal += `[heading level ${(cursor.getNode() as HTMLElement).ariaLevel || cursor.getNode().nodeName.substring(1)}]`;
                }
                return retVal;
            }
        ]
    }),

    // Image role
    new SRRendererRule({
        roles: ["img"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.isEndTag()) {
                    return "";
                } else {
                    if (!cursor.getNameInfo()?.name && cursor.getNameInfo()?.name !== "") {
                        return "[Unlabeled graphic]"
                    } else if (cursor.getNameInfo()?.name === "") {
                        return "";
                    } else {
                        return `[graphic] ${cursor.getNameInfo()?.name || ""}`
                    }
                }
            }
        ]
    }),

    // Insertion role
    new SRRendererRule({
        roles: ["insertion"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => (cursor.isStartTag() && `[inserted]` || "")
        ]
    }),

    // Link role
    new SRRendererRule({
        roles: ["link"],
        elems: [],
        modes: ["item", "link", "tab_focus", "region"],
        tests: [
            (cursor: SRCursor) => {
                let href: string = ((cursor.getNode() as any).href) || "";
                let retVal = "";
                if (cursor.isStartTag()) {
                    if (href.startsWith(document.location.href) && href.charAt(document.location.href.length) === "#") {
                        retVal = `[same page link]`;
                    } else {
                        retVal = `[link]`;
                    }
                    let nameInfo = cursor.getNameInfo();
                    if (nameInfo && !["content", "text"].includes(nameInfo.nameFrom)) {
                        retVal += ` ${(nameInfo?.name || "")}`
                    }
                }
                return retVal;
            }
        ]
    }),

    // Listitem role
    new SRRendererRule({
        roles: ["listitem"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                let isOrdered: boolean | undefined;
                let walkParents = cursor.getNode().parentNode;
                while (typeof isOrdered === "undefined" && walkParents) {
                    if (walkParents.nodeType === 1) {
                        const elem = walkParents as HTMLElement;
                        if (elem.hasAttribute("role")) {
                            if (elem.getAttribute("role") === "list") {
                                isOrdered = false;
                            }
                        } else if (elem.nodeName.toUpperCase() === "UL") {
                            isOrdered = false;
                        } else if (elem.nodeName.toUpperCase() === "OL") {
                            isOrdered = true;
                        }
                    }
                    walkParents = walkParents.parentNode;
                }
                let retStr = "";
                if (!isOrdered) {
                    const elem = cursor.getElement();
                    if (elem.nodeName.toUpperCase() === "LI" && window.getComputedStyle(elem).listStyleType === "none") {
                        retStr = cursor.isStartTag() ? `${(cursor.getNameInfo()?.name || "")}` : "";
                    } else {
                        retStr = cursor.isStartTag() ? `[bullet] ${(cursor.getNameInfo()?.name || "")}` : "";
                    }
                } else {
                    let walkBack = cursor.clone();
                    let count = 0;
                    while (walkBack.getRole() !== "list") {
                        if (walkBack.isStartTag() && walkBack.getRole() === "listitem") {
                            ++count;
                        }
                        walkBack.previous(() => true);
                    }
                    retStr = cursor.isStartTag() ? `${count}. ${(cursor.getNameInfo()?.name || "")}` : "";
                }
                return retStr;
            }
        ]
    }),

    // Math role
    new SRRendererRule({
        roles: ["math"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => cursor.isEndTag() ? `[math content]` : ""
        ]
    }),

    // Link role
    new SRRendererRule({
        roles: ["menuitem"],
        elems: [],
        modes: ["item", "tab_focus", "region"],
        tests: [
            (cursor: SRCursor) => {
                let retVal = "";
                if (cursor.isStartTag()) {
                    // let isSubMenuContainer = false;
                    // for (let checkChildren=cursor.getNode().firstChild; !isSubMenuContainer && checkChildren !== null; checkChildren = checkChildren.nextSibling) {
                    //     isSubMenuContainer = checkChildren.nodeName.toUpperCase() === "UL";
                    // }
                    // if (isSubMenuContainer) return "[????menu]";
                    let expandStr = "";
                    const elem = cursor.getElement();
                    if (elem.getAttribute("aria-haspopup") === "true") {
                        expandStr += ", sub-menu";
                    }
                    if (elem.hasAttribute("aria-expanded")) {
                        expandStr += `, ${elem.getAttribute("aria-expanded") === "true" ? "expanded" : "collapsed"}`;
                    }

                    retVal = `[menu${expandStr}]`;
                    let nameInfo = cursor.getNameInfo();
                    if (nameInfo && !["content", "text"].includes(nameInfo.nameFrom)) {
                        retVal += ` ${(nameInfo?.name || "")}`
                    }
                }
                return retVal;
            }
        ]
    }),

    // Meter role
    new SRRendererRule({
        roles: ["meter"],
        elems: [],
        modes: ["item", "tab_focus"],
        tests: [
            (cursor: SRCursor) => cursor.isStartTag() ? `[progress bar, ${((cursor.getNode() as HTMLInputElement).value)}]` : ""
        ]
    }),

    // Progressbar role
    new SRRendererRule({
        roles: ["progressbar"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => cursor.isStartTag() ? `[progress bar, ${((cursor.getNode() as HTMLInputElement).value)}]` : ""
        ]
    }),

    // Radio role
    new SRRendererRule({
        roles: ["radio"],
        elems: [],
        modes: ["item", "tab_focus"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.isStartTag()) {
                    return `[radio button, ${(cursor.getNode() as any).checked ? "checked" : "not checked"}]${padNameBefore(cursor)}`
                } else {
                    return "";
                }
            }
        ]
    }),

    // Searchbox role
    new SRRendererRule({
        roles: ["searchbox"],
        elems: [],
        modes: ["item", "tab_focus"],
        tests: [
            (cursor: SRCursor) => cursor.isStartTag() ? `${padNameAfter(cursor)}[edit]` : ""
        ]
    }),

    // Separator role
    new SRRendererRule({
        roles: ["separator"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => (cursor.isStartTag() && `[separator]` || "")
        ]
    }),

    // Slider role
    new SRRendererRule({
        roles: ["slider"],
        elems: [],
        modes: ["item", "tab_focus"],
        tests: [
            (cursor: SRCursor) => cursor.isStartTag() ? `${padNameAfter(cursor)}[slider, ${(cursor.getNode() as any).value}]` : ""
        ]
    }),

    // Spinbutton role
    new SRRendererRule({
        roles: ["spinbutton"],
        elems: [],
        modes: ["item", "tab_focus"],
        tests: [
            (cursor: SRCursor) => cursor.isStartTag() ? `${padNameAfter(cursor)}[spinbutton, editable]` : ""
        ]
    }),

    // Tab role
    new SRRendererRule({
        roles: ["tab"],
        elems: [],
        modes: ["item", "tab_focus"],
        tests: [
            (cursor: SRCursor) => (cursor.isStartTag() && `[tab${(cursor.getNode() as HTMLElement).getAttribute("aria-selected") === "true" ? ", selected" : ""}] ${cursor.getNameInfo()?.name || ""}`) || ""
        ]
    }),

    // Tablist role
    new SRRendererRule({
        roles: ["tablist"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                    if (cursor.getNameInfo() === null) return null;
                if (cursor.isStartTag()) {
                    return `[group start, ${cursor.getNameInfo()?.name || ""}]`;
                } else {
                    return `[group end, ${cursor.getNameInfo()?.name || ""}]`;
                }
            }
        ]
    }),

    // Tabpanel role
    new SRRendererRule({
        roles: ["tabpanel"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                    if (cursor.getNameInfo() === null) return null;
                if (cursor.isStartTag()) {
                    return `[Tab panel start, ${cursor.getNameInfo()?.name || ""}]`;
                } else {
                    return `[Tab panel end, ${cursor.getNameInfo()?.name || ""}]`;
                }
            }
        ]
    }),

    // Text role
    new SRRendererRule({
        roles: ["text"],
        elems: [],
        modes: ["item", "link", "tab_focus", "region"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.isEndTag() || !cursor.getNode().parentElement) return null;
                const elem = cursor.getNode().parentElement;
                if (elem.ownerDocument.defaultView.getComputedStyle(elem).textDecorationLine === "line-through") {
                    return `[strikethrough] ${(cursor.getNameInfo()?.name + "")} [end strikethrough]`;
                }
                return `${(cursor.getNameInfo()?.name + "")}`;
            }
        ]
    }),

    // -- in heading mode
    new SRRendererRule({
        roles: ["text"],
        elems: [],
        modes: ["heading"],
        tests: [
            (cursor: SRCursor) => ""
        ]
    }),

    // Textbox role
    new SRRendererRule({
        roles: ["textbox"],
        elems: [],
        modes: ["item", "tab_focus"],
        tests: [
            (cursor: SRCursor) => {
                const elem = cursor.getElement();
                if (cursor.isStartTag()) {
                    let placeholder = "";
                    if (elem.hasAttribute("placeholder")) {
                        placeholder = `, placeholder: ${elem.getAttribute("placeholder")}`
                    }
                    if (elem.nodeName.toUpperCase() === "INPUT") {
                        return `${padNameAfter(cursor)}[edit${placeholder}]`;
                    } else {
                        return `${padNameAfter(cursor)}[edit, multiline]`;
                    }
                } else if (elem.nodeName.toUpperCase() === "TEXTAREA") {
                    return "[out of edit]";
                } else {
                    return "";
                }
            }
        ]
    }),

    // HTML Element rules
    new SRRendererRule({
        roles: [],
        elems: ["BODY"],
        modes: ["item", "tab_focus"],
        tests: [
            (cursor: SRCursor) => {
                return cursor.isEndTag() ? `[End of document]` : `[Start of document${document.title.trim().length > 0 ? ": " + document.title.trim() : ""}]`
            }
        ]
    }),

    new SRRendererRule({
        roles: [],
        elems: ["BR"],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                try {
                    let walk = cursor.clone();
                    // Walk until we hit the beginning of the page, find another BR, or find something with a name
                    while (walk.previous(() => true) && walk.getNode().nodeName.toUpperCase() !== "BR" && walk.getNameInfo() && walk.getNameInfo().name.trim().length === 0);
                    return walk.getNode().nodeName.toUpperCase() === "BR" ? "[blank]" : null;
                } catch (err) {
                    console.error(err);
                }
            }
        ]
    }),

    new SRRendererRule({
        roles: [],
        elems: ["DL"],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => ""
        ]
    }),

    new SRRendererRule({
        roles: [],
        elems: ["INPUT"],
        modes: ["item", "tab_focus"],
        tests: [
            (cursor: SRCursor) => (cursor.isStartTag() && cursor.getElement()?.getAttribute("type") === "password" && `${padNameAfter(cursor)}[edit, protected]`) || null,
            (cursor: SRCursor) => {
                if (cursor.isStartTag() && cursor.getElement()?.getAttribute("type") === "file") {
                    let value = (cursor.getElement() as HTMLInputElement)?.value || "";
                    value = value === "" ? "No file chosen" : value.substring("C:\\fakepath\\".length);
                    return `${padNameAfter(cursor)}[button] ${padNameAfter(cursor)}[${value}]`;
                }
                return null;
            },
            (cursor: SRCursor) => {
                if (cursor.isStartTag() && cursor.getElement()?.getAttribute("type") === "color") {
                    const val = (cursor.getElement() as HTMLInputElement).value;
                    const r = (Number(`0x${val.substring(1, 3)}`) * 100.0 / Number("0xff")).toFixed(0);
                    const g = (Number(`0x${val.substring(3, 5)}`) * 100.0 / Number("0xff")).toFixed(0);
                    const b = (Number(`0x${val.substring(5)}`) * 100.0 / Number("0xff")).toFixed(0);
                    return `${padNameAfter(cursor)}[clickable] [${r}% red ${g}% green ${b}% blue]`;
                }
                return null;
            },
            (cursor: SRCursor) => {
                if (cursor.isStartTag() && cursor.getElement()?.getAttribute("type") === "month") {
                    const val = (cursor.getElement() as HTMLInputElement).value;
                    let y = "0";
                    let m = "0";
                    if (val.trim().length > 0) {
                        let date = new Date(val);
                        y = "" + date.getFullYear();
                        m = "" + (date.getMonth() + 1);
                    }
                    return `${padNameAfter(cursor)}[clickable] [spin button, ${m}] [spin button, ${y}] [menu button] [subMenu] Show month picker`;
                }
                return null;
            },
            (cursor: SRCursor) => {
                if (cursor.isStartTag() && cursor.getElement()?.getAttribute("type") === "date") {
                    const val = (cursor.getElement() as HTMLInputElement).value;
                    let y = "0";
                    let m = "0";
                    let day = "0";
                    if (val.trim().length > 0) {
                        let date = new Date(val);
                        y = "" + date.getFullYear();
                        m = "" + (date.getMonth() + 1);
                        day = "" + (date.getDate());
                    }
                    return `${padNameAfter(cursor)}[clickable] [spin button, ${m}] / [spin button, ${day}] / [spin button, ${y}] [menu button] [subMenu] Show date picker`;
                }
                return null;
            },
            (cursor: SRCursor) => {
                if (cursor.isStartTag() && cursor.getElement()?.getAttribute("type") === "datetime-local") {
                    const val = (cursor.getElement() as HTMLInputElement).value; // 2025-09-12T04:20
                    let y = "0";
                    let m = "0";
                    let day = "0";
                    let hour = "0";
                    let min = "0";
                    let ampm = "0";
                    if (val.trim().length > 0) {
                        let date = new Date(val);
                        y = "" + date.getFullYear();
                        m = "" + (date.getMonth() + 1);
                        day = "" + (date.getDate());
                        if (date.getHours() === 0 || date.getHours() === 12) {
                            hour = "12";
                        } else if (date.getHours() < 12) {
                            hour = "" + date.getHours();
                        } else {
                            hour = "" + (date.getHours() - 12);
                        }
                        min = "" + date.getMinutes();
                        ampm = date.getHours() >= 12 ? "pm" : "am";
                    }
                    return `${padNameAfter(cursor)}[clickable] [spin button, ${m}] / [spin button, ${day}] / [spin button, ${y}] [spin button, ${hour}] : [spin button, ${min}] [spin button, ${ampm}]  [menu button] [subMenu] Show local date and time picker`;
                }
                return null;
            },
            (cursor: SRCursor) => {
                if (cursor.isStartTag() && cursor.getElement()?.getAttribute("type") === "time") {
                    const val = (cursor.getElement() as HTMLInputElement).value; // 2025-09-12T04:20
                    let hour = "0";
                    let min = "0";
                    let ampm = "0";
                    if (val.trim().length > 0) {
                        let date = val.split(":");
                        let hours = parseInt(date[0]);
                        if (hours === 0 || hours === 12) {
                            hour = "12";
                        } else if (hours < 12) {
                            hour = "" + hours;
                        } else {
                            hour = "" + (hours - 12);
                        }
                        min = date[1];
                        ampm = hours >= 12 ? "pm" : "am";
                    }
                    return `${padNameAfter(cursor)}[grouping clickable [spin button, ${hour}] : [spin button, ${min}] [spin button, ${ampm}] [menu button] [subMenu] Show time picker [out of grouping]`;
                }
                return null;
            },
            (cursor: SRCursor) => {
                if (cursor.isStartTag() && cursor.getElement()?.getAttribute("type") === "week") {
                    const val = (cursor.getElement() as HTMLInputElement).value; // 2025-W38
                    let year = "0";
                    let week = "0";
                    if (val.trim().length > 0) {
                        let date = val.split(/-W/);
                        year = date[0];
                        week = date[1];
                    }
                    return `${padNameAfter(cursor)}[clickable] [spin button, ${week}], [spin button, ${year}] [menu button] [subMenu] Show week picker`;
                }
                return null;
            },
            (cursor: SRCursor) => cursor.getElement()?.getAttribute("type") === "hidden" ? "" : null,
            (cursor: SRCursor) => (cursor.isStartTag() && `!!${padNameAfter(cursor)}[input!!]${cursor.getElement().outerHTML}`) || null
        ]
    }),

    new SRRendererRule({
        roles: [],
        elems: ["LI"],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                const elem = cursor.getElement();
                if (window.getComputedStyle(elem).listStyleType === "none") {
                    return cursor.isStartTag() ? `${(cursor.getNameInfo()?.name || "")}` : "";
                } else {
                    return cursor.isStartTag() ? `[bullet] ${(cursor.getNameInfo()?.name || "")}` : "";
                }
            }
        ]
    }),

    // MathML elements
    new SRRendererRule({
        roles: [],
        elems: ["MFRAC"],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => cursor.isStartTag() ? `[fraction]` : `[end fraction]`
        ]
    }),

    new SRRendererRule({
        roles: [],
        elems: ["MROW"],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                // Only announce over on the end tag
                if (cursor.isStartTag()) return undefined;
                let fraction = cursor.getCurrentOrParentByRoleClone([], ["mfrac"]);
                if (fraction && fraction.getElement().querySelectorAll("mrow")[0]?.isSameNode(cursor.getNode())) {
                    return "[over]";
                }
            }
        ]
    }),

    new SRRendererRule({
        roles: [],
        elems: ["MSQRT"],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => cursor.isStartTag() ? `[square root]` : `[end root]`
        ]
    }),

    new SRRendererRule({
        roles: [],
        elems: ["MSUP"],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.isEndTag()) return undefined;
                const mi = cursor.getElement().querySelector("mi")?.innerHTML || "";
                const mn = cursor.getElement().querySelector("mn")?.innerHTML || "";
                if (mn === "2") return `${mi} [squared]`;
                if (mn === "3") return `${mi} [cubed]`;
                return `${mi} [to the ${mn}]`;
            }
        ]
    }),

    // Multiple roles rules - placed at the bottom
    
    // Default mode rules - Container elements (multiple roles)
    new SRRendererRule({
        roles: ["article", "banner", "blockquote", "caption", "cell", "code", "columnheader",
            "complementary", "contentinfo", "figure", "form", "group", "list", "main",
            "mark", "navigation", "region", "row", "rowheader", "search", "table", "toolbar"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => ""
        ]
    }),

    // Default mode rules - Elements that screen readers typically ignore (multiple roles)
    new SRRendererRule({
        roles: ["paragraph", "rowgroup", "status", "strong", "subscript", "superscript",
            "term", "time", "none", "presentation"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => ""
        ]
    }),
]
