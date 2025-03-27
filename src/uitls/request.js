// 存放网络请求的方法，网络请求放在api文件夹中
import axios from "axios";
import queurystring from "querystring";


/* 创建一个新的、独立的 Axios 实例。
 它的主要作用是为不同的 HTTP 请求场景提供独立的配置，
 避免全局配置的污染，从而提高代码的灵活性和可维护性。*/

 // 网络请求的公共配置 (更多配置项可参考 axios中文说明 看云)
const instance = axios.create({
    // 统一 baseURL也可以放这里，此处放在了path.js中
    timeout: 5000  // 请求超时时间
});

const errorHandle = (status, info) => {  // status是状态码，info是错误信息
    switch(status){
        case 400:
            console.log("语义有误");
            break;
        case 401:
            console.log("服务器认证失败");
            break;
        case 403:
            console.log("token校验失败/服务器拒绝访问");
            break;
        case 404:
            console.log("地址错误，找不到资源");
            break;
        case 500:
            console.log("服务器遇到意外");
            break;    
        case 502:
            console.log("服务器无响应");
            break;    
        default:
            console.log(info);
            break;
    }
};

// 网络请求中，最常用的是拦截器

// 发送数据之前的拦截器（第一个函数是成功的回调，第二个函数是失败的回调）
instance.interceptors.request.use(
    // config：包含网络请求的所有信息
    config => {
        if(config.method === "post"){
            config.data = queurystring.stringify(config.data)
        }
        return config;
    },
    error =>{
        return Promise.reject(error);
    }
);

// 获取数据之前的拦截器
instance.interceptors.response.use(
    response => {
    // response是网络请求的返回结果。如果走的是response，就算出错网络请求也是成功的。
        return response.status ===200 ? Promise.resolve(response) : Promise.reject(response)
    },
    error => {
        const { response } = error;
        // 根据服务器返回的状态码和信息，做出相应的处理
        errorHandle(response.status, response.info);       
    }
)

// 创建自定义实例后导出（一定要导出整个实例，否则index.js引入时，会获取不到axios）
export default instance;