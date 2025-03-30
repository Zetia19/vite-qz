"use strict";
import Koa from "koa";
import KoaRouter from "koa-router";
import bodyParser from 'koa-bodyparser';

const app = new Koa();
const router = new KoaRouter();

// 添加body解析中间件
app.use(bodyParser());

app.use(async (ctx, next) => {
  console.log(`Process ${ctx.request.method} ${ctx.request.url} ...`);
  await next();
});

/**路由配置 Start */
router.get("/hello/:name", async (ctx, next) => {
  var name = ctx.params.name;
  ctx.response.body = `<h1>Hello Bad World! Mr/Miss ${name}</h1>`;
});
router.get("/", async (ctx, next) => {
  ctx.response.body = `Hello Node! I Get`;
});
router.post("/hello", async (ctx, next) => {
  ctx.response.body = `Hello Node! I Post`;
});
router.post("/goodbye", async (ctx, next) => {
  ctx.response.body = `Goodbye Node!`;
});
/**路由配置 End */

/**路由加载 */
app.use(router.routes());
app.use(router.allowedMethods()); // 新增方法校验

console.log("服务器已启动：本地地址：http://127.0.0.1:5152");
app.listen(5152);


