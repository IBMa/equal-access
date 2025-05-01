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
import { IArchiveDefinition, IIssue, IMessage, IReport, IRuleset, ISessionState, ISettings, IssueValue } from "../interfaces/interfaces";
import { CommonMessaging } from "../messaging/commonMessaging";
import { Controller, eControllerType, ListenerType } from "../messaging/controller";
import Config from "../util/config";
import EngineCache from "./util/engineCache";
import { UtilIssue } from "../util/UtilIssue";
import { ACMetricsLogger } from "../util/ACMetricsLogger";


export type TabChangeType = {
    tabId: number
    changeInfo: chrome.tabs.TabChangeInfo
    tab: chrome.tabs.Tab
}

type eLevel = "Violation" | "Needs review" | "Recommendation";

export function issueBaselineMatch(baselineIssue: {ruleId: string, reasonId:string, path: { dom: string}, messageArgs: string[]}, issue: IIssue) {
    return baselineIssue.ruleId === issue.ruleId
        && baselineIssue.reasonId === issue.reasonId
        && baselineIssue.path.dom === issue.path.dom
        && JSON.stringify(baselineIssue.messageArgs) === JSON.stringify(issue.messageArgs);
}

class BackgroundController extends Controller {
    ///////////////////////////////////////////////////////////////////////////
    ///// PUBLIC API //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    ///// General extension functions /////////////////////////////////////////

    /**
     * Get the tab id of the caller
     */
    public async getTabId(senderTabId?: number) : Promise<number> {
        return this.hook("getTabId", null, async () => {
            return senderTabId!;
        });
    }

    
    private sync = Promise.resolve();
    private metrics = new ACMetricsLogger("ac-extension");

    

    /***********************************************************
     * WebSocket components for AI building blocks
     */

    // Use http or https based on the WebSocket URL
    //const request = url.startsWith('wss://') ? https.request(requestOptions) : http.request(requestOptions);

    // const token = 'd3N1c2VyOjFBKmIzJmNEJGVGZ0hAa1RrPzlDdjVpRFJHQFIhaA==';
    // url with token
    // const url = `wss://rms-proxy-prod.xbh3fvfhmve.us-south.codeengine.appdomain.cloud?token=d3N1c2VyOjFBKmIzJmNEJGVGZ0hAa1RrPzlDdjVpRFJHQFIhaA==
    
    // In our plain JavaScript file, dispatch the custom event with the message data.
    public sendResponseMessage = (message: string) => {
        console.log("In function sendResponseMessage with message = \n", message);
        message = this.jsonResponse(message);
        const event = new CustomEvent('my-custom-event', { detail: message });
        window.dispatchEvent(event);
    };

     // const aiHelp = {
        //     "inaccessible_dom": "<svg viewBox='0 0 600 400' width='0' height='0' xmlns:xlink='http://www.w3.org/1999/xlink'><defs><filter id='protanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='deuteranopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='tritanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter></defs></svg>",
        //     "accessible_dom": "<svg viewBox='0 0 600 400' width='0' height='0' xmlns:xlink='http://www.w3.org/1999/xlink' aria-hidden='true'><defs><filter id='protanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='deuteranopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='tritanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter></defs></svg>",
        //     "accessible_source": "import React from 'react'; function AccessibleSVG() { return ( <svg viewBox='0 0 600 400' width='0' height='0' xmlns:xlink='http://www.w3.org/1999/xlink' aria-hidden='true'><defs><filter id='protanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='deuteranopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='tritanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter></defs></svg> ); } export default AccessibleSVG;",
        //     "change_summary": "The original SVG element was inaccessible because it had no accessible name. To fix this, I added the aria-hidden attribute to the SVG element and set it to true, indicating that the element is not visible, perceivable, or interactive to users. This change makes the SVG element accessible by providing a clear indication of its purpose.",
        //     "disclaimer": "Please note that while we aim to provide accurate and helpful information, the use of AI-generated content is at your own risk, and IBM does not assume any liability for outcomes or actions taken based on this content."
        // }

    public jsonResponse(message:string) {
        console.log("************ Start jsonResponse **************");
        console.log("message = \n", message);
        let jsonObj = JSON.parse(message);
        console.log("jsonObj = \n", jsonObj);
        let response = 
            {
                "inaccessible_dom":jsonObj.data.input_dom, 
                "accessible_dom":jsonObj.data.accessible_dom,
                "accessible_source":jsonObj.data.accessible_source,
                "change_summary":jsonObj.data.change_summary,
                "disclaimer": "Please note that while we aim to provide accurate and helpful information, the use of AI-generated content is at your own risk, and IBM does not assume any liability for outcomes or actions taken based on this content."
            }
        console.log("response = ", response);
        const responseStr = JSON.stringify(response);
        console.log("responseStr = ", responseStr);
        console.log("************ End jsonResponse **************")
        return responseStr;
    }

