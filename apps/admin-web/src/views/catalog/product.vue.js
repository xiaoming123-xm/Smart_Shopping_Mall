import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Refresh } from "@element-plus/icons-vue";
import { loadProducts, saveProduct, deleteProduct, toggleProductStatus, loadSkus, saveSku, deleteSku } from "@/use-cases/product.uc";
import { loadAttributes } from "@/use-cases/attribute.uc";
import { loadCategoryTree } from "@/use-cases/category.uc";
import { loadBrands } from "@/use-cases/brand.uc";
import { ApiError } from "@/api";
import { pickImageFile, readFileAsDataUrl } from "@/utils/imageUpload";
const loading = ref(false);
const router = useRouter();
const saving = ref(false);
const list = ref([]);
const categoryTree = ref([]);
const brands = ref([]);
const attributes = ref([]);
const flatAttributes = computed(() => flattenAttributes(attributes.value));
const selectedCategoryPathIds = computed(() => getCategoryPathIds(form.categoryId));
const visibleAttributes = computed(() => flatAttributes.value.filter((attr) => shouldShowAttribute(attr)));
const attributeGroups = computed(() => buildAttributeGroups(attributes.value));
const dialogVisible = ref(false);
const form = reactive({ name: "", categoryId: null, brandId: null, mainImage: "", description: "", attributesJson: "", price: 0, costPrice: 0, stock: 0, sort: 0 });
const attributeValues = reactive({});
const selectedAttributeByGroup = reactive({});
const imageInput = ref(null);
const skuVisible = ref(false);
const currentSpu = ref(null);
const skus = ref([]);
const skuEditVisible = ref(false);
const savingSku = ref(false);
const skuForm = reactive({ skuCode: "", specs: "", price: 0, costPrice: 0, stock: 0 });
async function load() {
    loading.value = true;
    try {
        list.value = await loadProducts();
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "加载失败");
    }
    finally {
        loading.value = false;
    }
}
async function loadRefs() {
    try {
        const [categories, brandRows, attrRows] = await Promise.all([loadCategoryTree(), loadBrands(), loadAttributes()]);
        categoryTree.value = categories;
        brands.value = brandRows;
        attributes.value = attrRows;
        resetAttributeValues(parseAttributes(form.attributesJson));
    }
    catch { /* ignore */ }
}
function flattenAttributes(rows) {
    return rows.flatMap((row) => [row, ...flattenAttributes(row.children || [])]);
}
function buildAttributeGroups(rows) {
    const groups = [];
    rows.forEach((row) => {
        const childOptions = flattenAttributes(row.children || []).filter((attr) => shouldShowAttribute(attr));
        if (isGroupAttr(row) && childOptions.length) {
            groups.push({ name: row.name, options: childOptions });
            return;
        }
        if (!isGroupAttr(row) && shouldShowAttribute(row)) {
            groups.push({ name: row.name, options: [row] });
        }
    });
    syncAttributeGroupSelection(groups);
    return groups;
}
function syncAttributeGroupSelection(groups) {
    const groupNames = new Set(groups.map((group) => group.name));
    Object.keys(selectedAttributeByGroup).forEach((name) => {
        if (!groupNames.has(name))
            delete selectedAttributeByGroup[name];
    });
    groups.forEach((group) => {
        const selected = selectedAttributeByGroup[group.name];
        if (!selected || !group.options.some((attr) => attr.name === selected)) {
            selectedAttributeByGroup[group.name] = group.options.length === 1 ? group.options[0].name : "";
        }
    });
}
function getCategoryPathIds(categoryId) {
    if (!categoryId)
        return [];
    const targetId = Number(categoryId);
    const path = [];
    const walk = (rows, parents) => {
        for (const row of rows) {
            const rowId = Number(row.id);
            const nextPath = [...parents, rowId];
            if (rowId === targetId) {
                path.push(...nextPath);
                return true;
            }
            if (walk(row.children || [], nextPath))
                return true;
        }
        return false;
    };
    walk(categoryTree.value, []);
    return path.length ? path : [targetId];
}
function reset() {
    Object.assign(form, { id: undefined, name: "", categoryId: null, brandId: null, mainImage: "", description: "", attributesJson: "", price: 0, costPrice: 0, stock: 0, sort: 0 });
    resetAttributeValues({});
}
function openCreate() { reset(); dialogVisible.value = true; }
function openEdit(row) {
    Object.assign(form, { ...row });
    resetAttributeValues(parseAttributes(row.attributesJson));
    dialogVisible.value = true;
}
function openAiGenerate(row) { if (row.id)
    router.push(`/admin/products/${row.id}/ai-generate`); }
