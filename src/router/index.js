import { createRouter, createWebHistory } from "vue-router"
import Home from "../components/Home.vue"


const routes = [
    {
        name: 'home',
        path: '/',
        meta: {
            title: '首页'
        },
        component: Home,
        redirect: '/welcome',
        children: [
            {
                name: 'welcome',
                path: '/welcome',
                meta: {
                    title: '欢迎体验Vue3全栈课程'
                },
                component: () => import('../views/WelcomeView.vue')
            },
            {
                name: 'user',
                // 如果需要共用父级路径，不要加斜杠。否则会变成绝对路径
                path: '/system/user',
                meta: {
                    title: '用户管理'
                },
                component: () => import('../views/User.vue'),
            },
            {
                name: 'menu',
                path: '/system/menu',
                meta: {
                    title: '菜单管理'
                },
                component: () => import('../views/Menu.vue'),
            },
            {
                name: 'role',
                path: '/system/role',
                meta: {
                    title: '角色管理'
                },
                component: () => import('../views/Role.vue'),
            },
        ]
    }
    ,
    {
        name: 'login',
        path: '/login',
        meta: {
            title: '登录页'
        },
        component: () => import('../views/LoginView.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),  //访问方式
    routes
})

export default router;