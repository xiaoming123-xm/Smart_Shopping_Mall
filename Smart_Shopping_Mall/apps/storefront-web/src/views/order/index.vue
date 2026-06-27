<template>
  <div class="orders">
    <h2>我的订单</h2>
    <div v-if="orderStore.orders.length" class="list">
      <div v-for="o in orderStore.orders" :key="o.id" class="order">
        <div class="head">
          <span>订单号：{{ o.id }}</span>
          <span :class="o.payStatus === '已支付' ? 'ok' : 'wait'">{{ o.payStatus }}</span>
        </div>
        <div class="goods">
          <div v-for="it in o.items" :key="it.product.id" class="g">
            <span class="cv">{{ it.product.cover }}</span>
            <span class="nm">{{ it.product.name }}</span>
            <span class="qt">×{{ it.qty }}</span>
          </div>
        </div>
        <div class="foot">
          <span class="time">{{ o.createdAt }}</span>
          <span>实付 <b class="amt">¥{{ o.amount }}</b></span>
          <router-link v-if="o.payStatus === '待支付'" :to="`/payment/${o.id}`" class="topay">去支付</router-link>
        </div>
      </div>
    </div>
    <div v-else class="empty">还没有订单，<router-link to="/home">去下单 →</router-link></div>
  </div>
</template>
<script setup lang="ts">
import { useOrderStore } from "@/stores/order";
const orderStore = useOrderStore();
</script>
<style scoped>
.orders h2 { margin-bottom: 18px; }
.order { background: #fff; border-radius: 10px; padding: 16px 20px; margin-bottom: 14px; }
.head { display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 13px; }
.ok { color: #52c41a; font-weight: 700; }
.wait { color: #faad14; font-weight: 700; }
.goods { padding: 10px 0; }
.g { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
.cv { font-size: 24px; }
.nm { flex: 1; }
.qt { color: #999; }
.foot { display: flex; justify-content: flex-end; align-items: center; gap: 18px; padding-top: 10px; border-top: 1px solid #f0f0f0; }
.time { margin-right: auto; color: #999; font-size: 12px; }
.amt { color: #ff4d4f; font-size: 18px; }
.topay { background: #ff4d4f; color: #fff; padding: 6px 18px; border-radius: 16px; font-size: 13px; }
.empty { text-align: center; padding: 60px; color: #999; }
.empty a { color: #ff4d4f; }
</style>