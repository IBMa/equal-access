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

import { IArchiveDefinition, IPolicyDefinition, ISettings } from "../interfaces/interfaces";
import { getBGController } from "../background/backgroundController";
// import { getDevtoolsController } from "../devtools/devtoolsController";
import { DocPage } from "../docs/components/DocPage";

import {
    Button,
    ButtonSet,
    Checkbox, 
    Dropdown, 
    DropdownSkeleton,
    InlineLoading,
    InlineNotification,
    Link,
    Modal,
    Toggle
} from "@carbon/react";

import { 
    Information,
    Restart, 
    Save
} from "@carbon/react/icons";

import "./option.scss";
import { getDevtoolsController } from "../devtools/devtoolsController";

interface OptionsAppState {
    lastSettings?: ISettings
    archives: IArchiveDefinition[];
    selected_archive: IArchiveDefinition | null;
    rulesets: IPolicyDefinition[];
    selected_ruleset: IPolicyDefinition | null;
    modalRuleSet: boolean;
    modalGuidelines: boolean;
    // Keyboard Checker Mode options
    tabStopLines: boolean;
    tabStopOutlines: boolean;
    tabStopAlerts: boolean;
    tabStopFirstTime: boolean;
    // Change Ruleset while there are stored scans
    storedScansExist: boolean;
    modalDeploymentWithScans: boolean;
    modalGuidelinesWithScans: boolean;
    savePending: number;
}

let bgController = getBGController();

export class OptionsApp extends React.Component<{}, OptionsAppState> {
    state: OptionsAppState = {
        archives: [],
        selected_archive: null,
        rulesets: [],
        selected_ruleset: null,
        modalRuleSet: false,
        modalGuidelines: false,
         // Keyboard Checker Mode options
        tabStopLines: true,
        tabStopOutlines: false,
        tabStopAlerts: true,
        tabStopFirstTime: true,
        // Change Ruleset while there are stored scans
        storedScansExist: false,
        modalDeploymentWithScans: false,
        modalGuidelinesWithScans: false,
        savePending: 0
    };

    async componentDidMount() {
        let self = this;
        let settings = await bgController.getSettings();
        let archives = await bgController.getArchives();
        let selected_archive: IArchiveDefinition | null = null;
        let rulesets: IPolicyDefinition[] | null = null;
        let selectedRulesetId: string | null = null;
        // Keyboard Mode options
        let tabStopLines: boolean = true;
        let tabStopOutlines: boolean = false;
        let tabStopAlerts: boolean = true;
        let tabStopFirstTime: boolean = true;

        let storedScansExist =  await this.existStoredScans();

        selected_archive = settings.selected_archive;
        rulesets = selected_archive.rulesets.default;
        selectedRulesetId = settings.selected_ruleset.id;
        tabStopLines = settings.tabStopLines;
        tabStopOutlines = settings.tabStopOutlines;
        tabStopAlerts = settings.tabStopAlerts;
        tabStopFirstTime = settings.tabStopFirstTime;
        if (selected_archive) {
            if (archives.some((archive: IArchiveDefinition) => (selected_archive && archive.id === selected_archive.id && archive.name === selected_archive.name))) {
                // do nothing
            } else if (archives.some((archive: IArchiveDefinition) => (selected_archive && archive.id === selected_archive.id))) {
                // Name change
                selected_archive.name = archives.find((archive: IArchiveDefinition) => (archive.id === selected_archive!.id))!.name;
            } else {
                // Archive missing
                selected_archive = null;
            }
        }
        if (!selected_archive) {
            // No pre-selected archive
            selected_archive = self.getLatestArchiveDefinition(archives);
            rulesets = self.getGuidelines(selected_archive);
            selectedRulesetId = rulesets[0].id;
        }

        self.setState({
            lastSettings: settings,
            archives: archives, 
            selected_archive: selected_archive, 
            rulesets: rulesets,
            selected_ruleset: this.getGuideline(selected_archive, selectedRulesetId!),
            tabStopLines: tabStopLines, tabStopOutlines: tabStopOutlines,
            tabStopAlerts: tabStopAlerts, tabStopFirstTime: tabStopFirstTime,
            storedScansExist: storedScansExist,
        });

        

        bgController.addSettingsListener(async (newSettings) => {
            let newState : any = {
                lastSettings: newSettings
            };
            let checkKeys = [ "tabStopAlerts" ];
            for (const key of checkKeys) {
                if ((this.state.lastSettings as any)[key] !== (newSettings as any)[key]) {
                    newState[key] = (newSettings as any)[key];
                }
            }
            this.setState(newState);
        });
    }

