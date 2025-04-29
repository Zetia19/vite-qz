import axios from "axios";
import { ElMessage } from "element-plus";
import config from "../config";
import router from "../router";
import storage from "./storage";
const TOKEN_INVALID = 'Token认证失败,请重新登录';
const NETWORK_ERROR = '网络请求异常，请稍后重试';


const instance = axios.create({
    baseURL: config.baseApi,
    timeout: 8000
});

// 请求拦截，在请求发送前加工
instance.interceptors.request.use((req) => {
    const headers = req.headers;
    const { token } = storage.getItem('userInfo') || {};
    if (!headers.Authorization) headers.Authorization = 'Bearer ' + token;
    return req;
})

// 响应拦截，在收到响应后处理
instance.interceptors.response.use((res) => {
    const { code, data, msg } = res.data;
    if (code === 200) {
        return data;
    } else if (code === 5001 || code === 401) {
        ElMessage.error(TOKEN_INVALID);
        setTimeout(() => {
            router.push('/login');
            storage.clearItem('userInfo');  // 新增清除用户信息
            storage.clearItem('menuList');  // 新增用户菜单权限
            storage.clearItem('actionist');  // 新增用户按钮权限
        }, 1500)
        return Promise.reject(TOKEN_INVALID);
    } else {
        ElMessage.error(msg || NETWORK_ERROR);
        return Promise.reject(msg || NETWORK_ERROR);
    }
}
)

/**
 * 请求核心函数
 * @param {*} options 请求配置
 * */
function request(options) {
    options.method = options.method || 'get';
    // if (options.method.toLowerCase() === 'get') {
    //     options.params = options.data;
    //     // options.params = { ...options.params, ...options.data };
    // }
    let isMock = config.mock;
    if (typeof options.mock !== 'undefined') {
        isMock = options.mock;
    }
    if (config.env === 'prod') {
        instance.defaults.baseURL = config.baseApi;
    }
    else {
        instance.defaults.baseURL = isMock ? config.mockApi : config.baseApi;
    }

    return instance(options);
}

['get', 'post', 'put', 'delete', 'patch'].forEach((item) => {
    request[item] = (url, data, options) => {
        return request({
            url,
            method: item,
            data,
            ...options
        })
    }
})

export default request;