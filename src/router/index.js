import { createRouter, createWebHistory } from "vue-router"
import Home from "../components/Home.vue"
import storage from "../uitls/storage"
import API from "../api"

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
    },
    {
        name: '404',
        path: '/404',
        meta: {
            title: '页面不存在'
        },
        component: () => import('../views/404.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),  //访问方式
    routes
})

async function loadAsyncRoutes() {
    let userInfo = storage.getItem('userInfo') || {};
    if (userInfo.token) {
        try {
            const menuList = await API.getPermissionList()
            // const { menuList } = await API.getPermissionList()
            console.log('API返回数据:', menuList)
            let routes = generateRoutes(menuList)

            // 定义组件映射
            const componentMap = {
                'User': () => import('../views/User.vue'),
                'Menu': () => import('../views/Menu.vue'),
                'Role': () => import('../views/Role.vue'),
                'Dept': () => import('../views/Dept.vue')
            }

            routes.map(route => {
                if (componentMap[route.component]) {
                    route.component = componentMap[route.component]
                    router.addRoute("home", route)
                }
            })
            // Vite 在构建时需要进行静态分析，无法处理完全动态的 import 路径,不推荐↓
            /* routes.map(route => {
                let url = `./../views/${route.component}.vue`
                route.component = () => import(url)
                router.addRoute("home", route)
            })  */
        } catch (err) {
            console.error('加载动态路由失败:', err)
        }
    }
}

function generateRoutes(menuList) {
    let routes = [];
    const deepList = (list) => {
        console.log("list=>", list)
        while (list.length) {
            let item = list.pop()
            if (item.action) {
                routes.push({
                    name: item.component,
                    path: item.path,
                    meta: {
                        title: item.menuName
                    },
                    component: item.component
                },)
            }
            if (item.children && !item.action) {
                deepList(item.children)
            }
        }
    }
    deepList(menuList)
    return routes;
}

await loadAsyncRoutes();

// 判断当前地址是否可以访问
function checkPermission(path) {
    let hasPermission = router.getRoutes().filter(route => route.path == path).length;
    if (hasPermission) {
        return true;
    } else {
        return false;
    }
}

// 导航守卫
router.beforeEach((to, from, next) => {
    if (checkPermission(to.path)) {
        // 修改页面标题
        document.title = to.meta.title;
        next()
    } else {
        next('/404')
    }
})

export default router;