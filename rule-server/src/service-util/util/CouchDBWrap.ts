/******************************************************************************
 * Licensed Materials - Property of IBM
 * "Restricted Materials of IBM"
 * © Copyright IBM Corp. 2023 All Rights Reserved.
 *
 * Copying, redistribution and/or modification is prohibited.
 * U.S. Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 *****************************************************************************/
// import nano from "nano";
import { DBRow, ICloudant } from "./ICloudant";

export class CouchDBWrap implements ICloudant {
    // protected conn: Promise<nano.DocumentScope<any>>;
    protected conn;

    /**
     * 
     * @param dburl 
     * @param dbName 
     * @param bTestWipe If true, will add "-test" to the DB name and wipe it when the connection is created
     * @returns 
     */
    public static async createConnection(dburl: string) {
        // Create a couchdb instance pointing to the dburl provided or default
        // @ts-ignore
        const Nano = (await import('nano')).default;
        const nano = Nano(dburl);

        // In the case that this is running in test mode, destroy, create the db as new and also append -test to the provided
        // DB name.
        return nano.db;
    }
    
    constructor(protected dbP: Promise<any>, protected dbName) { 
        this.conn = dbP.then((db) => {
            return db.use(dbName);
        })
    }

    static async rateRetry<T>(f: () => Promise<T>) {
        do {
            try {
                return await f();
            } catch (err) {
                if (err.error !== "too_many_requests") {
                    if (err.error === "conflict") {
                        console.trace("Document update conflict");
                    }
                    throw err;
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
        let couchDBRef = await this.conn;
        let retVal = [];
        let limit = 500;
        let skip = 0;
        let total_rows = 0;
        let bContinue = true;
        while (bContinue) {
            let recs = await CouchDBWrap.rateRetry(async () => (
                await new Promise<any[]>((resolve, reject) => {
                    couchDBRef.list({ "include_docs": true, limit, skip }, (err, data) => {
                        err && console.error(err);
                        if (err) {
                            reject(err);
                        } else if (!data?.rows || data.rows.length === 0) {
                            resolve([]);
                        } else {
                            total_rows = data.total_rows;
                            resolve(data.rows.map(row => row.doc));
                        }
                    });
                })
            ));
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

    async getViewReduce<KeyType, RetType>(design: string, view: string, group_level: number,keys?: any[]): Promise<Array<{ key: KeyType, value: RetType}>> {
        let couchDBRef = await this.conn;
        return await CouchDBWrap.rateRetry(async () => (
            new Promise((resolve, reject) => {
                if (keys) {
                    couchDBRef.view(design, view, { "reduce": true, "include_docs": false, group_level, keys: keys }, (err, data: any) => {
                        err && reject(err);
                        !err && resolve(data.rows.map((row) => ({ key: row.key, value: row.value })));
                    });
                } else {
                    couchDBRef.view(design, view, { "reduce": true, "include_docs": false, group_level }, (err, data: any) => {
                        err && reject(err);
                        !err && resolve(data.rows.map((row) => ({ key: row.key, value: row.value })));
                    });
                }
            })
        ));
    }

    async getViewDocs<DocType>(design: string, view: string, keys?: any[]) : Promise<DocType[]> {
        let couchDBRef = await this.conn;
        return await CouchDBWrap.rateRetry(async () => (
            await new Promise((resolve, reject) => {
                if (keys) {
                    couchDBRef.view(design, view, { "reduce": false, "include_docs": true, keys: keys }, (err, data) => {
                        err && reject(err);
                        !err && resolve(data.rows.map((row) => row.doc));
                    });
                } else {
                    couchDBRef.view(design, view, { "reduce": false, "include_docs": true }, (err, data) => {
                        err && reject(err);
                        !err && resolve(data.rows.map((row) => row.doc));
                    });
                }
            })
        ));
    }

    async getViewRows<KeyType = string, ValueType = string>(design: string, view: string, options?: { keys?: any[], limit?: number }) : Promise<DBRow<undefined, KeyType, ValueType>[]> {
        let couchDBRef = await this.conn;
        return await CouchDBWrap.rateRetry(async () => (
            new Promise((resolve, reject) => {
                if (options) {
                    couchDBRef.view(design, view, { "reduce": false, "include_docs": false, ...options }, (err, data: any) => {
                        err && reject(err);
                        !err && resolve(data.rows);
                    });
                } else {
                    couchDBRef.view(design, view, { "reduce": false, "include_docs": false }, (err, data: any) => {
                        err && reject(err);
                        !err && resolve(data.rows);
                    });
                }
            })
        ));
    }

    async getViewRowsDocs<DocType, KeyType = string, ValueType = string>(design: string, view: string, keys?: any[]) : Promise<DBRow<DocType, KeyType, ValueType>[]> {
        let couchDBRef = await this.conn;
        return await CouchDBWrap.rateRetry(async () => (
            new Promise((resolve, reject) => {
                couchDBRef.view(design, view, { "reduce": false, "include_docs": true, keys }, (err, data: any) => {
                    err && reject(err);
                    !err && resolve(data.rows);
                });
            })
        ));
    }

    async getById<DocType>(id: string) {
        let couchDBRef = await this.conn;
        return await CouchDBWrap.rateRetry(async () => (
            new Promise<DocType>(async (resolve, reject) => {
                couchDBRef.get(id, (err, data) => {
                    err && reject(err);
                    !err && resolve(data);
                })
            })
        ));
    }

    /**
     * Get all records from this database
     * @returns Promise with an array of the records
     */
     async existIds(ids: string[]) : Promise<boolean> {
        try {
            if (ids.length === 0) return true;
            let couchDBRef = await this.conn;
            return await CouchDBWrap.rateRetry(async () => (
                await new Promise((resolve, reject) => {
                    couchDBRef.list({ "include_docs": false, "keys": ids }, (err, data) => {
                        if (!data) {
                            resolve(false);
                        } else {
                            let errors = data.rows.map(row => row.error);
                            // @ts-ignore
                            let deleted = data.rows.filter(row => row?.value?.deleted === true);
                            resolve(!errors.includes("not_found") && data.rows.length === ids.length && deleted.length === 0);
                        }
                    });
                })
            ));
        } catch (err) {
            console.error("ERR:",err);
            return false;
        }
    }

    async fetchRows(ids: string[]) : Promise<{id: string, rev: string, value: string, doc: any, error: any}[]> {
        if (ids.length === 0) return [];
        let couchDBRef = await this.conn;
        return await CouchDBWrap.rateRetry(async () => (
            new Promise(async (resolve, reject) => {
                couchDBRef.fetch({ keys: ids }, (err, data: any) => {
                    err && reject(err);
                    !err && resolve(data.rows);
                })
            })
        ));
    }

    async fetchDocs<DocType>(ids: string[]) : Promise<DocType[]> {
        let rows = await this.fetchRows(ids);
        return rows.map(row => row.doc);
    }

    /**
     * Pushes the records to the connection as a bulk update
     * @returns Promise when the update is complete
     */
    async updateDocs<DocType>(records: (DocType & { _id?: string, _rev?: string, _deleted?: boolean })[]) : Promise<Array<{ _id: string, _rev: string} & DocType>> {
        let couchDBRef = await this.conn;
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
            let result: Array<{id: string, rev: string, ok: boolean }> = await CouchDBWrap.rateRetry(async () => (
                couchDBRef.bulk({ "docs": thisUpdate }, {})
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
        let couchDBRef = await this.conn;
        let result = await CouchDBWrap.rateRetry(async () => (
            await new Promise<{id: string, rev: string, ok: boolean}>((resolve, reject) => {
                couchDBRef.insert(record, {}, (err, data) => {
                    if (err) {
                        reject(err);
                    } else if (!data.ok) {
                        reject("Update failed");
                    } else {
                        resolve(data);
                    }
                });
            })
        ));
        let retVal = JSON.parse(JSON.stringify(record));
        retVal._id = result.id;
        retVal._rev = result.rev;
        return retVal;
    }

    async createDoc<DocType>(record: DocType) : Promise<{ _id: string, _rev: string} & DocType> {
        return this.updateDoc(record);
    }

    async removeDoc(doc: { _id: string, _rev: string}) : Promise<void> {
        let couchDBRef = await this.conn;
        return new Promise<void>((resolve, reject) => {
            couchDBRef.destroy(doc._id, doc._rev, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        });
    }

    async deleteDatabase() {
        const db = await this.dbP;
        await new Promise<void>((resolve, reject) => {
            db.destroy(this.dbName, resolve);
        })
    }

    async createDatabase(partitioned: boolean) {
        const db = await this.dbP;
        await new Promise<void>((resolve, reject) => {
            db.create(this.dbName, { partitioned }, resolve);
        })
    }

    async getRev(id: string): Promise<string> {
        let couchDBRef = await this.conn;
        return new Promise((resolve, reject) => {
            couchDBRef.head(id, (err, val, headers) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(JSON.parse(headers.etag));
            });
        });

    }
}