import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { Check, Delete, Link, MagicStick, Refresh } from "@element-plus/icons-vue";
import { ApiError, selectionApi } from "@/api";
import { loadSelectionProducts } from "@/use-cases/selection/loadSelectionProducts";
import { startSelectionCrawler } from "@/use-cases/selection/startSelectionCrawler";
import { watchCrawlerStatus } from "@/use-cases/selection/watchCrawlerStatus";
const loading = ref(false);
const crawlerLoading = ref(false);
const sessionLoading = ref(false);
const products = ref([]);
const selectedProducts = ref([]);
const platformOptions = [
    { label: "拼多多", value: "PDD", enabled: true },
    { label: "淘宝", value: "TAOBAO", enabled: false },
    { label: "京东", value: "JD", enabled: false },
];
const selectedPlatform = ref("PDD");
const sort = ref("sales");
const keyword = ref("蚊子");
const limit = ref(100);
const task = ref(null);
const pddSession = ref(null);
const aiAnalysis = ref("");
const taskAlertType = computed(() => {
    if (!task.value)
        return "info";
    if (["SUCCESS", "PARTIAL_SUCCESS"].includes(task.value.status))
        return "success";
    if (["NOT_LOGGED_IN", "LOGIN_EXPIRED", "NO_REAL_DATA", "FAILED"].includes(task.value.status))
        return "error";
    return "info";
});
const taskTitle = computed(() => task.value ? `抓取任务 ${task.value.taskId}：${task.value.status}，真实商品 ${task.value.successCount}/${task.value.totalCount}${task.value.failReason ? `，${task.value.failReason}` : ""}` : "");
const currentPlatform = computed(() => platformOptions.find((platform) => platform.value === selectedPlatform.value) || platformOptions[0]);
const currentSessionReady = computed(() => selectedPlatform.value === "PDD" && Boolean(pddSession.value?.ready));
const sessionMessage = computed(() => {
    if (selectedPlatform.value === "PDD")
        return pddSession.value?.message || "启动抓取前需要先完成拼多多登录。";
    return `${currentPlatform.value.label}入口已预留，当前版本暂未接入登录和抓取接口。`;
});
async function init() {
    try {
        await loadPddSession();
        await loadProducts();
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "加载选品数据失败");
    }
}
async function loadProducts() {
    loading.value = true;
    try {
        products.value = await loadSelectionProducts({ sort: sort.value, order: "desc" });
        selectedProducts.value = [];
        aiAnalysis.value = "";
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "加载真实商品失败");
    }
    finally {
        loading.value = false;
    }
}
async function loadPddSession() {
    pddSession.value = await selectionApi.pddSession();
}
async function onPlatformChange() {
    task.value = null;
    selectedProducts.value = [];
    aiAnalysis.value = "";
    if (selectedPlatform.value === "PDD")
        await loadPddSession();
}
function ensurePlatformEnabled() {
    if (selectedPlatform.value === "PDD")
        return true;
    ElMessage.warning(`${currentPlatform.value.label}暂未接入，当前只能使用拼多多抓取。`);
    return false;
}
async function openPddLogin() {
    sessionLoading.value = true;
    try {
        pddSession.value = await selectionApi.openPddLogin();
        ElMessage.success("已打开拼多多登录窗口，请在浏览器里完成登录");
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "打开拼多多登录失败");
    }
    finally {
        sessionLoading.value = false;
    }
}
async function openPlatformLogin() {
    if (!ensurePlatformEnabled())
        return;
    await openPddLogin();
}
async function confirmPddLogin() {
    sessionLoading.value = true;
    try {
        pddSession.value = await selectionApi.confirmPddLogin();
        if (pddSession.value.ready)
            ElMessage.success("拼多多登录会话已验证");
        else
            ElMessage.warning(pddSession.value.message || "还没有检测到有效登录，请确认拼多多页面已经登录成功");
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "确认登录失败");
    }
    finally {
        sessionLoading.value = false;
    }
}
async function confirmPlatformLogin() {
    if (!ensurePlatformEnabled())
        return;
    await confirmPddLogin();
}
async function clearPddSession() {
    sessionLoading.value = true;
    try {
        pddSession.value = await selectionApi.clearPddSession();
        ElMessage.success("拼多多登录确认已清除");
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "清除会话失败");
    }
    finally {
        sessionLoading.value = false;
    }
}
async function clearPlatformSession() {
    if (!ensurePlatformEnabled())
        return;
    await clearPddSession();
}
async function startCrawler() {
    if (!ensurePlatformEnabled())
        return;
    await loadPddSession();
    if (!pddSession.value?.ready) {
        ElMessage.warning("请先登录拼多多，并完成后端会话验证");
        return;
    }
    crawlerLoading.value = true;
    try {
        task.value = await startSelectionCrawler({ keyword: keyword.value.trim() || undefined, limit: limit.value });
        await watchCrawlerStatus(task.value.taskId, (next) => { task.value = next; });
        await loadProducts();
        if (["SUCCESS", "PARTIAL_SUCCESS"].includes(task.value.status))
            ElMessage.success("真实选品数据已刷新");
        else
            ElMessage.warning(task.value.failReason || "没有抓到真实商品数据");
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "启动抓取失败");
    }
    finally {
        crawlerLoading.value = false;
    }
}
function onSelectionChange(rows) {
    selectedProducts.value = rows.slice(0, 4);
    aiAnalysis.value = "";
}
function buildAiAnalysis() {
    if (selectedProducts.value.length < 2) {
        ElMessage.warning("请至少选择两个商品进行对比");
        return;
    }
    const sorted = selectedProducts.value.slice().sort((a, b) => Number(b.salesAmount || 0) - Number(a.salesAmount || 0));
    const lines = ["AI客观对比（只基于已选真实数据）："];
    sorted.forEach((item, index) => {
        lines.push(`${index + 1}. ${item.productName}：单价 ¥${formatMoney(item.avgPrice)}，销量 ${formatNumber(item.sales7d)}，成交额估算 ¥${formatMoney(item.salesAmount)}，来源 ${item.sourceUrl ? "有" : "数据不足"}。`);
    });
    const maxSales = sorted[0];
    const minSales = sorted[sorted.length - 1];
    lines.push(`销量差异：${maxSales.productName} 高于 ${minSales.productName}，差值 ${formatNumber(Number(maxSales.sales7d || 0) - Number(minSales.sales7d || 0))}。`);
    lines.push("利润、采购成本、运费、平台费用：数据不足，不能估算利润或给出赚钱结论。");
    aiAnalysis.value = lines.join("\n");
}
function formatNumber(n) {
    const value = Number(n || 0);
    return value >= 10000 ? `${(value / 10000).toFixed(1)}万` : String(value);
}
function formatMoney(n) {
    return Number(n || 0).toFixed(2);
}
onMounted(init);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['pdd-session-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['pdd-session-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['session-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['session-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-head']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-head']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-table']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-table']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-table']} */ ;
/** @type {__VLS_StyleScopedClasses['product-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['pdd-session-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-head']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['session-actions']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "selection-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
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
    modelValue: (__VLS_ctx.selectedPlatform),
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedPlatform),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onChange: (__VLS_ctx.onPlatformChange)
};
__VLS_3.slots.default;
for (const [platform] of __VLS_getVForSourceType((__VLS_ctx.platformOptions))) {
    const __VLS_8 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        key: (platform.value),
        label: (platform.label),
        value: (platform.value),
    }));
    const __VLS_10 = __VLS_9({
        key: (platform.value),
        label: (platform.label),
        value: (platform.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
var __VLS_3;
const __VLS_12 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.sort),
    ...{ style: {} },
}));
const __VLS_14 = __VLS_13({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.sort),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onChange: (__VLS_ctx.loadProducts)
};
__VLS_15.slots.default;
const __VLS_20 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    label: "按销量",
    value: "sales",
}));
const __VLS_22 = __VLS_21({
    label: "按销量",
    value: "sales",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const __VLS_24 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    label: "按成交额",
    value: "amount",
}));
const __VLS_26 = __VLS_25({
    label: "按成交额",
    value: "amount",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
const __VLS_28 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    label: "按抓取时间",
    value: "fetched_time",
}));
const __VLS_30 = __VLS_29({
    label: "按抓取时间",
    value: "fetched_time",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
var __VLS_15;
const __VLS_32 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.keyword),
    placeholder: "如：蚊子、羽绒服",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_34 = __VLS_33({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.keyword),
    placeholder: "如：蚊子、羽绒服",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onKeyup: (__VLS_ctx.startCrawler)
};
var __VLS_35;
const __VLS_40 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    modelValue: (__VLS_ctx.limit),
    min: (10),
    max: (100),
    controlsPosition: "right",
    ...{ style: {} },
}));
const __VLS_42 = __VLS_41({
    modelValue: (__VLS_ctx.limit),
    min: (10),
    max: (100),
    controlsPosition: "right",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const __VLS_44 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    ...{ 'onClick': {} },
    type: "primary",
    icon: (__VLS_ctx.Refresh),
    loading: (__VLS_ctx.crawlerLoading),
}));
const __VLS_46 = __VLS_45({
    ...{ 'onClick': {} },
    type: "primary",
    icon: (__VLS_ctx.Refresh),
    loading: (__VLS_ctx.crawlerLoading),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
let __VLS_48;
let __VLS_49;
let __VLS_50;
const __VLS_51 = {
    onClick: (__VLS_ctx.startCrawler)
};
__VLS_47.slots.default;
var __VLS_47;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "pdd-session-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.currentPlatform.label);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: (['session-pill', __VLS_ctx.currentSessionReady ? 'ready' : 'pending']) },
});
(__VLS_ctx.currentSessionReady ? "已验证" : "未验证");
if (!__VLS_ctx.currentPlatform.enabled) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "session-pill disabled" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.sessionMessage);
if (__VLS_ctx.selectedPlatform === 'PDD' && __VLS_ctx.pddSession?.confirmedAt) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "session-time" },
    });
    (__VLS_ctx.pddSession.confirmedAt);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "session-actions" },
});
const __VLS_52 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.Link),
    loading: (__VLS_ctx.sessionLoading),
}));
const __VLS_54 = __VLS_53({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.Link),
    loading: (__VLS_ctx.sessionLoading),
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
let __VLS_56;
let __VLS_57;
let __VLS_58;
const __VLS_59 = {
    onClick: (__VLS_ctx.openPlatformLogin)
};
__VLS_55.slots.default;
(__VLS_ctx.currentPlatform.label);
var __VLS_55;
const __VLS_60 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    ...{ 'onClick': {} },
    type: "success",
    icon: (__VLS_ctx.Check),
    loading: (__VLS_ctx.sessionLoading),
}));
const __VLS_62 = __VLS_61({
    ...{ 'onClick': {} },
    type: "success",
    icon: (__VLS_ctx.Check),
    loading: (__VLS_ctx.sessionLoading),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_64;
let __VLS_65;
let __VLS_66;
const __VLS_67 = {
    onClick: (__VLS_ctx.confirmPlatformLogin)
};
__VLS_63.slots.default;
var __VLS_63;
const __VLS_68 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.Delete),
    loading: (__VLS_ctx.sessionLoading),
}));
const __VLS_70 = __VLS_69({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.Delete),
    loading: (__VLS_ctx.sessionLoading),
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
let __VLS_72;
let __VLS_73;
let __VLS_74;
const __VLS_75 = {
    onClick: (__VLS_ctx.clearPlatformSession)
};
__VLS_71.slots.default;
var __VLS_71;
if (__VLS_ctx.task) {
    const __VLS_76 = {}.ElAlert;
    /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        title: (__VLS_ctx.taskTitle),
        type: (__VLS_ctx.taskAlertType),
        showIcon: true,
        closable: (false),
    }));
    const __VLS_78 = __VLS_77({
        title: (__VLS_ctx.taskTitle),
        type: (__VLS_ctx.taskAlertType),
        showIcon: true,
        closable: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
}
if (__VLS_ctx.selectedProducts.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "compare-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "compare-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.selectedProducts.length);
    const __VLS_80 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.MagicStick),
    }));
    const __VLS_82 = __VLS_81({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.MagicStick),
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    let __VLS_84;
    let __VLS_85;
    let __VLS_86;
    const __VLS_87 = {
        onClick: (__VLS_ctx.buildAiAnalysis)
    };
    __VLS_83.slots.default;
    var __VLS_83;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "compare-table-wrap" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
        ...{ class: "compare-table" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.selectedProducts))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
            key: (item.id),
        });
        (item.rankNo);
        (item.productName);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.selectedProducts))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            key: (`img-${item.id}`),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            ...{ class: "compare-image" },
            src: (item.imageUrl),
            alt: (item.productName),
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.selectedProducts))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            key: (`platform-${item.id}`),
        });
        (item.platform || "数据不足");
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.selectedProducts))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            key: (`price-${item.id}`),
        });
        (__VLS_ctx.formatMoney(item.avgPrice));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.selectedProducts))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            key: (`sales-${item.id}`),
        });
        (__VLS_ctx.formatNumber(item.sales7d));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.selectedProducts))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            key: (`amount-${item.id}`),
        });
        (__VLS_ctx.formatMoney(item.salesAmount));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.selectedProducts))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            key: (`time-${item.id}`),
        });
        (item.fetchedAt || "数据不足");
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.selectedProducts))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            key: (`source-${item.id}`),
        });
        if (item.sourceUrl) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
                href: (item.sourceUrl),
                target: "_blank",
                rel: "noreferrer",
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
    }
    if (__VLS_ctx.aiAnalysis) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
            ...{ class: "ai-analysis" },
        });
        (__VLS_ctx.aiAnalysis);
    }
}
if (!__VLS_ctx.loading && !__VLS_ctx.products.length) {
    const __VLS_88 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        description: "暂无真实选品数据。请先登录拼多多并启动小批量抓取；没有真实来源的数据不会显示。",
    }));
    const __VLS_90 = __VLS_89({
        description: "暂无真实选品数据。请先登录拼多多并启动小批量抓取；没有真实来源的数据不会显示。",
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
}
else {
    const __VLS_92 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        ...{ 'onSelectionChange': {} },
        data: (__VLS_ctx.products),
        border: true,
        stripe: true,
        ...{ class: "product-table" },
    }));
    const __VLS_94 = __VLS_93({
        ...{ 'onSelectionChange': {} },
        data: (__VLS_ctx.products),
        border: true,
        stripe: true,
        ...{ class: "product-table" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    let __VLS_96;
    let __VLS_97;
    let __VLS_98;
    const __VLS_99 = {
        onSelectionChange: (__VLS_ctx.onSelectionChange)
    };
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
    __VLS_95.slots.default;
    const __VLS_100 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        type: "selection",
        width: "48",
    }));
    const __VLS_102 = __VLS_101({
        type: "selection",
        width: "48",
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    const __VLS_104 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
        label: "商品",
        minWidth: "320",
    }));
    const __VLS_106 = __VLS_105({
        label: "商品",
        minWidth: "320",
    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    __VLS_107.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_107.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "product-cell" },
        });
        const __VLS_108 = {}.ElImage;
        /** @type {[typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ]} */ ;
        // @ts-ignore
        const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
            ...{ class: "cover" },
            src: (row.imageUrl),
            fit: "cover",
        }));
        const __VLS_110 = __VLS_109({
            ...{ class: "cover" },
            src: (row.imageUrl),
            fit: "cover",
        }, ...__VLS_functionalComponentArgsRest(__VLS_109));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
            ...{ class: "name" },
            href: (row.sourceUrl),
            target: "_blank",
            rel: "noreferrer",
        });
        (row.productName);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (row.platform || "PDD");
        (row.sourceProductId || "数据不足");
    }
    var __VLS_107;
    const __VLS_112 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
        prop: "rankNo",
        label: "榜单",
        width: "80",
    }));
    const __VLS_114 = __VLS_113({
        prop: "rankNo",
        label: "榜单",
        width: "80",
    }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    const __VLS_116 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
        label: "单价",
        width: "110",
    }));
    const __VLS_118 = __VLS_117({
        label: "单价",
        width: "110",
    }, ...__VLS_functionalComponentArgsRest(__VLS_117));
    __VLS_119.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_119.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        (__VLS_ctx.formatMoney(row.avgPrice));
    }
    var __VLS_119;
    const __VLS_120 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
        label: "销量",
        width: "110",
    }));
    const __VLS_122 = __VLS_121({
        label: "销量",
        width: "110",
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    __VLS_123.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_123.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        (__VLS_ctx.formatNumber(row.sales7d));
    }
    var __VLS_123;
    const __VLS_124 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
        label: "成交额估算",
        width: "150",
    }));
    const __VLS_126 = __VLS_125({
        label: "成交额估算",
        width: "150",
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    __VLS_127.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_127.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        (__VLS_ctx.formatMoney(row.salesAmount));
    }
    var __VLS_127;
    const __VLS_128 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
        prop: "trendTag",
        label: "信息",
        width: "120",
    }));
    const __VLS_130 = __VLS_129({
        prop: "trendTag",
        label: "信息",
        width: "120",
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    const __VLS_132 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
        prop: "fetchedAt",
        label: "抓取时间",
        width: "180",
    }));
    const __VLS_134 = __VLS_133({
        prop: "fetchedAt",
        label: "抓取时间",
        width: "180",
    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
    var __VLS_95;
}
/** @type {__VLS_StyleScopedClasses['selection-page']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['pdd-session-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['session-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled']} */ ;
/** @type {__VLS_StyleScopedClasses['session-time']} */ ;
/** @type {__VLS_StyleScopedClasses['session-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-head']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-table']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-image']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-analysis']} */ ;
/** @type {__VLS_StyleScopedClasses['product-table']} */ ;
/** @type {__VLS_StyleScopedClasses['product-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['cover']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Check: Check,
            Delete: Delete,
            Link: Link,
            MagicStick: MagicStick,
            Refresh: Refresh,
            loading: loading,
            crawlerLoading: crawlerLoading,
            sessionLoading: sessionLoading,
            products: products,
            selectedProducts: selectedProducts,
            platformOptions: platformOptions,
            selectedPlatform: selectedPlatform,
            sort: sort,
            keyword: keyword,
            limit: limit,
            task: task,
            pddSession: pddSession,
            aiAnalysis: aiAnalysis,
            taskAlertType: taskAlertType,
            taskTitle: taskTitle,
            currentPlatform: currentPlatform,
            currentSessionReady: currentSessionReady,
            sessionMessage: sessionMessage,
            loadProducts: loadProducts,
            onPlatformChange: onPlatformChange,
            openPlatformLogin: openPlatformLogin,
            confirmPlatformLogin: confirmPlatformLogin,
            clearPlatformSession: clearPlatformSession,
            startCrawler: startCrawler,
            onSelectionChange: onSelectionChange,
            buildAiAnalysis: buildAiAnalysis,
            formatNumber: formatNumber,
            formatMoney: formatMoney,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
