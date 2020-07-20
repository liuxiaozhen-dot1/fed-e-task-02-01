// 实现这个项目的构建任务
/*
grunt file.js是grunt自动化构建的入口文件

用于定义一些需要Grunt自动执行的任务

需要导出一个函数（接收一个grunt的形参，内部提供一些创建任务时可以用到的API）
 */
/*
grunt-contrib-clean：删除文件。
grunt-contrib-compass：使用compass编译sass文件。
grunt-contrib-concat：合并文件。
grunt-contrib-copy：复制文件。
grunt-contrib-cssmin：压缩以及合并CSS文件。
grunt-contrib-imagemin：图像压缩模块。
grunt-contrib-jshint：检查JavaScript语法。
grunt-contrib-uglify：压缩以及合并JavaScript文件。
grunt-contrib-watch：监视文件变动，做出相应动作。
*/

/*
一个构建过程大概需要以下步骤：

清空dist目录，清空以前的构建代码，使之后编译到该文档夹的文档都是新的

文档复制（copy），由于我们要保留源文档，因此我们把文档复制到指定目录，再进行后续处理

合并js文档(concat)

压缩合并后的js(uglify)

计算压缩后js/css的md5或sha1值，替换原来的引用

实现以上步骤，则需要一系列的grunt任务
*/
const sass = require('sass')
const loadGruntTasks = require('load-grunt-tasks')
module.exports = grunt => {
  grunt.initConfig({
    //配置文件输入路径 输出路径
    sass: {
      options: {
        implementation: sass
      },
      main: {
        files: {
          'dist/css/main.css': 'src/assets/styles/main.scss',
        }
      }
    },
    babel: {
      options: {
        presets: ['@babel/preset-env']
      },
      main: {
        files: {
          'dist/js/main.js': 'src/assets/scripts/main.js'
        }
      }
    },
    htmlmin: {
      options: {
        livereload: true
      },
      main: {
        'dist/js/html': 'src/*.html'
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: {
            'dist/*': 'src/*'
          }
        }]
      }
    },
    imagemin: {
      options: {
        optimizationLevel: 3
      },
      main: {
        files: {
          'dist/image/img': 'src/assets/images/**',
        },
        files: {
          'dist/image/fonts': 'src/assets/fonts/**',
        }
      }
    }
  })
  loadGruntTasks(grunt) //自动加载所有的grunt插件中的任务
  grunt.registerTask('default', ['sass', 'babel', 'imagemin', 'htmlmin'])
}