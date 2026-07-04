<template>
  <transition name="drop">
    <section v-if="open" class="ai-shell">
      <div class="ai-panel">
        <header class="ai-head">
          <div class="robot">▣</div>
          <h2>AI智能购物助手</h2>
          <button @click="emit('update:open', false)">×</button>
        </header>

        <main ref="bodyEl" class="ai-body">
          <div class="more">没有更多数据了</div>
          <div v-for="(m, i) in messages" :key="i" :class="['bubble-row', m.role]">
            <div v-if="m.text" class="bubble">{{ m.text }}</div>

            <article v-if="m.kind === 'products'" class="rich-card">
              <h3>以下是为你推荐的商品</h3>
              <div class="product-cards">
                <router-link v-for="p in m.products" :key="p.id" :to="`/product/${p.id}`" class="product-card">
                  <img :src="p.cover" :alt="p.name" />
                  <h4>{{ p.name }}</h4>
                  <div><b>¥{{ money(p.price) }}</b><span>{{ p.buyers }}人购买</span></div>
                </router-link>
              </div>
            </article>

            <article v-if="m.kind === 'orders'" class="rich-card order-card">
              <h3>以下是为你查询的近15天的订单信息</h3>
              <div v-for="o in m.orders" :key="o.id" class="order-mini">
                <header><b>{{ dateOnly(o.createdAt) }}　订单号：{{ o.orderNo }}</b><em>{{ o.statusText }}</em></header>
                <div class="order-mini-body">
                  <img :src="o.items[0]?.product.cover" :alt="o.items[0]?.product.name" />
                  <div class="order-name">
                    <h4>{{ o.items[0]?.product.name }}</h4>
                    <p>颜色分类：{{ o.items[0]?.product.variants[0]?.label || "默认款" }}</p>
                  </div>
                  <strong>¥{{ money(o.amount) }}<small>x{{ countItems(o) }}</small></strong>
                  <span>实付款 <b>¥{{ money(o.amount) }}</b></span>
                </div>
              </div>
            </article>

            <article v-if="m.kind === 'logistics'" class="rich-card">
              <h3>📦 最新状态</h3>
              <ul class="trace-list">
                <li v-for="t in m.order?.logisticsTraces" :key="t.time + t.content">
                  <span>{{ t.time }}</span>
                  <b>{{ t.content }}</b>
                </li>
              </ul>
              <p class="receiver" v-if="m.order">收件信息：{{ m.order.receiver }} | 电话：{{ maskPhone(m.order.receiverPhone) }} | 地址：{{ m.order.address }}</p>
            </article>
          </div>
        </main>

        <footer class="ai-input">
          <div class="quick">
            <span>试试这样说</span>
            <button v-for="q in quickQuestions" :key="q" @click="ask(q)">{{ q }}</button>
          </div>
          <div class="input-row">
            <input v-model="draft" placeholder="请输入你的问题" @keyup.enter="send" />
            <button :disabled="loading" @click="send">↑</button>
          </div>
        </footer>
      </div>
    </section>
  </transition>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import { askShoppingGuide, listProducts } from "@/api/mall";
import type { Product } from "@/api/mock";
import { useOrderStore, type OrderRecord } from "@/stores/order";

interface AiMessage {
  role: "user" | "ai";
  text?: string;
  kind?: "products" | "orders" | "logistics";
  products?: Product[];
  orders?: OrderRecord[];
  order?: OrderRecord;
}

defineProps<{ open: boolean }>();
const emit = defineEmits<{ "update:open": [value: boolean] }>();

const orderStore = useOrderStore();
const draft = ref("");
const loading = ref(false);
const products = ref<Product[]>([]);
const bodyEl = ref<HTMLElement>();
const quickQuestions = ["我要买一双红色的运动鞋", "我的订单", "我要申请退款", "我的订单到哪里了", "我要给我的订单一个好评"];
const messages = ref<AiMessage[]>([
  { role: "ai", text: "我是您的专属购物助手，有什么可以帮您？" },
]);

