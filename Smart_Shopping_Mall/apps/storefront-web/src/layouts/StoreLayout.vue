<template>
  <div class="store">
    <header class="topbar">
      <router-link to="/home" class="brand">🛒 Smart_Shopping_Mall</router-link>
      <nav class="nav">
        <router-link to="/home">首页</router-link>
        <router-link to="/order">我的订单</router-link>
        <router-link to="/member">个人中心</router-link>
      </nav>
      <router-link to="/cart" class="cart-entry">
        购物车<span v-if="cart.count" class="badge">{{ cart.count }}</span>
      </router-link>
    </header>
    <main class="content"><router-view /></main>
    <footer class="footer">Smart_Shopping_Mall · 智能购物商城用户端 Demo</footer>
    <AiAssistant />
  </div>
</template>
<script setup lang="ts">
import { useCartStore } from "@/stores/cart";
import AiAssistant from "@/components/AiAssistant.vue";
const cart = useCartStore();
</script>
<style scoped>
.store { min-height: 100vh; display: flex; flex-direction: column; }
.topbar { height: 60px; background: #fff; box-shadow: 0 1px 6px rgba(0,0,0,.08); display: flex; align-items: center; padding: 0 32px; gap: 32px; position: sticky; top: 0; z-index: 10; }
.brand { font-size: 20px; font-weight: 700; color: #ff4d4f; }
.nav { display: flex; gap: 24px; flex: 1; }
.nav a { font-size: 15px; color: #555; padding: 4px 0; }
.nav a.router-link-active { color: #ff4d4f; border-bottom: 2px solid #ff4d4f; }
.cart-entry { position: relative; background: #ff4d4f; color: #fff; padding: 8px 18px; border-radius: 20px; font-size: 14px; }
.badge { position: absolute; top: -6px; right: -6px; background: #fff; color: #ff4d4f; border-radius: 10px; font-size: 12px; padding: 0 6px; font-weight: 700; }
.content { flex: 1; max-width: 1100px; width: 100%; margin: 0 auto; padding: 24px 16px; }
.footer { text-align: center; color: #999; font-size: 13px; padding: 20px; }
</style>