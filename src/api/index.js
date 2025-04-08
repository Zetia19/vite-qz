import request from "../uitls/request";
import path from "./path";

export default {
    login(params){
        return request({
            url:path.login,
            method:"post",
            data:params,
            // mock:false  //   局部mock关闭
        })
    },
    noticeCount(params){
        return request({
            url:path.noticeCount,
            method:"get",
            data:{},
        })
    },
    getMenuList(){
        return request({
            url:path.menuList,
            method:"get",
            data:{},
        })
    }
}