<template>
    <div class="welcome">
        <h3>欢迎页面</h3>
        <router-link to="/login">去登录</router-link>
    </div>
    
</template>

<!-- <script setup>
import { defineProps } from 'vue';

defineProps({
    msg:String
})
</script> -->
<script>
export default {
    name: 'WelcomeView',
    props:['msg']
}
</script>

<style scoped>
</style>