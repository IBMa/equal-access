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
import { CommonMessaging } from "./commonMessaging";

/**
 * This class is to be used by the service workers to listen to and send messages
 */
export class BackgroundMessaging {
    public static addListener(type: string, listener: (message: IMessage) => Promise<any>) {
        CommonMessaging.addListener(type, listener);
    }

    public static send(message: IMessage): Promise<any> {
        let myMessage : IMessage = JSON.parse(JSON.stringify(message || {}));
        myMessage.src = "background";
        if (myMessage.dest === "tab") {
            if (!message?.destTab) {
                return Promise.reject("BackgroundMessaging: Destination tab not specified");
            } else {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        chrome.tabs.sendMessage(message.destTab!, myMessage, function(res) {
                        
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
                        });
                    }, 0);
                });
            }
        } else if (myMessage.dest === "panel") {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    chrome.runtime.sendMessage(myMessage, async function (res) {
                        if (chrome.runtime.lastError) {
                            reject(`${message.type}: ${chrome.runtime.lastError.message}`);
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
                    });
                }, 0);
            }).catch(error => {console.log(error)});
        } else {
            return Promise.reject("BackgroundMessaging: Bad message destination");
        }
    }

    public static initRelays() {
        CommonMessaging.addListener("ALL", async (message: IMessage) => {
            if (message.dest !== "background") {
                return BackgroundMessaging.send(message);
            } else {
                return null;
            }
        });
    }
}

