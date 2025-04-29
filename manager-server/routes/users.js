/**
 * 用户管理模块
 * */
const router = require('koa-router')()
router.prefix('/users')  //二级路由
const User = require('../models/userSchema')
const Menu = require('../models/menuSchema')
const Counter = require('../models/counterSchema')
const Role = require('../models/roleSchema')
const util = require('../utils/util')
const jwt = require('jsonwebtoken')
const md5 = require('md5')

// 用户登录
router.post('/login', async (ctx) => {
  try {
    const { userName, userPwd } = ctx.request.body;
    /**
     * 返回数据库指定的字段
     * 1. 字符串方式，字段名用空格隔开
     * 2. {userId:1,userName:1,userPwd:1} (1表示返回，0表示不返回)
     * 3. const res = await User.findOne({userName,userPwd}).select ('userId')
     * */
    const res = await User.findOne({
      userName,
      // userPwd
      userPwd: md5(userPwd)
    }, 'userId userName userEmail state role deptId roleList')

    const data = res._doc;

    const token = jwt.sign({
      data
    }, 'qz', { expiresIn: '1h' })

    if (res) {
      data.token = token;
      ctx.body = util.success(data)
    } else {
      ctx.body = util.fail('用户名或密码错误')
    }
  } catch (err) {
    ctx.body = util.fail(err.msg)
  }

})

// 获取用户列表
router.get('/list', async (ctx) => {
  const { userId, userName, state } = ctx.request.query;
  const { page, skipIndex } = util.pager(ctx.request.query);
  let params = {}
  if (userId) params.userId = userId;
  if (userName) params.userName = userName;
  if (state && state != '0') params.state = state;

  try {
    // 根据条件查询所有用户列表
    const query = User.find(params, { userPwd: 0, _id: 0 })
    // 跳过记录数、限制条数、排序规则(1升序，-1降序)
    const list = await query.skip(skipIndex).limit(page.pageSize).sort({ userId: 1 })
    // 查询总记录数
    const total = await User.countDocuments(params)

    // 返回数据
    ctx.body = util.success({
      page: {
        ...page,
        total
      },
      list
    })
  } catch (err) {
    ctx.body = util.fail(`查询异常：${err.stack}`)
  }

})

// 用户删除/批量删除（软删除）
router.post('/delete', async (ctx) => {
  const { userIds } = ctx.request.body;

  // 使用 MongoDB 的 deleteMany 方法批量删除(硬删除)
  // const res = await User.deleteMany({ userId: { $in: userIds } })

  // 如果userId在条件范围里，修改用户状态。$in 操作符匹配数组中任意值的文档
  const res = await User.updateMany({ userId: { $in: userIds } }, { state: 2 })
  console.log(res)
  // Mongdb的nModified 字段已废弃，使用 modifiedCount 字段代替
  if (res.modifiedCount > 0) {
    ctx.body = util.success(res, `删除成功${res.modifiedCount}条数据`)
    return;
  }
  ctx.body = util.fail('删除失败', res)
})

// 用户新增、编辑
router.post('/operate', async (ctx) => {
  const { userId, userName, userEmail, mobile, job, state, roleList, deptId, action } = ctx.request.body;
  if (action == 'add') {
    if (!userName || !userEmail || !deptId) {  //如果为空
      ctx.body = util.fail('参数错误', util.CODE.PARAM_ERROR)
      return;
    }
    const doc = await Counter.findOneAndUpdate(
      { _id: 'userId' },  //查找标识为'userId'的计数器
      { $inc: { sequence_value: 1 } },   // 将序列值递增1
      { new: true }  // 返回更新后的文档
    )
    console.log("doc=>", doc)
    //User.findOne 查询时没有使用 await，导致返回的是 Promise 对象而不是查询结果.
    // Promise 对象在 if(res) 判断中始终为真值
    const res = await User.findOne({ $or: [{ userName }, { userEmail }] }, '_id userName userEmail')
    if (res) {
      ctx.body = util.fail(`用户名或邮箱已存在,信息如下:${res.userName}-${res.userEmail}`)
    } else {
      try {
        const user = new User({
          userId: doc.sequence_value,
          userName,
          userPwd: md5('123456'),
          userEmail,
          role: 1,  //默认普通用户
          mobile,
          job,
          state,
          roleList,
          deptId
        })
        user.save();
        ctx.body = util.success({}, '用户创建成功')
      } catch (err) {
        ctx.body = util.fail(err.stack, '用户创建失败')
      }

    }
  } else {
    if (!deptId) {
      ctx.body = util.fail('部门不能为空', util.CODE.PARAM_ERROR)
      return;
    }
    try {
      const res = await User.findOneAndUpdate({ userId }, {
        mobile, job, state, roleList, deptId
      })
      ctx.body = util.success({}, '更新成功')
      return;
    } catch (err) {
      ctx.body = util.fail(err.stack, '更新失败')
    }
  }
})

// 获取全部用户列表
router.get('/all/list', async (ctx) => {
  try {
    const list = await User.find({}, 'userId userName userEmail')
    console.log("list=>", list)
    ctx.body = util.success(list)
  } catch (err) {
    ctx.body = util.fail(err.stack)
  }
})

// 获取用户对应的权限菜单
router.get('/getPermissionList', async (ctx) => {
  let authorization = ctx.request.headers.authorization
  let { data } = util.decoded(authorization)
  // getMenuList是个async函数，返回的是promise对象，所以需要在调用处使用await
  let menuList = await getMenuList(data.role, data.roleList)
  /* 当对一个Object或数组里某个项进行更改时，会影响到整个对象
  （getActionList用了pop,会改变原数据）。
  为了避免这种情况，需要使用JSON.parse(JSON.stringify(obj))来复制一个新的对象或数组，
  进行深度克隆/深拷贝，这样就可以在不影响原始对象的情况下进行操作。 */
  /* JS内存管理包含 栈 和 堆，
   基础类型对象 和 函数调用 是在 栈 储存，引用类型对象 是在 堆 储存 */
  let actionList = getActionList(JSON.parse(JSON.stringify(menuList)))
  ctx.body = util.success({ menuList, actionList })
})


async function getMenuList(userRole, roleKeys) {
  let rootList = []
  if (userRole == 0) {
    rootList = await Menu.find({}) || []
  }
  else {
    // 根据用户拥有的角色，获取权限列表（菜单ID），再根据菜单ID查询菜单
    // 先查找用户对应的角色有哪些，再根据角色ID查询对应的菜单
    let roleList = await Role.find({ _id: { $in: roleKeys } })
    let permissionList = []
    // 过滤重复的菜单权限(菜单id)
    roleList.map(role => {
      let { checkedKeys, halfCheckedKeys } = role.permissionList
      permissionList = permissionList.concat([...checkedKeys, ...halfCheckedKeys])
    })
    permissionList = [...new Set(permissionList)]
    // 根据权限列表（菜单ID）查询菜单
    rootList = await Menu.find({ _id: { $in: permissionList } })
  }
  return util.getTreeMenu(rootList, null, [])
}

function getActionList(list) {
  let actionList = []
  const deep = (arr) => {
    while (arr.length) {
      let item = arr.pop()
      // 最后一级
      if (item.action) {
        item.action.map(action => {
          actionList.push(action.menuCode)
        })
      }
      // 一级菜单
      if (item.children && !item.action) {
        deep(item.children)
      }
    }
  }
  deep(list)
  return actionList;
}

module.exports = router
