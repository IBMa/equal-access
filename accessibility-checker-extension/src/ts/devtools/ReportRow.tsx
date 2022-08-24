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
 
import React, { RefObject } from "react";

// import ReactTooltip from "react-tooltip";

import { IReportItem, valueMap, ICheckpoint, IReport} from "./Report";

import { ChevronUp, ChevronDown } from '@carbon/react/icons/lib/index';
import Violation16 from "../../assets/Violation16.svg";
import NeedsReview16 from "../../assets/NeedsReview16.svg";
import Recommendation16 from "../../assets/Recommendation16.svg";
import { Column, Grid } from '@carbon/react';
// import { HeaderSideNavItems } from '@carbon/react';

export interface IReportRowGroup {
    checkpoint?: ICheckpoint,
    title: string,
    counts: { [key: string]: number },
    fvCounts: { [key: string]: number },
    items: IReportItem[]
}

interface IReportRowState {
    expanded: boolean,
    lastTimestamp: number,
    scrollTo: boolean
}

interface IReportRowProps {
    idx: number,
    report: IReport,
    group: IReportRowGroup;
    selectItem: (item: IReportItem, checkpoint: ICheckpoint | undefined) => void,
    selectedItem?: IReportItem,
    selectedIssue: IReportItem | null,
    getItem: (item: IReportItem) => void,
    getSelectedItem: (item: IReportItem) => void,
    learnItem: IReportItem | null,
    layout: string,
    dataFromParent: boolean[],
    focusedViewFilter: boolean,
    breakType?: string
}

export default class ReportRow extends React.Component<IReportRowProps, IReportRowState> {
    scrollRef : RefObject<HTMLDivElement> = React.createRef();
    learnRef : RefObject<HTMLAnchorElement> = React.createRef();
    selectedRef : RefObject<HTMLDivElement> = React.createRef();
    lastSelectedRef: RefObject<HTMLDivElement> = React.createRef();

    state: IReportRowState = {
        expanded: false,
        lastTimestamp: this.props.report.timestamp,
        scrollTo: false,
    };

    componentDidMount(){
        this.learnRef.current?.focus();
    }

    setRow(bOpen: boolean) {
        if (this.state.expanded != bOpen) {
            this.setState({ expanded: bOpen});
        }
    }

    toggleRow() {
        this.setState({ expanded: !this.state.expanded });
    }

    onKeyDown(e: any) {
        if (e.keyCode === 13) {
            e.target.click();
        }
    }

    learnMoreClickHandler(e:any, item:IReportItem) {
        e.preventDefault();
        // e.stopPropagation(); // if present learn more clickhandler will not select row
        this.props.getItem(item);
    }

    learnMoreKeyDownHandler(e:any, item:IReportItem) {
        if (e.keyCode === 13) {
            e.preventDefault();
            // e.stopPropagation(); // if present learn more keydown will not select row
            this.props.getItem(item);
        }
    }

    learnMoreRef(item: IReportItem) {
        var learnItem = this.props.learnItem;
        if (learnItem && item.path.dom === learnItem?.path.dom && item.ruleId == learnItem.ruleId) {
            return this.learnRef;
        } 
        return null;
    }

    itemSelectedClickHandler(e:any, item:IReportItem) { 
        // this function runs once per click
        e.preventDefault();
        // e.stopPropagation(); // JCH if present learn more clickhandler will not select row
        this.props.getSelectedItem(item);
        this.props.selectItem(item, this.props.group.checkpoint);
    }

    // @ts-ignore
    itemSelectedRef(item: IReportItem) {
        // this function runs many times per click
        var selectedIssue = this.props.selectedIssue;
        if (selectedIssue && item.path.dom === selectedIssue?.path.dom && item.ruleId == selectedIssue.ruleId) {
            let mythis = this;
            setTimeout(function() {
                if (mythis.selectedRef.current) {
                    mythis.selectedRef.current?.firstElementChild!.classList.add("selectedItem");
                    // @ts-ignore
                    mythis.selectedRef.current?.scrollIntoView({
                        // @ts-ignore
                        block: 'nearest',
                        behavior: 'smooth',
                        inline: 'start'
                    });
                }
            }, 0);
            return this.selectedRef;
        } 
        return null;
    }

