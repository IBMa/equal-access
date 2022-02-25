class HTMLBaseElement extends HTMLElement {
    constructor(...args) {
        const self = super(...args);
        self.parsed = false; // guard to make it easy to do certain stuff only once
        self.parentNodes = [];
        return self;
    }

    connectedCallback() {
        // collect the parentNodes
        let el = this;
        while (el.parentNode) {
            el = el.parentNode;
            this.parentNodes.push(el);
        }
        // check if the parser has already passed the end tag of the component
        // in which case this element, or one of its parents, should have a nextSibling
        // if not (no whitespace at all between tags and no nextElementSiblings either)
        // resort to DOMContentLoaded or load having triggered
        if ([this, ...this.parentNodes].some((el) => el.nextSibling) || document.readyState !== "loading") {
            this.childrenAvailableCallback();
            this.parsed = true;
        } else {
            this.mutationObserver = new MutationObserver(() => {
                if ([this, ...this.parentNodes].some((el) => el.nextSibling) || document.readyState !== "loading") {
                    this.childrenAvailableCallback();
                    this.parsed = true;
                    this.mutationObserver.disconnect();
                }
            });

            this.mutationObserver.observe(this, {
                childList: true,
            });
        }
    }
}

customElements.define(
    "mark-down",
    class extends HTMLBaseElement {
        childrenAvailableCallback() {
            let converted = marked.parse(this.innerHTML);
            this.innerHTML = converted
                .replace(/<(\/?)ul>/g, "<$1bx-unordered-list>")
                .replace(/<(\/?)li>/g, "<$1bx-list-item>")
                .replace(/<a href/g, "<a target='_blank' rel='noopener noreferrer' href")
                .replace(/<pre>[ \r\n]*<code>/g, "<code-snippet>")
                .replace(/<\/code>[ \r\n]*<\/pre>/g, "</code-snippet>");
        }
    }
);

customElements.define(
    "code-snippet",
    class extends HTMLBaseElement {
        childrenAvailableCallback() {
            let oldCode = this.innerHTML;
            this.innerHTML = "";
            // const shadowRoot = this.attachShadow({mode: 'open'});
            const shadowRoot = this;
            let snip = document.createElement("bx-code-snippet");
            snip.setAttribute("type", "multi");
            snip.setAttribute("color-scheme", "light");
            snip.innerHTML = oldCode.replace(/</g, "&lt;")
            shadowRoot.appendChild(snip);
        }
    }
);

const valueMap = {
    "VIOLATION": {
        "POTENTIAL": "Needs review",
        "FAIL": "Violation",
        "PASS": "Pass",
        "MANUAL": "Needs review"
    },
    "RECOMMENDATION": {
        "POTENTIAL": "Recommendation",
        "FAIL": "Recommendation",
        "PASS": "Pass",
        "MANUAL": "Recommendation"
    }
};

window.addEventListener("load", (evt) => {
    const searchParams = new URLSearchParams(window.location.search);
    let ruleInfo = JSON.parse(decodeURIComponent(searchParams.get("issue")));
    document.querySelector("#groupLabel").innerHTML = RULE_MESSAGES["en-US"].group;
    if (ruleInfo) {
        if (ruleInfo.message) {
            document.querySelector("#ruleMessage").innerHTML = ruleInfo.message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        }
        if (ruleInfo.snippet) {
            let snip = ruleInfo.snippet;
            snip = snip.replace(/( [a-zA-Z-]+="[^"]*")/g, "\n   $1");
            let snipElem = document.createElement("code-snippet");
            for (let line of snip.split("\n")) {
                snipElem.appendChild(document.createTextNode(line+"\n"));
            }
            let locSnippet = document.querySelector("#locSnippet");
            locSnippet.innerHTML = `<h3>Element location</h3>`;
            locSnippet.appendChild(snipElem);
        }
        if (ruleInfo.value) {
            let value = ruleInfo.value;
            const val = valueMap[value[0]][value[1]];
            let icon = "";
            if (val === "Violation") icon = `<img src="../assets/Violation16.svg" alt="" />`;
            if (val === "Needs review") icon = `<img src="../assets/NeedsReview16.svg" alt="" />`;
            if (val === "Recommendation") icon = `<img src="../assets/Recommendation16.svg" alt="" />`;
            document.querySelector("#locLevel").innerHTML = `<div class="issueLevel">${icon}&nbsp;${val}</div>`;
        }
        if (RULE_ID) {
            document.querySelector("#ruleInfo").innerHTML = `<p>Rule ID: ${RULE_ID}${ruleInfo.reasonId ? `<br />Reason ID: ${ruleInfo.reasonId}</p>` : ""}`;
        }
    }
})

