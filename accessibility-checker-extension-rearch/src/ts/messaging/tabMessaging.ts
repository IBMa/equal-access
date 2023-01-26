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

import { CommonMessaging } from "./commonMessaging";
import BrowserDetection from "../util/browserDetection";
import { IMessage } from "../interfaces/interfaces";

/**
 * This class is to be used by the tabs to listen to and send messages
 */
export class TabMessaging {

    public static addListener(type: string, listener: (message: IMessage) => Promise<any>) {
        CommonMessaging.addListener(type, listener);
    }

    public static send(message: IMessage, useBlob?: boolean): Promise<any> {
        let myMessage : IMessage = JSON.parse(JSON.stringify(message));
        myMessage.src = "tab";

        if (useBlob && BrowserDetection.isChrome()) {
            let json_string = JSON.stringify(myMessage);
            let blob = new Blob([json_string], { type: "application/json" });

            let url = URL.createObjectURL(blob);
            
            myMessage.blob_url = url;

            delete myMessage.content;
        }

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                chrome.runtime.sendMessage(myMessage, async function (res) {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError.message);
                    } else {
                        if (res) {
                            if (typeof res === "string") {
                                try {
                                    res = JSON.parse(res);
                                } catch (e) { }
                            }
                            resolve(res);
                        } else {
                            resolve(null);
                        }
                    }
                });
            }, 0);
        })
    }

}
