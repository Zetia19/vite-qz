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
  const { applyState, type } = ctx.request.query
  const { page, skipIndex } = util.pager(ctx.request.query)
  let authorization = ctx.request.headers.authorization
  let { data } = util.decoded(authorization)
  try {
    let params = {}
    // approve ：审核人查询列表
    if (type == 'approve') {
      if (applyState == 1 || applyState == 2) {
        // 审核人查询待审核列表
        params.curAuditUserName = data.userName
        /*
        错误：params.applyState = 1
        当前用户为第二个审批人时，应该由该用户审批的表单请求-此时的applyState=2
        所以不能直接写死，需要根据当前用户的角色来判断
        所以需要使用$or查询符，查询applyState=1或applyState=2的表单
        注意：$or查询符只能用于查询条件，不能用于更新操作
        */
        params.$or = [{ applyState: 1, }, { applyState: 2 }];
      } else if (applyState > 2) {
        params = { "auditFlows.userId": data.userId, applyState }
      } else {
        params = { "auditFlows.userId": data.userId }
      }
    } else {
      // 子文档通过.来查询
      params = { "applyUser.userId": data.userId }
      if (applyState) params.applyState = applyState
    }

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

router.post('/approve', async (ctx) => {
  const { action, remark, _id } = ctx.request.body
  let authorization = ctx.request.headers.authorization
  let { data } = util.decoded(authorization)
  let params = {}
  try {
    // 1:待审批 2:审批中 3:审批拒绝 4:审批通过 5:作废
    let doc = await Leave.findById(_id)
    let auditLogs = doc.auditLogs || []

    if (action == 'refuse') {
      params.applyState = 3;
    } else {
      // 审批通过
      if (doc.auditFlows.length == doc.auditLogs.length) {
        ctx.body = util.fail(`当前申请已处理,请勿重复操作`);
        return;
      } else if (doc.auditFlows.length == doc.auditLogs.length + 1) {
        // 最后一级审批人
        params.applyState = 4
      }
      else if (doc.auditFlows.length > doc.auditLogs.length) {
        // 审批中
        params.applyState = 2
        params.curAuditUserName = doc.auditFlows[doc.auditLogs.length + 1].userName;
      }
    }
    auditLogs.push({
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      createTime: new Date(),
      remark,
      action: action == 'refuse' ? '审核拒绝' : '审核通过'
    })
    params.auditLogs = auditLogs
    let res = await Leave.findByIdAndUpdate(_id, params)
    ctx.body = util.success("", '操作成功')
  } catch (err) {
    ctx.body = util.fail(`操作失败:${err.stack}`);
  }
})

// 获取通知数量
router.get('/count', async (ctx) => {
  let authorization = ctx.request.headers.authorization
  let { data } = util.decoded(authorization)
  try {
    let params = {}
    params.curAuditUserName = data.userName
    params.$or = [{ applyState: 1, }, { applyState: 2 }];
    let total = await Leave.countDocuments(params)
    ctx.body = util.success(total)
  } catch (error) {
    ctx.body = util.fail(`查询通知数量失败:${err.stack}`);
  }
})


module.exports = router
