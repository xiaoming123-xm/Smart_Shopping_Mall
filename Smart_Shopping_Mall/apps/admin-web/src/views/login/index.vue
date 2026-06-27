<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="brand">Smart_Shopping_Mall后台管理</h1>
      <el-form ref="formRef" :model="form" :rules="rules" @keyup.enter="onSubmit">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名（默认 admin）" :prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="密码（默认 123456）" :prefix-icon="Lock" />
        </el-form-item>
        <el-form-item prop="captchaCode">
          <div class="captcha-row">
            <el-input v-model="form.captchaCode" placeholder="验证码" :prefix-icon="Key" />
            <img
              v-if="captcha.imageBase64"
              :src="captcha.imageBase64"
              class="captcha-img"
              title="点击刷新"
              @click="refreshCaptcha"
            />
            <div v-else class="captcha-img placeholder" @click="refreshCaptcha">点击获取</div>
          </div>
        </el-form-item>
        <el-button type="primary" class="submit" :loading="loading" @click="onSubmit">登录</el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { User, Lock, Key } from "@element-plus/icons-vue";
import { fetchCaptcha, loginUseCase } from "@/use-cases/auth.uc";
import { useAuthStore } from "@/stores/auth";
import { ApiError } from "@/api";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const formRef = ref<FormInstance>();
const loading = ref(false);
const form = reactive({ username: "admin", password: "123456", captchaCode: "" });
const captcha = reactive({ captchaKey: "", imageBase64: "" });

const rules: FormRules = {
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
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "获取验证码失败");
  }
}

async function onSubmit() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
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
    const redirect = (route.query.redirect as string) || "/home";
    router.push(redirect);
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "登录失败");
    refreshCaptcha();
  } finally {
    loading.value = false;
  }
}

onMounted(refreshCaptcha);
</script>

<style scoped>
.login-page { height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1f2937, #374151); }
.login-card { width: 380px; padding: 36px; background: #fff; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,.2); }
.brand { font-size: 20px; text-align: center; margin: 0 0 24px; color: #111827; }
.captcha-row { display: flex; gap: 8px; width: 100%; }
.captcha-img { width: 120px; height: 40px; border: 1px solid #e5e7eb; border-radius: 4px; cursor: pointer; object-fit: cover; }
.captcha-img.placeholder { display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 12px; }
.submit { width: 100%; margin-top: 8px; }
</style>
