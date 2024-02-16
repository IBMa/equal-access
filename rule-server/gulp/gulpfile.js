const gulp = require("gulp");
const modifyFile = require('gulp-modify-file');

const license = 
`/******************************************************************************
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
`;

const distFiles = () => {
    return gulp.src(["../package.json"])
        .pipe(gulp.dest("../dist/"));
}

const staticFiles = () => {
    return gulp.src(["../src/static/**/archives/**", "../src/static/index.html"])
        .pipe(gulp.dest("../dist/static/"));
}

const acePreview = () => {
    return gulp.src(["../../accessibility-checker-engine/dist/*.js", "../../accessibility-checker-engine/dist/*.txt"])
        .pipe(gulp.dest("../dist/static/archives/preview/js/"))
}

const aceDocs = () => {
    return gulp.src(["../../accessibility-checker-engine/dist/help/**"])
        .pipe(gulp.dest("../dist/static/archives/preview/doc/"))
}

function maxVersion(verA, verB) {
    if (!verA) return verB;
    if (!verB) return verA;
    let fieldsA = verA.split(".").map(field => parseInt(field));
    let fieldsB = verB.split(".").map(field => parseInt(field));
    for (let idx = 0; idx < Math.min(fieldsA.length, fieldsB.length); ++idx) {
        if (fieldsA[idx] < fieldsB[idx]) return verB;
        if (fieldsA[idx] > fieldsB[idx]) return verA;
    }
    if (fieldsA.length > fieldsB.length) return verA;
    return verB;
}

const archivePolicies = () => {
    let releaseTag = (process.env.GITHUB_REF || "").substring(10);
    // If the release tag includes a /, then it's probably a PR or other Git action that's not a release
    if (releaseTag.includes("/")) {
        releaseTag = "9999.9999.9999";
    }
    // Adds the policy ids to the archive file
    return gulp.src(["../src/static/archives.json"])
        .pipe(modifyFile((content, path, file) => {
            let archives = JSON.parse(content);
            let latestPol = [];
            let latestRS = {};
            let latestVersion;
            let latestArchive = null;
            let previewArchive = null;
            for (const archive of archives) {
                if (archive.id !== "latest") {
                    let ace;
                    if (archive.id !== "preview") {
                        ace = require(`../src/static${archive.path}/js/ace-node.js`);
                        latestVersion = maxVersion(latestVersion, archive.version);
                    } else {
                        previewArchive = archive;
                        archive.version = releaseTag;
                        ace = require("../../accessibility-checker-engine/dist/ace-node.js");
                    }
                    let policies = [];
                    let rulesets = {};
                    try {
                        let checker = new ace.Checker();
                        for (const rs of checker.rulesets) {
                            let type = rs.type || "default";
                            if (type === "default") {
                                policies.push({
                                    id: rs.id,
                                    name: rs.name,
                                    description: rs.description
                                });
                            }
                            rulesets[type] = rulesets[type] || []
                            rulesets[type].push({
                                id: rs.id,
                                name: rs.name,
                                description: rs.description
                            })
                        }
                    } catch (e) {}
                    archive.policies = policies;
                    archive.rulesets = rulesets;
                    if (latestVersion === archive.version) {
                        latestPol = policies;
                        latestRS = rulesets;
                    }
                } else {
                    latestArchive = archive;
                }
            }
            if (latestArchive) {
                latestArchive.policies = latestPol;
                latestArchive.rulesets = latestRS;
                latestArchive.version = latestVersion;
                latestArchive.latest = true;
            }
            if (latestVersion !== releaseTag) {
                previewArchive.version = releaseTag;
            }
            for (const archive of archives) {
                if (archive.version && archive.version.length > 0) {
                    archive.helpPath = `https://unpkg.com/accessibility-checker-engine@${archive.version}/help/`;
                    archive.enginePath = `https://unpkg.com/accessibility-checker-engine@${archive.version}/`;
                }
            }
            return JSON.stringify(archives, null, 2);
        }))
        .pipe(gulp.dest("../dist/static/"));
}

gulp.task("build", gulp.parallel([distFiles, staticFiles, acePreview, aceDocs, archivePolicies]));
