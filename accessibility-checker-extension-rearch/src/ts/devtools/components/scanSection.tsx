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

import * as React from 'react';
import { getTabController } from "../../tab/tabController";
import { Button } from "@carbon/react";

let tabController = getTabController();

interface ScanSectionState {
}

export class ScanSection extends React.Component<{}, ScanSectionState> {
    state : ScanSectionState = {
    }

    componentDidMount(): void {
    }

    scan() {
        tabController.requestScan();
    }

    render() {
        return <Button onClick={() => { this.scan(); }}>Scan</Button>
    }
}