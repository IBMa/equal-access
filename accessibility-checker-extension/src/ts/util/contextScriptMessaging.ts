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

import CommonMessaging from "./commonMessaging";
// import BrowserDetection from "./browserDetection";
//import { report } from 'process';

export default class ContextScriptMessaging {

    public static addListener(type: string, listener: (message: any) => Promise<any>) {
        CommonMessaging.addListener(type, listener);
    }

    public static sendToBackground(type: string, message: any): Promise<any> {
        // let myMessage = JSON.parse(JSON.stringify(message));
        let myMessage = message
        myMessage.type = type;


        return new Promise<void>((resolve, reject) => {
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
                            resolve();
                        }
                    }
                });
            }, 0);
        })
    }

}
