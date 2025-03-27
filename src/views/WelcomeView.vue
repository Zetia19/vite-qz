<template>
    <h3>欢迎页面{{ msg }}</h3>
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