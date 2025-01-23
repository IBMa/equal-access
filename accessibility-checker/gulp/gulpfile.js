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

const gulp = require("gulp"),
    ginsert = require("gulp-insert"),
    greplace = require("gulp-replace"),
    terser = require("gulp-terser");

gulp.task("build-uglify", function () {
    return gulp.src(["../src/**/lib/**/*.js", "../src/index.js", "!../src/node_modules/**"])
        .pipe(terser())
        .pipe(greplace('if(void 0===globalThis.ace_ibma)', "if('undefined' === typeof(globalThis.ace_ibma))"))
        .pipe(ginsert.prepend(notice("2016,2017,2018,2019")))
        .pipe(gulp.dest("../package"));

})

gulp.task("build-copy", function () {
    return gulp.src([
<<<<<<< HEAD:accessibility-checker/gulp/gulpfile.mjs
        "../src/bin/achecker.js",
        "../src/mjs/index.d.ts",
=======
        "../src/**/bin/achecker.js",
>>>>>>> parent of b2bedf83 (chore(all): Sync with the master and update libraries (#1960)):accessibility-checker/gulp/gulpfile.js
        "../src/package.json",
        "../src/README.md",
    ])
    .pipe(gulp.dest("../package"));

})

gulp.task("build", gulp.parallel(["build-uglify", "build-copy"]));

gulp.task("default", gulp.parallel(["build"]));
