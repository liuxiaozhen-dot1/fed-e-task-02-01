// Node CLI 应用入口文件

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer'); // 命令行交互插件
const ejs = require('ejs'); // 模板引擎

inquirer.prompt([
  {
    type: 'input',
    name: 'name',
    message: 'Project name',
    default: 'project'
  },
  {
    type: 'input',
    name: 'desc',
    message: 'Project description?'
  }
])
  .then(response => {
    const tmplDir = path.join(__dirname, 'templates');
    const destDir = process.cwd();

    // 将模板下的文件全部转换到目标目录
    fs.readdir(tmplDir, (err, files) => {
      if (err) throw err;
      files.forEach(file => {
        // file => 文件相对于 templates 目录的相对路径
        // 通过模板引擎渲染文件
        ejs.renderFile(path.join(tmplDir, file), response, (err, result) => {
          if (err) throw err;

          // 将结果写入目标文件
          fs.writeFileSync(path.join(destDir, file), result);
        });
      });
    })
  });