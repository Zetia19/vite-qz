import axios from "../uitls/request";
import path from "./path";

const api={
    // 获取成品详情地址
    getGoodsList(){
        return axios.get(path.baseUrl + path.goods);
    }
}

export default api