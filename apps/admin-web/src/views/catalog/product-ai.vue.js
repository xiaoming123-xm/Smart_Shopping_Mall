import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { ApiError } from "@/api";
import { loadProducts } from "@/use-cases/product.uc";
import { generateProductImage } from "@/use-cases/product-ai/generateProductImage";
import { replaceProductMainImage } from "@/use-cases/product-ai/replaceProductMainImage";
import { generateProductVideo } from "@/use-cases/product-ai/generateProductVideo";
import { loadAiTaskStatus } from "@/use-cases/product-ai/loadAiTaskStatus";
import { subscribeAiTaskProgress } from "@/use-cases/product-ai/subscribeAiTaskProgress";
const router = useRouter();
const products = ref([]);
const selectedProductId = ref();
const imageLoading = ref(false);
const replaceLoading = ref(false);
const videoLoading = ref(false);
const generatedImage = ref(null);
const videoTask = ref(null);
const stopProgress = ref(null);
const fallbackImage = "https://placehold.co/520x520?text=Upload+Image";
const selectedProduct = computed(() => products.value.find((item) => item.id === selectedProductId.value));
const imageModes = [
    { label: "换背景", value: "change_background" },
    { label: "风格转换", value: "style_transfer" },
    { label: "智能优化", value: "smart_optimize" },
];
const imageForm = reactive({
    imageUrl: "",
    mode: "change_background",
    prompt: "",
});
const videoForm = reactive({
    imageUrls: [],
    copyText: "",
    template: "fast_sale_15s",
    voiceStyle: "energetic",
});
async function load() {
    try {
        products.value = await loadProducts();
        if (!selectedProductId.value) {
            selectedProductId.value = products.value[0]?.id;
        }
        syncProductMaterial();
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "加载商品失败");
    }
}
function syncProductMaterial() {
    if (!imageForm.imageUrl) {
        useProductImage();
    }
    if (!videoForm.imageUrls.length) {
        addProductImageToVideo();
    }
    fillCopy();
}
function useProductImage() {
    imageForm.imageUrl = selectedProduct.value?.mainImage || fallbackImage;
}
function addProductImageToVideo() {
    const url = selectedProduct.value?.mainImage || imageForm.imageUrl || fallbackImage;
    if (!videoForm.imageUrls.includes(url) && videoForm.imageUrls.length < 9) {
        videoForm.imageUrls.push(url);
    }
}
async function onImageUpload(file) {
    const raw = file.raw;
    if (!raw)
        return;
    imageForm.imageUrl = await readFileAsDataUrl(raw);
}
async function onVideoUpload(file) {
    const raw = file.raw;
    if (!raw || videoForm.imageUrls.length >= 9)
        return;
    videoForm.imageUrls.push(await readFileAsDataUrl(raw));
}
function removeVideoImage(url) {
    videoForm.imageUrls = videoForm.imageUrls.filter((item) => item !== url);
}
async function onGenerateImage() {
    if (!selectedProductId.value) {
        ElMessage.warning("请先选择商品");
        return;
    }
    if (!imageForm.imageUrl) {
        ElMessage.warning("请上传或选择一张图片");
        return;
    }
    imageLoading.value = true;
    try {
        generatedImage.value = await generateProductImage({
            productId: selectedProductId.value,
            imageUrl: imageForm.imageUrl,
            mode: imageForm.mode,
            prompt: imageForm.prompt,
        });
        ElMessage.success("AI 商品图已生成");
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "生成商品图失败");
    }
    finally {
        imageLoading.value = false;
    }
}
async function onReplaceMainImage() {
    if (!selectedProductId.value || !generatedImage.value?.imageUrl)
        return;
    replaceLoading.value = true;
    try {
        await replaceProductMainImage(selectedProductId.value, generatedImage.value.imageUrl);
        await load();
        imageForm.imageUrl = generatedImage.value.imageUrl;
        ElMessage.success("已设为商品主图");
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "替换主图失败");
    }
    finally {
        replaceLoading.value = false;
    }
}
function fillCopy() {
    const name = selectedProduct.value?.name || "精选商品";
    videoForm.copyText = `${name}，突出商品质感、使用场景和促销卖点，节奏清晰，适合短视频投放。`;
}
async function onGenerateVideo() {
    if (!selectedProductId.value) {
        ElMessage.warning("请先选择商品");
        return;
    }
    if (!videoForm.imageUrls.length) {
        ElMessage.warning("请上传至少一张视频素材图");
        return;
    }
    videoLoading.value = true;
    stopProgress.value?.();
    try {
        const resp = await generateProductVideo({
            productId: selectedProductId.value,
            imageUrls: videoForm.imageUrls.slice(0, 9),
            copyText: videoForm.copyText,
            template: videoForm.template,
            voiceStyle: videoForm.voiceStyle,
        });
        videoTask.value = await loadAiTaskStatus(resp.taskId);
        stopProgress.value = subscribeAiTaskProgress(resp.taskId, (next) => {
            videoTask.value = next;
            if (next.status === "SUCCESS" || next.status === "FAILED") {
                videoLoading.value = false;
            }
        });
    }
    catch (e) {
        videoLoading.value = false;
        ElMessage.error(e instanceof ApiError ? e.message : "生成视频失败");
    }
}
async function copyVideoUrl() {
    if (!videoTask.value?.outputUrl)
        return;
    await navigator.clipboard.writeText(videoTask.value.outputUrl);
    ElMessage.success("分享链接已复制");
}
function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("read file failed"));
        reader.readAsDataURL(file);
    });
}
onMounted(load);
onBeforeUnmount(() => stopProgress.value?.());
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['product-context']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-head']} */ ;
/** @type {__VLS_StyleScopedClasses['product-context']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-card']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-head']} */ ;
/** @type {__VLS_StyleScopedClasses['image-box']} */ ;
/** @type {__VLS_StyleScopedClasses['image-box']} */ ;
/** @type {__VLS_StyleScopedClasses['result-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['material']} */ ;
/** @type {__VLS_StyleScopedClasses['el-image']} */ ;
/** @type {__VLS_StyleScopedClasses['material']} */ ;
/** @type {__VLS_StyleScopedClasses['video-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['context']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['image-compare']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ai-center" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "hero" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "context" },
});
const __VLS_0 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedProductId),
    filterable: true,
    placeholder: "选择商品上下文",
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedProductId),
    filterable: true,
    placeholder: "选择商品上下文",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onChange: (__VLS_ctx.syncProductMaterial)
};
__VLS_3.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.products))) {
    const __VLS_8 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        key: (item.id),
        label: (item.name),
        value: (item.id),
    }));
    const __VLS_10 = __VLS_9({
        key: (item.id),
        label: (item.name),
        value: (item.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
var __VLS_3;
const __VLS_12 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push('/catalog/product');
    }
};
__VLS_15.slots.default;
var __VLS_15;
if (__VLS_ctx.selectedProduct) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "product-context" },
    });
    const __VLS_20 = {}.ElImage;
    /** @type {[typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        ...{ class: "product-cover" },
        src: (__VLS_ctx.selectedProduct.mainImage || __VLS_ctx.fallbackImage),
        fit: "cover",
    }));
    const __VLS_22 = __VLS_21({
        ...{ class: "product-cover" },
        src: (__VLS_ctx.selectedProduct.mainImage || __VLS_ctx.fallbackImage),
        fit: "cover",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.selectedProduct.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.selectedProduct.id);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.selectedProduct.price);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.selectedProduct.stock ?? 0);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "feature-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
    ...{ class: "feature-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "feature-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
const __VLS_24 = {}.ElTag;
/** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    type: "success",
}));
const __VLS_26 = __VLS_25({
    type: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
var __VLS_27;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "editor-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "editor-panel" },
});
const __VLS_28 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    labelWidth: "92px",
}));
const __VLS_30 = __VLS_29({
    labelWidth: "92px",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    label: "输入图片",
}));
const __VLS_34 = __VLS_33({
    label: "输入图片",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "upload-row" },
});
const __VLS_36 = {}.ElUpload;
/** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    autoUpload: (false),
    showFileList: (false),
    accept: "image/*",
    onChange: (__VLS_ctx.onImageUpload),
}));
const __VLS_38 = __VLS_37({
    autoUpload: (false),
    showFileList: (false),
    accept: "image/*",
    onChange: (__VLS_ctx.onImageUpload),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
var __VLS_43;
var __VLS_39;
const __VLS_44 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    ...{ 'onClick': {} },
}));
const __VLS_46 = __VLS_45({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
let __VLS_48;
let __VLS_49;
let __VLS_50;
const __VLS_51 = {
    onClick: (__VLS_ctx.useProductImage)
};
__VLS_47.slots.default;
var __VLS_47;
var __VLS_35;
const __VLS_52 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    label: "图片URL",
}));
const __VLS_54 = __VLS_53({
    label: "图片URL",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    modelValue: (__VLS_ctx.imageForm.imageUrl),
    placeholder: "上传后自动填入，也可以粘贴图片 URL",
}));
const __VLS_58 = __VLS_57({
    modelValue: (__VLS_ctx.imageForm.imageUrl),
    placeholder: "上传后自动填入，也可以粘贴图片 URL",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
var __VLS_55;
const __VLS_60 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    label: "生成模式",
}));
const __VLS_62 = __VLS_61({
    label: "生成模式",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.ElSegmented;
/** @type {[typeof __VLS_components.ElSegmented, typeof __VLS_components.elSegmented, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    modelValue: (__VLS_ctx.imageForm.mode),
    options: (__VLS_ctx.imageModes),
}));
const __VLS_66 = __VLS_65({
    modelValue: (__VLS_ctx.imageForm.mode),
    options: (__VLS_ctx.imageModes),
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
var __VLS_63;
const __VLS_68 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    label: "改图要求",
}));
const __VLS_70 = __VLS_69({
    label: "改图要求",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    modelValue: (__VLS_ctx.imageForm.prompt),
    type: "textarea",
    rows: (5),
    placeholder: "例如：保留商品主体，改成浅灰摄影棚背景，增强清晰度，适合电商主图",
}));
const __VLS_74 = __VLS_73({
    modelValue: (__VLS_ctx.imageForm.prompt),
    type: "textarea",
    rows: (5),
    placeholder: "例如：保留商品主体，改成浅灰摄影棚背景，增强清晰度，适合电商主图",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
var __VLS_71;
var __VLS_31;
const __VLS_76 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.imageLoading),
}));
const __VLS_78 = __VLS_77({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.imageLoading),
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
let __VLS_80;
let __VLS_81;
let __VLS_82;
const __VLS_83 = {
    onClick: (__VLS_ctx.onGenerateImage)
};
__VLS_79.slots.default;
var __VLS_79;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "image-compare" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "image-box" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_84 = {}.ElImage;
/** @type {[typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    src: (__VLS_ctx.imageForm.imageUrl || __VLS_ctx.fallbackImage),
    fit: "cover",
}));
const __VLS_86 = __VLS_85({
    src: (__VLS_ctx.imageForm.imageUrl || __VLS_ctx.fallbackImage),
    fit: "cover",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "image-box" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
if (!__VLS_ctx.generatedImage) {
    const __VLS_88 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        description: "等待生成",
    }));
    const __VLS_90 = __VLS_89({
        description: "等待生成",
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
}
else {
    const __VLS_92 = {}.ElImage;
    /** @type {[typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        src: (__VLS_ctx.generatedImage.imageUrl),
        fit: "cover",
    }));
    const __VLS_94 = __VLS_93({
        src: (__VLS_ctx.generatedImage.imageUrl),
        fit: "cover",
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
}
if (__VLS_ctx.generatedImage) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-actions" },
    });
    const __VLS_96 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        tag: "a",
        href: (__VLS_ctx.generatedImage.imageUrl),
        target: "_blank",
    }));
    const __VLS_98 = __VLS_97({
        tag: "a",
        href: (__VLS_ctx.generatedImage.imageUrl),
        target: "_blank",
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    __VLS_99.slots.default;
    var __VLS_99;
    const __VLS_100 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        ...{ 'onClick': {} },
        loading: (__VLS_ctx.imageLoading),
    }));
    const __VLS_102 = __VLS_101({
        ...{ 'onClick': {} },
        loading: (__VLS_ctx.imageLoading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    let __VLS_104;
    let __VLS_105;
    let __VLS_106;
    const __VLS_107 = {
        onClick: (__VLS_ctx.onGenerateImage)
    };
    __VLS_103.slots.default;
    var __VLS_103;
    const __VLS_108 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
        ...{ 'onClick': {} },
        type: "success",
        loading: (__VLS_ctx.replaceLoading),
    }));
    const __VLS_110 = __VLS_109({
        ...{ 'onClick': {} },
        type: "success",
        loading: (__VLS_ctx.replaceLoading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    let __VLS_112;
    let __VLS_113;
    let __VLS_114;
    const __VLS_115 = {
        onClick: (__VLS_ctx.onReplaceMainImage)
    };
    __VLS_111.slots.default;
    var __VLS_111;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
    ...{ class: "feature-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "feature-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
const __VLS_116 = {}.ElTag;
/** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    type: "warning",
}));
const __VLS_118 = __VLS_117({
    type: "warning",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
var __VLS_119;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "editor-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "editor-panel" },
});
const __VLS_120 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    labelWidth: "92px",
}));
const __VLS_122 = __VLS_121({
    labelWidth: "92px",
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
const __VLS_124 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    label: "素材图片",
}));
const __VLS_126 = __VLS_125({
    label: "素材图片",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "upload-row" },
});
const __VLS_128 = {}.ElUpload;
/** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    autoUpload: (false),
    showFileList: (false),
    accept: "image/*",
    multiple: true,
    onChange: (__VLS_ctx.onVideoUpload),
}));
const __VLS_130 = __VLS_129({
    autoUpload: (false),
    showFileList: (false),
    accept: "image/*",
    multiple: true,
    onChange: (__VLS_ctx.onVideoUpload),
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
const __VLS_132 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({}));
const __VLS_134 = __VLS_133({}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
var __VLS_135;
var __VLS_131;
const __VLS_136 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    ...{ 'onClick': {} },
}));
const __VLS_138 = __VLS_137({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
let __VLS_140;
let __VLS_141;
let __VLS_142;
const __VLS_143 = {
    onClick: (__VLS_ctx.addProductImageToVideo)
};
__VLS_139.slots.default;
var __VLS_139;
var __VLS_127;
const __VLS_144 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    label: "已选素材",
}));
const __VLS_146 = __VLS_145({
    label: "已选素材",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_147.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "material-strip" },
});
for (const [url] of __VLS_getVForSourceType((__VLS_ctx.videoForm.imageUrls))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (url),
        ...{ class: "material" },
    });
    const __VLS_148 = {}.ElImage;
    /** @type {[typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ]} */ ;
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
        src: (url),
        fit: "cover",
    }));
    const __VLS_150 = __VLS_149({
        src: (url),
        fit: "cover",
    }, ...__VLS_functionalComponentArgsRest(__VLS_149));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.removeVideoImage(url);
            } },
    });
}
if (__VLS_ctx.videoForm.imageUrls.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "hint" },
    });
}
var __VLS_147;
const __VLS_152 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    label: "推广文案",
}));
const __VLS_154 = __VLS_153({
    label: "推广文案",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
const __VLS_156 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    modelValue: (__VLS_ctx.videoForm.copyText),
    type: "textarea",
    rows: (4),
    placeholder: "输入要展示在视频里的卖点、场景、促销信息",
}));
const __VLS_158 = __VLS_157({
    modelValue: (__VLS_ctx.videoForm.copyText),
    type: "textarea",
    rows: (4),
    placeholder: "输入要展示在视频里的卖点、场景、促销信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
const __VLS_160 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    ...{ 'onClick': {} },
    ...{ class: "copy-btn" },
}));
const __VLS_162 = __VLS_161({
    ...{ 'onClick': {} },
    ...{ class: "copy-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
let __VLS_164;
let __VLS_165;
let __VLS_166;
const __VLS_167 = {
    onClick: (__VLS_ctx.fillCopy)
};
__VLS_163.slots.default;
var __VLS_163;
var __VLS_155;
const __VLS_168 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    label: "视频模板",
}));
const __VLS_170 = __VLS_169({
    label: "视频模板",
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
const __VLS_172 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    modelValue: (__VLS_ctx.videoForm.template),
    ...{ style: {} },
}));
const __VLS_174 = __VLS_173({
    modelValue: (__VLS_ctx.videoForm.template),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
__VLS_175.slots.default;
const __VLS_176 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    label: "快节奏带货（15秒）",
    value: "fast_sale_15s",
}));
const __VLS_178 = __VLS_177({
    label: "快节奏带货（15秒）",
    value: "fast_sale_15s",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
const __VLS_180 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    label: "细节展示（30秒）",
    value: "detail_show_30s",
}));
const __VLS_182 = __VLS_181({
    label: "细节展示（30秒）",
    value: "detail_show_30s",
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
const __VLS_184 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    label: "促销活动（倒计时）",
    value: "promo_countdown",
}));
const __VLS_186 = __VLS_185({
    label: "促销活动（倒计时）",
    value: "promo_countdown",
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
var __VLS_175;
var __VLS_171;
const __VLS_188 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    label: "配音风格",
}));
const __VLS_190 = __VLS_189({
    label: "配音风格",
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
__VLS_191.slots.default;
const __VLS_192 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
    modelValue: (__VLS_ctx.videoForm.voiceStyle),
    ...{ style: {} },
}));
const __VLS_194 = __VLS_193({
    modelValue: (__VLS_ctx.videoForm.voiceStyle),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
__VLS_195.slots.default;
const __VLS_196 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    label: "激昂带货",
    value: "energetic",
}));
const __VLS_198 = __VLS_197({
    label: "激昂带货",
    value: "energetic",
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
const __VLS_200 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
    label: "温柔种草",
    value: "soft",
}));
const __VLS_202 = __VLS_201({
    label: "温柔种草",
    value: "soft",
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
const __VLS_204 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
    label: "专业讲解",
    value: "professional",
}));
const __VLS_206 = __VLS_205({
    label: "专业讲解",
    value: "professional",
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
var __VLS_195;
var __VLS_191;
var __VLS_123;
const __VLS_208 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.videoLoading),
}));
const __VLS_210 = __VLS_209({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.videoLoading),
}, ...__VLS_functionalComponentArgsRest(__VLS_209));
let __VLS_212;
let __VLS_213;
let __VLS_214;
const __VLS_215 = {
    onClick: (__VLS_ctx.onGenerateVideo)
};
__VLS_211.slots.default;
var __VLS_211;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-title" },
});
if (!__VLS_ctx.videoTask) {
    const __VLS_216 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
        description: "等待生成视频",
    }));
    const __VLS_218 = __VLS_217({
        description: "等待生成视频",
    }, ...__VLS_functionalComponentArgsRest(__VLS_217));
}
else {
    const __VLS_220 = {}.ElProgress;
    /** @type {[typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ]} */ ;
    // @ts-ignore
    const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
        percentage: (__VLS_ctx.videoTask.progress || 0),
        status: (__VLS_ctx.videoTask.status === 'FAILED' ? 'exception' : __VLS_ctx.videoTask.status === 'SUCCESS' ? 'success' : undefined),
    }));
    const __VLS_222 = __VLS_221({
        percentage: (__VLS_ctx.videoTask.progress || 0),
        status: (__VLS_ctx.videoTask.status === 'FAILED' ? 'exception' : __VLS_ctx.videoTask.status === 'SUCCESS' ? 'success' : undefined),
    }, ...__VLS_functionalComponentArgsRest(__VLS_221));
    const __VLS_224 = {}.ElDescriptions;
    /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
        column: (1),
        border: true,
        size: "small",
        ...{ class: "task-desc" },
    }));
    const __VLS_226 = __VLS_225({
        column: (1),
        border: true,
        size: "small",
        ...{ class: "task-desc" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_225));
    __VLS_227.slots.default;
    const __VLS_228 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
        label: "任务ID",
    }));
    const __VLS_230 = __VLS_229({
        label: "任务ID",
    }, ...__VLS_functionalComponentArgsRest(__VLS_229));
    __VLS_231.slots.default;
    (__VLS_ctx.videoTask.taskId);
    var __VLS_231;
    const __VLS_232 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
        label: "状态",
    }));
    const __VLS_234 = __VLS_233({
        label: "状态",
    }, ...__VLS_functionalComponentArgsRest(__VLS_233));
    __VLS_235.slots.default;
    (__VLS_ctx.videoTask.status);
    var __VLS_235;
    const __VLS_236 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
        label: "服务",
    }));
    const __VLS_238 = __VLS_237({
        label: "服务",
    }, ...__VLS_functionalComponentArgsRest(__VLS_237));
    __VLS_239.slots.default;
    (__VLS_ctx.videoTask.provider || '-');
    var __VLS_239;
    var __VLS_227;
    if (__VLS_ctx.videoTask.outputUrl) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "video-preview" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "play-box" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
            href: (__VLS_ctx.videoTask.outputUrl),
            target: "_blank",
        });
        (__VLS_ctx.videoTask.outputUrl);
    }
    if (__VLS_ctx.videoTask.outputUrl) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "result-actions" },
        });
        const __VLS_240 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
            tag: "a",
            href: (__VLS_ctx.videoTask.outputUrl),
            target: "_blank",
        }));
        const __VLS_242 = __VLS_241({
            tag: "a",
            href: (__VLS_ctx.videoTask.outputUrl),
            target: "_blank",
        }, ...__VLS_functionalComponentArgsRest(__VLS_241));
        __VLS_243.slots.default;
        var __VLS_243;
        const __VLS_244 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
            tag: "a",
            href: (__VLS_ctx.videoTask.outputUrl),
            target: "_blank",
        }));
        const __VLS_246 = __VLS_245({
            tag: "a",
            href: (__VLS_ctx.videoTask.outputUrl),
            target: "_blank",
        }, ...__VLS_functionalComponentArgsRest(__VLS_245));
        __VLS_247.slots.default;
        var __VLS_247;
        const __VLS_248 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
            ...{ 'onClick': {} },
        }));
        const __VLS_250 = __VLS_249({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_249));
        let __VLS_252;
        let __VLS_253;
        let __VLS_254;
        const __VLS_255 = {
            onClick: (__VLS_ctx.copyVideoUrl)
        };
        __VLS_251.slots.default;
        var __VLS_251;
    }
}
/** @type {__VLS_StyleScopedClasses['ai-center']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['context']} */ ;
/** @type {__VLS_StyleScopedClasses['product-context']} */ ;
/** @type {__VLS_StyleScopedClasses['product-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['meta']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-card']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-head']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-row']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-title']} */ ;
/** @type {__VLS_StyleScopedClasses['image-compare']} */ ;
/** @type {__VLS_StyleScopedClasses['image-box']} */ ;
/** @type {__VLS_StyleScopedClasses['image-box']} */ ;
/** @type {__VLS_StyleScopedClasses['result-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-card']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-head']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-row']} */ ;
/** @type {__VLS_StyleScopedClasses['material-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['material']} */ ;
/** @type {__VLS_StyleScopedClasses['hint']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-title']} */ ;
/** @type {__VLS_StyleScopedClasses['task-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['video-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['play-box']} */ ;
/** @type {__VLS_StyleScopedClasses['result-actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            router: router,
            products: products,
            selectedProductId: selectedProductId,
            imageLoading: imageLoading,
            replaceLoading: replaceLoading,
            videoLoading: videoLoading,
            generatedImage: generatedImage,
            videoTask: videoTask,
            fallbackImage: fallbackImage,
            selectedProduct: selectedProduct,
            imageModes: imageModes,
            imageForm: imageForm,
            videoForm: videoForm,
            syncProductMaterial: syncProductMaterial,
            useProductImage: useProductImage,
            addProductImageToVideo: addProductImageToVideo,
            onImageUpload: onImageUpload,
            onVideoUpload: onVideoUpload,
            removeVideoImage: removeVideoImage,
            onGenerateImage: onGenerateImage,
            onReplaceMainImage: onReplaceMainImage,
            fillCopy: fillCopy,
            onGenerateVideo: onGenerateVideo,
            copyVideoUrl: copyVideoUrl,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
