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

export class CommonMessaging {

    public static addListener(type: string, listener: (message: IMessage) => Promise<any> | void) : void {
        CommonMessaging.addListenerHelp(type, async (message: IMessage) => {
            if (message.blob_url) {
                let blob_url = message.blob_url;
                let blob = await fetch(blob_url).then(r => r.blob());
                let newMessage = JSON.parse(await blob.text());
                return listener(newMessage);
            } else {
                return listener(message);
            }
        });
    }

    public static addListenerHelp(type: string, listener: (message: IMessage) => Promise<any> | void) : void {
        chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
            // Note - only allow background to listen to all for the purposes of routing
            // If two listeners respond, the first wins, which causes trouble
            if (message.type === type || (type === "ALL" && message.dest !== "background")) {
                let response = listener(message);
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

    public static send(message: IMessage): Promise<any> {
        let myMessage : IMessage = JSON.parse(JSON.stringify(message || {}));
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let callback = (res: any) => {
                    setTimeout(() => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError.message);
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
                    }, 0);
                };
                if (message.destTab) {
                    console.log("sendTab", message);
                    chrome.tabs.sendMessage(message.destTab!, myMessage, callback);
                } else {
                    console.log("sendOther", message);
                    chrome.runtime.sendMessage(myMessage, callback);
                }
            }, 0);
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
