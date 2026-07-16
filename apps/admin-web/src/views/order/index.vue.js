import { computed, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
import { approveRefund, loadOrder, loadOrders, rejectRefund, shipOrder } from "@/use-cases/order.uc";
import { ApiError } from "@/api";
const loading = ref(false);
const shipping = ref(false);
const list = ref([]);
const showOnlyRefund = ref(false);
const detailVisible = ref(false);
const shipVisible = ref(false);
const detail = ref(null);
const shipOrderRow = ref(null);
const shipForm = reactive({
    sender: "悟空",
    senderPhone: "18600000000",
    senderAddress: "江苏省连云港市花果山水帘洞",
    logisticsCompany: "顺丰速运",
    trackingNo: "SF123456465",
});
const refundOrders = computed(() => list.value.filter((order) => order.status === "REFUND_REQUESTED"));
const filteredList = computed(() => (showOnlyRefund.value ? refundOrders.value : list.value));
async function load() {
    loading.value = true;
    try {
        list.value = await loadOrders();
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "加载失败");
    }
    finally {
        loading.value = false;
    }
}
async function openDetail(row) {
    detailVisible.value = true;
    try {
        detail.value = await loadOrder(row.id);
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "加载失败");
    }
}
function openShip(row) {
    shipOrderRow.value = row;
    shipForm.trackingNo = row.trackingNo || "SF123456465";
    shipVisible.value = true;
}
async function submitShip() {
    if (!shipOrderRow.value)
        return;
    shipping.value = true;
    try {
        await shipOrder(shipOrderRow.value.id, { ...shipForm });
        ElMessage.success("已发货");
        shipVisible.value = false;
        await load();
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "发货失败");
    }
    finally {
        shipping.value = false;
    }
}
async function onApproveRefund(row) {
    const confirmed = await ElMessageBox.confirm("确认同意退货并退款？同意后只退款，不会自动回补库存，商品需在库存管理里人工入库。", "同意退货", { type: "warning" }).then(() => true).catch(() => false);
    if (!confirmed)
        return;
    try {
        await approveRefund(row.id, "商家已同意退货，钱已退回。");
        ElMessage.success("已同意退货并退款");
        await load();
        if (detail.value?.id === row.id)
            detail.value = await loadOrder(row.id);
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "处理退货失败");
    }
}
async function onRejectRefund(row) {
    const note = await ElMessageBox.prompt("请输入拒绝原因", "拒绝退货", { inputValue: "商品不符合退货条件", confirmButtonText: "拒绝", cancelButtonText: "取消", type: "warning" }).catch(() => null);
    if (!note)
        return;
    try {
        await rejectRefund(row.id, note.value || "商家已拒绝退货申请");
        ElMessage.success("已拒绝退货申请");
        await load();
        if (detail.value?.id === row.id)
            detail.value = await loadOrder(row.id);
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "处理退货失败");
    }
}
function tagType(status) {
    if (status === "PAID")
        return "warning";
    if (status === "REFUND_REQUESTED")
        return "danger";
    if (status === "REFUNDED")
        return "success";
    if (status === "REFUND_REJECTED")
        return "info";
    if (status === "SHIPPED")
        return "success";
    if (status === "COMPLETED")
        return "info";
    return "";
}
function formatTime(value) {
    return value ? value.replace("T", " ").slice(0, 19) : "";
}
load();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "toolbar" },
});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.Refresh),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.Refresh),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.load)
};
__VLS_3.slots.default;
var __VLS_3;
if (__VLS_ctx.refundOrders.length) {
    const __VLS_8 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ 'onClick': {} },
        type: "warning",
        plain: true,
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClick': {} },
        type: "warning",
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_12;
    let __VLS_13;
    let __VLS_14;
    const __VLS_15 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.refundOrders.length))
                return;
            __VLS_ctx.showOnlyRefund = !__VLS_ctx.showOnlyRefund;
        }
    };
    __VLS_11.slots.default;
    (__VLS_ctx.showOnlyRefund ? "查看全部订单" : `只看退货 ${__VLS_ctx.refundOrders.length} 个`);
    var __VLS_11;
}
if (__VLS_ctx.refundOrders.length) {
    const __VLS_16 = {}.ElAlert;
    /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ class: "refund-alert" },
        type: "warning",
        closable: (false),
        showIcon: true,
        title: (`待处理退货 ${__VLS_ctx.refundOrders.length} 个`),
        description: "用户已提交退款/退货申请，需商家审核后再处理退款与入库。",
    }));
    const __VLS_18 = __VLS_17({
        ...{ class: "refund-alert" },
        type: "warning",
        closable: (false),
        showIcon: true,
        title: (`待处理退货 ${__VLS_ctx.refundOrders.length} 个`),
        description: "用户已提交退款/退货申请，需商家审核后再处理退款与入库。",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
}
const __VLS_20 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_23.slots.default;
const __VLS_24 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    data: (__VLS_ctx.filteredList),
    border: true,
    stripe: true,
}));
const __VLS_26 = __VLS_25({
    data: (__VLS_ctx.filteredList),
    border: true,
    stripe: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    prop: "orderNo",
    label: "订单号",
    minWidth: "180",
}));
const __VLS_30 = __VLS_29({
    prop: "orderNo",
    label: "订单号",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
const __VLS_32 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    prop: "receiver",
    label: "收货人",
    width: "110",
}));
const __VLS_34 = __VLS_33({
    prop: "receiver",
    label: "收货人",
    width: "110",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
const __VLS_36 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    prop: "statusText",
    label: "状态",
    width: "110",
}));
const __VLS_38 = __VLS_37({
    prop: "statusText",
    label: "状态",
    width: "110",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_39.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_40 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        type: (__VLS_ctx.tagType(row.status)),
    }));
    const __VLS_42 = __VLS_41({
        type: (__VLS_ctx.tagType(row.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    (row.statusText || row.status);
    var __VLS_43;
}
var __VLS_39;
const __VLS_44 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    prop: "totalAmount",
    label: "金额",
    width: "110",
}));
const __VLS_46 = __VLS_45({
    prop: "totalAmount",
    label: "金额",
    width: "110",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const __VLS_48 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    prop: "logisticsCompany",
    label: "物流公司",
    width: "120",
}));
const __VLS_50 = __VLS_49({
    prop: "logisticsCompany",
    label: "物流公司",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
const __VLS_52 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    prop: "trackingNo",
    label: "物流单号",
    width: "150",
}));
const __VLS_54 = __VLS_53({
    prop: "trackingNo",
    label: "物流单号",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
const __VLS_56 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    prop: "createdAt",
    label: "下单时间",
    width: "180",
}));
const __VLS_58 = __VLS_57({
    prop: "createdAt",
    label: "下单时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
const __VLS_60 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    label: "操作",
    width: "190",
    fixed: "right",
}));
const __VLS_62 = __VLS_61({
    label: "操作",
    width: "190",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_63.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_64 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        size: "small",
    }));
    const __VLS_66 = __VLS_65({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    let __VLS_68;
    let __VLS_69;
    let __VLS_70;
    const __VLS_71 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openDetail(row);
        }
    };
    __VLS_67.slots.default;
    var __VLS_67;
    const __VLS_72 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        ...{ 'onClick': {} },
        link: true,
        type: "warning",
        size: "small",
        disabled: (row.status !== 'REFUND_REQUESTED'),
    }));
    const __VLS_74 = __VLS_73({
        ...{ 'onClick': {} },
        link: true,
        type: "warning",
        size: "small",
        disabled: (row.status !== 'REFUND_REQUESTED'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    let __VLS_76;
    let __VLS_77;
    let __VLS_78;
    const __VLS_79 = {
        onClick: (...[$event]) => {
            __VLS_ctx.onApproveRefund(row);
        }
    };
    __VLS_75.slots.default;
    var __VLS_75;
    const __VLS_80 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
        size: "small",
        disabled: (row.status !== 'REFUND_REQUESTED'),
    }));
    const __VLS_82 = __VLS_81({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
        size: "small",
        disabled: (row.status !== 'REFUND_REQUESTED'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    let __VLS_84;
    let __VLS_85;
    let __VLS_86;
    const __VLS_87 = {
        onClick: (...[$event]) => {
            __VLS_ctx.onRejectRefund(row);
        }
    };
    __VLS_83.slots.default;
    var __VLS_83;
    const __VLS_88 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        ...{ 'onClick': {} },
        link: true,
        type: "success",
        size: "small",
        disabled: (row.status !== 'PAID'),
    }));
    const __VLS_90 = __VLS_89({
        ...{ 'onClick': {} },
        link: true,
        type: "success",
        size: "small",
        disabled: (row.status !== 'PAID'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    let __VLS_92;
    let __VLS_93;
    let __VLS_94;
    const __VLS_95 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openShip(row);
        }
    };
    __VLS_91.slots.default;
    var __VLS_91;
}
var __VLS_63;
var __VLS_27;
var __VLS_23;
const __VLS_96 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    modelValue: (__VLS_ctx.detailVisible),
    title: (`订单详情 - ${__VLS_ctx.detail?.orderNo || ''}`),
    width: "720px",
}));
const __VLS_98 = __VLS_97({
    modelValue: (__VLS_ctx.detailVisible),
    title: (`订单详情 - ${__VLS_ctx.detail?.orderNo || ''}`),
    width: "720px",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.ElDescriptions;
/** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    column: (2),
    border: true,
}));
const __VLS_102 = __VLS_101({
    column: (2),
    border: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
const __VLS_104 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    label: "订单号",
}));
const __VLS_106 = __VLS_105({
    label: "订单号",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
(__VLS_ctx.detail?.orderNo);
var __VLS_107;
const __VLS_108 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    label: "状态",
}));
const __VLS_110 = __VLS_109({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
(__VLS_ctx.detail?.statusText || __VLS_ctx.detail?.status);
var __VLS_111;
const __VLS_112 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    label: "金额",
}));
const __VLS_114 = __VLS_113({
    label: "金额",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
(__VLS_ctx.detail?.totalAmount);
var __VLS_115;
const __VLS_116 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    label: "收货人",
}));
const __VLS_118 = __VLS_117({
    label: "收货人",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
(__VLS_ctx.detail?.receiver);
(__VLS_ctx.detail?.receiverPhone);
var __VLS_119;
const __VLS_120 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    label: "收货地址",
    span: (2),
}));
const __VLS_122 = __VLS_121({
    label: "收货地址",
    span: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
(__VLS_ctx.detail?.address);
var __VLS_123;
const __VLS_124 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    label: "物流",
    span: (2),
}));
const __VLS_126 = __VLS_125({
    label: "物流",
    span: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
(__VLS_ctx.detail?.logisticsCompany || "-");
(__VLS_ctx.detail?.trackingNo || "");
var __VLS_127;
if (__VLS_ctx.detail?.status === 'REFUND_REQUESTED') {
    const __VLS_128 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
        label: "退货备注",
        span: (2),
    }));
    const __VLS_130 = __VLS_129({
        label: "退货备注",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    __VLS_131.slots.default;
    (__VLS_ctx.detail?.refundReason || "用户申请退款/退货");
    var __VLS_131;
}
if (__VLS_ctx.detail?.status === 'REFUND_REQUESTED') {
    const __VLS_132 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
        label: "申请时间",
        span: (2),
    }));
    const __VLS_134 = __VLS_133({
        label: "申请时间",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
    __VLS_135.slots.default;
    (__VLS_ctx.formatTime(__VLS_ctx.detail?.refundRequestedAt) || "-");
    var __VLS_135;
}
if (__VLS_ctx.detail?.refundHandleNote) {
    const __VLS_136 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
        label: "退货处理",
        span: (2),
    }));
    const __VLS_138 = __VLS_137({
        label: "退货处理",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_137));
    __VLS_139.slots.default;
    (__VLS_ctx.detail.refundHandleNote);
    (__VLS_ctx.formatTime(__VLS_ctx.detail?.refundHandledAt));
    var __VLS_139;
}
var __VLS_103;
const __VLS_140 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    data: (__VLS_ctx.detail?.items || []),
    border: true,
    size: "small",
    ...{ style: {} },
}));
const __VLS_142 = __VLS_141({
    data: (__VLS_ctx.detail?.items || []),
    border: true,
    size: "small",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
const __VLS_144 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    prop: "productName",
    label: "商品",
}));
const __VLS_146 = __VLS_145({
    prop: "productName",
    label: "商品",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
const __VLS_148 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    prop: "skuCode",
    label: "SKU",
    width: "150",
}));
const __VLS_150 = __VLS_149({
    prop: "skuCode",
    label: "SKU",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
const __VLS_152 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    prop: "price",
    label: "单价",
    width: "100",
}));
const __VLS_154 = __VLS_153({
    prop: "price",
    label: "单价",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
const __VLS_156 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    prop: "quantity",
    label: "数量",
    width: "80",
}));
const __VLS_158 = __VLS_157({
    prop: "quantity",
    label: "数量",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
var __VLS_143;
if (__VLS_ctx.detail?.logisticsTraces?.length) {
    const __VLS_160 = {}.ElTimeline;
    /** @type {[typeof __VLS_components.ElTimeline, typeof __VLS_components.elTimeline, typeof __VLS_components.ElTimeline, typeof __VLS_components.elTimeline, ]} */ ;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
        ...{ style: {} },
    }));
    const __VLS_162 = __VLS_161({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    __VLS_163.slots.default;
    for (const [t] of __VLS_getVForSourceType((__VLS_ctx.detail.logisticsTraces))) {
        const __VLS_164 = {}.ElTimelineItem;
        /** @type {[typeof __VLS_components.ElTimelineItem, typeof __VLS_components.elTimelineItem, typeof __VLS_components.ElTimelineItem, typeof __VLS_components.elTimelineItem, ]} */ ;
        // @ts-ignore
        const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
            key: (t.time + t.content),
            timestamp: (t.time),
        }));
        const __VLS_166 = __VLS_165({
            key: (t.time + t.content),
            timestamp: (t.time),
        }, ...__VLS_functionalComponentArgsRest(__VLS_165));
        __VLS_167.slots.default;
        (t.content);
        var __VLS_167;
    }
    var __VLS_163;
}
var __VLS_99;
const __VLS_168 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    modelValue: (__VLS_ctx.shipVisible),
    title: "发货",
    width: "760px",
}));
const __VLS_170 = __VLS_169({
    modelValue: (__VLS_ctx.shipVisible),
    title: "发货",
    width: "760px",
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
const __VLS_172 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    model: (__VLS_ctx.shipForm),
    labelWidth: "110px",
}));
const __VLS_174 = __VLS_173({
    model: (__VLS_ctx.shipForm),
    labelWidth: "110px",
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
__VLS_175.slots.default;
const __VLS_176 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    label: "收件人",
}));
const __VLS_178 = __VLS_177({
    label: "收件人",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
__VLS_179.slots.default;
const __VLS_180 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    modelValue: (__VLS_ctx.shipOrderRow?.receiver),
    disabled: true,
}));
const __VLS_182 = __VLS_181({
    modelValue: (__VLS_ctx.shipOrderRow?.receiver),
    disabled: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
var __VLS_179;
const __VLS_184 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    label: "联系电话",
}));
const __VLS_186 = __VLS_185({
    label: "联系电话",
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
__VLS_187.slots.default;
const __VLS_188 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    modelValue: (__VLS_ctx.shipOrderRow?.receiverPhone),
    disabled: true,
}));
const __VLS_190 = __VLS_189({
    modelValue: (__VLS_ctx.shipOrderRow?.receiverPhone),
    disabled: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
var __VLS_187;
const __VLS_192 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
    label: "收货地址",
}));
const __VLS_194 = __VLS_193({
    label: "收货地址",
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
__VLS_195.slots.default;
const __VLS_196 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    modelValue: (__VLS_ctx.shipOrderRow?.address),
    type: "textarea",
    disabled: true,
}));
const __VLS_198 = __VLS_197({
    modelValue: (__VLS_ctx.shipOrderRow?.address),
    type: "textarea",
    disabled: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
var __VLS_195;
const __VLS_200 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
    label: "发件人",
}));
const __VLS_202 = __VLS_201({
    label: "发件人",
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
__VLS_203.slots.default;
const __VLS_204 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
    modelValue: (__VLS_ctx.shipForm.sender),
}));
const __VLS_206 = __VLS_205({
    modelValue: (__VLS_ctx.shipForm.sender),
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
var __VLS_203;
const __VLS_208 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
    label: "联系电话",
}));
const __VLS_210 = __VLS_209({
    label: "联系电话",
}, ...__VLS_functionalComponentArgsRest(__VLS_209));
__VLS_211.slots.default;
const __VLS_212 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
    modelValue: (__VLS_ctx.shipForm.senderPhone),
}));
const __VLS_214 = __VLS_213({
    modelValue: (__VLS_ctx.shipForm.senderPhone),
}, ...__VLS_functionalComponentArgsRest(__VLS_213));
var __VLS_211;
const __VLS_216 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
    label: "发货地址",
}));
const __VLS_218 = __VLS_217({
    label: "发货地址",
}, ...__VLS_functionalComponentArgsRest(__VLS_217));
__VLS_219.slots.default;
const __VLS_220 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
    modelValue: (__VLS_ctx.shipForm.senderAddress),
    type: "textarea",
}));
const __VLS_222 = __VLS_221({
    modelValue: (__VLS_ctx.shipForm.senderAddress),
    type: "textarea",
}, ...__VLS_functionalComponentArgsRest(__VLS_221));
var __VLS_219;
const __VLS_224 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
    label: "物流公司",
}));
const __VLS_226 = __VLS_225({
    label: "物流公司",
}, ...__VLS_functionalComponentArgsRest(__VLS_225));
__VLS_227.slots.default;
const __VLS_228 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
    modelValue: (__VLS_ctx.shipForm.logisticsCompany),
    placeholder: "选择物流公司",
    ...{ style: {} },
}));
const __VLS_230 = __VLS_229({
    modelValue: (__VLS_ctx.shipForm.logisticsCompany),
    placeholder: "选择物流公司",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_229));
