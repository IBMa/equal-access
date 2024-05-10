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

import Config from "../util/config";
import { getTabIdSync } from "../util/tabId";
import { getDevtoolsController } from "./devtoolsController";
let localStr = (Config.engineEndpoint && Config.engineEndpoint.includes("localhost") && " (local)") || "";
let devStr = (Config.workspace && Config.workspace === "development" && " (dev)") || "";
let devtoolsController = getDevtoolsController(getTabIdSync()!, false, "local", getTabIdSync()!);

chrome.devtools.panels.elements.createSidebarPane("Accessibility Checker"+devStr+localStr,
    function(newPanel) {
        //sidebar initialization code here
        newPanel.setPage("devtoolsElements.html");
        newPanel.onShown.addListener(() => {
            devtoolsController.setActivePanel("elements");
        });
        newPanel.onHidden.addListener(() => {
            devtoolsController.setActivePanel(null);
        });
    }
);

chrome.devtools.panels.create("Accessibility Assessment"+devStr+localStr, "", "devtoolsMain.html", 
    function(newPanel) {
        newPanel.onShown.addListener(() => {
            devtoolsController.setActivePanel("main");
        });
        newPanel.onHidden.addListener(() => {
            devtoolsController.setActivePanel(null);
        });
    }
);