    setModalDeploymentWithScans() {
        this.setState({modalDeploymentWithScans: true});
    }

    setModalGuidelinesWithScans() {
        this.setState({modalGuidelinesWithScans: true});
    }

    async existStoredScans() {
        let tabStoredScans = (await getBGController().getSessionState()).tabStoredCount;
        let existScans = false;
        for (const tabId in tabStoredScans) {
            if (tabStoredScans[tabId] > 0) {
                existScans = true;
            }
        }
        return existScans;
    }

    async clearStoredScans() {
        let tabStoredScans = (await getBGController().getSessionState()).tabStoredCount;
        for (const tabId in tabStoredScans) {
            if (tabStoredScans[tabId] > 0) {
                getDevtoolsController(false, "remote", parseInt(tabId)).clearStoredReports();
            }
        }
        this.setState({storedScansExist: false});
    }

    /**
     * Return the archive definition corresponding to the 'latest' id
     * @param archives 
     * @returns 
     */
    getLatestArchiveDefinition(archives: IArchiveDefinition[]) : IArchiveDefinition{
        return archives.find((archive: IArchiveDefinition) => {
            return archive.id === "latest";
        })!;
    };

    /**
     * Get all of the guideline/policy definitions
     * @param selected_archive 
     * @returns 
     */
    getGuidelines(selected_archive: IArchiveDefinition) : IPolicyDefinition[] {
        return selected_archive.rulesets.default;
    };

    /**
     * Get guideline definition in the archive for the specificed guidlineId
     * @param archive 
     * @param guidelineId 
     * @returns 
     */
    getGuideline(archive: IArchiveDefinition, guidelineId: string) : IPolicyDefinition {
        let retVal = archive.rulesets.default.find((pol => pol.id === guidelineId))!;
        return retVal;
    }

    /**
     * Action to perform when an archive is selected
     * @param item 
     */
    async onSelectArchive (item: any) {
        let rulesets = this.getGuidelines(item.selectedItem);
        let selected_ruleset = rulesets[0];
        this.setState({
            selected_archive: item.selectedItem,
            rulesets,
            selected_ruleset
        });
    };

    /**
     * Action to perform when a guideline is selected
     * @param item 
     */
    onSelectGuideline(item: any) {
        this.setState({ selected_ruleset: item.selectedItem });
    };

    /**
     * Action to perform when settings are saved
     * @param item 
     */
    async onSave() {
        // TODO if there are stored scans we need to put up modal
        //      modal choices  
        //            delete scans and update ruleset
        //            keep stored scans and don't update rulset (ali says don't give this choice)

        this.setState({ 
            tabStopFirstTime: false,
         })
         let newSettings: ISettings = this.settingsFromState()
         this.setState({ savePending: 1 });
         await bgController.setSettings(newSettings);
         setTimeout(() => { 
             this.setState({ savePending: 2 })
             setTimeout(() => { 
                 this.setState({ lastSettings: newSettings, savePending: 0 })
                 setTimeout(() => {
                     document.getElementById("saveButton")!.focus();
                 }, 0);
             }, 500);
         }, 300);
    };

    /**
     * Generate a settings object from the current state
     * @returns 
     */
    settingsFromState() : ISettings {
        let retVal : ISettings = JSON.parse(JSON.stringify(this.state.lastSettings));
        retVal.selected_archive = this.state.selected_archive!;
        retVal.selected_ruleset = this.state.selected_ruleset!;
        retVal.tabStopLines = this.state.tabStopLines;
        retVal.tabStopAlerts = this.state.tabStopAlerts;
        retVal.tabStopFirstTime = this.state.tabStopFirstTime;
        retVal.tabStopOutlines = this.state.tabStopOutlines;
        return retVal;
    }

