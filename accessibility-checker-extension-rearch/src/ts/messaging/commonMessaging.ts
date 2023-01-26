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

    public static addListener(type: string, listener: (message: IMessage) => Promise<any>) {
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
}
