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

import { IReportItem, valueMap, ICheckpoint, IReport} from "./Report";

import { ChevronUp16, ChevronDown16 } from '@carbon/icons-react';
import Violation16 from "../../assets/Violation16.svg";
import NeedsReview16 from "../../assets/NeedsReview16.svg";
import Recommendation16 from "../../assets/Recommendation16.svg";

export interface IReportRowGroup {
    checkpoint?: ICheckpoint,
    title: string,
    counts: { [key: string]: number },
    items: IReportItem[],
    selected: boolean
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
    selectItem: (item: IReportItem) => void,
    getItem: (item: IReportItem) => void,
    layout: string
    selectGroup: any,
    tabName: string

}

export default class ReportRow extends React.Component<IReportRowProps, IReportRowState> {
    scrollRef : RefObject<HTMLDivElement> = React.createRef();

    state: IReportRowState = {
        expanded: false,
        lastTimestamp: this.props.report.timestamp,
        scrollTo: false
    };

    setRow(bOpen: boolean) {
        if (this.state.expanded != bOpen) {
            this.setState({ expanded: bOpen});
        }
    }

    toggleRow() {
      var currentExpanded = this.state.expanded;
      this.props.group.selected = !currentExpanded;
      this.setState({ expanded: !currentExpanded });

    }

    onKeyDown(e: any) {
        if (e.keyCode === 13) {
            e.target.click();
        }
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

    render() {
        console.log('--ReportRow---', this.props);
        const {group, tabName, layout} = this.props;
        let vCount = group.counts["Violation"] || 0;
        let nrCount = group.counts["Needs review"] || 0;
        let rCount = group.counts["Recommendation"] || 0;
        
        let open = this.state.expanded;
        if(tabName==='elementRoles' && layout==='sub'){
            open = group.selected;
        }

        if (this.state.scrollTo) {
            setTimeout(() => {
                const element = this.scrollRef.current;
                if (element) {
                    let parentPanel = element.parentElement;
                    while (parentPanel && parentPanel?.getAttribute("role") !== "tabpanel") {
                        parentPanel = parentPanel?.parentElement;
                    }
                    if (parentPanel && parentPanel.getAttribute("aria-hidden") !== "true") {
                        const elementRect = element.getBoundingClientRect();
                        const absoluteElementTop = elementRect.top + window.pageYOffset;
                        const middle = absoluteElementTop - 144;
                        element.ownerDocument?.defaultView?.scrollTo({
                            top: middle,
                            behavior: 'smooth'
                        });
                    }
                }
            }, 0)
        }
        let subIdx = this.props.idx+1;
        return <div className="itemRow">
            <div tabIndex={0} role="row" aria-rowindex={this.props.idx} aria-expanded={open} className="bx--row itemHeader" onClick={this.toggleRow.bind(this)} onKeyDown={this.onKeyDown.bind(this)}>
                <div role="cell" className="bx--col-sm-1">
                    { this.state.scrollTo && <div ref={this.scrollRef}></div>}
                    <span style={{paddingRight:"16px"}}>{open ? <ChevronUp16/>: <ChevronDown16 />}</span>
                    { vCount > 0 && <><span style={{verticalAlign:"text-top",lineHeight:"8px"}}>{vCount}</span> <span><img src={Violation16} style={{verticalAlign:"middle",marginBottom:"12px"}} alt="Violation" />&nbsp;</span></> }
                    { nrCount > 0 && <><span style={{verticalAlign:"text-top",lineHeight:"8px"}}>{nrCount}</span> <span><img src={NeedsReview16} style={{verticalAlign:"middle",marginBottom:"12px"}} alt="Needs review" />&nbsp;</span></> }
                    { rCount > 0 &&  <><span style={{verticalAlign:"text-top",lineHeight:"8px"}}>{rCount}</span> <img src={Recommendation16} style={{verticalAlign:"middle",marginBottom:"10px"}} alt="Recommendation" /></> }
                </div>
                <div role="cell" className="bx--col-sm-3">
                    <span >{group.title.length === 0 ? "Page" : group.title}</span>
                </div>
            </div>
            { !open && <div className="bx--row itemDetail" /> }
            { open && <React.Fragment>
                {group.items.map(item => {
                    let val = valueMap[item.value[0]][item.value[1]];
                    return (<div tabIndex={0} role="row" style={{cursor:'pointer'}} aria-rowindex={subIdx} aria-selected={!!item.selected} className={"bx--row itemDetail"+(item.selected ? " selected": "")+(item.selectedChild ? " selectedChild": "")} onClick={this.props.selectItem.bind(this, item, this.props.group.checkpoint)} onKeyDown={this.onKeyDown.bind(this)}>
                    <div role="cell" className="bx--col-sm-1"> </div>
                    <div role="cell" className="bx--col-sm-3">
                        <div className="itemMessage">
                            {val === "Violation" && <span><img src={Violation16} style={{verticalAlign:"middle",marginBottom:"4px"}} alt="Violation" /></span>}
                            {val === "Needs review" && <span><img src={NeedsReview16} style={{verticalAlign:"middle",marginBottom:"4px"}} alt="Needs review" /></span>}
                            {val === "Recommendation" && <span><img src={Recommendation16} style={{verticalAlign:"middle",marginBottom:"2px"}} alt="Recommendation" /></span>}
                            <span style={{fontSize:"12px"}}>{item.message}</span>
                            {console.log("this.props.layout = ",this.props.layout)}
                            {this.props.layout === "sub" ? (<React.Fragment><span> </span><a className="helpLink" href="#" style={{cursor:'default'}} onClick={this.props.getItem.bind(this, item)} >Learn more</a></React.Fragment>) : ""}
                            
                        </div>
                    </div>
                </div>)})}
            </React.Fragment> }
        </div>
    }
}