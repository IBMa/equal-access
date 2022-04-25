const gulp = require('gulp');
const inlinesource = require('gulp-inline-source');
const replace = require('gulp-replace');

gulp.task('default', () => {
  return gulp
    .src('./build/*.html')
    .pipe(replace(/(<script.*<\/script>)(.*)<\/body>/, "$2$1</body>"))

    .pipe(replace('.js"></script>', '.js" inline></script>'))
    .pipe(replace('rel="stylesheet">', 'rel="stylesheet" inline>'))
    .pipe(
      inlinesource({
        compress: false,
        ignore: ['png'],
      })
    )
    .pipe(gulp.dest('./build'));
});

// <script defer="defer" src="/static/js/main.811f72b8.js"></script>