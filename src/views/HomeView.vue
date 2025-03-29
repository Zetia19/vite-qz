<template>
  <div class="basic-layout"> 
    <div class="nav-side"></div>
    <div class="content-right">
      <div class="nav-top">
        <div class="bread">面包屑</div>
        <div class="user-">用户</div>
      </div>
      <div class="wrapper">
        <div class="main-page">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api/index';

export default {
    name: 'HomeView',

  //   // axios網路請求
  //   mounted() {
  //   api.getGoodsList()
  //   .then(res => {
  //     console.log(res.data);
  //   })
  //   .catch(error => {
  //   console.error("请求失败:", error);
  //  })
  // }

}
</script>

<style lang="scss">
#app{
  padding: 0;
  max-width: 100%;
}
body{
  display: block;
}
.basic-layout {
   position: relative;
   .nav-side {
     position: fixed;
     width: 200px;
     height: 100vh; 
     background-color: #001529;
     color: #fff;
     overflow-y: auto;
     transition: width 0.5s;

   } 
   .content-right {
      margin-left: 200px;
      .nav-top{
        height: 50px;
        line-height: 50px;
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #ddd;
        padding: 0 20px;
      }
      .wrapper{
       background: #eef0f3;
       padding: 20px;
       height: calc(100vh - 50px);  //计算属性 
       .main-page{
        background: #fff;
        height: 100%;
       }
      }
   }
}
</style>