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

import { IReport, eFilterLevel } from "../interfaces/interfaces";
import { getDevtoolsController } from "./devtoolsController";

export type eSecondaryView = "splash" | "summary" | "stored" | "help" | "kcm_overview" | "checkerViewAware";


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

    private devToolsController;

    constructor(public toolTabId: number, public contentTabId: number) {
        this.devToolsController = getDevtoolsController(toolTabId);
        this.devToolsController.addSelectedIssueListener(async () => {
            if (!this.secondaryOpen) {
                this.setSecondaryView("help");
            }
        });
        this.devToolsController.addReportListener(async (report: IReport) => {
            if (!report) {
                this.setSecondaryView("splash");
            }
        })
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
        const injectPathGenerator = () => {
            chrome.devtools.inspectedWindow.eval(`
   window.__getACEPath = function(node) {
    function getIndex(n) {
        if (n.assignedSlot) {
            const assigned = n.assignedSlot.assignedElements
                ? n.assignedSlot.assignedElements()
                : Array.from(n.assignedSlot.assignedNodes()).filter(x => x.nodeType === 1);
            let count = 0;
            for (const el of assigned) {
                if (el === n) break;
                if (el.localName === n.localName) count++;
            }
            return "/" + n.localName + "[" + (count + 1) + "]";
        }
        const parent = n.parentNode;
        if (!parent) return "/" + n.localName + "[1]";
        let count = 0;
        const children = parent.children;
        for (let i = 0; i < children.length; i++) {
            if (children[i] === n) break;
            if (children[i].localName === n.localName) count++;
        }
        return "/" + n.localName + "[" + (count + 1) + "]";
    }

    function getSlotIndex(slot) {
        let count = 1;
        let sib = slot.previousElementSibling;
        while (sib) {
            if (sib.localName === 'slot') count++;
            sib = sib.previousElementSibling;
        }
        return count;
    }

    try {
        let current = node;

        // If $0 is a slot, use first assigned element or walk to host
        while (current && current.localName === 'slot') {
            const assigned = current.assignedElements
                ? current.assignedElements()
                : Array.from(current.assignedNodes()).filter(n => n.nodeType === 1);
            if (assigned.length > 0) {
                current = assigned[0];
            } else {
                const parent = current.parentNode;
                if (!parent) break;
                if (parent.nodeType === 11) current = parent.host;
                else if (parent.nodeType === 1) current = parent;
                else break;
            }
        }

        if (!current || current.nodeType !== 1) return "";

        let segments = "";

        while (current && current.nodeType === 1) {
            const assignedSlot = current.assignedSlot;

            if (assignedSlot) {
                segments = getIndex(current) + segments;
                segments = "/slot[" + getSlotIndex(assignedSlot) + "]" + segments;
                const slotParent = assignedSlot.parentNode;
                if (!slotParent) break;
                if (slotParent.nodeType === 11) {
                    segments = "/#document-fragment[1]" + segments;
                    current = slotParent.host;
                } else if (slotParent.nodeType === 9) {
                    segments = "/html[1]" + segments;
                    break;
                } else if (slotParent.nodeType === 1) {
                    current = slotParent;
                } else {
                    break;
                }
            } else {
                segments = getIndex(current) + segments;
                const parent = current.parentNode;
                if (!parent) break;

                if (parent.nodeType === 11) {
                    segments = "/#document-fragment[1]" + segments;
                    current = parent.host;
                } else if (parent.nodeType === 9) {
                    // parent is the document — current is <html>. Stop; /html[1] is already in segments.
                    break;
                } else if (parent.nodeType === 1) {
                    current = parent;
                } else {
                    break;
                }
            }
        }

        return segments;
    } catch(err) {
        return "";
    }
};
            `);
        };

        injectPathGenerator();
        chrome.devtools.network.onNavigated.addListener(() => {
            injectPathGenerator();
        });

        chrome.devtools.panels.elements.onSelectionChanged.addListener(() => {
            chrome.devtools.inspectedWindow.eval(
                `window.__getACEPath($0)`,
                async (result: string) => {
                    await this.devToolsController.setSelectedElementPath(result, true);
                }
            );
        });
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
export function getDevtoolsAppController(toolTabId?: number, contentTabId?: number) {
    if (!singleton && toolTabId && contentTabId) {
        singleton = new DevtoolsAppController(toolTabId, contentTabId);
    } else if (!singleton) {
        throw new Error("Controller not initialized")
    }
    return singleton;
}



