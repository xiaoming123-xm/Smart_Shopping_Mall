import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { ApiError } from "@/api";
import { loadProduct } from "@/use-cases/product.uc";
import { generateProductImage } from "@/use-cases/product-ai/generateProductImage";
import { replaceProductMainImage } from "@/use-cases/product-ai/replaceProductMainImage";
import { generateProductVideo } from "@/use-cases/product-ai/generateProductVideo";
import { loadAiTaskStatus } from "@/use-cases/product-ai/loadAiTaskStatus";
import { subscribeAiTaskProgress } from "@/use-cases/product-ai/subscribeAiTaskProgress";
const route = useRoute();
const router = useRouter();
const product = ref(null);
const activeTab = ref("image");
const imageLoading = ref(false);
const replaceLoading = ref(false);
const videoLoading = ref(false);
const generatedImage = ref(null);
const videoTask = ref(null);
const stopProgress = ref(null);
const fallbackImage = "https://placehold.co/420x420?text=Smart+Mall";
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
const imageOptions = computed(() => {
    const urls = [
        product.value?.mainImage || fallbackImage,
        generatedImage.value?.imageUrl,
        "https://placehold.co/420x420?text=Detail+01",
        "https://placehold.co/420x420?text=Detail+02",
    ].filter(Boolean);
    return Array.from(new Set(urls)).slice(0, 9);
});
async function init() {
    try {
        product.value = await loadProduct(Number(route.params.id));
        imageForm.imageUrl = product.value.mainImage || fallbackImage;
        videoForm.imageUrls = [imageForm.imageUrl];
        fillCopy();
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "加载商品失败");
    }
}
async function onImageUpload(file) {
    const raw = file.raw;
    if (!raw)
        return;
    imageForm.imageUrl = await readFileAsDataUrl(raw);
}
async function onGenerateImage() {
    if (!product.value?.id || !imageForm.imageUrl) {
        ElMessage.warning("请选择原图");
        return;
    }
    imageLoading.value = true;
    try {
        generatedImage.value = await generateProductImage({
            productId: product.value.id,
            imageUrl: imageForm.imageUrl,
            mode: imageForm.mode,
            prompt: imageForm.prompt,
        });
        ElMessage.success("商品图已生成");
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "生成商品图失败");
    }
    finally {
        imageLoading.value = false;
    }
}
async function onReplaceMainImage() {
    if (!product.value?.id || !generatedImage.value?.imageUrl)
        return;
    replaceLoading.value = true;
    try {
        product.value = await replaceProductMainImage(product.value.id, generatedImage.value.imageUrl);
        imageForm.imageUrl = product.value.mainImage || imageForm.imageUrl;
        ElMessage.success("已替换商品主图");
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "替换主图失败");
    }
    finally {
        replaceLoading.value = false;
    }
}
function fillCopy() {
    const name = product.value?.name || "精选商品";
    videoForm.copyText = `${name} 正在热卖，高清质感、价格友好，适合直播间和短视频投放。`;
}
async function onGenerateVideo() {
    if (!product.value?.id)
        return;
    if (!videoForm.imageUrls.length) {
        ElMessage.warning("请选择至少一张商品图片");
        return;
    }
    videoLoading.value = true;
    stopProgress.value?.();
    try {
        const resp = await generateProductVideo({
            productId: product.value.id,
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
onMounted(init);
onBeforeUnmount(() => stopProgress.value?.());
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['product-info']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-images']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-images']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-images']} */ ;
/** @type {__VLS_StyleScopedClasses['workbench']} */ ;
/** @type {__VLS_StyleScopedClasses['product-head']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ai-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "product-head" },
});
const __VLS_0 = {}.ElImage;
/** @type {[typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "product-image" },
    src: (__VLS_ctx.product?.mainImage || __VLS_ctx.fallbackImage),
    fit: "cover",
}));
const __VLS_2 = __VLS_1({
    ...{ class: "product-image" },
    src: (__VLS_ctx.product?.mainImage || __VLS_ctx.fallbackImage),
    fit: "cover",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "product-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
(__VLS_ctx.product?.name || "商品 AI 生成");
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "meta" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.product?.id);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.product?.price);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.product?.stock);
const __VLS_4 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onClick': {} },
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push('/catalog/product');
    }
};
__VLS_7.slots.default;
var __VLS_7;
const __VLS_12 = {}.ElTabs;
/** @type {[typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    modelValue: (__VLS_ctx.activeTab),
    ...{ class: "tabs" },
}));
const __VLS_14 = __VLS_13({
    modelValue: (__VLS_ctx.activeTab),
    ...{ class: "tabs" },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    label: "生成商品图",
    name: "image",
}));
const __VLS_18 = __VLS_17({
    label: "生成商品图",
    name: "image",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "workbench" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_20 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    labelWidth: "92px",
}));
const __VLS_22 = __VLS_21({
    labelWidth: "92px",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    label: "原图",
}));
const __VLS_26 = __VLS_25({
    label: "原图",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.ElRadioGroup;
/** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    modelValue: (__VLS_ctx.imageForm.imageUrl),
    ...{ class: "image-options" },
}));
const __VLS_30 = __VLS_29({
    modelValue: (__VLS_ctx.imageForm.imageUrl),
    ...{ class: "image-options" },
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
for (const [url] of __VLS_getVForSourceType((__VLS_ctx.imageOptions))) {
    const __VLS_32 = {}.ElRadioButton;
    /** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        key: (url),
        value: (url),
    }));
    const __VLS_34 = __VLS_33({
        key: (url),
        value: (url),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    var __VLS_35;
}
var __VLS_31;
var __VLS_27;
const __VLS_36 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    label: "上传图片",
}));
const __VLS_38 = __VLS_37({
    label: "上传图片",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.ElUpload;
/** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    autoUpload: (false),
    showFileList: (false),
    accept: "image/*",
    onChange: (__VLS_ctx.onImageUpload),
}));
const __VLS_42 = __VLS_41({
    autoUpload: (false),
    showFileList: (false),
    accept: "image/*",
    onChange: (__VLS_ctx.onImageUpload),
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
var __VLS_47;
var __VLS_43;
var __VLS_39;
const __VLS_48 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    label: "图片URL",
}));
const __VLS_50 = __VLS_49({
    label: "图片URL",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    modelValue: (__VLS_ctx.imageForm.imageUrl),
    placeholder: "可粘贴新的图片 URL",
}));
const __VLS_54 = __VLS_53({
    modelValue: (__VLS_ctx.imageForm.imageUrl),
    placeholder: "可粘贴新的图片 URL",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
var __VLS_51;
const __VLS_56 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    label: "生成模式",
}));
const __VLS_58 = __VLS_57({
    label: "生成模式",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.ElSegmented;
/** @type {[typeof __VLS_components.ElSegmented, typeof __VLS_components.elSegmented, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    modelValue: (__VLS_ctx.imageForm.mode),
    options: (__VLS_ctx.imageModes),
}));
const __VLS_62 = __VLS_61({
    modelValue: (__VLS_ctx.imageForm.mode),
    options: (__VLS_ctx.imageModes),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
var __VLS_59;
const __VLS_64 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    label: "提示词",
}));
const __VLS_66 = __VLS_65({
    label: "提示词",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
const __VLS_68 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    modelValue: (__VLS_ctx.imageForm.prompt),
    type: "textarea",
    rows: (4),
    placeholder: "例如：浅灰摄影棚背景，柔和阴影，高级电商主图",
}));
const __VLS_70 = __VLS_69({
    modelValue: (__VLS_ctx.imageForm.prompt),
    type: "textarea",
    rows: (4),
    placeholder: "例如：浅灰摄影棚背景，柔和阴影，高级电商主图",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
var __VLS_67;
var __VLS_23;
const __VLS_72 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.imageLoading),
}));
const __VLS_74 = __VLS_73({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.imageLoading),
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
let __VLS_76;
let __VLS_77;
let __VLS_78;
const __VLS_79 = {
    onClick: (__VLS_ctx.onGenerateImage)
};
__VLS_75.slots.default;
var __VLS_75;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel result-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
if (!__VLS_ctx.generatedImage) {
    const __VLS_80 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        description: "暂无生成结果",
    }));
    const __VLS_82 = __VLS_81({
        description: "暂无生成结果",
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
}
else {
    const __VLS_84 = {}.ElImage;
    /** @type {[typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        ...{ class: "result-image" },
        src: (__VLS_ctx.generatedImage.imageUrl),
        fit: "cover",
    }));
    const __VLS_86 = __VLS_85({
        ...{ class: "result-image" },
        src: (__VLS_ctx.generatedImage.imageUrl),
        fit: "cover",
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-actions" },
    });
    const __VLS_88 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        ...{ 'onClick': {} },
        loading: (__VLS_ctx.imageLoading),
    }));
    const __VLS_90 = __VLS_89({
        ...{ 'onClick': {} },
        loading: (__VLS_ctx.imageLoading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    let __VLS_92;
    let __VLS_93;
    let __VLS_94;
    const __VLS_95 = {
        onClick: (__VLS_ctx.onGenerateImage)
    };
    __VLS_91.slots.default;
    var __VLS_91;
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
        type: "success",
        loading: (__VLS_ctx.replaceLoading),
    }));
    const __VLS_102 = __VLS_101({
        ...{ 'onClick': {} },
        type: "success",
        loading: (__VLS_ctx.replaceLoading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    let __VLS_104;
    let __VLS_105;
    let __VLS_106;
    const __VLS_107 = {
        onClick: (__VLS_ctx.onReplaceMainImage)
    };
    __VLS_103.slots.default;
    var __VLS_103;
}
var __VLS_19;
const __VLS_108 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    label: "生成推广视频",
    name: "video",
}));
const __VLS_110 = __VLS_109({
    label: "生成推广视频",
    name: "video",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "workbench" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_112 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    labelWidth: "92px",
}));
const __VLS_114 = __VLS_113({
    labelWidth: "92px",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
const __VLS_116 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    label: "商品图片",
}));
const __VLS_118 = __VLS_117({
    label: "商品图片",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
const __VLS_120 = {}.ElCheckboxGroup;
/** @type {[typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    modelValue: (__VLS_ctx.videoForm.imageUrls),
    ...{ class: "checkbox-images" },
}));
const __VLS_122 = __VLS_121({
    modelValue: (__VLS_ctx.videoForm.imageUrls),
    ...{ class: "checkbox-images" },
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
for (const [url] of __VLS_getVForSourceType((__VLS_ctx.imageOptions))) {
    const __VLS_124 = {}.ElCheckbox;
    /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
        key: (url),
        value: (url),
    }));
    const __VLS_126 = __VLS_125({
        key: (url),
        value: (url),
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    __VLS_127.slots.default;
    const __VLS_128 = {}.ElImage;
    /** @type {[typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
        src: (url),
        fit: "cover",
    }));
    const __VLS_130 = __VLS_129({
        src: (url),
        fit: "cover",
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    var __VLS_127;
}
var __VLS_123;
var __VLS_119;
const __VLS_132 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    label: "推广文案",
}));
const __VLS_134 = __VLS_133({
    label: "推广文案",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
const __VLS_136 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    modelValue: (__VLS_ctx.videoForm.copyText),
    type: "textarea",
    rows: (4),
    placeholder: "输入推广文案",
}));
const __VLS_138 = __VLS_137({
    modelValue: (__VLS_ctx.videoForm.copyText),
    type: "textarea",
    rows: (4),
    placeholder: "输入推广文案",
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
const __VLS_140 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    ...{ 'onClick': {} },
    ...{ class: "copy-btn" },
}));
const __VLS_142 = __VLS_141({
    ...{ 'onClick': {} },
    ...{ class: "copy-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
let __VLS_144;
let __VLS_145;
let __VLS_146;
const __VLS_147 = {
    onClick: (__VLS_ctx.fillCopy)
};
__VLS_143.slots.default;
var __VLS_143;
var __VLS_135;
const __VLS_148 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    label: "模板",
}));
const __VLS_150 = __VLS_149({
    label: "模板",
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
__VLS_151.slots.default;
const __VLS_152 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    modelValue: (__VLS_ctx.videoForm.template),
    ...{ style: {} },
}));
const __VLS_154 = __VLS_153({
    modelValue: (__VLS_ctx.videoForm.template),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
const __VLS_156 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    label: "快节奏带货（15秒）",
    value: "fast_sale_15s",
}));
const __VLS_158 = __VLS_157({
    label: "快节奏带货（15秒）",
    value: "fast_sale_15s",
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
const __VLS_160 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    label: "细节展示（30秒）",
    value: "detail_show_30s",
}));
const __VLS_162 = __VLS_161({
    label: "细节展示（30秒）",
    value: "detail_show_30s",
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
const __VLS_164 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    label: "促销活动（倒计时）",
    value: "promo_countdown",
}));
const __VLS_166 = __VLS_165({
    label: "促销活动（倒计时）",
    value: "promo_countdown",
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
var __VLS_155;
var __VLS_151;
const __VLS_168 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    label: "配音",
}));
const __VLS_170 = __VLS_169({
    label: "配音",
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
const __VLS_172 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    modelValue: (__VLS_ctx.videoForm.voiceStyle),
    ...{ style: {} },
}));
const __VLS_174 = __VLS_173({
    modelValue: (__VLS_ctx.videoForm.voiceStyle),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
__VLS_175.slots.default;
const __VLS_176 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    label: "激昂",
    value: "energetic",
}));
const __VLS_178 = __VLS_177({
    label: "激昂",
    value: "energetic",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
const __VLS_180 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    label: "温柔",
    value: "soft",
}));
const __VLS_182 = __VLS_181({
    label: "温柔",
    value: "soft",
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
const __VLS_184 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    label: "专业讲解",
    value: "professional",
}));
const __VLS_186 = __VLS_185({
    label: "专业讲解",
    value: "professional",
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
var __VLS_175;
var __VLS_171;
var __VLS_115;
const __VLS_188 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.videoLoading),
}));
const __VLS_190 = __VLS_189({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.videoLoading),
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
let __VLS_192;
let __VLS_193;
let __VLS_194;
const __VLS_195 = {
    onClick: (__VLS_ctx.onGenerateVideo)
};
__VLS_191.slots.default;
var __VLS_191;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel result-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
if (!__VLS_ctx.videoTask) {
    const __VLS_196 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
        description: "暂无视频任务",
    }));
    const __VLS_198 = __VLS_197({
        description: "暂无视频任务",
    }, ...__VLS_functionalComponentArgsRest(__VLS_197));
}
else {
    const __VLS_200 = {}.ElProgress;
    /** @type {[typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ]} */ ;
    // @ts-ignore
    const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
        percentage: (__VLS_ctx.videoTask.progress || 0),
        status: (__VLS_ctx.videoTask.status === 'FAILED' ? 'exception' : __VLS_ctx.videoTask.status === 'SUCCESS' ? 'success' : undefined),
    }));
    const __VLS_202 = __VLS_201({
        percentage: (__VLS_ctx.videoTask.progress || 0),
        status: (__VLS_ctx.videoTask.status === 'FAILED' ? 'exception' : __VLS_ctx.videoTask.status === 'SUCCESS' ? 'success' : undefined),
    }, ...__VLS_functionalComponentArgsRest(__VLS_201));
    const __VLS_204 = {}.ElDescriptions;
    /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
        column: (1),
        border: true,
        size: "small",
        ...{ class: "task-desc" },
    }));
    const __VLS_206 = __VLS_205({
        column: (1),
        border: true,
        size: "small",
        ...{ class: "task-desc" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_205));
    __VLS_207.slots.default;
    const __VLS_208 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
        label: "任务ID",
    }));
    const __VLS_210 = __VLS_209({
        label: "任务ID",
    }, ...__VLS_functionalComponentArgsRest(__VLS_209));
    __VLS_211.slots.default;
    (__VLS_ctx.videoTask.taskId);
    var __VLS_211;
    const __VLS_212 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
        label: "状态",
    }));
    const __VLS_214 = __VLS_213({
        label: "状态",
    }, ...__VLS_functionalComponentArgsRest(__VLS_213));
    __VLS_215.slots.default;
    (__VLS_ctx.videoTask.status);
    var __VLS_215;
    const __VLS_216 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
        label: "服务",
    }));
    const __VLS_218 = __VLS_217({
        label: "服务",
    }, ...__VLS_functionalComponentArgsRest(__VLS_217));
    __VLS_219.slots.default;
    (__VLS_ctx.videoTask.provider || '-');
    var __VLS_219;
    var __VLS_207;
    if (__VLS_ctx.videoTask.outputUrl) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "result-actions" },
        });
        const __VLS_220 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
            tag: "a",
            href: (__VLS_ctx.videoTask.outputUrl),
            target: "_blank",
        }));
        const __VLS_222 = __VLS_221({
            tag: "a",
            href: (__VLS_ctx.videoTask.outputUrl),
            target: "_blank",
        }, ...__VLS_functionalComponentArgsRest(__VLS_221));
        __VLS_223.slots.default;
        var __VLS_223;
        const __VLS_224 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
            tag: "a",
            href: (__VLS_ctx.videoTask.outputUrl),
            target: "_blank",
        }));
        const __VLS_226 = __VLS_225({
            tag: "a",
            href: (__VLS_ctx.videoTask.outputUrl),
            target: "_blank",
        }, ...__VLS_functionalComponentArgsRest(__VLS_225));
        __VLS_227.slots.default;
        var __VLS_227;
        const __VLS_228 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
            ...{ 'onClick': {} },
        }));
        const __VLS_230 = __VLS_229({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_229));
        let __VLS_232;
        let __VLS_233;
        let __VLS_234;
        const __VLS_235 = {
            onClick: (__VLS_ctx.copyVideoUrl)
        };
        __VLS_231.slots.default;
        var __VLS_231;
    }
}
var __VLS_111;
var __VLS_15;
/** @type {__VLS_StyleScopedClasses['ai-page']} */ ;
/** @type {__VLS_StyleScopedClasses['product-head']} */ ;
/** @type {__VLS_StyleScopedClasses['product-image']} */ ;
/** @type {__VLS_StyleScopedClasses['product-info']} */ ;
/** @type {__VLS_StyleScopedClasses['meta']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['workbench']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['image-options']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['result-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['result-image']} */ ;
/** @type {__VLS_StyleScopedClasses['result-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['workbench']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-images']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['result-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['task-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['result-actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            router: router,
            product: product,
            activeTab: activeTab,
            imageLoading: imageLoading,
            replaceLoading: replaceLoading,
            videoLoading: videoLoading,
            generatedImage: generatedImage,
            videoTask: videoTask,
            fallbackImage: fallbackImage,
            imageModes: imageModes,
            imageForm: imageForm,
            videoForm: videoForm,
            imageOptions: imageOptions,
            onImageUpload: onImageUpload,
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