function triggerImageUpload() { imageInput.value?.click(); }
function onCategoryChange() { resetAttributeValues(parseAttributes(form.attributesJson)); }
async function onMainImageChange(event) {
    const file = pickImageFile(event);
    if (!file)
        return;
    if (!file.type.startsWith("image/")) {
        ElMessage.warning("请选择图片文件");
        return;
    }
    try {
        form.mainImage = await readFileAsDataUrl(file);
        ElMessage.success("主图已载入，保存后刷新页面也会保留");
    }
    catch (e) {
        ElMessage.error(e instanceof Error ? e.message : "读取图片失败");
    }
    finally {
        if (imageInput.value)
            imageInput.value.value = "";
    }
}
function clearMainImage() {
    form.mainImage = "";
}
function parseAttributes(raw) {
    if (!raw)
        return {};
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
    }
    catch {
        return {};
    }
}
function resetAttributeValues(values) {
    Object.keys(attributeValues).forEach((key) => delete attributeValues[key]);
    attributeGroups.value.forEach((group) => {
        const savedAttr = group.options.find((attr) => !isEmptyAttr(values[attr.name]));
        const selectedAttr = savedAttr || (group.options.length === 1 ? group.options[0] : null);
        selectedAttributeByGroup[group.name] = selectedAttr?.name || "";
        group.options.forEach((attr) => {
            attributeValues[attr.name] = values[attr.name] ?? (isMultiAttr(attr) ? [] : "");
        });
    });
}
function shouldShowAttribute(attr) {
    if ((attr.children && attr.children.length > 0) || isGroupAttr(attr))
        return false;
    const categoryPathIds = selectedCategoryPathIds.value;
    if (!categoryPathIds.length)
        return false;
    const categoryIds = attr.categoryIds || [];
    return categoryIds.length === 0 || categoryIds.some((id) => categoryPathIds.includes(Number(id)));
}
function isSelectAttr(attr) {
    return ["select", "multi", "SELECT", "MULTI"].includes(attr.type || "select");
}
function isGroupAttr(attr) {
    return (attr.type || "").toLowerCase() === "group";
}
function attrKey(attr) {
    return attr.id || attr.name;
}
function currentGroupAttribute(group) {
    const selected = selectedAttributeByGroup[group.name];
    return group.options.find((attr) => attr.name === selected) || (group.options.length === 1 ? group.options[0] : null);
}
function groupRequired(group) {
    return group.options.some((attr) => attr.required);
}
function onAttributeGroupChange(group) {
    group.options.forEach((attr) => {
        if (attr.name !== selectedAttributeByGroup[group.name]) {
            attributeValues[attr.name] = isMultiAttr(attr) ? [] : "";
        }
    });
}
function isMultiAttr(attr) {
    return (attr.type || "").toLowerCase() === "multi";
}
function isEmptyAttr(value) {
    return Array.isArray(value) ? value.length === 0 : !String(value || "").trim();
}
function cleanAttributeValues() {
    const allowed = new Set(attributeGroups.value.map((group) => currentGroupAttribute(group)?.name).filter(Boolean));
    return Object.fromEntries(Object.entries(attributeValues).filter(([key, value]) => allowed.has(key) && !isEmptyAttr(value)));
}
async function onSave() {
    if (!form.name.trim()) {
        ElMessage.warning("请输入名称");
        return;
    }
    const missingGroup = attributeGroups.value.find((group) => groupRequired(group) && !currentGroupAttribute(group));
    if (missingGroup) {
        ElMessage.warning(`请选择属性分类：${missingGroup.name}`);
        return;
    }
    const missing = attributeGroups.value.map((group) => currentGroupAttribute(group)).find((attr) => attr?.required && isEmptyAttr(attributeValues[attr.name]));
    if (missing) {
        ElMessage.warning(`请填写必填属性：${missing.name}`);
        return;
    }
    form.attributesJson = JSON.stringify(cleanAttributeValues());
    saving.value = true;
    try {
        await saveProduct({ ...form });
        ElMessage.success("保存成功");
        dialogVisible.value = false;
        load();
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "保存失败");
    }
    finally {
        saving.value = false;
    }
}
async function onToggle(row) {
    try {
        await toggleProductStatus(row.id, row.status !== 1);
        ElMessage.success("操作成功");
        load();
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "操作失败");
    }
}
async function onDelete(row) {
    const ok = await ElMessageBox.confirm(`确认删除商品「${row.name}」？`, "提示", { type: "warning" }).then(() => true).catch(() => false);
    if (!ok)
        return;
    try {
        await deleteProduct(row.id);
        ElMessage.success("已删除");
        load();
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "删除失败");
    }
}
async function openSkus(row) {
    currentSpu.value = row;
    skuVisible.value = true;
    try {
        skus.value = await loadSkus(row.id);
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "加载SKU失败");
    }
}
function openSkuEdit(row) {
    if (row)
        Object.assign(skuForm, { ...row });
    else
        Object.assign(skuForm, { id: undefined, skuCode: "", specs: "", price: 0, costPrice: 0, stock: 0 });
    skuEditVisible.value = true;
}
async function onSaveSku() {
    if (!currentSpu.value?.id)
        return;
    if (!skuForm.skuCode.trim()) {
        ElMessage.warning("请输入编码");
        return;
    }
    savingSku.value = true;
    try {
        await saveSku(currentSpu.value.id, { ...skuForm });
        ElMessage.success("保存成功");
        skuEditVisible.value = false;
        skus.value = await loadSkus(currentSpu.value.id);
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "保存失败");
    }
    finally {
        savingSku.value = false;
    }
}
async function onDeleteSku(row) {
    const ok = await ElMessageBox.confirm("确认删除该 SKU？", "提示", { type: "warning" }).then(() => true).catch(() => false);
    if (!ok)
        return;
    try {
        await deleteSku(row.id);
        ElMessage.success("已删除");
        if (currentSpu.value?.id)
            skus.value = await loadSkus(currentSpu.value.id);
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "删除失败");
    }
}
onMounted(() => { load(); loadRefs(); });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['attr-name']} */ ;
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
    type: "primary",
    icon: (__VLS_ctx.Plus),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
    icon: (__VLS_ctx.Plus),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.openCreate)
};
__VLS_3.slots.default;
var __VLS_3;
const __VLS_8 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.Refresh),
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.Refresh),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (__VLS_ctx.load)
};
__VLS_11.slots.default;
var __VLS_11;
const __VLS_16 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_19.slots.default;
const __VLS_20 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    data: (__VLS_ctx.list),
    border: true,
    stripe: true,
}));
const __VLS_22 = __VLS_21({
    data: (__VLS_ctx.list),
    border: true,
    stripe: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    prop: "id",
    label: "ID",
    width: "70",
}));
const __VLS_26 = __VLS_25({
    prop: "id",
    label: "ID",
    width: "70",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
const __VLS_28 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    label: "主图",
    width: "80",
}));
const __VLS_30 = __VLS_29({
    label: "主图",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_31.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    if (row.mainImage) {
        const __VLS_32 = {}.ElImage;
        /** @type {[typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            src: (row.mainImage),
            ...{ style: {} },
            fit: "cover",
        }));
        const __VLS_34 = __VLS_33({
            src: (row.mainImage),
            ...{ style: {} },
            fit: "cover",
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
}
var __VLS_31;
const __VLS_36 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    prop: "name",
    label: "名称",
    minWidth: "160",
}));
const __VLS_38 = __VLS_37({
    prop: "name",
    label: "名称",
    minWidth: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
const __VLS_40 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    prop: "price",
    label: "售价",
    width: "100",
}));
const __VLS_42 = __VLS_41({
    prop: "price",
    label: "售价",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const __VLS_44 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    prop: "costPrice",
    label: "成本",
    width: "100",
}));
const __VLS_46 = __VLS_45({
    prop: "costPrice",
    label: "成本",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const __VLS_48 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    prop: "stock",
    label: "库存",
    width: "80",
}));
const __VLS_50 = __VLS_49({
    prop: "stock",
    label: "库存",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
const __VLS_52 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    label: "状态",
    width: "90",
}));
const __VLS_54 = __VLS_53({
    label: "状态",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_55.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_56 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        type: (row.status === 1 ? 'success' : 'info'),
    }));
    const __VLS_58 = __VLS_57({
        type: (row.status === 1 ? 'success' : 'info'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_59.slots.default;
    (row.status === 1 ? '上架' : '下架');
    var __VLS_59;
}
var __VLS_55;
const __VLS_60 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    label: "操作",
    width: "340",
}));
const __VLS_62 = __VLS_61({
    label: "操作",
    width: "340",
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
        type: "warning",
        size: "small",
    }));
    const __VLS_66 = __VLS_65({
        ...{ 'onClick': {} },
        link: true,
        type: "warning",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    let __VLS_68;
    let __VLS_69;
    let __VLS_70;
    const __VLS_71 = {
        onClick: (...[$event]) => {
            __VLS_ctx.onToggle(row);
        }
    };
    __VLS_67.slots.default;
    (row.status === 1 ? '下架' : '上架');
    var __VLS_67;
    const __VLS_72 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        size: "small",
    }));
    const __VLS_74 = __VLS_73({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    let __VLS_76;
    let __VLS_77;
    let __VLS_78;
    const __VLS_79 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openSkus(row);
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
        type: "success",
        size: "small",
    }));
    const __VLS_82 = __VLS_81({
        ...{ 'onClick': {} },
        link: true,
        type: "success",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    let __VLS_84;
    let __VLS_85;
    let __VLS_86;
    const __VLS_87 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openAiGenerate(row);
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
        type: "primary",
        size: "small",
    }));
    const __VLS_90 = __VLS_89({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    let __VLS_92;
    let __VLS_93;
    let __VLS_94;
    const __VLS_95 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openEdit(row);
        }
    };
    __VLS_91.slots.default;
    var __VLS_91;
    const __VLS_96 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
        size: "small",
    }));
    const __VLS_98 = __VLS_97({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    let __VLS_100;
    let __VLS_101;
    let __VLS_102;
    const __VLS_103 = {
        onClick: (...[$event]) => {
            __VLS_ctx.onDelete(row);
        }
    };
    __VLS_99.slots.default;
    var __VLS_99;
}
var __VLS_63;
var __VLS_23;
var __VLS_19;
const __VLS_104 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.form.id ? '编辑商品' : '新增商品'),
    width: "560px",
}));
const __VLS_106 = __VLS_105({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.form.id ? '编辑商品' : '新增商品'),
    width: "560px",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
const __VLS_108 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    model: (__VLS_ctx.form),
    labelWidth: "90px",
}));
const __VLS_110 = __VLS_109({
    model: (__VLS_ctx.form),
    labelWidth: "90px",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
const __VLS_112 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    label: "名称",
}));
const __VLS_114 = __VLS_113({
    label: "名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
const __VLS_116 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    modelValue: (__VLS_ctx.form.name),
}));
const __VLS_118 = __VLS_117({
    modelValue: (__VLS_ctx.form.name),
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
var __VLS_115;
const __VLS_120 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    label: "分类",
}));
const __VLS_122 = __VLS_121({
    label: "分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
const __VLS_124 = {}.ElTreeSelect;
/** @type {[typeof __VLS_components.ElTreeSelect, typeof __VLS_components.elTreeSelect, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.form.categoryId),
    data: (__VLS_ctx.categoryTree),
    props: ({ label: 'name', children: 'children' }),
    nodeKey: "id",
    checkStrictly: true,
    placeholder: "选择分类",
    ...{ style: {} },
}));
const __VLS_126 = __VLS_125({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.form.categoryId),
    data: (__VLS_ctx.categoryTree),
    props: ({ label: 'name', children: 'children' }),
    nodeKey: "id",
    checkStrictly: true,
    placeholder: "选择分类",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
let __VLS_128;
let __VLS_129;
let __VLS_130;
const __VLS_131 = {
    onChange: (__VLS_ctx.onCategoryChange)
};
var __VLS_127;
var __VLS_123;
const __VLS_132 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    label: "品牌",
}));
const __VLS_134 = __VLS_133({
    label: "品牌",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
const __VLS_136 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    modelValue: (__VLS_ctx.form.brandId),
    placeholder: "选择品牌",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_138 = __VLS_137({
    modelValue: (__VLS_ctx.form.brandId),
    placeholder: "选择品牌",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
for (const [b] of __VLS_getVForSourceType((__VLS_ctx.brands))) {
    const __VLS_140 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
        key: (b.id),
        label: (b.name),
        value: (b.id),
    }));
    const __VLS_142 = __VLS_141({
        key: (b.id),
        label: (b.name),
        value: (b.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_141));
}
var __VLS_139;
var __VLS_135;
const __VLS_144 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    label: "主图",
}));
const __VLS_146 = __VLS_145({
    label: "主图",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_147.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "image-field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "image-preview-frame" },
});
if (__VLS_ctx.form.mainImage) {
    const __VLS_148 = {}.ElImage;
    /** @type {[typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ]} */ ;
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
        src: (__VLS_ctx.form.mainImage),
        fit: "cover",
        ...{ class: "image-preview" },
    }));
    const __VLS_150 = __VLS_149({
        src: (__VLS_ctx.form.mainImage),
        fit: "cover",
        ...{ class: "image-preview" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_149));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "image-actions" },
});
const __VLS_152 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    modelValue: (__VLS_ctx.form.mainImage),
    placeholder: "图片URL 或上传图片后自动填充",
}));
const __VLS_154 = __VLS_153({
    modelValue: (__VLS_ctx.form.mainImage),
    placeholder: "图片URL 或上传图片后自动填充",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "image-buttons" },
});
const __VLS_156 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    ...{ 'onClick': {} },
    type: "primary",
    plain: true,
}));
const __VLS_158 = __VLS_157({
    ...{ 'onClick': {} },
    type: "primary",
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
let __VLS_160;
let __VLS_161;
let __VLS_162;
const __VLS_163 = {
    onClick: (__VLS_ctx.triggerImageUpload)
};
__VLS_159.slots.default;
var __VLS_159;
const __VLS_164 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    ...{ 'onClick': {} },
}));
const __VLS_166 = __VLS_165({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
let __VLS_168;
let __VLS_169;
let __VLS_170;
const __VLS_171 = {
    onClick: (__VLS_ctx.clearMainImage)
};
__VLS_167.slots.default;
var __VLS_167;
if (__VLS_ctx.form.id) {
    const __VLS_172 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
        ...{ 'onClick': {} },
        type: "success",
        link: true,
    }));
    const __VLS_174 = __VLS_173({
        ...{ 'onClick': {} },
        type: "success",
        link: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_173));
    let __VLS_176;
    let __VLS_177;
    let __VLS_178;
    const __VLS_179 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.form.id))
                return;
            __VLS_ctx.openAiGenerate(__VLS_ctx.form);
        }
    };
    __VLS_175.slots.default;
    var __VLS_175;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onChange: (__VLS_ctx.onMainImageChange) },
    ref: "imageInput",
    type: "file",
    accept: "image/*",
    ...{ class: "hidden-file" },
});
/** @type {typeof __VLS_ctx.imageInput} */ ;
var __VLS_147;
const __VLS_180 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    label: "售价",
}));
const __VLS_182 = __VLS_181({
    label: "售价",
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
const __VLS_184 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    modelValue: (__VLS_ctx.form.price),
    min: (0),
    precision: (2),
}));
const __VLS_186 = __VLS_185({
    modelValue: (__VLS_ctx.form.price),
    min: (0),
    precision: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
var __VLS_183;
const __VLS_188 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    label: "成本价",
}));
const __VLS_190 = __VLS_189({
    label: "成本价",
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
__VLS_191.slots.default;
const __VLS_192 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
    modelValue: (__VLS_ctx.form.costPrice),
    min: (0),
    precision: (2),
}));
const __VLS_194 = __VLS_193({
    modelValue: (__VLS_ctx.form.costPrice),
    min: (0),
    precision: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
var __VLS_191;
const __VLS_196 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    label: "库存",
}));
const __VLS_198 = __VLS_197({
    label: "库存",
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
__VLS_199.slots.default;
const __VLS_200 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
    modelValue: (__VLS_ctx.form.stock),
    min: (0),
}));
const __VLS_202 = __VLS_201({
    modelValue: (__VLS_ctx.form.stock),
    min: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
var __VLS_199;
if (__VLS_ctx.attributeGroups.length) {
    const __VLS_204 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
        label: "商品属性",
    }));
    const __VLS_206 = __VLS_205({
        label: "商品属性",
    }, ...__VLS_functionalComponentArgsRest(__VLS_205));
    __VLS_207.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "attr-editor" },
    });
    for (const [group] of __VLS_getVForSourceType((__VLS_ctx.attributeGroups))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (group.name),
            ...{ class: "attr-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "attr-name" },
        });
        (group.name);
        if (__VLS_ctx.groupRequired(group)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({});
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "attr-inputs" },
        });
        if (group.options.length > 1) {
            const __VLS_208 = {}.ElSelect;
            /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
            // @ts-ignore
            const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
                ...{ 'onChange': {} },
                modelValue: (__VLS_ctx.selectedAttributeByGroup[group.name]),
                clearable: true,
                filterable: true,
                placeholder: "选择属性分类",
                ...{ style: {} },
            }));
            const __VLS_210 = __VLS_209({
                ...{ 'onChange': {} },
                modelValue: (__VLS_ctx.selectedAttributeByGroup[group.name]),
                clearable: true,
                filterable: true,
                placeholder: "选择属性分类",
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_209));
            let __VLS_212;
            let __VLS_213;
            let __VLS_214;
            const __VLS_215 = {
                onChange: (...[$event]) => {
                    if (!(__VLS_ctx.attributeGroups.length))
                        return;
                    if (!(group.options.length > 1))
                        return;
                    __VLS_ctx.onAttributeGroupChange(group);
                }
            };
            __VLS_211.slots.default;
            for (const [attr] of __VLS_getVForSourceType((group.options))) {
                const __VLS_216 = {}.ElOption;
                /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
                // @ts-ignore
                const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
                    key: (__VLS_ctx.attrKey(attr)),
                    label: (attr.name),
                    value: (attr.name),
                }));
                const __VLS_218 = __VLS_217({
                    key: (__VLS_ctx.attrKey(attr)),
                    label: (attr.name),
                    value: (attr.name),
                }, ...__VLS_functionalComponentArgsRest(__VLS_217));
            }
            var __VLS_211;
        }
        if (__VLS_ctx.currentGroupAttribute(group)) {
            if (__VLS_ctx.isSelectAttr(__VLS_ctx.currentGroupAttribute(group))) {
                const __VLS_220 = {}.ElSelect;
                /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
                // @ts-ignore
                const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
                    modelValue: (__VLS_ctx.attributeValues[__VLS_ctx.currentGroupAttribute(group).name]),
                    multiple: (__VLS_ctx.isMultiAttr(__VLS_ctx.currentGroupAttribute(group))),
                    clearable: true,
                    filterable: true,
                    placeholder: "选择属性值",
                    ...{ style: {} },
                }));
                const __VLS_222 = __VLS_221({
                    modelValue: (__VLS_ctx.attributeValues[__VLS_ctx.currentGroupAttribute(group).name]),
                    multiple: (__VLS_ctx.isMultiAttr(__VLS_ctx.currentGroupAttribute(group))),
                    clearable: true,
                    filterable: true,
                    placeholder: "选择属性值",
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_221));
                __VLS_223.slots.default;
                for (const [v] of __VLS_getVForSourceType((__VLS_ctx.currentGroupAttribute(group).values || []))) {
                    const __VLS_224 = {}.ElOption;
                    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
                    // @ts-ignore
                    const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
                        key: (v.id || v.value),
                        label: (v.value),
                        value: (v.value),
                    }));
                    const __VLS_226 = __VLS_225({
                        key: (v.id || v.value),
                        label: (v.value),
                        value: (v.value),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_225));
                }
                var __VLS_223;
            }
            else {
                const __VLS_228 = {}.ElInput;
                /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
                // @ts-ignore
                const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
                    modelValue: (__VLS_ctx.attributeValues[__VLS_ctx.currentGroupAttribute(group).name]),
                    placeholder: "输入属性值",
                }));
                const __VLS_230 = __VLS_229({
                    modelValue: (__VLS_ctx.attributeValues[__VLS_ctx.currentGroupAttribute(group).name]),
                    placeholder: "输入属性值",
                }, ...__VLS_functionalComponentArgsRest(__VLS_229));
            }
        }
    }
    var __VLS_207;
}
else if (__VLS_ctx.form.categoryId) {
    const __VLS_232 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
        label: "商品属性",
    }));
    const __VLS_234 = __VLS_233({
        label: "商品属性",
    }, ...__VLS_functionalComponentArgsRest(__VLS_233));
    __VLS_235.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "attr-empty" },
    });
    var __VLS_235;
}
else {
    const __VLS_236 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
        label: "商品属性",
    }));
    const __VLS_238 = __VLS_237({
        label: "商品属性",
    }, ...__VLS_functionalComponentArgsRest(__VLS_237));
    __VLS_239.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "attr-empty" },
    });
    var __VLS_239;
}
const __VLS_240 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
    label: "排序",
}));
const __VLS_242 = __VLS_241({
    label: "排序",
}, ...__VLS_functionalComponentArgsRest(__VLS_241));
__VLS_243.slots.default;
const __VLS_244 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
    modelValue: (__VLS_ctx.form.sort),
    min: (0),
}));
const __VLS_246 = __VLS_245({
    modelValue: (__VLS_ctx.form.sort),
    min: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
var __VLS_243;
const __VLS_248 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
    label: "描述",
}));
const __VLS_250 = __VLS_249({
    label: "描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_249));
__VLS_251.slots.default;
const __VLS_252 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
    modelValue: (__VLS_ctx.form.description),
    type: "textarea",
}));
const __VLS_254 = __VLS_253({
    modelValue: (__VLS_ctx.form.description),
    type: "textarea",
}, ...__VLS_functionalComponentArgsRest(__VLS_253));
var __VLS_251;
var __VLS_111;
{
    const { footer: __VLS_thisSlot } = __VLS_107.slots;
    const __VLS_256 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
        ...{ 'onClick': {} },
    }));
    const __VLS_258 = __VLS_257({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_257));
    let __VLS_260;
    let __VLS_261;
    let __VLS_262;
    const __VLS_263 = {
        onClick: (...[$event]) => {
            __VLS_ctx.dialogVisible = false;
        }
    };
    __VLS_259.slots.default;
    var __VLS_259;
    const __VLS_264 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.saving),
    }));
    const __VLS_266 = __VLS_265({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.saving),
    }, ...__VLS_functionalComponentArgsRest(__VLS_265));
    let __VLS_268;
    let __VLS_269;
    let __VLS_270;
    const __VLS_271 = {
        onClick: (__VLS_ctx.onSave)
    };
    __VLS_267.slots.default;
    var __VLS_267;
}
var __VLS_107;
const __VLS_272 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
    modelValue: (__VLS_ctx.skuVisible),
    title: (`SKU 管理 - ${__VLS_ctx.currentSpu?.name || ''}`),
    width: "640px",
}));
const __VLS_274 = __VLS_273({
    modelValue: (__VLS_ctx.skuVisible),
    title: (`SKU 管理 - ${__VLS_ctx.currentSpu?.name || ''}`),
    width: "640px",
}, ...__VLS_functionalComponentArgsRest(__VLS_273));
__VLS_275.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "toolbar" },
});
const __VLS_276 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
    icon: (__VLS_ctx.Plus),
}));
const __VLS_278 = __VLS_277({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
    icon: (__VLS_ctx.Plus),
}, ...__VLS_functionalComponentArgsRest(__VLS_277));
let __VLS_280;
let __VLS_281;
let __VLS_282;
const __VLS_283 = {
    onClick: (...[$event]) => {
        __VLS_ctx.openSkuEdit(null);
    }
};
__VLS_279.slots.default;
var __VLS_279;
const __VLS_284 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
    data: (__VLS_ctx.skus),
    border: true,
    size: "small",
    ...{ style: {} },
}));
const __VLS_286 = __VLS_285({
    data: (__VLS_ctx.skus),
    border: true,
    size: "small",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_285));
