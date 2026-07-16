import { computed, onMounted, ref } from "vue";
import { hideBackendMessage, listBackendMessages } from "@/api/mall";
import { syncOrdersFromBackend } from "@/use-cases/orderSync";
import { useOrderStore } from "@/stores/order";
const HIDDEN_KEY = "smart_mall_hidden_messages";
const orderStore = useOrderStore();
const hiddenIds = ref(readHidden());
const backendMessages = ref([]);
const iconMap = {
    reply: "回",
    logistics: "运",
    order: "单",
};
const messages = computed(() => {
    const rows = backendMessages.value.length ? backendMessages.value : fallbackMessagesFromOrders();
    return rows
        .filter((item) => !hiddenIds.value.includes(item.id))
        .sort((a, b) => String(b.time).localeCompare(String(a.time), "zh-CN", { numeric: true }));
});
function fallbackMessagesFromOrders() {
    const rows = [];
    for (const order of orderStore.orders) {
        rows.push({
            id: `status-${order.id}-${order.status}`,
            orderId: order.id,
            type: "order",
            title: `订单 ${order.orderNo} 状态更新`,
            content: `当前状态：${order.statusText}`,
            time: order.createdAt,
            note: "订单状态消息，临时从订单数据生成。",
        });
        const latestTrace = order.logisticsTraces[order.logisticsTraces.length - 1];
        if (latestTrace) {
            rows.push({
                id: `logistics-${order.id}-${latestTrace.time}`,
                orderId: order.id,
                type: "logistics",
                title: `订单 ${order.orderNo} 物流更新`,
                content: latestTrace.content,
                time: latestTrace.time,
                note: "物流消息，临时从订单物流轨迹生成。",
            });
        }
        if (order.reviewReply) {
            rows.push({
                id: `reply-${order.id}`,
                orderId: order.id,
                type: "reply",
                title: `订单 ${order.orderNo} 收到商家回复`,
                content: order.reviewReply,
                time: order.createdAt,
                note: "商家回复消息，后端消息表不可用时从订单回复字段兜底展示。",
            });
        }
    }
    return rows;
}
function toMessage(row) {
    const typeMap = {
        REVIEW_REPLY: "reply",
        LOGISTICS: "logistics",
        ORDER_STATUS: "order",
    };
    const type = typeMap[row.type] || "order";
    const noteMap = {
        reply: "商家回复消息，来自数据库 user_message 表。",
        logistics: "物流动态消息，来自数据库 user_message 表。",
        order: "订单状态消息，来自数据库 user_message 表。",
    };
    return {
        id: `db-${row.id}`,
        backendId: row.id,
        orderId: row.orderId ? String(row.orderId) : undefined,
        type,
        title: row.title,
        content: row.content,
        time: row.updatedAt || row.createdAt || "",
        actionText: row.actionText,
        note: noteMap[type],
    };
}
function readHidden() {
    if (typeof localStorage === "undefined")
        return [];
    try {
        const raw = localStorage.getItem(HIDDEN_KEY);
        return raw ? JSON.parse(raw) : [];
    }
    catch {
        return [];
    }
}
function persistHidden() {
    if (typeof localStorage === "undefined")
        return;
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(hiddenIds.value));
}
async function hideMessage(message) {
    if (message.backendId) {
        await hideBackendMessage(message.backendId).catch(() => null);
        backendMessages.value = backendMessages.value.filter((item) => item.id !== message.id);
        return;
    }
    if (hiddenIds.value.includes(message.id))
        return;
    hiddenIds.value = [...hiddenIds.value, message.id];
    persistHidden();
}
function clearHidden() {
    hiddenIds.value = [];
    persistHidden();
}
async function refresh() {
    await syncOrdersFromBackend().catch(() => null);
    try {
        backendMessages.value = (await listBackendMessages(1)).map(toMessage);
    }
    catch {
        backendMessages.value = [];
    }
}
onMounted(refresh);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-head']} */ ;
/** @type {__VLS_StyleScopedClasses['page-head']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['message-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['message-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['message-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['message-head']} */ ;
/** @type {__VLS_StyleScopedClasses['message-head']} */ ;
/** @type {__VLS_StyleScopedClasses['message-body']} */ ;
/** @type {__VLS_StyleScopedClasses['page-head']} */ ;
/** @type {__VLS_StyleScopedClasses['head-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['message-card']} */ ;
/** @type {__VLS_StyleScopedClasses['message-head']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "messages-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "head-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.clearHidden) },
    ...{ class: "refresh-btn ghost" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.refresh) },
    ...{ class: "refresh-btn" },
});
if (__VLS_ctx.messages.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "message-list" },
    });
    for (const [message] of __VLS_getVForSourceType((__VLS_ctx.messages))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            key: (message.id),
            ...{ class: "message-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "message-icon" },
            ...{ class: (message.type) },
        });
        (__VLS_ctx.iconMap[message.type]);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "message-body" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "message-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (message.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (message.time);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (message.content);
        if (message.note) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "message-meta" },
            });
            (message.note);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "message-actions" },
        });
        if (message.orderId) {
            const __VLS_0 = {}.RouterLink;
            /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
            // @ts-ignore
            const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
                to: "/order",
                ...{ class: "message-link" },
            }));
            const __VLS_2 = __VLS_1({
                to: "/order",
                ...{ class: "message-link" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_1));
            __VLS_3.slots.default;
            (message.actionText || "查看订单");
            var __VLS_3;
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.messages.length))
                        return;
                    __VLS_ctx.hideMessage(message);
                } },
            ...{ class: "delete-btn" },
        });
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty" },
    });
}
/** @type {__VLS_StyleScopedClasses['messages-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-head']} */ ;
/** @type {__VLS_StyleScopedClasses['head-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['message-list']} */ ;
/** @type {__VLS_StyleScopedClasses['message-card']} */ ;
/** @type {__VLS_StyleScopedClasses['message-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['message-body']} */ ;
/** @type {__VLS_StyleScopedClasses['message-head']} */ ;
/** @type {__VLS_StyleScopedClasses['message-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['message-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['message-link']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            iconMap: iconMap,
            messages: messages,
            hideMessage: hideMessage,
            clearHidden: clearHidden,
            refresh: refresh,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
