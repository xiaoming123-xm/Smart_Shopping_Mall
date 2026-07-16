import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { listCategoryTree, listProducts } from "@/api/mall";
const route = useRoute();
const products = ref([]);
const backendCategories = ref([]);
const featured = computed(() => products.value[0]);
const sideProducts = computed(() => products.value.slice(1, 5));
const activeCategoryName = computed(() => String(route.query.categoryName || ""));
const activeCategoryId = computed(() => Number(route.query.categoryId || 0) || undefined);
const resolvedCategoryId = computed(() => activeCategoryId.value || findCategoryId(activeCategoryName.value));
const money = (n) => Number(n).toFixed(2);
const baseCategoryGroups = [
    { title: "数码家电", items: "手机通讯、电脑办公、数码影音、家用电器" },
    { title: "服装鞋帽", items: "女装、男装、运动户外、鞋靴箱包、内衣配饰" },
    { title: "美妆个护", items: "美妆护肤、个人护理、母婴用品、香水彩妆" },
    { title: "家居生活", items: "家具家装、家居家纺、厨具餐具、收纳清洁" },
    { title: "食品生鲜", items: "生鲜食品、休闲食品、酒水饮料、粮油调味" },
    { title: "文体娱乐", items: "图书文娱、运动健身、玩具乐器、办公设备" },
    { title: "其他", items: "在线课程、软件服务、会员服务、游戏点卡" },
];
const categoryAliases = {
    数码家电: ["数码家电", "手机数码", "家用电器", "数码"],
    服装鞋帽: ["服装鞋帽", "服装鞋包", "服饰"],
    美妆个护: ["美妆个护", "美妆", "个护"],
    家居生活: ["家居生活", "家居"],
    食品生鲜: ["食品生鲜", "食品"],
    文体娱乐: ["文体娱乐", "文娱", "运动"],
    其他: ["其他"],
};
const categoryGroups = computed(() => baseCategoryGroups.map((group) => ({
    ...group,
    id: findCategoryId(group.title),
})));
function flattenCategories(categories) {
    return categories.flatMap((category) => [category, ...flattenCategories(category.children || [])]);
}
function findCategoryId(title) {
    const aliases = categoryAliases[title] || [title];
    const categories = flattenCategories(backendCategories.value);
    return categories.find((category) => aliases.some((name) => category.name.includes(name) || name.includes(category.name)))?.id;
}
function categoryLink(group) {
    return {
        path: "/home",
        query: group.id ? { categoryId: group.id, categoryName: group.title } : { categoryName: group.title },
    };
}
async function loadProducts() {
    products.value = await listProducts(resolvedCategoryId.value);
}
onMounted(async () => {
    backendCategories.value = await listCategoryTree();
    await loadProducts();
});
watch(() => [route.query.categoryId, route.query.categoryName, backendCategories.value.length], loadProducts);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['cat-group']} */ ;
/** @type {__VLS_StyleScopedClasses['cat-group']} */ ;
/** @type {__VLS_StyleScopedClasses['cat-group']} */ ;
/** @type {__VLS_StyleScopedClasses['cat-group']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-caption']} */ ;
/** @type {__VLS_StyleScopedClasses['dots']} */ ;
/** @type {__VLS_StyleScopedClasses['dots']} */ ;
/** @type {__VLS_StyleScopedClasses['mini']} */ ;
/** @type {__VLS_StyleScopedClasses['mini']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['mini']} */ ;
/** @type {__VLS_StyleScopedClasses['mini']} */ ;
/** @type {__VLS_StyleScopedClasses['meta']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['recommend']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['category-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['recommend']} */ ;
/** @type {__VLS_StyleScopedClasses['hot-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "home" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "hero-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "category-panel" },
});
for (const [group] of __VLS_getVForSourceType((__VLS_ctx.categoryGroups))) {
    const __VLS_0 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        key: (group.title),
        to: (__VLS_ctx.categoryLink(group)),
        ...{ class: (['cat-group', { active: __VLS_ctx.activeCategoryName === group.title }]) },
    }));
    const __VLS_2 = __VLS_1({
        key: (group.title),
        to: (__VLS_ctx.categoryLink(group)),
        ...{ class: (['cat-group', { active: __VLS_ctx.activeCategoryName === group.title }]) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (group.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (group.items);
    var __VLS_3;
}
if (__VLS_ctx.featured) {
    const __VLS_4 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        to: (`/product/${__VLS_ctx.featured.id}`),
        ...{ class: "hero" },
    }));
    const __VLS_6 = __VLS_5({
        to: (`/product/${__VLS_ctx.featured.id}`),
        ...{ class: "hero" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (__VLS_ctx.featured.cover),
        alt: (__VLS_ctx.featured.name),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "hero-caption" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    (__VLS_ctx.featured.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dots" },
    });
    for (const [n] of __VLS_getVForSourceType((5))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span)({
            key: (n),
            ...{ class: ({ on: n === 1 }) },
        });
    }
    var __VLS_7;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "hero empty-panel" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "recommend" },
});
for (const [p] of __VLS_getVForSourceType((__VLS_ctx.sideProducts))) {
    const __VLS_8 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        key: (p.id),
        to: (`/product/${p.id}`),
        ...{ class: "mini" },
    }));
    const __VLS_10 = __VLS_9({
        key: (p.id),
        to: (`/product/${p.id}`),
        ...{ class: "mini" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (p.cover),
        alt: (p.name),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (p.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
    (__VLS_ctx.money(p.price));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (p.buyers);
    var __VLS_11;
}
if (!__VLS_ctx.sideProducts.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-panel recommend-empty" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "hot" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
(__VLS_ctx.activeCategoryName ? `${__VLS_ctx.activeCategoryName}商品` : "热门商品");
if (__VLS_ctx.activeCategoryName) {
    const __VLS_12 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        to: "/home",
        ...{ class: "all-link" },
    }));
    const __VLS_14 = __VLS_13({
        to: "/home",
        ...{ class: "all-link" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    var __VLS_15;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
    ...{ class: "line" },
});
if (__VLS_ctx.products.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "hot-grid" },
    });
    for (const [p] of __VLS_getVForSourceType((__VLS_ctx.products))) {
        const __VLS_16 = {}.RouterLink;
        /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
            key: (p.id),
            to: (`/product/${p.id}`),
            ...{ class: "card" },
        }));
        const __VLS_18 = __VLS_17({
            key: (p.id),
            to: (`/product/${p.id}`),
            ...{ class: "card" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        __VLS_19.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: (p.cover),
            alt: (p.name),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (p.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
        (__VLS_ctx.money(p.price));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (p.buyers);
        var __VLS_19;
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-panel hot-empty" },
    });
}
/** @type {__VLS_StyleScopedClasses['home']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['category-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-caption']} */ ;
/** @type {__VLS_StyleScopedClasses['dots']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['recommend']} */ ;
/** @type {__VLS_StyleScopedClasses['mini']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['recommend-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['hot']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['all-link']} */ ;
/** @type {__VLS_StyleScopedClasses['line']} */ ;
/** @type {__VLS_StyleScopedClasses['hot-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['meta']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['hot-empty']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            products: products,
            featured: featured,
            sideProducts: sideProducts,
            activeCategoryName: activeCategoryName,
            money: money,
            categoryGroups: categoryGroups,
            categoryLink: categoryLink,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
