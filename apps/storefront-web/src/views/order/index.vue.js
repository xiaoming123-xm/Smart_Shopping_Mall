import { computed, onMounted, ref } from "vue";
import { useOrderStore } from "@/stores/order";
import { receiveOrderFlow, requestRefundFlow, reviewOrderFlow } from "@/use-cases/orderFlow";
import { syncOrdersFromBackend } from "@/use-cases/orderSync";
const orderStore = useOrderStore();
const active = ref("ALL");
const logisticsId = ref("");
const reviewId = ref("");
const rating = ref(5);
const reviewText = ref("东西很不错，很满意，下次还会光临。");
const syncing = ref(true);
const tabs = [
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
const money = (n) => Number(n).toFixed(2);
const dateOnly = (v) => v.split(" ")[0] || v;
const itemCount = (o) => o.items.reduce((sum, it) => sum + it.qty, 0);
function canRefund(status) {
    return status === "PAID" || status === "SHIPPED" || status === "RECEIVED";
}
async function requestRefund(orderId, productName) {
    await requestRefundFlow(orderId, productName);
    window.alert("已提交退货/退款申请，等待商家处理。");
}
async function receive(id) {
    await receiveOrderFlow(id);
}
function openLogistics(id) {
    logisticsId.value = id;
}
function openReview(id) {
    reviewId.value = id;
    rating.value = 5;
    reviewText.value = "东西很不错，很满意，下次还会光临。";
}
async function submitReview() {
    if (!reviewId.value)
        return;
    await reviewOrderFlow(reviewId.value, rating.value, reviewText.value);
    reviewId.value = "";
}
onMounted(() => {
    syncOrdersFromBackend().catch(() => null).finally(() => { syncing.value = false; });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['side']} */ ;
/** @type {__VLS_StyleScopedClasses['side']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['order-card']} */ ;
/** @type {__VLS_StyleScopedClasses['order-card']} */ ;
/** @type {__VLS_StyleScopedClasses['order-card']} */ ;
/** @type {__VLS_StyleScopedClasses['good']} */ ;
/** @type {__VLS_StyleScopedClasses['good']} */ ;
/** @type {__VLS_StyleScopedClasses['good']} */ ;
/** @type {__VLS_StyleScopedClasses['good']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['refund-state']} */ ;
/** @type {__VLS_StyleScopedClasses['price']} */ ;
/** @type {__VLS_StyleScopedClasses['paid']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline']} */ ;
/** @type {__VLS_StyleScopedClasses['stars']} */ ;
/** @type {__VLS_StyleScopedClasses['on']} */ ;
/** @type {__VLS_StyleScopedClasses['orders']} */ ;
/** @type {__VLS_StyleScopedClasses['side']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['order-body']} */ ;
/** @type {__VLS_StyleScopedClasses['price']} */ ;
/** @type {__VLS_StyleScopedClasses['paid']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "orders" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "side" },
});
const __VLS_0 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    to: "/home",
}));
const __VLS_2 = __VLS_1({
    to: "/home",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
var __VLS_3;
const __VLS_4 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    to: "/cart",
}));
const __VLS_6 = __VLS_5({
    to: "/cart",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
var __VLS_7;
const __VLS_8 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    to: "/order",
    ...{ class: "active" },
}));
const __VLS_10 = __VLS_9({
    to: "/order",
    ...{ class: "active" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
var __VLS_11;
const __VLS_12 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    to: "/member",
}));
const __VLS_14 = __VLS_13({
    to: "/member",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
var __VLS_15;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "main" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tabs" },
});
for (const [t] of __VLS_getVForSourceType((__VLS_ctx.tabs))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.active = t.key;
            } },
        key: (t.key),
        ...{ class: ({ on: __VLS_ctx.active === t.key }) },
    });
    (t.label);
}
if (__VLS_ctx.syncing) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty" },
    });
}
else if (__VLS_ctx.filtered.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "list" },
    });
    for (const [o] of __VLS_getVForSourceType((__VLS_ctx.filtered))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            key: (o.id),
            ...{ class: "order-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.dateOnly(o.createdAt));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
        (o.orderNo);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.em, __VLS_intrinsicElements.em)({});
        (o.statusText);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "order-body" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "goods" },
        });
        for (const [it] of __VLS_getVForSourceType((o.items))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (`${o.id}-${it.product.skuId || it.product.id}`),
                ...{ class: "good" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                src: (it.product.cover),
                alt: (it.product.name),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
            (it.product.name);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            (it.product.variants[0]?.label || "默认款");
            if (__VLS_ctx.canRefund(o.status)) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.syncing))
                                return;
                            if (!(__VLS_ctx.filtered.length))
                                return;
                            if (!(__VLS_ctx.canRefund(o.status)))
                                return;
                            __VLS_ctx.requestRefund(o.id, it.product.name);
                        } },
                });
            }
            else if (o.status === 'REFUND_REQUESTED') {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "refund-state" },
                });
            }
            else if (o.status === 'REFUNDED') {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "refund-state success" },
                });
            }
            else if (o.status === 'REFUND_REJECTED') {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "refund-state" },
                });
            }
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "price" },
        });
        (__VLS_ctx.money(o.amount));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
        (__VLS_ctx.itemCount(o));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "paid" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
        (__VLS_ctx.money(o.amount));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "actions" },
        });
        if (o.status === 'CREATED') {
            const __VLS_16 = {}.RouterLink;
            /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
            // @ts-ignore
            const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
                to: (`/payment/${o.id}`),
                ...{ class: "primary" },
            }));
            const __VLS_18 = __VLS_17({
                to: (`/payment/${o.id}`),
                ...{ class: "primary" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_17));
            __VLS_19.slots.default;
            var __VLS_19;
        }
        if (o.status === 'SHIPPED') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.syncing))
                            return;
                        if (!(__VLS_ctx.filtered.length))
                            return;
                        if (!(o.status === 'SHIPPED'))
                            return;
                        __VLS_ctx.receive(o.id);
                    } },
                ...{ class: "primary" },
            });
        }
        if (o.status === 'RECEIVED') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.syncing))
                            return;
                        if (!(__VLS_ctx.filtered.length))
                            return;
                        if (!(o.status === 'RECEIVED'))
                            return;
                        __VLS_ctx.openReview(o.id);
                    } },
                ...{ class: "primary" },
            });
        }
        if (o.logisticsTraces.length) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.syncing))
                            return;
                        if (!(__VLS_ctx.filtered.length))
                            return;
                        if (!(o.logisticsTraces.length))
                            return;
                        __VLS_ctx.openLogistics(o.id);
                    } },
            });
        }
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty" },
    });
    const __VLS_20 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        to: "/home",
    }));
    const __VLS_22 = __VLS_21({
        to: "/home",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    var __VLS_23;
}
if (__VLS_ctx.logisticsOrder) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.logisticsOrder))
                    return;
                __VLS_ctx.logisticsId = '';
            } },
        ...{ class: "x" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "ship" },
    });
    (__VLS_ctx.logisticsOrder.trackingNo || "SF123456465");
    (__VLS_ctx.logisticsOrder.logisticsCompany || "顺丰速运");
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
        ...{ class: "timeline" },
    });
    for (const [t] of __VLS_getVForSourceType((__VLS_ctx.logisticsOrder.logisticsTraces))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
            key: (t.time + t.content),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
        (t.time);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (t.content);
    }
}
if (__VLS_ctx.reviewOrder) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-panel review" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.reviewOrder))
                    return;
                __VLS_ctx.reviewId = '';
            } },
        ...{ class: "x" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stars" },
    });
    for (const [n] of __VLS_getVForSourceType((5))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.reviewOrder))
                        return;
                    __VLS_ctx.rating = n;
                } },
            key: (n),
            ...{ class: ({ on: n <= __VLS_ctx.rating }) },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
        value: (__VLS_ctx.reviewText),
        placeholder: "写下你的使用感受",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.submitReview) },
        ...{ class: "submit" },
    });
}
/** @type {__VLS_StyleScopedClasses['orders']} */ ;
/** @type {__VLS_StyleScopedClasses['side']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['main']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['list']} */ ;
/** @type {__VLS_StyleScopedClasses['order-card']} */ ;
/** @type {__VLS_StyleScopedClasses['order-body']} */ ;
/** @type {__VLS_StyleScopedClasses['goods']} */ ;
/** @type {__VLS_StyleScopedClasses['good']} */ ;
/** @type {__VLS_StyleScopedClasses['refund-state']} */ ;
/** @type {__VLS_StyleScopedClasses['refund-state']} */ ;
/** @type {__VLS_StyleScopedClasses['success']} */ ;
/** @type {__VLS_StyleScopedClasses['refund-state']} */ ;
/** @type {__VLS_StyleScopedClasses['price']} */ ;
/** @type {__VLS_StyleScopedClasses['paid']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['x']} */ ;
/** @type {__VLS_StyleScopedClasses['ship']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['review']} */ ;
/** @type {__VLS_StyleScopedClasses['x']} */ ;
/** @type {__VLS_StyleScopedClasses['stars']} */ ;
/** @type {__VLS_StyleScopedClasses['submit']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            active: active,
            logisticsId: logisticsId,
            reviewId: reviewId,
            rating: rating,
            reviewText: reviewText,
            syncing: syncing,
            tabs: tabs,
            filtered: filtered,
            logisticsOrder: logisticsOrder,
            reviewOrder: reviewOrder,
            money: money,
            dateOnly: dateOnly,
            itemCount: itemCount,
            canRefund: canRefund,
            requestRefund: requestRefund,
            receive: receive,
            openLogistics: openLogistics,
            openReview: openReview,
            submitReview: submitReview,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
