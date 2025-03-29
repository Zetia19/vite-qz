/*
环境配置封裝
*/
// 获取 Vite 环境模式，默认生产环境
const env = import.meta.env.MODE || 'prod';  //'prod' 是安全降级策略，防止环境变量未定义
const EnvConfig = {
    dev: {
        baseApi: '/', 
        // mockApi:'/mock'  // 本地mock数据
        mockApi:'' 
    } ,
    test: {
        baseApi: '//test.futurefe.com/api',
        mockApi:''  // 测试环境关闭mock
    },
    prod: {
        baseApi: '//futurefe.com/api',
        mockApi:''  // 生产环境关闭mock
    }
}
export default {
    env,
    namespace: 'manager',  // 命名空间，防止不同项目之间的localStorage冲突
    mock: true,  // 启用模拟数据模式
    ...EnvConfig[env]
}