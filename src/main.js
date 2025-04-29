import { createApp, onBeforeMount } from 'vue'
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

// 测试环境变量,官方文档：https://cn.vite.dev/guide/env-and-mode.html
console.log('环境变量=>', import.meta.env);

const app = createApp(App)

// 自定义指令
app.directive('has', {
    // el:指令绑定的元素
    // binding:指令的相关信息对象
    beforeMount: (el, binding) => {
        // 获取按钮权限列表
        // console.log(el, binding)
        let userAction = storage.getItem('actionist') || [];
        let value = binding.value;
        // 判断按钮权限列表是否包含当前按钮权限
        let hasPermission = userAction.includes(value);
        if (!hasPermission) {
            el.style = 'display: none';
            setTimeout(() => {
                el.parentNode.removeChild(el);
            }, 0)
        }
    }
})
app.config.globalProperties.$storage = storage;
app.config.globalProperties.$requst = requst;
app.config.globalProperties.$api = api;

app.use(router).use(ElementPlus).use(elementIcons).use(store).mount('#app')

// app.use(ElementPlus,{size:'samll'}) 全局配置大小
