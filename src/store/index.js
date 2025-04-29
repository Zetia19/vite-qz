/**
 * Vuex状态管理
 * */
import { createStore } from 'vuex';
import mutations from './mutations';
import storage from '../uitls/storage';

const state = {
    userInfo: storage.getItem("userInfo") || {},  //获取用户信息
    menuList: storage.getItem("menuList") || [],  //获取菜单列表
    actionList: storage.getItem("actionList") || [],  //获取按钮列表
}

export default createStore({
    state,
    mutations
})