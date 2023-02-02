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

export type eMessageSrcDst = "background" | "devtools" | "main" | "elements" | "options" | "popup" | "tab";

export interface IPolicyDefinition {
    id: string,
    name: string
    description: string
}

export interface IArchiveDefinition {
    id: string
    name: string
    path: string
    rulesets: {
        extension: IPolicyDefinition[]
        default: IPolicyDefinition[]
    }
    version: string
    latest?: true
    sunset?: boolean
    helpPath: string
    enginePath: string
}

export interface ISettings {
    selected_archive: IArchiveDefinition
    selected_ruleset: { id: string }
    tabStopLines: boolean
    tabStopOutlines: boolean
    tabStopAlerts: boolean
    tabStopFirstTime: boolean
}

export type MsgDestType = {
    type: "contentScript"
    tabId: number
    relay?: boolean
} | {
    type: "devTools"
    tabId: number
    relay?: boolean
} | {
    type: "extension"
}

export interface IMessage<T> {
    type: string
    dest: MsgDestType
    content?: T
    blob_url?: string
}

export interface IIssue {
    ruleId: string
    value: [string, string]
    node: Node
    path: {
        dom: string
        aria: string
    }
    ruleTime: number
    reasonId: string
    message: string
    messageArgs: string[]
    apiArgs: any[]
    bounds: {
        left: number,
        top: number,
        height: number
        width: number
    }
    snippet: string
    category: "Accessibility",
    help: string
}

export interface IReport {
    results: IIssue[]
    numExecuted: number
    ruleTime: number
    totalTime: number
    nls : {
        [ruleId: string]: {
            [reasonCode: string]: string
        }
    }
    passUniqueElements: string[]
}
