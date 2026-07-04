<template>
  <div class="member">
    <div class="profile">
      <div class="avatar">👤</div>
      <div>
        <h2>体验用户</h2>
        <p class="uid">UID: 100001 ｜ 普通会员</p>
      </div>
    </div>
    <div class="stats">
      <div class="stat"><b>{{ orderStore.orders.length }}</b><span>全部订单</span></div>
      <div class="stat"><b>{{ unpaid }}</b><span>待支付</span></div>
      <div class="stat"><b>{{ completed }}</b><span>已完成</span></div>
      <div class="stat"><b>¥{{ totalSpent }}</b><span>累计消费</span></div>
    </div>
    <div class="menu">
      <router-link to="/order" class="mi">📦 我的订单</router-link>
      <router-link to="/cart" class="mi">🛒 购物车</router-link>
      <router-link to="/home" class="mi">🏠 返回首页</router-link>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useOrderStore } from "@/stores/order";
const orderStore = useOrderStore();
const unpaid = computed(() => orderStore.orders.filter(o => o.status === "CREATED").length);
const completed = computed(() => orderStore.orders.filter(o => o.status === "COMPLETED").length);
const totalSpent = computed(() => orderStore.orders.filter(o => o.status !== "CREATED" && o.status !== "CANCELLED").reduce((s, o) => s + o.amount, 0));
</script>
<style scoped>
.profile { background: #fff; border-radius: 12px; padding: 24px; display: flex; align-items: center; gap: 18px; margin-bottom: 16px; }
.avatar { width: 64px; height: 64px; border-radius: 50%; background: #f0f2f5; display: flex; align-items: center; justify-content: center; font-size: 32px; }
.uid { color: #999; font-size: 13px; margin-top: 4px; }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.stat { background: #fff; border-radius: 10px; padding: 20px; text-align: center; }
.stat b { display: block; font-size: 24px; color: #ff4d4f; }
.stat span { color: #999; font-size: 13px; }
.menu { background: #fff; border-radius: 12px; overflow: hidden; }
.mi { display: block; padding: 16px 20px; border-bottom: 1px solid #f5f5f5; }
.mi:hover { background: #fafafa; }
</style>
