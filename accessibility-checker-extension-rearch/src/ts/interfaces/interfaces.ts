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

export type eMessageSrcDst = "background" | "panel" | "tab";

export interface IPolicyDefinition {
    id: string,
    name: string
}

export interface IArchiveDefinition {
    id: string,
    name: string,
    path: string,
    version: string,
    latest?: boolean,
    sunset?: boolean,
    policies: IPolicyDefinition[]
}

export interface IReport {

}

export interface ISettings {
    selected_archive: {
        id: string
    }
    selected_ruleset: {
        id: string
    }
    tabStopLines: boolean
    tabStopOutlines: boolean
    tabStopAlerts: boolean
    tabStopFirstTime: boolean
}

export interface IMessage {
    type: string
    src?: eMessageSrcDst
    dest: eMessageSrcDst
    destTab?: number
    content?: any
    blob_url?: string
}