<template>
    <div class="exception">
        <img src="./../assets/images/404.jpeg" alt="">
        <el-button @click="goHome">返回首页</el-button>
    </div>
</template>
<script>
export default {
    name: '404',
    data(){
        return {
        }
    },
    components:{
    },
    methods:{
        goHome(){
            this.$router.push('/');
        }
    }
}
</script>
<style>
.exception{
   position: relative; 
}
img{
    width: 100%;
    height: 100vh;
}
.el-button{
    position: fixed;
    bottom: 100px;
    left: 50%;
    margin-left: -40px;
}
</style>