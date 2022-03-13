const gulp = require("gulp");
const modifyFile = require('gulp-modify-file')

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

const archivePolicies = () => {
    // Adds the policy ids to the archive file
    return gulp.src(["../src/static/archives.json"])
        .pipe(modifyFile((content, path, file) => {
            let archives = JSON.parse(content);
            let latestPol = [];
            let latestRS = {};
            let latestArchive = null;
            for (const archive of archives) {
                if (archive.id !== "latest") {
                    let ace;
                    if (archive.id !== "preview") {
                        ace = require(`../src/static${archive.path}/js/ace-node.js`);
                    } else {
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
                    if (archive.latest) {
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
            }
            return JSON.stringify(archives, null, 2);
        }))
        .pipe(gulp.dest("../dist/static/"));
}

gulp.task("build", gulp.parallel([distFiles, staticFiles, acePreview, aceDocs, archivePolicies]));
