// 认证用例：页面只触发，不关心验证码/token 的组装细节
import { authApi, setToken, clearToken } from "@/api";
export async function fetchCaptcha() {
    return authApi.captcha();
}
export async function loginUseCase(input) {
    const dto = await authApi.login(input);
    setToken(dto.token);
    return dto;
}
export async function logoutUseCase() {
    try {
        await authApi.logout();
    }
    catch { /* 本地清除即可，忽略后端错误 */ }
    clearToken();
}
