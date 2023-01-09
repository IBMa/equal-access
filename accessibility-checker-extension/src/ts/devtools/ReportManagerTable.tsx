
import React from 'react';
import {
    Column, Grid, DataTable, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader,
    TableRow, TableSelectAll, TableSelectRow, TableToolbar,
    TableToolbarContent,
    TableToolbarSearch, TableBatchActions, TableBatchAction, Button, Modal
} from '@carbon/react';

import { Delete, Download } from '@carbon/react/icons/lib/index';

import "../styles/multiScanReports.scss"
import "../styles/reportManagerTable.scss"

interface IReportManagerTableState {
    redisplayTable: boolean, // note this is just a simulated state to force table to rerender after a delete, etc.
    modalScreenShot: boolean,
    screenShotRow: number,
    screenShot: string,
    url: string,
    pageTitle: string,
    date: string,
    userScanLabel: string,
    deleteModal: boolean,
    deleteModalSelectedRows: any
}

interface IReportManagerTableProps {
    layout: "main" | "sub",
    storedScans: {
        actualStoredScan: boolean;  // denotes actual stored scan vs a current scan that is kept when scans are not being stored
        isSelected: boolean; // stored scan is selected in the Datatable
        url: string;
        pageTitle: string;
        dateTime: number | undefined;
        scanLabel: string;
        userScanLabel: string;
        ruleSet: any;
        guidelines: any;
        reportDate: Date;
        violations: any;
        needsReviews: any;
        recommendations: any;
        elementsNoViolations: number;
        elementsNoFailures: number;
        storedScan: string;
        screenShot: string;
        storedScanData: string;
    }[],
    reportHandler: (typeScan: string) => void,
    setStoredScanCount: () => void,
    storeScanLabel: (e: any, i: number) => void,
    clearSelectedStoredScans: () => void,
}

export default class ReportManagerTable extends React.Component<IReportManagerTableProps, IReportManagerTableState> {
    myRef: React.RefObject<HTMLButtonElement>;
    constructor(props: any) {
        super(props);
        this.myRef = React.createRef();

    }
    state: IReportManagerTableState = {
        redisplayTable: true,
        modalScreenShot: false,
        screenShotRow: 0,
        screenShot: "",
        url: "",
        pageTitle: "",
        date: "",
        userScanLabel: "",
        deleteModal: false,
        deleteModalSelectedRows: null
    };

    format_date(timestamp: string) {
        var date = new Date(timestamp);

        return ("00" + (date.getMonth() + 1)).slice(-2) + "/" + ("00" + date.getDate()).slice(-2) + "/" +
            ("00" + date.getFullYear()).slice(-2) + ' ' +
            ("00" + date.getHours()).slice(-2) + ":" +
            ("00" + date.getMinutes()).slice(-2) + ":" +
            ("00" + date.getSeconds()).slice(-2);
    }

    downloadScanReports(selectedRows: any) {
        // clear old selected rows
        this.props.clearSelectedStoredScans();
        // set selected rows / scans in storedScans
        for (let i = 0; i < selectedRows.length; i++) {
            if (selectedRows[i].isSelected === true) {
                this.props.storedScans[selectedRows[i].id].isSelected = true;
            }
        }

        this.props.reportHandler("selected");
    }

    deleteSelected(selectedRows: any) {
        // get index(s) of selected row(s) to delete that match up with storedScans
        let indexes: number[] = [];

        // clear old selected rows
        this.props.clearSelectedStoredScans();
        for (let i = 0; i < selectedRows.length; i++) {
            if (selectedRows[i].isSelected === true) {
                // this.props.storedScans[selectedRows[i].id].isSelected = true;
                indexes.push(selectedRows[i].id);
            }
        }

        for (var i = indexes.length - 1; i >= 0; i--)
            this.props.storedScans.splice(indexes[i], 1);

        // update state storedScanCount
        this.props.setStoredScanCount();

        // need a change of state to rerender scan manager
        if (this.state.redisplayTable === true) {
            this.setState({ redisplayTable: false });
        } else if (this.state.redisplayTable === false) {
            this.setState({ redisplayTable: true });
        }

        // document.getElementById("secretSelectAll")?.click();
        //@ts-ignore
        this.myRef.current.click();
    }

