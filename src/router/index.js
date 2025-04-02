import { createRouter,createWebHistory} from "vue-router"
import HomeView from "../views/HomeView.vue"


const routes =[
    {
        name:'home',
        path:'/',
        meta:{
            title:'首页'
        },
        component:HomeView,
        redirect:'/welcome',
        children:[
            {
                name:'welcome',
                path:'welcome',
                meta:{
                    title:'欢迎页'
                },
                component:()=>import('../views/WelcomeView.vue')
            } 
        ]
    }
    ,
    {
        name:'login',
        path:'/login',
        meta:{
            title:'登录页'
        },
        component:()=>import('../views/LoginView.vue')
    }
]

const router= createRouter({
    history:createWebHistory(),  //访问方式
    routes
})

export default router;