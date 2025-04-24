/******************************************************************************
 * Licensed Materials - Property of IBM
 * "Restricted Materials of IBM"
 * © Copyright IBM Corp. 2023 All Rights Reserved.
 *
 * Copying, redistribution and/or modification is prohibited.
 * U.S. Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 *****************************************************************************/
// import { CloudantV1 } from "@ibm-cloud/cloudant";
import { DBRow, ICloudant } from "./ICloudant";

// See https://cloud.ibm.com/apidocs/cloudant?code=node
export class CloudantDBWrap implements ICloudant {

    public static createConnection = async (url: string, apikey: string) => {
        // @ts-ignore
        const { CloudantV1 } = await import("@ibm-cloud/cloudant");
        // @ts-ignore
        const { IamAuthenticator } = await import("ibm-cloud-sdk-core");

        // Setup database
        const authenticator = new IamAuthenticator({
            apikey
        });

        const service = new CloudantV1({
            authenticator: authenticator
        });

        service.setServiceUrl(url);
        return service;
    }

    // constructor(protected conn: Promise<CloudantV1>, protected dbName: string) {}
    constructor(protected conn: Promise<any>, protected dbName: string) {}

    static async rateRetry<T>(funcName: string, f: () => Promise<T>) {
        do {
            try {
                return await f();
            } catch (err) {
                const error = err?.result?.error;
                if (error !== "too_many_requests") {
                    // console.error(`[${funcName}]:`, err);
                    if (error === "conflict") {
                        console.trace();
                    }
                    throw err.result;
                } else {
                    await new Promise((resolve) => {
                        setTimeout(resolve, 500);
                    })
                }
            }
        } while (true);
    }

    /**
     * Get all records from this database
     * @returns Promise with an array of the records
     */
    async getAll() : Promise<any[]> {
        let service = await this.conn;
        let retVal = [];
        let limit = 5000;
        let skip = 0;
        let total_rows = 0;
        let bContinue = true;
        while (bContinue) {
            let recs = await CloudantDBWrap.rateRetry("getAll", async () => {
                let resp = await service.postAllDocs({
                    db: this.dbName,
                    includeDocs: true,
                    skip,
                    limit
                })
                const data = resp.result;
                if (!data?.rows || data.rows.length === 0) {
                    return [];
                } else {
                    total_rows = data.total_rows || data.totalRows;
                    return data.rows.map(row => row.doc);
                }
            });
            skip += recs.length;
            bContinue = skip < total_rows;
            if (recs.length > 0) {
                retVal = retVal.concat(recs);
            }
        }
        return retVal;
    }

    async getAllNotDesign() : Promise<any[]> {
        let recs = await this.getAll();
        for (let idx = 0; idx < recs.length; ++idx) {
            if (recs[idx]._id[0] === "_") {
                recs.splice(idx--, 1);
            }
        }
        return recs;
    }

    async getViewReduce<KeyType, RetType>(design: string, view: string, groupLevel: number, keys?: any[], startKey?: any, endKey?: any): Promise<Array<{ key: KeyType, value: RetType}>> {
        let cloudantRef = await this.conn;
        let opts = {
            db: this.dbName,
            ddoc: design,
            view: view,
            reduce: true, includeDocs: false, groupLevel, keys, startKey, endKey
        };
        Object.keys(opts).forEach(key => opts[key] === undefined ? delete opts[key] : {});

        return await CloudantDBWrap.rateRetry("getViewReduce", async () => (
            (await cloudantRef.postView(opts)).result.rows.map((row) => ({ key: row.key, value: row.value }))
        ));
    }

    async getViewDocs<DocType>(design: string, view: string, keys?: any[]) : Promise<DocType[]> {
        let cloudantRef = await this.conn;
        let opts = {
            db: this.dbName,
            ddoc: design,
            view: view,
            reduce: false, includeDocs: true, keys: keys
        }
        Object.keys(opts).forEach(key => opts[key] === undefined ? delete opts[key] : {});

        return await CloudantDBWrap.rateRetry("getViewDocs", async () => (
            (await cloudantRef.postView(opts)).result.rows.map((row) => row.doc)
        ));
    }

    async getViewRows<KeyType = string, ValueType = string>(design: string, view: string, options?: { keys?: any[], limit?: number }) : Promise<DBRow<undefined, KeyType, ValueType>[]> {
        let cloudantRef = await this.conn;
        let opts = {
            db: this.dbName,
            ddoc: design,
            view: view,
            reduce: false, includeDocs: false, ...options
        }
        Object.keys(opts).forEach(key => opts[key] === undefined ? delete opts[key] : {});

        return await CloudantDBWrap.rateRetry("getViewRows", async () => (
            (await cloudantRef.postView(opts)).result.rows
        ));
    }

    async getViewRowsDocs<DocType, KeyType = string, ValueType = string>(design: string, view: string, keys?: any[]) : Promise<DBRow<DocType, KeyType, ValueType>[]> {
        let cloudantRef = await this.conn;
        return await CloudantDBWrap.rateRetry("getViewRowsDocs", async () => (
            (await cloudantRef.postView({
                db: this.dbName,
                ddoc: design,
                view: view,
                reduce: false,
                includeDocs: true,
                keys
            })).result.rows
        ));
    }

