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

// import { Button } from "carbon-components-react";
import "./popup.scss";
const purple_bee = "/assets/Bee_Logo@64px.png";

export default class PopupApp extends React.Component {
  handleButtonClick = () => {
    window.open(chrome.runtime.getURL("options.html"));
  };

  async openSubpanel() {
    var script = `inspect($x('/html'));`;
    console.log("OPEN");
    chrome.devtools.inspectedWindow.eval(script, function (
      result,
      isException
    ) {
      if (isException) {
        console.error(isException);
      }
      if (!result) {
        console.log("Could not select element, it may have moved");
      }
      //take the focus back to the Issue row.
      //$("#" + issueRowId).focus();
    });
  }

  render() {
    const manifest = chrome.runtime.getManifest();
    return (
      <div className="popupPanel">
        <div style={{ display: "flex", flexWrap: "nowrap" }}>
          <div>
            <div className="popupTitle">
              IBM <strong>Equal Access</strong> Accessibility Checker
            </div>
            <div className="versionDec">Version {manifest.version}</div>
          </div>
          <div style={{ marginLeft: "6px", marginTop: "10px" }}>
            <img
              src={purple_bee}
              width="36px"
              height="36px"
              alt="purple bee icon"
            />
          </div>
        </div>

        <div className="popupSubTitle">Accessibility Assessment</div>

        <div className="popupPanelDesc" style={{ width: "182px" }}>
          A comprehensive accessibility assessment tool. Start using by
          navigating to the “Accessibility Assessment” tab in Dev Tools.
        </div>

        <div className="popupSubTitle" style={{ marginTop: "17px" }}>
          Accessibility Checker
        </div>
        <div className="popupPanelDesc" style={{ width: "173px" }}>
          A code scanner for developers looking to find and fix errors quickly.
          Start using by navigating to the “Accessibility Checker” tab in Dev
          Tools.
        </div>

        <div style={{ marginTop: "32px", display: "flex", fontSize: "14px" }}>
          <div style={{ flexGrow: 1 }}>
            <a href={chrome.runtime.getURL("options.html")} target="_blank" rel="noopener noreferred">
              Options
            </a>
          </div>

          <div style={{ flexGrow: 1 }}>
            <a href="https://github.com/IBMa/equal-access" target="_blank" rel="noopener noreferred">
              Git Repo
            </a>
          </div>
          <div style={{ flexGrow: 1 }}>
            {" "}
            <a href="#" target="_blank">
              Docs
            </a>
          </div>
        </div>
      </div>
    );
  }
}
