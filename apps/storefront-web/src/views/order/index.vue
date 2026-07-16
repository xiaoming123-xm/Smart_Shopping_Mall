<template>
  <div class="orders">
    <aside class="side">
      <router-link to="/home">我的商城</router-link>
      <router-link to="/cart">我的购物车</router-link>
      <router-link to="/order" class="active">我的订单</router-link>
      <router-link to="/member">个人资料</router-link>
    </aside>

    <section class="main">
      <div class="tabs">
        <button v-for="t in tabs" :key="t.key" :class="{ on: active === t.key }" @click="active = t.key">{{ t.label }}</button>
      </div>

      <div v-if="syncing" class="empty">正在从 MySQL 加载订单...</div>
      <div v-else-if="filtered.length" class="list">
        <article v-for="o in filtered" :key="o.id" class="order-card">
          <header>
            <span>{{ dateOnly(o.createdAt) }}</span>
            <b>订单号：{{ o.orderNo }}</b>
            <em>{{ o.statusText }}</em>
          </header>
          <div class="order-body">
            <div class="goods">
              <div v-for="it in o.items" :key="`${o.id}-${it.product.skuId || it.product.id}`" class="good">
                <img :src="it.product.cover" :alt="it.product.name" />
                <div>
                  <h3>{{ it.product.name }}</h3>
                  <p>规格：{{ it.product.variants[0]?.label || "默认款" }}</p>
                  <button v-if="canRefund(o.status)" @click="requestRefund(o.id, it.product.name)">申请退货</button>
                  <span v-else-if="o.status === 'REFUND_REQUESTED'" class="refund-state">退货处理中</span>
                  <span v-else-if="o.status === 'REFUNDED'" class="refund-state success">商家已同意退货，钱已退回。</span>
                  <span v-else-if="o.status === 'REFUND_REJECTED'" class="refund-state">退货未通过</span>
                </div>
              </div>
            </div>
            <div class="price">¥{{ money(o.amount) }}<small>x{{ itemCount(o) }}</small></div>
            <div class="paid">实付款 <b>¥{{ money(o.amount) }}</b></div>
            <div class="actions">
              <router-link v-if="o.status === 'CREATED'" :to="`/payment/${o.id}`" class="primary">去支付</router-link>
              <button v-if="o.status === 'SHIPPED'" class="primary" @click="receive(o.id)">确认收货</button>
              <button v-if="o.status === 'RECEIVED'" class="primary" @click="openReview(o.id)">去评价</button>
              <button v-if="o.logisticsTraces.length" @click="openLogistics(o.id)">查看物流</button>
            </div>
          </div>
        </article>
      </div>
      <div v-else class="empty">还没有订单，<router-link to="/home">去下单</router-link></div>
    </section>

    <div v-if="logisticsOrder" class="modal">
      <div class="modal-panel">
        <button class="x" @click="logisticsId = ''">×</button>
        <h2>物流轨迹</h2>
        <p class="ship">包裹 {{ logisticsOrder.trackingNo || "SF123456465" }} · {{ logisticsOrder.logisticsCompany || "顺丰速运" }}</p>
        <ul class="timeline">
          <li v-for="t in logisticsOrder.logisticsTraces" :key="t.time + t.content">
            <b>{{ t.time }}</b>
            <span>{{ t.content }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="reviewOrder" class="modal">
      <div class="modal-panel review">
        <button class="x" @click="reviewId = ''">×</button>
        <h2>订单评价</h2>
        <div class="stars">
          <button v-for="n in 5" :key="n" :class="{ on: n <= rating }" @click="rating = n">★</button>
        </div>
        <textarea v-model="reviewText" placeholder="写下你的使用感受"></textarea>
        <button class="submit" @click="submitReview">提交评价</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useOrderStore, type OrderRecord, type OrderStatus } from "@/stores/order";
import { receiveOrderFlow, requestRefundFlow, reviewOrderFlow } from "@/use-cases/orderFlow";
import { syncOrdersFromBackend } from "@/use-cases/orderSync";

const orderStore = useOrderStore();
const active = ref<"ALL" | OrderStatus>("ALL");
const logisticsId = ref("");
const reviewId = ref("");
const rating = ref(5);
const reviewText = ref("东西很不错，很满意，下次还会光临。");
const syncing = ref(true);

const tabs: Array<{ key: "ALL" | OrderStatus; label: string }> = [
  { key: "ALL", label: "所有订单" },
  { key: "CREATED", label: "待付款" },
  { key: "PAID", label: "待发货" },
  { key: "SHIPPED", label: "待收货" },
  { key: "RECEIVED", label: "待评价" },
  { key: "REFUND_REQUESTED", label: "退货中" },
];

const filtered = computed(() => (active.value === "ALL" ? orderStore.orders : orderStore.orders.filter((o) => o.status === active.value)));
const logisticsOrder = computed(() => (logisticsId.value ? orderStore.getOrder(logisticsId.value) : undefined));
const reviewOrder = computed(() => (reviewId.value ? orderStore.getOrder(reviewId.value) : undefined));

