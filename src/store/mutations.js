/**
 * Mutation业务层数据提交
 * 
*/
import storage from "../uitls/storage";

export default {
    // 存储用户信息
    saveUserInfo(state, userInfo) {
        state.userInfo = userInfo;
        storage.setItem("userInfo", userInfo);
    },
    saveUserMenu(state, menuList) {
        state.menuList = menuList;
        storage.setItem("menuList", menuList);
    },
    saveUserAction(state, actionist) {
        state.actionist = actionist;
        storage.setItem("actionist", actionist);
    },
    // 清除用户信息
    clearUserInfo(state) {
        state.userInfo = {};
        storage.removeItem("userInfo");
    }
}