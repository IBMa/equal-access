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

import { getBGController } from "../background/backgroundController";

export function getTabIdSync() {
    if (chrome && chrome.devtools && chrome.devtools.inspectedWindow && chrome.devtools.inspectedWindow.tabId) {
        return chrome.devtools.inspectedWindow.tabId;
    } else {
        return undefined;
    }
}

export async function getTabIdAsync() {
    let tabId = getTabIdSync();
    if (typeof tabId !== "undefined") {
        return tabId;
    } else {
        return getBGController().getTabId();
    }
}