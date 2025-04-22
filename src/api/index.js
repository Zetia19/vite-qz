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
            params: {},
            mock: true
        })
    },
    getRoleList(params) {
        return request({
            url: '/roles/list',
            method: 'get',
            params: params,
            mock: false
        })
    },
    getMenuList(params) {
        return request({
            url: '/menu/list',
            method: 'get',
            params: params,
            mock: false
        })
    },
    getUserList(params) {
        return request({
            url: path.userList,
            method: "get",
            params: params,
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
    getRoleAllList() {
        return request({
            url: path.userRoleList,
            method: "get",
            data: {},
            mock: false
        })
    },
    getDeptList() {
        return request({
            url: path.DeptList,
            method: "get",
            params: {},
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
    menuSubmit(params) {
        return request({
            url: path.menuSubmit,
            method: "post",
            data: params,
            mock: false
        })
    },
    roleOperate(params) {
        return request({
            url: '/roles/operate',
            method: "post",
            data: params,
            mock: false
        })
    },
    updatePermission(params) {
        return request({
            url: '/roles/update/permission',
            method: "post",
            data: params,
            mock: false
        })
    },
}