import request from "../uitls/request";
import path from "./path";

export default {
    login(params) {
        return request({
            url: path.login,
            method: "post",
            data: params,
            mock: false  //   局部mock关闭
        })
    },
    noticeCount(params) {
        return request({
            url: path.noticeCount,
            method: "get",
            data: {},
            mock: true
        })
    },
    getMenuList() {
        return request({
            url: path.menuList,
            method: "get",
            data: {},
            mock: true
        })
    },
    getUserList(params) {
        return request({
            url: path.userList,
            method: "get",
            data: params,
            mock: false
        })
    },
    userDel(params) {
        return request({
            url: '/users/delete',
            method: "post",
            data: params
        })
    },
    getRoleList() {
        return request({
            url: path.userRoleList,
            method: "get",
            data: {},
            mock: true
        })
    },
    getDeptList() {
        return request({
            url: path.DeptList,
            method: "get",
            data: {},
            mock: true
        })
    },
    userSubmit(params) {
        return request({
            url: path.userSubmit,
            method: "post",
            data: params,
            mock: false
        })
    },
}