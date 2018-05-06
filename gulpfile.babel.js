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
import inlineCss from "gulp-inline-css";
import minifyCSS from "gulp-clean-css";
import noop from "gulp-noop";
import nunjucksRender from "gulp-nunjucks-render";
import preprocess from "gulp-preprocess";
import prettify from "gulp-jsbeautifier";
import rename from "gulp-rename";
import replace from "gulp-replace";
import sass from "gulp-sass";
import size from "gulp-size";
import uglify from "gulp-uglify";
import util from "gulp-util";

const PKG = require("./package.json");

// Where the CDN assets live per environment
const cdnHosts = {
  development: "http://localhost:9000",
  production: "https://cdn.hotdoc.com.au"
};

// Where the Bookings app lives per environment
// Note: the CDN pages are for QA only and should never hit production
const bookingsHosts = {
  development: "http://localhost:4200",
  production: "https://staging-internal.hotdoc.com.au"
};

// Build specifics
const environment = util.env.env || "development";
const isProduction = environment === "production";
const buildVersion = PKG.version;
const cdnHost = cdnHosts[environment] || "";
const bookingHost = bookingsHosts[environment] || "";
const assetsURL = `${cdnHost}/static/assets`;
const clinicPageUrl = `${bookingHost}/medical-centres/carlton-VIC-3053/bookings-demo-medical/doctors`;
const doctorPageUrl1 = `${bookingHost}/medical-centres/carlton-VIC-3053/bookings-demo-medical/doctors/dr-all-reasons`;
const doctorPageUrl2 = `${bookingHost}/medical-centres/carlton-VIC-3053/bookings-demo-medical/doctors/dr-standard-consults-only`;

// The build aware config passed down all HTML and JS files
const config = {
  isProduction,
  environment,
  buildVersion,
  assetsURL,
  clinicPageUrl,
  doctorPageUrl1,
  doctorPageUrl2
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
    .pipe(gulp.dest("dist/static/"))
    .pipe(connect.reload());
});

// Copy the outdatedbrowser JS
gulp.task("copyOutdatedBrowserJs", () => {
  return gulp
    .src(
      "bower_components/outdated-browser/outdatedbrowser/outdatedbrowser.min.js"
    )
    .pipe(gulp.dest("dist/static/assets/js/"));
});

// Copy the outdatedbrowser CSS
gulp.task("copyOutdatedBrowserCss", () => {
  return gulp
    .src(
      "bower_components/outdated-browser/outdatedbrowser/outdatedbrowser.min.css"
    )
    .pipe(gulp.dest("dist/static/assets/css/"));
});

// Compile all HTML
gulp.task("compileHtml", () => {
  return gulp
    .src("src/templates/pages/**/*.+(html|nunjucks)")
    .pipe(
      nunjucksRender({
        path: ["src/templates"],
        data: { config }
      })
    )
    .pipe(prettify({ config: "./jsbeautifyrc.json" }))
    .pipe(gulp.dest("dist/static/"))
    .pipe(connect.reload());
});

// Compile all CSS
gulp.task("compileCss", () => {
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
        basename: PKG.name,
        extname: ".min.css"
      })
    )
    .pipe(gulp.dest("dist/static/assets/css"))
    .pipe(connect.reload());
});

// Inline the CSS into the HTML, needed for emails, error pages and signatures
gulp.task("inlineCss", () => {
  return gulp
    .src(["dist/static/errors/*.html"])
    .pipe(inlineCss())
    .pipe(gulp.dest("dist/static/errors/"));
});

// Lint app JS, warn about bad JS, break on errors
gulp.task("lintJs", () => {
  return gulp
    .src(["src/js/**/*.js"])
    .pipe(eslint())
    .pipe(eslint.format());
});

// Compile all JS
gulp.task("compileProjectJs", () => {
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
    .src(["src/js/*.js"])
    .pipe(preprocess({ context }))
    .pipe(babel())
    .pipe(isProduction ? uglify({ preserveComments: "license" }) : noop())
    .pipe(header(legalBanner))
    .pipe(
      rename({
        basename: PKG.name,
        extname: ".min.js"
      })
    )
    .pipe(gulp.dest("dist/static/assets/js"));
});

// Add vendor files to hotdoc-lightbox.min.js
gulp.task("includeVendors1", () => {
  return gulp
    .src([
      "bower_components/jquery/dist/jquery.min.js",
      "dist/static/assets/js/hotdoc-widget.min.js"
    ])
    .pipe(concat("hotdoc-widget.min.js"), { newLine: "\n\n\n\n" })
    .pipe(replace(/^\s*\r?\n/gm, ""))
    .pipe(gulp.dest("dist/static/assets/js"));
});

// Add vendor files to hotdoc-lightbox.min.js
gulp.task("includeVendors2", () => {
  return gulp
    .src([
      "bower_components/jquery/dist/jquery.min.js",
      "bower_components/velocity/velocity.min.js",
      "dist/static/assets/js/hotdoc-lightbox.min.js"
    ])
    .pipe(concat("hotdoc-lightbox.min.js"), { newLine: "\n\n\n\n" })
    .pipe(replace(/^\s*\r?\n/gm, ""))
    .pipe(gulp.dest("dist/static/assets/js"));
});

// Live reload JS files in browser
gulp.task("reloadJs", () => {
  return gulp.src(["dist/static/assets/js/**/*.js"]).pipe(connect.reload());
});

// Build all JS files
gulp.task(
  "compileJs",
  gulp.series(
    "compileProjectJs",
    gulp.parallel("includeVendors1", "includeVendors2"),
    "reloadJs"
  )
);

// Watch all files and run tasks when files change
gulp.task("watch", () => {
  gulp.watch(["src/public/**/*"], gulp.parallel("copyPublic"));
  gulp.watch(
    ["src/templates/**/*.+(html|nunjucks|json)"],
    gulp.parallel("compileHtml")
  );
  gulp.watch(["src/styles/**/*.scss"], gulp.parallel("compileCss"));
  gulp.watch(
    ["src/js/**/*.js", ".babelrc", ".eslintrc"],
    gulp.parallel("compileJs")
  );
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
      "!dist/static/assets/favicons/**",
      "!dist/static/assets/fonts/**",
      "!dist/static/assets/img/**"
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
      "compileHtml",
      "compileCss",
      "compileJs",
      "copyPublic",
      "copyOutdatedBrowserJs",
      "copyOutdatedBrowserCss"
    ),
    gulp.parallel(
      // 'inlineCss', // keeps failing if no internet to pick up web fonts
      "deleteTemp",
      "report"
    )
  )
);

// Default gulp command
gulp.task("default", gulp.series("build", gulp.parallel("watch", "serve")));
