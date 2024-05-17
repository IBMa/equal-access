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

import * as React from 'react';
import ReactDOM from 'react-dom';
import { DevToolsApp } from './devToolsApp';
import { getDevtoolsAppController } from './devtoolsAppController';
import { getDevtoolsController } from './devtoolsController';
import { getTabIdAsync } from '../util/tabId';

(async () => {
    if (document?.location?.protocol === "chrome-extension:" && document?.location?.search.startsWith("?index=")) {
        let index = parseInt(decodeURIComponent(document.location.search.substring("?index=".length)));
        let tabRef = (await chrome.tabs.query({ index }))[0];
        let contentTabId = tabRef.id;
        let toolTabId = await getTabIdAsync();
        while (!toolTabId) {
            toolTabId = await getTabIdAsync();
        }
        if (!toolTabId || !contentTabId) {
            console.warn("Test initializing", toolTabId, contentTabId);
        }
        let dtc = getDevtoolsController(toolTabId, false, "local", contentTabId);
        getDevtoolsAppController(toolTabId, contentTabId);
        await dtc.awaitConnection();
    } else {
        let toolTabId = await getTabIdAsync();
        let dtc = getDevtoolsController(toolTabId, false, "remote", toolTabId)
        getDevtoolsAppController(toolTabId, toolTabId);
        await dtc.awaitConnection();
    }

    ReactDOM.render(<DevToolsApp panel="main"/>
        , document.getElementById('pageapp-root'));
})();
    