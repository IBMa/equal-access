
import React, { Component } from 'react';
import { 
    DataTableSkeleton, 
    DataTable, 
    Pagination,
    Table,
    TableToolbar,
    TableToolbarSearch,
    TableBatchActions,
    TableBatchAction,
    TableSelectRow,
    TableSelectAll,
    TableHead,
    TableHeader,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TableToolbarContent,
} from '@carbon/react';
import { ChooseItem } from "@carbon/react/icons";
import { IBasicTableRowRecord } from '../../interfaces/interfaces';
import './BasicTable.scss';

interface BasicTableProps<IRowRecord extends IBasicTableRowRecord> {
    emptyLabel: string
    headers: Array<{ key: string, header: string }>
    data?: IRowRecord[]
    batchActions?: Array<{
        icon: any
        label: string,
        onClick: (selectedRows: IRowRecord[]) => any
    }>
    pageSizes?: number[]
    className?: string
    hideToolbar?: boolean
    hideHeaders?: boolean
    totalRows?: boolean
    onRow?: (id: string) => Promise<void>
    fieldMapper?: (rowId: string, cellId: string, cellValue: string) => any
}

interface BasicTableState {
    currentPage: number
    totalOnPage: number
}

export class BasicTable<IRowRecord extends IBasicTableRowRecord> extends Component<BasicTableProps<IRowRecord>, BasicTableState> {
    state: BasicTableState = {
        currentPage: 1,
        totalOnPage: this.props.pageSizes ? this.props.pageSizes[0] : -1
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps: Readonly<BasicTableProps<IRowRecord>>, _prevState: Readonly<BasicTableState>, _snapshot?: any): void {
        if (!!this.props.data !== !!prevProps.data) {
            this.setState({
                currentPage: 1
            });
        }
    }

