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
            ovElemStyle.pointerEvents = "none";


            let ovInfoStyle = overlays.info.style;
            ovInfoStyle.display = "none";
            ovInfoStyle.outline = "solid #8A3FFC 2px";
            ovInfoStyle.backgroundColor = "#161616";
            ovInfoStyle.position = "absolute";
            ovInfoStyle.padding = "8px";
            ovInfoStyle.zIndex = "2147483647";
            ovInfoStyle.pointerEvents = "none";
            ovInfoStyle.fontFamily = "'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, '.SFNSText-Regular', sans-serif";
        }
        return (window as any).aceOverlays;
    }
    
    async function updateOverlay(issue: IIssue, _elem: HTMLElement, bounds: Bounds, noVisibleElement: Boolean, elemOffScreen: Boolean) : Promise<Overlays> {
        let overlays = getOverlays();

        overlays.elem.style.top = `${bounds.top}px`; // values are strings of form "10px"
        overlays.elem.style.left = `${bounds.left}px`;
        overlays.elem.style.width = `${bounds.width}px`;
        overlays.elem.style.height = `${bounds.height}px`;
        if (noVisibleElement === true || elemOffScreen === true) {
            overlays.elem.style.backgroundColor = "#f6f2ff";
        } else {
            overlays.elem.style.backgroundColor = "";
        }
        
        
        overlays.info.style.top = `${bounds.top+bounds.height+4}px`;
        overlays.info.style.left = `${bounds.left}px`;
        // Get Issue info data
        let report = await devtoolsController.getReport();
        let types = [0,0,0];
        // Find Issues that match issue.path.dom
        report?.results.map((result: IIssue) => {
            if (issue.path.dom === result.path.dom) {
                if (result.value[0] === "VIOLATION" && result.value[1] === "FAIL") {
                    types[0] += 1;
                }
                if (result.value[0] === "VIOLATION" && (result.value[1] === "POTENTIAL" || result.value[1] === "MANUAL")) {
                    types[1] += 1;
                }
                if (result.value[0] === "RECOMMENDATION") {
                    types[2] += 1;
                }
            }
        });
        // build content for issues info
        let violationText = ""; // violation icon image + text
        let nrText = "";
        let recommendationText = "";

        violationText = types[0] < 2 ? types[0]+" Violation<br>" : types[0]+" Violations<br>";
        let violationImage = `<svg version="1.1" id="icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
             width="16px" height="16px" viewBox="0 0 16 16" style="enable-background:new 0 0 16 16;" xml:space="preserve">
            <title>Violation</title>
            <style type="text/css">
            .vi0{fill:none;}
            .vi1{fill:#da1e28;}
            .vi2{fill:#FFFFFF;fill-opacity:1;}
            </style>
            <rect id="_Transparent_Rectangle_" class="vi0" width="16" height="16"/>
            <path class="vi1" d="M8,1C4.1,1,1,4.1,1,8s3.1,7,7,7s7-3.1,7-7S11.9,1,8,1z M10.7,11.5L4.5,5.3l0.8-0.8l6.2,6.2L10.7,11.5z"/>
            <path id="inner-path" class="vi2" d="M10.7,11.5L4.5,5.3l0.8-0.8l6.2,6.2L10.7,11.5z"/>
            </svg>`
        let violationImageText = violationImage + "&nbsp;&nbsp;";

        nrText = types[1] < 2 ? types[1]+" Needs review<br>" : types[1]+" Needs review<br>";
        let nrImage = `<svg version="1.1" id="icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            width="16px" height="16px" viewBox="0 0 16 16" xml:space="preserve">
            <style type="text/css">
                .nr0{fill:none;}
                .nr1{fill:#F1C21B;}
            </style>
            <rect id="_Transparent_Rectangle_" class="nr0" width="16" height="16"/>
            <path class="nr1" d="M14.9,13.3l-6.5-12C8.3,1,8,0.9,7.8,1.1c-0.1,0-0.2,0.1-0.2,0.2l-6.5,12c-0.1,0.1-0.1,0.3,0,0.5
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
            </svg>
            `
        let nrImageText = nrImage + "&nbsp;";

        recommendationText = types[2] < 2 ? types[2]+" Recommendation" : types[1]+" Recommendations";
        let recommendationImage = `<svg version="1.1" id="icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            width="16px" height="16px" viewBox="0 0 16 16" xml:space="preserve">
            <style type="text/css">
                .re0{fill:none;}
                .re1{fill:#0043CE;}
                .re2{fill:#FFFFFF;}
                .re3{font-family:'IBMPlexSerif';}
                .re4{font-size:12.9996px;}
            </style>
            <rect id="_Transparent_Rectangle_" class="re0" width="16" height="16"/>
            <path class="re1" d="M14,15H2c-0.6,0-1-0.4-1-1V2c0-0.6,0.4-1,1-1h12c0.6,0,1,0.4,1,1v12C15,14.6,14.6,15,14,15z"/>
            <text transform="matrix(1 0 0 1 5.9528 12.5044)" class="re2 re3 re4">i</text>
            </svg>`
        let recommendationImageText = recommendationImage + "&nbsp;&nbsp;";

        let typesText = (types[0] == 0 ? "" : "<span>" + violationImageText      + violationText + "</span>") 
                      + (types[1] == 0 ? "" : "<span>" + nrImageText             + nrText        + "</span") 
                      + (types[2] == 0 ? "" : "<span>" + recommendationImageText + recommendationText + "</span>");
        //--------------------------------------------
        if (await devtoolsController.getActivePanel() === "main") {
            // JCH Need this
        } else {
            if (noVisibleElement === true) {
                overlays.elem.innerHTML = (
                    `
                    <div style="color:black;">
                        <span style="margin-left:12px;margin-top:10px;display:flex;text-align:center">Selected issue<br>not visible</span>
                    </div>
                `);
                overlays.info.innerHTML = (
                    `
                        <div style="color:white;">
                            ${typesText}
                        </div>
                    `);
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });
            } else if (elemOffScreen === true) {
                overlays.elem.innerHTML = (
                    `
                    <div style="color:black;">
                        <span style="margin-left:12px;margin-top:10px;display:flex;text-align:center">Selected issue <br>off screen</span>
                    </div>
                `);
                overlays.info.innerHTML = (
                    `
                        <div style="color:white;">
                            ${typesText}
                        </div>
                    `);
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });    
            } else {
                overlays.elem.innerHTML = "";
                overlays.info.innerHTML = (
                    `
                        <div style="color:white;">
                            ${typesText}
                        </div>
                    `);
            }
            
        }
        overlays.info.querySelector("a")?.addEventListener("click", async () => {
            await devtoolsController.inspectPath(issue.path.dom);
            await devtoolsController.inspectPath(issue.path.dom);
        })
        return overlays;
    }
    
    async function showOverlay(issue: IIssue) {
        let elem = DomPathUtils.domPathToElem(issue.path.dom);
        let noVisibleElement = false;
        let elemOffScreen = false;
        if (elem) {
            let bounds = ElementUtils.getBounds(elem, false);
            if (bounds) {
                // handle bounds for non-visible elements, i.e., no width or height
                if (bounds.width == 0 && bounds.height == 0) {
                    bounds.left = 2;
                    bounds.top = 3;
                    bounds.width = 150;
                    bounds.height = 50;
                    noVisibleElement = true;
                }
                if (bounds.left < 0 || bounds.top < 0) {
                    bounds.left = 2;
                    bounds.top = 3;
                    bounds.width = 150;
                    bounds.height = 50;
                    elemOffScreen = true;
                }
                let overlay = await updateOverlay(issue, elem, bounds, noVisibleElement, elemOffScreen);
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
