/*
日志存储
*/ 
const log4js = require('log4js') 

const level = {
  'trace': log4js.levels.TRACE,
  'debug': log4js.levels.DEBUG,
  'info': log4js.levels.INFO,
  'warn': log4js.levels.WARN,
  'error': log4js.levels.ERROR,
  'fatal': log4js.levels.FATAL
}

log4js.configure({
  appenders: {
   console: { type: 'console' } , // 控制台输出(上线后可以删除'console')
   info:{
    type:'file',
    filename:'logs/all-logs.log', // 日志文件存放的位置
   },
   error:{
    type:'dateFile', // 日志类型
    //设置文件名称为filename + pattern
    filename:'logs/log', 
    pattern:'yyyy-MM-dd.log', 
    alwaysIncludePattern:true, // 文件名是否始终包含占位符
   }
  }, 
  categories: {
    default: { // 默认日志
        appenders: ['console'], level: 'debug'}, 
    info: { // info日志
        appenders: ['info','console'], level: 'info' },
    error: { // 错误日志
        appenders: ['error','console'], level: 'error' } 
  }
})

/** 
*日志输出，level为debug
*@param {String} content 
*/ 
exports.debug = (content)=>{
    let logger = log4js.getLogger();
    logger.level = level.debug;
    logger.debug(content);
}

/** 
*日志输出，level为info
*@param {String} content 
*/ 
exports.info = (content)=>{
    let logger = log4js.getLogger('info');
    logger.level = level.info;
    logger.info(content);
}

/** 
*日志输出，level为error
*@param {String} content 
*/ 
exports.error = (content)=>{
    let logger = log4js.getLogger('error');
    logger.level = level.error;
    logger.error(content);
}