const money = (n: number) => Number(n).toFixed(2);
const dateOnly = (v: string) => v.split(" ")[0] || v;
const countItems = (o: OrderRecord) => o.items.reduce((sum, it) => sum + it.qty, 0);
const maskPhone = (phone: string) => phone.replace(/^(\d{3})\d+(\d{4})$/, "$1****$2");

onMounted(async () => {
  products.value = await listProducts();
});

async function send() {
  await ask(draft.value);
}

async function ask(question: string) {
  const q = question.trim();
  if (!q || loading.value) return;
  messages.value.push({ role: "user", text: q });
  draft.value = "";
  loading.value = true;
  await respond(q);
  loading.value = false;
  await nextTick();
  if (bodyEl.value) bodyEl.value.scrollTop = bodyEl.value.scrollHeight;
}

async function respond(q: string) {
  if (q.includes("订单到哪里") || q.includes("物流") || q.includes("到哪")) {
    const latest = orderStore.latest;
    if (!latest) {
      messages.value.push({ role: "ai", text: "暂时没有可查询的订单。你可以先下单并支付，再查看物流。" });
      return;
    }
    if (!latest.logisticsTraces.length) {
      messages.value.push({ role: "ai", text: `订单 ${latest.orderNo} 当前为「${latest.statusText}」，暂时还没有物流轨迹。` });
      return;
    }
    messages.value.push({ role: "ai", text: `您的包裹（${latest.logisticsCompany || "顺丰单号"}：${latest.trackingNo || "SF123456465"}）已更新。`, kind: "logistics", order: latest });
    return;
  }

  if (q.includes("我的订单") || q.includes("订单")) {
    if (!orderStore.orders.length) {
      messages.value.push({ role: "ai", text: "近 15 天还没有订单。你可以先从首页选一件商品下单。" });
      return;
    }
    messages.value.push({ role: "ai", text: "已为你查询最近订单。", kind: "orders", orders: orderStore.orders.slice(0, 3) });
    return;
  }

  if (q.includes("好评") || q.includes("评价")) {
    const target = orderStore.orders.find((o) => o.status === "RECEIVED") || orderStore.latest;
    messages.value.push({
      role: "ai",
      text: target
        ? `可以的。订单「${target.orderNo}」当前为「${target.statusText}」，如果已确认收货，可在“我的订单”里点击“去评价”提交五星好评。`
        : "还没有可评价订单。请先完成下单、支付、发货和确认收货。",
    });
    return;
  }

  if (q.includes("退款")) {
    messages.value.push({ role: "ai", text: "可以在“我的订单”中点击退款。当前版本已保留退款入口，后续可接入后台退款审核和支付退款单。" });
    return;
  }

  if (q.includes("买") || q.includes("推荐") || q.includes("运动鞋") || q.includes("真迹")) {
    const hits = products.value.filter((p) => q.includes(p.category) || q.includes(p.name.slice(0, 2)) || p.tags.some((tag) => q.includes(tag))).slice(0, 2);
    messages.value.push({ role: "ai", kind: "products", products: hits.length ? hits : products.value.slice(0, 2) });
    return;
  }

  const answer = await askShoppingGuide(q);
  messages.value.push({ role: "ai", text: answer });
}
</script>

