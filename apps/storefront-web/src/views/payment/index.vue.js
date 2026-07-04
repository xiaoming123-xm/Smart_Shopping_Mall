import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useOrderStore } from "@/stores/order";
import { payOrder } from "@/use-cases/payOrder";
const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const paying = ref(false);
const order = computed(() => orderStore.getOrder(String(route.params.orderId)));
const firstItemName = computed(() => order.value?.items[0]?.product.name || "EasyMall 智慧商城订单");
const money = (n) => Number(n).toFixed(2);
async function doPay() {
    if (!order.value || paying.value)
        return;
    paying.value = true;
    await payOrder(String(route.params.orderId), router);
    paying.value = false;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['pay-logo']} */ ;
/** @type {__VLS_StyleScopedClasses['order-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['order-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['order-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['order-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['order-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['qr-area']} */ ;
/** @type {__VLS_StyleScopedClasses['login-area']} */ ;
/** @type {__VLS_StyleScopedClasses['login-title']} */ ;
/** @type {__VLS_StyleScopedClasses['login-area']} */ ;
/** @type {__VLS_StyleScopedClasses['login-area']} */ ;
/** @type {__VLS_StyleScopedClasses['login-area']} */ ;
/** @type {__VLS_StyleScopedClasses['login-area']} */ ;
/** @type {__VLS_StyleScopedClasses['pay-box']} */ ;
/** @type {__VLS_StyleScopedClasses['qr-area']} */ ;
/** @type {__VLS_StyleScopedClasses['login-area']} */ ;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.order) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "alipay-page" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pay-logo" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "mark" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.em, __VLS_intrinsicElements.em)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "order-strip" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    (__VLS_ctx.firstItemName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.money(__VLS_ctx.order.amount));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "pay-box" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pay-tabs" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "qr-area" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        ...{ class: "qr" },
        src: "/images/payment/alipay-demo-qr.png",
        alt: "支付宝支付二维码",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "links" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "login-area" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "login-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        placeholder: "手机号/邮箱",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "password",
        placeholder: "请输入账户的支付密码",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.doPay) },
        disabled: (__VLS_ctx.paying || __VLS_ctx.order.status !== 'CREATED'),
    });
    (__VLS_ctx.paying ? "正在提交中..." : __VLS_ctx.order.status === "CREATED" ? "下一步" : "已支付");
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty" },
    });
}
/** @type {__VLS_StyleScopedClasses['alipay-page']} */ ;
/** @type {__VLS_StyleScopedClasses['pay-logo']} */ ;
/** @type {__VLS_StyleScopedClasses['mark']} */ ;
/** @type {__VLS_StyleScopedClasses['order-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['pay-box']} */ ;
/** @type {__VLS_StyleScopedClasses['pay-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['qr-area']} */ ;
/** @type {__VLS_StyleScopedClasses['qr']} */ ;
/** @type {__VLS_StyleScopedClasses['links']} */ ;
/** @type {__VLS_StyleScopedClasses['login-area']} */ ;
/** @type {__VLS_StyleScopedClasses['login-title']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            paying: paying,
            order: order,
            firstItemName: firstItemName,
            money: money,
            doPay: doPay,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
