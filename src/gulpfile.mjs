'use strict'

import gulp, {src, dest, series } from 'gulp';
import cleanCSS from 'gulp-clean-css';
// import uglify from 'gulp-uglify';
import concat from 'gulp-concat';
// import replace from 'gulp-replace';
import injectString from 'gulp-inject-string';
import rename from 'gulp-rename';
import gulpRemoveHtml from 'gulp-remove-html';
import fs from 'fs';

const config = {
  destDir: '../../dest_formularz_fronty_proste',
  cssFiles: ['./styles/normalize.css', './styles/styles.css'],
  jsFiles: './scripts/index.js',
  destCSS: '../../dest_formularz_fronty_proste/css',
  destJS: '../../dest_formularz_fronty_proste/js',
  replace: {
    from: /assets/g,
    to: 'https://www.fronty-meblowe.pl/formularz/wp-content/uploads/2024/11'
  },
  inject: {
    css: '<!-- inject:styles -->',
    js: '<!-- inject:scripts -->'
  }
}

gulp.task('styles', () => {
  return src(config.cssFiles)
    .pipe(concat('styles.css'))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(config.destCSS));
});

gulp.task('scripts', () => {
  return src(config.jsFiles)
    .pipe(concat('scripts.js'))
    // .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(config.destJS));
});

gulp.task('inject-inline-css-js-remove-start-end', () => {
  const cssContent = fs.readFileSync(`${config.destCSS}/styles.min.css`, 'utf8');
  const jsContent = fs.readFileSync(`${config.destJS}/scripts.min.js`, 'utf8');
  return src('./fronty_proste.html')
    // .pipe(replace(config.replace.from, config.replace.to)) // paths to images
    .pipe(injectString.replace(config.inject.css, `<style>${cssContent}</style>`)) // styles inlined
    .pipe(injectString.replace(config.inject.js, `<script>${jsContent}</script>`)) // scripts inlined
    .pipe(gulpRemoveHtml())
    .pipe(dest(config.destDir));
});

gulp.task('default', series(
  'styles',
  'scripts',
  'inject-inline-css-js-remove-start-end',
));