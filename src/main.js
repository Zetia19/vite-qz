import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import elementIcons from './plugins/icons.js'
import 'element-plus/dist/index.css'
import store from './store'
import axios from 'axios'
import config from './config/index.js'
import storage from './uitls/storage.js'
import api from './api/index.js'
import requst from './uitls/request.js'

// axios.get(config.mockApi+"/login").then(res=>{
//     console.log(res);
// })

// 测试环境变量,官方文档：https://cn.vite.dev/guide/env-and-mode.html
console.log('环境变量=>', import.meta.env);

const app = createApp(App)
app.config.globalProperties.$storage = storage;
app.config.globalProperties.$requst = requst;
app.config.globalProperties.$api = api;

app.use(router).use(ElementPlus).use(elementIcons).use(store).mount('#app')

// app.use(ElementPlus,{size:'samll'}) 全局配置大小
