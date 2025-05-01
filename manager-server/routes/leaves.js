/**
 * 审核管理模块
 * */
const router = require('koa-router')()
router.prefix('/leave')  //二级路由
const Leave = require('../models/leaveSchema')
const Dept = require('../models/deptSchema')
const util = require('../utils/util')
const jwt = require('jsonwebtoken')

// 查询所以角色列表（只要角色名称和ID）
router.get('/list', async (ctx) => {
  const { applyState } = ctx.request.query
  const { page, skipIndex } = util.pager(ctx.request.query)
  let authorization = ctx.request.headers.authorization
  let { data } = util.decoded(authorization)
  try {
    let params = {
      // 子文档通过.来查询
      "applyUser.userId": data.userId,
    }
    if (applyState) params.applyState = applyState
    /* 错误：const query = await Leave.find(params)
    过早(链式调用前)使用了await，导致查询被执行，返回了结果数组而非查询对象
    数组没有skip和limit方法，因此无法进行分页操作。
     const query = Leave.find(params)
     const list = await query.skip(skipIndex).limit(page.pageSize)
    */
    const list = await Leave.find(params)
      .skip(skipIndex)
      .limit(page.pageSize)
      .exec()
    const total = await Leave.countDocuments(params)
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
  const { _id, action, ...params } = ctx.request.body

  // 获取当前登录用户信息(token)
  let authorization = ctx.request.headers.authorization
  let { data } = util.decoded(authorization)
  // 创建订单号
  let orderNo = 'XJ'
  orderNo += util.formateDate(new Date(), 'yyyyMMdd');
  const total = await Leave.countDocuments()
  params.orderNo = orderNo + total;

  // 获取用户当前部门Id
  const id = data.deptId.pop()
  // 查找（当前）负责人信息
  let dept = await Dept.findById(id)
  // 获取认识部门和财务部门负责人信息(固定的)
  let userList = await Dept.find({ deptName: { $in: ['人事部门', '财务部门'] } })
  // console.log("userList=>", userList)
  //1.先把当前负责人信息添加到数组中 
  let auditUsers = dept.userName
  let auditFlows = [
    { userId: dept.userId, userName: dept.userName, userEmail: dept.userEmail }
  ]
  //2.再把人事部门和财务部门负责人信息，添加到数组中
  userList.map(item => {
    auditFlows.push({
      userId: item.userId, userName: item.userName, userEmail: item.userEmail
    })
    auditUsers += `,${item.userName}`
  })

  params.auditUsers = auditUsers
  params.curAuditUserName = dept.userName // 当前审核人姓名
  params.auditFlows = auditFlows
  params.auditLogs = []
  params.applyUser = {  // 申请人信息
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail
  }

  let res, info;
  try {
    if (action == 'create') {
      res = await Leave.create({ ...params, createTime: new Date() })
      info = '创建成功'
    } else {
      res = await Leave.findByIdAndUpdate(_id, { applyState: 5 })
      info = '作废成功'
    }
    ctx.body = util.success(res, info)
  }
  catch (err) {
    ctx.body = util.fail(`操作失败:${err.stack}`);
  }
})


module.exports = router
