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

import { IMessage, MsgDestType } from "../interfaces/interfaces";
import Config from "../util/config";
import { getTabId } from "../util/tabId";
import { CommonMessaging } from "./commonMessaging";

export type eControllerType = "local" | "remote";
export type ListenerType<inT> = {
    callback: (content: inT) => Promise<void>
    callbackDest: MsgDestType
} 

export class Controller {
    protected type: eControllerType = "local";
    protected evtPrefix: string;
    protected ctrlDest: MsgDestType;

    private static myListeners : {
        [msgId: string]: ListenerType<any>[]
    } = {}

    /**
     * Constructor for Controllers
     * @param type If "local", this controller works within the current process. If "remote", messages must be sent to call all functions
     * @param evtPrefix Messages are sent with `${evtPrefix}_${messageId}`
     */
    constructor(type: eControllerType, ctrlDest: MsgDestType, evtPrefix: string) {
        this.type = type;
        this.evtPrefix = evtPrefix;
        this.ctrlDest = ctrlDest

        if (this.type === "local") {
            let listener = (message: IMessage<any>) => {
                this.addEventListener(
                    { 
                        callback: async (content: any) => {
                            CommonMessaging.send({
                                type: message.content.msgId,
                                dest: message.content.callbackDest,
                                content: content
                            });
                        },
                        callbackDest: message.content.callbackDest
                    },
                    message.content.msgId
                );
            };
            CommonMessaging.addMsgListener(listener, [`${this.evtPrefix}_addEventListener`], ctrlDest.type !== "extension" ? ctrlDest.tabId : undefined)
            CommonMessaging.addMsgListener(listener, [`${this.evtPrefix}_removeEventListener`], ctrlDest.type !== "extension" ? ctrlDest.tabId : undefined)
        }
        if (typeof window !== "undefined" && window.addEventListener) {
            window.addEventListener("beforeunload", () => {
                // If we're in a window that's unloading, unregister all of my listeners
                for (const msgId in Controller.myListeners) {
                    for (const listener of Controller.myListeners[msgId]) {
                        this.removeEventListener(listener, msgId);
                    }
                }
            })
        }
    }

    protected async addEventListener<inT>(
        listener: ListenerType<inT>,
        msgId: string)
    {
        let bInitRemote = false;
        if (!(msgId in Controller.myListeners)) {
            Controller.myListeners[msgId] = [];
            if (this.type === "remote") {
                // Need to notify the local controller that we want messages
                bInitRemote = true;
            }
        }
        Controller.myListeners[msgId].push(listener);
        if (bInitRemote) {
            CommonMessaging.addMsgListener((message: IMessage<inT>) => {
                this.fireEvent(msgId, message.content);
            }, [msgId], getTabId());
            CommonMessaging.send({
                type: `${this.evtPrefix}_addEventListener`,
                dest: this.ctrlDest,
                content: {
                    msgId: msgId,
                    callbackDest: listener.callbackDest
                }
            })
        }
    }

    protected async removeEventListener<inT>(
        listener: ListenerType<inT>,
        msgId: string)
    {
        if (msgId in Controller.myListeners) {
            for (let idx=0; idx<Controller.myListeners[msgId].length; ++idx) {
                if (Controller.myListeners[msgId][idx] === listener) {
                    Controller.myListeners[msgId].splice(idx--, 1);
                }
            }
            if (Controller.myListeners[msgId].length === 0) {
                CommonMessaging.removeMsgListeners([msgId], getTabId());
                CommonMessaging.send({
                    type: `${this.evtPrefix}_removeEventListener`,
                    dest: this.ctrlDest,
                    content: {
                        msgId: msgId,
                        callbackDest: listener.callbackDest
                    }
                })    
            }
        }
    }

    protected async fireEvent<inT>(
        msgId: string,
        content: inT
    ) {
        if (msgId in Controller.myListeners) {
            for (let idx1=0; idx1<Controller.myListeners[msgId].length; ++idx1) {
                let listener = Controller.myListeners[msgId][idx1];
                let firstIdx = -1;
                for (let idx2=0; idx2<Controller.myListeners[msgId].length; ++idx2) {
                    if (Controller.myListeners[msgId][idx2].callback.toString() === listener.callback.toString()) {
                        firstIdx = idx2;
                        break;
                    }
                }
                if (idx1 === firstIdx) {
                    listener.callback(content);
                }
            }
        }
    }

    protected async hook<InT, OutT> (
        msgName: string,
        msgBody: InT | null, 
        func: (msgBody: InT | null) => Promise<OutT>
    ) : Promise<OutT> {
        try {
            Config.DEBUG && console.log("[DEBUG:hook]", this.type, this.ctrlDest, `${this.evtPrefix}_${msgName}`, msgBody);
            if (this.type === "local") {
                return func(msgBody);
            } else {
                return (await CommonMessaging.send<InT | null, OutT>({
                    type: `${this.evtPrefix}_${msgName}`,
                    dest: this.ctrlDest,
                    content: msgBody
                }))!
            }
        } catch(err) {
            console.error(err);
            return Promise.reject(err);
        }
    }

    protected async hookListener<InT, OutT>(
        msgNames: string[],
        func: (msgBody: IMessage<InT>, senderTabId?: number) => Promise<OutT>,
    ) {
        CommonMessaging.addMsgListener((message: IMessage<InT>, senderTabId?: number) => {
            return func(message, senderTabId);
        }, msgNames, getTabId());
    }
}




