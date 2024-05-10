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
    Link,
    ModalFooter,
    TextInput
} from "@carbon/react";
import {
    TrashCan,
    Download
} from "@carbon/react/icons";

import { IStoredReportMeta } from "../../interfaces/interfaces";
import { getDevtoolsController } from "../devtoolsController";
import { BrowserDetection } from '../../util/browserDetection';
import "./storedScreen.scss";
import { BasicTable } from "./BasicTable";
import { getDevtoolsAppController } from "../devtoolsAppController";

interface IStoredScreenState {
    storedReports: IStoredReportMeta[]
    deleteSelectedRows?: IStoredReportMeta[]
    detailSelectedRow?: number
}

interface IStoredScreenProps {
}

export default class StoredScreen extends React.Component<IStoredScreenProps, IStoredScreenState> {
    private devtoolsAppController = getDevtoolsAppController();
    private devtoolsController = getDevtoolsController(this.devtoolsAppController.toolTabId);
    state: IStoredScreenState = {
        storedReports: []
    }

    async componentDidMount(): Promise<void> {
        let self = this;
        this.devtoolsController.addStoredReportsMetaListener(async (newState) => {
            self.setState({storedReports: newState });
        })
        this.setState({
            storedReports: await self.devtoolsController.getStoredReportsMeta()
        })
    }

    updateLabel(idx: number, newValue: string) {
        this.devtoolsController.setStoredReportsMetaLabel(idx, newValue);
    }

    render() {
        let detailRow = typeof this.state.detailSelectedRow !== "undefined" && this.state.storedReports[this.state.detailSelectedRow] || undefined;
        return (
            <Grid className={`storedScreen ${BrowserDetection.isDarkMode()?"cds--g90":"cds--g10"}`}>
                <Column sm={{span: 4}} md={{span: 8}} lg={{span: 8}}>
                    <h2>Stored scans</h2>
                    <div style={{marginTop: "1rem"}} />
                    <div style={{
                        display: (this.state.deleteSelectedRows || detailRow) ? "none": "block"
                    }}>
                        <BasicTable
                            // title="Stored scans"
                            emptyLabel="No scans stored."
                            headers={[
                                // { key: 'id', header: "ID" },
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
                                    icon: TrashCan,
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
                                this.setState({ detailSelectedRow: parseInt(rowId)})
                            }}
                            fieldMapper={(rowId, cellId, cellValue) => {
                                if (cellId === "timestamp") {
                                    let d : Date = new Date(cellValue);
                                    return `${d.toLocaleString()}`;
                                } else if (cellId === "label") {
                                    return <TextInput
                                        style={{minWidth: "8rem"}}
                                        id={`label_${rowId}`}
                                        labelText=""
                                        aria-label="Scan label"
                                        value={cellValue}
                                        size="sm"
                                        onChange={(evt: any) => {
                                            this.updateLabel(parseInt(rowId), evt.target.value);
                                        }}
                                    />
                                }
                                return cellValue;
                            }}
                        />
                    </div>
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
                                await this.devtoolsController.setStoredReportsMeta(newList);
                                this.setState({ deleteSelectedRows: undefined });
                            }}>
                                Delete
                            </Button>
                        </ModalFooter>
                    </>}
                    { detailRow && <>
                        <div>
                            <Link onClick={() => {
                                this.setState({ detailSelectedRow: undefined })
                            }}>Back to stored scans</Link>
                        </div>
                        <Grid className="storedScreen">
                            <Column sm={{span: 4}} md={{span: 4}} lg={{span: 4}}>
                                <img src={detailRow.screenshot} alt="Screenshot of page scanned" width="100%" />
                            </Column>
                            <Column sm={{span: 4}} md={{span: 4}} lg={{span: 4}}>
                                <div><strong>URL: </strong>{detailRow.pageURL}</div>
                                <div><strong>Page title: </strong>{detailRow.pageTitle}</div>
                                <div><strong>Scan time: </strong>{new Date(detailRow.timestamp).toLocaleString()}</div>
                                <div style={{marginTop: ".5rem"}} />
                                <TextInput 
                                    style={{backgroundColor: "white"}}
                                    labelText="Scan label" 
                                    value={detailRow.label} 
                                    onChange={(evt: any) => {
                                        this.updateLabel(this.state.detailSelectedRow!, evt.target.value);
                                    }}
                                />
                            </Column>
                        </Grid>
                    </>}
                </Column>
            </Grid>
        )
    }
}