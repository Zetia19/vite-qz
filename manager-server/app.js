const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const log4js = require('./utils/log4j')

const router = require('koa-router')()
const jwt = require('jsonwebtoken')
const koajwt = require('koa-jwt')
const util = require('./utils/util')
const users = require('./routes/users')
const menus = require('./routes/menus')

// error handler
onerror(app)

// 引入数据库
require('./config/db')

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public',
  { maxage: 60000 }))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
// ctx是Context的实例，它封装了请求和响应的所有信息
app.use(async (ctx, next) => {
  log4js.info(`get params:${JSON.stringify(ctx.request.query)}`)
  log4js.info(`post params:${JSON.stringify(ctx.request.body)}`)
  await next().catch((err) => {
    if (err.status == '401') {
      ctx.status = 200;
      ctx.body = util.fail('token认证失败或过期', util.CODE.AUTH_ERROR)
    } else {
      throw err
    }
  })
})

app.use(koajwt({ secret: 'qz' }).unless({
  path: [/^\/api\/users\/login/]  // 排除登录接口
}))

// routes 路由添加前缀
router.prefix('/api')  // 一级路由

// 子路由
router.use(users.routes(), users.allowedMethods())
router.use(menus.routes(), menus.allowedMethods())

// 加载全部路由
app.use(router.routes(), router.allowedMethods())



// error-handling
app.on('error', (err, ctx) => {
  log4js.error(`${err.stack}`)
});

module.exports = app
