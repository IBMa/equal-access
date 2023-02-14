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
import { getDevtoolsController } from "../devtools/devtoolsController";

let bgController = getBGController();

(async() => {
    let settings = await bgController.getSettings();
    console.log("[DEBUG:KCM Settings]",settings);
    let myTabId = await bgController.getTabId()!;
    console.log("[DEBUG:KCM TabId]", myTabId);
    let devtoolsController = getDevtoolsController("remote", myTabId);

    devtoolsController.addViewStateListener({
        callback: async (viewState) => {
            console.log("[DEBUG:KCM ViewState]", viewState.kcm);
        },
        callbackDest: {
            type: "contentScript",
            tabId: myTabId
        }
    });
    
    devtoolsController.addReportListener({
        callback: async (report) => {
            console.log("[DEBUG:KCM:Report]", report);
        },
        callbackDest: {
            type: "contentScript",
            tabId: myTabId
        }
    });
})();

