import { httpGet, httpPost } from "./http";
export const authApi = {
    captcha: () => httpGet("/auth/captcha"),
    login: (cmd) => httpPost("/auth/login", cmd),
    logout: () => httpPost("/auth/logout"),
};
