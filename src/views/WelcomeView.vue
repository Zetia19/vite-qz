<template>
    <div class="welcome">
        <div class="content">
            <div class="sub-title">欢迎体验</div>
            <div class="title">Eridia通用后台管理系统</div>
            <div class="desc">- Vue3+ElementPlus+Mongo打造的后台管理系统</div>
        </div>
        <div class="img"></div>
    </div>
    
</template>

<script>
export default {
    name: 'WelcomeView'
}
</script>

<style lang="scss">
.welcome {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-color: #fff;
    .content{
        position: relative;
        bottom: 40px;
        .sub-title{
            text-align: left;
            font-size: 40px;
            line-height: 52px;
            color: #333;
        }
        .title{
            text-align: left;
            font-size: 50px;
            line-height: 72px;
            color: #5856be;
        }

        .desc{
            text-align: right;
            font-size: 18px;
            color: #949494;
        }
    }

   .img{
        width: 600px;
        height: 600px;
        background: url('../assets/images/welcome.png') no-repeat center;
        background-size: 100% 100%;
        margin-left: 200px; 
   }
}
</style>