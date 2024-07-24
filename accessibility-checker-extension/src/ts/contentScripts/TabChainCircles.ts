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

import DomPathUtils from "./DomPathUtils";
import TabStopCircle from "./TabStopCircle";
import TabStopLine from "./TabStopLine";
import TabStopText from "./TabStopText";
import NotificationDot from "./NotificationDot";

const getScreenRect = DomPathUtils.getScreenRect;

export default class TabChainCircles {

    // @ts-ignore
    async public static draw(tabstops: any, tabStopsErrors: any, lines: boolean, outlines: boolean, iframes: any) {
        // console.log("Function: TabChainCircles.draw");
        
        // JCH - do circles and errorCircles coord calculations after lines and outlines 

        setTimeout(() => { 
            let offset = 3;
            let nodeXpaths = DomPathUtils.issuesToDomPaths(tabstops);
            let nodes = DomPathUtils.domPathsToElements(nodeXpaths); // tabstop HTML elements


            /* ********************************************************
             * This section tests the status of the Tabbable elements */

            // console.log("Tabbable elements: nodes.length = ",nodes.length);
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i] != null) {
                    // console.log("Tabbable nodes[",i,"]   element exists");
                    if (typeof nodes[i].tagName !== 'undefined' ||  nodes[i].tagName !== null ) { // JCH - tabbable nodes
                        // console.log("Tabbable nodes[",i,"]   tagName is ",nodes[i].tagName);
                        if (getScreenRect(nodes[i]) !== null) {
                            // console.log("Tabbable nodes[",i,"] has bounding rect", nodeRect.x,",",nodeRect.y);
                        } else {
                            console.log("Tabbable nodes[",i,"] has NO bounding rect");
                        }
                    } else {
                        console.log("Tabbable nodes[",i,"].tagName is null $$$$$");
                    }
                } else {
                    console.log("Tabbable nodes[",i,"]   element DOES NOT exists");
                }
                // console.log("--------------------------------");
                if (nodes[i+1] != null && i+1 < nodes.length) {
                    // console.log("Tabbable nodes[",i+1,"]   element exists");
                    if (typeof nodes[i+1].tagName !== 'undefined' ||  nodes[i+1].tagName !== null ) { // JCH - tabbable nodes
                        // console.log("Tabbable nodes[",i+1,"]   tagName is ",nodes[i+1].tagName);
                        if (getScreenRect(nodes[i+1]) !== null) {
                            // console.log("Tabbable nodes[",i+1,"] has bounding rect", nextNodeRect.x,",",nextNodeRect.y);
                        } else {
                            // console.log("Tabbable nodes[",i+1,"] has NO bounding rect");
                        }
                    } else {
                        // console.log("Tabbable nodes[",i+1,"].tagName is null $$$$$");
                    }
                }
                // console.log("--------------------------------");
            }

            /* Finished testing Tabbable elements status
             * ********************************************************/
            