<style scoped>
.ai-shell { position: fixed; inset: 78px 0 auto; z-index: 35; display: flex; justify-content: center; pointer-events: none; }
.ai-panel { width: min(980px, calc(100vw - 48px)); height: min(760px, calc(100vh - 96px)); background: #fff; border-radius: 10px 10px 0 0; box-shadow: 0 12px 40px rgba(0,0,0,.18); display: grid; grid-template-rows: 72px 1fr 148px; pointer-events: auto; overflow: hidden; border: 1px solid #eee; }
.ai-head { background: linear-gradient(100deg, #ff5f68 0%, #a96be0 100%); color: #fff; display: flex; align-items: center; gap: 16px; padding: 0 22px; }
.robot { width: 34px; height: 34px; border: 2px solid #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; }
.ai-head h2 { margin: 0; flex: 1; font-size: 22px; }
.ai-head button { border: none; background: transparent; color: #fff; font-size: 28px; cursor: pointer; }
.ai-body { overflow-y: auto; padding: 0 20px 20px; display: flex; flex-direction: column; gap: 16px; }
.more { text-align: center; color: #bbb; font-weight: 700; padding: 18px 0 6px; }
.bubble-row { display: flex; flex-direction: column; }
.bubble-row.user { align-items: flex-end; }
.bubble-row.ai { align-items: flex-start; }
.bubble { max-width: 72%; padding: 12px 18px; border-radius: 12px; line-height: 1.55; font-size: 16px; }
.bubble-row.user .bubble { background: #6a8eed; color: #fff; }
.bubble-row.ai .bubble { background: #f3f5f9; color: #333; }
.rich-card { width: 100%; border: 1px solid #e3e6ec; border-radius: 6px; background: #fff; overflow: hidden; }
.rich-card h3 { margin: 0; padding: 14px 16px; background: #f8f8f8; font-size: 17px; color: #222; }
.product-cards { padding: 14px 16px 18px; display: grid; grid-template-columns: repeat(3, 150px); gap: 18px; }
.product-card { color: #222; }
.product-card img { width: 140px; height: 140px; border-radius: 6px; object-fit: cover; background: #f5f5f5; }
.product-card h4 { width: 150px; margin: 8px 0; font-size: 16px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.product-card div { display: flex; justify-content: space-between; align-items: center; width: 150px; }
.product-card b, .order-mini strong, .order-mini span b { color: #d61f3c; font-size: 18px; }
.product-card span { color: #999; }
.order-card { padding-bottom: 12px; }
.order-mini { margin: 14px 16px; border: 1px solid #eee; border-radius: 6px; overflow: hidden; }
.order-mini header { height: 44px; background: #eee; display: flex; align-items: center; justify-content: space-between; padding: 0 14px; color: #555; }
.order-mini em { color: #df6e45; font-style: normal; font-weight: 700; }
.order-mini-body { display: grid; grid-template-columns: 82px 1fr 120px 170px; gap: 18px; align-items: center; padding: 14px; }
.order-mini-body img { width: 74px; height: 74px; border-radius: 5px; object-fit: cover; }
.order-name h4 { margin: 0 0 8px; color: #df6e72; }
.order-name p { margin: 0; color: #888; }
.order-mini strong small { display: block; color: #999; text-align: right; margin-top: 4px; }
.trace-list { padding: 10px 24px 4px 34px; margin: 0; }
.trace-list li { margin: 12px 0; }
.trace-list span { display: block; color: #667085; margin-bottom: 4px; }
.trace-list b { color: #2f3a4a; }
.receiver { padding: 0 24px 20px; color: #667085; }
.ai-input { border-top: 1px solid #e5e7eb; background: #fff; padding: 14px 22px; }
.quick { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.quick span { color: #666; margin-right: 4px; }
.quick button { border: none; background: #effbe8; color: #69bd67; padding: 7px 14px; border-radius: 5px; cursor: pointer; font-weight: 700; }
.input-row { display: grid; grid-template-columns: 1fr 44px; gap: 12px; align-items: center; }
.input-row input { height: 40px; border: none; outline: none; font-size: 17px; color: #333; }
.input-row button { width: 42px; height: 42px; border-radius: 50%; border: none; background: #20b9a8; color: #fff; font-size: 24px; cursor: pointer; }
.input-row button:disabled { opacity: .6; cursor: not-allowed; }
.drop-enter-active, .drop-leave-active { transition: opacity .18s ease, transform .18s ease; }
.drop-enter-from, .drop-leave-to { opacity: 0; transform: translateY(-16px); }
@media (max-width: 760px) {
  .ai-shell { top: 160px; }
  .ai-panel { width: calc(100vw - 20px); height: calc(100vh - 180px); grid-template-rows: 64px 1fr 178px; }
  .product-cards { grid-template-columns: repeat(2, 1fr); }
  .order-mini-body { grid-template-columns: 70px 1fr; }
  .order-mini strong, .order-mini span { grid-column: 2; }
}
</style>