    public connect(promptJSON: string): any {
        console.log("File: BackgroundController.ts Func: connect");
        let webSocket = new WebSocket('wss://rms-proxy-prod.xbh3fvfhmve.us-south.codeengine.appdomain.cloud?token=d3N1c2VyOjFBKmIzJmNEJGVGZ0hAa1RrPzlDdjVpRFJHQFIhaA==');
        this.waitForWebSocketConnection(webSocket)
        .then(() => {
            console.log('WebSocket connection established!');
            console.log("promptJSON in connect: \n", promptJSON);
            this.sendMessage(promptJSON, webSocket);
            return webSocket;
        })
        .catch((error: any) => {
            console.error('Error establishing WebSocket connection:', error);
            return error;
        });
        /* Example input to the AI proxy server
        {
            "api": "/rms/api/V2/watsonx/checker_help",
            "data": {
            "dom": "<svg viewBox=\"0 0 600 400\" width=\"0\" height=\"0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"><defs><filter id=\"protanopia\"><feColorMatrix in=\"SourceGraphic\" type=\"matrix\" values=\"0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0\"></feColorMatrix></filter><filter id=\"deuteranopia\"><feColorMatrix in=\"SourceGraphic\" type=\"matrix\" values=\"0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0\"></feColorMatrix></filter><filter id=\"tritanopia\"><feColorMatrix in=\"SourceGraphic\" type=\"matrix\" values=\"0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0\"></feColorMatrix></filter></defs></svg>",
            "wcg": "1.1.1",
            "failure": "The SVG element has no accessible name",
            "whatToDo": "What to do Ensure the _non-decorative_ SVG element has an _accessible name_ that is not empty: * Add an `aria-labelledby` attribute to the element that points to visible text on the page that is a meaningful label. * **Or**, add an `aria-label` attribute to the element. * **Or**, add a direct child `<title>` element. * **Or**, add an `xlink:title` attribute on a link. * **Or**, for text container elements, add the text content. * **Or**, only if the design cannot have a visible label, use the `title` attribute to provide a label. As appropriate, ensure the _non-decorative_ SVG element has an _accessible description_ that is not empty, in the following priority: * Add an `aria-describedby` attribute to the element that points to visible text on the page that is a meaningful description. * **Or**, add a direct child `<desc>` element. * **Or**, for text container elements, add the text content. * **Or**, add a direct child `<title>` element that provides a tooltip, when ARIA label attributes are used to provide the accessible name. * **Or**, add a `xlink:title` attribute on a link, if not used to provide the accessible name. Ensure the _decorative_ SVG element use `aria-hidden` or `role=’none | presentation’` to provides a clear indication that the element is not visible, perceivable, or interactive to users. Note: The `aria-labelledby` and `aria-describedby` properties can reference the element on which they are given, in order to concatenate one of the other text alternatives with text from a separate element.",
            "references": [
                "https://www.ibm.com/able/requirements/requirements/#1_1_1",
                "https://www.w3.org/TR/graphics-aria/",
                "https://w3c.github.io/accname/#computation-steps",
                "https://w3c.github.io/graphics-aam/#mapping_role_table",
                "https://www.w3.org/TR/svg-aam-1.0/#mapping_role_table"
            ],
                "source_lang": "React.JS"
            }
        }
        */
        const pingJSON = {
            "api":"/ping",
            "data":{}
          };
        const ping = JSON.stringify(pingJSON); // Now jsonData is a valid JSON string

        webSocket.onopen = () => {
            console.log('websocket connection opened');
            this.keepAlive(ping, webSocket);
        };
        /* response back from the AI proxy server
        {
            "status": 200,
            "message": "Request successful",
            "timestamp": "2025-03-05T00:03:52.280Z",
            "meta": {
                "rms_api_version": "2.0.0",
                "model": "llama-3-405b-instruct",
                "model_url": "https://dataplatform.cloud.ibm.com/docs/content/wsj/analyze-data/fm-models.html?context=wx#llama-3-1",
                "request_duration_ms": 32712
            },
            "data": {
                "accessible_dom": "<svg viewBox='0 0 600 400' width='0' height='0' xmlns:xlink='http://www.w3.org/1999/xlink' aria-hidden='true'><defs><filter id='protanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='deuteranopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='tritanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter></defs></svg>",
                "accessible_source": "import React from 'react'; function AccessibleSVG() { return ( <svg viewBox='0 0 600 400' width='0' height='0' xmlns:xlink='http://www.w3.org/1999/xlink' aria-hidden='true'><defs><filter id='protanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='deuteranopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='tritanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter></defs></svg> ); } export default AccessibleSVG;",
                "change_summary": "The original SVG element was inaccessible because it had no accessible name. To fix this, I added the aria-hidden attribute to the SVG element and set it to true, indicating that the element is not visible, perceivable, or interactive to users. This change makes the SVG element accessible by providing a clear indication of its purpose.",
                "input_dom": "<svg viewBox='0 0 600 400' width='0' height='0' xmlns:xlink='http://www.w3.org/1999/xlink'><defs><filter id='protanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='deuteranopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='tritanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter></defs></svg>"
            },
            "input_token_count": 1170,
            "generated_token_count": 801,
            "disclaimer": "Please note that while we aim to provide accurate and helpful information, the use of AI-generated content is at your own risk, and IBM does not assume any liability for outcomes or actions taken based on this content."
        }
        */
        webSocket.onmessage = (event:any) => {
            const jsonData = event.data;
            const jsonDataObj = JSON.parse(jsonData);
            if (jsonDataObj !== undefined && jsonDataObj.meta !== undefined && jsonDataObj.meta.rms_api_version !== undefined) {
                // extract needed data from AI server JSON response
                // construct JSON of needed data to send to help.js
                this.adjustJsonData(event);
                console.log("Response message from server: \n", event.data);
                this.sendResponseMessage(event.data); // send needed data JSON to help.js
            }
            if (jsonDataObj.api !== undefined) {
                console.log("Ping message from server: \n", event.data);
                this.sendMessage(event.data, webSocket);
            }
        };

        webSocket.onclose = () => {
            console.log('websocket connection closed');
        };

        webSocket.onerror = (event) => {
            console.error("WebSocket error:", event);
        };
    }

