// 认证用例：页面只触发，不关心验证码/token 的组装细节
import { authApi, setToken, clearToken } from "@/api";
import type { CaptchaDTO } from "@/api";

export interface LoginInput { username: string; password: string; captchaKey: string; captchaCode: string; }
export interface LoginOutput { token: string; username: string; nickname: string; }

export async function fetchCaptcha(): Promise<CaptchaDTO> {
  return authApi.captcha();
}

export async function loginUseCase(input: LoginInput): Promise<LoginOutput> {
  const dto = await authApi.login(input);
  setToken(dto.token);
  return dto;
}

export async function logoutUseCase(): Promise<void> {
  try { await authApi.logout(); } catch { /* 本地清除即可，忽略后端错误 */ }
  clearToken();
}
