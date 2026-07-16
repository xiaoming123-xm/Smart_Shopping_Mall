import { nextTick, onMounted, ref, watch } from "vue";
import { askShoppingGuide, listAiHistory, listProducts } from "@/api/mall";
import { useOrderStore } from "@/stores/order";
const __VLS_props = defineProps();
const emit = defineEmits();
const orderStore = useOrderStore();
const HISTORY_KEY = "smart_mall_ai_rich_messages";
const draft = ref("");
const loading = ref(false);
const products = ref([]);
const bodyEl = ref();
const lastIntent = ref(null);
const quickQuestions = ["我要一双鞋子", "红色的运动鞋", "我是42码", "预算200以内", "我的订单到哪里了"];
const messages = ref([{ role: "ai", text: "我是你的专属购物助手，你可以先说商品需求，我会先给你看合适的商品。" }]);
let historyReady = false;
const money = (n) => Number(n).toFixed(2);
const dateOnly = (v) => v.split(" ")[0] || v;
const countItems = (o) => o.items.reduce((sum, it) => sum + it.qty, 0);
const maskPhone = (phone) => (phone || "").replace(/^(\d{3})\d+(\d{4})$/, "$1****$2");
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
    if (!historyReady || typeof localStorage === "undefined")
        return;
    const stableRows = rows.filter((row) => !row.pending).slice(-60);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(stableRows));
}, { deep: true });
function readRichHistory() {
    if (typeof localStorage === "undefined")
        return [];
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        const rows = raw ? JSON.parse(raw) : [];
        return Array.isArray(rows) ? rows.filter((row) => row && (row.role === "ai" || row.role === "user")) : [];
    }
    catch {
        return [];
    }
}
async function send() {
    await ask(draft.value);
}
async function ask(question) {
    const q = question.trim();
    if (!q || loading.value)
        return;
    messages.value.push({ role: "user", text: q });
    const pendingMessage = { role: "ai", text: "生成中...", pending: true };
    messages.value.push(pendingMessage);
    draft.value = "";
    loading.value = true;
    await nextTick();
    scrollToBottom();
    try {
        await respond(q, pendingMessage);
    }
    finally {
        if (pendingMessage.pending) {
            const idx = messages.value.indexOf(pendingMessage);
            if (idx >= 0)
                messages.value.splice(idx, 1);
        }
        loading.value = false;
        await nextTick();
        scrollToBottom();
    }
}
function resolvePending(pendingMessage, next) {
    const idx = messages.value.indexOf(pendingMessage);
    if (idx >= 0) {
        messages.value.splice(idx, 1, next);
    }
    else {
        messages.value.push(next);
    }
    pendingMessage.pending = false;
}
function scrollToBottom() {
    if (bodyEl.value)
        bodyEl.value.scrollTop = bodyEl.value.scrollHeight;
}
function handleProductClick() {
    emit("update:open", false);
}
async function respond(q, pendingMessage) {
    if (handleOrderQueries(q, pendingMessage))
        return;
    const shopping = handleShoppingQueries(q, pendingMessage);
    if (shopping)
        return;
    lastIntent.value = null;
    const answer = await askShoppingGuide(q);
    resolvePending(pendingMessage, { role: "ai", text: answer });
}
function handleOrderQueries(q, pendingMessage) {
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
function handleShoppingQueries(q, pendingMessage) {
    const intent = detectShoppingIntent(q) || (isFollowupCondition(q) ? lastIntent.value : null);
    if (!intent)
        return false;
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
function detectShoppingIntent(q) {
    const terms = extractProductTerms(q);
    if (/[鞋靴]|运动鞋|跑步鞋|板鞋/.test(q))
        return { category: "shoe", terms: terms.length ? terms : ["鞋"] };
    if (/羽绒服|羽绒/.test(q))
        return { category: "down_jacket", terms: terms.length ? terms : ["羽绒"] };
    if (/衬衫|衬衣/.test(q))
        return { category: "shirt", terms: terms.length ? terms : ["衬衫"] };
    if (/毛衣|衣服|外套|上衣|服装|女装|男装/.test(q))
        return { category: "clothing", terms: terms.length ? terms : [] };
    if (/苹果|李子|水果|生鲜|食品|零食|饮料/.test(q))
        return { category: "fresh", terms: terms.length ? terms : ["食品"] };
    if (/眉笔|粉底|口红|美妆|彩妆|护肤/.test(q))
        return { category: "beauty", terms: terms.length ? terms : [] };
    if (/照相机|相机|手机|数码|家电|电脑|耳机/.test(q))
        return { category: "digital", terms: terms.length ? terms : [] };
    if (/水浒传|世说新语|书|图书|小说/.test(q))
        return { category: "book", terms: terms.length ? terms : [] };
    if (/项链|礼物|饰品/.test(q))
        return { category: "gift", terms: terms.length ? terms : [] };
    if (terms.length)
        return { category: "general", terms };
    if (/买|推荐|看看商品|想要/.test(q))
        return { category: "general", terms: [] };
    return null;
}
function searchProducts(q, intent) {
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
function productSearchText(p) {
    return [p.name, p.category, p.desc, ...p.tags, ...p.detail, ...p.variants.map((v) => v.label)].join(" ").toLowerCase();
}
function productNameText(p) {
    return p.name.toLowerCase();
}
function scoreProduct(product, intent, terms, filters) {
    const text = productSearchText(product);
    const name = productNameText(product);
    let score = categoryScore(text, intent.category);
    for (const term of terms.map((item) => item.toLowerCase())) {
        if (name === term)
            score += 120;
        else if (name.includes(term))
            score += 80;
        else if (text.includes(term))
            score += 35;
        else
            score -= 80;
    }
    for (const filter of filters.map((item) => item.toLowerCase())) {
        if (text.includes(filter))
            score += 12;
        else
            score -= 20;
    }
    return score;
}
function categoryScore(text, category) {
    if (category === "shoe")
        return /鞋|运动鞋|跑步鞋|板鞋/.test(text) ? 45 : -40;
    if (category === "down_jacket")
        return /羽绒服|羽绒/.test(text) && !/衬衫|衬衣|t恤|短袖/.test(text) ? 45 : -40;
    if (category === "shirt")
        return /衬衫|衬衣/.test(text) && !/羽绒服|羽绒/.test(text) ? 45 : -40;
    if (category === "clothing")
        return /服装|服饰|羽绒服|羽绒|衬衫|衬衣|毛衣|外套|上衣|女装|男装|鞋/.test(text) ? 30 : -20;
    if (category === "fresh")
        return /食品生鲜|食品|生鲜|水果|李子|零食|饮料/.test(text) ? 45 : -45;
    if (category === "beauty")
        return /美妆|个护|眉笔|粉底|口红|彩妆|护肤/.test(text) ? 45 : -45;
    if (category === "digital")
        return /数码|家电|照相机|相机|手机|电脑|耳机/.test(text) ? 45 : -45;
    if (category === "book")
        return /文体娱乐|图书|书|小说|水浒传|世说新语/.test(text) ? 45 : -45;
    if (category === "gift")
        return /项链|礼物|饰品/.test(text) ? 45 : -30;
    return 0;
}
function minimumScore(intent, terms) {
    if (terms.length && intent.category !== "general")
        return 45;
    if (terms.length)
        return 25;
    return intent.category === "general" ? 10 : 20;
}
function parseBudget(q) {
    const match = q.match(/(\d+(?:\.\d+)?)\s*(元|块|以内|以下)/);
    return match ? Number(match[1]) : null;
}
function extractFilterKeywords(q) {
    const words = ["红色", "白色", "黑色", "蓝色", "粉色", "42码", "41码", "40码", "43码", "42", "41", "40", "43"];
    return words.filter((word) => q.includes(word));
}
function extractProductTerms(q) {
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
function isFollowupCondition(q) {
    return parseBudget(q) !== null || extractFilterKeywords(q).length > 0;
}
function buildFollowupText(q, count) {
    if ((/[鞋靴]|运动鞋|跑步鞋|板鞋/.test(q) || /羽绒服|羽绒|毛衣|衣服|外套|上衣|服装/.test(q)) && !extractFilterKeywords(q).length && parseBudget(q) === null) {
        return count > 1 ? "先看这几款商品，再告诉我颜色、尺码或预算。" : "先看这款商品，再告诉我颜色、尺码或预算。";
    }
    return "我只按当前商城已有商品筛选，没有匹配的商品不会硬推荐。";
}
function buildNoMatchText(q, intent) {
    const target = intent.terms[0] || q;
    return `当前商城没有找到“${target}”对应的已上架商品，所以我不能随便推荐不相关商品。你可以换个关键词，或先到后台商品管理添加这个商品。`;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['ai-head']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-head']} */ ;
/** @type {__VLS_StyleScopedClasses['bubble-row']} */ ;
/** @type {__VLS_StyleScopedClasses['bubble-row']} */ ;
/** @type {__VLS_StyleScopedClasses['bubble-row']} */ ;
/** @type {__VLS_StyleScopedClasses['user']} */ ;
/** @type {__VLS_StyleScopedClasses['bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['bubble-row']} */ ;
/** @type {__VLS_StyleScopedClasses['ai']} */ ;
/** @type {__VLS_StyleScopedClasses['bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['rich-card']} */ ;
/** @type {__VLS_StyleScopedClasses['product-card']} */ ;
/** @type {__VLS_StyleScopedClasses['product-card']} */ ;
/** @type {__VLS_StyleScopedClasses['product-card']} */ ;
/** @type {__VLS_StyleScopedClasses['product-card']} */ ;
/** @type {__VLS_StyleScopedClasses['order-mini']} */ ;
/** @type {__VLS_StyleScopedClasses['product-card']} */ ;
/** @type {__VLS_StyleScopedClasses['order-mini']} */ ;
/** @type {__VLS_StyleScopedClasses['order-mini']} */ ;
/** @type {__VLS_StyleScopedClasses['order-mini']} */ ;
/** @type {__VLS_StyleScopedClasses['order-mini-body']} */ ;
/** @type {__VLS_StyleScopedClasses['order-name']} */ ;
/** @type {__VLS_StyleScopedClasses['order-mini']} */ ;
/** @type {__VLS_StyleScopedClasses['logistics-product']} */ ;
/** @type {__VLS_StyleScopedClasses['logistics-product']} */ ;
/** @type {__VLS_StyleScopedClasses['logistics-product']} */ ;
/** @type {__VLS_StyleScopedClasses['trace-list']} */ ;
/** @type {__VLS_StyleScopedClasses['trace-list']} */ ;
/** @type {__VLS_StyleScopedClasses['trace-list']} */ ;
/** @type {__VLS_StyleScopedClasses['quick']} */ ;
/** @type {__VLS_StyleScopedClasses['quick']} */ ;
/** @type {__VLS_StyleScopedClasses['input-row']} */ ;
/** @type {__VLS_StyleScopedClasses['input-row']} */ ;
/** @type {__VLS_StyleScopedClasses['input-row']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['product-cards']} */ ;
/** @type {__VLS_StyleScopedClasses['order-mini-body']} */ ;
/** @type {__VLS_StyleScopedClasses['order-mini']} */ ;
/** @type {__VLS_StyleScopedClasses['order-mini']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    name: "drop",
}));
const __VLS_2 = __VLS_1({
    name: "drop",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
if (__VLS_ctx.open) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "ai-shell" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ai-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
        ...{ class: "ai-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "robot" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.open))
                    return;
                __VLS_ctx.emit('update:open', false);
            } },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
        ref: "bodyEl",
        ...{ class: "ai-body" },
    });
    /** @type {typeof __VLS_ctx.bodyEl} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "more" },
    });
    for (const [m, i] of __VLS_getVForSourceType((__VLS_ctx.messages))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (i),
            ...{ class: (['bubble-row', m.role]) },
        });
        if (m.kind === 'products') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
                ...{ class: "rich-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "product-cards" },
            });
            for (const [p] of __VLS_getVForSourceType((m.products))) {
                const __VLS_4 = {}.RouterLink;
                /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
                // @ts-ignore
                const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
                    ...{ 'onClick': {} },
                    key: (p.id),
                    to: ({ path: `/product/${p.id}`, query: { from: 'ai', focus: 'buy' } }),
                    ...{ class: "product-card" },
                }));
                const __VLS_6 = __VLS_5({
                    ...{ 'onClick': {} },
                    key: (p.id),
                    to: ({ path: `/product/${p.id}`, query: { from: 'ai', focus: 'buy' } }),
                    ...{ class: "product-card" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_5));
                let __VLS_8;
                let __VLS_9;
                let __VLS_10;
                const __VLS_11 = {
                    onClick: (__VLS_ctx.handleProductClick)
                };
                __VLS_7.slots.default;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                    src: (p.cover),
                    alt: (p.name),
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                (p.name);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
                (__VLS_ctx.money(p.price));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (p.buyers);
                var __VLS_7;
            }
        }
        if (m.text) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "bubble" },
            });
            (m.text);
        }
        if (m.kind === 'orders') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
                ...{ class: "rich-card order-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
            for (const [o] of __VLS_getVForSourceType((m.orders))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (o.id),
                    ...{ class: "order-mini" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
                (__VLS_ctx.dateOnly(o.createdAt));
                (o.orderNo);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.em, __VLS_intrinsicElements.em)({});
                (o.statusText);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "order-mini-body" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                    src: (o.items[0]?.product.cover),
                    alt: (o.items[0]?.product.name),
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "order-name" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                (o.items[0]?.product.name);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                (o.items[0]?.product.variants[0]?.label || "默认款");
                __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
                (__VLS_ctx.money(o.amount));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
                (__VLS_ctx.countItems(o));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
                (__VLS_ctx.money(o.amount));
            }
        }
        if (m.kind === 'logistics') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
                ...{ class: "rich-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
            if (m.order?.items?.length) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "logistics-product" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                    src: (m.order.items[0].product.cover),
                    alt: (m.order.items[0].product.name),
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                (m.order.items[0].product.name);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                (m.order.orderNo);
                (m.order.logisticsCompany || "物流");
                (m.order.trackingNo || "");
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
                ...{ class: "trace-list" },
            });
            for (const [t] of __VLS_getVForSourceType((m.order?.logisticsTraces))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                    key: (t.time + t.content),
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (t.time);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
                (t.content);
            }
            if (m.order) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                    ...{ class: "receiver" },
                });
                (m.order.receiver);
                (__VLS_ctx.maskPhone(m.order.receiverPhone));
                (m.order.address);
            }
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.footer, __VLS_intrinsicElements.footer)({
        ...{ class: "ai-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "quick" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    for (const [q] of __VLS_getVForSourceType((__VLS_ctx.quickQuestions))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.open))
                        return;
                    __VLS_ctx.ask(q);
                } },
            key: (q),
        });
        (q);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "input-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onKeyup: (__VLS_ctx.send) },
        placeholder: "请输入你的问题",
    });
    (__VLS_ctx.draft);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.send) },
        disabled: (__VLS_ctx.loading),
    });
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['ai-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-head']} */ ;
/** @type {__VLS_StyleScopedClasses['robot']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-body']} */ ;
/** @type {__VLS_StyleScopedClasses['more']} */ ;
/** @type {__VLS_StyleScopedClasses['rich-card']} */ ;
/** @type {__VLS_StyleScopedClasses['product-cards']} */ ;
/** @type {__VLS_StyleScopedClasses['product-card']} */ ;
/** @type {__VLS_StyleScopedClasses['bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['rich-card']} */ ;
/** @type {__VLS_StyleScopedClasses['order-card']} */ ;
/** @type {__VLS_StyleScopedClasses['order-mini']} */ ;
/** @type {__VLS_StyleScopedClasses['order-mini-body']} */ ;
/** @type {__VLS_StyleScopedClasses['order-name']} */ ;
/** @type {__VLS_StyleScopedClasses['rich-card']} */ ;
/** @type {__VLS_StyleScopedClasses['logistics-product']} */ ;
/** @type {__VLS_StyleScopedClasses['trace-list']} */ ;
/** @type {__VLS_StyleScopedClasses['receiver']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-input']} */ ;
/** @type {__VLS_StyleScopedClasses['quick']} */ ;
/** @type {__VLS_StyleScopedClasses['input-row']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            emit: emit,
            draft: draft,
            loading: loading,
            bodyEl: bodyEl,
            quickQuestions: quickQuestions,
            messages: messages,
            money: money,
            dateOnly: dateOnly,
            countItems: countItems,
            maskPhone: maskPhone,
            send: send,
            ask: ask,
            handleProductClick: handleProductClick,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
