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
import { 
    Button,
    // ButtonSet,
    Column, 
    Grid,
    Layer,
    Link,
    ModalFooter,
    TextInput,
    Theme
} from "@carbon/react";
import {
    Delete,
    Download
} from "@carbon/react/icons";

import { IStoredReportMeta } from "../../interfaces/interfaces";
import { getDevtoolsController } from "../devtoolsController";
import "./storedScreen.scss";
import { BasicTable } from "./BasicTable";

interface IStoredScreenState {
    storedReports: IStoredReportMeta[]
    deleteSelectedRows?: IStoredReportMeta[]
    detailSelectedRow?: IStoredReportMeta
}

interface IStoredScreenProps {
}

export default class StoredScreen extends React.Component<IStoredScreenProps, IStoredScreenState> {
    private devtoolsController = getDevtoolsController();
    state: IStoredScreenState = {
        storedReports: []
    }

    async componentDidMount(): Promise<void> {
        this.devtoolsController.addStoredReportsMetaListener(async (newState) => {
            this.setState({storedReports: newState });
        })
        this.setState({
            storedReports: await this.devtoolsController.getStoredReportsMeta()
        })
    }

    render() {
        return (
            <Grid className="storedScreen">
                <Column sm={{span: 4}} md={{span: 8}} lg={{span: 8}}>
                    <Theme theme="g10">
                        <h2>Stored Scans</h2>
                        <div style={{marginTop: "1rem"}} />
                        { !this.state.deleteSelectedRows && !this.state.detailSelectedRow && <>
                            <BasicTable
                                emptyLabel="No scans stored."
                                headers={[
                                    { key: 'id', header: "ID" },
                                    { key: 'pageURL', header: 'URL' },
                                    { key: 'pageTitle', header: 'Page title' },
                                    { key: 'timestamp', header: 'Date and time' },
                                    { key: 'label', header: 'Scan label' },
                                ]}
                                batchActions={[
                                    {
                                        icon: Download,
                                        label: "Download",
                                        onClick: async (selectedRows) => {
                                            let storedReportsMeta = await this.devtoolsController.getStoredReportsMeta();
                                            for (const storedReport of storedReportsMeta) {
                                                storedReport.isSelected = false;
                                            }
                                            for (const selectedReport of selectedRows) {
                                                storedReportsMeta[parseInt(selectedReport.id)].isSelected = true;
                                            }
                                            await this.devtoolsController.setStoredReportsMeta(storedReportsMeta);
                                            this.devtoolsController.exportXLS("selected");
                                        }
                                    },
                                    {
                                        icon: Delete,
                                        label: "Delete",
                                        onClick: (selectedRows) => {
                                            this.setState({ deleteSelectedRows: selectedRows });
                                        }
                                    }
                                ]}
                                data={this.state.storedReports}
                                className="StoredReportsTable"
                                hideHeaders={false}
                                hideToolbar={false}
                                onRow={async (rowId: string) => {
                                    this.setState({ detailSelectedRow: this.state.storedReports[parseInt(rowId)]})
                                }}
                                fieldMapper={(rowId, cellId, cellValue) => {
                                    if (cellId === "timestamp") {
                                        let d : Date = new Date(cellValue);
                                        return `${d.toLocaleString()}`;
                                    } else if (cellId === "label") {
                                        return <TextInput
                                            id={`label_${rowId}`}
                                            labelText=""
                                            aria-label="Scan label"
                                            value={cellValue}
                                            size="sm"
                                        />
                                    }
                                    return cellValue;
                                }}
                            />
                        </>}
                        { this.state.deleteSelectedRows && <>
                            <div>
                                Are you sure you want to delete {this.state.deleteSelectedRows.length} selected scans?
                                This action is irreversible.
                            </div>
                            <div style={{marginTop: "1.5rem"}} />
                            <ModalFooter>
                                <Button kind="secondary" onClick={() => {
                                    this.setState({ deleteSelectedRows: undefined });
                                }}>
                                    Cancel
                                </Button>
                                <Button kind="danger" onClick={async () => {
                                    let newList: IStoredReportMeta[] = JSON.parse(JSON.stringify(this.state.storedReports));
                                    for (const deleteScan of this.state.deleteSelectedRows!) {
                                        let idx = newList.findIndex(scan => scan.id === deleteScan.id);
                                        newList.splice(idx, 1);
                                    }
                                    await getDevtoolsController().setStoredReportsMeta(newList);
                                    this.setState({ deleteSelectedRows: undefined });
                                }}>
                                    Delete
                                </Button>
                            </ModalFooter>
                        </>}
                        { this.state.detailSelectedRow && <>
                            <div>
                                <Link onClick={() => {
                                    this.setState({ detailSelectedRow: undefined })
                                }}>Back to stored scans</Link>
                            </div>
                            <Grid className="storedScreen">
                                <Column sm={{span: 4}} md={{span: 4}} lg={{span: 4}}>
                                    <img src={this.state.detailSelectedRow.screenshot} alt="Screenshot of page scanned" width="100%" />
                                </Column>
                                <Column sm={{span: 4}} md={{span: 4}} lg={{span: 4}}>
                                    <Layer>
                                        <TextInput labelText="Scan label" value={this.state.detailSelectedRow.label} />
                                    </Layer>
                                    <div><strong>URL: </strong>{this.state.detailSelectedRow.pageURL}</div>
                                    <div><strong>Page title: </strong>{this.state.detailSelectedRow.pageTitle}</div>
                                    <div>{new Date(this.state.detailSelectedRow.timestamp).toLocaleString()}</div>
                                </Column>
                            </Grid>
                        </>}
                    </Theme>
                </Column>
            </Grid>
        )
    }
}