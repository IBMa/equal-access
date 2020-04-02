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

 const fs = require("fs");
const request = require("request");
const assert = require("assert");

const TRAVIS_JOB_NUMBER = process.env.TRAVIS_JOB_NUMBER;
const TRAVIS_BUILD_ID = process.env.TRAVIS_BUILD_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const POLLING_INTERVAL = parseInt(process.env.POLLING_INTERVAL || "10000");

const ARGS = process.argv.slice(2);
const TRAVIS_ENDPOINT = ARGS.length > 0 ? ARGS[0] : "https://api.travis-ci.org";

assert(TRAVIS_JOB_NUMBER, 'TRAVIS_JOB_NUMBER is not set');
assert(TRAVIS_BUILD_ID, 'TRAVIS_BUILD_ID is not set');
assert(GITHUB_TOKEN, 'GITHUB_TOKEN is not set');
assert(TRAVIS_ENDPOINT, 'TRAVIS_ENDPOINT is not set');

function is_leader(job_number) {
    return job_number.endsWith(".1");
}

if (typeof TRAVIS_JOB_NUMBER === "undefined") {
    console.error("Don't use defining leader for build without matrix");
    process.exit(1);
} else if (is_leader(TRAVIS_JOB_NUMBER)) {
    console.log("This is a leader");
} else {
    fs.writeFileSync(".to_export_back", "BUILD_MINION=YES");
    console.log("This is a minion");
    process.exit(0);
}

class MatrixElement {
    constructor(json_raw) {
        this.is_finished = !!json_raw.finished_at;
        this.is_succeeded = json_raw.state === "passed";
        this.number = json_raw.number;
        this.is_leader = is_leader(this.number);
    }

    toString() {
        return `${this.number}`;
    }
}

async function matrix_snapshot(travis_token) {
    const url = `${TRAVIS_ENDPOINT}/builds/${TRAVIS_BUILD_ID}`;
    const headers = {
        "Content-Type": "application/json",
        "User-Agent": "Travis/1.0",
        "Accept": "application/vnd.travis-ci.2.1+json",
        "Authorization": `token ${travis_token}`
    }
    let raw_json = await new Promise((resolve, reject) => {
        request.get(url, {
            "headers": headers
        }, (err, res, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
    if (!raw_json.jobs) {
        console.error(url);
        console.error(raw_json);
        return Promise.reject("Unexpected error");
    }
    return raw_json.jobs.map((job) => new MatrixElement(job)).filter((job) => !is_leader(job.number));
}


async function wait_others_to_finish(travis_token) {
    let others_finished = async function() {
        let snapshot = await matrix_snapshot(travis_token);
        let jobs_not_finished = snapshot.filter((job) => !job.is_finished && !job.is_leader);
        return {
            "finished": jobs_not_finished.length === 0,
            "waiting_list": jobs_not_finished
        }
    }

    let result = await others_finished();
    if (result.finished) {
        return;
    } else {
        console.log(`Leader waits for minions ${result.waiting_list}...`);
        await new Promise((resolve, reject) => {
            setTimeout(resolve, POLLING_INTERVAL);
        })
        return await wait_others_to_finish(travis_token);
    }
}

async function get_token() {
    return new Promise((resolve, reject) => {
        request.post(`${TRAVIS_ENDPOINT}/auth/github`, {
            "headers": {
                "Content-type": "application/json", 
                "User-Agent": "Travis/1.0",
                "Accept": "application/vnd.travis-ci.2.1+json"
            },
            "json": {"github_token": GITHUB_TOKEN }
        }, (err, res, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.access_token);
            }
        });
    });
}

async function run() {
    try {
        let token = await get_token();
        await wait_others_to_finish(token)

        let final_snapshot = await matrix_snapshot(token)
        console.log(`Final Results: ${final_snapshot.map((e) => [e.number, e.is_succeeded])}`);

        let others_snapshot = final_snapshot.filter((el) => !el.is_leader);
        let result = "others_failed"
        if (others_snapshot.filter((el) => !el.is_succeeded).length === 0) {
            result="others_succeeded";
        }
        console.log(`Result: ${result}`);
        fs.writeFileSync(".to_export_back", `BUILD_LEADER=YES BUILD_AGGREGATE_STATUS=${result}`);
    } catch (e) {
        console.error(e);
    }
}
run();