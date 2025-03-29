<script>
  export default {
    name: 'App',
    mounted() {
      this.$storage.setItem('name', 'zetia');
      this.$storage.setItem('userInfo', {age:19,sex:'女'})
      console.log('user=>',this.$storage.getItem('userInfo'));
      // this.$storage.clearItem('age');
      this.$storage.clearAll();
    }
  }
</script>

<template>
<!-- <h3>全栈后台管理</h3> -->
<router-view></router-view>
</template>

<style lang="scss">
@use './assets/style/index.scss';
@import './assets/style/reset.css';

*{
  padding: 0;
}
</style>
