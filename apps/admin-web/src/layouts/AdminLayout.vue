<template>
  <el-container class="admin-layout">
    <el-aside width="220px" class="aside">
      <div class="logo">Smart_Shopping_Mall</div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#1f2937"
        text-color="#cbd5e1"
        active-text-color="#ffffff"
      >
        <el-menu-item index="/home"><el-icon><HomeFilled /></el-icon><span>首页</span></el-menu-item>
        <el-menu-item index="/admin/selection"><el-icon><TrendCharts /></el-icon><span>选品中心</span></el-menu-item>
        <el-sub-menu index="catalog">
          <template #title><el-icon><Goods /></el-icon><span>商品中心</span></template>
          <el-menu-item index="/catalog/category">分类管理</el-menu-item>
          <el-menu-item index="/catalog/brand">品牌管理</el-menu-item>
          <el-menu-item index="/catalog/attribute">属性管理</el-menu-item>
          <el-menu-item index="/catalog/product">商品管理</el-menu-item>
          <el-menu-item index="/catalog/product-ai">AI内容生成</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/inventory"><el-icon><Box /></el-icon><span>库存管理</span></el-menu-item>
        <el-sub-menu index="order">
          <template #title><el-icon><List /></el-icon><span>订单</span></template>
          <el-menu-item index="/order">订单管理</el-menu-item>
          <el-menu-item index="/order/review">订单评价</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/payment"><el-icon><Money /></el-icon><span>支付管理</span></el-menu-item>
        <el-menu-item index="/payment/prompt"><el-icon><Document /></el-icon><span>提示词管理</span></el-menu-item>
        <el-sub-menu index="system">
          <template #title><el-icon><Setting /></el-icon><span>系统管理</span></template>
          <el-menu-item index="/system/user">用户管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="title">{{ pageTitle }}</div>
        <el-dropdown @command="onCommand">
          <span class="user">
            {{ auth.nickname || auth.username || "未登录" }}
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import { logoutUseCase } from "@/use-cases/auth.uc";
import { Document } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const activeMenu = computed(() => route.path);
const pageTitle = computed(() => (route.meta.title as string) || "Smart_Shopping_Mall后台管理");

async function onCommand(cmd: string) {
  if (cmd === "logout") {
    await ElMessageBox.confirm("确认退出登录吗？", "提示", { type: "warning" }).catch(() => null);
    await logoutUseCase();
    auth.clear();
    ElMessage.success("已退出");
    router.push("/login");
  }
}
</script>

<style scoped>
.admin-layout { height: 100vh; }
.aside { background: #1f2937; }
.logo { color: #fff; font-weight: 700; font-size: 16px; height: 56px; line-height: 56px; text-align: center; letter-spacing: .5px; border-bottom: 1px solid #374151; }
.header { display: flex; align-items: center; justify-content: space-between; background: #fff; border-bottom: 1px solid #e5e7eb; }
.title { font-size: 18px; font-weight: 600; color: #111827; }
.user { cursor: pointer; display: inline-flex; align-items: center; gap: 4px; color: #374151; }
.main { background: #f3f4f6; padding: 16px; }
.el-menu { border-right: none; }
</style>
