
/*
安装：npm install --save-dev gulp-sass
功能：把 sass 编译为 css
功能：压缩（minify） css 文件（这里只是压缩，但后面还需要用别的插件来重命名为 xxx.min.css 的形式）
安装：npm install --save-dev gulp-clean-css
功能：压缩（optimize）js 文件（这里只是压缩，但后面还需要用别的插件来重命名为 xxx.min.js 的形式）
安装：npm install --save-dev gulp-uglify
功能：压缩图片
安装：npm install --save-dev gulp-imagemin
browser-sync
功能：自动刷新
 gulp-clean
功能：删除文件和文件夹
安装：npm install --save-dev gulp-clean
*/


const { src, dest, parallel, series, watch } = require('gulp')
const del = require('del')
const browserSync = require('browser-sync') //实现浏览器的更新
const loadPlugins = require('gulp-load-plugins')
const plugins = loadPlugins()
const bs = browserSync.create()
let config = {  //文件的配置项
  build: {
    src: 'src',
    dist: 'dist',
    temp: 'temp',
    paths: {
      styles: 'assets/styles/*.scss',
      scripts: 'assets/scripts/*.js',
      pages: '*.html',
      images: 'assets/images/**',
      fonts: 'assets/fonts/**'
    }
  }
}
//清除操作
const clean = () => {
  return del([config.build.dist, config.build.temp])
}
//样式构建
const style = () => {
  return src(config.build.paths.styles, { base: config.build.src, cwd: config.build.src })  //保留基本路径 base:'src'
    .pipe(plugins.sass({ outputStyle: 'expanded' }))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }))
}
//js文件自动化
const script = () => {
  return src(config.build.paths.scripts, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.babel({ presets: [require('@babel/preset-env')] }))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }))
}
//页面构建
const page = () => {
  return src(config.build.paths.pages, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.swig({ data, defaults: { cache: false } }))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }))
}
//图片构建
const image = () => {
  return src(config.build.paths.images, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist))
}
//字体构建
const font = () => {
  return src(config.build.paths.fonts, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist))
}
//其余文件的构建
const extra = () => {
  return src('**', { base: config.build.public, cwd: config.build.public })
    .pipe(dest(config.build.dist))
}
//启动服务
const serve = () => {
  watch(config.build.paths.styles, { cwd: config.build.src }, style)
  watch(config.build.paths.scripts, { cwd: config.build.src }, script)
  watch(config.build.paths.pages, { cwd: config.build.src }, page)
  watch([
    config.build.paths.images,
    config.build.paths.fonts,
  ], { cwd: config.build.src }, bs.reload)
  watch('**', { cwd: config.public }, bs.reload)  //热更新 文件发生改变时进行更新页面
  bs.init({  //初始化
    // notify: false,
    // port: 2000,
    server: {
      baseDir: [config.build.temp, config.build.dist, config.build.public], //网站的根目录
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  })
}
//进行资源的合并操作
const useref = () => {
  return src(config.build.paths.pages, { base: config.build.temp, cwd: config.build.temp })
    .pipe(plugins.useref({ searchPath: [config.build.temp, '.'] }))
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({
      collapsewhitespace: true,
      minifyCss: true,
      minifyJS: true
    })))
    .pipe(dest(config.build.dist))  //管道Stream
}
const compile = parallel(style, script, page)
const build = series(
  clean,
  parallel(
    series(compile, useref),
    extra,
    image,
    font
  )
)
//上线之前执行的任务
const develop = series(compile, serve)
module.exports = {
  clean,
  develop,
  build,
}