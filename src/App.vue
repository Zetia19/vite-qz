<script>
  export default {
    name: 'App'
  }
</script>

<template>
  <RouterLink to="/">首页</RouterLink>
  <RouterLink to="/about">关于</RouterLink>
  <RouterLink to="/welcome">欢迎</RouterLink>
  <RouterLink to="/login">登录</RouterLink>
  <router-view></router-view>

</template>

<style scoped>

</style>
