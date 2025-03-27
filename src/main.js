import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import store from './store'
import "./mock/index.js"
import axios from 'axios'
import config from './config/index.js'

axios.get(config.mockApi+'/goods/list').then(res=>{
    console.log(res);
})

// 测试环境变量,官方文档：https://cn.vite.dev/guide/env-and-mode.html
console.log('环境变量=>',import.meta.env);
const app=createApp(App)
app.use(router).use(ElementPlus).use(store).mount('#app')
