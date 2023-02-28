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


export default class XpathUtils {
    public static convertXpathsToHtmlElements(xpaths: any) {
        // console.log("Function: convertXpathsToHtmlElements: ")
        let results: any = [];
        xpaths.map((xpath: any) => {
            // console.log("xpath ",index);
            let element;
            // console.log("xpath = ",xpath);
            element = this.selectPath(xpath);
            results.push(element);
        });
        return results;
    }
    
    public static getNodesXpaths(nodes: any) {
        // console.log("Inside getNodesXpaths");
        let tabXpaths: any = [];
        nodes.map((result: any) => {
            if (result != null) {
                // console.log("result.path.dom = "+result.path.dom);
                tabXpaths.push(result.path.dom);
            }
        });
        return tabXpaths;
    }

    private static lookup(doc: any, xpath:string) {
        if (doc.nodeType === 11) { // document fragment 
            let selector = ":host" + xpath.replace(/\//g, " > ").replace(/\[(\d+)\]/g, ":nth-of-type($1)"); // fixed from original
            let element = doc.querySelector(selector);
            return element;
        } else { // regular doc type = 9
            let nodes = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
            let element = nodes.iterateNext();
            if (element) {
                return element;
            } else {
                return null;
            }
        }
    }

    // @ts-ignore
    public static selectPath(srcPath: any) {
        let doc = document;
        let element = null;
        while (srcPath && (srcPath.includes("iframe") || srcPath.includes("#document-fragment"))) {
            if (srcPath.includes("iframe")) {
                let parts = srcPath.match(/(.*?iframe\[\d+\])(.*)/);
                let iframe = this.lookup(doc, parts[1]);
                element = iframe || element;
                if (iframe && iframe.contentDocument) {
                    doc = iframe.contentDocument;
                    srcPath = parts[2];
                } else {
                    srcPath = null;
                }
            } else if (srcPath.includes("#document-fragment")) {
                let parts = srcPath.match(/(.*?)\/#document-fragment\[\d+\](.*)/);
                let fragment = this.lookup(doc, parts[1]); // get fragment which is in main document
                element = fragment || element;
                if (fragment && fragment.shadowRoot) {
                    doc = fragment.shadowRoot;
                    srcPath = parts[2];
                } else {
                    srcPath = null;
                }
            } else {
                srcPath = null;
            }
        }
        if (srcPath) {
            element = this.lookup(doc, srcPath) || element;
        }
        return element;
    }

    public static getXPathForElement(element: any) {
        const idx: any = (sib: any, name: any) => sib ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName == name) : 1;
        const segs: any = (elm: any) => (!elm || elm.nodeType !== 1) ? [''] : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${idx(elm)}]`];
        return segs(element).join('/');
    }
}
