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
import DomPathUtils from "./DomPathUtils";
import { 
    IIssue 
} from "../interfaces/interfaces";

export default class TabStopHighlight {
    // JCH - This is where we handle Tab Stop highlighting
    //       We need to differentiate between regular circles and circles with errors.
    //       The number text inside the circle (doesn't matter if error or not) 
    //       will be normal if not highlighting, bold if highlight
    public static async handleTabHighlight(event:any,doc:any,docType:string,iframeStr:string, tabStopsErrors: IIssue[], regularTabstops: IIssue[]) { // doc type is main, iframe, shadowdom, click
        let elementXpath = "";
        if (!event.shiftKey && event.key === "Tab") { // only catch Tab key
            if (docType === "main") {
                let element = doc.activeElement;  // get element just tabbed to which has focus
                elementXpath = DomPathUtils.getDomPathForElement(element); // in main doc so just get xpath
            }
            
            // if we have iframe
            if (docType === "iframe") {
                let element = doc.activeElement;  // get element just tabbed to which has focus
                elementXpath = DomPathUtils.getDomPathForElement(element); // in main doc so just get xpath
                elementXpath = iframeStr + elementXpath;
            }

            // if we have shadow dom
            if (docType === "shadowdom") {
                let sdXpath = DomPathUtils.getDomPathForElement(doc);
                elementXpath = sdXpath+iframeStr;
            }

            // get circle or errorCircle with matching xpath
            let circle = document.querySelector('circle[xpath="'+elementXpath+'"]');
            let errorCircle = null;
            if (circle?.classList.contains('error')) {
                errorCircle = document.querySelector('circle[xpath="'+elementXpath+'"]');
            }
            
            let prevHighlightedElement;

            // find previous highlighted element which is either a circle or errorCircle so will be within document
            if (prevHighlightedElement = document.getElementsByClassName("highlightSVGcircle")[0]) {
                // console.log("Found prevHighlightedElement is circle = ", prevHighlightedElement);
            } else if (prevHighlightedElement = document.getElementsByClassName("highlightSVGerrorCircle")[0]) {
                // console.log("Found prevHighlightedElement is errorCircle = ", prevHighlightedElement );
            }

            // for prevHighlightedElement remove highlightSVGcircle and add nohighlightSVGcircle
            if (prevHighlightedElement) {
                if (prevHighlightedElement.tagName === "circle" && !prevHighlightedElement.classList.contains('error')) {
                    this.unHighlightCircle(prevHighlightedElement,"circle");
                } 
                else if (prevHighlightedElement.tagName === "circle" && prevHighlightedElement.classList.contains('error')) {
                    this.unHighlightCircle(prevHighlightedElement,"errorCircle");
                }
            } else {
                // console.log("No prevHighlightedElement to highlight")
            }
            // Highlight circle
            if (circle && !circle.classList.contains('error')) {
                this.highlightCircle(circle,"circle");
            } else {
                // console.log("No circle to highlight = ",circle);
            }
            if (errorCircle && errorCircle.classList.contains('error')) {
               this.highlightCircle(errorCircle,"errorCircle");
            } else {
                // console.log("No errorCircle to highlight = ",errorCircle);
            }
        } else if (event.shiftKey && event.key === "Tab") { // catch SHIFT TAB
            if (docType === "main") {
                // console.log("Got main doc element");
                let element = doc.activeElement;  // get element just tabbed to which has focus
                elementXpath = DomPathUtils.getDomPathForElement(element); // in main doc so just get xpath
            }
            
            // if we have iframe
            if (docType === "iframe") {
                let element = doc.activeElement;  // get element just tabbed to which has focus
                elementXpath = DomPathUtils.getDomPathForElement(element); // in main doc so just get xpath
                elementXpath = iframeStr + elementXpath;
            }

            // if we have shadow dom
            if (docType === "shadowdom") {
                let sdXpath = DomPathUtils.getDomPathForElement(doc);
                elementXpath = sdXpath+iframeStr;
            }

            // get circle or errorCircle with matching xpath
            let circle = document.querySelector('circle[xpath="'+elementXpath+'"]');
            let errorCircle = null;
            if (circle?.classList.contains('error')) {
                errorCircle = document.querySelector('circle[xpath="'+elementXpath+'"]');
            }
            
            let prevHighlightedElement;
            // find previouse highlighted element which is either a circle or triangle so will be within document
            
            if (prevHighlightedElement = document.getElementsByClassName("highlightSVGcircle")[0]) {
                // console.log("Found prevHighlightedElement is circle = ", prevHighlightedElement);
            } else if (prevHighlightedElement = document.getElementsByClassName("highlightSVGerrorCircle")[0]) {
                // console.log("Found prevHighlightedElement is errorCircle = ", prevHighlightedElement );
            }
            // for prevHighlightedElement remove highlightSVGcircle and add nohighlightSVGcircle
            
            if (prevHighlightedElement) {
                // console.log("prevHighlightedElement.tagName = ", prevHighlightedElement.tagName);
                if (prevHighlightedElement.tagName === "circle" && !prevHighlightedElement.classList.contains('error')) {
                    this.unHighlightCircle(prevHighlightedElement,"circle");
                } 
                else if (prevHighlightedElement.tagName === "circle" && prevHighlightedElement.classList.contains('error')) {
                    this.unHighlightCircle(prevHighlightedElement,"errorCircle");
                }
                // console.log("prevHighlightedElement unhighlighted = ",prevHighlightedElement);
            } else {
                // console.log("No prevHighlightedElement to highlight")
            }
            // Highlight circle
            if (circle && !circle.classList.contains('error')) {
                this.highlightCircle(circle,"circle");
            } else {
                // console.log("No circle to highlight = ",circle);
            }
            if (errorCircle && errorCircle.classList.contains('error')) {
                this.highlightCircle(errorCircle,"errorCircle");
            } else {
                // console.log("No errorCircle to highlight = ",circle);
            }
        } else if (event.detail !== 0) {
            if (event.target.tagName === "circle" && !event.target.classList.contains('error') || event.target.tagName === "circle" && event.target.classList.contains('error')) {
                let circle = null;
                if (event.target.tagName === "circle" && !event.target.classList.contains('error')) {
                    circle = event.target;
                }
                let errorCircle = null;
                if (event.target.tagName === "circle" && event.target.classList.contains('error')) {
                    errorCircle = event.target;
                }
                
                let element = DomPathUtils.domPathToElem(event.target.getAttribute("xpath")); // circle's element that we want to have focus
                // element = doc.activeElement;  // get element just tabbed to which has focus
                elementXpath = DomPathUtils.getDomPathForElement(element); // in main doc so just get xpath
           

                if (circle != null) {
                    if (circle.getAttribute("xpath").includes("iframe")) {
                        docType = "iframe";

                    }
                } else if (errorCircle != null) {
                    if (errorCircle.getAttribute("xpath").includes("iframe")) {
                        docType = "iframe";
                    }
                }
                if (circle != null) {
                    if (circle.getAttribute("xpath").includes("document-fragment")) {
                        docType = "shadowdom";
                    }
                } else if (errorCircle != null) {
                    if (errorCircle.getAttribute("xpath").includes("document-fragment")) {
                        docType = "shadowdom";
                    }
                }

                
                
                // if we have iframe
                if (docType === "iframe" || docType === "shadowdom") {
                    if (circle != null)
                        elementXpath = circle.getAttribute("xpath");
                    if (errorCircle != null)
                        elementXpath = errorCircle.getAttribute("xpath");
                }

                // get circle or errorCircle with matching xpath
                circle = document.querySelector('circle[xpath="'+elementXpath+'"]');
                errorCircle = null;
                if (circle?.classList.contains('error')) {
                    errorCircle = document.querySelector('circle[xpath="'+elementXpath+'"]');
                }
                
                let prevHighlightedElement;
                if (prevHighlightedElement = doc.getElementsByClassName("highlightSVGcircle")[0] || document.getElementsByClassName("highlightSVGcircle")[0]) {
                    // console.log("Found prevHighlightedElement is circle = ", prevHighlightedElement);
                } else if (prevHighlightedElement = doc.getElementsByClassName("highlightSVGerrorCircle")[0] || document.getElementsByClassName("highlightSVGerrorCircle")[0]) {
                    // console.log("Found prevHighlightedElement is errorCircle = ", prevHighlightedElement );
                }
                // for prevHighlightedElement remove highlightSVGcircle and add nohighlightSVGcircle
                
                if (prevHighlightedElement) {
                    // console.log("prevHighlightedElement.tagName = ", prevHighlightedElement.tagName);
                    if (prevHighlightedElement.tagName === "circle" && !prevHighlightedElement.classList.contains('error')) {
                        this.unHighlightCircle(prevHighlightedElement,"circle");
                    } 
                    else if (prevHighlightedElement.tagName === "circle" && prevHighlightedElement.classList.contains('error')) {
                        this.unHighlightCircle(prevHighlightedElement,"errorCircle");
                    }
                    // console.log("prevHighlightedElement unhighlighted = ",prevHighlightedElement);
                } else {
                    console.log("No prevHighlightedElement to highlight")
                }

                
                

                // Highlight circle and select code in dom
                if (circle && !circle.classList.contains('error')) {
                    this.highlightCircle(circle,"circle");

                    let issue = this.getIssueByXpath(elementXpath,regularTabstops);
                    if (issue) {
                        let tabId = await getBGController().getTabId();
                        let devtoolsController = getDevtoolsController(true, "remote", tabId);
                        await devtoolsController.setSelectedIssue(null);
                        if (await devtoolsController.getActivePanel() === "elements") {
                            await devtoolsController.inspectPath(elementXpath,element);
                        } else {
                            await devtoolsController.setSelectedElementPath(issue.path.dom);
                        }
                    }
                } else {
                    console.log("No circle to highlight = ",circle);
                }
                // Highlight error circle and select code in dom and select issue
                if (errorCircle && errorCircle.classList.contains('error')) {
                    this.highlightCircle(errorCircle,"errorCircle");

                    let issue = this.getIssueByXpath(elementXpath,tabStopsErrors);
                    if (issue) {
                        let tabId = await getBGController().getTabId();
                        let devtoolsController = getDevtoolsController(true, "remote", tabId);
                        await devtoolsController.setSelectedIssue(issue);
                        if (await devtoolsController.getActivePanel() === "elements") {
                            await devtoolsController.inspectPath(elementXpath,element);
                        } else {
                            await devtoolsController.setSelectedElementPath(issue.path.dom);
                        }
                    }
                } else {
                    console.log("No errorCircle to highlight = ",circle);
                }
                // element.focus(); // Can't focus going to Scan Button 
            }
        }
    }

