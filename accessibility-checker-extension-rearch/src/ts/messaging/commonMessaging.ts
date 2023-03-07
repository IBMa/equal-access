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

declare var browser: any;

import { IMessage } from "../interfaces/interfaces";
import Config from "../util/config";

export class CommonMessaging {
    public static addMsgListener<inT, retT>(
        listener: (message: IMessage<inT>, senderTabId?: number) => Promise<retT> | void, 
        types: string[], 
        listeningTabId?: number) : void 
    {
        CommonMessaging.addMsgListenerHelp(async (message: IMessage<inT>, senderTabId?: number) => {
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

    public static listenerMetas : any[] = [];
    public static addMsgListenerHelp<inT, retT>(
        listener: (message: IMessage<inT>, senderTabId?: number) => Promise<retT> | void,
        types: string[], 
        listeningTabId?: number) : void 
    {
        let thisListener = (message: IMessage<inT>, sender: chrome.runtime.MessageSender, sendResponse: any) => {
            // If we're listening to tabId and tabId isn't specified, ignore it
            if (listeningTabId && message.dest.type !== "extension" && listeningTabId !== message.dest.tabId) {
                return null;
            }
            // Note - only allow background to listen to all for the purposes of routing
            // If two listeners respond, the first wins, which causes trouble
            if (types.includes(message.type)) {
                Config.DEBUG && console.log("[DEBUG:onMessage]", message, sender);
                let response = listener(message, sender && sender.tab && sender.tab.id);
                if (response && response.then) {
                    response.then((result) => {
                        let resultStr: string;
                        if (typeof result !== "string") {
                            resultStr = JSON.stringify(result)
                        } else {
                            resultStr = result;
                        }
                        sendResponse(resultStr);
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
        }
        chrome.runtime.onMessage.addListener(thisListener);
        this.listenerMetas.push({ 
            types, 
            listeningTabId, 
            listener: thisListener
        });
    }

    public static removeMsgListeners(
        types: string[], 
        listeningTabId?: number) : void 
    {
        for (let idx=0; idx<this.listenerMetas.length; ++idx) {
            const listenerMeta = this.listenerMetas[idx];
            if (JSON.stringify(types) === JSON.stringify(listenerMeta.types) && listeningTabId === listenerMeta.listeningTabId) {
                chrome.runtime.onMessage.removeListener(listenerMeta.listener);
                this.listenerMetas.splice(idx--, 1);
            }
        }
    }

    public static send<inT, retT>(message: IMessage<inT>, retry?: number): Promise<retT | null> {
        Config.DEBUG && console.log("[DEBUG:send]", message, retry);
        let myMessage : IMessage<inT> = JSON.parse(JSON.stringify(message || {}));
        return new Promise((resolve, reject) => {
            try {
                let callback = (res: retT | string | null) => {
                    Config.DEBUG && console.log("[DEBUG:sendMessage:callback]", message, res);
                    // setTimeout(() => {
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
                                resolve(res as retT | null);
                            } else {
                                resolve(null);
                            }
                        }
                    // }, 0);
                };
                if (message.dest.type === "contentScript" && ((chrome && chrome.tabs) || (browser && browser.tabs))) {
                    if (chrome.tabs) {
                        Config.DEBUG && console.log("[DEBUG:chrome.tabs.sendMessage]", message.dest.tabId, myMessage);
                        chrome.tabs.sendMessage(message.dest.tabId, myMessage, callback);
                    } else if (browser.tabs) {
                        Config.DEBUG && console.log("[DEBUG:browser.tabs.sendMessage]", message.dest.tabId, myMessage);
                        browser.tabs.sendMessage(message.dest.tabId, myMessage, callback);
                    } else {
                        console.error("Unable to send message", myMessage);
                    }
                } else {
                    if (myMessage.dest.type !== "extension") {
                        // Need to relay these through the background
                        myMessage.dest.relay = true;
                    }
                    Config.DEBUG && console.log("[DEBUG:runtime.sendMessage]", myMessage);
                    chrome.runtime.sendMessage(myMessage, callback);
                }
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    }

    public static initRelays() {
        chrome.runtime.onMessage.addListener((message: IMessage<any>, _sender, _sendResponse) => {
            if (message.dest.type !== "extension" && message.dest.relay) {
                message.dest.relay = false;
                Config.DEBUG && console.log("[DEBUG:relay]",message);
                return CommonMessaging.send(message);
            }
            return null;
        });
        Config.DEBUG && console.log("[DEBUG:initRelays] Relay added");
    }
}
