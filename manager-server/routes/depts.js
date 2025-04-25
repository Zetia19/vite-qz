const router = require('koa-router')()
const Dept = require('../models/deptSchema')
const util = require('../utils/util')

router.prefix('/dept')  //二级路由

// 部门操作
router.post('/operate', async (ctx) => {
    const { _id, action, ...params } = ctx.request.body;
    let res, info;
    try {
        if (action == 'create') {
            res = await Dept.create(params)
            info = `添加成功`
        } else if (action == 'edit') {
            params.updateTime = new Date();
            res = await Dept.findByIdAndUpdate(_id, params)
            info = `编辑成功`
        } else if (action == 'delete') {
            res = await Dept.findByIdAndDelete(_id)
            await Dept.deleteMany({ parentId: { $in: [_id] } })
            info = `删除成功`
        }
        ctx.body = util.success(res, info)
    } catch (err) {
        console.error(err)
        ctx.body = util.fail(err.message)
    }

})



// 获取部门列表
router.get('/list', async (ctx) => {
    const { deptName } = ctx.request.query;
    const params = {}
    if (deptName) params.deptName = deptName;
    try {
        let list = await Dept.find(params) || []
        if (deptName) {
            ctx.body = util.success(list)
            return;
        } else {
            let treeList = getTreeDept(list, null, [])
            ctx.body = util.success(treeList)
        }
    } catch (err) {
        ctx.body = util.fail(`查询异常：${err.stack}`)
    }

})

// 递归拼接树形列表
function getTreeDept(rootList, id, list) {
    // 获取一级菜单
    for (let i = 0; i < rootList.length; i++) {
        let item = rootList[i]
        if (String(item.parentId.slice().pop()) == String(id)) {
            list.push(item._doc)
        }
    }
    list.map(item => {
        item.children = []
        getTreeDept(rootList, item._id, item.children)
        if (item.children.length == 0) {
            delete item.children;
        }
    })
    return list;
}

module.exports = router;