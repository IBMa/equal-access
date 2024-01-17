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

import { eFilterLevel } from "../interfaces/interfaces";
import { getDevtoolsController } from "./devtoolsController";

export type eSecondaryView = "splash" | "summary" | "stored" | "help" | "kcm_overview" | "checkerViewAware";

let devtoolsController = getDevtoolsController();

export type LevelFilters = {
    [key in eFilterLevel]: boolean
}

/**
 * Controller for the DevtoolsApp. 
 * 
 * Note that this isn't a full controller and it shouldn't receive direct 
 * messages from outside of the app. The app should listen to other events
 * and direct messages should be sent to the DevtoolsController
 */
export class DevtoolsAppController {
    secondaryView: eSecondaryView = "checkerViewAware";
    secondaryOpen: boolean = false;
    secondaryCloseQuerySelect: string = "";
    secondaryViewListeners: Array<(view: eSecondaryView) => void> = [];
    secondaryOpenListeners: Array<(open: boolean) => void> = [];
    levelFilterListeners: Array<() => void> = [];
    checked: LevelFilters = {
        "Violation": true,
        "Needs review": true,
        "Recommendation": true,
        "Hidden": false
    };

    constructor() {
        getDevtoolsController().addSelectedIssueListener(async () => {
            if (!this.secondaryOpen) {
                this.setSecondaryView("help");
            }
        });
    }

    ///////////////////////////////////////////////////////////////////////////
    ///// PUBLIC API //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    public getLevelFilterKeys(): eFilterLevel[] {
        return Object.keys(this.checked) as eFilterLevel[];
    }

    public getLevelFilters(): LevelFilters {
        return JSON.parse(JSON.stringify(this.checked));
    }

    public getLevelFilter(key: eFilterLevel) {
        return this.checked[key];
    }

    public setLevelFilters(val: LevelFilters) {
        this.checked = JSON.parse(JSON.stringify(val));
        this.fireLevelFilter();
    }

    public setLevelFilter(key: eFilterLevel, val: boolean) {
        this.checked[key] = val;
        this.fireLevelFilter();
    }

    public addLevelFilterListener(cb: () => void) {
        this.levelFilterListeners.push(cb);
    }

    public getSecondaryView() : eSecondaryView {
        return this.secondaryView;
    }

    public setSecondaryView(view: eSecondaryView) {
        this.secondaryView = view;
        this.fireSecondaryView(view);
    }

    public addSecondaryViewListener(cb: (view: eSecondaryView) => void) {
        this.secondaryViewListeners.push(cb);
    }

    public removeSecondaryViewListener(cb: (view: eSecondaryView) => void) {
        this.secondaryViewListeners.filter(listener => listener !== cb);
    }

    public getSecondaryOpen() {
        return this.secondaryOpen;
    }

    public openSecondary(closeQuerySelect: string) {
        this.secondaryOpen = true;
        this.secondaryCloseQuerySelect = closeQuerySelect;
        this.fireSecondaryOpen(true);
    }

    public closeSecondary() {
        this.secondaryOpen = false;
        this.fireSecondaryOpen(false);
        setTimeout(() => {
            let e : HTMLElement | Document | null = null;
            if (/ ?#/.test(this.secondaryCloseQuerySelect)) {
                e = document;
                let parts = this.secondaryCloseQuerySelect.split(/ +/);
                for (const part of parts) {
                    if (part.startsWith("#")) {
                        e = document.getElementById(part.substring(1));
                    } else {
                        e = e!.querySelector(part) as HTMLElement;
                    }
                    if (!e) return;
                }
            } else {
                e = document.querySelector(this.secondaryCloseQuerySelect) as HTMLElement;
            }
            if (e) {
                (e as HTMLElement).focus();
            }
        }, 0)
    }

    public addSecondaryOpenListener(cb: (open: boolean) => void) {
        this.secondaryOpenListeners.push(cb);
    }

    public removeSecondaryOpenListener(cb: (open: boolean) => void) {
        this.secondaryOpenListeners.filter(listener => listener !== cb);
    }

    public hookSelectionChange() {
        chrome.devtools.panels.elements.onSelectionChanged.addListener(() => {
            chrome.devtools.inspectedWindow.eval(`((node) => {
                let countNode = (node) => { 
                    let count = 0;
                    let findName = node.nodeName;
                    while (node) { 
                        if (node.nodeName === findName) {
                            ++count;
                        }
                        node = node.previousElementSibling; 
                    }
                    return "/"+findName.toLowerCase()+"["+count+"]";
                }
                try {
                    let retVal = "";
                    while (node && node.nodeType === 1) {
                        retVal = countNode(node)+retVal;
                        if (node.parentElement) {
                            node = node.parentElement;
                        } else {
                            let parentElement = null;
                            try {
                                // Check if we're in a shadow DOM
                                if (node.parentNode && node.parentNode.nodeType === 11) {
                                    parentElement = node.parentNode.host;
                                    retVal = "/#document-fragment[1]"+retVal;
                                } else {
                                    // Check if we're in an iframe
                                    let parentWin = node.ownerDocument.defaultView.parent;
                                    let iframes = parentWin.document.documentElement.querySelectorAll("iframe");
                                    for (const iframe of iframes) {
                                        try {
                                            if (iframe.contentDocument === node.ownerDocument) {
                                                parentElement = iframe;
                                                break;
                                            }
                                        } catch (e) {}
                                    }
                                }
                            } catch (e) {}
                            node = parentElement;
                        }
                    }
                    return retVal;
                } catch (err) {
                    console.error(err);
                }
            })($0)`, async (result: string) => {
                await devtoolsController.setSelectedElementPath(result, true);
            });
        });
        chrome.devtools.inspectedWindow.eval(`inspect(document.documentElement);`);
    }

    ///////////////////////////////////////////////////////////////////////////
    ///// PRIVATE API /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    private fireSecondaryView(view: eSecondaryView) {
        for (const listener of this.secondaryViewListeners) {
            listener(view);
        }
    }

    private fireSecondaryOpen(open: boolean) {
        for (const listener of this.secondaryOpenListeners) {
            listener(open);
        }
    }

    private fireLevelFilter() {
        for (const listener of this.levelFilterListeners) {
            listener();
        }
    }
}

let singleton : DevtoolsAppController;
export function getDevtoolsAppController() {
    if (!singleton) {
        singleton = new DevtoolsAppController();
    }
    return singleton;
}



