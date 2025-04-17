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

import { Query, Controller, Get, Route, Response } from 'tsoa';
import { ApiError } from './apiError';
import * as crypto from 'crypto';
import { eDB, getDB } from "../util/db"


@Route('/meter')
export class MeterController extends Controller {
    static dbConn = getDB(eDB.AAT);
    @Get('v2')
    @Response<ApiError>('500', 'Internal Server Error')
    public async v2(
        @Query("t") tool?: string,
        @Query("tag") tag?: string,
        @Query("a") accountId?: string,
        @Query("pol") policyStr?: string,
        @Query("st") scanTimes?: string
    ) 
    {
        new Promise<void>(async (resolve, _reject) => {
            try {
                let tags = tag ? tag.split(",") : null;
                let policies = policyStr.split(",");
                let times = scanTimes.split(",");
                let data = {
                    "_id": crypto.randomUUID(),
                    "ibmaClass": "METER",
                    "timestamp": new Date().getTime(),
                    "version": "2.0",
                    "tool": tool,
                    "tags": tags,
                    "accountId": accountId,
                    "policies": policies,
                    "metrics": []
                }
                for (let i = 0; i < times.length; ++i) {
                    data.metrics.push({
                        "time": times[i],
                        "result": "OK"
                    });
                }
                await (await MeterController.dbConn).updateDocs([data]);        
            } catch (err) {
                console.error(err);
            }
            resolve();
        });
        return { ok: true };
    }

    @Get('legacy')
    public async legacy(
        @Query("s") tool?: string,
        @Query("p") profile?: string,
        @Query("st") scanTimes?: string,
        @Query("res") resultStr?: string
    ) {
        new Promise<void>(async (resolve, _reject) => {
            try {
                var res = resultStr.split(",");
                var times = scanTimes.split(",");
                var data = {
                    "_id": crypto.randomUUID(),
                    "ibmaClass": "METER",
                    "timestamp": new Date().getTime(),
                    "version": "1.0",
                    "tool": tool,
                    "profile": profile,
                    "metrics": []
                }
                for (var i = 0; i < res.length; ++i) {
                    data.metrics.push({
                        "time": times[i],
                        "result": res[i]
                    });
                }
                await (await MeterController.dbConn).updateDocs([data]);        
            } catch (err) {
                console.error(err);
            }
            resolve();
        });
        return { ok: true };
    }
}