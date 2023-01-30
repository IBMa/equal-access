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

export type eControllerType = "local" | "remote";

export class Controller {
    protected type: eControllerType = "local";

    constructor(type: eControllerType) {
        this.type = type;
    }

    protected async hook<InT, OutT> (
        msgName: string,
        msgBody: InT | null, 
        func: (msgBody: InT | null) => Promise<OutT>,
        destTab?: number
    ) : Promise<OutT> {
        try {
            console.log("hook", this.type);
            if (this.type === "local") {
                return func(msgBody);
            } else {
                return CommonMessaging.send({
                    type: msgName,
                    destTab: destTab,
                    content: msgBody
                })
            }
        } catch(err) {
            console.error(err);
            return Promise.reject(err);
        }
    }

    protected async hookListener<InT, OutT>(
        msgName: string,
        func: (msgBody: InT | null) => Promise<OutT>
    ) {
        CommonMessaging.addListener(msgName, (message: IMessage) => {
            return func(message.content);
        })
    }
}