__VLS_287.slots.default;
const __VLS_288 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
    prop: "skuCode",
    label: "编码",
}));
const __VLS_290 = __VLS_289({
    prop: "skuCode",
    label: "编码",
}, ...__VLS_functionalComponentArgsRest(__VLS_289));
const __VLS_292 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
    prop: "specs",
    label: "规格",
}));
const __VLS_294 = __VLS_293({
    prop: "specs",
    label: "规格",
}, ...__VLS_functionalComponentArgsRest(__VLS_293));
const __VLS_296 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
    prop: "price",
    label: "售价",
    width: "90",
}));
const __VLS_298 = __VLS_297({
    prop: "price",
    label: "售价",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_297));
const __VLS_300 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
    prop: "costPrice",
    label: "成本",
    width: "90",
}));
const __VLS_302 = __VLS_301({
    prop: "costPrice",
    label: "成本",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_301));
const __VLS_304 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
    prop: "stock",
    label: "库存",
    width: "80",
}));
const __VLS_306 = __VLS_305({
    prop: "stock",
    label: "库存",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_305));
const __VLS_308 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_309 = __VLS_asFunctionalComponent(__VLS_308, new __VLS_308({
    label: "操作",
    width: "130",
}));
const __VLS_310 = __VLS_309({
    label: "操作",
    width: "130",
}, ...__VLS_functionalComponentArgsRest(__VLS_309));
__VLS_311.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_311.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_312 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        size: "small",
    }));
    const __VLS_314 = __VLS_313({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_313));
    let __VLS_316;
    let __VLS_317;
    let __VLS_318;
    const __VLS_319 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openSkuEdit(row);
        }
    };
    __VLS_315.slots.default;
    var __VLS_315;
    const __VLS_320 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_321 = __VLS_asFunctionalComponent(__VLS_320, new __VLS_320({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
        size: "small",
    }));
    const __VLS_322 = __VLS_321({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_321));
    let __VLS_324;
    let __VLS_325;
    let __VLS_326;
    const __VLS_327 = {
        onClick: (...[$event]) => {
            __VLS_ctx.onDeleteSku(row);
        }
    };
    __VLS_323.slots.default;
    var __VLS_323;
}
var __VLS_311;
var __VLS_287;
var __VLS_275;
const __VLS_328 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_329 = __VLS_asFunctionalComponent(__VLS_328, new __VLS_328({
    modelValue: (__VLS_ctx.skuEditVisible),
    title: (__VLS_ctx.skuForm.id ? '编辑SKU' : '新增SKU'),
    width: "440px",
}));
const __VLS_330 = __VLS_329({
    modelValue: (__VLS_ctx.skuEditVisible),
    title: (__VLS_ctx.skuForm.id ? '编辑SKU' : '新增SKU'),
    width: "440px",
}, ...__VLS_functionalComponentArgsRest(__VLS_329));
__VLS_331.slots.default;
const __VLS_332 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_333 = __VLS_asFunctionalComponent(__VLS_332, new __VLS_332({
    model: (__VLS_ctx.skuForm),
    labelWidth: "80px",
}));
const __VLS_334 = __VLS_333({
    model: (__VLS_ctx.skuForm),
    labelWidth: "80px",
}, ...__VLS_functionalComponentArgsRest(__VLS_333));
__VLS_335.slots.default;
const __VLS_336 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_337 = __VLS_asFunctionalComponent(__VLS_336, new __VLS_336({
    label: "编码",
}));
const __VLS_338 = __VLS_337({
    label: "编码",
}, ...__VLS_functionalComponentArgsRest(__VLS_337));
__VLS_339.slots.default;
const __VLS_340 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_341 = __VLS_asFunctionalComponent(__VLS_340, new __VLS_340({
    modelValue: (__VLS_ctx.skuForm.skuCode),
}));
const __VLS_342 = __VLS_341({
    modelValue: (__VLS_ctx.skuForm.skuCode),
}, ...__VLS_functionalComponentArgsRest(__VLS_341));
var __VLS_339;
const __VLS_344 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_345 = __VLS_asFunctionalComponent(__VLS_344, new __VLS_344({
    label: "规格",
}));
const __VLS_346 = __VLS_345({
    label: "规格",
}, ...__VLS_functionalComponentArgsRest(__VLS_345));
__VLS_347.slots.default;
const __VLS_348 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_349 = __VLS_asFunctionalComponent(__VLS_348, new __VLS_348({
    modelValue: (__VLS_ctx.skuForm.specs),
    placeholder: '如 颜色:红;衣服尺码:L',
}));
const __VLS_350 = __VLS_349({
    modelValue: (__VLS_ctx.skuForm.specs),
    placeholder: '如 颜色:红;衣服尺码:L',
}, ...__VLS_functionalComponentArgsRest(__VLS_349));
var __VLS_347;
const __VLS_352 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_353 = __VLS_asFunctionalComponent(__VLS_352, new __VLS_352({
    label: "售价",
}));
const __VLS_354 = __VLS_353({
    label: "售价",
}, ...__VLS_functionalComponentArgsRest(__VLS_353));
__VLS_355.slots.default;
const __VLS_356 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_357 = __VLS_asFunctionalComponent(__VLS_356, new __VLS_356({
    modelValue: (__VLS_ctx.skuForm.price),
    min: (0),
    precision: (2),
}));
const __VLS_358 = __VLS_357({
    modelValue: (__VLS_ctx.skuForm.price),
    min: (0),
    precision: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_357));
