/******************************************************************************
 * Licensed Materials - Property of IBM
 * "Restricted Materials of IBM"
 * © Copyright IBM Corp. 2023 All Rights Reserved.
 *
 * Copying, redistribution and/or modification is prohibited.
 * U.S. Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 *****************************************************************************/
// See https://cloud.ibm.com/apidocs/cloudant?code=node
export interface DBRow<DocType, KeyType = string, ValueType = string> {
    id: string,
    rev: string,
    key: KeyType,
    value: ValueType,
    doc?: DocType
}

export interface ICloudant {
    /**
     * Pushes the records to the connection as a bulk update
     * @returns Promise when the update is complete
     */
    updateDocs<DocType>(records: (DocType & { _id?: string, _rev?: string, _deleted?: boolean })[]) : Promise<Array<{ _id: string, _rev: string} & DocType>>;

    updateDoc<DocType>(record: (DocType & { _id?: string, _rev?: string, _deleted?: boolean })) : Promise<{ _id: string, _rev: string} & DocType>;

    createDocs<DocType>(records: DocType[]) : Promise<Array<{ _id: string, _rev: string} & DocType>>;

    createDoc<DocType>(record: DocType) : Promise<{ _id: string, _rev: string} & DocType>;

    /**
     * Get all records from this database
     * @returns Promise with an array of the records
     */
    getAll<DocType = any>() : Promise<DocType[]>;

    getAllNotDesign<DocType = any>() : Promise<DocType[]>;

    getViewReduce<KeyType, RetType>(design: string, view: string, groupLevel: number, keys?: any[], startKey?: any, endKey?: any): Promise<Array<{ key: KeyType, value: RetType}>>;

    getViewDocs<DocType>(design: string, view: string, keys?: any[]) : Promise<DocType[]>;

    getViewRows<KeyType = string, ValueType = string>(design: string, view: string, options?: { keys?: any[], limit?: number }) : Promise<DBRow<undefined, KeyType, ValueType>[]>;

    getViewRowsDocs<DocType, KeyType = string, ValueType = string>(design: string, view: string, keys?: any[]) : Promise<DBRow<DocType, KeyType, ValueType>[]>;

    getById<DocType>(id: string): Promise<DocType>;

    getRev(id: string): Promise<string>;

    /**
     * Get all records from this database
     * @returns Promise with an array of the records
     */
    existIds(ids: string[]) : Promise<boolean>;

    fetchRows(ids: string[]) : Promise<{id: string, rev: string, value: string, doc: any, error: any}[]>;

    fetchDocs<DocType>(ids: string[]) : Promise<DocType[]>;

    removeDoc(doc: { _id: string, _rev: string}) : Promise<void>

    deleteDatabase() : Promise<void>

    createDatabase(partitioned: boolean): Promise<void>
}