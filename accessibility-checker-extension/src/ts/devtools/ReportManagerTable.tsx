
import React from 'react';
import { DataTable, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader,
    TableRow, TableSelectAll, TableSelectRow, TableToolbar,
    TableToolbarContent,
    TableToolbarSearch, TableBatchActions, TableBatchAction, Row, Button, Modal
} from 'carbon-components-react';

import { Delete16, Download16 } from '@carbon/icons-react';

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
    storeScanLabel: (e:any, i:number) => void,
    clearSelectedStoredScans: () => void,
}

export default class ReportManagerTable extends React.Component<IReportManagerTableProps, IReportManagerTableState> {
    myRef: React.RefObject<HTMLButtonElement>;
    constructor(props:any) {
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
    };

    format_date(timestamp: string) {
        var date = new Date(timestamp);

        return ("00" + (date.getMonth() + 1)).slice(-2) + "/" +("00" + date.getDate()).slice(-2) + "/" +
            ("00" + date.getFullYear()).slice(-2) + ' ' +
            ("00" + date.getHours()).slice(-2) + ":" +
            ("00" + date.getMinutes()).slice(-2) + ":" +
            ("00" + date.getSeconds()).slice(-2);
    }

    downloadScanReports(selectedRows:any) {
        // clear old selected rows
        this.props.clearSelectedStoredScans();
        // set selected rows / scans in storedScans
        for (let i=0; i<selectedRows.length; i++) {
            if (selectedRows[i].isSelected === true) {
                this.props.storedScans[selectedRows[i].id].isSelected = true;
            }
        }

        this.props.reportHandler("selected");
    }

    deleteSelected(selectedRows:any) { 
        // get index(s) of selected row(s) to delete that match up with storedScans
        let indexes:number[] = [];

        // clear old selected rows
        this.props.clearSelectedStoredScans();
        for (let i=0; i<selectedRows.length; i++) {
            if (selectedRows[i].isSelected === true) {
                // this.props.storedScans[selectedRows[i].id].isSelected = true;
                indexes.push(selectedRows[i].id);
            }
        }

        for (var i = indexes.length -1; i >= 0; i--)
                this.props.storedScans.splice(indexes[i], 1);

        // update state storedScanCount
        this.props.setStoredScanCount();

        // need a change of state to rerender scan manager
        if (this.state.redisplayTable === true) {
            this.setState({ redisplayTable:  false });
        } else if (this.state.redisplayTable === false) {
            this.setState({ redisplayTable:  true });
        }

        // document.getElementById("secretSelectAll")?.click();
        //@ts-ignore
        this.myRef.current.click();
    }    

    handleSelectAll = (selectAll: { (): void; (): void; }) => () => {
        selectAll();
    };

    screenShotModal(rowNum:number) {
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

    render() {

        const headers = [
            {
                header: 'URL', 
                key:    'url',
            },
            {
                header: 'Page title', 
                key:    'title',
            },
            {
                header: 'Date and Time', 
                key:    'date',
            },
            {
                header: 'Scan label', 
                key:    'label',
            },
            {
                header: 'Details', 
                key:    'details',
            },
        ];

        // create scan rows from stored scans
        let rows:any[] = [];
        for (let i=0; i<this.props.storedScans.length; i++) {
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
                
                <Row style={{marginTop:"64px",paddingLeft:"16px",height:"100%"}}>
                    <div className="bx--col-lg-3 bx--col-sm-4 stored-scans" style={{marginBottom:"14px"}}>
                        Stored Scans
                    </div>
                    <div className="bx--col-lg-8 bx--col-sm-6" style={{paddingLeft:0}}>
                    <div style={{overflowX:"auto", paddingBottom:"16px"}}>
                    <DataTable 
                        size="compact" 
                        rows={rows} 
                        headers={headers}
                        render={({
                            getTableProps, rows, getRowProps, headers, getHeaderProps, 
                            selectedRows, getSelectionProps,
                            getBatchActionProps, onInputChange, getTableContainerProps, selectAll,
                        }) => (
                            <React.Fragment>
                                {/* Since I could not figure out how to call selectAll 
                                outside of the DataTable context I made a dummy button to do it */}
                                <Button ref={this.myRef} id="secretSelectAll"  style={{display:"none"}} onClick={this.handleSelectAll(selectAll)}>
                                    Select All
                                </Button>
                            <TableContainer
                            {...getTableContainerProps()}>
                                <TableToolbar>
                                <TableBatchActions {...getBatchActionProps()}>
                                    <TableBatchAction
                                        tabIndex={getBatchActionProps().shouldShowBatchActions ? 0 : -1}
                                        renderIcon={Download16}
                                        onClick={() => this.downloadScanReports(selectedRows)}
                                    >
                                        Download
                                    </TableBatchAction>
                                    <TableBatchAction
                                        tabIndex={getBatchActionProps().shouldShowBatchActions ? 0 : -1}
                                        renderIcon={Delete16}
                                        onClick={() => this.deleteSelected(selectedRows)}
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
                                    {headers.map((header:any) => (
                                    <TableHeader {...getHeaderProps({ header })}>
                                        {header.header}
                                    </TableHeader>
                                    ))}
                                </TableRow>
                                </TableHead>
                                <TableBody>
                                {rows.map((row:any, i:number) => (
                                    <TableRow {...getRowProps({ row })}>
                                    <TableSelectRow {...getSelectionProps({ row })} />
                                    {row.cells.map((cell:any,index:number) => (
                                        // <TableCell key={cell.id}>{cell.value}</TableCell>
                                        <TableCell key={cell.id}>
                                            {index == 0 ? <div style={{textOverflow:"ellipsis", overflow:"hidden", whiteSpace:"nowrap", direction:"rtl", width:"10rem"}}>{cell.value}</div> : ""}
                                            {index == 1 ? <div style={{textOverflow:"ellipsis", overflow:"hidden", whiteSpace:"nowrap", direction:"rtl", width:"10rem"}}>{cell.value}</div> : ""}
                                            {index == 2 ? cell.value : ""}
                                            {index == 3 ? <input style={{width:"6rem"}} type="text" placeholder={cell.value} onBlur={(e) => {this.props.storeScanLabel(e,i)}}/> : ""}
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
                                style={{paddingRight:"2rem"}}
                            >
                                <div className="bx--row">
                                    <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-2">
                                        <img src={this.state.screenShot} alt="Screenshot of page scanned" width="100%"/>  
                                    </div>
                                    <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-2">
                                        <div><strong>Scan label: </strong>
                                            <input style={{width:"6rem"}} type="text" placeholder={this.state.userScanLabel} onBlur={(e) => {this.props.storeScanLabel(e,this.state.screenShotRow) }}/>
                                        </div>
                                        <div><strong>URL: </strong>{this.state.url}</div>
                                        <div><strong>Page title: </strong>{this.state.pageTitle}</div>
                                        <div>{this.state.date}</div>
                                    </div>
                                </div>
                            </Modal>
                            </React.Fragment>
                        )}
                        />
                        {/* {selectAll(selectAll)} */}
                    </div> 
                    </div>   
                </Row>
            </div>
            </React.Fragment>
        )
    }
}
