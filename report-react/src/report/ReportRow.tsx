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

import { IReportItem, valueMap, ICheckpoint, IReport } from "../IReport";
import Popup from "@carbon/icons-react/lib/Popup";
import ChevronUp from "@carbon/icons-react/lib/ChevronUp";
import ChevronDown from "@carbon/icons-react/lib/ChevronDown";
import { Grid, Column } from "@carbon/react";
import { Violation16,NeedsReview16,Recommendation16 } from "../util/UtilIssueReact";



export interface IReportRowGroup {
    checkpoint?: ICheckpoint,
    title: string,
    counts: { [key: string]: number },
    items: IReportItem[]
}

interface IReportRowState {
    expanded: boolean,
    lastTimestamp: number,
    scrollTo: boolean
}

interface IReportRowProps {
    report: IReport,
    group: IReportRowGroup;
    selectItem: (item: IReportItem) => void
}

export default class ReportRow extends React.Component<IReportRowProps, IReportRowState> {
    scrollRef: RefObject<HTMLDivElement> = React.createRef();

    state: IReportRowState = {
        expanded: false,
        lastTimestamp: this.props.report.timestamp,
        scrollTo: false
    };

    setRow(bOpen: boolean) {
        if (this.state.expanded !== bOpen) {
            this.setState({ expanded: bOpen });
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

    static getDerivedStateFromProps(props: IReportRowProps, state: IReportRowState) {
        if (props.report.timestamp > state.lastTimestamp) {
            return {
                lastTimestamp: props.report.timestamp,
                expanded: false,
                scrollTo: false
            }
        }
        return {
            scrollTo: false
        }
    }

    render() {
        const group = this.props.group;
        let vCount = group.counts["Violation"] || 0;
        let nrCount = group.counts["Needs review"] || 0;
        let rCount = group.counts["Recommendation"] || 0;
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
        return <div className="itemRow">
            <Grid role="row" aria-expanded={open} className="itemHeader" onClick={this.toggleRow.bind(this)} tabIndex={0} onKeyDown={this.onKeyDown.bind(this)}>
                <Column sm={1} md={2} lg={4} role="cell">
                    {this.state.scrollTo && <div ref={this.scrollRef}></div>}
                    <span style={{ paddingRight: "16px" }}>{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                    {vCount > 0 && <><span style={{ verticalAlign: "text-top", lineHeight: "8px" }}>{vCount}</span> <span>{Violation16}&nbsp;</span></>}
                    {nrCount > 0 && <><span style={{ verticalAlign: "text-top", lineHeight: "8px" }}>{nrCount}</span> <span>{NeedsReview16}&nbsp;</span></>}
                    {rCount > 0 && <><span style={{ verticalAlign: "text-top", lineHeight: "8px" }}>{rCount}</span> {Recommendation16}</>}
                </Column>
                <Column sm={3} md={6} lg={8} role="cell">
                    <span >{group.title.length === 0 ? "Page" : group.title}</span>
                </Column>
            </Grid>
            {!open && <Grid className="itemDetail" />}
            {open && <React.Fragment>
                {group.items.map(item => {
                    let val = valueMap[item.value[0]][item.value[1]];
                    return (<Grid className={"itemDetail"}>
                        <Column sm={1} md={2} lg={4} role="cell"></Column>
                        <Column sm={3} md={6} lg={8} role="cell">
                            <div className="itemMessage">
                                {val === "Violation" && <span>{Violation16}</span>}
                                {val === "Needs review" && <span>{NeedsReview16}</span>}
                                {val === "Recommendation" && <span>{Recommendation16}</span>}
                                <span style={{ fontSize: "12px" }}>{item.message}</span>
                                <span> </span><a className="helpLink" href="/#" onClick={(evt) => {
                                    this.props.selectItem(item);
                                    evt.preventDefault();
                                    return false;
                                }}>Learn more <Popup size={16} /></a>
                            </div>
                        </Column>
                    </Grid>)
                })}
            </React.Fragment>}
        </div>
    }
}