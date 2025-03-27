<template>
    <h3>登录页面</h3>
    <WelcomeView msg="Zetia"></WelcomeView>
    <el-button @click="goHome">回首页</el-button>
</template>

<script>
import WelcomeView from './WelcomeView.vue';

export default {
    name: 'LoginView',
    components:{
        WelcomeView
    },
    methods:{
        goHome(){
            this.$router.push('/welcome')
        }
    }
}
</script>