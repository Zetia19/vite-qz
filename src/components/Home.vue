<template>
  <div class="basic-layout"> 
    <div :class="['nav-side',isCollapse ? 'fold' : 'unfold']">
      <!-- 系统logo -->
      <div class="logo">
        <img src="../assets/logo.png" alt="">
        <span>Manager</span>
      </div>
      <!-- 导航菜单 -->
      <el-menu
        class="nav-menu"
        :default-active="activeMenu"
        background-color="#001529"
        text-color="#fff"
        :collapse="isCollapse"
        router
      >
        <tree-menu :userMenu="userMenu"></tree-menu>
      </el-menu>
    </div>
    <!-- 右侧内容区域 -->
    <div :class="['content-right',isCollapse ? 'fold' : 'unfold']">
      <div class="nav-top">
        <div class="nav-top-left">
          <div class="menu-fold" @click="toggle"><el-icon><Fold /></el-icon></div>
          <div class="bread">
            <bread-crumb></bread-crumb>
          </div>
        </div>
        
        <div class="user-info">
          <el-badge 
            :is-dot="noticeCount>0? true:false" 
            class="notice"
            @click="$router.push('/audit/approve')"
          >
            <el-icon><Bell /></el-icon>
          </el-badge>
          
          <el-dropdown @command="handleLogout" trigger="click" class="user-dropdown">
            <span class="user-link">
              {{userInfo.userName}}
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="email">邮箱：{{ userInfo.userEmail }}</el-dropdown-item>
                <el-dropdown-item command="logout">退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="wrapper">
          <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import TreeMenu from './TreeMenu.vue'
import BreadCrumb from './BreadCrumb.vue';

export default {
    name: 'HomeView',
    components:{
      TreeMenu,
      BreadCrumb,
    },
    data() {
     return {
      isCollapse: false, // 菜单是否折叠
      userInfo: this.$store.state.userInfo, // 用户信息
      // noticeCount:0 ,// 通知数量
      userMenu:[], // 菜单列表
      activeMenu:location.hash.slice(1), // 当前激活的菜单项
     }
    },
    computed:{
      noticeCount(){
        return this.$store.state.noticeCount; 
      }
    },
    mounted(){
      this.getNoticeCount(); // 获取通知数量
      this.getMenuList(); // 获取菜单列表
    },
    methods: {
      // 退出登录
      handleLogout(key) {
        if(key=='email') return;
        this.$store.commit('saveUserInfo',{}); // 清空用户信息
        this.userInfo = {}; // 清空用户信息
        this.$router.push('/login'); // 跳转到登录页面
    },
      // 菜单折叠
      toggle() {
        this.isCollapse = !this.isCollapse;
      },
      async getNoticeCount(){
        try {
          const count = await this.$api.noticeCount()
          this.$store.commit('saveNoticeCount',count)
          return count;
        } catch (error) {
          console.error('获取通知数量失败:', error);
        }
      },
      async getMenuList(){
        try {
          const {menuList,actionList} = await this.$api.getPermissionList()
          // const list = await this.$api.getMenuList()
          this.userMenu = menuList;
          this.$store.commit('saveUserMenu',menuList); // 保存菜单列表
          this.$store.commit('saveUserAction',actionList); // 保存按钮列表
        } catch (error) {
          console.error('获取菜单列表失败:', error);
        }
      }
    }

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
   overflow: hidden;
   .nav-side {
     position: fixed;
     width: 200px;
     height: 100vh; 
     background-color: #001529;
     color: #fff;
     transition: width 0.5s;
     .logo{
      display: flex;
      align-items: center;
      font-size: 18px;
      height: 50px;
      overflow: hidden;

      img{
        width: 50px;
        height: 50px;
        margin:0 10px;
      }
     }
    // 导航菜单右边有像素丢失问题，取消border-right
     .nav-menu {
      height:calc(100vh - 50px); //计算属性,减去logo高度
      border-right: none; 
     }
    //  合并
     &.fold{
      width: 64px;
     }
    // 展开
     &unfold{
      width: 200px;
     }
   } 
   // 右侧内容区域
   .content-right {
      margin-left: 200px;
      //  合并
     &.fold{
      margin-left: 64px;
     }
    // 展开
     &unfold{
      margin-left: 200px;
     }
      .nav-top{
        height: 50px;
        line-height: 50px;
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #ddd;
        padding: 0 20px;
        .nav-top-left{
          display: flex;
          align-items: center;
          .menu-fold{
            margin-top: 6.35px;
            margin-right: 10px;
            font-size: 20px;
          }
        }
        
       .user-info{
        .notice{
          margin-right: 15px;
          font-size: 20px;
          line-height: 30px;
          cursor: pointer;
        }
        .user-dropdown{
          line-height: 45px;
          cursor: pointer;
          .user-link{
            font-size: 14px;
            color: #1972ad;
            padding: 0 10px;
            border-radius: 4px;
            &:hover{
              background: #f5f5f5;
            }
         }
        } 
       }
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