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

import { Grid } from "@carbon/react";
import { IReport, 
    IReportItem, 
    valueMap
} from "./Report";

import Violation16 from "../../assets/Violation16.svg";
import NeedsReview16 from "../../assets/NeedsReview16.svg";
import Recommendation16 from "../../assets/Recommendation16.svg";

import "../styles/subpanel.scss";
import "../styles/reportTabStops.scss";

interface IReportTabStopsState {
}

interface IReportTabStopsProps {
    report: IReport,
    tabStopsHighlight: (index: number, result: any) => void,
    tabStopsResults: IReportItem[] // Note: the collection is actually all issues that are tab stops
}

interface IGroup {
    title: string,  // aria path for the element role row
    counts: { [key: string]: number },   // number of Violations, Needs Review, Recommendations 
                                        // associated with the element role
    fvCounts: { [key: string]: number },
    items: IReportItem[]    // issue rows associated with the element role
};

export default class ReportTabStops extends React.Component<IReportTabStopsProps, IReportTabStopsState> {
    state: IReportTabStopsState = {};      
    
    componentDidMount() {
        // console.log("JCH - ReportTabStops");
    }

    printTabStops() {
        // console.log("printTabStops");

        // console.log("JCH make groups for tabs");
        let itemIdx = 0;
        let groups : IGroup[] = []   
        let groupMap : {
            [key: string]: IGroup
        } | null = {};
        if (this.props.report !== null) {
            this.props.tabStopsResults.map((result:any) => { // for each tab stop
                
                for (const item of this.props.report.results) {  // for each issue
                    if (item.value[1] === "PASS") {
                        continue;
                    }
                    // console.log("tabStop ",index, " aria path: ",result.path.aria, item.path.aria);
                    item.itemIdx = itemIdx++;
                    // group by element role === aria path
                    // if (item.path.aria === result.path.aria) {
                    //     console.log("Found match");
                    // } else {
                    //     console.log("Match not found");
                    // }
                        
                    if (item.path.aria === result.path.aria) {
                        let thisGroup = (groupMap![item.path.aria]);
                        if (!thisGroup) {
                            thisGroup = {
                                title: result.path.aria,
                                counts: {},
                                fvCounts: {},
                                items: []
                            }
                            groupMap![item.path.aria] = thisGroup;
                            groups.push(thisGroup);
                        }
                        thisGroup.items.push(item);
                        let val = valueMap[item.value[0]][item.value[1]] || item.value[0] + "_" + item.value[1];
                        thisGroup.counts[val] = (thisGroup.counts[val] || 0) + 1;
                        if (item.selected || item.selectedChild) {
                            thisGroup.fvCounts[val] = (thisGroup.fvCounts[val] || 0) + 1;
                        }
                    }
                }
                // console.log("groups before sort = ",groups);

                // JCH - now for tab stops we need to sort issues 
                // according to type in order Violations, Needs Review, Recommendations
                // within each group (i.e., a Tab Stop element) need to sort the items according to their value
                const valPriority = ["Violation", "Needs review", "Recommendation"];
                let groupVals = [];
                groups.map(group => {
                    groupVals.length = 0;
                    group.items.sort( function(a,b) {
                        let aVal = valueMap[a.value[0]][a.value[1]] || a.value[0] + "_" + a.value[1];
                        let bVal = valueMap[b.value[0]][b.value[1]] || b.value[0] + "_" + b.value[1];
                        let aIndex = valPriority.indexOf(aVal);
                        let bIndex = valPriority.indexOf(bVal);
                        return aIndex - bIndex;
                    })
                })
                
            })
            // console.log("groups = ",groups);
            
        }
    

        let temp:any = [];
        let vCount = 1;
        let nrCount = 1;
        let rCount = 1;
        // console.log("Render Tab Stops");
        if (this.props.tabStopsResults !== undefined) {
            this.props.tabStopsResults?.map((result: any, index:number) => {
                temp.push(
                    <Grid style={{marginTop:"0px",paddingLeft: "2rem",height:"100%"}}>
                        <div className="emulated-flex-gap">
                            <div className="tabStopsContent" style={{width:"52px",marginBottom:"14px"}}>
                                {index+1}
                            </div>
                            <div className="tabStopsContent" style={{width:"110px", marginBottom:"14px"}}>
                                { <span style={{whiteSpace:"nowrap"}}>{ vCount > 0 && <><img src={Violation16} style={{verticalAlign:"middle",marginBottom:"12px"}} alt="Violation" /><span style={{verticalAlign:"text-top",lineHeight:"8px", paddingLeft:"4px"}}>{vCount}</span> &nbsp;</>}</span> }
                                { <span style={{whiteSpace:"nowrap"}}>{ nrCount > 0 && <><img src={NeedsReview16} style={{verticalAlign:"middle",marginBottom:"12px"}} alt="Needs review" /><span style={{verticalAlign:"text-top",lineHeight:"8px", paddingLeft:"4px"}}>{nrCount}</span> &nbsp;</>}</span> }
                                { <span style={{whiteSpace:"nowrap"}}>{ rCount > 0 &&  <><img src={Recommendation16} style={{verticalAlign:"middle",marginBottom:"10px"}} alt="Recommendation" /><span style={{verticalAlign:"text-top",lineHeight:"8px", paddingLeft:"4px"}}>{rCount}</span> </>}</span> }
                            </div>
                            <div className="tabStopsContent" style={{width:"70px",marginBottom:"14px"}}>
                                <a href="#" onClick={() => {
                                    //@ts-ignore
                                    this.props.tabStopsHighlight(index, result);
                                }}>
                                {result.apiArgs[0].role}</a>
                            </div>
                            <div className="tabStopsContent" style={{marginBottom:"14px", width:"150px"}}>
                                {result.apiArgs[0].name}
                            </div>
                        </div>
                    </Grid>
                );
            });
            // console.log("temp = ", temp);
            return temp;
        }
        
    }

    render() {
        // console.log("start TabStops render");

        return <div style={{height: "100%", width: "100%", paddingLeft: "0rem"}}>
            <Grid style={{marginTop:"64px",paddingLeft: "1rem",height:"100%"}}>
                <div className="stored-scans" style={{marginBottom:"14px"}}>
                    Tab stops summary
                </div>
            </Grid>
            <Grid style={{marginTop:"0px",paddingLeft: "2rem",height:"100%"}}>
                <div className="emulated-flex-gap">
                    <div className="summaryBarCounts" style={{width:"52px",marginBottom:"14px"}}>
                        Index
                    </div>
                    <div className="summaryBarCounts" style={{width:"110px", marginBottom:"14px"}}>
                        Issues
                    </div>
                    <div className="summaryBarCounts" style={{width:"70px",marginBottom:"14px"}}>
                        Role
                    </div>
                    <div className="summaryBarCounts" style={{marginBottom:"14px"}}>
                        Name
                    </div>
                </div>
            </Grid>
            {/* {console.log("call printTabStops")} */}
            {this.printTabStops()}
        </div>
    }
}
