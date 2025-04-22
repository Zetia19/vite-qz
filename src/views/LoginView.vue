<template>
    <div class="login-wrapper">
        <div class="modal">
            <el-form ref="user" :model="user" status-icon :rules="rules">
                <div class="title">Eridia</div>
                <el-form-item label="" prop="userName">
                    <el-input type="text" placeholder="请输入用户名" v-model="user.userName">
                        <template #prefix>
                            <el-icon><User /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="" prop="userPwd">
                    <el-input type="password" placeholder="请输入密码" v-model="user.userPwd">
                        <template #prefix>
                            <el-icon><View /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button class="btn-login" type="primary" @click="login">登录</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
    
</template>

<script>
import WelcomeView from './WelcomeView.vue';
import { ElButton,ElInput } from 'element-plus';

export default {
    name: 'LoginView',
    data(){
      return {
        user:{
            userName:'admin',
            userPwd:'admin'
        },
         rules:{
          userName: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            // { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: ['blur','change'] } 
          ],
          userPwd: [
            { required: true, message: '请输入密码', trigger: 'blur'},
          ]
      }    
    }
},
    components:{
        WelcomeView
    },
    
    methods:{
         login(){
            /* validate方法用于验证表单是否通过验证，参数valid是一个回调函数，用于接收验证结果
            如果验证通过，valid的值为true，否则为false */ 
             this.$refs.user.validate((valid) => {
                 if (valid) {
                    /* api.login（this.user）调用request函数，将参数赋值给data，并发送请求
                     通过then方法获取到返回的结果res(包含status和data等信息)*/
                     this.$api.login(this.user).then(res => {
                        // 登陆成功后，保存用户信息到vuex中并跳转页面
                        /* commit方法用于提交一个mutation，mutation是一个函数，用于修改state的值
                        saveUserInfo是mutation的名称，res是传入的参数
                        同时，store/index.js中，state里的userInfo对象调用storage.getItem（）会自动更新为res的值
                        */
                        this.$store.commit('saveUserInfo',res);
                        this.$router.push('/welcome');
                        console.log(res);
                     }).catch(error => {
                       console.error('Login failed:', error);
                    }) 
                 }
             })
        }
    }
}
</script>

<style lang="scss">
.login-wrapper{
   display: flex;
   justify-content: center;
   align-items: center;
   background-color: #f5faff; 
   width: 100vw;  //1vw = 1%
   height: 100vh;
   .modal{
       width: 500px;
       padding: 50px;
       background-color: #ffffff; 
       border-radius: 10px;
       box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.1);
       .title{
          text-align: center;
          font-size: 40px;
          line-height: 1.5;
          margin-bottom: 40px; 
       }
       .btn-login{
          width: 100%;
       }
   }
}
</style>