const money = (n: number) => Number(n).toFixed(2);
const dateOnly = (v: string) => v.split(" ")[0] || v;
const itemCount = (o: OrderRecord) => o.items.reduce((sum, it) => sum + it.qty, 0);

function canRefund(status: OrderStatus) {
  return status === "PAID" || status === "SHIPPED" || status === "RECEIVED";
}

async function requestRefund(orderId: string, productName: string) {
  await requestRefundFlow(orderId, productName);
  window.alert("已提交退货/退款申请，等待商家处理。");
}

async function receive(id: string) {
  await receiveOrderFlow(id);
}

function openLogistics(id: string) {
  logisticsId.value = id;
}

function openReview(id: string) {
  reviewId.value = id;
  rating.value = 5;
  reviewText.value = "东西很不错，很满意，下次还会光临。";
}

async function submitReview() {
  if (!reviewId.value) return;
  await reviewOrderFlow(reviewId.value, rating.value, reviewText.value);
  reviewId.value = "";
}

onMounted(() => {
  syncOrdersFromBackend().catch(() => null).finally(() => { syncing.value = false; });
});
</script>

<style scoped>
.orders { display: grid; grid-template-columns: 180px 1fr; gap: 24px; }
.side { display: flex; flex-direction: column; gap: 20px; padding-top: 22px; font-size: 16px; }
.side a { color: #333; text-decoration: none; }
.side .active { color: #ef5d67; font-weight: 700; }
.main { min-width: 0; }
.tabs { display: flex; gap: 48px; height: 54px; align-items: center; border-bottom: 1px solid #ddd; margin-bottom: 22px; }
.tabs button { border: none; background: transparent; height: 54px; font-size: 16px; cursor: pointer; color: #333; }
.tabs button.on { color: #ef5d67; border-bottom: 3px solid #ef5d67; font-weight: 700; }
.order-card { background: #fff; margin-bottom: 18px; border-radius: 6px; overflow: hidden; border: 1px solid #eee; }
.order-card header { height: 48px; background: #eee; display: flex; align-items: center; gap: 22px; padding: 0 16px; color: #555; }
.order-card header b { flex: 1; font-weight: 500; }
.order-card header em { color: #df6e45; font-style: normal; font-weight: 700; }
.order-body { display: grid; grid-template-columns: 1fr 150px 170px 130px; gap: 20px; padding: 18px; align-items: center; }
.good { display: flex; align-items: center; gap: 14px; }
.good img { width: 78px; height: 78px; object-fit: cover; border-radius: 5px; background: #f5f5f5; }
.good h3 { margin: 0 0 8px; color: #df6e72; font-size: 15px; }
.good p { margin: 0 0 8px; color: #888; font-size: 13px; }
.good button, .actions button, .actions a { border: 1px solid #e4e4e4; background: #fff; color: #666; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-size: 14px; text-decoration: none; }
.refund-state { display: inline-block; color: #d9822b; font-size: 13px; font-weight: 700; }
.refund-state.success { color: #16a34a; }
.price { color: #d61f3c; font-size: 16px; font-weight: 700; text-align: right; }
.price small { display: block; color: #999; margin-top: 6px; }
.paid { text-align: right; color: #333; }
.paid b { color: #d61f3c; font-size: 18px; }
.actions { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.actions .primary { background: #ef5d67; color: #fff; border-color: #ef5d67; }
.empty { text-align: center; padding: 80px; color: #999; }
.empty a { color: #ef5d67; }
.modal { position: fixed; inset: 0; background: rgba(0,0,0,.28); display: flex; align-items: center; justify-content: center; z-index: 60; }
.modal-panel { width: 560px; max-width: calc(100vw - 32px); background: #fff; border-radius: 8px; padding: 26px; position: relative; box-shadow: 0 12px 40px rgba(0,0,0,.25); }
.x { position: absolute; top: 12px; right: 14px; border: none; background: transparent; font-size: 28px; color: #999; cursor: pointer; }
.ship { color: #666; margin-bottom: 16px; }
.timeline { margin: 0; padding-left: 22px; }
.timeline li { margin: 14px 0; color: #333; }
.timeline b { display: block; color: #666; margin-bottom: 4px; }
.review { width: 460px; }
.stars button { border: none; background: transparent; font-size: 28px; color: #ddd; cursor: pointer; }
.stars button.on { color: #f7b733; }
textarea { width: 100%; height: 120px; border: 1px solid #ddd; border-radius: 6px; padding: 12px; resize: none; margin: 14px 0; font-size: 14px; box-sizing: border-box; }
.submit { width: 100%; height: 42px; border: none; background: #ef5d67; color: #fff; border-radius: 5px; cursor: pointer; font-size: 16px; }
@media (max-width: 900px) {
  .orders { grid-template-columns: 1fr; }
  .side { flex-direction: row; flex-wrap: wrap; padding-top: 0; }
  .tabs { gap: 16px; overflow-x: auto; }
  .order-body { grid-template-columns: 1fr; align-items: start; }
  .price, .paid { text-align: left; }
  .actions { align-items: flex-start; }
}
</style>
