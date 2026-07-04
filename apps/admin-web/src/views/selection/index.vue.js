import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
import { ApiError } from "@/api";
import { loadSelectionCategories } from "@/use-cases/selection/loadSelectionCategories";
import { loadSelectionProducts } from "@/use-cases/selection/loadSelectionProducts";
import { startSelectionCrawler } from "@/use-cases/selection/startSelectionCrawler";
import { watchCrawlerStatus } from "@/use-cases/selection/watchCrawlerStatus";
const loading = ref(false);
const crawlerLoading = ref(false);
const categories = ref([]);
const products = ref([]);
const activeRootId = ref();
const activeCategoryId = ref();
const sort = ref("sales");
const task = ref(null);
const activeRoot = computed(() => categories.value.find((c) => c.id === activeRootId.value));
async function init() {
    try {
        categories.value = await loadSelectionCategories();
        activeRootId.value = categories.value[0]?.id;
        activeCategoryId.value = activeRootId.value;
        await loadProducts();
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "加载选品数据失败");
    }
}
async function loadProducts() {
    if (!activeCategoryId.value)
        return;
    loading.value = true;
    try {
        products.value = await loadSelectionProducts({ categoryId: activeCategoryId.value, sort: sort.value, order: "desc" });
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "加载榜单失败");
    }
    finally {
        loading.value = false;
    }
}
function selectRoot(id) {
    activeRootId.value = id;
    activeCategoryId.value = id;
    loadProducts();
}
function selectCategory(id) {
    activeCategoryId.value = id || activeRootId.value;
    loadProducts();
}
async function startCrawler() {
    if (!activeCategoryId.value)
        return;
    crawlerLoading.value = true;
    try {
        task.value = await startSelectionCrawler({ categoryId: activeCategoryId.value });
        await watchCrawlerStatus(task.value.taskId, (next) => { task.value = next; });
        await loadProducts();
        ElMessage.success("选品榜单已刷新");
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "启动抓取失败");
    }
    finally {
        crawlerLoading.value = false;
    }
}
function formatNumber(n) {
    return n >= 10000 ? `${(n / 10000).toFixed(1)}万` : String(n);
}
function competitionType(level) {
    if (level === "低")
        return "success";
    if (level === "高")
        return "danger";
    return "warning";
}
onMounted(init);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-band']} */ ;
/** @type {__VLS_StyleScopedClasses['category-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['metrics']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "selection-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "topbar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions" },
});
const __VLS_0 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.sort),
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.sort),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onChange: (__VLS_ctx.loadProducts)
};
__VLS_3.slots.default;
const __VLS_8 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    label: "按销量",
    value: "sales",
}));
const __VLS_10 = __VLS_9({
    label: "按销量",
    value: "sales",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const __VLS_12 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    label: "按利润",
    value: "profit",
}));
const __VLS_14 = __VLS_13({
    label: "按利润",
    value: "profit",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const __VLS_16 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    label: "按抓取时间",
    value: "fetched_time",
}));
const __VLS_18 = __VLS_17({
    label: "按抓取时间",
    value: "fetched_time",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
var __VLS_3;
const __VLS_20 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onClick': {} },
    type: "primary",
    icon: (__VLS_ctx.Refresh),
    loading: (__VLS_ctx.crawlerLoading),
}));
const __VLS_22 = __VLS_21({
    ...{ 'onClick': {} },
    type: "primary",
    icon: (__VLS_ctx.Refresh),
    loading: (__VLS_ctx.crawlerLoading),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onClick: (__VLS_ctx.startCrawler)
};
__VLS_23.slots.default;
var __VLS_23;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "category-band" },
});
for (const [c] of __VLS_getVForSourceType((__VLS_ctx.categories))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectRoot(c.id);
            } },
        key: (c.id),
        ...{ class: (['category-tab', { active: __VLS_ctx.activeRootId === c.id }]) },
    });
    (c.categoryName);
}
if (__VLS_ctx.activeRoot?.children?.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "sub-band" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.activeRoot?.children?.length))
                    return;
                __VLS_ctx.selectCategory(__VLS_ctx.activeRootId);
            } },
        ...{ class: (['sub-tab', { active: !__VLS_ctx.activeCategoryId || __VLS_ctx.activeCategoryId === __VLS_ctx.activeRootId }]) },
    });
    for (const [c] of __VLS_getVForSourceType((__VLS_ctx.activeRoot.children))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeRoot?.children?.length))
                        return;
                    __VLS_ctx.selectCategory(c.id);
                } },
            key: (c.id),
            ...{ class: (['sub-tab', { active: __VLS_ctx.activeCategoryId === c.id }]) },
        });
        (c.categoryName);
    }
}
if (__VLS_ctx.task) {
    const __VLS_28 = {}.ElAlert;
    /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        title: (`抓取任务 ${__VLS_ctx.task.taskId}：${__VLS_ctx.task.status}，成功 ${__VLS_ctx.task.successCount}/${__VLS_ctx.task.totalCount}`),
        type: (__VLS_ctx.task.status === 'FAILED' ? 'error' : __VLS_ctx.task.status === 'SUCCESS' ? 'success' : 'info'),
        showIcon: true,
        closable: (false),
    }));
    const __VLS_30 = __VLS_29({
        title: (`抓取任务 ${__VLS_ctx.task.taskId}：${__VLS_ctx.task.status}，成功 ${__VLS_ctx.task.successCount}/${__VLS_ctx.task.totalCount}`),
        type: (__VLS_ctx.task.status === 'FAILED' ? 'error' : __VLS_ctx.task.status === 'SUCCESS' ? 'success' : 'info'),
        showIcon: true,
        closable: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "rank-grid" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.products))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (item.id),
        ...{ class: "product-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "rank" },
    });
    (item.rankNo);
    const __VLS_32 = {}.ElImage;
    /** @type {[typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ class: "cover" },
        src: (item.imageUrl),
        fit: "cover",
    }));
    const __VLS_34 = __VLS_33({
        ...{ class: "cover" },
        src: (item.imageUrl),
        fit: "cover",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "body" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
        ...{ class: "name" },
        href: (item.sourceUrl),
        target: "_blank",
        rel: "noreferrer",
    });
    (item.productName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metrics" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
    (__VLS_ctx.formatNumber(item.sales7d));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
    (item.avgPrice);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
    (item.profitEstimate);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tags" },
    });
    const __VLS_36 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        size: "small",
        type: "success",
    }));
    const __VLS_38 = __VLS_37({
        size: "small",
        type: "success",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    (item.trendTag);
    var __VLS_39;
    const __VLS_40 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        size: "small",
        type: (__VLS_ctx.competitionType(item.competitionLevel)),
    }));
    const __VLS_42 = __VLS_41({
        size: "small",
        type: (__VLS_ctx.competitionType(item.competitionLevel)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    (item.competitionLevel);
    var __VLS_43;
}
/** @type {__VLS_StyleScopedClasses['selection-page']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['category-band']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-band']} */ ;
/** @type {__VLS_StyleScopedClasses['rank-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['product-card']} */ ;
/** @type {__VLS_StyleScopedClasses['rank']} */ ;
/** @type {__VLS_StyleScopedClasses['cover']} */ ;
/** @type {__VLS_StyleScopedClasses['body']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['metrics']} */ ;
/** @type {__VLS_StyleScopedClasses['tags']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Refresh: Refresh,
            loading: loading,
            crawlerLoading: crawlerLoading,
            categories: categories,
            products: products,
            activeRootId: activeRootId,
            activeCategoryId: activeCategoryId,
            sort: sort,
            task: task,
            activeRoot: activeRoot,
            loadProducts: loadProducts,
            selectRoot: selectRoot,
            selectCategory: selectCategory,
            startCrawler: startCrawler,
            formatNumber: formatNumber,
            competitionType: competitionType,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
