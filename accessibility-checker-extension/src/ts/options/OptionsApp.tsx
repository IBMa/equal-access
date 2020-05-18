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
import { Dropdown, Button, InlineNotification } from "carbon-components-react";

import { Restart16, Save16 } from "@carbon/icons-react";
import OptionMessaging from "../util/optionMessaging";

import beeLogoUrl from "../../assets/Bee_Logo.svg";

interface OptionsAppState {
  archives: any;
  selected_archive: any;
  rulesets: any;
  selected_ruleset: any;
  show_notif: boolean;
}

class OptionsApp extends React.Component<{}, OptionsAppState> {
  state: OptionsAppState = {
    archives: [],
    selected_archive: null,
    rulesets: null,
    selected_ruleset: null,
    show_notif: false,
  };

  async componentDidMount() {
    var self = this;

    //get the selected_archive from storage
    chrome.storage.local.get("OPTIONS", async function (result: any) {
      //always sync archives with server
      var archives = await self.getArchives();
      var selected_archive: any = null;
      var rulesets: any = null;
      var selected_ruleset: any = null;

      //OPTIONS are not in storage
      if (result != null && result.OPTIONS == undefined) {
        //find the latest archive
        selected_archive = self.getLatestArchive(archives);
        rulesets = await self.getRulesets(selected_archive);
        selected_ruleset = rulesets[0];
      } else {
        //OPTIONS are in storage
        selected_archive = result.OPTIONS.selected_archive;
        rulesets = result.OPTIONS.rulesets;
        selected_ruleset = result.OPTIONS.selected_ruleset;

        //archives have not been changed
        if (
          selected_archive &&
          archives.find((archive: any) =>  {return archive.id == selected_archive.id} )
        ) {
          //do nothing
        } else {
          //pre-selected archive has been deleted
          selected_archive = self.getLatestArchive(archives);
          rulesets = self.getRulesets(selected_ruleset.id);
          selected_ruleset = rulesets[0];
        }
      }
      self.setState({ archives, selected_archive, rulesets, selected_ruleset });
      self.save_options_to_storage(self.state);
    });
  }

  //get archives from server
  getArchives = async () => {
    return await OptionMessaging.sendToBackground("OPTIONS", {
      command: "getArchives",
    });
  };

  getLatestArchive = (archives: any) => {
    return archives.find((archive: any) => { 
        return archive.id == "latest";
    });
  };

  getRulesets = async (selected_archive: any) => {
    return selected_archive.policies;
  };

  //save options into browser's storage
  save_options_to_storage = async (state: any) => {
    var options = { OPTIONS: state };
    await chrome.storage.local.set(options, function () {
      console.log("options is set to ", options);
    });
  };

  handleArchiveSelect = async (item: any) => {
    var rulesets = await this.getRulesets(item.selectedItem);
    var selected_ruleset = rulesets[0];
    this.setState({
      selected_archive: item.selectedItem,
      rulesets,
      selected_ruleset,
      show_notif: false
    });
  };

  handleRulesetSelect = (item: any) => {
    this.setState({ selected_ruleset: item.selectedItem, show_notif: false });
  };

  handleSave = () => {
    this.save_options_to_storage(this.state);
    this.setState({ show_notif: true });
  };

  handlReset = () => {
    var self = this;
    chrome.storage.local.get("OPTIONS", async function (result: any) {
      self.setState(result.OPTIONS);
    });
  };

  render() {
    let {
      archives,
      selected_archive,
      rulesets,
      selected_ruleset,
      show_notif,
    } = {
      ...this.state,
    };
    const manifest = chrome.runtime.getManifest();
    if (archives && rulesets) {
      return (
        <div className="bx--grid bx--grid--full-width">
          <div className="bx--row">
            <div className="bx--col-sm-4 bx--col-md-8 bx--col-lg-4 leftPanel">
              <img src={beeLogoUrl} alt="purple bee icon" className="icon" />
              <h2>
                IBM <strong>Accessibility</strong>
                <br /> Equal Access Toolkit:
                <br /> Accessibility Checker
              </h2>
              <div className="op_version" style={{ marginTop: "8px" }}>
                Version {manifest.version}
              </div>
              <p>
                By default, the Accessibility Checker uses a set of rules that
                correspond to the most recent WCAG standards, and these rules
                are updated regularly. If you need to test against a specific
                rule set version, use these options to select the archived rule
                set by date of deployment and standard used.
              </p>
            </div>
            <div className="bx--col-md-0 bx--col-lg-1 buffer"></div>
            <div className="bx--col-md-8 bx--col-lg-8 rightPanel">
              <h2>Advanced options</h2>

              <p>
                Choose to always use the latest version of the rule sets, use
                the version from a specific date, or try a preview of future
                rule sets. By default the latest rule set version is selected.
              </p>

              <Dropdown
                ariaLabel="Deployment selection dropdown"
                disabled={false}
                helperText="Rule set deployment"
                id="archivedRuleset"
                items={archives}
                itemToString={(item: any) => (item ? item["name"] : "")}
                label="Rule set deployment"
                light={false}
                titleText=""
                type="default"
                selectedItem={selected_archive}
                onChange={this.handleArchiveSelect}
              />
              <p className="op_helper-text">
                For details on rule set changes between deployments, see{" "}
                <a href="https://github.com/IBMa/equal-access/releases">Release notes</a>.
              </p>
              <h3>Supported rule sets</h3>
              <p>
                Choose which rule set to use. This will affect the issues
                detected.
              </p>

              <Dropdown
                ariaLabel="ruleset selection dropdown"
                disabled={false}
                helperText="Select rule set"
                id="archivedRuleset"
                items={rulesets}
                itemToString={(item: any) => (item ? item["name"] : "")}
                label="Rule set deployment"
                light={false}
                titleText=""
                type="default"
                selectedItem={selected_ruleset}
                onChange={this.handleRulesetSelect}
              />

      {selected_ruleset.description? (<p className="op_helper-text">{selected_ruleset.description}</p>):"" }
              {show_notif ? (
                <div className="notification">
                  <InlineNotification
                    role="alert"
                    kind="success"
                    lowContrast={true}
                    title="Success"
                    subtitle=" Your changes have been saved"
                    className=""
                    iconDescription="close notification"
                    onCloseButtonClick={() => {
                      this.setState({ show_notif: false });
                    }}
                  />
                </div>
              ) : (
                ""
              )}
              <div className="buttonRow">
                <Button
                  disabled={false}
                  kind="tertiary"
                  onClick={this.handlReset}
                  renderIcon={Restart16}
                  size="default"
                  tabIndex={0}
                  type="button"
                >
                  Reset
                </Button>
                <Button
                  disabled={false}
                  kind="primary"
                  onClick={this.handleSave}
                  renderIcon={Save16}
                  size="default"
                  tabIndex={0}
                  type="button"
                >
                  Save
                </Button>
              </div>
            </div>
            <div className="bx--col-md-0 bx--col-lg-3 buffer"></div>
          </div>
        </div>
      );
    } else {
      return <div>error: can not get archives or rulesets</div>;
    }
  }
}

export default OptionsApp;
