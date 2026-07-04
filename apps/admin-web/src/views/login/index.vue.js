import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { User, Lock, Key } from "@element-plus/icons-vue";
import { fetchCaptcha, loginUseCase } from "@/use-cases/auth.uc";
import { useAuthStore } from "@/stores/auth";
import { ApiError } from "@/api";
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const formRef = ref();
const loading = ref(false);
const form = reactive({ username: "admin", password: "123456", captchaCode: "" });
const captcha = reactive({ captchaKey: "", imageBase64: "" });
const rules = {
    username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
    password: [{ required: true, message: "请输入密码", trigger: "blur" }],
    captchaCode: [{ required: true, message: "请输入验证码", trigger: "blur" }],
};
async function refreshCaptcha() {
    try {
        const dto = await fetchCaptcha();
        captcha.captchaKey = dto.captchaKey;
        captcha.imageBase64 = dto.imageBase64;
        form.captchaCode = "";
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "获取验证码失败");
    }
}
async function onSubmit() {
    if (!formRef.value)
        return;
    const valid = await formRef.value.validate().catch(() => false);
    if (!valid)
        return;
    loading.value = true;
    try {
        const dto = await loginUseCase({
            username: form.username,
            password: form.password,
            captchaKey: captcha.captchaKey,
            captchaCode: form.captchaCode,
        });
        auth.setLogin(dto);
        ElMessage.success("登录成功");
        const redirect = route.query.redirect || "/home";
        router.push(redirect);
    }
    catch (e) {
        ElMessage.error(e instanceof ApiError ? e.message : "登录失败");
        refreshCaptcha();
    }
    finally {
        loading.value = false;
    }
}
onMounted(refreshCaptcha);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['captcha-img']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "login-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "login-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "brand" },
});
const __VLS_0 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onKeyup': {} },
    ref: "formRef",
    model: (__VLS_ctx.form),
    rules: (__VLS_ctx.rules),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onKeyup': {} },
    ref: "formRef",
    model: (__VLS_ctx.form),
    rules: (__VLS_ctx.rules),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onKeyup: (__VLS_ctx.onSubmit)
};
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_8 = {};
__VLS_3.slots.default;
const __VLS_10 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
    prop: "username",
}));
const __VLS_12 = __VLS_11({
    prop: "username",
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
__VLS_13.slots.default;
const __VLS_14 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
    modelValue: (__VLS_ctx.form.username),
    placeholder: "用户名（默认 admin）",
    prefixIcon: (__VLS_ctx.User),
}));
const __VLS_16 = __VLS_15({
    modelValue: (__VLS_ctx.form.username),
    placeholder: "用户名（默认 admin）",
    prefixIcon: (__VLS_ctx.User),
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
var __VLS_13;
const __VLS_18 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
    prop: "password",
}));
const __VLS_20 = __VLS_19({
    prop: "password",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
__VLS_21.slots.default;
const __VLS_22 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
    modelValue: (__VLS_ctx.form.password),
    type: "password",
    showPassword: true,
    placeholder: "密码（默认 123456）",
    prefixIcon: (__VLS_ctx.Lock),
}));
const __VLS_24 = __VLS_23({
    modelValue: (__VLS_ctx.form.password),
    type: "password",
    showPassword: true,
    placeholder: "密码（默认 123456）",
    prefixIcon: (__VLS_ctx.Lock),
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
var __VLS_21;
const __VLS_26 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({
    prop: "captchaCode",
}));
const __VLS_28 = __VLS_27({
    prop: "captchaCode",
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
__VLS_29.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "captcha-row" },
});
const __VLS_30 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
    modelValue: (__VLS_ctx.form.captchaCode),
    placeholder: "验证码",
    prefixIcon: (__VLS_ctx.Key),
}));
const __VLS_32 = __VLS_31({
    modelValue: (__VLS_ctx.form.captchaCode),
    placeholder: "验证码",
    prefixIcon: (__VLS_ctx.Key),
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
if (__VLS_ctx.captcha.imageBase64) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        ...{ onClick: (__VLS_ctx.refreshCaptcha) },
        src: (__VLS_ctx.captcha.imageBase64),
        ...{ class: "captcha-img" },
        title: "点击刷新",
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.refreshCaptcha) },
        ...{ class: "captcha-img placeholder" },
    });
}
var __VLS_29;
const __VLS_34 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "submit" },
    loading: (__VLS_ctx.loading),
}));
const __VLS_36 = __VLS_35({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "submit" },
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
let __VLS_38;
let __VLS_39;
let __VLS_40;
const __VLS_41 = {
    onClick: (__VLS_ctx.onSubmit)
};
__VLS_37.slots.default;
var __VLS_37;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['login-page']} */ ;
/** @type {__VLS_StyleScopedClasses['login-card']} */ ;
/** @type {__VLS_StyleScopedClasses['brand']} */ ;
/** @type {__VLS_StyleScopedClasses['captcha-row']} */ ;
/** @type {__VLS_StyleScopedClasses['captcha-img']} */ ;
/** @type {__VLS_StyleScopedClasses['captcha-img']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['submit']} */ ;
// @ts-ignore
var __VLS_9 = __VLS_8;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            User: User,
            Lock: Lock,
            Key: Key,
            formRef: formRef,
            loading: loading,
            form: form,
            captcha: captcha,
            rules: rules,
            refreshCaptcha: refreshCaptcha,
            onSubmit: onSubmit,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
