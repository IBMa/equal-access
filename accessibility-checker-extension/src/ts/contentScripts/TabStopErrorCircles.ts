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

export default class TabStopErrorCircles {
    // Tab Stop error NOT in the tab chain - get ? instead of number
    public static draw(tabStopsErrors: any, tabStops: any, outlines: boolean, iframes: any) {
        // JCH - FIX drawing ? trangle if there is already a tabbable triangle
        // console.log("Function: TabStopErrorCircles.draw");
        setTimeout(() => {
            let tabbableNodesXpaths = DomPathUtils.issuesToDomPaths(tabStops);
            
            let nodeXpaths = DomPathUtils.issuesToDomPaths(tabStopsErrors);
            let nodes = DomPathUtils.domPathsToElements(nodeXpaths);
            
            // console.log("tabStopsErrors = ", tabStopsErrors);
            nodes = nodes.filter(function (el: any) {  // Removing failure case of null nodes being sent
                return el != null;
            });

            for (let i = 0; i < nodes.length; i++) {
                // console.log("nodes[",i,"] = ",nodes[i]);
                // Check if already taken care of in the tabbable elements
                let skipErrorNode = false;
                for (let j=0; j < tabbableNodesXpaths.length; j++) {
                    if (nodeXpaths[i] === tabbableNodesXpaths[j]) {
                        // console.log("Already in Tab Chain");
                        // console.log(tabStopsErrors[i].ruleId);
                        skipErrorNode = true; // JCH - already taken care of in redraw
                    } else {
                        // console.log("Not in Tab Chain");
                        // console.log(tabStopsErrors[i].ruleId);
                        // console.log("nodeXpaths[",i,"] = ",nodeXpaths[i]);
                    }
                }
                if (skipErrorNode === true) {
                    // console.log("JCH - skip out");
                    continue; // JCH - don't put up non triangle for an element if already done in redraw
                }

                if (nodeXpaths[i].includes("body")) { // JCH - non tabbable nodes must be within body
                    // console.log("Non tabbable nodes[",i,"] = ",nodes[i]);
                    
                    if (nodes[i] != null ) { // JCH - tabbable nodes
                        if (nodes[i] != null ) { // JCH - tabbable nodes
                            // console.log("Non tabbable nodes[",i,"]   element exists");
                            if (typeof nodes[i].tagName !== 'undefined' ||  nodes[i].tagName !== null ) { // JCH - tabbable nodes
                                // console.log("Non tabbable nodes[",i,"]   tagName is ",nodes[i].tagName);
                                if (getScreenRect(nodes[i]) !== null) {
                                    // console.log("Non tabbable nodes[",i,"] has bounding rect");
                                } else {
                                    console.log("Non tabbable nodes[",i,"] has NO bounding rect");
                                }
                            } else {
                                console.log("Non tabbablenodes[",i,"].tagName is null $$$$$");
                            }
                        } else {
                            console.log("Non tabbable nodes[",i,"] is null $$$$$");
                        }
                    }
                    // console.log("--------------------------------");

                    if (nodes[i] !== null && getScreenRect(nodes[i]) !== null) { // JCH - tabbable nodes
                        let nodeRect = getScreenRect(nodes[i])!;
    
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
                        
                        // If the circle is being drawn slighly off of the screen move it into the screen
                        // Note: here we assume radius is 16
                        if (x <= 18) {
                            x += 18 - x;
                        }
                        if (y <= 18) {
                            y += 18 - y;
                        }

                        // see below lines as we draw triangle after lines
                        // console.log("Triangle x,y = ",x,",",y);

                        if (outlines) {

                            // MAKE BOX AROUND ACTIVE COMPONENT
                            TabStopLine.makeLine(x, y, xPlusWidth, y, ["lineError"]);
                            TabStopLine.makeLine(x, y, x, yPlusHeight, ["lineError"]);
                            TabStopLine.makeLine(xPlusWidth, y, xPlusWidth, yPlusHeight, ["lineError"]);
                            TabStopLine.makeLine(x, yPlusHeight, xPlusWidth, yPlusHeight, ["lineError"]);

                            // Make white stroke around active component outline
                            TabStopLine.makeLine(x - 1, y - 1, xPlusWidth + 1, y - 1, ["lineEmbossError"]);
                            TabStopLine.makeLine(x - 1, y - 1, x - 1, yPlusHeight + 1, ["lineEmbossError"]);
                            TabStopLine.makeLine(xPlusWidth + 1, y - 1, xPlusWidth + 1, yPlusHeight + 1, ["lineEmbossError"]);
                            TabStopLine.makeLine(x - 1, yPlusHeight + 1, xPlusWidth + 1, yPlusHeight + 1, ["lineEmbossError"]);

                            // Make white stroke inside active component outline
                            TabStopLine.makeLine(x + 1, y + 1, xPlusWidth - 1, y + 1, ["lineEmbossError"]);
                            TabStopLine.makeLine(x + 1, y + 1, x + 1, yPlusHeight - 1, ["lineEmbossError"]);
                            TabStopLine.makeLine(xPlusWidth - 1, y + 1, xPlusWidth - 1, yPlusHeight - 1, ["lineEmbossError"]);
                            TabStopLine.makeLine(x + 1, yPlusHeight - 1, xPlusWidth - 1, yPlusHeight - 1, ["lineEmbossError"]);
                        }

                        // console.log("Not in Tab Chain with ERROR i = ",i," so add classname error");
                        
                        TabStopCircle.makeCircle(x, y, i.toString(), 16, nodeXpaths[i], true);
                        NotificationDot.makeNotificationDot(x+11, y-16, "test");   // notification dot
                        TabStopText.makeText(x, y, "?", i.toString(), "textColorBlack");
                    } else {
                        continue;
                    }
                }
            }
        }, 1);
    }
}