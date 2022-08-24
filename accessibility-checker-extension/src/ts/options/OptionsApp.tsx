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
    Button, Checkbox, Toggle,
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
    // Keyboard Checker Mode options
    tabStopLines: boolean;
    tabStopOutlines: boolean;
    tabStopAlerts: boolean;
    tabStopFirstTime: boolean;
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
         // Keyboard Checker Mode options
        tabStopLines: true,
        tabStopOutlines: false,
        tabStopAlerts: true,
        tabStopFirstTime: true,
    };

    async componentDidMount() {
        console.log("Options App ComponentDidMount");
        var self = this;

        // get OPTIONS from storage
        chrome.storage.local.get("OPTIONS", async function (result: any) {
            //always sync archives with server
            var archives = await self.getArchives();
            var selected_archive: any = null;
            var currentArchive: any = null;
            var rulesets: any = null;
            var selected_ruleset: any = null;
            var currentRuleset: any = null;
            // Keyboard Mode options
            var tabStopLines: any = true;
            var tabStopOutlines: any = false;
            var tabStopAlerts: any = true;
            var tabStopFirstTime: any = true;

            console.log("_____________");
            console.log(result.OPTIONS);
            console.log("_____________");

            // OPTIONS are not in storage
            // JCH make this test stronger
            if (result == null || result.OPTIONS == undefined || 
                result.OPTIONS.selected_archive == undefined || 
                result.OPTIONS.selected_ruleset == undefined) {
                // OPTIONS are NOT in storage
                console.log("OPTIONS are NOT in storage");
                //find the latest archive
                selected_archive = self.getLatestArchive(archives);

                rulesets = await self.getRulesets(selected_archive);
                selected_ruleset = rulesets[0];
                // leave all Keyboard mode options to true, i.e., show all
            } else {
                //OPTIONS are in storage
                console.log("OPTIONS ARE in storage");
                selected_archive = result.OPTIONS.selected_archive;
                rulesets = result.OPTIONS.rulesets;
                selected_ruleset = result.OPTIONS.selected_ruleset;
                tabStopLines = result.OPTIONS.tabStopLines;
                tabStopOutlines = result.OPTIONS.tabStopOutlines;
                tabStopAlerts = result.OPTIONS.tabStopAlerts;
                tabStopFirstTime = result.OPTIONS.tabStopFirstTime;

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
            
            self.setState({
                archives: archives, selected_archive: selected_archive, rulesets: rulesets,
                selected_ruleset: selected_ruleset, currentArchive: currentArchive,
                currentRuleset: currentRuleset, tabStopLines: tabStopLines, tabStopOutlines: tabStopOutlines,
                tabStopAlerts: tabStopAlerts, tabStopFirstTime: tabStopFirstTime,
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
        console.log("handleSave");
        console.log("this.state.selected_archive.name = ",this.state.selected_archive.name);
        console.log("this.state.selected_ruleset.name = ",this.state.selected_ruleset.name,);
        console.log("this.state.tabStopLines = ",this.state.tabStopLines);
        console.log("this.state.tabStopOutlines = ",this.state.tabStopOutlines);
        console.log("this.state.tabStopAlerts = ",this.state.tabStopAlerts);
        console.log("this.state.tabStopFirstTime = ",this.state.tabStopFirstTime);

        this.setState({ 
            currentArchive: this.state.selected_archive.name, 
            currentRuleset: this.state.selected_ruleset.name,
            tabStopLines: this.state.tabStopLines,
            tabStopOutlines: this.state.tabStopOutlines,
            tabStopAlerts: this.state.tabStopAlerts,
            tabStopFirstTime: false,
         })
        this.save_options_to_storage(this.state);
        this.setState({ show_notif: true, show_reset_notif: false, });
    };

    //save options into browser's storage
    save_options_to_storage = async (state: any) => {
        var options = { OPTIONS: state };
        await chrome.storage.local.set(options, function () {
            // console.log("options is set to ", options);
        });
        
    };

    handleReset = () => {
        var selected_archive: any = this.getLatestArchive(this.state.archives);
        var selected_ruleset: any = this.state.rulesets[0];

        this.setState({
            selected_archive,
            selected_ruleset,
            show_reset_notif: true,
            show_notif: false,
            tabStopLines: true,
            tabStopOutlines: true,
            tabStopAlerts: true,
            tabStopFirstTime: false
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

        // only show keyboard first time notification on first time 
        // user uses the keyboard visualization - note it is can be 
        // reset with "Reset to defaults"
        

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
                                    <div style={{marginTop:"2rem"}}>
                                        <span className="ibm">IBM</span> <span className="accessibility">Accessibility</span>
                                        <br /> <span className="equal-access-toolkit">Equal Access Toolkit:</span>
                                        <br /> <span className="equal-access-toolkit">Accessibility Checker</span>
                                    </div>
                                </div>
                                <aside aria-label="About Accessibility Checker Options">
                                    <div className="op_version" style={{ marginTop: "8px" }}>
                                        Version {displayVersion()}
                                    </div>
                                    <p>
                                    By default, the Accessibility Checker uses a set of rules that correspond to 
                                    the most recent WCAG standards plus some additional IBM requirements. Rule sets 
                                    for specific WCAG versions are also available. The rule sets are updated regularly, 
                                    and each update has a date of deployment. If you need to replicate an earlier test, 
                                    choose the deployment date of the original test.
                                    <br/><br/>
                                    For more in-depth guidance, see  <a
                                    href={chrome.runtime.getURL("usingAC.html")}
                                    target="_blank"
                                    rel="noopener noreferred"
                                    >
                                    user guide
                                    </a>
                                    .
                                    </p>
                                </aside>
                            </Theme>
                        </Column>
                        <Column sm={{span: 0}} md={{span: 0}} lg={{span: 1}} />
                        <Column sm={{span: 4}} md={{span: 8}} lg={{span: 8}} className="rightPanel">
                            <Theme theme="white">
                                <main aria-labelledby="options">
                                    <div id="options" className="checker-options">IBM Accessibility Checker options</div>

                                    <div className="rule-sets">Rule sets</div>

                                    <div>
                                        <div className="select-a-rule-set" style={{ marginTop: "1rem" }}>
                                            Select a rule set deployment date
                                            <Button
                                                renderIcon={Information}
                                                kind="ghost"
                                                hasIconOnly iconDescription="Rule set info" tooltipPosition="top"
                                                style={{
                                                    color: "black", border: "none", verticalAlign: "baseline", minHeight: "28px",
                                                    paddingTop: "8px", paddingLeft: "8px", paddingRight: "8px", paddingBottom:"8px"
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

                                    <div className="select-a-rule-set" style={{ marginTop: "1rem" }}>
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
                                    </Modal>

                                    <div className="rule-sets" style={{marginTop:"57px"}}>Keyboard checker mode</div>
                                    <div style={{marginBottom:"2rem"}}>
                                        <fieldset className="cds--fieldset" style={{marginBottom:"24px"}}>
                                            <legend className="cds--label">Visualization options</legend>
                                            <Checkbox 
                                                labelText="Lines connecting tab stops" 
                                                id="checked"
                                                checked={this.state.tabStopLines}
                                                //@ts-ignore
                                                onChange={(value: any, id: any) => {
                                                    // console.log("lines checkbox id.checked = ",id.checked);
                                                    this.setState({ tabStopLines: id.checked });
                                                }} 

                                            />
                                            <Checkbox 
                                                labelText="Element outlines" 
                                                id="checked-2"
                                                checked={this.state.tabStopOutlines}
                                                //@ts-ignore
                                                onChange={(value: any, id: any) => {
                                                    // console.log("lines checkbox id.checked = ",id.checked);
                                                    this.setState({ tabStopOutlines: id.checked });
                                                }} 
                                            />
                                        </fieldset>

                                        <Toggle
                                            aria-label="toggle button"
                                            labelText="Alert Notifications"
                                            id="alertToggle"
                                            toggled={this.state.tabStopAlerts}
                                            onToggle={(value: any) => {
                                                // console.log("lines checkbox value = ",value);
                                                this.setState({ tabStopAlerts: value });
                                            }} 
                                        />
                                    </div>

                                    <div className="buttonRow">
                                        <Button
                                            disabled={false}
                                            kind="tertiary"
                                            onClick={this.handleReset}
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