    handleSelectAll = (selectAll: { (): void; (): void; }) => () => {
        selectAll();
    };

    screenShotModal(rowNum: number) {
        this.setState({
            screenShotRow: rowNum,
            modalScreenShot: true,
            screenShot: this.props.storedScans[rowNum].screenShot,
            url: this.props.storedScans[rowNum].url,
            pageTitle: this.props.storedScans[rowNum].pageTitle,
            //@ts-ignore
            date: this.format_date(this.props.storedScans[rowNum].dateTime).toString(),
            userScanLabel: this.props.storedScans[rowNum].userScanLabel,
        });
    }

    deleteModalHandler() {
        this.setState({
            deleteModal: true,
        });
    }

    render() {

        const headers = [
            {
                header: 'URL',
                key: 'url',
            },
            {
                header: 'Page title',
                key: 'title',
            },
            {
                header: 'Date and Time',
                key: 'date',
            },
            {
                header: 'Scan label',
                key: 'label',
            },
            {
                header: 'Details',
                key: 'details',
            },
        ];

        // create scan rows from stored scans
        let rows: any[] = [];
        for (let i = 0; i < this.props.storedScans.length; i++) {
            if (this.props.storedScans[i].actualStoredScan === true) {
                rows[i] = {};
                rows[i].id = i;
                rows[i].url = this.props.storedScans[i].url;
                rows[i].title = this.props.storedScans[i].pageTitle;
                //@ts-ignore
                rows[i].date = this.format_date(this.props.storedScans[i].dateTime);
                rows[i].label = this.props.storedScans[i].userScanLabel;
                rows[i].details = "view"
            }
        }


        return (
            <React.Fragment>

                <div className="headerLeftRN" >

                    <Grid style={{ marginTop: "64px", paddingLeft: "0rem", paddingRight: "0rem", height: "100%" }}>
                        <Column sm={{ span: 4 }} md={{ span: 8 }} lg={{ span: 16 }} className="stored-scans" style={{ marginBottom: "1rem" }}>
                            Stored Scans
                        </Column>
                        <Column sm={{ span: 4 }} md={{ span: 8 }} lg={{ span: 16 }}>
                            <div style={{ overflowX: "auto", paddingBottom: "1rem" }}>
                                <DataTable
                                    size="compact"
                                    rows={rows}
                                    headers={headers}
                                    render={({
                                        getTableProps, rows, getRowProps, headers, getHeaderProps,
                                        selectedRows, getSelectionProps,
                                        getBatchActionProps, onInputChange, getTableContainerProps, selectAll,
                                    }: any) => (
                                        <React.Fragment>
                                            {/* Since I could not figure out how to call selectAll 
                                outside of the DataTable context I made a dummy button to do it */}
                                            <Button ref={this.myRef} id="secretSelectAll" style={{ display: "none" }} onClick={this.handleSelectAll(selectAll)}>
                                                Select All
                                            </Button>
                                            <TableContainer
                                                {...getTableContainerProps()}>
                                                <TableToolbar>
                                                    <TableBatchActions {...getBatchActionProps()}>
                                                        <TableBatchAction
                                                            tabIndex={getBatchActionProps().shouldShowBatchActions ? 0 : -1}
                                                            renderIcon={Download}
                                                            onClick={() => this.downloadScanReports(selectedRows)}
                                                        >
                                                            Download
                                                        </TableBatchAction>
                                                        <TableBatchAction
                                                            tabIndex={getBatchActionProps().shouldShowBatchActions ? 0 : -1}
                                                            renderIcon={Delete}
                                                            //onClick={() => this.deleteSelected(selectedRows)}
                                                            onClick={(() => {
                                                                this.setState({ deleteModalSelectedRows: selectedRows });
                                                                this.deleteModalHandler();
                                                                // console.log(selectedRows);
                                                                // console.log(typeof selectedRows);
                                                                // this.deleteSelected(selectedRows);
                                                                // this.props.clearStoredScans(true);
                                                            }).bind(this)}
                                                        >
                                                            Delete
                                                        </TableBatchAction>
                                                    </TableBatchActions>
                                                    <TableToolbarContent>
                                                        <TableToolbarSearch
                                                            tabIndex={getBatchActionProps().shouldShowBatchActions ? -1 : 0}
                                                            onChange={onInputChange}
                                                        />
                                                    </TableToolbarContent>
                                                </TableToolbar>
                                                <Table {...getTableProps()}>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableSelectAll {...getSelectionProps()} />
                                                            {headers.map((header: any) => (
                                                                <TableHeader {...getHeaderProps({ header })}>
                                                                    {header.header}
                                                                </TableHeader>
                                                            ))}
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {rows.map((row: any, i: number) => (
                                                            <TableRow {...getRowProps({ row })}>
                                                                <TableSelectRow {...getSelectionProps({ row })} />
                                                                {row.cells.map((cell: any, index: number) => (
                                                                    // <TableCell key={cell.id}>{cell.value}</TableCell>
                                                                    <TableCell key={cell.id}>
                                                                        {index == 0 ? <div style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", direction: "rtl", width: "10rem" }}>{cell.value}</div> : ""}
                                                                        {index == 1 ? <div style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", direction: "rtl", width: "10rem" }}>{cell.value}</div> : ""}
                                                                        {index == 2 ? cell.value : ""}
                                                                        {index == 3 ? <input style={{ width: "6rem" }} type="text" placeholder={cell.value} onBlur={(e) => { this.props.storeScanLabel(e, i) }} /> : ""}
                                                                        {index == 4 ? <a onClick={() => this.screenShotModal(i)} href="javascript:void(0);">{cell.value}</a> : ""}
                                                                    </TableCell>
                                                                ))}
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                            <Modal
                                                aria-label="Scan details"
                                                modalHeading="Details"
                                                passiveModal={true}
                                                open={this.state.modalScreenShot}
                                                onRequestClose={(() => {
                                                    this.setState({ modalScreenShot: false });
                                                }).bind(this)}
                                                style={{ paddingRight: "2rem", zIndex: '9050' }}
                                            >
                                                <Grid>
                                                    <Column sm={{ span: 2 }} md={{ span: 4 }} lg={{ span: 8 }}>
                                                        <img src={this.state.screenShot} alt="Screenshot of page scanned" width="100%" />
                                                    </Column>
                                                    <Column sm={{ span: 2 }} md={{ span: 4 }} lg={{ span: 8 }}>
                                                        <div><strong>Scan label: </strong>
                                                            <input style={{ width: "6rem" }} type="text" placeholder={this.state.userScanLabel} onBlur={(e) => { this.props.storeScanLabel(e, this.state.screenShotRow) }} />
                                                        </div>
                                                        <div><strong>URL: </strong>{this.state.url}</div>
                                                        <div><strong>Page title: </strong>{this.state.pageTitle}</div>
                                                        <div>{this.state.date}</div>
                                                    </Column>
                                                </Grid>
                                            </Modal>
                                            <Modal
                                                aria-label="Delete stored scans"
                                                modalHeading="Delete stored scans"
                                                size='sm'
                                                danger={true}
                                                open={this.state.deleteModal}
                                                shouldSubmitOnEnter={false}
                                                onRequestClose={(() => {
                                                    this.setState({ deleteModal: false });
                                                }).bind(this)}
                                                onRequestSubmit={(() => {
                                                    this.setState({ deleteModal: false });
                                                    this.deleteSelected(this.state.deleteModalSelectedRows);
                                                }).bind(this)}
                                                selectorPrimaryFocus=".cds--modal-footer .cds--btn--secondary"
                                                primaryButtonText="Delete"
                                                secondaryButtonText="Cancel"
                                                primaryButtonDisabled={false}
                                                preventCloseOnClickOutside={true}
                                                style={{ zIndex: 9050 }}
                                            >
                                                <p style={{ marginBottom: '1rem' }}>
                                                    Are you sure you want to delete selected scans?
                                                    This action is irreversible.
                                                </p>
                                            </Modal>
                                        </React.Fragment>
                                    )}
                                />
                                {/* {selectAll(selectAll)} */}
                            </div>
                        </Column>
                    </Grid>
                </div>
            </React.Fragment>
        )
    }
}
