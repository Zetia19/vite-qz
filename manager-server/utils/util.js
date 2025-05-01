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
    formateDate(date, rule) {
        // 设置默认格式
        let fmt = rule || 'yyyy-MM-dd hh:mm:ss';

        const o = {
            'y+': date.getFullYear(), // 年份
            'M+': date.getMonth() + 1, // 月份
            'd+': date.getDate(), // 日
            'h+': date.getHours(), // 小时
            'm+': date.getMinutes(), // 分
            's+': date.getSeconds() // 秒
        }
        for (let k in o) {
            const pattern = new RegExp(`(${k})`);
            const Match = pattern.exec(fmt);
            if (Match) {
                const str = o[k] + '';
                fmt = fmt.replace(Match[0], Match[0].length === 1 ? str : str.padStart(2, '0'));
            }
        }
        return fmt;
    },
    CODE
}