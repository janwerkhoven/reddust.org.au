"use strict";

// Gulp packages
import autoprefixer from "gulp-autoprefixer";
import babel from "gulp-babel";
import concat from "gulp-concat";
import connect from "gulp-connect";
import del from "del";
import eslint from "gulp-eslint";
import gitrev from "git-rev-sync";
import gulp from "gulp";
import header from "gulp-header";
// import inlineCss from "gulp-inline-css";
import minifyCSS from "gulp-clean-css";
import noop from "gulp-noop";
import nunjucksRender from "gulp-nunjucks-render";
import preprocess from "gulp-preprocess";
import prettify from "gulp-jsbeautifier";
import rename from "gulp-rename";
import replace from "gulp-replace";
import sass from "gulp-sass";
import sitemap from "gulp-sitemap";
import size from "gulp-size";
import uglify from "gulp-uglify";
import util from "gulp-util";

const PKG = require("./package.json");

const environment = util.env.env || "development";
const isProduction = environment === "production";
const buildVersion = PKG.version;

const people = require("./src/templates/data/people.json");
const partners = require("./src/templates/data/partners.json");
const musicVideosTop = require("./src/templates/data/music-videos-top.json");
const musicVideosBottom = require("./src/templates/data/music-videos-bottom.json");

// The build aware config passed down all HTML and JS files
const config = {
  humanName: "Red Dust",
  name: PKG.name,
  homepage: PKG.homepage,
  isProduction,
  environment,
  buildVersion
};

// Delete the dist folder
gulp.task("deleteDist", () => {
  return del(["dist"]);
});

// Delete the temp folder
gulp.task("deleteTemp", () => {
  return del(["temp"]);
});

// Copy over all files from public folder "as they are" to the dist folder
gulp.task("copyPublic", () => {
  return gulp
    .src("src/public/**/*")
    .pipe(gulp.dest("dist/"))
    .pipe(connect.reload());
});

// Copy the outdatedbrowser JS
gulp.task("copyOutdatedBrowserJs", () => {
  return gulp
    .src(
      "bower_components/outdated-browser/outdatedbrowser/outdatedbrowser.min.js"
    )
    .pipe(gulp.dest("dist/assets/js/"));
});

// Copy the outdatedbrowser CSS
gulp.task("copyOutdatedBrowserCss", () => {
  return gulp
    .src(
      "bower_components/outdated-browser/outdatedbrowser/outdatedbrowser.min.css"
    )
    .pipe(gulp.dest("dist/assets/css/"));
});

// Compile all HTML
gulp.task("html", function() {
  return gulp
    .src("src/templates/pages/**/*.+(html|njk)")
    .pipe(
      nunjucksRender({
        path: ["src/templates"],
        data: { config, people, partners, musicVideosTop, musicVideosBottom }
      })
    )
    .pipe(prettify({ config: "./jsbeautifyrc.json" }))
    .pipe(gulp.dest("dist"))
    .pipe(
      sitemap({
        siteUrl: config.homepage,
        changefreq: "monthly",
        priority: 0.5
      })
    )
    .pipe(gulp.dest("dist"))
    .pipe(connect.reload());
});

// Compile all CSS
gulp.task("css", () => {
  return gulp
    .src("src/styles/**/*.scss")
    .pipe(
      sass({
        outputStyle: "expanded",
        includePaths: require("node-normalize-scss").includePaths
      }).on("error", sass.logError)
    )
    .pipe(
      autoprefixer({
        browsers: [
          "> 1% in AU",
          "Explorer > 9",
          "Firefox >= 17",
          "Chrome >= 10",
          "Safari >= 6",
          "iOS >= 6"
        ],
        cascade: false
      })
    )
    .pipe(minifyCSS({ keepSpecialComments: "none" }))
    .pipe(
      rename({
        basename: config.name,
        extname: ".min.css"
      })
    )
    .pipe(gulp.dest("dist/assets/css"))
    .pipe(connect.reload());
});

// Lint all JS files, warn about bad JS, break on errors
// gulp.task("lintJs", () => {
//   return gulp
//     .src(["src/app.js"])
//     .pipe(eslint())
//     .pipe(eslint.format());
// });

// Compile all JS
gulp.task("appJs", () => {
  const buildDate = new Date().toUTCString();
  const buildHash = gitrev.long();
  const legalBanner = [
    "/**",
    `* Red Dust v${buildVersion}`,
    "* https://www.hotdoc.com.au/",
    "* Copyright Red Dust Role Models Limited, Australia",
    `* Build date: ${buildDate}`,
    `* Build hash: ${buildHash}`,
    " */",
    ""
  ].join("\n");
  const context = config;
  return gulp
    .src([`src/js/app.js`])
    .pipe(preprocess({ context }))
    .pipe(babel())
    .pipe(isProduction ? uglify({ preserveComments: "license" }) : noop())
    .pipe(header(legalBanner))
    .pipe(
      rename({
        extname: ".min.js"
      })
    )
    .pipe(gulp.dest("temp/js/"));
});

gulp.task("vendorJs", () => {
  return gulp
    .src([
      "bower_components/jquery/dist/jquery.min.js",
      "bower_components/velocity/velocity.min.js",
      "bower_components/countUp.js/dist/countUp.min.js",
      "temp/js/app.min.js"
    ])
    .pipe(concat(`${config.name}.min.js`), { newLine: "\n\n\n\n" })
    .pipe(replace(/^\s*\r?\n/gm, ""))
    .pipe(gulp.dest("dist/assets/js"));
});

// Live reload JS files in browser
gulp.task("reloadJs", () => {
  return gulp.src(["dist/assets/js/**/*.js"]).pipe(connect.reload());
});

// Build all JS files
gulp.task("js", gulp.series("appJs", "vendorJs", "reloadJs"));

// Watch all files and run tasks when files change
gulp.task("watch", () => {
  gulp.watch(["src/public/**/*"], gulp.parallel("copyPublic"));
  gulp.watch(["src/templates/**/*.+(html|njk|json)"], gulp.parallel("html"));
  gulp.watch(["src/styles/**/*.scss"], gulp.parallel("css"));
  gulp.watch(["src/js/**/*.js", ".babelrc", ".eslintrc"], gulp.parallel("js"));
  gulp.watch(
    ["gulpfile.babel.js", "package.json", "bower.json"],
    gulp.series(["build"])
  );
});

// Run a local server on http://localhost:9000
gulp.task("serve", () => {
  connect.server({
    root: "dist",
    livereload: true,
    port: 9000
  });
});

// Report all file sizes
gulp.task("report", () => {
  return gulp
    .src([
      "dist/**/*",
      "!dist/assets/favicons/**",
      "!dist/assets/fonts/**",
      "!dist/assets/img/**"
    ])
    .pipe(
      size({
        showFiles: true,
        showTotal: false
      })
    );
});

// Build the entire dist folder
gulp.task(
  "build",
  gulp.series(
    "deleteDist",
    gulp.parallel(
      "html",
      "css",
      "js",
      "copyPublic",
      "copyOutdatedBrowserJs",
      "copyOutdatedBrowserCss"
    ),
    gulp.parallel("deleteTemp", "report")
  )
);

// Default gulp command
gulp.task("default", gulp.series("build", gulp.parallel("watch", "serve")));
