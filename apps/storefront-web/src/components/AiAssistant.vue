<template>
  <transition name="drop">
    <section v-if="open" class="ai-shell">
      <div class="ai-panel">
        <header class="ai-head">
          <div class="robot">AI</div>
          <h2>AI智能购物助手</h2>
          <button @click="emit('update:open', false)">×</button>
        </header>

        <main ref="bodyEl" class="ai-body">
          <div class="more">没有更多数据了</div>
          <div v-for="(m, i) in messages" :key="i" :class="['bubble-row', m.role]">
            <article v-if="m.kind === 'products'" class="rich-card">
              <h3>先看看这些商品</h3>
              <div class="product-cards">
                <router-link
                  v-for="p in m.products"
                  :key="p.id"
                  :to="{ path: `/product/${p.id}`, query: { from: 'ai', focus: 'buy' } }"
                  class="product-card"
                  @click="handleProductClick"
                >
                  <img :src="p.cover" :alt="p.name" />
                  <h4>{{ p.name }}</h4>
                  <div>
                    <b>¥{{ money(p.price) }}</b>
                    <span>{{ p.buyers }}人购买</span>
                  </div>
                </router-link>
              </div>
            </article>

            <div v-if="m.text" class="bubble">{{ m.text }}</div>

            <article v-if="m.kind === 'orders'" class="rich-card order-card">
              <h3>最近订单</h3>
              <div v-for="o in m.orders" :key="o.id" class="order-mini">
                <header>
                  <b>{{ dateOnly(o.createdAt) }} 订单号：{{ o.orderNo }}</b>
                  <em>{{ o.statusText }}</em>
                </header>
                <div class="order-mini-body">
                  <img :src="o.items[0]?.product.cover" :alt="o.items[0]?.product.name" />
                  <div class="order-name">
                    <h4>{{ o.items[0]?.product.name }}</h4>
                    <p>规格：{{ o.items[0]?.product.variants[0]?.label || "默认款" }}</p>
                  </div>
                  <strong>¥{{ money(o.amount) }}<small>x{{ countItems(o) }}</small></strong>
                  <span>实付款 <b>¥{{ money(o.amount) }}</b></span>
                </div>
              </div>
            </article>

            <article v-if="m.kind === 'logistics'" class="rich-card">
              <h3>最新物流</h3>
              <div v-if="m.order?.items?.length" class="logistics-product">
                <img :src="m.order.items[0].product.cover" :alt="m.order.items[0].product.name" />
                <div>
                  <h4>{{ m.order.items[0].product.name }}</h4>
                  <p>订单号：{{ m.order.orderNo }} · {{ m.order.logisticsCompany || "物流" }} {{ m.order.trackingNo || "" }}</p>
                </div>
              </div>
              <ul class="trace-list">
                <li v-for="t in m.order?.logisticsTraces" :key="t.time + t.content">
                  <span>{{ t.time }}</span>
                  <b>{{ t.content }}</b>
                </li>
              </ul>
              <p v-if="m.order" class="receiver">
                收件信息：{{ m.order.receiver }} | 电话：{{ maskPhone(m.order.receiverPhone) }} | 地址：{{ m.order.address }}
              </p>
            </article>
          </div>
        </main>

        <footer class="ai-input">
          <div class="quick">
            <span>试试这样问</span>
            <button v-for="q in quickQuestions" :key="q" @click="ask(q)">{{ q }}</button>
          </div>
          <div class="input-row">
            <input v-model="draft" placeholder="请输入你的问题" @keyup.enter="send" />
            <button :disabled="loading" @click="send">→</button>
          </div>
        </footer>
      </div>
    </section>
  </transition>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";
import { askShoppingGuide, listAiHistory, listProducts } from "@/api/mall";
import type { Product } from "@/api/mock";
import { useOrderStore, type OrderRecord } from "@/stores/order";

interface AiMessage {
  role: "user" | "ai";
  text?: string;
  pending?: boolean;
  kind?: "products" | "orders" | "logistics";
  products?: Product[];
  orders?: OrderRecord[];
  order?: OrderRecord;
}

type ShoppingCategory = "shoe" | "down_jacket" | "shirt" | "clothing" | "gift" | "fresh" | "beauty" | "digital" | "book" | "general";
interface ShoppingIntent {
  category: ShoppingCategory;
  terms: string[];
}

defineProps<{ open: boolean }>();
const emit = defineEmits<{ "update:open": [value: boolean] }>();

