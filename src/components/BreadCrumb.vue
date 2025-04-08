<template>
    <!-- 全局注册时需要使用 ElementPlus 的官方命名前缀 el-icon- -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item v-for="(item,index) in breadList" :key="item.path">
        <router-link to="/welcome" v-if="index==0">{{ item.meta.title }}</router-link>
        <span v-else>{{ item.meta.title }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>
<script>

export default{
    name:'BreadCrumb',
    computed:{
        // 获取面包屑数据
        breadList(){
            return this.$route.matched;
        }
    },
    mounted(){
        console.log("router:",this.$route);    
    },
    
}
</script>