    /**
     * Determine if the settings are the same as the loaded settings
     * @returns 
     */
    settingsEqual() : boolean {
        if (!this.state.lastSettings) return true;
        let newSettings = this.settingsFromState();
        for (const key in newSettings) {
            switch (key) {
                case "selected_ruleset":
                case "selected_archive":
                    if (this.state.lastSettings[key].id !== newSettings[key].id) {
                        return false;
                    }
                    break;
                default:
                    if ((this.state.lastSettings as any)[key] !== (newSettings as any)[key]) {
                        return false;
                    }
            }
        }
        return true;
    }

    /**
     * Action to perform on the reset button
     */
    onReset() {
        let selected_archive: IArchiveDefinition = this.getLatestArchiveDefinition(this.state.archives);
        let selected_ruleset: IPolicyDefinition = selected_archive.rulesets.default[0];

        this.setState({
            selected_archive,
            selected_ruleset,
            tabStopLines: true,
            tabStopOutlines: true,
            tabStopAlerts: true,
            tabStopFirstTime: false
        });
    };

    render() {
        // BrowserDetection.setDarkLight();
        let {
            archives,
            selected_archive,
            rulesets,
            selected_ruleset
        } = {
            ...this.state,
        };
        // only show keyboard first time notification on first time 
        // user uses the keyboard visualization - note it is can be 
        // reset with "Reset to defaults"

        let aside = (<>
            <aside aria-label="About Accessibility Checker Options">
            <p>
                By default, the Accessibility Checker uses a set of rules that correspond to 
                the most recent WCAG standards plus some additional IBM requirements. Rule sets 
                for specific WCAG versions are also available. The rule sets are updated regularly, 
                and each update has a date of deployment. If you need to replicate an earlier test, 
                choose the deployment date of the original test.
            </p>
            <p>
                For more in-depth guidance, see <Link 
                    size="lg"
                    inline={true}
                    href={chrome.runtime.getURL("usingAC.html")}
                    target="_blank"
                    rel="noopener noreferred"
                >user guide</Link>.
            </p>
        </aside>
        </>)
        return (<DocPage aside={aside} sm={4} md={6} lg={6}>
            <main aria-labelledby="options">
                <h1 id="options">IBM Accessibility Checker options</h1>
                {!archives || !rulesets && <>
                    <InlineNotification
                        kind="error"
                        lowContrast={true}
                        hideCloseButton={true}
                        title="An error occurred while loading this page"
                        subtitle="Please check your internet connection and try again."
                    />
                    <p> Please also follow <Link 
                        href={chrome.runtime.getURL("usingAC.html")} 
                        target="_blank" 
                        rel="noopener noreferred"
                        inline={true}
                        size="lg">User Guide</Link> to give the browser permission to run the Option page. </p>
                </>}
                { archives && rulesets && <>
                    <h2>Rule sets</h2>

                    {/**** Select archive  */}
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

                        {/* JCH - Need to check if there are scans, storedReportsCount > 0 
                            but we need to make a state and set it in componentDidMount
                        */}
                        {console.log("storedScansExist = ", this.state.storedScansExist)}

                        {!this.state.selected_archive && <DropdownSkeleton />}
                        
                        {this.state.selected_archive && <>
                            <Dropdown
                                ariaLabel="Select a rule set deployment date"
                                disabled={false}
                                helperText={this.state.selected_archive && ("Currently active: " + this.state.lastSettings?.selected_archive!.name)}
                                id="archivedRuleset"
                                items={archives}
                                itemToString={(item: any) => (item ? item["name"] : "")}
                                label="Rule set deployment date"
                                light={false}
                                titleText=""
                                type="default"
                                selectedItem={selected_archive}
                                onChange={async (evt: any) => {
                                    await this.onSelectArchive(evt);
                                    if (this.state.storedScansExist) {
                                        this.setModalDeploymentWithScans();
                                    }
                                }}
                            />
                        </>}

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

                            <p style={{ maxWidth: "100%" }}>For details on rule set changes between deployments, see <Link inline={true} size="md" className="link" href="https://www.ibm.com/able/requirements/release-notes" target="_blank" style={{ color: '#002D9C' }}>Release notes</Link></p>
                        </Modal>

                        <Modal
                            modalHeading="Stored scans"
                            primaryButtonText="Change deployment dates" 
                            secondaryButtonText="Cancel"
                            open={this.state.modalDeploymentWithScans}
                            onRequestClose={(() => {
                                this.setState({ modalDeploymentWithScans: false });
                            }).bind(this)}
                            onRequestSubmit={(() => {
                                this.clearStoredScans();
                                this.setState({ modalDeploymentWithScans: false });
                                }).bind(this)
                            }
                        >
                            <p>Changing the rule set deployment dates will delete any currently stored scans.</p>
                        </Modal>

                    </div>
                    {/**** Select ruleset / policy  */}
                    <div>
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

                        {!this.state.selected_archive && <DropdownSkeleton />}
                        {this.state.selected_archive && <>
                            <Dropdown
                                ariaLabel="Select accessibility guidelines"
                                disabled={false}
                                helperText={this.state.selected_ruleset && ("Currently active: " + this.getGuideline(this.state.lastSettings?.selected_archive!, this.state.lastSettings?.selected_ruleset.id!).name)}
                                id="rulesetSelection"
                                items={rulesets}
                                itemToString={(item: any) => (item ? item["name"] : "")}
                                label="Guideline selection"
                                light={false}
                                titleText=""
                                type="default"
                                selectedItem={selected_ruleset}
                                onChange={async (evt: any) => {
                                    await this.onSelectGuideline(evt);
                                    if (this.state.storedScansExist) {
                                        this.setModalGuidelinesWithScans();
                                    }
                                }}
                            />
                        </>}

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
                    </div>

                    <Modal
                        modalHeading="Stored scans"
                        primaryButtonText="Change Guidelines" 
                        secondaryButtonText="Cancel"
                        open={this.state.modalGuidelinesWithScans}
                        onRequestClose={(() => {
                            this.setState({ modalGuidelinesWithScans: false });
                        }).bind(this)}
                        onRequestSubmit={(() => {
                            this.clearStoredScans();
                            this.setState({ modalGuidelinesWithScans: false });
                            }).bind(this)
                        }
                    >
                        <p>Changing the rule set deployment dates will delete any currently stored scans.</p>
                    </Modal>


                    <h2>Keyboard checker mode</h2>
                    <div>
                        <div style={{marginTop: "1rem"}} />
                        <fieldset className="cds--fieldset">
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
                        <div style={{marginTop: "1rem"}} />
                        <Toggle
                            aria-label="toggle button"
                            labelText="Alert Notifications"
                            id="alertToggle"
                            toggled={this.state.tabStopAlerts}
                            onToggle={(value: any) => {
                                this.setState({ tabStopAlerts: value });
                            }} 
                        />
                    </div>
                    <div style={{marginTop: "1.5rem"}} />
                    <ButtonSet>
                        <Button
                            disabled={false}
                            kind="tertiary"
                            onClick={this.onReset.bind(this)}
                            renderIcon={Restart}
                            size="default"
                            tabIndex={0}
                            type="button"
                            style={{maxWidth: "calc(50% - .5rem"}}
                        >
                            Reset to defaults
                        </Button>
                        {this.state.savePending > 0 && <InlineLoading
                            style={{ marginLeft: '1rem' }}
                            description={"Saving"}
                            status={this.state.savePending === 1 ? 'active' : 'finished'}
                        />}
                        {this.state.savePending === 0 && <Button
                            id="saveButton"
                            disabled={this.settingsEqual()}
                            kind="primary"
                            onClick={this.onSave.bind(this)}
                            renderIcon={Save}
                            size="default"
                            tabIndex={0}
                            type="button"
                            style={{marginLeft: "1rem", maxWidth: "calc(50% - .5rem"}}
                        >
                            Save
                        </Button>}
                    </ButtonSet>
                </>}
            </main>
        </DocPage>);
    }
}

