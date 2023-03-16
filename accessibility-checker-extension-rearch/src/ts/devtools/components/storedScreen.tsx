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
import { Column, Grid } from "@carbon/react";
import "./storedScreen.scss";
// import { getDevtoolsController } from "../devtoolsController";


interface IStoredScreenState {
}

interface IStoredScreenProps {
}

export default class StoredScreen extends React.Component<IStoredScreenProps, IStoredScreenState> {
    // private devtoolsController = getDevtoolsController();

    async componentDidMount(): Promise<void> {
        // this.devtoolsController.add
    }

    render() {
        return (
            <Grid className="storedScreen">
                <Column sm={{span: 4}} md={{span: 4}} lg={{span: 4}}>
                    Stored screen
                </Column>
            </Grid>
        )
    }
}