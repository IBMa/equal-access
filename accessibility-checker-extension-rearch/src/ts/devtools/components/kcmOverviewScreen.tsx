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

import { Column, Grid } from '@carbon/react';
import { ISettings } from "../../interfaces/interfaces";
import "./kcmOverviewScreen.scss";
import { getBGController } from "../../background/backgroundController";

interface IKCMOverviewScreenState {
    settings?: ISettings
}

interface IKCMOverviewScreenProps {
}

export default class KCMOverviewScreen extends React.Component<IKCMOverviewScreenProps, IKCMOverviewScreenState> {
    private bgController = getBGController();
    state: IKCMOverviewScreenState = {
    }
    async componentDidMount(): Promise<void> {
        this.setState({
            settings: await this.bgController.getSettings()
        })
    }

    render() {
        return <aside className="kcmOverview">
            <Grid style={{margin: "0rem"}}>
                <Column sm={{ span: 4 }} md={{ span: 4 }} lg={{ span: 4 }}>
                    Left
                </Column>
                <Column sm={{ span: 4 }} md={{ span: 4 }} lg={{ span: 4 }}>
                    Right
                </Column>
            </Grid>
        </aside>;
    }
}