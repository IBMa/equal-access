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

// Load all the needed modules
var gulp = require('gulp');
var ginsert = require('gulp-insert');

// Pull in the code from src folder into karma-ibma under package
gulp.task("copy-code", function() {
    return gulp.src(["../src/**"])
        .pipe(gulp.dest("../package/karma-accessibility-checker"));
});

gulp.task("package-code", function() {
    return gulp.src("../package/karma-accessibility-checker/**/*.js")
        // .pipe(uglify())
        .pipe(ginsert.prepend(notice("2018,2019,2020")))
        .pipe(gulp.dest("../package/karma-accessibility-checker"));
});

// uglify all scripts for optimazation and performance, then place it into the package folder.
gulp.task("build-package", gulp.series(["copy-code", "package-code"]));

gulp.task("build", gulp.parallel(["build-package"]));
