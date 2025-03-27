<template>
    <h3>首页面</h3>
    <router-view></router-view>
</template>

<script>
import api from '../api/index';

export default {
    name: 'HomeView',

    // axios網路請求
    mounted() {
    api.getGoodsList()
    .then(res => {
      console.log(res.data);
    })
    .catch(error => {
    console.error("请求失败:", error);
   })
  }

}
</script>