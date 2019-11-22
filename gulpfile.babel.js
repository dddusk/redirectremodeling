import gulp from "gulp";
import cp from "child_process";
import gutil from "gulp-util";
import postcss from "gulp-postcss";
import cssImport from "postcss-import";
import neatgrid from "postcss-neat";
import nestedcss from "postcss-nested";
import colorfunctions from "postcss-colour-functions";
import hdBackgrounds from "postcss-at2x";
import cssvars from "postcss-simple-vars-async";
import cssextend from "postcss-simple-extend";
import styleVariables from "./config/variables";
import BrowserSync from "browser-sync";
import reduce from "gulp-reduce-async";
import rename from "gulp-rename";
import S from "string";
import webpack from "webpack";
import webpackConfig from "./webpack.conf";
import runSequence from "run-sequence";
import imagemin from "gulp-imagemin";
import responsive from "gulp-responsive";
import imgRetina from "gulp-responsive-imgz";
const jpegoptim = require('imagemin-jpegoptim');


const DEST = "./dist/";
const $ = require('gulp-load-plugins')();
const browserSync = BrowserSync.create();
const hugoBin = "hugo";
const defaultArgs = ["-d", "../dist", "-s", "site", "-v"];

gulp.task("hugo", (cb) => buildSite(cb));
gulp.task("hugo-preview", (cb) => buildSite(cb, ["--buildDrafts", "--buildFuture"]));


gulp.task("build", function(callback) {
  runSequence(["css", "js", "fonts", "src-root", "images", "hugo"], "optimize");
});
gulp.task("build-preview", function(callback) {
  runSequence(["css", "js", "fonts", "src-root", "images", "hugo-preview"]);
});

gulp.task("css", () => (
  gulp.src("./src/css/*.css")
    .pipe(postcss([
      cssImport({from: "./src/css/main.css"}),
      neatgrid(),
      nestedcss(),
      hdBackgrounds(),
      cssextend(),
      cssvars({variables: styleVariables}),
      colorfunctions()]))
    .pipe(gulp.dest("./dist/css"))
    .pipe(browserSync.stream())
));

gulp.task("js", (cb) => {
  const myConfig = Object.assign({}, webpackConfig);

  webpack(myConfig, (err, stats) => {
    if (err) throw new gutil.PluginError("webpack", err);
    gutil.log("[webpack]", stats.toString({
      colors: true,
      progress: true
    }));
    browserSync.reload();
    cb();
  });

  gulp.src(["./src/js/**/*", "!./src/js/app.js"])
    .pipe(gulp.dest("./dist/js"))
    .pipe(browserSync.stream())
});

gulp.task("fonts", () => (
  gulp.src("./src/fonts/**/*")
    .pipe(gulp.dest("./dist/fonts"))
    .pipe(browserSync.stream())
));

gulp.task("src-root", () => (
  gulp.src("./src/*")
    .pipe(gulp.dest("./dist"))
    .pipe(browserSync.stream())
));

gulp.task("images", () => (
  gulp.src("./src/img/**/*")
    .pipe(gulp.dest("./dist/img"))
    .pipe(browserSync.stream())
));

gulp.task("optimize", () => (
  // resize and compress images
   gulp.src(["dist/img/**/*.{jpg,jpeg,png}", "!dist/img/favicon/**/*.{jpg,png}"])
    .pipe($.responsive({
      '**/*.jpg': [{
        width: 1170,
      }, {
        width: 1170 * 2,
        rename: { suffix: '@2x' }
      }, {
        width: 1170 * 3,
        rename: { suffix: '@3x' }
      }],
      '**/*.jpeg': [{
        width: 1170,
      }, {
        width: 1170 * 2,
        rename: { suffix: '@2x' }
      }, {
        width: 1170 * 3,
        rename: { suffix: '@3x' }
      }],
      '**/*.png': [{
        width: 1170,
      }, {
        width: 1170 * 2,
        rename: { suffix: '@2x' }
      }, {
        width: 1170 * 3,
        rename: { suffix: '@3x' }
      }],
    }, {
      withMetadata: true,
      withoutEnlargement: true,
      skipOnEnlargement: false,
      errorOnEnlargement: false
    }))
    .pipe(imagemin([
      jpegoptim({
        stripAll: false,
        stripExif: false,
        progresseive: true
      })
    ]))
    .pipe(gulp.dest(DEST+"img")),

  gulp.src(["dist/img/**/*.svg", "dist/img/**/*.gif"])
    .pipe(imagemin([
      imagemin.gifsicle({
        interlaced: true,
        optimizationLevel: 3
      }),
      imagemin.svgo({plugins: [{
        removeViewBox: true
      }]})
    ]))
    .pipe(gulp.dest(DEST+"img")),

  gulp.src(["dist/img/favicon/**/*"])
    .pipe(gulp.dest(DEST+"img/favicon")),

  // add srcset to images
  gulp.src("dist/**/*.html")
    .pipe(imgRetina())
    .pipe(gulp.dest(DEST))
));

gulp.task("server", ["hugo", "css", "js", "fonts", "src-root", "images"], () => {
  browserSync.init({
    server: {
      baseDir: "./dist"
    },
    notify: false
  });
  gulp.watch("./src/js/**/*.js", ["js"]);
  gulp.watch("./src/css/**/*.css", ["css"]);
  gulp.watch("./src/img/**/*", ["images"]);
  gulp.watch("./src/fonts/**/*", ["fonts"]);
  gulp.watch("./src/*", ["src-root"]);
  gulp.watch("./site/**/*", ["hugo"]);
});

function buildSite(cb, options) {
  const args = options ? defaultArgs.concat(options) : defaultArgs;

  return cp.spawn(hugoBin, args, {stdio: "inherit"}).on("close", (code) => {
    if (code === 0) {
      browserSync.reload();
      cb();
    } else {
      browserSync.notify("Hugo build failed :(");
      cb("Hugo build failed");
    }
  });
}
