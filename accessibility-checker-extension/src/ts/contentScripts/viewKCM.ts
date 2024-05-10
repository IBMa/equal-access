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
import { ISettings, IReport } from "../interfaces/interfaces";
import { UtilKCM } from "../util/UtilKCM";
import TabChainCircles from "./TabChainCircles";
import TabStopErrorCircles from "./TabStopErrorCircles";
import TabStopHighlight from "./TabStopHighlight";
import DomPathUtils from "./DomPathUtils";

let bgController = getBGController();
let myKCMState = false;
(async() => {
    let settings = await bgController.getSettings();
    let myTabId = await bgController.getTabId()!;
    console.log(myTabId);
    let devtoolsController = getDevtoolsController(myTabId, true);
    // console.log("ADDING ViewState LISTENERR");
    devtoolsController.addViewStateListener(async (viewState) => {
        if (viewState.kcm === myKCMState) return;
        if (viewState.kcm === true) {
            myKCMState = true;
            // if viewState.kcm === true then scan has occurred and KCM button has been pushed
            //    so draw KCM visualization
            let report = await devtoolsController.getReport();
            // @ts-ignore
            getKCMData(report, settings);
        } else {
            deleteDrawing(".deleteMe");
            myKCMState = false;
        }
    });
})();

function getKCMData (report:IReport | null, settings: ISettings) {
    /* JCH before finish scan collect and order tab stops
        * Note: report contains all issues
        * 
        * tabbable will contain the elements that are tabbable
        * tabbableErrors will contain the elements that are tabbable and have keyboard issues
        */
    let { tabbable, tabbableErrors } = UtilKCM.processIssues(report!);

    // @ts-ignore
    drawDeleteKCM(tabbable,tabbableErrors,settings);
}

