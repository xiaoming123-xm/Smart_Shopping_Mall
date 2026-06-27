<template>
  <div v-if="order" class="pay">
    <h2>订单支付</h2>
    <div class="card">
      <div class="line"><span>订单号</span><b>{{ order.id }}</b></div>
      <div class="line"><span>下单时间</span><span>{{ order.createdAt }}</span></div>
      <div class="line"><span>资金状态</span><span :class="statusClass">{{ order.payStatus }}</span></div>
      <div class="amount">应付金额 <b>¥{{ order.amount }}</b></div>
      <div v-if="order.payStatus === '待支付'" class="methods">
        <button class="m" @click="doPay">💰 模拟支付</button>
      </div>
      <div v-else class="paid">✓ 支付完成，正在跳转订单…</div>
    </div>
    <p class="note">说明：业务单(订单)与资金单(支付)分离记账，支付成功后资金状态置为「已支付」。</p>
  </div>
  <div v-else class="empty">订单不存在</div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useOrderStore } from "@/stores/order";
import { payOrder } from "@/use-cases/payOrder";
const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const order = computed(() => orderStore.getOrder(String(route.params.orderId)));
const statusClass = computed(() => order.value?.payStatus === "已支付" ? "ok" : "wait");
function doPay() {
  const id = String(route.params.orderId);
  payOrder(id, router);
}
</script>
<style scoped>
.pay { max-width: 520px; margin: 0 auto; }
h2 { margin-bottom: 18px; }
.card { background: #fff; border-radius: 12px; padding: 28px; }
.line { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #eee; color: #666; }
.ok { color: #52c41a; font-weight: 700; }
.wait { color: #faad14; font-weight: 700; }
.amount { text-align: right; margin: 20px 0; font-size: 16px; color: #666; }
.amount b { color: #ff4d4f; font-size: 30px; }
.methods { display: flex; justify-content: center; }
.m { background: #ff4d4f; color: #fff; border: none; padding: 14px 50px; border-radius: 26px; font-size: 17px; cursor: pointer; }
.paid { text-align: center; color: #52c41a; font-size: 16px; }
.note { color: #999; font-size: 12px; margin-top: 16px; line-height: 1.6; }
.empty { text-align: center; padding: 80px; color: #999; }
</style>