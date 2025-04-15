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
            if (this.childrenAvailableCallback) 
                this.childrenAvailableCallback();
            this.parsed = true;
        } else {
            this.mutationObserver = new MutationObserver(() => {
                if ([this, ...this.parentNodes].some((el) => el.nextSibling) || document.readyState !== "loading") {
                    if (this.childrenAvailableCallback) 
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

function formatHTML(html) {
    let tabLevel = 0;
    const tabSize = 4;
    const result = [];
  
    html.split(">").forEach(element => {
      if (element) {
        if (element.startsWith("</")) {
          tabLevel--;
          result.push(`${" ".repeat(tabLevel * tabSize)}${element}>`);
        } else if (element.startsWith("<")) {
          result.push(`${" ".repeat(tabLevel * tabSize)}${element}>`);
          if (!element.endsWith("/>")) {
            tabLevel++;
          }
        } else {
          result.push(`${" ".repeat(tabLevel * tabSize)}${element}>`);
        }
      }
    });
    return result.join("\n");
}

function prettyPrintReactCode(singleLineCode) {
    // Add spaces and line breaks for readability
    let formattedCode = singleLineCode
      .replace(/({|})/g, '\n$1\n') // Add newlines around curly braces
      .replace(/</g, '\n<') // Add newline before each JSX element
      .replace(/>/g, '>\n') // Add newline after each JSX element
      .replace(/\n+/g, '\n') // Remove extra newlines
      .trim(); // Remove leading/trailing spaces
    
    // Adjust indentation level
    let indentLevel = 0;
    formattedCode = formattedCode.split('\n').map(line => {
      if (line.includes('}')) indentLevel--; // Decrease indentation for closing braces
      const indentedLine = '  '.repeat(indentLevel) + line; // Apply indentation
      if (line.includes('{') && !line.includes('}')) indentLevel++; // Increase indentation for opening braces
      return indentedLine;
    }).join('\n');
    
    return formattedCode;
  }

function formatString(text, limit) {
    const words = text.split(' ');
    let currentLine = '';
    let formattedText = '';
  
    for (const word of words) {
      if (currentLine.length + word.length + 1 <= limit) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        formattedText += currentLine + '\n';
        currentLine = word;
      }
    }
    formattedText += currentLine;
    return formattedText;
}

function formatAsBullets(text) {
    const sentences = text.split('\n');
    let output = '<ul>';
  
    for (const sentence of sentences) {
      if (sentence.startsWith('- ')) {
        output += `<li>${sentence.substring(2)}</li>`;
      } else if (sentence.trim() !== ''){
          output += sentence;
      }
    }
  
    output += '</ul>';
    return output;
  }
  

function isDarkMode() {
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
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
    }
);

customElements.define(
    "code-snippet",
    class extends HTMLBaseElement {
        childrenAvailableCallback() {
            console.log("Func childrenAvailableCallback");
            let oldCode = this.innerHTML;
            this.innerHTML = "";
            // const shadowRoot = this.attachShadow({mode: 'open'});
            const shadowRoot = this;

            // create <code-snippet>
            const codeSnippet = this;
            console.log("codeSnippet = ", codeSnippet);

            // create <cds-code-snippet>
            let snip = document.createElement("cds-code-snippet");
            snip.setAttribute("type", "multi");
            console.log("snip = ", snip);
            
            snip.innerHTML = oldCode.replace(/</g, "&lt;");
            console.log("snip.innerHTML = ", snip.innerHTML);
            codeSnippet.appendChild(snip);
            console.log("codeSnippet after append snip = ", codeSnippet);
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
/*
 * updateWithRuleInfo controls the info to be injected into the help file
 * We have 3 cases
 * 1. Original case which injects semi static help into the help file
 * 2. AI case where the AI data is not ready to inject so use skeleton code-snippet
 * 3. AI case where the AI data is ready to inject so use regular code-snippet
 */
function updateWithRuleInfo(ruleInfo) {
    console.log("***** Func updateWithRuleInfo *****"); // used for rule and code injection
    console.log("ruleInfo = \n", ruleInfo);
    // split ruleInfo (later rename to helpInfo) into ruleInfo (param1) and aiInfo (param2)
   
    let ruleInfoTemp = ruleInfo?.substring(0, ruleInfo.indexOf('&'));
    console.log("ruleInfoTemp = \n", ruleInfoTemp);
    ruleInfoTemp = JSON.parse(decodeURIComponent(ruleInfoTemp));
    console.log("ruleInfoTemp = \n", ruleInfoTemp);
    console.log("ruleInfoTemp.message = ", ruleInfoTemp.message);
    
    let aiInfo = ruleInfo?.substring(ruleInfo.indexOf('&') + 1);
    console.log("aiInfo = \n", aiInfo);
    console.log("typeof aiInfo = ", typeof aiInfo);
    aiInfo = JSON.parse(aiInfo);
    if (aiInfo.inaccessible_dom) {
        
    } else {
        aiInfo = JSON.parse(aiInfo);
    }
    console.log("aiInfo = \n", aiInfo);
    console.log("typeof aiInfo = ", typeof aiInfo);
    console.log("aiInfo.inaccessible_dom = ", aiInfo.inaccessible_dom);
    
    if (ruleInfoTemp) {
        if (ruleInfoTemp.message) {
            let ruleMessage = ruleInfoTemp.message.replace(/\{(\d+)\}/g, (matchedStr, matchedNum, matchedIndex) => ruleInfoTemp.msgArgs[matchedNum]);
            document.querySelector("#ruleMessage").innerHTML = ruleMessage.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        }
        // NOT used in AI version
        // setTimeout(() => {
        //     if (ruleInfo.snippet) {
        //         console.log("JOHO Element location");
        //         let snip = ruleInfo.snippet;
        //         snip = snip.replace(/( [a-zA-Z-]+="[^"]*")/g, "\n   $1");
        //         let snipElem = document.createElement("code-snippet");
        //         for (let line of snip.split("\n")) {
        //             snipElem.appendChild(document.createTextNode(line+"\n"));
        //         }
        //         let locSnippet = document.querySelector("#locSnippet");
        //         locSnippet.innerHTML = `<h3>Element location</h3>`;
        //         locSnippet.appendChild(snipElem);
        //     }
        // }, 0);
        setTimeout(() => {
            // let inA11yDOMCode = "<svg viewBox='0 0 600 400' width='0' height='0' xmlns:xlink='http://www.w3.org/1999/xlink'><defs><filter id='protanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='deuteranopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='tritanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter></defs></svg>";
            if (aiInfo.inaccessible_dom) {
                console.log("JOHO aiInfo.inaccessible_dom = \n", aiInfo.inaccessible_dom);
                let formattedHTML = "";
                let codeSnippet = HTMLElement;
                let locSnippet = document.querySelector("#inA11yDOMCode");
                if (aiInfo.inaccessible_dom === "We are waiting on AI server.") {
                    // formattedHTML = aiInfo.inaccessible_dom;
                    codeSnippet = document.createElement("cds-code-snippet-skeleton");
                    codeSnippet.setAttribute("type", "multi");
                } else {
                    formattedHTML = formatHTML(aiInfo.inaccessible_dom);
                    codeSnippet = document.createElement("cds-code-snippet");
                    codeSnippet.setAttribute("type", "multi");
                    for (let line of formattedHTML.split("\n")) {
                        codeSnippet.appendChild(document.createTextNode(line+"\n"));
                    }
                    console.log("codeSnippet after content added = ", codeSnippet);
                }
                locSnippet.innerHTML = `<h3>Detected Inaccessibile HTML DOM code</h3>`;
                locSnippet.appendChild(codeSnippet);
            }
        }, 0);
        setTimeout(() => {
            // let a11yDOMCode = "<svg viewBox='0 0 600 400' width='0' height='0' xmlns:xlink='http://www.w3.org/1999/xlink' aria-label='Color Filters' role='img'><defs><filter id='protanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='deuteranopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='tritanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter></defs></svg>";
            if (aiInfo.accessible_dom) {
                console.log("JOHO Accessible code detected");
                let formattedHTML = "";
                let codeSnippet = HTMLElement;
                if (aiInfo.accessible_dom === "We are waiting on AI server.") {
                    // formattedHTML = aiInfo.inaccessible_dom;
                    codeSnippet = document.createElement("cds-code-snippet-skeleton");
                    codeSnippet.setAttribute("type", "multi");
                } else {
                    formattedHTML = formatHTML(aiInfo.accessible_dom);
                    codeSnippet = document.createElement("cds-code-snippet");
                    codeSnippet.setAttribute("type", "multi");
                    for (let line of formattedHTML.split("\n")) {
                        codeSnippet.appendChild(document.createTextNode(line+"\n"));
                    }
                    console.log("codeSnippet after content added = ", codeSnippet);
                    aiElem = document.createElement("cds-ai-label");
                    aiElem.setAttribute("size","small");
                    aiElem.setAttribute("style", "justify-content: flex-end !important; margin-right: 16px !important;");
                }
                let locSnippet = document.querySelector("#a11yDOMCode");
                locSnippet.innerHTML = `<h3>Accessibile HTML DOM code</h3>`;
                if (aiInfo.accessible_source !== "We are waiting on AI server.") {
                    locSnippet.appendChild(aiElem);
                }
                locSnippet.appendChild(codeSnippet);
            }
        }, 0);
        setTimeout(() => {
            let sourceCode = 
            // `import React from 'react';\n  function AccessibleSVG() {\n    return (\n      <svg viewBox=\"0 0 600 400\" width=\"0\" height=\"0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" aria-hidden=\"true\">\n        <defs>\n          <filter id=\"protanopia\">\n            <feColorMatrix in=\"SourceGraphic\" type=\"matrix\" values=\"0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0\"></feColorMatrix>\n          </filter>\n          <filter id=\"deuteranopia\">\n            <feColorMatrix in=\"SourceGraphic\" type=\"matrix\" values=\"0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0\"></feColorMatrix>\n          </filter>\n          <filter id=\"tritanopia\">\n            <feColorMatrix in=\"SourceGraphic\" type=\"matrix\" values=\"0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0\"></feColorMatrix>\n          </filter>\n        </defs>\n      </svg>\n    );\n  }\n  export default AccessibleSVG`;
            "import React from 'react'; const ColorFilters = () => { return ( <svg viewBox='0 0 600 400' width='0' height='0' xmlns:xlink='http://www.w3.org/1999/xlink' aria-label='Color Filters' role='img'><defs><filter id='protanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='deuteranopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='tritanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter></defs></svg> ); }; export default ColorFilters;"
           
            if (aiInfo.accessible_source) {
                console.log("JOHO Source code detected");
                let formattedReact = "";
                let formattedReactjsCode = "";
                let codeSnippet = HTMLElement;
                let aiElem = HTMLElement;
                if (aiInfo.accessible_source === "We are waiting on AI server.") {
                    // formattedReact = aiInfo.accessible_source;
                    codeSnippet = document.createElement("cds-code-snippet-skeleton");
                    codeSnippet.setAttribute("type", "multi");
                } else {
                    formattedReact = aiInfo.accessible_source;
                    formattedReact = prettyPrintReactCode(aiInfo.accessible_source);
                    console.log("formattedReact = \n",formattedReact);
                    if (formattedReactjsCode) {
                        // formattedReactjsCode = prettier.format(aiInfo.accessible_source,
                        //     {parser: "babel", // Use 'babel' parser for React JSX
                        //         plugins: [pluginBabel, pluginEstree, pluginHtml], // Add the Babel plugin
                        //         printWidth: 80, // Adjust as needed
                        //         tabWidth: 2,
                        //         useTabs: false,
                        //         semi: true,
                        //         singleQuote: false,
                        //         trailingComma: "all",
                        //         bracketSpacing: true,
                        //         jsxBracketSameLine: false,
                        //         arrowParens: "always",
                        // });
                    }
                    
                    codeSnippet = document.createElement("cds-code-snippet");
                    codeSnippet.setAttribute("type", "multi");
                    for (let line of formattedReact.split("\n")) {
                        codeSnippet.appendChild(document.createTextNode(line+"\n"));
                    }
                    console.log("codeSnippet after content added = ", codeSnippet);
                    aiElem = document.createElement("cds-ai-label");
                    aiElem.setAttribute("size","small");
                    aiElem.setAttribute("style", "justify-content: flex-end !important; margin-right: 16px !important;");
                }
            
                let locSnippet = document.querySelector("#sourceCode");
                locSnippet.innerHTML = `<h3>(Reactjs) source code that generates A11y DOM code</h3>`;
                if (aiInfo.accessible_source !== "We are waiting on AI server.") {
                    locSnippet.appendChild(aiElem);
                }
                locSnippet.appendChild(codeSnippet);
            }
        }, 0);
        setTimeout(() => {
            // let summary = "The original SVG element was inaccessible because it lacked an accessible name. To fix this, an aria-label attribute was added to provide a meaningful label, and a role attribute was added to indicate that the SVG is an image. This allows screen readers to provide a description of the SVG to users with visual impairments.";
            if (aiInfo.change_summary) {
                console.log("JOHO summary detected");
                let codeSnippet = HTMLElement;
                let aiElem = HTMLElement;
                if (aiInfo.change_summary === "We are waiting on AI server.") {
                    codeSnippet = document.createElement("cds-code-snippet-skeleton");
                    codeSnippet.setAttribute("type", "multi");
                } else {
                    const characterLimit = 75;
                    const formattedString = formatString(aiInfo.change_summary, characterLimit);
                    console.log("summary   formattedString = \n", formattedString);

                    codeSnippet = document.createElement("cds-code-snippet");
                    codeSnippet.setAttribute("type", "multi");
                    codeSnippet.appendChild(document.createTextNode(formattedString));

                    aiElem = document.createElement("cds-ai-label");
                    aiElem.setAttribute("size","small");
                    aiElem.setAttribute("style", "justify-content: flex-end !important; margin-right: 16px !important;");
                }
                let locSnippet = document.querySelector("#summary");
                locSnippet.innerHTML = `<h3>Summary</h3>`;
                if (aiInfo.change_summary !== "We are waiting on AI server.") {
                    locSnippet.appendChild(aiElem);
                }
                locSnippet.appendChild(codeSnippet);
            }
        }, 0);
        if (ruleInfoTemp.value) {
            let value = ruleInfoTemp.value;
            const val = valueMap[value[0]][value[1]];
            let icon = "";
            if (val === "Violation") icon = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
width="16px" height="16px" viewBox="0 0 16 16" style="enable-background:new 0 0 16 16;" xml:space="preserve" aria-hidden="true">
<style type="text/css">
	.st0{fill:none;}
	.st1{fill:#da1e28;}
	.st2{fill:#FFFFFF;fill-opacity:1;}
</style>
<rect id="_Transparent_Rectangle_" class="st0" width="16" height="16"/>
<path class="st1" d="M8,1C4.1,1,1,4.1,1,8s3.1,7,7,7s7-3.1,7-7S11.9,1,8,1z M10.7,11.5L4.5,5.3l0.8-0.8l6.2,6.2L10.7,11.5z"/>
<path id="inner-path" class="st2" d="M10.7,11.5L4.5,5.3l0.8-0.8l6.2,6.2L10.7,11.5z"/>
</svg>`;
            if (val === "Needs review") icon = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
width="16px" height="16px" viewBox="0 0 16 16" style="enable-background:new 0 0 16 16;" xml:space="preserve" aria-hidden="true">
<style type="text/css">
	.st0{fill:none;}
	.st1{fill:#F1C21B;}
</style>
<rect id="_Transparent_Rectangle_" class="st0" width="16" height="16"/>
<path class="st1" d="M14.9,13.3l-6.5-12C8.3,1,8,0.9,7.8,1.1c-0.1,0-0.2,0.1-0.2,0.2l-6.5,12c-0.1,0.1-0.1,0.3,0,0.5
	C1.2,13.9,1.3,14,1.5,14h13c0.2,0,0.3-0.1,0.4-0.2C15,13.6,15,13.4,14.9,13.3z M7.4,4h1.1v5H7.4V4z M8,11.8c-0.4,0-0.8-0.4-0.8-0.8
	s0.4-0.8,0.8-0.8c0.4,0,0.8,0.4,0.8,0.8S8.4,11.8,8,11.8z"/>
<g>
	<g>
		<g>
			<rect x="7.45" y="4" width="1.1" height="5"/>
		</g>
	</g>
	<g>
		<g>
			<circle cx="8" cy="11" r="0.8"/>
		</g>
	</g>
</g>
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
            let level = document.querySelector("#locLevel");
            let parent = level.parentElement;
            level = parent.removeChild(level);
            parent.insertBefore(level, parent.firstElementChild);
            document.querySelector("#locLevel").innerHTML = `<div class="issueLevel">${val}</div>`;
        }
        if (RULE_ID) {
            document.querySelector("#ruleInfo").innerHTML = `<p>Rule ID: ${RULE_ID}${ruleInfoTemp.reasonId ? `<br />Reason ID: ${ruleInfoTemp.reasonId}</p>` : ""}`;
        }

    }
}

if ("onhashchange" in window) {// does the browser support the hashchange event?
    window.onhashchange = function () {
        console.log("onhashchange event");
        let ruleInfo = JSON.parse(decodeURIComponent(window.location.hash.substring(1)));
        updateWithRuleInfo(ruleInfo);
    }
}

window.addEventListener("DOMContentLoaded", (evt) => {
    console.log("***** event listener DOMContentLoaded *****");
    let groupMsg = typeof RULE_MESSAGES !== "undefined" && (RULE_MESSAGES["en-US"].group || RULE_MESSAGES["en-US"][0]) || "";
    groupMsg = groupMsg.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    document.querySelector("#groupLabel").innerHTML = groupMsg;
    let ruleInfo;
    if (window.location.search && window.location.search.length > 0) {
        console.log("JOHO window.location.href = \n", window.location.href);
        const searchParams = new URLSearchParams(window.location.search);
        console.log("searchParams = \n", searchParams);
        ruleInfo = JSON.parse(decodeURIComponent(searchParams.get("issue")));
        console.log("ruleInfo = \n",ruleInfo);
    } else if (window.location.hash && window.location.hash.length > 0) {
        // hash url with compressed parameters comes back here
        console.log("JOHO window.location.href 2 = \n", window.location.href);
        console.log("JOHO window.location.hash 2 = \n", window.location.hash);
        // need to decompress params
        const help1ParamsCompressed = window.location.hash?.substring(window.location.hash.indexOf('#')+1);
        // help1ParamsCompressed = window.location.hash;
        console.log("help1ParamsCompressed = \n", help1ParamsCompressed);
        console.log("Count compressed JOHO = ", help1ParamsCompressed.length);
        const recoveredOrigHelp1Params = LZString.decompressFromEncodedURIComponent(help1ParamsCompressed);
        console.log("recoveredOrigHelp1Params = \n", recoveredOrigHelp1Params);
        console.log("Count uncompressed = ", recoveredOrigHelp1Params.length);
        let help1param1 = recoveredOrigHelp1Params?.substring(0, recoveredOrigHelp1Params.indexOf('&'));
        console.log("help1param1 = \n", help1param1);
        let help1param2 = recoveredOrigHelp1Params?.substring(recoveredOrigHelp1Params.indexOf('&')+1);
        console.log("help1param2 = \n", help1param2);
        help1param2 = JSON.parse(help1param2);
        console.log("help1param2 = \n", help1param2);
        ruleInfo = help1param1 + '&' + help1param2;

        // ruleInfo = recoveredOrigHelp1Params;
        console.log("ruleInfo = \n",ruleInfo);
    }
    updateWithRuleInfo(ruleInfo);

    if (isDarkMode()) {
        document.body.setAttribute("class", "dds-theme-zone-g90");
    } else {
        document.body.setAttribute("class", "dds-theme-zone-g10");
    }

})

