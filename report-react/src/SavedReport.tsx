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
import SummScoreCard from './SummScoreCard';
import ReportChecklist from './report/ReportChecklist';
import ReportRules from './report/ReportRules';
import { ComposedModal, ModalHeader, ModalBody, Grid, Column, Theme,Dropdown,MultiSelect,CopyButton} from '@carbon/react';
import { UtilIssueReact } from "./util/UtilIssueReact";
import { Violation16,NeedsReview16,Recommendation16,ViewOff16 } from "./util/UtilImages";
import ReportElements from "./report/ReportElements";
import ScoreCard from "./ScoreCard";


interface SavedReportProps {
    reportData: ISavedReportData | null
}

interface SavedReportState {
    selectedItem: IReportItem | null;
    reportViewState:'Requirements'|'Rules'|'Element roles';
    selectedItems: Array<{ id: string; text: string }>; 

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
        selectedItems: filterItems.filter(item => item.id!=='3'), 

    }


    selectItem(item: IReportItem) {
        this.setState({ selectedItem: item });
    }

    clearItem() {
        this.setState({ selectedItem: null });
    }
  
    handleFilterChange = (selectedItems: Array<{ id: string; text: string }>) => {
       this.setState({selectedItems})
       
      };
      handleCardClick=(filterItem:string)=>{
        if(this.state.selectedItems.some((item)=>item.text===filterItem)){
            let updatedFilter=this.state.selectedItems.filter((item)=>item.text!==filterItem);
            this.setState({selectedItems:updatedFilter});
        }else{
            let updatedFilter=filterItems.filter((item)=>item.text===filterItem)[0]
            this.setState({selectedItems:[...this.state.selectedItems,updatedFilter]})
        }
      }
    copyToClipboard = () => {
          if(this.props.reportData)
        navigator.clipboard.writeText(this.props.reportData.tabURL)
      };

    render() {
       

        function issueBaselineMatch(baselineIssue: { ruleId: string, reasonId: string, path: { dom: string }, messageArgs: string[] }, issue: any) {
            const ruleIdMatch = baselineIssue.ruleId === issue.ruleId;
            const reasonIdMatch = baselineIssue.reasonId === issue.reasonId;
            const pathDomMatch = baselineIssue.path?.dom === issue.path?.dom;       
            return ruleIdMatch && reasonIdMatch && pathDomMatch ;
        }
        
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
        let hidden=0;
        for (const issue of this.props.reportData.report.results) {
            const isHidden = this.props.reportData?.report?.ignored && this.props.reportData?.report?.ignored.some(ignoredIssue => issueBaselineMatch(issue as any, ignoredIssue));

            if (issue.value[0] === "VIOLATION" && issue.value[1] === "FAIL" && !isHidden) {
                ++violations;
            } else if (issue.value[0] === "VIOLATION" && (issue.value[1] === "POTENTIAL" || issue.value[1] === "MANUAL") && !isHidden) {
                ++needReview;
            } else if (issue.value[0] === "RECOMMENDATION" && !isHidden) {
                ++recommendation;
            } else if(isHidden){
                ++hidden;
            }
        }
        let total=violations+needReview+recommendation;

        const selectedFilters = this.state.selectedItems.map(item => item.text);
        
    
const filteredReport = {
    ...this.props.reportData.report,
    results: this.props.reportData.report.results
        .map(issue => {
            // Check if the issue is hidden
            const isHidden = this.props.reportData?.report?.ignored?.some(ignoredIssue => 
                issueBaselineMatch(issue as any, ignoredIssue)
            );
            // Add the hidden flag to each issue
            return {
                ...issue,
                isHidden: isHidden 
            };
        })
        .filter(issue => {
            // show issues based on selected filter
            if (issue.isHidden && selectedFilters.includes("Hidden")) {
                return true;
            }
            if (selectedFilters.includes("Violations") && issue.value[0] === "VIOLATION" && issue.value[1] === "FAIL" && !issue.isHidden) {
                return true;
            }
            if (selectedFilters.includes("Needs review") && issue.value[0] === "VIOLATION" && (issue.value[1] === "POTENTIAL" || issue.value[1] === "MANUAL") && !issue.isHidden) {
                return true;
            }
            if (selectedFilters.includes("Recommendations") && issue.value[0] === "RECOMMENDATION" && !issue.isHidden) {
                return true;
            }

            return false; 
        })
};

        return <div
            role="main"
            id="main-content"
        >
            <Theme theme="g10">
                <div>
                    <Grid>
                        <Column sm={4} md={8} lg={4}>
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
                        <Column sm={4} md={4} lg={4}>
                        <div className="time" style={{ paddingTop: "12px" }}>
                            {new Date(this.props.reportData.report.timestamp).toLocaleString()}
                        </div>
                        <div
                            style={{
                                gap: "8px", // Add spacing between elements
                            }}
                        >
                            {/* URL with ellipsis */}
                            <div
                            className="url"
                            style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 4, // Limit text to 4 lines
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                wordBreak: "break-word", // Handle long URLs gracefully
                            }}
                            >
                            <strong>Scanned page:</strong>{" "}
                            <span title={this.props.reportData.tabURL}>{this.props.reportData.tabURL}</span>
                            </div>

                            {/* Copy button */}
                            <CopyButton
                                align="bottom-left"
                                iconDescription="Copy page URL to clipboard"
                                onClick={this.copyToClipboard}
                                feedback="Copied!"
                                feedbackTimeout={2000} 
                                style={{
                                    alignSelf: "flex-start", 
                                    marginTop: "4px", 
                                }}
                            />
                        </div>
                        </Column>
                            <Column sm={4} md={4} lg={4}>
                                <ScoreCard count={violations} title="Violations" icon={Violation16} checked={this.state.selectedItems.some((item)=>item.text==="Violations")}
                                    handleCardClick={this.handleCardClick}>
                                    Accessibility failures that need to be corrected
                                </ScoreCard>
                            </Column>
                            <Column sm={4} md={4} lg={4}>
                                <ScoreCard count={needReview} title="Needs review" icon={NeedsReview16} checked={this.state.selectedItems.some((item)=>item.text==="Needs review")}  handleCardClick={this.handleCardClick}>
                                    Issues that may not be a violation; manual review is needed
                                </ScoreCard>
                            </Column>
                            <Column sm={4} md={4} lg={4}>
                                <ScoreCard count={recommendation} title="Recommendations" icon={Recommendation16} checked={this.state.selectedItems.some((item)=>item.text==="Recommendations")}  handleCardClick={this.handleCardClick}>
                                    Opportunities to apply best practices to further improve accessibility
                                </ScoreCard>
                            </Column>
                        </Grid>
                    </section>
                    <section>
                        <Grid>
                            <Column sm={4} md={8} lg={{offset: 4, span: 12}}>
                                <div className="summReport">
                                    <div className="reportGroupFilter">
                                        <div className="iconGroup">
                                    <span className="iconSummary">{Violation16}&nbsp;{violations}</span>
                                    <span className="iconSummary">{NeedsReview16}&nbsp;{needReview}</span>
                                    <span className="iconSummary">{Recommendation16}&nbsp;{recommendation}</span>
                                    <span className="iconSummary">{ViewOff16}&nbsp;{hidden}</span>
                                    <span style={{paddingLeft:"1rem"}}>{total} issues found</span>
                                    </div>
                                    <div style={{display:"flex",float:"right"}}>
                                      <Dropdown
                                    className="viewMulti"
                                    ariaLabel="Select report view"
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
                                    <MultiSelect
                                    className="viewMulti"
                                    ariaLabel="Issue type filter"
                                    label="Filter"
                                    size="sm" 
                                    hideLabel={true}
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
                                    selectedItems={this.state.selectedItems}
                                    initialSelectedItems={this.state.selectedItems}
                                    onChange={(event: { selectedItems: Array<{ id: string; text: string }> }) => this.handleFilterChange(event.selectedItems)}

                                />
                                </div>

</div>
                                {filteredReport.results.length>0 && <>
                                {this.state.reportViewState === "Element roles" && <>
                                        <div style={{marginTop:"4rem"}}  role="table" aria-label="Issues grouped by Element roles">
                                                    <ReportElements selectItem={this.selectItem.bind(this)} report={filteredReport}  />
                                                </div>
                                    </>}
                       
                                    {this.state.reportViewState === "Requirements" && <>
                                        <div style={{marginTop:"4rem"}}  role="table" aria-label="Issues grouped by Requirements">
                                                    <ReportChecklist selectItem={this.selectItem.bind(this)} report={filteredReport} ruleset={rs} />
                                                </div>
                                    </>}
                                    {this.state.reportViewState === "Rules" && <>
                                        <div  style={{marginTop:"4rem"}} role="table" aria-label="Issues grouped by Rules">
                                                    <ReportRules selectItem={this.selectItem.bind(this)} report={filteredReport} />
                                                </div>
                                    </>}
                                    </>}
                                    {filteredReport.results.length===0 &&
                                    <div className="reportTreeGridEmptyText">No issues detected for the chosen filter criteria. To see all issues, select all issue types, and do not filter hidden issues.</div>}
                             
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
