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

    import { IReport } from './Report';
    
    interface ITabStopsState {
    }
    
    interface ITabStopsProps {
        report: IReport | null,
        tabStops: any
    }
    
    export default class TabStops extends React.Component<ITabStopsProps, ITabStopsState> {
        state: ITabStopsState = {};

        printTabStops() {
            console.log("printTabStops");
            let temp = [];
            if (this.props.tabStops) {
                // return <div>BigHowdy</div>
                console.log("this.props.tabStops.length = ", this.props.tabStops.xpaths.length)
                for (let i=0; i<this.props.tabStops.xpaths.length; i++) {
                    console.log(this.props.tabStops.xpaths[i].xpath);
                temp.push(<div>Tab Stop: {i+1}  {this.props.tabStops.xpaths[i].xpath}</div>);
                }
            }
            return temp;
        }
    
        render() {
            console.log("tabStops = ", this.props.tabStops);

            return <div style={{height: "100%", width: "100%", padding: "0rem"}}>
                <div>Joho here</div>
                {console.log("Joho here again")}
                {this.printTabStops()}
                
                
                {/* {this.props.report && 
                    <HelpFileSwitcher report={this.props.report} item={this.props.item}/>
                } */}
            </div>
        }
    }