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

function notice(years) {
    return "/******************************************************************************\n" +
        " * Copyright:: 2020- IBM, Inc\n" +
        " * \"Licensed under the Apache License, Version 2.0 (the 'License');\"\n" +
        " * \"you may not use this file except in compliance with the License.\"\n" +
        " * \"You may obtain a copy of the License at\"\n" +

        " * \"http://www.apache.org/licenses/LICENSE-2.0\"\n" +

        " * \"Unless required by applicable law or agreed to in writing, software\"\n" +
        " * \"distributed under the License is distributed on an 'AS IS' BASIS,\"\n" +
        " * \"WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\"\n" +
        " * \"See the License for the specific language governing permissions and\"\n" +
        " * \"limitations under the License.\"\n" +
        " *****************************************************************************/\n";
}

import gulp from "gulp";
import ginsert from "gulp-insert";
// import greplace from "gulp-replace";
import terser from "gulp-terser";
import merge from "merge-stream";

gulp.task("build-uglify", function () {
    return gulp.src(["../src/**/lib/**/*.js", "../src/*/index.js", "!../src/node_modules/**"])
        .pipe(terser({compress:{typeofs: false}}))
        // .pipe(greplace('if(void 0===globalThis.ace_ibma)', "if('undefined' === typeof(globalThis.ace_ibma))"))
        // .pipe(greplace('void 0===ace', "'undefined'===typeof ace"))
        // .pipe(greplace('void 0!==ace', "'undefined'!==typeof ace"))
        .pipe(ginsert.prepend(notice("2016,2017,2018,2019")))
        .pipe(gulp.dest("../package"));

})

gulp.task("build-copy", function () {
    return merge([
        gulp.src([
            "../src/bin/achecker.js",
            "../src/mjs/index.d.ts",
            "../src/package.json",
            "../src/README.md",
        ]).pipe(gulp.dest("../package")),

        gulp.src([
            "../src/mjs/package.json",
        ]).pipe(gulp.dest("../package/mjs")),

        gulp.src([
            "../src/cjs/package.json",
        ]).pipe(gulp.dest("../package/cjs")),

        gulp.src([
            "../src/bin/achecker.js"
        ]).pipe(gulp.dest("../package/bin")),

    ]);

})

gulp.task("build", gulp.parallel(["build-uglify", "build-copy"]));

gulp.task("default", gulp.parallel(["build"]));