    render() {
        let content = <></>;
        let myHeaders : Array<{key: string, header:string}> = JSON.parse(JSON.stringify(this.props.headers));
        if (this.props.onRow) {
            myHeaders.push(
                { header: 'Detail', key: "" }
            )
        }

        if (!this.props.data) {
            content = <div>
                <DataTableSkeleton
                    headers={(!this.props.hideHeaders && myHeaders.map(header => header.header)) || undefined}
                    showHeader={false}
                    showToolbar={false}
                    rowCount={3}
                    columnCount={myHeaders.length} />
            </div>
        } else if (this.props.data.length === 0) {
            content = <>{ this.props.emptyLabel }</>
        } else {
            let pageRows = (rows: any[], currentPage: number, totalOnPage: number) => {
                if (totalOnPage < 0) return rows;
                const dataStartAt = (Number(currentPage) - 1) * totalOnPage;
                let numPage = Math.ceil(rows.length / totalOnPage);
                const dataEndAt = currentPage <= numPage ? dataStartAt + Number(totalOnPage) : rows.length - 1;

                return rows.slice(dataStartAt, dataEndAt);
            };

            let rows: IBasicTableRowRecord[] = this.props.data;

            content = (<div>
                <DataTable
                    rows={rows}
                    headers={myHeaders}
                    // filterRows={filterRows}
                    isSortable={true} >
                    {({
                        rows,
                        headers,
                        onInputChange,
                        getTableProps,
                        getHeaderProps,
                        // getRowProps,
                        selectedRows,
                        getSelectionProps,
                        getTableContainerProps,
                        getToolbarProps,
                        getBatchActionProps,
                    }: {
                        rows: any,
                        headers: Array<{key: string, header: string}>,
                        onInputChange: any,
                        selectedRows: any,
                        getTableProps: any,
                        getHeaderProps: any,
                        getSelectionProps: any,
                        getTableContainerProps: any,
                        getToolbarProps: any,
                        getBatchActionProps: any
                    }) => {
                        let totals: any[] = [];
                        while (totals.length < headers.length-1) {
                            totals.push(null);
                        }
                        for (const row of rows) {
                            headers.forEach((header, idx) => {
                                let value = row.cells.filter((cell : any )=> cell.id.includes(":"+header.key))[0].value;
                                if (!isNaN(totals[idx - 1]) && /^\d+$/.test(value)) {
                                    totals[idx - 1] = totals[idx - 1] || 0;
                                    totals[idx - 1] = totals[idx - 1] + parseInt(value);
                                } else {
                                    totals[idx - 1] = NaN;
                                }
                            });
                        }

                        let pageData = pageRows(rows, this.state.currentPage, this.state.totalOnPage);
                        let hasBatchActions = this.props.batchActions && this.props.batchActions.length > 0;
                        return (
                            <div>
                                <TableContainer 
                                    title="DataTable"
                                    description="With selection"
                                    {...getTableContainerProps()}>
                                    {!this.props.hideToolbar && <TableToolbar {...getToolbarProps()} aria-label="data table toolbar">
                                        {hasBatchActions && <TableBatchActions { ...getBatchActionProps()}>
                                            {this.props.batchActions!.map((batchAction => (
                                            <TableBatchAction
                                                renderIcon={batchAction.icon}
                                                onClick={() => batchAction.onClick(selectedRows)}
                                            >
                                                {batchAction.label}
                                            </TableBatchAction>
                                        )))}
                                        </TableBatchActions>}
                                        <TableToolbarContent>
                                            <TableToolbarSearch 
                                                persistent={true} 
                                                defaultExpanded={true} 
                                                onChange={onInputChange} 
                                                placeholder='Search table' 
                                                labelText='Search table' 
                                                id='table_filter' />
                                        </TableToolbarContent>
                                    </TableToolbar>}

                                    <Table {...getTableProps()}>
                                        <TableHead>
                                            {!this.props.hideHeaders && <TableRow>
                                                {hasBatchActions && <TableSelectAll {...getSelectionProps()} />}
                                                {headers.map((header: any) => {
                                                    return <TableHeader key={header.key} {...getHeaderProps({ header })}>
                                                        {header.header}
                                                    </TableHeader>
                                                })}
                                            </TableRow>}
                                        </TableHead>
                                        <TableBody>
                                            {pageData.map((row) => {
                                                return <TableRow key={row.id}>
                                                    { hasBatchActions && <TableSelectRow {...getSelectionProps({ row })} />}
                                                    {row.cells.map((cell: any) => {
                                                        if ((cell.id as string).endsWith(":") && this.props.onRow) {
                                                            return <TableCell key="rowReport" className="rowReport" onClick={() => this.props.onRow && this.props.onRow(cell.id)}><ChooseItem /></TableCell>;
                                                        } else if (this.props.fieldMapper) {
                                                            return <TableCell key={cell.id}>{this.props.fieldMapper(row.id, cell.id.split(":")[1], cell.value)}</TableCell>
                                                        } else {
                                                            return <TableCell key={cell.id}>{cell.value || ""}</TableCell>
                                                        }
                                                    })}
                                                </TableRow>
                                            })}
                                            {this.props.totalRows && <TableRow>
                                                <TableCell><strong>Total</strong></TableCell>
                                                {totals.map((val, idx) => (<TableCell key={idx}>
                                                    <strong>{isNaN(val) ? "" : val}</strong>
                                                </TableCell>))}
                                            </TableRow>}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                {this.props.pageSizes && (() => {
                                    let paginationProps = {
                                        onChange: ({ page, pageSize }: { page: number, pageSize: number }) => {
                                            this.setState({
                                                currentPage: page,
                                                totalOnPage: pageSize
                                            })
                                        },
                                        pageSizes: this.props.pageSizes
                                    };
                                    return (
                                        <Pagination
                                            {...paginationProps}
                                            totalItems={rows.length}
                                            page={this.state.currentPage}
                                        />
                                    )
                                })()}

                            </div>
                        )
                    }
                    }
                </DataTable>
            </div>);
        }
        return (
            <div className={this.props.className}>
                { content }
            </div>
        );
    }
}