    disconnect(webSocket:WebSocket) {
        if (webSocket) {
            webSocket.close();
            console.log('websocket connection disconnected');
        }
    }

    adjustJsonData(evt: any) {
        // data needed from the response
        // 1. data.input_dom
        // 2. data.accessible_dom
        // 3. data.accessible_source
        // 4. data.change_summary
        // 5. disclaimer
        const jsonData = evt.data;
        const jsonDataObj = JSON.parse(jsonData);
        if (jsonDataObj) {
            const aiHelpJsonData = {
                inaccessible_dom: jsonDataObj.data.input_dom,
                accessible_dom: jsonDataObj.data.accessible_dom,
                accessible_source: jsonDataObj.data.accessible_source,
                change_summary: jsonDataObj.data.change_summary,
                disclaimer: jsonDataObj.disclaimer
            };
            console.log(aiHelpJsonData);
        }
        // send aiHelpJsonData to help.js
    }

    

    public sendMessage(message:string, webSocket:WebSocket) {
        // let messageData = message;
        console.log("in func sendMessage with message: ", message);
        if (webSocket) {
        //   const message = {
        //     type: "message",
        //     data: messageData
        //   };
      
          // Check if the WebSocket is not busy (e.g., no pending messages)
          
          if (webSocket.bufferedAmount === 0) {
            console.log("Buffered amt 0 so can send message");
            // webSocket.send(JSON.stringify(message));
            webSocket.send(message);
          } else {
            // If busy, wait for the buffer to clear
            console.log("webSocket busy so add listener to wait for buffer to clear");
            webSocket.addEventListener("bufferedamountlow", () => {
            // webSocket.send(JSON.stringify(message));
            webSocket.send(message);
            });
          }
        } else {
            console.log("Can't send message NO websocket");
        }
    }

    keepAlive(message:string, webSocket:WebSocket) {
        const TEN_SECONDS_MS = 10 * 1000;
        const keepAliveIntervalId = setInterval(
            () => {
                if (webSocket) {
                    this.sendMessage(message, webSocket);
                } else {
                    clearInterval(keepAliveIntervalId);
                }
            },
            // It's important to pick an interval that's shorter than 30s, to
            // avoid that the service worker becomes inactive.
            TEN_SECONDS_MS
        );
    }

    waitForWebSocketConnection(socket:WebSocket) {
        return new Promise<void>((resolve, reject) => {
          if (socket.readyState === WebSocket.OPEN) {
            resolve();
          } else {
            const onOpen = () => {
              socket.removeEventListener('open', onOpen);
              resolve();
            };
      
            const onError = (event:any) => {
              socket.removeEventListener('error', onError);
              reject(event);
            };
      
            socket.addEventListener('open', onOpen);
            socket.addEventListener('error', onError);
          }
        });
    }
      
    /***********************************************************
     * END of WebSocket components for AI building blocks
     ***********************************************************/

