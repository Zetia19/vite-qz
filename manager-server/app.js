const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const log4js = require('./utils/log4j')

const users = require('./routes/users')
const router = require('koa-router')()

// error handler
onerror(app)

// 引入数据库
require('./config/db')

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public',
  {maxage:60000}))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
// ctx是Context的实例，它封装了请求和响应的所有信息
app.use(async (ctx, next) => {
  log4js.info(`get params:${JSON.stringify(ctx.request.query)}`)
  log4js.info(`post params:${JSON.stringify(ctx.request.body)}`)
  await next()
})

// routes
router.prefix('/api')  // 路由添加前缀
router.use(users.routes(), users.allowedMethods())
app.use(router.routes(), router.allowedMethods())



// error-handling
app.on('error', (err, ctx) => {
  log4js.error(err)
});

module.exports = app
