/******************************************************************************
 * Licensed Materials - Property of IBM
 * "Restricted Materials of IBM"
 * © Copyright IBM Corp. 2023 All Rights Reserved.
 *
 * Copying, redistribution and/or modification is prohibited.
 * U.S. Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 *****************************************************************************/

import { join } from "path";
import { Config } from "../config";
import { CouchDBWrap } from "../service-util/util/CouchDBWrap";
import { ICloudant } from "../service-util/util/ICloudant";
import { existsSync, readdirSync, statSync } from "fs";

export enum eDB {
    AAT
}

let dbConns = {}
type EnumDictionary<T extends string | symbol | number, U> = {
    [K in T]: U;
};

export async function getDB(db: eDB): Promise<ICloudant> {
    if (dbConns[db]) {
        return dbConns[db];
    } else {
        return dbConns[db] = new Promise<ICloudant>(async (resolve, reject) => {
            let retVal: ICloudant;

            const dbNameMap: EnumDictionary<eDB, string> = {
                [eDB.AAT]: "aat"
            }
            const dbName = dbNameMap[db];
            if (db === eDB.AAT) {
                if (Config.__CLOUD__ || (Config.AAT_DB && Config.AAT_DB_APIKEY)) {
                    const { CloudantDBWrap } = await import("../service-util/util/CloudantDBWrap");
                    retVal = new CloudantDBWrap(CloudantDBWrap.createConnection(Config.AAT_DB, Config.AAT_DB_APIKEY), dbName);
                } else {
                    let dbURL = "http://" + Config.COUCHDB_USER + ":" + Config.COUCHDB_PASSWORD + "@localhost:5984";
                    retVal = new CouchDBWrap(CouchDBWrap.createConnection(dbURL), dbName);
                }
            }
            if (retVal) {
                try {
                    // Make sure the DB exists
                    await retVal.createDatabase(false);
                } catch (err) {}
                // Define the path to the views that need to be loaded in, the views should also ways reside
                // under the views folder just at db/views_{dbName}
                const pathToViews = join(__dirname, `views_${dbName}/`);
                if (existsSync(pathToViews)) {
                    // INITIALIZE VIEWS from the views directory for all view files that need to be loaded into the
                    // DB
                    let files = readdirSync(pathToViews).filter(function(file) {
                        // Filter on only files
                        return statSync(pathToViews + join(file)).isFile();
                    });
                    let updateViews = [];
                    for (const file of files) {
                        // Load the view file into a javascript object
                        const view = require(pathToViews + join(file));

                        // Remove the file extension from the file name
                        const viewName = file.substring(0, file.lastIndexOf("."));
                        view._id = `_design/${viewName}`;
                        try {
                            // Fetch the design doc which has the same name, to either create or update this design doc.
                            let oldView = await retVal.getById<any>(view._id);
                            if (oldView) {
                                view._rev = oldView._rev;
                            }
                        } catch (err) {}
                        updateViews.push(view);
                    }
                    if (updateViews.length > 0) {
                        try {
                            await retVal.updateDocs(updateViews);
                        } catch (err) {
                            console.error("Error updating view docs!");
                            console.error(JSON.stringify(updateViews, null, 2))
                            throw err;
                        }
                    }
                }
            }
            resolve(retVal);
        })
    }
}