const orderStore = useOrderStore();
const HISTORY_KEY = "smart_mall_ai_rich_messages";
const draft = ref("");
const loading = ref(false);
const products = ref<Product[]>([]);
const bodyEl = ref<HTMLElement>();
const lastIntent = ref<ShoppingIntent | null>(null);

const quickQuestions = ["我要一双鞋子", "红色的运动鞋", "我是42码", "预算200以内", "我的订单到哪里了"];
const messages = ref<AiMessage[]>([{ role: "ai", text: "我是你的专属购物助手，你可以先说商品需求，我会先给你看合适的商品。" }]);
let historyReady = false;

const money = (n: number) => Number(n).toFixed(2);
const dateOnly = (v: string) => v.split(" ")[0] || v;
const countItems = (o: OrderRecord) => o.items.reduce((sum, it) => sum + it.qty, 0);
const maskPhone = (phone?: string) => (phone || "").replace(/^(\d{3})\d+(\d{4})$/, "$1****$2");

onMounted(async () => {
  products.value = await listProducts();
  const cached = readRichHistory();
  if (cached.length) {
    messages.value = cached;
    historyReady = true;
    await nextTick();
    scrollToBottom();
    return;
  }
  const history = await listAiHistory();
  if (history.length) {
    messages.value = history
      .slice()
      .reverse()
      .map((item) => ({ role: item.role === "assistant" ? "ai" : "user", text: item.message }));
  }
  historyReady = true;
});

watch(messages, (rows) => {
  if (!historyReady || typeof localStorage === "undefined") return;
  const stableRows = rows.filter((row) => !row.pending).slice(-60);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(stableRows));
}, { deep: true });

function readRichHistory() {
  if (typeof localStorage === "undefined") return [] as AiMessage[];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const rows = raw ? JSON.parse(raw) as AiMessage[] : [];
    return Array.isArray(rows) ? rows.filter((row) => row && (row.role === "ai" || row.role === "user")) : [];
  } catch {
    return [] as AiMessage[];
  }
}

async function send() {
  await ask(draft.value);
}

async function ask(question: string) {
  const q = question.trim();
  if (!q || loading.value) return;

  messages.value.push({ role: "user", text: q });
  const pendingMessage: AiMessage = { role: "ai", text: "生成中...", pending: true };
  messages.value.push(pendingMessage);
  draft.value = "";
  loading.value = true;
  await nextTick();
  scrollToBottom();

  try {
    await respond(q, pendingMessage);
  } finally {
    if (pendingMessage.pending) {
      const idx = messages.value.indexOf(pendingMessage);
      if (idx >= 0) messages.value.splice(idx, 1);
    }
    loading.value = false;
    await nextTick();
    scrollToBottom();
  }
}

function resolvePending(pendingMessage: AiMessage, next: AiMessage) {
  const idx = messages.value.indexOf(pendingMessage);
  if (idx >= 0) {
    messages.value.splice(idx, 1, next);
  } else {
    messages.value.push(next);
  }
  pendingMessage.pending = false;
}

function scrollToBottom() {
  if (bodyEl.value) bodyEl.value.scrollTop = bodyEl.value.scrollHeight;
}

function handleProductClick() {
  emit("update:open", false);
}

async function respond(q: string, pendingMessage: AiMessage) {
  if (handleOrderQueries(q, pendingMessage)) return;

  const shopping = handleShoppingQueries(q, pendingMessage);
  if (shopping) return;

  lastIntent.value = null;
  const answer = await askShoppingGuide(q);
  resolvePending(pendingMessage, { role: "ai", text: answer });
}

function handleOrderQueries(q: string, pendingMessage: AiMessage) {
  if (q.includes("订单到哪里") || q.includes("物流") || q.includes("到哪")) {
    const latest = orderStore.latest;
    if (!latest) {
      resolvePending(pendingMessage, { role: "ai", text: "暂时没有可查询的订单，你可以先下单，再回来查物流。" });
      return true;
    }
    if (!latest.logisticsTraces.length) {
      resolvePending(pendingMessage, { role: "ai", text: `订单 ${latest.orderNo} 当前是“${latest.statusText}”，还没有物流轨迹。` });
      return true;
    }
    resolvePending(pendingMessage, {
      role: "ai",
      text: "找到这个商品的物流了，先看商品，再看位置。",
      kind: "logistics",
      order: latest,
    });
    return true;
  }

  if (q.includes("我的订单") || q === "订单") {
    if (!orderStore.orders.length) {
      resolvePending(pendingMessage, { role: "ai", text: "最近还没有订单，你可以先看看商品。" });
      return true;
    }
    resolvePending(pendingMessage, {
      role: "ai",
      text: "这是你最近的订单。",
      kind: "orders",
      orders: orderStore.orders.slice(0, 3),
    });
    return true;
  }

  if (q.includes("退款")) {
    resolvePending(pendingMessage, { role: "ai", text: "你可以去“我的订单”里发起退款申请。" });
    return true;
  }

  if (q.includes("好评") || q.includes("评价")) {
    resolvePending(pendingMessage, { role: "ai", text: "可以去“我的订单”里提交评价。" });
    return true;
  }

  return false;
}

