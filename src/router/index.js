import { createRouter,createWebHistory} from "vue-router"
import HomeView from "../views/HomeView.vue"
import WelcomeView from "../views/WelcomeView.vue"
import LoginView from "../views/LoginView.vue"
import About from "../views/About.vue"


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
                component:WelcomeView
            } ,
            {
                name:'login',
                path:'login',
                meta:{
                    title:'登录页'
                },
                component:LoginView
            }
        ]
    }
    ,
    {
        path:'/about',
        component:About
    }
]

const router= createRouter({
    history:createWebHistory(),  //访问方式
    routes
})

export default router;