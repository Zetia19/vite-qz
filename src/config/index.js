/*
环境配置封裝
*/
// 获取 Vite 环境模式，默认生产环境
const env = import.meta.env.MODE || 'prod';  //'prod' 是安全降级策略，防止环境变量未定义
const EnvConfig = {
    dev: {
        baseApi: '/', 
        mockApi:'https://m1.apifoxmock.com/m1/6133935-5825689-default' 
    } ,
    test: {
        baseApi: '//test.futurefe.com/api',
        mockApi:'https://m1.apifoxmock.com/m1/6133935-5825689-default'   // 测试环境关闭mock
    },
    prod: {
        baseApi: '//futurefe.com/api',
        mockApi:'https://m1.apifoxmock.com/m1/6133935-5825689-default'  // 生产环境关闭mock
    }
}
export default {
    env,
    namespace: 'manager',  // 命名空间，防止不同项目之间的localStorage冲突
    mock: true,  // 启用模拟数据模式
    ...EnvConfig[env]
}