/**
 * 数据库链接
 * mongoose是一个基于node的mongodb的操作库，可快速操作mongodb数据库
 * 官网地址：https://mongoosejs.com/docs/index.html
 * 安装：npm install mongoose --save
 * */

const mongoose = require('mongoose')
const config = require('./index')
const log4js = require('./../utils/log4j')

main().catch(err => log4js.error('数据库连接失败', err));

async function main() {
  await mongoose.connect(config.URL);
  // await mongoose.connect(config.URL, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  // });
  log4js.info('数据库连接成功')
}