/**
 * 用户管理模块
 * */ 
const router = require('koa-router')()
router.prefix('/users')  //二级路由
const User = require('../models/userSchema')
const util = require('../utils/util')

router.post('/login',async (ctx)=>{
  try{
    const {userName,userPwd} = ctx.request.body;
    const res = await User.findOne({
      userName,
      userPwd
    })
    if(res){
      ctx.body = util.success(res)
    }else{
      ctx.body = util.fail('用户名或密码错误')
    }
  }catch(err){
    ctx.body = util.fail(err.msg)
  }
    
})

module.exports = router