__VLS_231.slots.default;
const __VLS_232 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
    label: "顺丰速运",
    value: "顺丰速运",
}));
const __VLS_234 = __VLS_233({
    label: "顺丰速运",
    value: "顺丰速运",
}, ...__VLS_functionalComponentArgsRest(__VLS_233));
const __VLS_236 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
    label: "京东物流",
    value: "京东物流",
}));
const __VLS_238 = __VLS_237({
    label: "京东物流",
    value: "京东物流",
}, ...__VLS_functionalComponentArgsRest(__VLS_237));
const __VLS_240 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
    label: "中通快递",
    value: "中通快递",
}));
const __VLS_242 = __VLS_241({
    label: "中通快递",
    value: "中通快递",
}, ...__VLS_functionalComponentArgsRest(__VLS_241));
var __VLS_231;
var __VLS_227;
const __VLS_244 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
    label: "物流单号",
}));
const __VLS_246 = __VLS_245({
    label: "物流单号",
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
__VLS_247.slots.default;
const __VLS_248 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
    modelValue: (__VLS_ctx.shipForm.trackingNo),
    placeholder: "请输入物流单号",
}));
const __VLS_250 = __VLS_249({
    modelValue: (__VLS_ctx.shipForm.trackingNo),
    placeholder: "请输入物流单号",
}, ...__VLS_functionalComponentArgsRest(__VLS_249));
var __VLS_247;
var __VLS_175;
{
    const { footer: __VLS_thisSlot } = __VLS_171.slots;
    const __VLS_252 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
        ...{ 'onClick': {} },
    }));
    const __VLS_254 = __VLS_253({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_253));
    let __VLS_256;
    let __VLS_257;
    let __VLS_258;
    const __VLS_259 = {
        onClick: (...[$event]) => {
            __VLS_ctx.shipVisible = false;
        }
    };
    __VLS_255.slots.default;
    var __VLS_255;
    const __VLS_260 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.shipping),
    }));
    const __VLS_262 = __VLS_261({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.shipping),
    }, ...__VLS_functionalComponentArgsRest(__VLS_261));
    let __VLS_264;
    let __VLS_265;
    let __VLS_266;
    const __VLS_267 = {
        onClick: (__VLS_ctx.submitShip)
    };
    __VLS_263.slots.default;
    var __VLS_263;
}
var __VLS_171;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['refund-alert']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Refresh: Refresh,
            loading: loading,
            shipping: shipping,
            showOnlyRefund: showOnlyRefund,
            detailVisible: detailVisible,
            shipVisible: shipVisible,
            detail: detail,
            shipOrderRow: shipOrderRow,
            shipForm: shipForm,
            refundOrders: refundOrders,
            filteredList: filteredList,
            load: load,
            openDetail: openDetail,
            openShip: openShip,
            submitShip: submitShip,
            onApproveRefund: onApproveRefund,
            onRejectRefund: onRejectRefund,
            tagType: tagType,
            formatTime: formatTime,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
