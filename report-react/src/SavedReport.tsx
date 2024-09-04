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
import "./SavedReport.scss";
import { ISavedReportData, IReportItem } from './IReport';
import ScoreCard from './ScoreCard';
import SummScoreCard from './SummScoreCard';
import ReportChecklist from './report/ReportChecklist';
import ReportRules from './report/ReportRules';
import { ComposedModal, ModalHeader, ModalBody, Grid, Column, Theme, Tabs, TabList, TabPanel, Tab, TabPanels ,Dropdown,MultiSelect} from '@carbon/react';
import { UtilIssueReact } from "./util/UtilIssueReact";
import { filterController } from "./FilterController";
import { Violation16,NeedsReview16,Recommendation16 } from "./util/UtilIssueReact";


interface SavedReportProps {
    reportData: ISavedReportData | null
}

interface SavedReportState {
    selectedItem: IReportItem | null;
    reportViewState:'Requirements'|'Rules'|'Element roles';
    selectedItems: Array<{ id: string; text: string; checked: boolean }>; 

}
const filterItems = [
    { id: '0', text: 'Violations' },
    { id: '1', text: 'Needs review' },
    { id: '2', text: 'Recommendations' },
    { id: '3', text: 'Hidden' },
]
const viewItems = ["Element roles", "Requirements","Rules"];


export class SavedReport extends React.Component<SavedReportProps, SavedReportState> {
    state: SavedReportState = {
        selectedItem: null,
        reportViewState: "Element roles",
        selectedItems: filterController.getFilters().filter(item => item.id!=='3'), 

    }


    selectItem(item: IReportItem) {
        this.setState({ selectedItem: item });
    }

    clearItem() {
        this.setState({ selectedItem: null });
    }
  
