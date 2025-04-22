const router = require('koa-router')()
const Menu = require('../models/menuSchema')
const util = require('../utils/util')

router.prefix('/menu')  //二级路由

// 菜单操作
router.post('/operate', async (ctx) => {
    const { _id, action, ...params } = ctx.request.body;
    let res, info;
    try {
        if (action._value == 'add') {
            res = await Menu.create(params)
            info = `添加成功`
        } else if (action._value == 'edit') {
            params.updateTime = new Date();
            console.log("路径", params.path),
                // const res = await Menu.updateOne({ _id }, { $set: params })
                res = await Menu.findByIdAndUpdate(_id, params)
            info = `编辑成功`
        } else {
            res = await Menu.findByIdAndDelete(_id)
            await Menu.deleteMany({ parentId: { $in: [_id] } })
            // await Menu.deleteMany({ parentId: { $all: [_id] } })
            info = `删除成功`
        }
        ctx.body = util.success(res, info)
    } catch (err) {
        console.error(err)
        ctx.body = util.fail(err.message)
    }

})



// 获取用户列表
router.get('/list', async (ctx) => {
    const { menuName, menuState } = ctx.request.query;
    const params = {}
    if (menuName) params.menuName = menuName;
    if (menuState) params.menuState = menuState;
    try {
        // 根据条件查询所有用户列表
        let list = await Menu.find(params) || []
        const permissionList = getTreeMenu(list, null, [])
        ctx.body = util.success(permissionList)
    } catch (err) {
        ctx.body = util.fail(`查询异常：${err.stack}`)
    }

})

// 递归拼接树形列表
function getTreeMenu(rootList, id, list) {
    for (let i = 0; i < rootList.length; i++) {
        let item = rootList[i]
        // pop()获取数组最后一个元素（即当前节点的直接父节点ID）
        // .slice() 创建 parentId 数组的副本，防止 .pop() 修改原始数据
        // parentId 是ObjectId类型，所以可能需要强制转换
        if (String(item.parentId.slice().pop()) == String(id)) {
            list.push(item._doc)
        }
    }
    list.map(item => {
        item.children = []
        getTreeMenu(rootList, item._id, item.children)
        if (item.children.length == 0) {
            delete item.children;
        } else if (item.children.length > 0 && item.children[0].menuType == 2) {
            // 快速去本按钮和菜单，用于后期菜单按钮的权限控制
            item.action = item.children;
        }
    })
    return list;
}

module.exports = router;