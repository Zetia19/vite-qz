/**
 * 用户管理模块
 * */
const router = require('koa-router')()
router.prefix('/roles')  //二级路由
const Role = require('../models/roleSchema')
const Counter = require('../models/counterSchema')
const util = require('../utils/util')
const jwt = require('jsonwebtoken')
const md5 = require('md5')

// 查询所以角色列表（只要角色名称和ID）
router.get('/allList', async (ctx) => {
  try {
    const list = await Role.find({}, "_id roleName")
    ctx.body = util.success(list);

  } catch (err) {
    ctx.body = util.fail(`查询失败:${err.stack}`);
  }
})

// 按页获取角色列表
router.get('/list', async (ctx) => {
  const { roleName } = ctx.request.query
  const { page, skipIndex } = util.pager(ctx.request.query)
  try {
    let params = {}
    if (roleName) params.roleName = roleName
    // 返回的是一个peromise对象
    const query = Role.find(params)
    const list = await query.skip(skipIndex).limit(page.pageSize)
    const total = await Role.countDocuments(params)
    ctx.body = util.success({
      list,
      page: {
        ...page,
        total
      }
    });
  } catch (err) {
    ctx.body = util.fail(`查询失败:${err.stack}`);
  }
})

// 角色操作（编辑、删除、添加）
router.post('/operate', async (ctx) => {
  const { _id, roleName, remark, action } = ctx.request.body
  let res, info;
  try {
    if (action == 'create') {
      res = await Role.create({ roleName, remark })
      info = '创建成功'
    }
    else if (action == 'edit') {
      if (_id) {
        let params = { roleName, remark }
        params.updateTime = new Date()
        res = await Role.findByIdAndUpdate(_id, params)
        info = '编辑成功'
      }
      else {
        ctx.body = util.fail('缺少参数params:_id')
        return
      }
    }
    else {
      if (_id) {
        res = await Role.findByIdAndDelete(_id)
        info = '删除成功'
      }
      else {
        ctx.body = util.fail('缺少参数params:_id')
        return
      }
    }
    ctx.body = util.success(res, info)
  }
  catch (err) {
    ctx.body = util.fail(`操作失败:${err.stack}`);
  }
})

// 编辑角色权限
router.post('/update/permission', async (ctx) => {
  const { _id, permissionList } = ctx.request.body
  try {
    let params = { permissionList, updateTime: new Date() }
    let res = await Role.findByIdAndUpdate(_id, params)
    ctx.body = util.success('', '权限设置成功')
  } catch (err) {
    ctx.body = util.fail(`权限设置失败:${err.stack}`);
  }
})

module.exports = router
