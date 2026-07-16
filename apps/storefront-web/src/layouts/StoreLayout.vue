<template>
  <div class="store">
    <header class="topbar">
      <router-link to="/home" class="brand">
        <span class="brand-mark">购</span>
        <b>EasyMall 智慧商城</b>
      </router-link>

      <div class="search">
        <input v-model="keyword" placeholder="搜索商品" @keyup.enter="goSearch" />
        <button @click="goSearch">搜</button>
      </div>

      <nav class="right-nav">
        <button :class="['ai-entry', { on: aiOpen }]" @click="aiOpen = !aiOpen">AI智能购物</button>
        <router-link to="/messages" class="message-entry" title="用户消息">消息</router-link>
        <router-link to="/cart" class="cart-entry" title="购物车">
          🛅<span v-if="cart.count" class="badge">{{ cart.count }}</span>
        </router-link>
        <router-link to="/member" class="avatar" title="个人中心">用户</router-link>
      </nav>
    </header>

    <AiAssistant v-model:open="aiOpen" />
    <main class="content"><router-view /></main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "@/stores/cart";
import AiAssistant from "@/components/AiAssistant.vue";
import { syncOrdersFromBackend } from "@/use-cases/orderSync";

const cart = useCartStore();
const router = useRouter();
const aiOpen = ref(false);
const keyword = ref("");

function goSearch() {
  router.push("/home");
}

onMounted(() => {
  syncOrdersFromBackend().catch(() => null);
});
</script>

<style scoped>
.store { min-height: 100vh; background: #fff; }
.topbar { height: 78px; background: rgba(255,255,255,.96); box-shadow: 0 1px 8px rgba(0,0,0,.15); display: grid; grid-template-columns: 270px minmax(320px, 560px) 1fr; align-items: center; gap: 26px; padding: 0 max(36px, calc((100vw - 1500px) / 2)); position: sticky; top: 0; z-index: 40; }
.brand { display: flex; align-items: center; gap: 12px; color: #1f1f1f; }
.brand-mark { width: 42px; height: 42px; border-radius: 50%; background: #caa361; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; }
.brand b { font-size: 20px; white-space: nowrap; }
.search { height: 46px; display: grid; grid-template-columns: 1fr 54px; border: 1px solid #dcdfe6; border-radius: 6px; overflow: hidden; background: #fff; }
.search input { border: none; padding: 0 18px; font-size: 15px; outline: none; }
.search button { border: none; background: #ef5d67; color: #fff; font-size: 18px; cursor: pointer; }
.right-nav { display: flex; align-items: center; justify-content: flex-end; gap: 22px; }
.ai-entry { border: none; background: #ef5d67; color: #fff; height: 38px; padding: 0 18px; border-radius: 20px; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 8px rgba(239,93,103,.28); }
.ai-entry.on { background: #d94c58; }
.message-entry { height: 38px; padding: 0 16px; border-radius: 20px; background: #f7f7f7; color: #444; display: inline-flex; align-items: center; justify-content: center; }
.cart-entry { position: relative; font-size: 25px; line-height: 1; }
.badge { position: absolute; top: -10px; right: -12px; min-width: 18px; height: 18px; border-radius: 9px; background: #ef5d67; color: #fff; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; padding: 0 4px; }
.avatar { width: 54px; height: 54px; border-radius: 50%; background: #2f95bd; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; }
.content { max-width: 1500px; width: 100%; margin: 0 auto; padding: 18px 24px 48px; box-sizing: border-box; }
@media (max-width: 980px) {
  .topbar { grid-template-columns: 1fr; height: auto; padding: 14px 18px; gap: 12px; }
  .right-nav { justify-content: flex-start; }
  .brand b { font-size: 18px; }
}
</style>
