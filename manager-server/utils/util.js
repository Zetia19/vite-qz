/**
 * 通用工具函数
 */
const jwt = require('jsonwebtoken')
const log4js = require('./log4j')

const CODE = {
    SUCCESS: 200, // 成功
    PARAM_ERROR: 1001, // 参数错误
    USER_ACCOUNT_ERROR: 2001, // 用户账号错误
    USER_LOGIN_ERROR: 3001, // 用户未登录
    BUSINESS_ERROR: 4001, // 业务请求失败
    AUTH_ERROR: 5001 // 认证失败或TOKEN过期
}

module.exports = {
    /**
     * 分页结构封装
     * @param {number} pageNum
     * @param {number} pageSize
     * */
    pager({ pageNum = 1, pageSize = 10 }) {
        pageNum *= 1; // 转化为数字类型
        pageSize *= 1;
        const skipIndex = (pageNum - 1) * pageSize; // 跳过的条数
        return {
            page: {
                pageNum,
                pageSize
            },
            skipIndex
        }
    },
    success(data = '', msg = '', code = CODE.SUCCESS) {
        log4js.debug('请求成功：' + JSON.stringify(data))
        return { code, data, msg }
    },
    fail(msg = '', code = CODE.BUSINESS_ERROR, data = '') {
        log4js.debug('请求失败：' + msg)
        return { code, data, msg }
    },
    decoded(authorization) {
        if (authorization) {
            let token = authorization.split(' ')[1]
            return jwt.verify(token, 'qz')
        }
        return '';
    },
    getTreeMenu(rootList, id, list) {
        for (let i = 0; i < rootList.length; i++) {
            let item = rootList[i]
            if (String(item.parentId.slice().pop()) == String(id)) {
                list.push(item._doc)
            }
        }
        list.map(item => {
            item.children = []
            this.getTreeMenu(rootList, item._id, item.children)
            if (item.children.length == 0) {
                delete item.children;
            } else if (item.children.length > 0 && item.children[0].menuType == 2) {
                item.action = item.children;
            }
        })
        return list;
    },
    CODE
}