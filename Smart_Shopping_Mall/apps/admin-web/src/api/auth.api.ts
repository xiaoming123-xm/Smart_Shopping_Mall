import { httpGet, httpPost } from "./http";
import type { CaptchaDTO, LoginCommand, LoginDTO } from "./types";

export const authApi = {
  captcha: () => httpGet<CaptchaDTO>("/auth/captcha"),
  login: (cmd: LoginCommand) => httpPost<LoginDTO>("/auth/login", cmd),
  logout: () => httpPost<void>("/auth/logout"),
};
