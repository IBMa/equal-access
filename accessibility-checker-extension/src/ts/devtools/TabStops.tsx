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

    import "../styles/subpanel.scss"
    
    interface ITabStopsState {
    }
    
    interface ITabStopsProps {
        report: IReport | null,
        tabStops: any,
        tabStopsHighlight: (index: number) => void,
    }
    
    export default class TabStops extends React.Component<ITabStopsProps, ITabStopsState> {
        state: ITabStopsState = {};

        // tabStopsMatches () {
        //     let matchedTabStops:any = [];
        //     if (this.props.tabStops && this.props.tabStops.tabStopsData) {
        //         for (let i=0; i<this.props.tabStops.tabStopsData.length; i++) { // for every Tab stop xpath
        //             console.log(this.props.tabStops.tabStopsData[i].xpath);
        //             this.props.report?.results.map((result: any, index: any) => {
        //                 // console.log("result.path.dom = ", result.path.dom);
        //                 if (this.props.tabStops.tabStopsData[i].xpath === result.path.dom) {
        //                     console.log("index = ", index, "result.path.dom = ", result.path.dom);
        //                     matchedTabStops.push(result);
        //                 }
        //             })
        //         }
        //         console.log("matchedTabStops = ", matchedTabStops);
        //     }
        // }

        printTabStops() {
            console.log("printTabStops");
            console.log("this.props.tabStops = ", this.props.tabStops);
            let temp = [];
            if (this.props.tabStops && this.props.tabStops.tabStopsData) { 
                for (let i=0; i<this.props.tabStops.tabStopsData.length; i++) {
                    console.log(this.props.tabStops.tabStopsData[i].xpath);
                    let index = i;
                    temp.push(
                        <Row style={{marginTop:"0px",paddingLeft: "2rem",height:"100%"}}>
                            <div className="bx--col-1 tabStopsContent" style={{marginBottom:"14px"}}>
                                {i+1}
                            </div>
                            <div className="bx--col-1 tabStopsContent" style={{marginBottom:"14px"}}>
                                
                            </div>
                            <div className="bx--col-1 tabStopsContent" style={{marginBottom:"14px"}}>
                                <a href="#" onClick={() => {
                                    console.log("role onclick START");
                                    this.props.tabStopsHighlight(index);
                                    console.log("role onclick DONE ");
                                }}>
                                {this.props.tabStops.tabStopsData[i].role}</a>
                            </div>
                            <div className="bx--col-2 tabStopsContent" style={{marginBottom:"14px", width:"150px"}}>
                                {this.props.tabStops.tabStopsData[i].name}
                            </div>
                        </Row>
                    );
                }
            }
            return temp;
        }
    
        render() {
            console.log("TabStopsRENDER");

            // this.tabStopsMatches();

            return  <div style={{height: "100%", width: "100%", paddingLeft: "0rem"}}>
                        <Row style={{marginTop:"64px",paddingLeft: "1rem",height:"100%"}}>
                            <div className="bx--col-lg-3 bx--col-sm-4 stored-scans" style={{marginBottom:"14px"}}>
                                Tab stops summary
                            </div>
                        </Row>
                        <Row style={{marginTop:"0px",paddingLeft: "2rem",height:"100%"}}>
                            <div className="bx--col-1 summaryBarCounts" style={{marginBottom:"14px"}}>
                                Index
                            </div>
                            <div className="bx--col-1 summaryBarCounts" style={{marginBottom:"14px"}}>
                                Issues
                            </div>
                            <div className="bx--col-1 summaryBarCounts" style={{marginBottom:"14px"}}>
                                Role
                            </div>
                            <div className="bx--col-2 summaryBarCounts" style={{marginBottom:"14px"}}>
                                Name
                            </div>
                        </Row>

                        {this.printTabStops()}
                        
                    </div>
        }
    }