function handleShoppingQueries(q: string, pendingMessage: AiMessage) {
  const intent = detectShoppingIntent(q) || (isFollowupCondition(q) ? lastIntent.value : null);
  if (!intent) return false;

  const matched = searchProducts(q, intent);
  lastIntent.value = intent;

  if (!matched.length) {
    resolvePending(pendingMessage, { role: "ai", text: buildNoMatchText(q, intent) });
    return true;
  }

  resolvePending(pendingMessage, {
    role: "ai",
    kind: "products",
    products: matched.slice(0, 3),
  });
  messages.value.push({ role: "ai", text: buildFollowupText(q, matched.length) });
  return true;
}

function detectShoppingIntent(q: string): ShoppingIntent | null {
  const terms = extractProductTerms(q);
  if (/[鞋靴]|运动鞋|跑步鞋|板鞋/.test(q)) return { category: "shoe", terms: terms.length ? terms : ["鞋"] };
  if (/羽绒服|羽绒/.test(q)) return { category: "down_jacket", terms: terms.length ? terms : ["羽绒"] };
  if (/衬衫|衬衣/.test(q)) return { category: "shirt", terms: terms.length ? terms : ["衬衫"] };
  if (/毛衣|衣服|外套|上衣|服装|女装|男装/.test(q)) return { category: "clothing", terms: terms.length ? terms : [] };
  if (/苹果|李子|水果|生鲜|食品|零食|饮料/.test(q)) return { category: "fresh", terms: terms.length ? terms : ["食品"] };
  if (/眉笔|粉底|口红|美妆|彩妆|护肤/.test(q)) return { category: "beauty", terms: terms.length ? terms : [] };
  if (/照相机|相机|手机|数码|家电|电脑|耳机/.test(q)) return { category: "digital", terms: terms.length ? terms : [] };
  if (/水浒传|世说新语|书|图书|小说/.test(q)) return { category: "book", terms: terms.length ? terms : [] };
  if (/项链|礼物|饰品/.test(q)) return { category: "gift", terms: terms.length ? terms : [] };
  if (terms.length) return { category: "general", terms };
  if (/买|推荐|看看商品|想要/.test(q)) return { category: "general", terms: [] };
  return null;
}

function searchProducts(q: string, intent: ShoppingIntent) {
  const budget = parseBudget(q);
  const filters = extractFilterKeywords(q);
  const terms = intent.terms.length ? intent.terms : extractProductTerms(q);
  const scored = products.value
    .map((product) => ({ product, score: scoreProduct(product, intent, terms, filters) }))
    .filter((row) => row.score >= minimumScore(intent, terms))
    .filter((row) => budget === null || row.product.price <= budget)
    .sort((a, b) => b.score - a.score || b.product.sales - a.product.sales || a.product.price - b.product.price);
  return scored.map((row) => row.product);
}

function productSearchText(p: Product) {
  return [p.name, p.category, p.desc, ...p.tags, ...p.detail, ...p.variants.map((v) => v.label)].join(" ").toLowerCase();
}

function productNameText(p: Product) {
  return p.name.toLowerCase();
}

function scoreProduct(product: Product, intent: ShoppingIntent, terms: string[], filters: string[]) {
  const text = productSearchText(product);
  const name = productNameText(product);
  let score = categoryScore(text, intent.category);
  for (const term of terms.map((item) => item.toLowerCase())) {
    if (name === term) score += 120;
    else if (name.includes(term)) score += 80;
    else if (text.includes(term)) score += 35;
    else score -= 80;
  }
  for (const filter of filters.map((item) => item.toLowerCase())) {
    if (text.includes(filter)) score += 12;
    else score -= 20;
  }
  return score;
}