    private static findCircleTextElement(circle:any) {
        let circleClassList, circleClassMatch, circleNumber, textCollection;
        if (circle) {
            circleClassList = circle?.classList.value.toLowerCase().split(' ');
            circleClassMatch = circleClassList.filter((item: string) => {return item.toLowerCase().includes('circleNumber'.toLowerCase())});
            circleNumber = circleClassMatch[0].slice(12);
            textCollection = document.getElementsByClassName("circleNumber" + circleNumber + " circleText");
            return (textCollection[0]);
        } else {
            return null;
        } 
    }

    private static highlightCircle(circle:any, type:string) {
        if (type === "circle") {
            circle?.classList.remove("nohighlightSVGcircle");
            circle?.classList.add("highlightSVGcircle");
            let circleText = this.findCircleTextElement(circle);
            circleText?.classList.remove("noHighlightSVGText");
            circleText?.classList.add("highlightSVGText");
        } else if (type === "errorCircle") {
            circle?.classList.remove("nohighlightSVGerrorCircle");
            circle?.classList.add("highlightSVGerrorCircle");
            let errorCircleText = this.findErrorCircleTextElement(circle);
            errorCircleText?.classList.remove("noHighlightSVGText");
            errorCircleText?.classList.add("highlightSVGText");
        }
    }

