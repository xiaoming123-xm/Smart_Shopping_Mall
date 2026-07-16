import { nextTick, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getProductDetail } from "@/api/mall";
import { useCartStore } from "@/stores/cart";
const route = useRoute();
const router = useRouter();
const cart = useCartStore();
const p = ref();
const qty = ref(1);
const tip = ref("");
const activeImage = ref("");
const selectedVariantLabel = ref("");
const selectedVariant = ref(null);
const infoEl = ref();
const money = (n) => Number(n).toFixed(2);
async function load() {
    p.value = await getProductDetail(Number(route.params.id));
    qty.value = 1;
    await nextTick();
    activeImage.value = p.value?.images[0] || p.value?.cover || "";
    const firstVariant = p.value?.variants[0] || null;
    selectedVariant.value = firstVariant;
    selectedVariantLabel.value = firstVariant?.label || "";
    focusPurchaseAreaIfNeeded();
}
function selectVariant(variant) {
    selectedVariant.value = variant;
    selectedVariantLabel.value = variant.label;
    activeImage.value = variant.image;
}
function buildSelectedProduct() {
    if (!p.value)
        return null;
    return {
        ...p.value,
        skuId: selectedVariant.value?.skuId || p.value.skuId,
        skuCode: selectedVariant.value?.skuCode || p.value.skuCode,
        variants: selectedVariant.value ? [selectedVariant.value] : p.value.variants,
    };
}
function addCart() {
    const product = buildSelectedProduct();
    if (!product)
        return;
    cart.add(product, qty.value);
    tip.value = "已加入购物车";
    setTimeout(() => (tip.value = ""), 1500);
}
function buyNow() {
    const product = buildSelectedProduct();
    if (!product)
        return;
    cart.add(product, qty.value);
    router.push("/cart");
}
function focusPurchaseAreaIfNeeded() {
    if (route.query.from !== "ai")
        return;
    infoEl.value?.scrollIntoView({ behavior: "smooth", block: "start" });
}
onMounted(load);
watch(() => route.params.id, load);
watch(() => route.query.from, () => nextTick(focusPurchaseAreaIfNeeded));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['thumbs']} */ ;
/** @type {__VLS_StyleScopedClasses['thumbs']} */ ;
/** @type {__VLS_StyleScopedClasses['thumbs']} */ ;
/** @type {__VLS_StyleScopedClasses['main-img']} */ ;
/** @type {__VLS_StyleScopedClasses['variants']} */ ;
/** @type {__VLS_StyleScopedClasses['variants']} */ ;
/** @type {__VLS_StyleScopedClasses['on']} */ ;
/** @type {__VLS_StyleScopedClasses['variants']} */ ;
/** @type {__VLS_StyleScopedClasses['stock']} */ ;
/** @type {__VLS_StyleScopedClasses['qty']} */ ;
/** @type {__VLS_StyleScopedClasses['qty']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['on']} */ ;
/** @type {__VLS_StyleScopedClasses['product-page']} */ ;
/** @type {__VLS_StyleScopedClasses['gallery']} */ ;
/** @type {__VLS_StyleScopedClasses['thumbs']} */ ;
/** @type {__VLS_StyleScopedClasses['main-img']} */ ;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.p) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "product-page" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "gallery" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "thumbs" },
    });
    for (const [img] of __VLS_getVForSourceType((__VLS_ctx.p.images))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.p))
                        return;
                    __VLS_ctx.activeImage = img;
                } },
            key: (img),
            ...{ class: ({ on: __VLS_ctx.activeImage === img }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: (img),
            alt: (__VLS_ctx.p.name),
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        ...{ class: "main-img" },
        src: (__VLS_ctx.activeImage),
        alt: (__VLS_ctx.p.name),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ref: "infoEl",
        ...{ class: "info" },
    });
    /** @type {typeof __VLS_ctx.infoEl} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    (__VLS_ctx.p.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "price" },
    });
    (__VLS_ctx.money(__VLS_ctx.p.price));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "variants" },
    });
    for (const [v] of __VLS_getVForSourceType((__VLS_ctx.p.variants))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.p))
                        return;
                    __VLS_ctx.selectVariant(v);
                } },
            key: (`${v.label}-${v.skuId || ''}`),
            ...{ class: ({ on: __VLS_ctx.selectedVariantLabel === v.label }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: (v.image),
            alt: (v.label),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (v.label);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stock" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
    (__VLS_ctx.p.stock);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "qty" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.p))
                    return;
                __VLS_ctx.qty = Math.max(1, __VLS_ctx.qty - 1);
            } },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.qty);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.p))
                    return;
                __VLS_ctx.qty++;
            } },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.addCart) },
        ...{ class: "add" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.buyNow) },
        ...{ class: "buy" },
    });
    if (__VLS_ctx.tip) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "tip" },
        });
        (__VLS_ctx.tip);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
        ...{ class: "detail" },
    });
    for (const [line] of __VLS_getVForSourceType((__VLS_ctx.p.detail))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
            key: (line),
        });
        (line);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "below" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tabs" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ class: "on" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "review-empty" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty" },
    });
}
/** @type {__VLS_StyleScopedClasses['product-page']} */ ;
/** @type {__VLS_StyleScopedClasses['gallery']} */ ;
/** @type {__VLS_StyleScopedClasses['thumbs']} */ ;
/** @type {__VLS_StyleScopedClasses['main-img']} */ ;
/** @type {__VLS_StyleScopedClasses['info']} */ ;
/** @type {__VLS_StyleScopedClasses['price']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['variants']} */ ;
/** @type {__VLS_StyleScopedClasses['stock']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['qty']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['add']} */ ;
/** @type {__VLS_StyleScopedClasses['buy']} */ ;
/** @type {__VLS_StyleScopedClasses['tip']} */ ;
/** @type {__VLS_StyleScopedClasses['detail']} */ ;
/** @type {__VLS_StyleScopedClasses['below']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['on']} */ ;
/** @type {__VLS_StyleScopedClasses['review-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            p: p,
            qty: qty,
            tip: tip,
            activeImage: activeImage,
            selectedVariantLabel: selectedVariantLabel,
            infoEl: infoEl,
            money: money,
            selectVariant: selectVariant,
            addCart: addCart,
            buyNow: buyNow,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
