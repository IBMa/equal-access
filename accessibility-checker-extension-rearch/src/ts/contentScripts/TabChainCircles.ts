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

import XpathUtils from "./XpathUtils";
import TabStopCircle from "./TabStopCircle";
import TabStopLine from "./TabStopLine";
import TabStopText from "./TabStopText";
import NotificationDot from "./NotificationDot";

export default class TabChainCircles {

    // @ts-ignore
    async public static draw(tabstops: any, tabStopsErrors: any, lines: boolean, outlines: boolean, iframes: any) {
        // console.log("Function: redraw");
        // JCH - do circles and errorCircle coord calculations before lines and outlines 
        // as centers of circles and errorCircles set the basic coords

        setTimeout(() => { 
            let offset = 3;
            let nodes = XpathUtils.getNodesXpaths(tabstops);
            let nodeXpaths = nodes;
            nodes = XpathUtils.convertXpathsToHtmlElements(nodeXpaths);

            // console.log("Tabbable elements: nodes.length = ",nodes.length);
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i] != null) {
                    // console.log("Tabbable nodes[",i,"]   element exists");
                    if (typeof nodes[i].tagName !== 'undefined' ||  nodes[i].tagName !== null ) { // JCH - tabbable nodes
                        // console.log("Tabbable nodes[",i,"]   tagName is ",nodes[i].tagName);
                        if (typeof nodes[i].getBoundingClientRect !== 'undefined' || nodes[i].getBoundingClientRect != null) {
                            // console.log("Tabbable nodes[",i,"] has bounding rect", nodes[i].getBoundingClientRect().x,",",nodes[i].getBoundingClientRect().y);
                        }
                        else {
                            // console.log("Tabbable nodes[",i,"] has NO bounding rect");
                        }
                    } else {
                        // console.log("Tabbable nodes[",i,"].tagName is null $$$$$");
                    }
                }
                // console.log("--------------------------------");
                if (nodes[i+1] != null && i+1 < nodes.length) {
                    // console.log("Tabbable nodes[",i+1,"]   element exists");
                    if (typeof nodes[i+1].tagName !== 'undefined' ||  nodes[i+1].tagName !== null ) { // JCH - tabbable nodes
                        // console.log("Tabbable nodes[",i+1,"]   tagName is ",nodes[i+1].tagName);
                        if (typeof nodes[i+1].getBoundingClientRect !== 'undefined' || nodes[i+1].getBoundingClientRect != null) {
                            // console.log("Tabbable nodes[",i+1,"] has bounding rect", nodes[i+1].getBoundingClientRect().x,",",nodes[i+1].getBoundingClientRect().y);
                        }
                        else {
                            // console.log("Tabbable nodes[",i+1,"] has NO bounding rect");
                        }
                    } else {
                        // console.log("Tabbable nodes[",i+1,"].tagName is null $$$$$");
                    }
                }
                // console.log("--------------------------------");
            }