    static getDerivedStateFromProps(props: IReportRowProps, state: IReportRowState) {
        if (props.report.timestamp > state.lastTimestamp) {
            return {
                lastTimestamp: props.report.timestamp,
                expanded: false,
                scrollTo: false
            }
        } else if (props.report.filterstamp > state.lastTimestamp) {
            return {
                lastTimestamp: props.report.filterstamp,
                expanded: props.group.items.some(item => item.selected || item.selectedChild),
                scrollTo: props.group.items.some(item => item.scrollTo)
            }
        }
        return {
            scrollTo: false
        }
    }

    rowContentWordBreak(){
        const group = this.props.group;
        if(this.props.breakType == "break-word"){
          return  <span style={{wordBreak:"break-word"}}>{group.title.length === 0 ? "Page" : group.title}</span>
        }else{
            return  <span style={{wordBreak:"break-all"}}>{group.title.length === 0 ? "Page" : group.title}</span>
        }

        return null;
    }

    render() {
        const group = this.props.group;
        let vCount = group.counts["Violation"] || 0;
        let fvVCount = group.fvCounts["Violation"] || 0;
        let nrCount = group.counts["Needs review"] || 0;
        let fvNRCount = group.fvCounts["Needs review"] || 0;
        let rCount = group.counts["Recommendation"] || 0;
        let fvRCount = group.fvCounts["Recommendation"] || 0;
        let open = this.state.expanded;

        if (this.state.scrollTo) {
            setTimeout(() => {
                const element = this.scrollRef.current;
                if (element) {
                    let parentPanel = element.parentElement;
                    while (parentPanel && parentPanel?.getAttribute("role") !== "tabpanel") {
                        parentPanel = parentPanel?.parentElement;
                    }
                    if (parentPanel && parentPanel.getAttribute("aria-hidden") !== "true") {
                        element.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                }
            }, 0)
        }
        // focused view 
        let focusedView:boolean = false; // assume false, i.e., no items in group selected
        if (this.props.focusedViewFilter == true) { // focus switch on Focus
            group.items.map((item) => { // check if any selected in the group
                if (item.selected == true || item.selectedChild == true) {
                    focusedView = true;
                } 
            });
        } else { // focus switch on All
            focusedView = true; // true for every issue
        }

        // calculate the focus view counts
        if (this.props.focusedViewFilter === true) {
            vCount = fvVCount;
            nrCount = fvNRCount;
            rCount = fvRCount;
        }
        
        let rowindex = this.props.idx;
        return <React.Fragment>
            { (this.props.dataFromParent[0] || this.props.dataFromParent[1] && vCount > 0 || this.props.dataFromParent[2] && nrCount > 0 || this.props.dataFromParent[3] && rCount > 0) && focusedView ? 
            <div className="itemRow">
            <Grid tabIndex={0} role="row" aria-rowindex={++rowindex} aria-expanded={open} className="itemHeader" onClick={this.toggleRow.bind(this)} onKeyDown={this.onKeyDown.bind(this)}>
                <Column sm={{span: 2}} md={{span: 2}} lg={{span: 4}} role="cell" className="itemCol">
                    { this.state.scrollTo && <div ref={this.scrollRef}></div>}
                    <span style={{paddingRight:"16px"}}>{open ? <ChevronUp size={16} />: <ChevronDown size={16} />}</span>
                    { <span style={{whiteSpace:"nowrap"}}>{(this.props.dataFromParent[0] || this.props.dataFromParent[1]) && vCount > 0 && <><img src={Violation16} style={{verticalAlign:"middle",marginBottom:"12px"}} alt="Violation" /><span style={{verticalAlign:"text-top",lineHeight:"8px", paddingLeft:"4px"}}>{vCount}</span> &nbsp;</>}</span> }
                    { <span style={{whiteSpace:"nowrap"}}>{(this.props.dataFromParent[0] || this.props.dataFromParent[2]) && nrCount > 0 && <><img src={NeedsReview16} style={{verticalAlign:"middle",marginBottom:"12px"}} alt="Needs review" /><span style={{verticalAlign:"text-top",lineHeight:"8px", paddingLeft:"4px"}}>{nrCount}</span> &nbsp;</>}</span> }
                    { <span style={{whiteSpace:"nowrap"}}>{(this.props.dataFromParent[0] || this.props.dataFromParent[3]) && rCount > 0 &&  <><img src={Recommendation16} style={{verticalAlign:"middle",marginBottom:"10px"}} alt="Recommendation" /><span style={{verticalAlign:"text-top",lineHeight:"8px", paddingLeft:"4px"}}>{rCount}</span> </>}</span> }
                </Column>
                <Column sm={{span: 2}} md={{span: 6}} lg={{span: 12}} role="cell">
                    {this.rowContentWordBreak()}
                </Column>
            </Grid>
            { !open && <Grid className="itemDetail" /> }
            { open && <React.Fragment>
                {group.items.map(item => {
                    let val = valueMap[item.value[0]][item.value[1]];
                        return <React.Fragment>
                        {!this.props.focusedViewFilter || (focusedView && (item.selected || item.selectedChild)) ?
                            (this.props.dataFromParent[0] || this.props.dataFromParent[1] && val === "Violation" || this.props.dataFromParent[2] && val === "Needs review" || this.props.dataFromParent[3] && val === "Recommendation") ?
                            (<div ref={this.itemSelectedRef(item)}>
                                <Grid data-tip data-for={item.selected ? "selectedTip" : "selectedChildTip" } tabIndex={0} role="row" style={{cursor:'pointer'}} aria-rowindex={++rowindex} aria-selected={!!item.selected} className={"itemDetail"+(item.selected ? " selected": "")+(item.selectedChild ? " selectedChild": "")}  onClick={(event: any) => this.itemSelectedClickHandler(event, item)}  onKeyDown={this.onKeyDown.bind(this)}>
                                    <Column sm={{span: 4}} md={{span: 8}} lg={{span: 16}} role="cell" style={{paddingLeft:"28px"}}>
                                        <div className="itemMessage" style={{paddingLeft:"4px"}}>
                                            { (this.props.dataFromParent[0] || this.props.dataFromParent[1]) && val === "Violation" && 
                                            <React.Fragment>
                                            <span ><img src={Violation16} style={{verticalAlign:"middle",marginBottom:"0px"}} alt="Violation" /></span>
                                            <span style={{fontSize:"12px"}}>{item.message}</span>
                                            {this.props.layout === "sub" ? (<React.Fragment><span> </span><a className="helpLink" href="#" style={{cursor:'default'}} onKeyDown={(event) =>{this.learnMoreKeyDownHandler(event, item)}} onClick={(event) =>{this.learnMoreClickHandler(event, item)}} ref={this.learnMoreRef(item)}>Learn more</a></React.Fragment>) : ""}
                                            </React.Fragment>
                                            }
                                            { (this.props.dataFromParent[0] || this.props.dataFromParent[2]) && val === "Needs review" && 
                                            <React.Fragment>
                                            <span><img src={NeedsReview16} style={{verticalAlign:"middle",marginBottom:"0px"}} alt="Needs review" /></span>
                                            <span style={{fontSize:"12px"}}>{item.message}</span>
                                            {this.props.layout === "sub" ? (<React.Fragment><span> </span><a className="helpLink" href="#" style={{cursor:'default'}} onKeyDown={(event) =>{this.learnMoreKeyDownHandler(event, item)}} onClick={(event) =>{this.learnMoreClickHandler(event, item)}} ref={this.learnMoreRef(item)}>Learn more</a></React.Fragment>) : ""}
                                            </React.Fragment>
                                            }
                                            { (this.props.dataFromParent[0] || this.props.dataFromParent[3]) && val === "Recommendation" && 
                                            <React.Fragment>
                                            <span><img src={Recommendation16} style={{verticalAlign:"middle",marginBottom:"0px"}} alt="Recommendation" /></span>
                                            <span style={{fontSize:"12px"}}>{item.message}</span>
                                            {this.props.layout === "sub" ? (<React.Fragment><span> </span><a className="helpLink" href="#" style={{cursor:'default'}} onKeyDown={(event) =>{this.learnMoreKeyDownHandler(event, item)}} onClick={(event) =>{this.learnMoreClickHandler(event, item)}} ref={this.learnMoreRef(item)}>Learn more</a></React.Fragment>) : ""}
                                            </React.Fragment>
                                            }
                                        </div>
                                    </Column>
                                </Grid>
                            </div>)
                            
                            : ""
                        : "" }
                        
                </React.Fragment>
                })}
            </React.Fragment> }
        </div>
        : "" }
        </React.Fragment>
    }
}   