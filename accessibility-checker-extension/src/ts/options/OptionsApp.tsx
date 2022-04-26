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
    Column, Grid, Dropdown,
    Button,
    Modal,
    Theme
} from "@carbon/react";

import { Restart, Save, Information } from "@carbon/react/icons/lib/index";
import OptionMessaging from "../util/optionMessaging";
// import OptionUtil  from '../util/optionUtil';
import beeLogoUrl from "../../assets/BE_for_Accessibility_darker.svg";

interface OptionsAppState {
    archives: any;
    selected_archive: any;
    currentArchive: any;
    rulesets: any;
    selected_ruleset: any;
    currentRuleset: any;
    show_notif: boolean;
    show_reset_notif: boolean;
    modalRuleSet: boolean;
    modalGuidelines: boolean;

}

class OptionsApp extends React.Component<{}, OptionsAppState> {
    state: OptionsAppState = {
        archives: [],
        selected_archive: null,
        currentArchive: null,
        rulesets: null,
        selected_ruleset: null,
        currentRuleset: null,
        show_notif: false,
        show_reset_notif: false,
        modalRuleSet: false,
        modalGuidelines: false,
    };

    async componentDidMount() {
        var self = this;

        //get the selected_archive from storage
        chrome.storage.local.get("OPTIONS", async function (result: any) {
            //always sync archives with server
            var archives = await self.getArchives();
            var selected_archive: any = null;
            var currentArchive: any = null;
            var rulesets: any = null;
            var selected_ruleset: any = null;
            var currentRuleset: any = null;

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

            currentArchive = selected_archive.name;
            currentRuleset = selected_ruleset.name;

            // self.setState({ archives, selected_archive, rulesets, selected_ruleset });
            self.setState({
                archives: archives, selected_archive: selected_archive, rulesets: rulesets,
                selected_ruleset: selected_ruleset, currentArchive: currentArchive,
                currentRuleset: currentRuleset
            });
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
        // TODO if there are stored scans we need to put up modal
        //      modal choices  
        //            delete scans and update ruleset
        //            keep stored scans and don't update rulset (ali says don't give this choice)
        this.setState({ currentArchive: this.state.selected_archive.name, currentRuleset: this.state.selected_ruleset.name })
        this.save_options_to_storage(this.state);
        this.setState({ show_notif: true, show_reset_notif: false, });
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
        } = {
            ...this.state,
        };

        const manifest = chrome.runtime.getManifest();
        function displayVersion() {
            let extVersion = manifest.version;
            if (extVersion.endsWith(".9999")) {
                return extVersion.replace(/(\d+\.\d+\.\d+)\.(\d+)/, "$1");
            } else {
                return extVersion.replace(/(\d+\.\d+\.\d+)\.(\d+)/, "$1-rc.$2");
            }
        }
        if (archives && rulesets) {
            return (
                <div style={{height: "100%"}}>
                    <Grid fullWidth style={{height: "100%", padding: "0rem"}}>
                        <Column sm={{ span: 4 }} md={{ span: 8 }} lg={{ span: 4 }} className="leftPanel">
                            <Theme theme="g10">
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
                                        Version {displayVersion()}
                                    </div>
                                    <p>
                                        By default, the Accessibility Checker uses a set of rules that
                                        correspond to the most recent WCAG guidelines plus some
                                        additional IBM requirements. Rule sets for specific WCAG
                                        versions are also available. The rule sets are updated
                                        regularly to continuously improve coverage and accuracy.
                                    </p>
                                </aside>
                            </Theme>
                        </Column>
                        <Column sm={{span: 0}} md={{span: 0}} lg={{span: 1}} />
                        <Column sm={{span: 4}} md={{span: 8}} lg={{span: 8}} className="rightPanel">
                            <Theme theme="white">
                                <main aria-labelledby="options">
                                    <h1 id="options">IBM Accessibility Checker options</h1>

                                    <div>
                                        <div className="rulesetDate" style={{ marginTop: "1rem" }}>
                                            Select a rule set deployment date
                                            <Button
                                                renderIcon={Information}
                                                kind="ghost"
                                                hasIconOnly iconDescription="Rule set info" tooltipPosition="top"
                                                style={{
                                                    color: "black", border: "none", verticalAlign: "baseline", minHeight: "28px",
                                                    paddingTop: "8px", paddingLeft: "8px", paddingRight: "8px"
                                                }}
                                                onClick={(() => {
                                                    this.setState({ modalRuleSet: true });
                                                }).bind(this)}>
                                            </Button>
                                        </div>

                                        <Dropdown
                                            ariaLabel={undefined}
                                            disabled={false}
                                            helperText={"Currently active: " + this.state.currentArchive}
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

                                        <Modal
                                            aria-label="Version information"
                                            modalHeading="Selecting a rule set deployment date"
                                            passiveModal={true}
                                            open={this.state.modalRuleSet}
                                            onRequestClose={(() => {
                                                this.setState({ modalRuleSet: false });
                                            }).bind(this)}
                                        >
                                            <p style={{ maxWidth: "100%" }}><strong>Dated deployment: </strong> Use a rule set from a specific date
                                                for consistent testing throughout a project to replicate an earlier test</p>

                                            <p style={{ maxWidth: "100%" }}><strong>Preview rules: </strong> Try an experimental preview of possible future rule set</p>

                                            <p style={{ maxWidth: "100%" }}>For details on rule set changes between deployments, see <a className="link" href="https://www.ibm.com/able/requirements/release-notes" target="_blank" style={{ color: '#002D9C' }}>Release notes</a></p>
                                        </Modal>


                                    </div>

                                    <div className="rulesetDate" style={{ marginTop: "1rem" }}>
                                        Select accessibility guidelines
                                        <Button
                                            renderIcon={Information}
                                            kind="ghost"
                                            hasIconOnly iconDescription="Guidelines info" tooltipPosition="top"
                                            style={{
                                                color: "black", border: "none", verticalAlign: "baseline", minHeight: "28px",
                                                paddingTop: "8px", paddingLeft: "8px", paddingRight: "8px"
                                            }}
                                            onClick={(() => {
                                                this.setState({ modalGuidelines: true });
                                            }).bind(this)}>
                                        </Button>
                                    </div>

                                    <Dropdown
                                        ariaLabel={undefined}
                                        disabled={false}
                                        helperText={"Currently active: " + this.state.currentRuleset}
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

                                    <Modal
                                        aria-label="Guidelines information"
                                        modalHeading="Selecting accessibility guidelines"
                                        passiveModal={true}
                                        open={this.state.modalGuidelines}
                                        onRequestClose={(() => {
                                            this.setState({ modalGuidelines: false });
                                        }).bind(this)}
                                    >
                                        <p style={{ maxWidth: "100%" }}><strong>IBM Accessibility: </strong> Rules for WCAG 2.1 AA plus additional IBM requirements</p>
                                        <p style={{ maxWidth: "100%" }}><strong>WCAG 2.1 (A, AA): </strong> This is the current W3C recommendation. Content that conforms to WCAG 2.1 also conforms to WCAG 2.0</p>
                                        <p style={{ maxWidth: "100%" }}><strong>WCAG 2.0 (A, AA): </strong> Referenced by US Section 508, but not the latest W3C recommendation</p>
                                        <p style={{ maxWidth: "100%" }}><strong>IBM Accessibility BETA: </strong> Rules for WCAG 2.1 AA plus additional IBM requirements and experimental rules</p>
                                    </Modal>

                                    <div className="buttonRow">
                                        <Button
                                            disabled={false}
                                            kind="tertiary"
                                            onClick={this.handlReset}
                                            renderIcon={Restart}
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
                                            renderIcon={Save}
                                            size="default"
                                            tabIndex={0}
                                            type="button"
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </main>
                            </Theme>
                        </Column>
                        <Column sm={{span: 0}} md={{span: 0}} lg={{span: 3}} className="buffer"></Column>
                    </Grid>
                </div>
            );
        } else {
            return (
                <Theme theme="g10">
                    <p>An error occurred while loading this page. Please check your internet connection and try again.</p>
                    <br />
                    <p> Please also follow  {" "}
                        <a href={chrome.runtime.getURL("usingAC.html")} target="_blank" rel="noopener noreferred">User Guide</a>
                        {" "} to give the browser permission to run the Option page. </p>
                </Theme>
            )
        }
    }
}

export default OptionsApp;
