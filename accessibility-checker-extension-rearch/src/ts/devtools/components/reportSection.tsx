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
import { getDevtoolsController } from '../devtoolsController';
import { IReport } from '../../interfaces/interfaces';
import { getTabId } from '../../util/tabId';

let devtoolsController = getDevtoolsController();

interface ReportSectionState {
    report: IReport | null
}

export class ReportSection extends React.Component<{}, ReportSectionState> {
    state : ReportSectionState = {
        report: null
    }

    async componentDidMount(): Promise<void> {
        devtoolsController.addReportListener({
            callback: async (report) => {
                this.setState( { report });
            },
            callbackDest: {
                type: "devTools",
                tabId: getTabId()!
            }
        });
        let report = await devtoolsController.getReport();
        this.setState( { report });
    }

    render() {
        return <div>
            {this.state.report && JSON.stringify(this.state.report.results.length)}
            {!this.state.report && <>
                No report
            </>}
        </div>
    }
}