function categoryScore(text: string, category: ShoppingCategory) {
  if (category === "shoe") return /鞋|运动鞋|跑步鞋|板鞋/.test(text) ? 45 : -40;
  if (category === "down_jacket") return /羽绒服|羽绒/.test(text) && !/衬衫|衬衣|t恤|短袖/.test(text) ? 45 : -40;
  if (category === "shirt") return /衬衫|衬衣/.test(text) && !/羽绒服|羽绒/.test(text) ? 45 : -40;
  if (category === "clothing") return /服装|服饰|羽绒服|羽绒|衬衫|衬衣|毛衣|外套|上衣|女装|男装|鞋/.test(text) ? 30 : -20;
  if (category === "fresh") return /食品生鲜|食品|生鲜|水果|李子|零食|饮料/.test(text) ? 45 : -45;
  if (category === "beauty") return /美妆|个护|眉笔|粉底|口红|彩妆|护肤/.test(text) ? 45 : -45;
  if (category === "digital") return /数码|家电|照相机|相机|手机|电脑|耳机/.test(text) ? 45 : -45;
  if (category === "book") return /文体娱乐|图书|书|小说|水浒传|世说新语/.test(text) ? 45 : -45;
  if (category === "gift") return /项链|礼物|饰品/.test(text) ? 45 : -30;
  return 0;
}

function minimumScore(intent: ShoppingIntent, terms: string[]) {
  if (terms.length && intent.category !== "general") return 45;
  if (terms.length) return 25;
  return intent.category === "general" ? 10 : 20;
}

function parseBudget(q: string) {
  const match = q.match(/(\d+(?:\.\d+)?)\s*(元|块|以内|以下)/);
  return match ? Number(match[1]) : null;
}

function extractFilterKeywords(q: string) {
  const words = ["红色", "白色", "黑色", "蓝色", "粉色", "42码", "41码", "40码", "43码", "42", "41", "40", "43"];
  return words.filter((word) => q.includes(word));
}

function extractProductTerms(q: string) {
  const known = ["水浒传", "世说新语", "运动鞋", "跑步鞋", "板鞋", "羽绒服", "照相机", "相机", "眉笔", "粉底", "苹果", "李子", "衬衫", "衬衣", "项链"];
  const terms = known.filter((word) => q.includes(word));
  const cleaned = q
    .replace(/我想买|我要买|想买|我要|想要|有没有|有无|推荐|看看|商品|一个|一双|一支|一下|请|帮我|给我/g, "")
    .replace(/\d+(?:\.\d+)?\s*(元|块|以内|以下)/g, "")
    .replace(/[，。！？、,.!?\s]/g, "")
    .trim();
  if (cleaned.length >= 2 && !terms.some((term) => term.includes(cleaned) || cleaned.includes(term)) && !/买|推荐|想要|看看/.test(cleaned)) {
    terms.push(cleaned);
  }
  return Array.from(new Set(terms));
}

function isFollowupCondition(q: string) {
  return parseBudget(q) !== null || extractFilterKeywords(q).length > 0;
}

function buildFollowupText(q: string, count: number) {
  if ((/[鞋靴]|运动鞋|跑步鞋|板鞋/.test(q) || /羽绒服|羽绒|毛衣|衣服|外套|上衣|服装/.test(q)) && !extractFilterKeywords(q).length && parseBudget(q) === null) {
    return count > 1 ? "先看这几款商品，再告诉我颜色、尺码或预算。" : "先看这款商品，再告诉我颜色、尺码或预算。";
  }
  return "我只按当前商城已有商品筛选，没有匹配的商品不会硬推荐。";
}
function buildNoMatchText(q: string, intent: ShoppingIntent) {
  const target = intent.terms[0] || q;
  return `当前商城没有找到“${target}”对应的已上架商品，所以我不能随便推荐不相关商品。你可以换个关键词，或先到后台商品管理添加这个商品。`;
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
.product-card { color: #222; text-decoration: none; }
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
.logistics-product { display: grid; grid-template-columns: 86px 1fr; gap: 14px; align-items: center; padding: 14px 18px 4px; }
.logistics-product img { width: 78px; height: 78px; border-radius: 6px; object-fit: cover; background: #f5f5f5; }
.logistics-product h4 { margin: 0 0 8px; color: #df6e72; font-size: 16px; }
.logistics-product p { margin: 0; color: #667085; }
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
