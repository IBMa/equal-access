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
    return gulp.src(["../src/static/**/archives/**", "../src/static/index.html", "../src-gatsby/public/**"])
        .pipe(gulp.dest("../dist/static/"));
}

const acePreview = () => {
    return gulp.src(["../../accessibility-checker-engine/dist/**"])
        .pipe(gulp.dest("../dist/static/archives/preview/js/"))
}

const aceDocs = () => {
    return gulp.src(["../../accessibility-checker-engine/help/**"])
        .pipe(gulp.dest("../dist/static/archives/preview/doc/"))
}

const archivePolicies = () => {
    // Adds the policy ids to the archive file
    return gulp.src(["../src/static/archives.json"])
        .pipe(modifyFile((content, path, file) => {
            let archives = JSON.parse(content);
            let latestPol = [];
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
                    try {
                        let checker = new ace.Checker();
                        for (const rs of checker.rulesets) {
                            policies.push({
                                id: rs.id,
                                name: rs.name,
                                description: rs.description
                            });
                        }
                        policies.sort((a,b) => a.id.localeCompare(b.id));
                    } catch (e) {}
                    archive.policies = policies;
                    if (archive.latest) {
                        latestPol = policies;
                    }
                } else {
                    latestArchive = archive;
                }
            }
            if (latestArchive) {
                latestArchive.policies = latestPol;
            }
            return JSON.stringify(archives, null, 2);
        }))
        .pipe(gulp.dest("../dist/static/"));
}

gulp.task("build", gulp.parallel([distFiles, staticFiles, acePreview, aceDocs, archivePolicies]));
