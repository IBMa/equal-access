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

    import { Row } from 'carbon-components-react';

    import { IReport } from './Report';

    // import { ChevronUp16, ChevronDown16 } from '@carbon/icons-react';
    import Violation16 from "../../assets/Violation16.svg";
    import NeedsReview16 from "../../assets/NeedsReview16.svg";
    import Recommendation16 from "../../assets/Recommendation16.svg";

    import "../styles/subpanel.scss"
    import "../styles/tabStops.scss"
    
    interface ITabStopsState {
    }
    
    interface ITabStopsProps {
        report: IReport | null,
        tabStopsHighlight: (index: number, result: any) => void,
        tabStopsResults: []
    }
    
    export default class TabStops extends React.Component<ITabStopsProps, ITabStopsState> {
        state: ITabStopsState = {};        

        printTabStops() {
            console.log("printTabStops");
            let temp:any = [];
            let vCount = 1;
            let nrCount = 1;
            let rCount = 1;
            if (this.props.tabStopsResults !== undefined) {
                this.props.tabStopsResults.map((result: any, index:number) => {
                    temp.push(
                        <Row style={{marginTop:"0px",paddingLeft: "2rem",height:"100%"}}>
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
                        </Row>
                    );
                });
                console.log("temp = ", )
                return temp;
            }
            
        }
    
        render() {
            console.log("TabStopsRENDER");

            // this.tabStopsMatches();

            return  <div style={{height: "100%", width: "100%", paddingLeft: "0rem"}}>
                        <Row style={{marginTop:"64px",paddingLeft: "1rem",height:"100%"}}>
                            <div className="stored-scans" style={{marginBottom:"14px"}}>
                                Tab stops summary
                            </div>
                        </Row>
                        <Row style={{marginTop:"0px",paddingLeft: "2rem",height:"100%"}}>
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
                        </Row>

                        {this.printTabStops()}
                        
                    </div>
        }
    }