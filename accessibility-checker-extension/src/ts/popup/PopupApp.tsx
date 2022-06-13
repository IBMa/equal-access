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

import React from "react";
import BrowserDetection from "../util/browserDetection";
import "../styles/popup.scss";

const purple_bee = "/assets/Bee_Logo@64px.png";
const checker_chrome = "/assets/img/Chrome_Checker.png";
const checker_firefox = "/assets/img/Firefox_Checker.png";
const assessment_chrome = "/assets/img/Chrome_Assessment.png";
const assessment_firefox = "/assets/img/Firefox_Assessment.png";

export default class PopupApp extends React.Component {

  render() {
    const manifest = chrome.runtime.getManifest();
    function displayVersion() {
        let extVersion = manifest.version;
        if (extVersion.endsWith(".9999")) {
            return extVersion.replace(/(\d+\.\d+\.\d+)\.(\d+)/, "$1");
        } else {
            return extVersion.replace(/(\d+\.\d+\.\d+)\.(\d+)/, "$1-rc.$2");
        }
    }

    const checker_screen_copy = BrowserDetection.isChrome()
      ? checker_chrome
      : checker_firefox;
    const assessment_screen_copy = BrowserDetection.isChrome()
      ? assessment_chrome
      : assessment_firefox;

    return (
      <div className="popupPanel">
        <div style={{ display: "flex", flexWrap: "nowrap" }}>
          <div>
            <div className="popupTitle">
              IBM <strong>Equal Access</strong>
              <br />
              Accessibility Checker
            </div>
            <div className="versionDec">Version {displayVersion()}</div>
          </div>
          <div
            style={{
              float: "right",
              marginTop: "0.625rem",
              marginLeft: "auto",
            }}
          >
            <img
              src={purple_bee}
              width="36px"
              height="36px"
              alt="purple bee icon"
            />
          </div>
        </div>

        <h2 className="popupSubTitle">Accessibility Assessment</h2>

        <div className="popupPanelDesc" style={{ width: "406px" }}>
          A comprehensive accessibility assessment tool. Start using by
          navigating to the “Accessibility Assessment” panel in Dev Tools.
        </div>
        <div style={{ marginTop: "8px" }}>
          <img
            src={assessment_screen_copy}
            width="446px"
            height="149px"
            alt="Chrome Accessibility Assessment panel icon"
          />
        </div>
        <h2 className="popupSubTitle" style={{ marginTop: "17px" }}>
          Accessibility Checker
        </h2>
        <div className="popupPanelDesc" style={{ width: "406px" }}>
          A code scanner for developers looking to find and fix errors quickly.
          Start using by navigating to the “Accessibility Checker” panel in Dev
          Tools.
        </div>
        <div style={{ marginTop: "8px" }}>
          <img
            src={checker_screen_copy}
            width="446px"
            height="149px"
            alt="Chrome Accessibility Assessment panel icon"
          />
        </div>
        <div style={{ marginTop: "8px", display: "flex", fontSize: "14px" }}>
          <div>
            <a
              href={chrome.runtime.getURL("options.html")}
              target="_blank"
              rel="noopener noreferred"
            >
              Options
            </a>
          </div>

          <div style={{ marginLeft: "2rem" }}>
            <a
              href="https://github.com/IBMa/equal-access"
              target="_blank"
              rel="noopener noreferred"
            >
              Git Repo
            </a>
          </div>
          <div style={{ marginLeft: "2rem" }}>
            <a
              href={chrome.runtime.getURL("usingAC.html")}
              target="_blank"
              rel="noopener noreferred"
            >
              Docs
            </a>
          </div>
        </div>
      </div>
    );
  }
}
