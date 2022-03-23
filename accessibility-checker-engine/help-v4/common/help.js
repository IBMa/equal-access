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
        constructor() {
            super();
            setTimeout(() => {
                let converted = marked.parse(this.textContent);
                this.innerHTML = converted
                    .replace(/<(\/?)ul>/g, "<$1bx-unordered-list>")
                    .replace(/<(\/?)li>/g, "<$1bx-list-item>")
                    .replace(/<a href/g, "<a target='_blank' rel='noopener noreferrer' href")
                    .replace(/<pre>[ \r\n]*<code>/g, "<code-snippet>")
                    .replace(/<\/code>[ \r\n]*<\/pre>/g, "</code-snippet>");
                }, 0)
        }
        // childrenAvailableCallback() {
            // let converted = marked.parse(this.innerHTML);
            // this.innerHTML = converted
            //     .replace(/<(\/?)ul>/g, "<$1bx-unordered-list>")
            //     .replace(/<(\/?)li>/g, "<$1bx-list-item>")
            //     .replace(/<a href/g, "<a target='_blank' rel='noopener noreferrer' href")
            //     .replace(/<pre>[ \r\n]*<code>/g, "<code-snippet>")
            //     .replace(/<\/code>[ \r\n]*<\/pre>/g, "</code-snippet>");
        // }
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

function updateWithRuleInfo(ruleInfo) {
    if (ruleInfo) {
        if (ruleInfo.message) {
            let ruleMessage = ruleInfo.message.replace(/\{(\d+)\}/g, (matchedStr, matchedNum, matchedIndex) => ruleInfo.msgArgs[matchedNum]);
            document.querySelector("#ruleMessage").innerHTML = ruleMessage.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        }
        setTimeout(() => {
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
        }, 0);
        if (ruleInfo.value) {
            let value = ruleInfo.value;
            const val = valueMap[value[0]][value[1]];
            let icon = "";
            if (val === "Violation") icon = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
width="16px" height="16px" viewBox="0 0 16 16" style="enable-background:new 0 0 16 16;" xml:space="preserve" aria-hidden="true">
<style type="text/css">
.st0{fill:none;}
.st1{fill:#A2191F;}
.st2{fill:#FFFFFF;fill-opacity:0;}
</style>
<rect class="st0" width="16" height="16"/>
<path class="st1" d="M8,1C4.1,1,1,4.1,1,8s3.1,7,7,7s7-3.1,7-7S11.9,1,8,1z M10.7,11.5L4.5,5.3l0.8-0.8l6.2,6.2L10.7,11.5z"/>
<path class="st2" d="M10.7,11.5L4.5,5.3l0.8-0.8l6.2,6.2L10.7,11.5z"/>
</svg>`;
            if (val === "Needs review") icon = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
width="16px" height="16px" viewBox="0 0 16 16" style="enable-background:new 0 0 16 16;" xml:space="preserve" aria-hidden="true">
<style type="text/css">
.st0{fill:none;}
.st1{fill:#F1C21B;}
</style>
<rect class="st0" width="16" height="16"/>
<path class="st1" d="M14.9,13.3l-6.5-12C8.3,1,8,0.9,7.8,1.1c-0.1,0-0.2,0.1-0.2,0.2l-6.5,12c-0.1,0.1-0.1,0.3,0,0.5
C1.2,13.9,1.3,14,1.5,14h13c0.2,0,0.3-0.1,0.4-0.2C15,13.6,15,13.4,14.9,13.3z M7.4,4h1.1v5H7.4V4z M8,11.8c-0.4,0-0.8-0.4-0.8-0.8
s0.4-0.8,0.8-0.8c0.4,0,0.8,0.4,0.8,0.8S8.4,11.8,8,11.8z"/>
<g><g><g>
<rect x="7.45" y="4" width="1.1" height="5"/>
</g></g><g><g>
<circle cx="8" cy="11" r="0.8"/>
</g></g></g>
</svg>`;
            if (val === "Recommendation") icon = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
width="16px" height="16px" viewBox="0 0 16 16" style="enable-background:new 0 0 16 16;" xml:space="preserve" aria-hidden="true">
<style type="text/css">
.st0{fill:none;}
.st1{fill:#0043CE;}
.st2{fill:#FFFFFF;}
.st3{font-family:'IBMPlexSerif';}
.st4{font-size:12.9996px;}
</style>
<rect class="st0" width="16" height="16"/>
<path class="st1" d="M14,15H2c-0.6,0-1-0.4-1-1V2c0-0.6,0.4-1,1-1h12c0.6,0,1,0.4,1,1v12C15,14.6,14.6,15,14,15z"/>
<text transform="matrix(1 0 0 1 5.9528 12.5044)" class="st2 st3 st4">i</text>
</svg>`;
            document.querySelector("#locLevel").innerHTML = `<div class="issueLevel">${icon}&nbsp;${val}</div>`;
        }
        if (RULE_ID) {
            document.querySelector("#ruleInfo").innerHTML = `<p>Rule ID: ${RULE_ID}${ruleInfo.reasonId ? `<br />Reason ID: ${ruleInfo.reasonId}</p>` : ""}`;
        }
    }
}

if ("onhashchange" in window) {// does the browser support the hashchange event?
    window.onhashchange = function () {
        let ruleInfo = JSON.parse(decodeURIComponent(window.location.hash.substring(1)));
        updateWithRuleInfo(ruleInfo);
    }
}

window.addEventListener("DOMContentLoaded", (evt) => {
    let groupMsg = typeof RULE_MESSAGES !== "undefined" && (RULE_MESSAGES["en-US"].group || RULE_MESSAGES["en-US"][0]) || "";
    groupMsg = groupMsg.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    document.querySelector("#groupLabel").innerHTML = groupMsg;
    let ruleInfo;
    if (window.location.search && window.location.search.length > 0) {
        const searchParams = new URLSearchParams(window.location.search);
        ruleInfo = JSON.parse(decodeURIComponent(searchParams.get("issue")));
    } else if (window.location.hash && window.location.hash.length > 0) {
        ruleInfo = JSON.parse(decodeURIComponent(window.location.hash.substring(1)));
    }
    updateWithRuleInfo(ruleInfo);
})