            for (let i = 0; i < nodes.length; i++) { //Make lines between numbers
                if (nodes[i] != null ) { // JCH - tabbable nodes
                    if (tabstops[i].hasOwnProperty("nodeHasError") && tabstops[i].nodeHasError) { // if true should draw triangle instead of circle

                        // coords for nodes[i] and its bounding box if not in iframe or shadow dom
                        let x = nodes[i].getBoundingClientRect().x;
                        // console.log("nodes[i].getBoundingClientRect() = ",nodes[i].getBoundingClientRect());
                        let xPlusWidth = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width;

                        let y = nodes[i].getBoundingClientRect().y;
                        let yPlusHeight = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height;
            
                        // adjustment for iframes
                        // if element inside iframe get iframe coordinates the add coordinates of element to those of iframe
                        if (nodeXpaths[i].includes("iframe")) { // this is for element i
                            // find and store iframe
                            let lastElement = nodeXpaths[i].slice(nodeXpaths[i].lastIndexOf('/'));
                            
                            if (lastElement.includes("iframe")) { // this is for the iframe element
                                // console.log("We Have an iframe, lastElement", lastElement);
                                if (!iframes.find((e:any) => e.name === nodeXpaths[i])) {  // already in iframes
                                    const iframe = {element: nodes[i], name: nodeXpaths[i], x: nodes[i].getBoundingClientRect().x, y: nodes[i].getBoundingClientRect().y};
                                    iframes.push(iframe);
                                }
                                // no need to adjust coords as the iframe is an element on the main page
                            } else { // this is for elements that are within an iframe
                                // get the iframe string iframe[n]
                                let realIframeString = nodeXpaths[i].slice(0,nodeXpaths[i].indexOf('/html', nodeXpaths[i].indexOf('/html')+1));
                                // find the iframe in iframes
                                const iframesObj = iframes.find((e:any) => e.name === realIframeString);
                                // console.log("iframesObj = ",iframesObj);
                                x = iframesObj.x + nodes[i].getBoundingClientRect().x;
                                y = iframesObj.y + nodes[i].getBoundingClientRect().y;

                            }
                        }
                        
                        // If the circle is being drawn slighly off of the screen move it into the screen
                        // Note: here we assume radius is 16
                        if (x <= 18) {
                            x += 18 - x;
                        }
                        if (y <= 18) {
                            y += 18 - y;
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
                        
                        if (lines) {
                            if (i < nodes.length - 1) {
                                let slope = (nextTabbableElement.getBoundingClientRect().y - offset - nodes[i].getBoundingClientRect().y - offset) / (nextTabbableElement.getBoundingClientRect().x - offset - nodes[i].getBoundingClientRect().x - offset);
                                let x1, y1, x2, y2;
                                x1 = x;
                                y1 = y;

                                // coords for nodes[i+1] or nextTabbableElement if not in iframe or shadow dom
                                x2 = nodes[i+1].getBoundingClientRect().x;
                                y2 = nodes[i+1].getBoundingClientRect().y;

                                // let check if the next tabbable element is an iframe
                                if (nodeXpaths[i+1].includes("iframe")) {
                                    // find and store iframe
                                    let lastElement = nodeXpaths[i+1].slice(nodeXpaths[i+1].lastIndexOf('/'));
                                    if (lastElement.includes("iframe")) { // this is for the iframe element
                                        // console.log("We Have an iframe, lastElement", lastElement);
                                        if (!iframes.find((e:any) => e.name === nodeXpaths[i+1])) {  // already in iframes
                                            const iframe = {element: nodes[i+1], name: nodeXpaths[i+1], x: nodes[i+1].getBoundingClientRect().x, y: nodes[i+1].getBoundingClientRect().y};
                                            iframes.push(iframe);
                                            x2 = nodes[i+1].getBoundingClientRect().x;
                                            y2 = nodes[i+1].getBoundingClientRect().y;
                                        }
                                    } else { // this is for elements that are within an iframe
                                        // get the iframe string iframe[n]
                                        let realIframeString = nodeXpaths[i+1].slice(0,nodeXpaths[i+1].indexOf('/html', nodeXpaths[i+1].indexOf('/html')+1));
                                        // find the iframe in iframes
                                        const iframesObj = iframes.find((e:any) => e.name === realIframeString);
                                        // adjust coords
                                        x2 = iframesObj.x + nodes[i+1].getBoundingClientRect().x;
                                        y2 = iframesObj.y + nodes[i+1].getBoundingClientRect().y;
                                    }
                                } 

                                // If the if the 2nd circle is being drawn slighly off of the screen move it into the screen
                                // Note: here we assume radius is 16
                                if (x2 <= 18) {
                                    x2 += 18 - x2;
                                }
                                if (y2 <= 18) {
                                    y2 += 18 - y2;
                                }

                                
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
                        }

                        // draw circles after lines
                        // console.log("Tabbable with ERROR i = ",i," so add classname error");
                        // console.log("errorCircle x = ",x,"  y = ",y);
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
                    } else { // This is the defalt case were we just draw a circle
                        // coords for nodes[i] and its bounding box if not in iframe or shadow dom
                        let x = nodes[i].getBoundingClientRect().x;
                        // console.log("nodes[i].getBoundingClientRect() = ",nodes[i].getBoundingClientRect());
                        let xPlusWidth = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width;

                        let y = nodes[i].getBoundingClientRect().y;
                        let yPlusHeight = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height;
            
                        // adjustment for iframes
                        // if element inside iframe get iframe coordinates the add coordinates of element to those of iframe
                        if (nodeXpaths[i].includes("iframe")) { // this is for element i
                            // find and store iframe
                            let lastElement = nodeXpaths[i].slice(nodeXpaths[i].lastIndexOf('/'));
                            
                            if (lastElement.includes("iframe")) { // this is for the iframe element
                                // console.log("We Have an iframe, lastElement", lastElement);
                                if (!iframes.find((e:any) => e.name === nodeXpaths[i])) {  // already in iframes
                                    const iframe = {element: nodes[i], name: nodeXpaths[i], x: nodes[i].getBoundingClientRect().x, y: nodes[i].getBoundingClientRect().y};
                                    iframes.push(iframe);
                                }
                                // no need to adjust coords as the iframe is an element on the main page
                            } else { // this is for elements that are within an iframe
                                // get the iframe string iframe[n]
                                let realIframeString = nodeXpaths[i].slice(0,nodeXpaths[i].indexOf('/html', nodeXpaths[i].indexOf('/html')+1));
                                // find the iframe in iframes
                                const iframesObj = iframes.find((e:any) => e.name === realIframeString);
                                // console.log("iframesObj = ",iframesObj);
                                x = iframesObj.x + nodes[i].getBoundingClientRect().x;
                                y = iframesObj.y + nodes[i].getBoundingClientRect().y;

                            }
                        }
                        
                        // If the circle is being drawn slighly off of the screen move it into the screen
                        // Note: here we assume radius is 13
                        if (x <= 15) {
                            x += 15 - x;
                        }
                        if (y <= 15) {
                            y += 15 - y;
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
                        
                        if (lines) {
                            if (i < nodes.length - 1) {
                                let slope = (nextTabbableElement.getBoundingClientRect().y - offset - nodes[i].getBoundingClientRect().y - offset) / (nextTabbableElement.getBoundingClientRect().x - offset - nodes[i].getBoundingClientRect().x - offset);
                                let x1, y1, x2, y2;
                                x1 = x;
                                y1 = y;

                                // coords for nodes[i+1] or nextTabbableElement if not in iframe or shadow dom
                                x2 = nodes[i+1].getBoundingClientRect().x;
                                y2 = nodes[i+1].getBoundingClientRect().y;

                                // let check if the next tabbable element is an iframe
                                if (nodeXpaths[i+1].includes("iframe")) {
                                    // find and store iframe
                                    let lastElement = nodeXpaths[i+1].slice(nodeXpaths[i+1].lastIndexOf('/'));
                                    if (lastElement.includes("iframe")) { // this is for the iframe element
                                        // console.log("We Have an iframe, lastElement", lastElement);
                                        if (!iframes.find((e:any) => e.name === nodeXpaths[i+1])) {  // already in iframes
                                            const iframe = {element: nodes[i+1], name: nodeXpaths[i+1], x: nodes[i+1].getBoundingClientRect().x, y: nodes[i+1].getBoundingClientRect().y};
                                            iframes.push(iframe);
                                            x2 = nodes[i+1].getBoundingClientRect().x;
                                            y2 = nodes[i+1].getBoundingClientRect().y;
                                        }
                                    } else { // this is for elements that are within an iframe
                                        // get the iframe string iframe[n]
                                        let realIframeString = nodeXpaths[i+1].slice(0,nodeXpaths[i+1].indexOf('/html', nodeXpaths[i+1].indexOf('/html')+1));
                                        // find the iframe in iframes
                                        const iframesObj = iframes.find((e:any) => e.name === realIframeString);
                                        // adjust coords
                                        x2 = iframesObj.x + nodes[i+1].getBoundingClientRect().x;
                                        y2 = iframesObj.y + nodes[i+1].getBoundingClientRect().y;
                                    }
                                } 

                                // If the if the 2nd circle is being drawn slighly off of the screen move it into the screen
                                // Note: here we assume radius is 13
                                if (x2 <= 15) {
                                    x2 += 15 - x2;
                                }
                                if (y2 <= 15) {
                                    y2 += 15 - y2;
                                }

                                // console.log("x1 = ",x1,"   x2 = ",x2,"   y1 = ",y1,"   y2 = ",y2);
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
                        }

                        // draw circles after lines
                        // console.log("Tabbable no ERROR i = ",i," so DON'T add classname error");
                        // console.log("x = ", x);
                        // console.log("y = ", y);
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
                } else {
                    continue;
                }
            }
        }, 1);
    }
}