function drawDeleteKCM(tabbable:IReport, tabbableErrors:IReport, settings:ISettings) {
   
    injectCSS(
        `
        .line {
                stroke-width: 2px;
                stroke: black;
            }
        .lineError {
                stroke-width: 2px;
                stroke: red;
        }
        .lineEmboss {
            stroke-width: 1px;
            stroke: white;
        }
        .lineEmbossError {
            stroke-width: 1px;
            stroke: white;
        }
        .lineTop {
            stroke-width: 1px;
            stroke: black;
        }
        .lineBottom {
            stroke-width: 1px;
            stroke: black;
        }
        .lineLeft {
            stroke-width: 1px;
            stroke: black;
        }
        .lineRight {
            stroke-width: 1px;
            stroke: black;
        }
        `
    );
    injectCSS(
        `#svgCircle {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            overflow: visible !important;
            pointer-events: auto !important;
            z-index: 2147483646 !important;
            visibility: visible !important;
            cursor: pointer !important;
        }

        .nohighlightSVGcircle {
            fill: #525252;
            stroke-width: 3px;
            stroke: #C6C6C6;
        }
        
        .highlightSVGcircle{
            fill: black;
            stroke-width: 3px;
            stroke: #C6C6C6;
        }

        .nohighlightSVGerrorCircle{
            fill: #525252;
            stroke-width: 3px;
            stroke: #FF8389;
        }
        
        .highlightSVGerrorCircle{
            fill: black;
            stroke-width: 3px;
            stroke: #FF8389;
        }

        .textColorWhite{
            fill: white
        }

        .textColorBlack{
            fill: white
        }

        .noHighlightSVGText {
            font-weight: normal
        }

        .highlightSVGText {
            font-weight: bold
        }

        .svgNotificationDot{
            position: absolute !important;
            overflow: visible !important;
            pointer-events: none !important;
            z-index: 2147483646 !important;
        }


        `
    );

    injectCSS(
        `#svgLine{
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            overflow: visible !important;
            pointer-events: none !important;
            z-index: 2147483646 !important;
            visibility: visible !important;
        }
        
        .circleText{
            pointer-events: none !important;
        }

        .circleSmall{
            font-size: 12px !important;
        }
        `
    );
    
    // Create nodes that have keyboard errors
    let tabStopsErrors: any = tabbableErrors;

    // Create nodes that are tabbable, i.e., in the tab chain
    let regularTabstops: any = tabbable;
    for (let index = 0; index < regularTabstops.length; index++) {
        const tabElem = regularTabstops[index];
        let flagMatchFound = false;
        tabStopsErrors.forEach((errorElem: any) => {
            if (tabElem.path.dom === errorElem.path.dom) {
                flagMatchFound = true;
            }
        });
        if (flagMatchFound) {
            regularTabstops[index].nodeHasError = true;
        } 
    }
    
    // JCH - this allows the web to scroll to the top before drawing occurs
    //       we get the lines and outlines (both booleans) from settings
    goToTop().then(function() {
        setTimeout(() => {
                let iframes: any = [];
                TabChainCircles.draw(regularTabstops, tabStopsErrors, settings.tabStopLines, settings.tabStopOutlines,iframes).then(function() {
                TabStopErrorCircles.draw(tabStopsErrors, regularTabstops, settings.tabStopOutlines,iframes);
            });
            
        }, 1000)
        
    });

    // left mouse click listener for the circles and triangles
    window.addEventListener('mousedown', function(event:any) {
        TabStopHighlight.handleTabHighlight(event,document,"click","",tabStopsErrors,regularTabstops);
    });

    // Tab key listener for main window
    window.addEventListener('keyup', function(event:any) {
        if ((event.target.shadowRoot instanceof ShadowRoot) === false) {
            TabStopHighlight.handleTabHighlight(event, document, "main", "",tabStopsErrors,regularTabstops);
        }
    });

    // Find all iframes nodes 
    let frames = document.getElementsByTagName("iframe");

    for (let i = 0; i < frames.length; i++) {
        if (frames[i] != null) {
            if (frames[i].contentDocument) {
                frames[i].contentWindow?.addEventListener('keyup', function(event:any) {
                    let iframePath:string = DomPathUtils.getDomPathForElement(frames[i]); // since iframes in main doc
                    TabStopHighlight.handleTabHighlight(event,frames[i].contentWindow!.document,"iframe",iframePath,tabStopsErrors,regularTabstops);
                });
            } else {
                console.log("iframe cross-origin");
            }
        }
    }
    // Find all shadow dom host nodes
    let shadowDoms:any = [];
    let allNodes = document.querySelectorAll("*");
    for (let i = 0; i < allNodes.length; i++) {
        if (allNodes[i].shadowRoot) {
            shadowDoms.push(allNodes[i]);
        }
    }
   
    for (let i = 0; i < shadowDoms.length; i++) {
        if (shadowDoms[i] != null) {
            shadowDoms[i].shadowRoot?.addEventListener('keyup', function(event:any) {
                let focusElement = shadowDoms[i].shadowRoot?.activeElement;
                let focusElementPath = DomPathUtils.getDomPathForElement(focusElement);
                // JCH TODO 1 for the doc frag ONLY works for 1 level doc frags
                focusElementPath = "/#document-fragment"+"["+"1"+"]"+ focusElementPath;
                TabStopHighlight.handleTabHighlight(event,shadowDoms[i],"shadowdom",focusElementPath,tabStopsErrors,regularTabstops);
            });
        }
    }
    return true;       
}

function injectCSS(styleString: string) {
    const style = document.createElement('style');
    style.classList.add("deleteMe");
    style.textContent = styleString;
    document.head.append(style);
}


async function goToTop() {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
}

function deleteDrawing(classToRemove: string) {
    // console.log("Function: deleteDrawing START");
    document.querySelectorAll(classToRemove).forEach(e => e.remove());
    // console.log("Function: deleteDrawing DONE")
}

document.documentElement.addEventListener("keypress", async (evt: KeyboardEvent) => {
    if (evt.code === "KeyS" && evt.ctrlKey && evt.altKey) {
        let tabId = await bgController.getTabId();
        bgController.requestScan({ toolTabId: tabId, contentTabId: tabId });    
        evt.preventDefault();
        evt.stopPropagation();
    }
});