            for (let i = 0; i < nodes.length; i++) { // Make Circle (reg or error), lines between Circle
                                                     // and next Circle and outlines around Circle element
                if (nodes[i] !== null && getScreenRect(nodes[i]) !== null) { // JCH - tabbable nodes
                    let nodeRect = getScreenRect(nodes[i])!;
                    /*********** WHEN CURRENT CIRCLE IS ERROR CIRCLE ***********/ 

                    if (tabstops[i].hasOwnProperty("nodeHasError") && tabstops[i].nodeHasError) { 
                        // coords for nodes[i] and its bounding box if not in iframe or shadow dom
                        let x = nodeRect.x;
                        let xPlusWidth = nodeRect.x + nodeRect.width;

                        let y = nodeRect.y;
                        let yPlusHeight = nodeRect.y + nodeRect.height;
                        // console.log("-------------------------------------");
                        // console.log("Error circle node[",i,"] has coords x = ",x,"   y = ",y);
            
                        // adjustment for iframes
                        // if element inside iframe get iframe coordinates the add coordinates of element to those of iframe
                        if (nodeXpaths[i].includes("iframe")) { // this is for element i
                            // find and store iframe
                            let lastElement = nodeXpaths[i].slice(nodeXpaths[i].lastIndexOf('/'));
                            
                            if (lastElement.includes("iframe")) { // this is for the iframe element
                                // console.log("We Have an iframe, lastElement", lastElement);
                                if (!iframes.find((e:any) => e.name === nodeXpaths[i])) {  // already in iframes
                                    const iframe = {element: nodes[i], name: nodeXpaths[i], x: nodeRect.x, y: nodeRect.y};
                                    iframes.push(iframe);
                                }
                                // no need to adjust coords as the iframe is an element on the main page
                            } else { // this is for elements that are within an iframe
                                // get the iframe string iframe[n]
                                let realIframeString = nodeXpaths[i].slice(0,nodeXpaths[i].indexOf('/html', nodeXpaths[i].indexOf('/html')+1));
                                // find the iframe in iframes
                                const iframesObj = iframes.find((e:any) => e.name === realIframeString);
                                x = iframesObj.x + nodeRect.x;
                                y = iframesObj.y + nodeRect.y;
                            }
                        }
                        
                        /*
                         * SPECIAL CASE: The circle is being drawn OFF of the screen so move it into the screen
                         * Note: The element associated with the circle is still off the screen.
                         */
                        // Note: here we assume radius is 18
                        if (x <= 18) {
                            x = 18;
                        }
                        if (y <= 18) {
                            y = 18;
                        }

                        /*
                         * SPECIAL CASE: Exactly overlapping circles adjacent
                         */ 

                        if (i > 0) {
                            let prevRect = getScreenRect(nodes[i-1]);
                            if (prevRect && x === prevRect.x && y == prevRect.y) {
                                // console.log("Error Circle EXACT OVERLAP");
                                x += 20;
                            }
                        }

                        // regarding lines see below as we draw circle after lines
                        
                        // for line to next tabbable element find next tabbable element that exists
                        let nextTabbableElement;
                        for (let j = i+1; j < nodes.length; j++) {
                            if (nodes[j] != null) {
                                nextTabbableElement = nodes[j];
                                break;
                            }
                        }
                        
                        if (i < (nodes.length - 1) && lines && nextTabbableElement && getScreenRect(nextTabbableElement) && getScreenRect(nodes[i+1])) {
                            let nextTabbableRect = getScreenRect(nextTabbableElement)!;
                            let nextNodeRect = getScreenRect(nodes[i+1])!;
                            let slope = (nextTabbableRect.y - offset - nodeRect.y - offset) / (nextTabbableRect.x - offset - nodeRect.x - offset);
                            let x1, y1, x2, y2;
                            x1 = x;
                            y1 = y;

                            // coords for nodes[i+1] or nextTabbableElement if not in iframe or shadow dom
                            x2 = nextNodeRect.x;
                            y2 = nextNodeRect.y;

                            // let check if the next tabbable element is an iframe
                            if (nodeXpaths[i+1].includes("iframe")) {
                                // find and store iframe
                                let lastElement = nodeXpaths[i+1].slice(nodeXpaths[i+1].lastIndexOf('/'));
                                if (lastElement.includes("iframe")) { // this is for the iframe element
                                    if (!iframes.find((e:any) => e.name === nodeXpaths[i+1])) {  // already in iframes
                                        const iframe = {element: nodes[i+1], name: nodeXpaths[i+1], x: nextNodeRect.x, y: nextNodeRect.y};
                                        iframes.push(iframe);
                                        x2 = nextNodeRect.x;
                                        y2 = nextNodeRect.y;
                                    }
                                } else { // this is for elements that are within an iframe
                                    // get the iframe string iframe[n]
                                    let realIframeString = nodeXpaths[i+1].slice(0,nodeXpaths[i+1].indexOf('/html', nodeXpaths[i+1].indexOf('/html')+1));
                                    // find the iframe in iframes
                                    const iframesObj = iframes.find((e:any) => e.name === realIframeString);
                                    // adjust coords
                                    x2 = iframesObj.x + nextNodeRect.x;
                                    y2 = iframesObj.y + nextNodeRect.y;
                                }
                            } 

                            // If the if the 2nd circle is being drawn slighly off of the screen move it into the screen
                            // Note: here we assume radius is 16
                            if (x2 <= 18) {
                                x2 = 18;
                            }
                            if (y2 <= 18) {
                                y2 = 18;
                            }

                            // console.log("Error Circle Line x1 = ",x1,"   x2 = ",x2,"   y1 = ",y1,"   y2 = ",y2);
                            TabStopLine.makeLine(x1, y1, x2, y2, ["line"]);

                            // Create white outline
                            if (Math.abs(slope) < 1) {  // Low slope move y
                                TabStopLine.makeLine(x1, y1 - 2, x2, y2 - 2, ["lineEmboss"]);
                                TabStopLine.makeLine(x1, y1 + 2, x2, y2 + 2, ["lineEmboss"]);

                            } else { // high slope move x
                                TabStopLine.makeLine(x1 - 2, y1, x2 - 2, y2, ["lineEmboss"]);
                                TabStopLine.makeLine(x1 + 2, y1, x2 + 2, y2, ["lineEmboss"]);
                            }
                        }

                        // draw circles, notification dot and text after lines
                        TabStopCircle.makeCircle(x, y, i.toString(), 16, nodeXpaths[i], true);
                        NotificationDot.makeNotificationDot(x+11, y-16, "test");   // notification dot
                        TabStopText.makeText(x, y, (i + 1).toString(), i.toString(), "textColorWhite");


                        if (outlines) {

                            // Make box around active component
                            TabStopLine.makeLine(x, y, xPlusWidth, y, ["line", "lineTop", "lineNumber" + i]);
                            TabStopLine.makeLine(x, y, x, yPlusHeight, ["line", "lineLeft", "lineNumber" + i]);
                            TabStopLine.makeLine(xPlusWidth, y, xPlusWidth, yPlusHeight, ["line", "lineRight", "lineNumber" + i]);
                            TabStopLine.makeLine(x, yPlusHeight, xPlusWidth, yPlusHeight, ["line", "lineBottom", "lineNumber" + i]);

                            // Make white stroke around active component outline
                            TabStopLine.makeLine(x - 1, y - 1, xPlusWidth + 1, y - 1, ["lineEmboss"]);
                            TabStopLine.makeLine(x - 1, y - 1, x - 1, yPlusHeight + 1, ["lineEmboss"]);
                            TabStopLine.makeLine(xPlusWidth + 1, y - 1, xPlusWidth + 1, yPlusHeight + 1, ["lineEmboss"]);
                            TabStopLine.makeLine(x - 1, yPlusHeight + 1, xPlusWidth + 1, yPlusHeight + 1, ["lineEmboss"]);

                            // Make white stroke inside active component outline
                            TabStopLine.makeLine(x + 1, y + 1, xPlusWidth - 1, y + 1, ["lineEmboss"]);
                            TabStopLine.makeLine(x + 1, y + 1, x + 1, yPlusHeight - 1, ["lineEmboss"]);
                            TabStopLine.makeLine(xPlusWidth - 1, y + 1, xPlusWidth - 1, yPlusHeight - 1, ["lineEmboss"]);
                            TabStopLine.makeLine(x + 1, yPlusHeight - 1, xPlusWidth - 1, yPlusHeight - 1, ["lineEmboss"]);
                        }

                    /*********** WHEN CURRENT CIRCLE IS REGULAR CIRCLE ***********/

                    } else { // This is the defalt case were we just draw a circle
                        // coords for nodes[i] and its bounding box if not in iframe or shadow dom
                        let x = nodeRect.x;
                        // console.log("nodeRect = ",nodeRect);
                        let xPlusWidth = nodeRect.x + nodeRect.width;

                        let y = nodeRect.y;
                        let yPlusHeight = nodeRect.y + nodeRect.height;
            
                        // adjustment for iframes
                        // if element inside iframe get iframe coordinates the add coordinates of element to those of iframe
                        if (nodeXpaths[i].includes("iframe")) { // this is for element i
                            // find and store iframe
                            let lastElement = nodeXpaths[i].slice(nodeXpaths[i].lastIndexOf('/'));
                            
                            if (lastElement.includes("iframe")) { // this is for the iframe element
                                // console.log("We Have an iframe, lastElement", lastElement);
                                if (!iframes.find((e:any) => e.name === nodeXpaths[i])) {  // already in iframes
                                    const iframe = {element: nodes[i], name: nodeXpaths[i], x: nodeRect.x, y: nodeRect.y};
                                    iframes.push(iframe);
                                }
                                // no need to adjust coords as the iframe is an element on the main page
                            } else { // this is for elements that are within an iframe
                                // get the iframe string iframe[n]
                                let realIframeString = nodeXpaths[i].slice(0,nodeXpaths[i].indexOf('/html', nodeXpaths[i].indexOf('/html')+1));
                                // find the iframe in iframes
                                const iframesObj = iframes.find((e:any) => e.name === realIframeString);
                                // console.log("iframesObj = ",iframesObj);
                                x = iframesObj.x + nodeRect.x;
                                y = iframesObj.y + nodeRect.y;

                            }
                        }
                        
                        // If the first circle is being drawn slighly off of the screen move it into the screen
                        // Note: here we assume radius is 13
                        if (x <= 15) {
                            x = 15;
                        }
                        if (y <= 15) {
                            y = 15;
                        }
                        // see below lines as we draw circle after lines
                        
                        // for line to next tabbable element find next tabbable element that exists
                        let nextTabbableElement;
                        for (let j = i+1; j < nodes.length; j++) {
                            if (nodes[j] != null) {
                                nextTabbableElement = nodes[j];
                                break;
                            }
                        }
                        
                        if (i < (nodes.length - 1) && lines && nextTabbableElement && getScreenRect(nextTabbableElement) && getScreenRect(nodes[i+1])) {
                            let nextTabbableRect = getScreenRect(nextTabbableElement)!;
                            let nextNodeRect = getScreenRect(nodes[i+1])!;
                            let slope = (nextTabbableRect.y - offset - nodeRect.y - offset) / (nextTabbableRect.x - offset - nodeRect.x - offset);
                            let x1, y1, x2, y2;
                            x1 = x;
                            y1 = y;

                            // coords for nodes[i+1] or nextTabbableElement if not in iframe or shadow dom
                            x2 = nextNodeRect.x;
                            y2 = nextNodeRect.y;

                            // let check if the next tabbable element is an iframe
                            if (nodeXpaths[i+1].includes("iframe")) {
                                // find and store iframe
                                let lastElement = nodeXpaths[i+1].slice(nodeXpaths[i+1].lastIndexOf('/'));
                                if (lastElement.includes("iframe")) { // this is for the iframe element
                                    // console.log("We Have an iframe, lastElement", lastElement);
                                    if (!iframes.find((e:any) => e.name === nodeXpaths[i+1])) {  // already in iframes
                                        const iframe = {element: nodes[i+1], name: nodeXpaths[i+1], x: nextNodeRect.x, y: nextNodeRect.y};
                                        iframes.push(iframe);
                                        x2 = nextNodeRect.x;
                                        y2 = nextNodeRect.y;
                                    }
                                } else { // this is for elements that are within an iframe
                                    // get the iframe string iframe[n]
                                    let realIframeString = nodeXpaths[i+1].slice(0,nodeXpaths[i+1].indexOf('/html', nodeXpaths[i+1].indexOf('/html')+1));
                                    // find the iframe in iframes
                                    const iframesObj = iframes.find((e:any) => e.name === realIframeString);
                                    // adjust coords
                                    x2 = iframesObj.x + nextNodeRect.x;
                                    y2 = iframesObj.y + nextNodeRect.y;
                                }
                            } 

                            // If the if the 2nd circle is being drawn slighly off of the screen move it into the screen
                            // Note: here we assume radius is 13
                            if (x2 <= 15) {
                                x2 = 15;
                            }
                            if (y2 <= 15) {
                                y2 = 15;
                            }

                            /*
                            * SPECIAL CASE: Exactly overlapping circles adjacent
                            */ 

                            if (i > 0) {
                                let prevRect = getScreenRect(nodes[i-1]);
                                if (prevRect && x === prevRect.x && y == prevRect.y) {
                                    // console.log("Regular Circle EXACT OVERLAP");
                                    x += 20;
                                }
                            }

                            // console.log("Regular Circle node ",i," to ",i+1," Line x1 = ",x1,"   x2 = ",x2,"   y1 = ",y1,"   y2 = ",y2);
                            TabStopLine.makeLine(x1, y1, x2, y2, ["line"]);

                            // Create white outline
                            if (Math.abs(slope) < 1) {  // Low slope move y
                                TabStopLine.makeLine(x1, y1 - 2, x2, y2 - 2, ["lineEmboss"]);
                                TabStopLine.makeLine(x1, y1 + 2, x2, y2 + 2, ["lineEmboss"]);

                            } else { // high slope move x
                                TabStopLine.makeLine(x1 - 2, y1, x2 - 2, y2, ["lineEmboss"]);
                                TabStopLine.makeLine(x1 + 2, y1, x2 + 2, y2, ["lineEmboss"]);
                            }
                        }

                        // draw circles after lines
                        // console.log("Regular Circle node[",i,"] coords x = ",x,"   y = ",y);
                        TabStopCircle.makeCircle(x, y, i.toString(), 13, nodeXpaths[i], false);
                        TabStopText.makeText(x, y, (i + 1).toString(), i.toString(), "textColorWhite");


                        if (outlines) {

                            // Make box around active component
                            TabStopLine.makeLine(x, y, xPlusWidth, y, ["line", "lineTop", "lineNumber" + i]);
                            TabStopLine.makeLine(x, y, x, yPlusHeight, ["line", "lineLeft", "lineNumber" + i]);
                            TabStopLine.makeLine(xPlusWidth, y, xPlusWidth, yPlusHeight, ["line", "lineRight", "lineNumber" + i]);
                            TabStopLine.makeLine(x, yPlusHeight, xPlusWidth, yPlusHeight, ["line", "lineBottom", "lineNumber" + i]);

                            // Make white stroke around active component outline
                            TabStopLine.makeLine(x - 1, y - 1, xPlusWidth + 1, y - 1, ["lineEmboss"]);
                            TabStopLine.makeLine(x - 1, y - 1, x - 1, yPlusHeight + 1, ["lineEmboss"]);
                            TabStopLine.makeLine(xPlusWidth + 1, y - 1, xPlusWidth + 1, yPlusHeight + 1, ["lineEmboss"]);
                            TabStopLine.makeLine(x - 1, yPlusHeight + 1, xPlusWidth + 1, yPlusHeight + 1, ["lineEmboss"]);

                            // Make white stroke inside active component outline
                            TabStopLine.makeLine(x + 1, y + 1, xPlusWidth - 1, y + 1, ["lineEmboss"]);
                            TabStopLine.makeLine(x + 1, y + 1, x + 1, yPlusHeight - 1, ["lineEmboss"]);
                            TabStopLine.makeLine(xPlusWidth - 1, y + 1, xPlusWidth - 1, yPlusHeight - 1, ["lineEmboss"]);
                            TabStopLine.makeLine(x + 1, yPlusHeight - 1, xPlusWidth - 1, yPlusHeight - 1, ["lineEmboss"]);
                        }
                    }
                }
            }
        }, 0);
    }
}