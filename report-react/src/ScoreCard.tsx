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
import React, { ReactNode } from "react";
import "./ScoreCard.scss";

interface ScoreCardProps {
    title: string
    icon?: string
    count?: number
    children?: any
}

export default class ScoreCard extends React.Component<ScoreCardProps, {}> {

    render() {
        return <div className="scoreCard">
            <div><span className="title">{this.props.title}</span><span style={{verticalAlign:"middle"}}>&nbsp;<img src={this.props.icon} style={{ verticalAlign: "top" }} alt={this.props.title}/></span></div>
            <div className="score">{this.props.count}</div>
            <div className="description">{this.props.children}</div>
        </div>
    }
}
