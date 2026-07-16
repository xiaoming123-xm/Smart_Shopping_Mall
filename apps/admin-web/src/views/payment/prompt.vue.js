import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Check, Delete, Plus, Refresh } from "@element-plus/icons-vue";
import { ApiError } from "@/api";
import { createPrompt, deletePrompt, loadPrompts, updatePrompt } from "@/use-cases/payment/prompt.uc";
const categoryOptions = [
    { value: "shopping_guide", label: "AI智能购物", help: "用于商城前台 AI智能购物，必须基于现有商品回答。" },
    { value: "product_qa", label: "商品问答", help: "用于商品资料、政策、售后等问答。" },
    { value: "image_generation", label: "图片生成", help: "用于商品 AI 图片生成和改图。" },
    { value: "copywriting", label: "运营文案", help: "用于卖点、标题、营销文案生成。" },
];
const loading = ref(false);
const saving = ref(false);
const isCreating = ref(false);
const activeCode = ref("");
const prompts = ref([]);
const form = reactive({
    category: "shopping_guide",
    title: "",
    content: "",
    enabled: true,
});
const activeHelp = computed(() => categoryOptions.find((item) => item.value === form.category)?.help || "");
const isCorePrompt = computed(() => activeCode.value.endsWith("-core"));
function categoryLabel(category) {
    return categoryOptions.find((item) => item.value === category)?.label || category;
}
function fillForm(prompt) {
    activeCode.value = prompt.code;
    form.category = prompt.category || "shopping_guide";
    form.title = prompt.title || "";
    form.content = prompt.content || "";
    form.enabled = prompt.enabled !== false;
}
function selectPrompt(prompt) {
    isCreating.value = false;
    fillForm(prompt);
}
function startCreate() {
    isCreating.value = true;
    activeCode.value = "";
    form.category = "shopping_guide";
    form.title = "";
    form.content = "";
    form.enabled = true;
}
async function load() {
    loading.value = true;
    try {
        prompts.value = await loadPrompts();
        if (prompts.value.length && !activeCode.value) {
            selectPrompt(prompts.value[0]);
        }
        else if (activeCode.value) {
            const current = prompts.value.find((item) => item.code === activeCode.value);
            if (current)
                fillForm(current);
        }
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "加载失败");
    }
    finally {
        loading.value = false;
    }
}
async function save() {
    if (!form.category || !form.title.trim() || !form.content.trim()) {
        ElMessage.warning("分类、名称和提示词内容不能为空");
        return;
    }
    saving.value = true;
    try {
        const payload = {
            category: form.category,
            title: form.title.trim(),
            content: form.content.trim(),
            enabled: form.enabled,
        };
        const data = isCreating.value ? await createPrompt(payload) : await updatePrompt(activeCode.value, payload);
        isCreating.value = false;
        fillForm(data);
        await load();
        ElMessage.success("提示词已保存");
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "保存失败");
    }
    finally {
        saving.value = false;
    }
}
async function removeCurrent() {
    if (!activeCode.value || isCorePrompt.value)
        return;
    const confirmed = await ElMessageBox.confirm(`确认删除提示词「${form.title}」？`, "提示", { type: "warning" }).catch(() => false);
    if (!confirmed)
        return;
    saving.value = true;
    try {
        await deletePrompt(activeCode.value);
        activeCode.value = "";
        await load();
        ElMessage.success("提示词已删除");
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "删除失败");
    }
    finally {
        saving.value = false;
    }
}
onMounted(load);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-list']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-item']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-main']} */ ;
/** @type {__VLS_StyleScopedClasses['item-main']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-head']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-head']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-list']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "toolbar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
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
    onClick: (__VLS_ctx.startCreate)
};
__VLS_3.slots.default;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "prompt-layout" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "prompt-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.prompts))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectPrompt(item);
            } },
        key: (item.code),
        ...{ class: (['prompt-item', { active: __VLS_ctx.activeCode === item.code }]) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "item-main" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (item.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    (__VLS_ctx.categoryLabel(item.category));
    const __VLS_8 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        size: "small",
        type: (item.enabled ? 'success' : 'info'),
    }));
    const __VLS_10 = __VLS_9({
        size: "small",
        type: (item.enabled ? 'success' : 'info'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    (item.enabled ? "启用" : "停用");
    var __VLS_11;
}
if (!__VLS_ctx.loading && __VLS_ctx.prompts.length === 0) {
    const __VLS_12 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        description: "暂无提示词",
    }));
    const __VLS_14 = __VLS_13({
        description: "暂无提示词",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "editor" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.saving) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "editor-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
(__VLS_ctx.isCreating ? "新增提示词" : "编辑提示词");
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.activeHelp);
const __VLS_16 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    modelValue: (__VLS_ctx.form.enabled),
    activeText: "启用",
    inactiveText: "停用",
}));
const __VLS_18 = __VLS_17({
    modelValue: (__VLS_ctx.form.enabled),
    activeText: "启用",
    inactiveText: "停用",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
const __VLS_20 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    labelPosition: "top",
}));
const __VLS_22 = __VLS_21({
    labelPosition: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    label: "分类",
}));
const __VLS_26 = __VLS_25({
    label: "分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    modelValue: (__VLS_ctx.form.category),
    placeholder: "选择提示词分类",
}));
const __VLS_30 = __VLS_29({
    modelValue: (__VLS_ctx.form.category),
    placeholder: "选择提示词分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
for (const [option] of __VLS_getVForSourceType((__VLS_ctx.categoryOptions))) {
    const __VLS_32 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        key: (option.value),
        label: (option.label),
        value: (option.value),
    }));
    const __VLS_34 = __VLS_33({
        key: (option.value),
        label: (option.label),
        value: (option.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
}
var __VLS_31;
var __VLS_27;
const __VLS_36 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    label: "名称",
}));
const __VLS_38 = __VLS_37({
    label: "名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    modelValue: (__VLS_ctx.form.title),
    maxlength: "100",
    showWordLimit: true,
    placeholder: "请输入提示词名称",
}));
const __VLS_42 = __VLS_41({
    modelValue: (__VLS_ctx.form.title),
    maxlength: "100",
    showWordLimit: true,
    placeholder: "请输入提示词名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
var __VLS_39;
const __VLS_44 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    label: "提示词内容",
}));
const __VLS_46 = __VLS_45({
    label: "提示词内容",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    modelValue: (__VLS_ctx.form.content),
    type: "textarea",
    rows: (16),
    maxlength: "12000",
    showWordLimit: true,
    placeholder: "例如：你是商城智能导购，只能基于现有商品回答，不能编造商品、价格、库存。",
}));
const __VLS_50 = __VLS_49({
    modelValue: (__VLS_ctx.form.content),
    type: "textarea",
    rows: (16),
    maxlength: "12000",
    showWordLimit: true,
    placeholder: "例如：你是商城智能导购，只能基于现有商品回答，不能编造商品、价格、库存。",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
var __VLS_47;
var __VLS_23;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions" },
});
const __VLS_52 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.Refresh),
}));
const __VLS_54 = __VLS_53({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.Refresh),
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
let __VLS_56;
let __VLS_57;
let __VLS_58;
const __VLS_59 = {
    onClick: (__VLS_ctx.load)
};
__VLS_55.slots.default;
var __VLS_55;
if (!__VLS_ctx.isCreating && !__VLS_ctx.isCorePrompt) {
    const __VLS_60 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        ...{ 'onClick': {} },
        type: "danger",
        plain: true,
        icon: (__VLS_ctx.Delete),
    }));
    const __VLS_62 = __VLS_61({
        ...{ 'onClick': {} },
        type: "danger",
        plain: true,
        icon: (__VLS_ctx.Delete),
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    let __VLS_64;
    let __VLS_65;
    let __VLS_66;
    const __VLS_67 = {
        onClick: (__VLS_ctx.removeCurrent)
    };
    __VLS_63.slots.default;
    var __VLS_63;
}
const __VLS_68 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    ...{ 'onClick': {} },
    type: "primary",
    icon: (__VLS_ctx.Check),
    loading: (__VLS_ctx.saving),
}));
const __VLS_70 = __VLS_69({
    ...{ 'onClick': {} },
    type: "primary",
    icon: (__VLS_ctx.Check),
    loading: (__VLS_ctx.saving),
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
let __VLS_72;
let __VLS_73;
let __VLS_74;
const __VLS_75 = {
    onClick: (__VLS_ctx.save)
};
__VLS_71.slots.default;
var __VLS_71;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-list']} */ ;
/** @type {__VLS_StyleScopedClasses['item-main']} */ ;
/** @type {__VLS_StyleScopedClasses['editor']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-head']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Check: Check,
            Delete: Delete,
            Plus: Plus,
            Refresh: Refresh,
            categoryOptions: categoryOptions,
            loading: loading,
            saving: saving,
            isCreating: isCreating,
            activeCode: activeCode,
            prompts: prompts,
            form: form,
            activeHelp: activeHelp,
            isCorePrompt: isCorePrompt,
            categoryLabel: categoryLabel,
            selectPrompt: selectPrompt,
            startCreate: startCreate,
            load: load,
            save: save,
            removeCurrent: removeCurrent,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
