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

const Violation16 = <svg version="1.1" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16">
    <rect style={{ fill: "none" }} width="16" height="16" />
    <path style={{ fill: "#A2191F" }} d="M8,1C4.1,1,1,4.1,1,8s3.1,7,7,7s7-3.1,7-7S11.9,1,8,1z M10.7,11.5L4.5,5.3l0.8-0.8l6.2,6.2L10.7,11.5z" />
    <path style={{ fill: "#FFFFFF", fillOpacity: 0 }} d="M10.7,11.5L4.5,5.3l0.8-0.8l6.2,6.2L10.7,11.5z" />
</svg>

const NeedsReview16 = <svg version="1.1" x="0px" y="0px"
    width="16px" height="16px" viewBox="0 0 16 16">
    <rect style={{ fill: "none" }} width="16" height="16" />
    <path style={{ fill: "#F1C21B" }} d="M14.9,13.3l-6.5-12C8.3,1,8,0.9,7.8,1.1c-0.1,0-0.2,0.1-0.2,0.2l-6.5,12c-0.1,0.1-0.1,0.3,0,0.5
	C1.2,13.9,1.3,14,1.5,14h13c0.2,0,0.3-0.1,0.4-0.2C15,13.6,15,13.4,14.9,13.3z M7.4,4h1.1v5H7.4V4z M8,11.8c-0.4,0-0.8-0.4-0.8-0.8
	s0.4-0.8,0.8-0.8c0.4,0,0.8,0.4,0.8,0.8S8.4,11.8,8,11.8z"/>
    <g>
        <g>
            <g>
                <rect x="7.45" y="4" width="1.1" height="5" />
            </g>
        </g>
        <g>
            <g>
                <circle cx="8" cy="11" r="0.8" />
            </g>
        </g>
    </g>
</svg>

const Recommendation16 = <svg version="1.1" x="0px" y="0px"
    width="16px" height="16px" viewBox="0 0 16 16">
    <rect style={{ fill: "none" }} width="16" height="16" />
    <path style={{ fill: "#0043CE" }} d="M14,15H2c-0.6,0-1-0.4-1-1V2c0-0.6,0.4-1,1-1h12c0.6,0,1,0.4,1,1v12C15,14.6,14.6,15,14,15z" />
    <text transform="matrix(1 0 0 1 5.9528 12.5044)" style={{ fill: "#FFFFFF", fontFamily: "IBMPlexSerif", fontSize: "12.9996px" }}>i</text>
</svg>

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