var __VLS_355;
const __VLS_360 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_361 = __VLS_asFunctionalComponent(__VLS_360, new __VLS_360({
    label: "成本价",
}));
const __VLS_362 = __VLS_361({
    label: "成本价",
}, ...__VLS_functionalComponentArgsRest(__VLS_361));
__VLS_363.slots.default;
const __VLS_364 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_365 = __VLS_asFunctionalComponent(__VLS_364, new __VLS_364({
    modelValue: (__VLS_ctx.skuForm.costPrice),
    min: (0),
    precision: (2),
}));
const __VLS_366 = __VLS_365({
    modelValue: (__VLS_ctx.skuForm.costPrice),
    min: (0),
    precision: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_365));
var __VLS_363;
const __VLS_368 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_369 = __VLS_asFunctionalComponent(__VLS_368, new __VLS_368({
    label: "库存",
}));
const __VLS_370 = __VLS_369({
    label: "库存",
}, ...__VLS_functionalComponentArgsRest(__VLS_369));
__VLS_371.slots.default;
const __VLS_372 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_373 = __VLS_asFunctionalComponent(__VLS_372, new __VLS_372({
    modelValue: (__VLS_ctx.skuForm.stock),
    min: (0),
}));
const __VLS_374 = __VLS_373({
    modelValue: (__VLS_ctx.skuForm.stock),
    min: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_373));
