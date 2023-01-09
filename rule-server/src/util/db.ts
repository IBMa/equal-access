import { Config } from "../config";
const Cloudant = require("@cloudant/cloudant");

const createConnection = (url: string, dbName: string) => new Promise((resolve, reject) => {
    Cloudant(url, (err, cloudant) => {
        if (err) {
            reject(err);
            return;
        }
        resolve(cloudant.db.use(dbName));
    })
})

export interface DBRow<DocType, KeyType = string, ValueType = string> {
    id: string,
    rev: string,
    key: KeyType,
    value: ValueType,
    doc?: DocType
}

export enum eDB {
    AAT
}

export class DB {
    conn = null;
    db : eDB;
    constructor(db: eDB) {
        this.db = db;
        let url = null;
        if (Config.__CLOUDFOUNDRY__) {
            const VCAP_SERVICES = process.env.VCAP_SERVICES ? JSON.parse(process.env.VCAP_SERVICES) : {}
            url = VCAP_SERVICES.cloudantNoSQLDB[0].credentials.url;
        } else if (Config.__CODEENGINE__) {
            url = Config.AAT_DB;
        } else if (Config.COUCHDB_USER && Config.COUCHDB_PASSWORD) {
            url = `http://${Config.COUCHDB_USER}:${Config.COUCHDB_PASSWORD}@localhost:5984`;
        }
        if (url) {
            if (db === eDB.AAT) {
                this.conn = createConnection(url, "aat");
            } else {
                throw new Error("Invalid DB Specified");
            }
        } else {
            console.info("[WARNING]: DB not connected");
        }
    }

    static onceCache = {};

    /**
     * Gets all records from this database once per run. Will not get updated data
     */
    async getAllConst() : Promise<any[]> {
        if (!(this.db in DB.onceCache)) {
            DB.onceCache[this.db] = await this.getAll();
        }
        return DB.onceCache[this.db];
    }

    /**
     * Gets all records from this database once per run. Will not get updated data
     */
     async getAllConstNotDesign() : Promise<any[]> {
        let recs = await this.getAllConst();
        for (let idx = 0; idx < recs.length; ++idx) {
            if (recs[idx]._id[0] === "_") {
                recs.splice(idx--, 1);
            }
        }
        return recs;
    }

    /**
     * Get all records from this database
     * @returns Promise with an array of the records
     */
    async getAll() : Promise<any[]> {
        let cloudantRef = await this.conn;
        return await new Promise((resolve, reject) => {
            cloudantRef.list({ "include_docs": true }, (err, data) => {
                resolve(data.rows.map(row => row.doc));
            });
        });
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

    async getViewDocs<DocType>(design: string, view: string, keys?: any[]) : Promise<DocType[]> {
        let cloudantRef = await this.conn;
        return new Promise((resolve, reject) => {
            if (keys) {
                cloudantRef.view(design, view, { "reduce": false, "include_docs": true, keys: keys }, (err, data) => {
                    err && reject(err);
                    !err && resolve(data.rows.map((row) => row.doc));
                });
            } else {
                cloudantRef.view(design, view, { "reduce": false, "include_docs": true }, (err, data) => {
                    err && reject(err);
                    !err && resolve(data.rows.map((row) => row.doc));
                });
            }
        });
    }

    async getViewRows<KeyType = string, ValueType = string>(design: string, view: string, keys?: any[]) : Promise<DBRow<undefined, KeyType, ValueType>[]> {
        let cloudantRef = await this.conn;
        return new Promise((resolve, reject) => {
            if (keys) {
                cloudantRef.view(design, view, { "reduce": false, "include_docs": false, keys: keys }, (err, data) => {
                    err && reject(err);
                    !err && resolve(data.rows);
                });
            } else {
                cloudantRef.view(design, view, { "reduce": false, "include_docs": false }, (err, data) => {
                    err && reject(err);
                    !err && resolve(data.rows);
                });
            }
        });
    }

    async getViewRowsDocs<DocType, KeyType = string, ValueType = string>(design: string, view: string) : Promise<DBRow<DocType, KeyType, ValueType>[]> {
        let cloudantRef = await this.conn;
        return new Promise((resolve, reject) => {
            cloudantRef.view(design, view, { "reduce": false, "include_docs": true }, (err, data) => {
                err && reject(err);
                !err && resolve(data.rows);
            });
        });
    }

    async getById<DocType>(id: string) {
        let cloudantRef = await this.conn;
        return new Promise<DocType>(async (resolve, reject) => {
            cloudantRef.get(id, (err, data) => {
                err && reject(err);
                !err && resolve(data);
            })
        })
    }

    /**
     * Get all records from this database
     * @returns Promise with an array of the records
     */
     async existIds(ids: string[]) : Promise<boolean> {
        try {
            if (ids.length === 0) return true;
            let cloudantRef = await this.conn;
            return await new Promise((resolve, reject) => {
                cloudantRef.list({ "include_docs": false, "keys": ids }, (err, data) => {
                    if (!data) {
                        resolve(false);
                    } else {
                        let errors = data.rows.map(row => row.error);
                        resolve(!errors.includes("not_found"))
                    }
                });
            });
        } catch (err) {
            console.log("ERR:",err);
            return false;
        }
    }

    async fetchRows(ids: string[]) : Promise<{id: string, rev: string, value: string, doc: any, error: any}[]> {
        let cloudantRef = await this.conn;
        return new Promise(async (resolve, reject) => {
            cloudantRef.fetch({ keys: ids}, (err, data) => {
                err && reject(err);
                !err && resolve(data.rows);
            })
        })
    }

    async fetchDocs<DocType>(ids: string[]) : Promise<DocType[]> {
        let rows = await this.fetchRows(ids);
        return rows.map(row => row.doc);
    }

    /**
     * Pushes the records to the connection as a bulk update
     * @returns Promise when the update is complete
     */
    async updateRecords(records) : Promise<void> {
        if (!this.conn) return;
        let cloudantRef = await this.conn;
        await new Promise<void>((resolve, reject) => {
            cloudantRef.bulk({ "docs": records }, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}
