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

import { IMessage } from "../interfaces/interfaces";
import Config from "../util/config";

export class CommonMessaging {
    public static addMsgListener(
        listener: (message: IMessage<any>, senderTabId?: number) => Promise<any> | void, 
        types: string[], 
        listeningTabId?: number) : void 
    {
        CommonMessaging.addMsgListenerHelp(async (message: IMessage<any>, senderTabId?: number) => {
            if (message.blob_url) {
                let blob_url = message.blob_url;
                let blob = await fetch(blob_url).then(r => r.blob());
                let newMessage = JSON.parse(await blob.text());
                return listener(newMessage, senderTabId);
            } else {
                return listener(message, senderTabId);
            }
        }, types, listeningTabId);
    }

    public static addMsgListenerHelp(
        listener: (message: IMessage<any>, senderTabId?: number) => Promise<any> | void,
        types: string[], 
        listeningTabId?: number) : void 
    {
        chrome.runtime.onMessage.addListener((message: IMessage<any>, sender, sendResponse) => {
            // If we're listening to tabId and tabId isn't specified, ignore it
            if (listeningTabId && message.dest.type !== "extension" && listeningTabId !== message.dest.tabId) {
                return null;
            }
            // Note - only allow background to listen to all for the purposes of routing
            // If two listeners respond, the first wins, which causes trouble
            if (types.includes(message.type)) {
                let response = listener(message, sender && sender.tab && sender.tab.id);
                if (response && response.then) {
                    response.then((result) => {
                        if (typeof result !== "string") {
                            result = JSON.stringify(result);
                        }
                        sendResponse(result);
                        return result;
                    }).catch(err => {
                        sendResponse(JSON.stringify({ error: err }));
                        return true;
                    });

                    let isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;
                    if (isFirefox) {
                        return response;
                    } else {
                        return true;
                    }
                } else if (response) {
                    sendResponse(response);
                } else {
                    return null;
                }
            }
            return null;
        });
    }

    public static send(message: IMessage<any>, retry?: number): Promise<any> {
        let myMessage : IMessage<any> = JSON.parse(JSON.stringify(message || {}));
        return new Promise((resolve, reject) => {
            let callback = (res: any) => {
                // setTimeout(() => {
                    Config.DEBUG && console.log("--",res);
                    if (chrome.runtime.lastError) {
                        let shouldRetry = false;
                        if (chrome.runtime.lastError.message?.includes("Receiving end does not exist.")) {
                            shouldRetry = true;
                        }
                        // Retry 3 times if the receiver doesn't exist yet (might still be initializing)
                        if (shouldRetry && (!retry || retry <= 3)) {
                            setTimeout(async () => {
                                resolve(await this.send(message, (retry || 0) + 1));
                            },0);
                        } else {
                            reject({
                                arg: message,
                                error: chrome.runtime.lastError.message
                            });
                        }
                    } else {
                        if (res) {
                            if (typeof res === "string") {
                                try {
                                    res = JSON.parse(res);
                                } catch (e) {}
                            }
                            resolve(res);
                        } else {
                            resolve(null);
                        }
                    }
                // }, 0);
            };
            if (message.dest.type === "contentScript") {
                Config.DEBUG && console.log("sendTab", myMessage);
                chrome.tabs.sendMessage(message.dest.tabId, myMessage, callback);
            } else {
                Config.DEBUG && console.log("sendOther", myMessage);
                chrome.runtime.sendMessage(myMessage, callback);
            }
        });
    }

    // public static initRelays() {
    //     CommonMessaging.addListener("ALL", async (message: IMessage) => {
    //         if (message.dest !== "background") {
    //             return CommonMessaging.send(message);
    //         } else {
    //             return null;
    //         }
    //     });
    // }
}
