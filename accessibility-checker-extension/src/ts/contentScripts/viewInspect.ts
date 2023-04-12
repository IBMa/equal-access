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

import { getDevtoolsController } from "../devtools/devtoolsController";
import { Bounds, IIssue } from "../interfaces/interfaces";
import DomPathUtils from "./DomPathUtils";
import { ElementUtils } from "./ElementUtils";


function getOverlay() : HTMLDivElement {
    if (!(window as any).aceOverlay) {
        (window as any).aceOverlay = document.createElement("div");
        (window as any).aceOverlay.style.display = "none";
    }
    return (window as any).aceOverlay;
}

function updateOverlay(_issue: IIssue, _elem: HTMLElement, bounds: Bounds) : HTMLElement {
    let overlay = getOverlay();
    overlay.style.position = "absolute";
    overlay.style.top = `${bounds.top+bounds.height}px`;
    overlay.style.left = `${bounds.left}px`;
    overlay.innerHTML = "Hello world";
    return overlay;
}

function showOverlay(issue: IIssue) {
    let elem = DomPathUtils.domPathToElem(issue.path.dom);
    if (elem) {
        let bounds = ElementUtils.getBounds(elem, false);
        if (bounds) {
            let overlay = updateOverlay(issue, elem, bounds);
            if (!overlay.parentNode) {
                document.body.insertBefore(overlay, document.body.firstChild);
            }
            overlay.style.display = "block"
        }    
    }
}

(async () => {
    // let tabId = await getBGController().getTabId();
    getDevtoolsController().addSelectedIssueListener(async (issue: IIssue) => {
        if (issue) {
            showOverlay(issue);
        }
    });
    // chrome.runtime.onMessage.addListener((msg: any) => {
    //     if (msg.type === "DT_onSelectedIssue" && msg.dest.tabId === tabId) {
    //         let issue: IIssue = msg.content;
    //     }
    // });
})();
