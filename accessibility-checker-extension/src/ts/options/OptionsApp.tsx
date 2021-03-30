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
import {
  Dropdown,
  Button,
  InlineNotification,
  Accordion,
  AccordionItem,
} from "carbon-components-react";

import { Restart16, Save16 } from "@carbon/icons-react";
import OptionMessaging from "../util/optionMessaging";
import OptionUtil  from '../util/optionUtil';
import beeLogoUrl from "../../assets/BE_for_Accessibility_darker.svg";

interface OptionsAppState {
  archives: any;
  selected_archive: any;
  rulesets: any;
  selected_ruleset: any;
  show_notif: boolean;
  show_reset_notif: boolean;
}

class OptionsApp extends React.Component<{}, OptionsAppState> {
  state: OptionsAppState = {
    archives: [],
    selected_archive: null,
    rulesets: null,
    selected_ruleset: null,
    show_notif: false,
    show_reset_notif: false,
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

        if (selected_archive) {
            if (archives.some((archive: any) => (archive.id === selected_archive.id && archive.name === selected_archive.name))) {
                // do nothing
            } else if (archives.some((archive: any) => (archive.id === selected_archive.id))) {
                // Name change
                selected_archive.name = archives.find((archive: any) => (archive.id === selected_archive.id)).name;
            } else {
                // Archive missing
                selected_archive = null;
            }
        }
        if (!selected_archive) {
            // No pre-selected archive
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
      show_notif: false,
    });
  };

  handleRulesetSelect = (item: any) => {
    this.setState({ selected_ruleset: item.selectedItem, show_notif: false });
  };

  handleSave = () => {
    this.save_options_to_storage(this.state);
    this.setState({ show_notif: true, show_reset_notif: false });
  };

  handlReset = () => {
    var selected_archive: any = this.getLatestArchive(this.state.archives);
    var selected_ruleset: any = this.state.rulesets[0];

    this.setState({
      selected_archive,
      selected_ruleset,
      show_reset_notif: true,
      show_notif: false,
    });
  };

  render() {
    let {
      archives,
      selected_archive,
      rulesets,
      selected_ruleset,
      show_notif,
      show_reset_notif,
    } = {
      ...this.state,
    };

    var rulesetDate = OptionUtil.getRuleSetDate(selected_archive?.id, archives);

    const manifest = chrome.runtime.getManifest();
    if (archives && rulesets) {
      return (
        <div className="bx--grid bx--grid--full-width">
          <div className="bx--row">
            <div className="bx--col-sm-4 bx--col-md-8 bx--col-lg-4 leftPanel">
              <div role="banner">
                <img src={beeLogoUrl} alt="purple bee icon" className="icon" />
                <h2>
                  IBM <strong>Accessibility</strong>
                  <br /> Equal Access Toolkit:
                  <br /> Accessibility Checker
                </h2>
              </div>
              <aside aria-label="About Accessibility Checker Options">
                <div className="op_version" style={{ marginTop: "8px" }}>
                  Version {manifest.version}
                </div>
                <p>
                  By default, the Accessibility Checker uses a set of rules that
                  correspond to the most recent WCAG guidelines plus some
                  additional IBM requirements. Rule sets for specific WCAG
                  versions are also available. The rule sets are updated
                  regularly to continuously improve coverage and accuracy.
                </p>
              </aside>
            </div>
            <div className="bx--col-md-0 bx--col-lg-1 buffer"></div>
            <div className="bx--col-md-8 bx--col-lg-8 rightPanel">
              <main aria-labelledby="options">
                <h1 id="options">IBM Accessibility Checker options</h1>

                <div style={{ marginLeft: "0.6875rem" }}>
                  <div className="rulesetDate" style={{ marginTop: "1rem" }}>
                    Rule set date: {rulesetDate}
                  </div>

                  <Accordion align="start" className="accordion">
                    <AccordionItem
                      title="Select a different date"
                      open={false}
                      className="accordion_item"
                    >
                      <p>
                        <ul>
                          <li>
                            Latest deployment: Choose to always use the latest
                            version of the rule set (default)
                          </li>
                          <li>
                            Dated deployment: Use a rule set from a specific
                            date for consistent testing throughout a project or
                            to replicate an earlier test
                          </li>
                          <li>
                            Preview rules: Try an experimental preview of
                            possible future rule set
                          </li>
                        </ul>
                      </p>

                      <Dropdown
                        ariaLabel={undefined}
                        disabled={false}
                        helperText="Rule set deployment date"
                        id="archivedRuleset"
                        items={archives}
                        itemToString={(item: any) => (item ? item["name"] : "")}
                        label="Rule set deployment date"
                        light={false}
                        titleText=""
                        type="default"
                        selectedItem={selected_archive}
                        onChange={this.handleArchiveSelect}
                      />
                      <p className="op_helper-text">
                        For details on rule set changes between deployments, see{" "}
                        <a
                          href="https://github.com/IBMa/equal-access/releases"
                          target="_blank"
                          rel="noopener noreferred"
                        >
                          Release notes
                        </a>
                        .
                      </p>
                    </AccordionItem>
                  </Accordion>
                </div>

                <h2 style={{ marginTop: "2rem" }}>
                  Supported accessibility guidelines
                </h2>
                <Dropdown
                  ariaLabel={undefined}
                  disabled={false}
                  helperText="Select a guideline"
                  id="rulesetSelection"
                  items={rulesets}
                  itemToString={(item: any) => (item ? item["name"] : "")}
                  label="Guideline selection"
                  light={false}
                  titleText=""
                  type="default"
                  selectedItem={selected_ruleset}
                  onChange={this.handleRulesetSelect}
                />

                {selected_ruleset.description ? (
                  <p className="op_helper-text">
                    {selected_ruleset.description}
                  </p>
                ) : (
                  ""
                )}
                {show_notif ? (
                  <div className="notification">
                    <InlineNotification
                      role="alert"
                      kind="success"
                      lowContrast={true}
                      title="Success"
                      subtitle=" Your change has been saved and will take effect after you close and reopen the developer tools."
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
                {show_reset_notif ? (
                  <div className="notification">
                    <InlineNotification
                      role="alert"
                      kind="warning"
                      lowContrast={true}
                      title="Warning"
                      subtitle=" Click Save button to save your changes"
                      className=""
                      iconDescription="close notification"
                      onCloseButtonClick={() => {
                        this.setState({ show_reset_notif: false });
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
                    Reset to defaults
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
              </main>
            </div>
            <div className="bx--col-md-0 bx--col-lg-3 buffer"></div>
          </div>
        </div>
      );
    } else {
      return (
        <div>
        <p>An error occurred while loading this page. Please check your internet connection and try again.</p>
        <br />
        <p> Please also follow  {" "}
            <a href={chrome.runtime.getURL("usingAC.html")} target="_blank" rel="noopener noreferred">User Guide</a>
            {" "} to give the browser permission to run the Option page. </p>
        </div>
      )
    }
  }
}

export default OptionsApp;
