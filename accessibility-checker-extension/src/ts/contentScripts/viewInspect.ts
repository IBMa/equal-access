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

import { getBGController } from "../background/backgroundController";
import { getDevtoolsController } from "../devtools/devtoolsController";
import { Bounds, IIssue } from "../interfaces/interfaces";
import DomPathUtils from "./DomPathUtils";
import { ElementUtils } from "./ElementUtils";

type Overlays = { elem: HTMLDivElement, info: HTMLDivElement };

(async () => {
    let myTabId = await getBGController().getTabId()!;
    let devtoolsController = getDevtoolsController(true, "remote", myTabId);

    function getOverlays() : Overlays {
        if (!(window as any).aceOverlays) {
            let overlays = (window as any).aceOverlays = {
                elem: document.createElement("div"),
                info: document.createElement("div")
            }
            let ovElemStyle = overlays.elem.style;
            ovElemStyle.display = "none";
            ovElemStyle.outline = "solid #8A3FFC 3px";
            ovElemStyle.position = "absolute";
            ovElemStyle.zIndex = "2147483647";
            // ovElemStyle.backgroundColor = "rgba(246, 242, 255, .5)"
            let ovInfoStyle = overlays.info.style;
            ovInfoStyle.display = "none";
            ovInfoStyle.outline = "dashed #8A3FFC 2px";
            ovInfoStyle.backgroundColor = "#F6F2FF";
            ovInfoStyle.position = "absolute";
            ovInfoStyle.padding = "8px";
            ovInfoStyle.zIndex = "2147483647";
            ovInfoStyle.fontFamily = "'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, '.SFNSText-Regular', sans-serif";
        }
        return (window as any).aceOverlays;
    }
    
    async function updateOverlay(issue: IIssue, _elem: HTMLElement, bounds: Bounds) : Promise<Overlays> {
        let overlays = getOverlays();
        overlays.elem.style.top = `${bounds.top}px`;
        overlays.elem.style.left = `${bounds.left}px`;
        overlays.elem.style.width = `${bounds.width}px`;
        overlays.elem.style.height = `${bounds.height}px`;
        overlays.info.style.top = `${bounds.top+bounds.height}px`;
        overlays.info.style.left = `${bounds.left}px`;
        if (await devtoolsController.getActivePanel() === "main") {
            overlays.info.innerHTML = (
`
    <div>Issue info here</div>
    <div style="margin-top: 8px" />
    <div><a role="link" title="Inspect"><svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="16" height="16" viewBox="0 0 32 32" aria-hidden="true"><path d="M21.4479,20A10.856,10.856,0,0,0,24,13,11,11,0,1,0,13,24a10.856,10.856,0,0,0,7-2.5521L27.5859,29,29,27.5859ZM13,22a9,9,0,1,1,9-9A9.01,9.01,0,0,1,13,22Z"></path><path d="M10 12H8V10a2.0023 2.0023 0 012-2h2v2H10zM18 12H16V10H14V8h2a2.0023 2.0023 0 012 2zM12 18H10a2.0023 2.0023 0 01-2-2V14h2v2h2zM16 18H14V16h2V14h2v2A2.0023 2.0023 0 0116 18z"></path><title>Inspect</title></svg></a></div>
`);
        } else {
            overlays.info.innerHTML = (
`
    <div>Issue info here</div>
`);
        }
        overlays.info.querySelector("a")?.addEventListener("click", async () => {
            await devtoolsController.inspectPath(issue.path.dom);
            await devtoolsController.inspectPath(issue.path.dom);
        })
        return overlays;
    }
    
    async function showOverlay(issue: IIssue) {
        let elem = DomPathUtils.domPathToElem(issue.path.dom);
        if (elem) {
            let bounds = ElementUtils.getBounds(elem, false);
            if (bounds) {
                let overlay = await updateOverlay(issue, elem, bounds);
                if (!overlay.elem.parentNode) {
                    document.body.appendChild(overlay.elem);
                }
                if (!overlay.info.parentNode) {
                    document.body.appendChild(overlay.info);
                }
                overlay.elem.style.display = "block";
                overlay.info.style.display = "block";
                if (await devtoolsController.getActivePanel() === "main") {
                    overlay.elem.scrollIntoView({
                        // @ts-ignore
                        block: 'nearest',
                        behavior: "instant" as any,
                        inline: 'start'
                    });
                    setTimeout(() => {
                        overlay.info.scrollIntoView({
                            // @ts-ignore
                            block: 'nearest',
                            behavior: "instant" as any,
                            inline: 'start'
                        });    
                    }, 0);
                }
            }    
        }
    }

    devtoolsController.addSelectedIssueListener(async (issue: IIssue) => {
        if (false && issue) {
            showOverlay(issue);
        }
    });
    // chrome.runtime.onMessage.addListener((msg: any) => {
    //     if (msg.type === "DT_onSelectedIssue" && msg.dest.tabId === tabId) {
    //         let issue: IIssue = msg.content;
    //     }
    // });
})();