    /**
     * Used by the tab controller to initialize the tab when the first scan is performmed on that tab
     * @param tabId 
     * @returns 
     */
    public async initTab(tabId: number) {
        // Only allow one init at a time
        await this.sync;
        return this.sync = this.hook("initTab", tabId, async () => {
            // Determine if the engine is already loaded with this archive
            let settings = await this.getSettings();
            let archiveId = settings.selected_archive.id;
            let isAlreadyLoaded = await myExecuteScript2(tabId, (archiveId: string) => {
                return typeof (window as any).aceIBMa !== "undefined" 
                    && (window as any).aceIBMa.archiveId === archiveId;
            }, [archiveId]);
            if (isAlreadyLoaded) {
                return;
            }

            // Move any existing object out of the way
            await myExecuteScript2(tabId, () => {
                // delete (window as any).aceIBMa;
                if (typeof (window as any).ace !== "undefined") {
                    (window as any).aceIBMaTemp = (window as any).ace;
                }
            });

            // Switch to the appropriate engine for this archiveId
            let engineFile = await EngineCache.getEngine(archiveId);
            await new Promise((resolve, reject) => {
                myExecuteScript({
                    target: { tabId: tabId, frameIds: [0] },
                    files: [engineFile]
                }, function (res: any) {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError.message);
                    }
                    resolve(res);
                });
            });

            // Move ace to aceIBMa and move the old ace back
            await myExecuteScript2(tabId, () => {
                ((window as any).aceIBMa = (window as any).ace);
                if (typeof (window as any).aceIBMaTemp !== "undefined") {
                    (window as any).ace = (window as any).aceIBMaTemp;
                    delete (window as any).aceIBMaTemp;
                } else {
                    delete (window as any).ace;
                }
            })
        });
    }


    public async addTabChangeListener(listener: ListenerType<TabChangeType>) {
        this.addEventListener(listener, `BG_onTabUpdate`);
    }

    public async getTabInfo(tabId: number) : Promise<chrome.tabs.Tab & { canScan: boolean }> {
        return this.hook("getTabInfo", tabId, async () => {
            let tab = await new Promise<chrome.tabs.Tab>(async (resolve2) => {
                let manifest = chrome.runtime.getManifest();
                if (manifest.manifest_version === 3) {
                    let retVal = await chrome.tabs.get(tabId!);
                    resolve2(retVal);
                } else {
                    chrome.tabs.get(tabId!, resolve2);
                }    
            });
            let canScan : boolean = await new Promise((resolve2, _reject) => {
                if (typeof tab.id === "undefined" || tab.id < 0) return resolve2(false);
                myExecuteScript({
                    target: { tabId: tab.id, frameIds: [0] },
                    func: () => (typeof (window as any).aceIBMa)
                }, function (res: any) {
                    resolve2(!!res);
                })
            });
            let retVal = { canScan, ...tab };
            return retVal;
        });
    }

    public async getScreenshot(tabId?: number) {
        return this.hook("getScreenshot", tabId, async () => {
            return await new Promise<string>((resolve, reject) => {
                //@ts-ignore
                chrome.tabs.captureVisibleTab((image:string) => {
                    resolve(image);
                    reject(new Error("Capture failed"));
                });
            });
        });
    }

     

    ///// Settings related functions /////////////////////////////////////////
    /**
     * Global state for the extension
     */
    public async getSessionState() : Promise<ISessionState> {
        let retVal = (await this.hook("getSessionState", null, async () => {
            let retVal = await new Promise<ISessionState>((resolve, _reject) => {
                (chrome.storage as any).session.get("SESSION_STATE", async function (result: { SESSION_STATE?: ISessionState}) {
                    result.SESSION_STATE = result.SESSION_STATE || {
                        tabStoredCount: {}
                    }
                    result.SESSION_STATE.tabStoredCount = result.SESSION_STATE.tabStoredCount || {};
                    resolve(result.SESSION_STATE as ISessionState);
                });
            })
            return retVal;
        }))!;
        return retVal;
    }

    /**
     * Set settings for the extension
     */
    public async setSessionState(sessionState: ISessionState) : Promise<ISessionState> {
        return this.hook("setSessionState", sessionState, async () => {
            await new Promise<ISessionState>((resolve, _reject) => {
                (chrome.storage as any).session.set({ "SESSION_STATE": sessionState }, async function () {
                    resolve(sessionState!);
                });
            });
            this.notifyEventListeners("BG_onSessionState", -1, sessionState);
            return sessionState;
        });
    }
    

    /**
     * Set stored scan count
     */
    public async setStoredScanCount(info: { tabId: number, count: number }) : Promise<ISessionState> {
        return this.hook("setStoredScanCount", info, async () => {
            let { tabId, count }: {tabId: number, count: number } = info;
            let sessionState = await this.getSessionState();
            if (count === 0) {
                delete sessionState.tabStoredCount[tabId];
            } else {
                sessionState.tabStoredCount[tabId] = count;
            }
            return await this.setSessionState(sessionState);
        });
    }
    
    /**
     * Get option settings for the extension
     */
    public async getSettings() : Promise<ISettings> {
        let myThis = this;
        let retVal = (await this.hook("getSettings", null, async () => {
            let retVal = await new Promise<ISettings>((resolve, _reject) => {
                chrome.storage.local.get("OPTIONS", async function (result: { OPTIONS?: ISettings}) {
                    let retSett = await myThis.validateSettings(result.OPTIONS);
                    resolve(retSett);
                });
            })
            return retVal;
        }))!;
        return retVal;
    }

    /**
     * Set option settings for the extension
     */
    public async setSettings(settings: ISettings) : Promise<ISettings> {
        return this.hook("setSettings", settings, async () => {
            await new Promise<ISettings>((resolve, _reject) => {
                chrome.storage.local.set({ "OPTIONS": settings }, async function () {
                    resolve(settings!);
                });
            });
            this.notifyEventListeners("BG_onSettings", -1, settings);
            return settings;
        });
    }

    /**
     * Listener for options settings
     */
    public async addSettingsListener(listener: ListenerType<ISettings>) {
        this.addEventListener(listener, `BG_onSettings`);
    }

    public async addIgnoreUpdateListener(listener: ListenerType<{url: string, issues: IIssue[]}>) {
        this.addEventListener(listener, `BG_IgnoreUpdateListener`);
    }

    /**
     * Listener for session state
     */
    public async addSessionStateListener(listener: ListenerType<ISessionState>) {
        this.addEventListener(listener, `BG_onSessionState`);
    }
    /**
     * Get the archive definitions
     */
    public async getArchives() : Promise<IArchiveDefinition[]> {
        return this.hook("getArchives", null, async () => {
            return EngineCache.getArchives();
        });
    }

    /**
     * Get ignore info
     */
    public async getIgnore(url: string) : Promise<IIssue[]> {
        // let myThis = this;
        let retVal = (await this.hook("getIgnore", url, async () => {
            let retVal = await new Promise<IIssue[]>((resolve, _reject) => {
                chrome.storage.local.get("IGNORE_LIST", async function (result: { IGNORE_LIST?: { [url: string]: IIssue[] }}) {
                    resolve(result.IGNORE_LIST?.[url] || []);
                });
            })
            return retVal || [];
        }))!;
        return retVal || [];
    }

    /**
     * Toggle ignore
     */
    public async setIgnore(url: string, issues:IIssue[], bIgnore: boolean) : Promise<void> {
        return this.hook("setIgnore", {url, issues, bIgnore}, async () => {
            let modifyList = await this.getIgnore(url);
            for (const issue of issues) {
                let idx = modifyList.findIndex((baselineIssue: { ruleId: string; reasonId: string; path: { dom: string; }; messageArgs: string[]; }) => issueBaselineMatch(baselineIssue, issue));
                if (bIgnore && idx === -1) {
                    // We want to set it and it's not there, so add it
                    modifyList.push(issue);
                } else if (!bIgnore && idx !== -1) {
                    // We want to clear it and it is there, so remove it
                    modifyList.splice(idx, 1);
                } // else, it's already in the right state, so skip
            }
            await new Promise<void>((resolve, _reject) => {
                chrome.storage.local.get("IGNORE_LIST", async function (result: { IGNORE_LIST?: { [url: string]: IIssue[] }}) {
                    let ignoreDict = (result.IGNORE_LIST || {});
                    if (ignoreDict.length) {
                        // Ignore list was created wrong, it should be an object, not an array
                        ignoreDict = {};
                    }
                    ignoreDict[url] = modifyList;
                    chrome.storage.local.set({ IGNORE_LIST: ignoreDict }, async function () {
                        resolve();
                    });
                });
            });
            this.notifyEventListeners("BG_IgnoreUpdateListener", -1, { url, issues: modifyList });
        });
    }



    /**
     * Get the rulesets for the currently loaded engine
     */
    public async getRulesets(contentTabId: number) : Promise<IRuleset[]> {
        return this.hook("getRulesets", contentTabId, async () => {
            await this.initTab(contentTabId!);
            // let isLoaded = await this.isEngineLoaded(senderTabId);
            // isLoaded && console.log("Engine loaded", senderTabId) || console.log("Engine not loaded", senderTabId);
            return await myExecuteScript2(contentTabId, () => {
                let checker = new (<any>window).aceIBMa.Checker();
                return checker.rulesets;
            });
        });
    }

    public async getArchiveDefForVersion(version: string) {
        return this.hook("getArchiveDefForVersion", version, async () => {
            return EngineCache.getArchiveDefinitionByVersion(version);
        });
    }
    ///// Scan related functions /////////////////////////////////////////

    public async requestScan(tabIds: {toolTabId: number, contentTabId: number}) {
        return this.hook("requestScan", tabIds, async () => {
            const { toolTabId, contentTabId } = tabIds;
            getDevtoolsController(toolTabId, false, "remote").setScanningState("initializing");
            await this.initTab(contentTabId!);
            // We want this to execute after the message returns
            (async () => {
                let settings = await this.getSettings();
                getDevtoolsController(toolTabId, false, "remote").setScanningState("running");
                let report : IReport = await myExecuteScript2(contentTabId, (settings: ISettings) => {
                    let checker = new (<any>window).aceIBMa.Checker();
                    if (Object.keys(checker.engine.nlsMap).length === 0) {
                        // Some problem grabbing messages for given locale. Let's try to get en-US data out of the engine
                        for (const ruleId in checker.engine.ruleMap) {
                            const rule = checker.engine.ruleMap[ruleId];
                            checker.engine.nlsMap[ruleId] = rule.messages["en-US"];
                            checker.engine.nlsMap[ruleId][0] = checker.engine.nlsMap[ruleId].group;
                            checker.engine.helpMap[ruleId] = {}
                            for (const reasonId in rule.help["en-US"]) {
                                checker.engine.helpMap[ruleId][reasonId] = `/en-US/${rule.help["en-US"][reasonId]}`;
                            }
                        }
                    }
                    return checker.check(window.document, [settings.selected_ruleset.id, "EXTENSIONS"]).then((report: IReport) => {
                        try {
                            if (Object.keys(report.nls).length === 0) {
                                // Some problem grabbing messages for given locale. Let's try to get en-US data out of the engine
                                for (const ruleId in checker.engine.ruleMap) {
                                    const rule = checker.engine.ruleMap[ruleId];
                                    report.nls[ruleId] = rule.messages["en-US"];
                                    report.nls[ruleId][0] = report.nls[ruleId].group;
                                }
                            }
                            for (const result of report.results) {
                                if (!(result.value[1] === "PASS" && result.value[0] !== "INFORMATION")) {
                                    // Save all of this for backward compatibility
                                    let engineHelp = checker.engine.getHelp(result.ruleId, result.reasonId, settings.selected_archive.id);
                                    let version = settings.selected_archive.version || "latest";
                                    if (process.env.engineEndpoint && process.env.engineEndpoint.includes("localhost")) {
                                        engineHelp = engineHelp.replace(/able.ibm.com/,"localhost:9445");
                                    } else {
                                        engineHelp = engineHelp.replace(/https\:\/\/able\.ibm\.com\/rules\/archives\/[^/]*\/doc\//, `https://unpkg.com/accessibility-checker-engine@${version}/help/`);
                                        if (engineHelp.includes("//able.ibm.com/")) {
                                            engineHelp = engineHelp.replace(/https\:\/\/able.ibm.com\/rules\/tools\/help\//, `https://unpkg.com/accessibility-checker-engine@${version}/help/en-US/`)+".html";
                                        }
                                    }
                                    let minIssue = {
                                        message: result.message,
                                        snippet: result.snippet,
                                        value: result.value,
                                        reasonId: result.reasonId,
                                        ruleId: result.ruleId,
                                        messageArgs: result.messageArgs
                                    };
                                    result.help = `${engineHelp}#${encodeURIComponent(JSON.stringify(minIssue))}`;
                                }
                                delete result.node;
                            }

                            // Process report before returning it to avoid large message passing of pass messages
                            if (report) {
                                let valueMap: { [key: string]: { [key2: string]: string } } = {
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
                                    },
                                    "INFORMATION": {
                                        "POTENTIAL": "Needs review",
                                        "FAIL": "Violation",
                                        "PASS": "Pass",
                                        "MANUAL": "Recommendation"
                                    }
                                };
                            
                                let valueToStringSingular = (value: IssueValue) => {
                                    return valueMap[value[0]][value[1]];
                                }
                                for (const result of report.results) {
                                    if (result.ruleTime > 50) {
                                        console.info(`[PERF: ${result.ruleId}] ${result.ruleTime}`);
                                    }
                                }
                                // let passResults = [];
                                let remainResults = [];
                                let counts = {
                                    "Violation": 0,
                                    "Needs review": 0,
                                    "Recommendation": 0,
                                    "Pass": 0,
                                    total: 0
                                };
                                let xpaths : string[] = report.results.map((result) => result.path.dom);                    
                                report.testedUniqueElements = Array.from(new Set(xpaths)).length;
                                for (const result of report.results) {
                                    let sing = valueToStringSingular(result.value);
                                    ++counts[sing as eLevel];
                                    ++counts.total;
                                    if (result.value[1] === "PASS" && result.value[0] !== "INFORMATION") {
                                        // passResults.push(result);
                                    } else {
                                        remainResults.push(result);
                                    }
                                }
                                report.results = remainResults;
                                report.counts = counts;
                            }

                            return report;
                        } catch (err) {
                            console.error(err);
                            return null;
                        }
                    });
                }, [settings]);

                // Remove issues that are essentially equivalent to the user (same path, rule, reason, and message)
                for (let idx=0; idx<report.results.length; ++idx) {
                    for (let checkIdx=0; checkIdx < idx; ++checkIdx) {
                        if (issueBaselineMatch(report.results[idx], report.results[checkIdx])) {
                            report.results.splice(idx--, 1);
                            break;
                        }
                    }
                }
                

                console.info(`[INFO]: Scanning complete in ${report.totalTime}ms with ${report.ruleTime}ms in rules`);
                let browser = (navigator.userAgent.match(/\) ([^)]*)$/) || ["", "Unknown"])[1];
                this.metrics.profileV2(report.totalTime, browser, settings.selected_ruleset.id);
                this.metrics.sendLogsV2();
                getDevtoolsController(toolTabId, false, "remote").setScanningState("processing");
                if (report) {
                    report.results.sort((resultA, resultB) => {
                        let valueA = UtilIssue.valueToStringSingular(resultA.value);
                        let valueB = UtilIssue.valueToStringSingular(resultB.value);
                        if (valueA === valueB) return 0;
                        if (valueA === "Violation") return -1;
                        if (valueB === "Violation") return 1;
                        if (valueA === "Needs review") return -1;
                        if (valueB === "Needs review") return 1;
                        if (valueA === "Recommendation") return -1;
                        if (valueB === "Recommendation") return 1;
                        return 0;
                    });
                }
                
               
                // console.info("JOHO HERE");
                // this.connect();
                
                // this.keepAlive();
                // // sendMessage(report.results[0].message);
                // // sendMessage(JSON.stringify(report.results[0]));
                // this.sendMessage("Hello from Joho");
                // // disconnect();
               
                

                getDevtoolsController(toolTabId, false, "remote").setReport(report);
                getDevtoolsController(toolTabId, false, "remote").setScanningState("idle");
            })();
            return {};
        });
    }

    ///////////////////////////////////////////////////////////////////////////
    ///// PRIVATE API /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    constructor(type: eControllerType) {
        super(type, { type: "background", tabId: -1 }, "BG");
        if (type === "local") {
            let self = this;

            const listenMsgs : { 
                [ msgId: string ] : (msgBody: IMessage<any>, senderTabId?: number) => Promise<any>
            }= {
                "BG_getSessionState": async () => self.getSessionState(),
                "BG_setSessionState": async (msgBody) => {
                    return self.setSessionState(msgBody.content);
                },
                "BG_setStoredScanCount": async (msgBody) => {
                    return self.setStoredScanCount(msgBody.content);
                },
                "BG_getSettings": async () => self.getSettings(),
                "BG_getArchives": async () => self.getArchives(),
                "BG_getIgnore": async (msgBody) => self.getIgnore(msgBody.content),
                "BG_setIgnore": async (msgBody) => self.setIgnore(msgBody.content.url, msgBody.content.issues, msgBody.content.bIgnore),

                "BG_getTabId": async (_a, senderTabId) => self.getTabId(senderTabId),
                "BG_getRulesets": async (msgBody) => self.getRulesets(msgBody.content),
                "BG_requestScan": async (msgBody) => self.requestScan(msgBody.content),
                "BG_setSettings": async (msgBody) => {
                    let updSettings = await self.validateSettings(msgBody.content || undefined);
                    return self.setSettings(updSettings);
                },
                "BG_initTab": async (msgBody) => {
                    if (msgBody.content !== null) {
                        return self.initTab(msgBody.content);
                    }
                },
                "BG_getTabInfo": async(msgBody, senderTabId) => {
                    return self.getTabInfo((msgBody && msgBody.content) || senderTabId!)
                },
                "BG_getScreenshot": async(msgBody, senderTabId) => {
                    return self.getScreenshot((msgBody && msgBody.content) || senderTabId!)
                },
                "BG_getArchiveDefForVersion": async(msgBody) => {
                    return self.getArchiveDefForVersion(msgBody.content);
                }
            }

            // Hook the above definitions
            this.hookListener(
                Object.keys(listenMsgs),
                async (msgBody: IMessage<any>, senderTabId?: number) => {
                    let f = listenMsgs[msgBody.type];
                        return f ? f(msgBody,senderTabId) : null;
                }
            )

            // Extra
            chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

                self.notifyEventListeners<TabChangeType>("BG_onTabUpdate", tabId, {
                    tabId, changeInfo, tab
                })
            });

            CommonMessaging.initRelays();
        }
    }

    /**
     * Calculate the default settings if settings don't exist
     */
    private async validateSettings(inSettings?: ISettings) : Promise<ISettings> {
        let settings : any = inSettings || {};
        if (!("tabStopLines" in settings)) { (settings as ISettings).tabStopLines = true; }
        if (!("tabStopOutlines" in settings)) { (settings as ISettings).tabStopOutlines = false; }
        if (!("tabStopAlerts" in settings)) { (settings as ISettings).tabStopAlerts = true; }
        if (!("tabStopFirstTime" in settings)) { (settings as ISettings).tabStopFirstTime = true; }
        if (!("checkerViewAwareFirstTime" in settings)) { (settings as ISettings).checkerViewAwareFirstTime = true; }

        // Determine which archive we're scanning with
        let archiveId = Config.defaultArchiveId + "";
        const archives = await EngineCache.getArchives();
        const validArchive = ((id: string) => id && archives.some(archive => archive.id === id));

        if (!validArchive(archiveId)) archiveId = "latest";
        if (settings && settings.selected_archive && validArchive(settings.selected_archive.id)) {
            archiveId = settings.selected_archive.id;
        }
        settings.selected_archive = archives.filter(archive => archive.id === archiveId)[0];

        // Determine which policy we're scanning with
        let policyId: string = settings.selected_archive.policies[0].id;
        const validPolicy = ((id: string) => id && (settings as ISettings).selected_archive.rulesets.default.some((policy) => policy.id === id));
        if (!validPolicy(policyId)) policyId = "IBM_Accessibility";
        if (settings && settings.selected_ruleset && validPolicy(settings.selected_ruleset.id)) {
            policyId = settings.selected_ruleset.id;
        }
        settings.selected_ruleset = {
            id: policyId
        }
        return settings as ISettings;
    }
}