var __VLS_371;
var __VLS_335;
{
    const { footer: __VLS_thisSlot } = __VLS_331.slots;
    const __VLS_376 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_377 = __VLS_asFunctionalComponent(__VLS_376, new __VLS_376({
        ...{ 'onClick': {} },
    }));
    const __VLS_378 = __VLS_377({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_377));
    let __VLS_380;
    let __VLS_381;
    let __VLS_382;
    const __VLS_383 = {
        onClick: (...[$event]) => {
            __VLS_ctx.skuEditVisible = false;
        }
    };
    __VLS_379.slots.default;
    var __VLS_379;
    const __VLS_384 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_385 = __VLS_asFunctionalComponent(__VLS_384, new __VLS_384({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.savingSku),
    }));
    const __VLS_386 = __VLS_385({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.savingSku),
    }, ...__VLS_functionalComponentArgsRest(__VLS_385));
    let __VLS_388;
    let __VLS_389;
    let __VLS_390;
    const __VLS_391 = {
        onClick: (__VLS_ctx.onSaveSku)
    };
    __VLS_387.slots.default;
    var __VLS_387;
}
var __VLS_331;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['image-field']} */ ;
/** @type {__VLS_StyleScopedClasses['image-preview-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['image-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['image-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['image-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden-file']} */ ;
/** @type {__VLS_StyleScopedClasses['attr-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['attr-row']} */ ;
/** @type {__VLS_StyleScopedClasses['attr-name']} */ ;
/** @type {__VLS_StyleScopedClasses['attr-inputs']} */ ;
/** @type {__VLS_StyleScopedClasses['attr-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['attr-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Plus: Plus,
            Refresh: Refresh,
            loading: loading,
            saving: saving,
            list: list,
            categoryTree: categoryTree,
            brands: brands,
            attributeGroups: attributeGroups,
            dialogVisible: dialogVisible,
            form: form,
            attributeValues: attributeValues,
            selectedAttributeByGroup: selectedAttributeByGroup,
            imageInput: imageInput,
            skuVisible: skuVisible,
            currentSpu: currentSpu,
            skus: skus,
            skuEditVisible: skuEditVisible,
            savingSku: savingSku,
            skuForm: skuForm,
            load: load,
            openCreate: openCreate,
            openEdit: openEdit,
            openAiGenerate: openAiGenerate,
            triggerImageUpload: triggerImageUpload,
            onCategoryChange: onCategoryChange,
            onMainImageChange: onMainImageChange,
            clearMainImage: clearMainImage,
            isSelectAttr: isSelectAttr,
            attrKey: attrKey,
            currentGroupAttribute: currentGroupAttribute,
            groupRequired: groupRequired,
            onAttributeGroupChange: onAttributeGroupChange,
            isMultiAttr: isMultiAttr,
            onSave: onSave,
            onToggle: onToggle,
            onDelete: onDelete,
            openSkus: openSkus,
            openSkuEdit: openSkuEdit,
            onSaveSku: onSaveSku,
            onDeleteSku: onDeleteSku,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
