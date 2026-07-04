import { nextTick, onMounted, ref } from "vue";
import { askShoppingGuide, listProducts } from "@/api/mall";
import { useOrderStore } from "@/stores/order";
const __VLS_props = defineProps();
const emit = defineEmits();
const orderStore = useOrderStore();
const draft = ref("");
const loading = ref(false);
const products = ref([]);
const bodyEl = ref();
const quickQuestions = ["我要买一双红色的运动鞋", "我的订单", "我要申请退款", "我的订单到哪里了", "我要给我的订单一个好评"];
const messages = ref([
    { role: "ai", text: "我是您的专属购物助手，有什么可以帮您？" },
]);
const money = (n) => Number(n).toFixed(2);
const dateOnly = (v) => v.split(" ")[0] || v;
const countItems = (o) => o.items.reduce((sum, it) => sum + it.qty, 0);
const maskPhone = (phone) => phone.replace(/^(\d{3})\d+(\d{4})$/, "$1****$2");
onMounted(async () => {
    products.value = await listProducts();
});
async function send() {
    await ask(draft.value);
}
async function ask(question) {
    const q = question.trim();
    if (!q || loading.value)
        return;
    messages.value.push({ role: "user", text: q });
    draft.value = "";
    loading.value = true;
    await respond(q);
    loading.value = false;
    await nextTick();
    if (bodyEl.value)
        bodyEl.value.scrollTop = bodyEl.value.scrollHeight;
}
async function respond(q) {
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
        if (m.text) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "bubble" },
            });
            (m.text);
        }
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
                    key: (p.id),
                    to: (`/product/${p.id}`),
                    ...{ class: "product-card" },
                }));
                const __VLS_6 = __VLS_5({
                    key: (p.id),
                    to: (`/product/${p.id}`),
                    ...{ class: "product-card" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_5));
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
/** @type {__VLS_StyleScopedClasses['bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['rich-card']} */ ;
/** @type {__VLS_StyleScopedClasses['product-cards']} */ ;
/** @type {__VLS_StyleScopedClasses['product-card']} */ ;
/** @type {__VLS_StyleScopedClasses['rich-card']} */ ;
/** @type {__VLS_StyleScopedClasses['order-card']} */ ;
/** @type {__VLS_StyleScopedClasses['order-mini']} */ ;
/** @type {__VLS_StyleScopedClasses['order-mini-body']} */ ;
/** @type {__VLS_StyleScopedClasses['order-name']} */ ;
/** @type {__VLS_StyleScopedClasses['rich-card']} */ ;
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
