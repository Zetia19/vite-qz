<template>
    <template v-for="menu in userMenu">
        <el-sub-menu 
            v-if="menu.children && 
            menu.children.length>0 && 
            menu.children[0].menuType == 1" 
            :key="menu._id" 
            :index="menu.path">
                <template #title>
                    <el-icon>
                        <component :is="menu.icon || 'el-icon'" />
                    </el-icon>
                    <span>{{ menu.menuName }}</span>
                </template>
                <!-- 当前组件自身的递归调用 -->
                <tree-menu :userMenu="menu.children"></tree-menu>
        </el-sub-menu>
        <!-- 当菜单项没有子级，作为普通菜单项展示 -->
        <el-menu-item v-else-if="menu.menuType == 1" :index="menu.path">
            {{ menu.menuName }}
        </el-menu-item>
    </template>  
</template>
<script>
export default{
    name:'TreeMenu',
    props:{
        userMenu:{
            type:Array,
            default(){
                return []
            }
        }
    },
}
</script>