    async getById<DocType>(id: string) {
        let cloudantRef = await this.conn;
        if (id.startsWith("_")) {
            return await CloudantDBWrap.rateRetry("getById", async () => (
                (await cloudantRef.getDesignDocument({
                    db: this.dbName,
                    ddoc: id.substring("_design/".length)
                })).result
            ));
        } else {
            return await CloudantDBWrap.rateRetry("getById", async () => (
                (await cloudantRef.getDocument({
                    db: this.dbName,
                    docId: id
                })).result
            ));
        }
    }

    /**
     * Get all records from this database
     * @returns Promise with an array of the records
     */
     async existIds(ids: string[]) : Promise<boolean> {
        try {
            if (ids.length === 0) return true;
            let cloudantRef = await this.conn;
            return await CloudantDBWrap.rateRetry("existIds", async () => {
                let resp = await cloudantRef.postAllDocs({
                    db: this.dbName,
                    includeDocs: false,
                    keys: ids
                });
                let data = resp.result;
                if (!data) {
                    return false;
                } else {
                    let errors = data.rows.map(row => row.error);
                    let deleted = data.rows.filter(row => row?.value?.deleted === true);
                    return !errors.includes("not_found") && data.rows.length === ids.length && deleted.length === 0;
                }
            });
        } catch (err) {
            console.error("ERR:",err);
            return false;
        }
    }

    async fetchRows(ids: string[]) : Promise<{id: string, rev: string, value: string, doc: any, error: any}[]> {
        if (ids.length === 0) return [];
        let cloudantRef = await this.conn;
        return await CloudantDBWrap.rateRetry("fetchRows", async () => (
            (await cloudantRef.postAllDocs({
                db: this.dbName,
                includeDocs: true,
                keys: ids
            })).result.rows
        ));
    }

    async fetchDocs<DocType>(ids: string[]) : Promise<DocType[]> {
        let rows = await this.fetchRows(ids);
        return rows.filter(row => row?.doc && !row.error).map(row => row.doc);
    }

    /**
     * Pushes the records to the connection as a bulk update
     * @returns Promise when the update is complete
     */
    async updateDocs<DocType>(records: (DocType & { _id?: string, _rev?: string, _deleted?: boolean })[]) : Promise<Array<{ _id: string, _rev: string} & DocType>> {
        let cloudantRef = await this.conn;
        let designDocs = records.filter(rec => rec._id.startsWith("_"));
        let remainingRecs = JSON.parse(JSON.stringify(records.filter(rec => !rec._id.startsWith("_"))));
        for (const designDoc of designDocs) {
            await this.updateDoc(designDoc);
        }
        let retVal: Array<{ _id: string, _rev: string} & DocType> = [];
        while (remainingRecs.length > 0) {
            let thisUpdate = [];
            if (remainingRecs.length > 200) {
                thisUpdate = remainingRecs.splice(0,200);
            } else {
                thisUpdate = remainingRecs;
                remainingRecs = [];
            }
            let { result } = await CloudantDBWrap.rateRetry("updateDocs", async () => (
                cloudantRef.postBulkDocs({
                    db: this.dbName,
                    bulkDocs: { docs: thisUpdate }
                })
            ));
            for (let idx=0; idx < thisUpdate.length; ++idx) {
                if (result[idx].ok) {
                    thisUpdate[idx]._id = result[idx].id;
                    thisUpdate[idx]._rev = result[idx].rev;
                    retVal.push(thisUpdate[idx]);
                } else {
                    retVal.push(null);
                }
            }
        }
        return retVal;
    }
    async createDocs<DocType>(records: DocType[]) : Promise<Array<{ _id: string, _rev: string} & DocType>> {
        return this.updateDocs(records);
    }

    async updateDoc<DocType>(record: (DocType & { _id?: string, _rev?: string, _deleted?: boolean })) : Promise<{ _id: string, _rev: string} & DocType> {
        let cloudantRef = await this.conn;
        let result;
        if (record._id.startsWith("_")) {
            if (record._rev === undefined) delete record._rev;

            for (const viewId in (record as any).views) {
                (record as any).views[viewId].map = (record as any).views[viewId].map.toString()
            }

            result = await CloudantDBWrap.rateRetry("updateDoc", async () => (
                await cloudantRef.putDesignDocument({
                    db: this.dbName,
                    ddoc: record._id.split("/").splice(1).join("/"),
                    rev: record._rev,
                    designDocument: record
                })
            ))
        } else {
            result = await CloudantDBWrap.rateRetry("updateDoc", async () => (
                await cloudantRef.putDocument({
                    db: this.dbName,
                    docId: record._id,
                    rev: record._rev,
                    document: record
                })
            ));
        }
        let retVal = JSON.parse(JSON.stringify(record));
        retVal._id = result.result.id;
        retVal._rev = result.result.rev;
        return retVal;
    }

    async createDoc<DocType>(record: DocType) : Promise<{ _id: string, _rev: string} & DocType> {
        return this.updateDoc(record);
    }

    async removeDoc(doc: { _id: string, _rev: string}) : Promise<void> {
        let cloudantRef = await this.conn;
        await cloudantRef.deleteDocument({
            db: this.dbName,
            docId: doc._id,
            rev: doc._rev
        });
    }

    async deleteDatabase() {
        let service = await this.conn;
        await service.deleteDatabase({
            db: this.dbName
        })
    }

    async createDatabase(partitioned: boolean) {
        let service = await this.conn;
        await service.putDatabase({
            db: this.dbName,
            partitioned
        });
    }


    async getRev(id: string): Promise<string> {
        let service = await this.conn;

        let headInfo = await service.headDocument({
            db: this.dbName,
            docId: id
        })
        return JSON.parse(headInfo.headers.etag);
    }
}