function myExecuteScript(
    params: any, 
    pCB?: (any) | undefined): void
{
    if (chrome && chrome.scripting && chrome.scripting.executeScript) {
        chrome.scripting.executeScript(params, pCB);
    } else {
        if (params.func) {
            let argStr = "";
            if (params.args) {
                argStr = JSON.stringify(params.args, null, 2);
                argStr = argStr.substring(1,argStr.length-1);
            }
            chrome.tabs.executeScript(
                params.target.tabId as number,
                { 
                    code: `(${params.func.toString()})(${argStr})`,
                    frameId: params.target.frameIds[0],
                    matchAboutBlank: true
                },
                (res) => {
                    if (!res) {
                        pCB && pCB(res);
                    } else {
                        pCB && pCB(res.map(item => ({ result: item })));
                    }
                }
            )
        } else {
            chrome.tabs.executeScript(
                params.target.tabId as number,
                { 
                    file: params.files[0],
                    frameId: params.target.frameIds[0],
                    matchAboutBlank: true
                },
                (res) => {
                    if (params.files[0].includes("ace.js")) {
                        chrome.tabs.executeScript(
                            params.target.tabId as number,
                            { 
                                // The calling code moves it from ace to aceIBMa, so don't do it here or it confuses the calling code
                                code: `window.ace = ace`,
                                frameId: params.target.frameIds[0],
                                matchAboutBlank: true
                            },
                            (res) => {
                                if (!res) {
                                    pCB && pCB(res);
                                } else {
                                    pCB && pCB(res.map(item => ({ result: item })));
                                }
                            })
                    } else {
                        pCB && pCB(res.map(item => ({ result: item })));
                    }
                })
        }
    }
}

async function myExecuteScript2<T>(tabId: number, func: any, args?: any[]) : Promise<T> {
    return await new Promise((resolve, reject) => {
        myExecuteScript({
            target: { tabId: tabId, frameIds: [0] },
            args: args,
            func: func
        }, function (res: any) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                reject(chrome.runtime.lastError.message);
            }
            resolve(res[0].result);
        })
    });
}

let singleton : BackgroundController | null = null;
export function getBGController(type?: eControllerType) {
    if (!singleton) {
        singleton = new BackgroundController(type || "remote");
    }
    return singleton;
}



