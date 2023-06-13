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
declare var document: Document;

export class BrowserDetection {

    public static isChrome(): boolean {
        return !BrowserDetection.isFirefrox();
    };

    public static isFirefrox(): boolean {
        if ("InstallTrigger" in window) {
            return true;
        } else {
            return false;
        }
    };

    public static isDarkMode(): boolean {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    public static setDarkLight() {
        if (typeof document !== "undefined" && typeof document.body !== "undefined") {
            if (BrowserDetection.isDarkMode()) {
                document.body.setAttribute("class", "cds--g100");
            } else {
                document.body.setAttribute("class", "white");
            }
        }
    }
}
