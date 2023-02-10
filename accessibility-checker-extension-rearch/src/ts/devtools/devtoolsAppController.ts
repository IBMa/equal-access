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

export type ePanel = "main" | "elements";
export type eSecondaryView = "splash" | "summary" | "stored" | "help" | "kcm_overview";

/**
 * Controller for the DevtoolsApp. 
 * 
 * Note that this isn't a full controller and it shouldn't receive direct 
 * messages from outside of the app. The app should listen to other events
 * and direct messages should be sent to the DevtoolsController
 */
export class DevtoolsAppController {
    panel: ePanel;
    secondaryView: eSecondaryView = "splash";
    secondaryOpen: boolean = false;
    secondaryCloseQuerySelect: string = "";
    secondaryViewListeners: Array<(view: eSecondaryView) => void> = [];
    secondaryOpenListeners: Array<(open: boolean) => void> = [];

    ///////////////////////////////////////////////////////////////////////////
    ///// PUBLIC API //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    /**
     * Which panel is the app running in?
     */
    public getPanel() : ePanel {
        return this.panel;
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
            let e = document.querySelector(this.secondaryCloseQuerySelect) as HTMLElement;
            if (e) {
                e.focus();
            }
        })
    }

    public addSecondaryOpenListener(cb: (open: boolean) => void) {
        this.secondaryOpenListeners.push(cb);
    }

    public removeSecondaryOpenListener(cb: (open: boolean) => void) {
        this.secondaryOpenListeners.filter(listener => listener !== cb);
    }

    ///////////////////////////////////////////////////////////////////////////
    ///// PRIVATE API /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    constructor(panel: ePanel) {
        this.panel = panel; 
    }

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
}

let singleton : DevtoolsAppController;
export function getDevtoolsAppController(panel?: ePanel) {
    if (!singleton) {
        singleton = new DevtoolsAppController(panel || "main");
    }
    return singleton;
}