    handleFilterChange = (selectedItems: Array<{ id: string; text: string }>) => {
        const updatedFilters = filterController.getFilters().map(filter => ({
          ...filter,
          checked: selectedItems.some(selected => selected.id === filter.id),
        }));
        filterController.setFilters(updatedFilters);

        this.setState({
          selectedItems: updatedFilters.filter(item => item.checked),
        });
      };
    render() {
       
console.log("data",this.props.reportData)
        if (!this.props.reportData) {
            return <React.Fragment>Report Error</React.Fragment>
        }
        let rs = this.props.reportData.rulesets[0];
        for (const ruleset of this.props.reportData.rulesets) {
            if (ruleset.id === "IBM_Accessibility") {
                rs = ruleset;
            }
        }
        let violations = 0;
        let needReview = 0;
        let recommendation = 0;
        for (const issue of this.props.reportData.report.results) {
            if (issue.value[0] === "VIOLATION" && issue.value[1] === "FAIL") {
                ++violations;
            } else if (issue.value[0] === "VIOLATION" && (issue.value[1] === "POTENTIAL" || issue.value[1] === "MANUAL")) {
                ++needReview;
            } else if (issue.value[0] === "RECOMMENDATION") {
                ++recommendation;
            }
        }
        return <div
            role="main"
            id="main-content"
        >
            <Theme theme="g10">
                <div>
                    <Grid>
                        <Column sm={2} md={8} lg={4}>
                            <div className="summInfo">
                                <h1 className="prodName">
                                    IBM <strong>Accessibility</strong><br />
                                    Equal Access Toolkit:<br />
                                    Accessibility Checker Report<br />
                                </h1>
                                
                            </div>
                        </Column>
                        <Column sm={4} md={8} lg={12} role="region" aria-label="Report overview: current status">
                            <SummScoreCard title="Current status" report={this.props.reportData.report} />
                        </Column>
                    </Grid>
                    <section aria-label="Report overview: score cards">
                        <Grid>
                            <Column sm={2} md={4} lg={4}>
                                <div className="time" style={{paddingTop:"12px"}}>{new Date(this.props.reportData.report.timestamp).toLocaleString()}</div>
                                <div className="url"><strong>Scanned page:</strong> {this.props.reportData.tabURL}</div>
                            </Column>
                            <Column sm={2} md={4} lg={4}>
                                <ScoreCard count={violations} title="Violations" icon={Violation16}>
                                    Accessibility failures that need to be corrected
                                </ScoreCard>
                            </Column>
                            <Column sm={2} md={4} lg={4}>
                                <ScoreCard count={needReview} title="Needs review" icon={NeedsReview16}>
                                    Issues that may not be a violation; manual review is needed
                                </ScoreCard>
                            </Column>
                            <Column sm={2} md={4} lg={4}>
                                <ScoreCard count={recommendation} title="Recommendations" icon={Recommendation16}>
                                    Opportunities to apply best practices to further improve accessibility
                                </ScoreCard>
                            </Column>
                        </Grid>
                    </section>
                    <section>
                        <Grid>
                            <Column sm={4} md={8} lg={{offset: 4, span: 12}}>
                                <div className="summReport">
                                    <div style={{display:"flex",float:"right",gap:"1rem"}}>
                                <MultiSelect
                                    className="viewMulti"
                                    ariaLabel="Issue type filter"
                                    label="Filter"
                                    size="sm" 
                                    hideLabel={true}
                                    // disabled={totalCount === 0}
                                    id="filterSelection"
                                    items={filterItems}
                                    itemToString={(item:any) => (item ? item.text : '')}
                                    itemToElement={(item:any) => {
                                            if (item && item.id === "0") {
                                                return <span>{UtilIssueReact.valueSingToIcon("Violation", "reportSecIcon")} {item.text}</span>
                                            } else if (item && item.id === "1") {
                                                return <span>{UtilIssueReact.valueSingToIcon("Needs review", "reportSecIcon")} {item.text}</span>
                                            } else if (item && item.id === "2") {
                                                return <span>{UtilIssueReact.valueSingToIcon("Recommendation", "reportSecIcon")} {item.text}</span>   
                                            } else if (item && item.id === "3") {
                                                return <span>{UtilIssueReact.valueSingToIcon("ViewOff", "reportSecIcon")} {item.text}</span>
                                            }
                                            return <></>
                                        }
                                    }
                                    light={false}
                                    type="default"
                                    selectedItems={filterController.getFilters()}
                                    initialSelectedItems={filterController.getFilters()}
                                    onChange={(event: { selectedItems: Array<{ id: string; text: string }> }) =>
                                      this.handleFilterChange(event.selectedItems)
                                    }
                                />
                                <Dropdown
                                    className="viewMulti"
                                    ariaLabel="Select report view"
                                    // disabled={totalCount === 0}
                                    id="reportView"
                                    size="sm" 
                                    items={viewItems}
                                    light={false}
                                    type="default"
                                    style={{width:"160px", float: "right"}}
                                    selectedItem={this.state.reportViewState}
                                    onChange={async (evt: any) => {
                                        // set state
                                        this.setState({ reportViewState: evt.selectedItem });
                                    }}
                                />
                                </div>
                       
                                    {this.state.reportViewState === "Requirements" && <>
                                        <div style={{marginTop:"4rem"}}  role="table" aria-label="Issues grouped by checkpoint">
                                                    <ReportChecklist selectItem={this.selectItem.bind(this)} report={this.props.reportData.report} ruleset={rs} />
                                                </div>
                                    </>}
                                    {this.state.reportViewState === "Rules" && <>
                                        <div  style={{marginTop:"4rem"}} role="table" aria-label="Issues grouped by checkpoint">
                                                    <ReportRules selectItem={this.selectItem.bind(this)} report={this.props.reportData.report} />
                                                </div>
                                    </>}
                                    {/* <Tabs>
                                        <TabList aria-label="Report details">
                                            <Tab>Requirements</Tab>
                                            <Tab>Rules</Tab>
                                        </TabList>
                                        <TabPanels>
                                            <TabPanel>
                                                <div style={{margin: "0rem -1rem"}} role="table" aria-label="Issues grouped by checkpoint">
                                                    <ReportChecklist selectItem={this.selectItem.bind(this)} report={this.props.reportData.report} ruleset={rs} />
                                                </div>
                                            </TabPanel>
                                            <TabPanel>
                                                <div style={{margin: "0rem -1rem"}} role="table" aria-label="Issues grouped by checkpoint">
                                                    <ReportRules selectItem={this.selectItem.bind(this)} report={this.props.reportData.report} />
                                                </div>
                                            </TabPanel>
                                        </TabPanels>
                                    </Tabs> */}
                                </div>
                            </Column>
                        </Grid>
                    </section>
                </div>
                <ComposedModal
                    open={!!this.state.selectedItem}
                    onClose={this.clearItem.bind(this)}
                >
                    <div onClick={(evt) => { 
                        let tgt : HTMLElement | null = evt.target as HTMLElement;
                        while (tgt && tgt.nodeName.toLowerCase() !== "button") {
                            tgt = tgt.parentElement;
                        }
                        if (tgt && tgt.getAttribute("class") === "cds--modal-close") {
                            this.clearItem();
                            evt.preventDefault();
                            return false;
                        }
                    }}>
                        <ModalHeader onClose={this.clearItem.bind(this)} />
                    </div>
                    <ModalBody aria-label="This modal has scrolling content">
                        {this.state.selectedItem && <iframe title="Accessibility Checker Help" style={{position: "absolute", width: "calc(100% - 1rem)", height: "100%"}} src={this.state.selectedItem.help} />}
                    </ModalBody>
                </ComposedModal>
            </Theme>
        </div>
    }
}