    private static unHighlightCircle(circle:any, type:string) {
        if (type === "circle") {
            circle.classList.remove("highlightSVGcircle");
            circle.classList.add("nohighlightSVGcircle");
            let circleText = this.findCircleTextElement(circle);
            circleText?.classList.remove("highlightSVGText");
            circleText?.classList.add("noHighlightSVGText");
        } else if (type === "errorCircle") {
            circle.classList.remove("highlightSVGerrorCircle");
            circle.classList.add("nohighlightSVGerrorCircle");
            let circleText = this.findCircleTextElement(circle);
            circleText?.classList.remove("highlightSVGText");
            circleText?.classList.add("noHighlightSVGText");
        }
        

    }

    private static findErrorCircleTextElement(errorCircle:any) {
        let errorCircleClasslist, errorCircleClassMatch, errorCircleNumber, errorTextCollection;
    
        if (errorCircle) {
            errorCircleClasslist = errorCircle?.classList.value.split(' ');
            // @ts-ignore
            errorCircleClassMatch = errorCircleClasslist.filter((item: string) => {return item.toLowerCase().includes('circleNumber'.toLowerCase())});
            errorCircleNumber = errorCircleClassMatch[0].slice(12);
            errorTextCollection = document.getElementsByClassName("circleNumber" + errorCircleNumber + " circleText");
            return (errorTextCollection[0]);
        } else {
            return null;
        }
    }

    private static getIssueByXpath(elementXpath:string, tabStops: IIssue[]) {
        return tabStops.find(tabStop => tabStop.path.dom === elementXpath);
    }
}