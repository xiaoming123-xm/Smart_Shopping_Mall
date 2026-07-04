import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getToken, setToken as setHttpToken, clearToken } from "@/api";
const USER_KEY = "sm_user";
function readUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
export const useAuthStore = defineStore("auth", () => {
    const token = ref(getToken());
    const stored = readUser();
    const username = ref(stored?.username ?? "");
    const nickname = ref(stored?.nickname ?? "");
    const isLoggedIn = computed(() => !!token.value);
    // 登录成功后：token 已由 use-case 通过 http 层写入 localStorage，这里同步内存态
    function setLogin(dto) {
        token.value = dto.token;
        setHttpToken(dto.token);
        username.value = dto.username;
        nickname.value = dto.nickname;
        localStorage.setItem(USER_KEY, JSON.stringify({ username: dto.username, nickname: dto.nickname }));
    }
    function clear() {
        token.value = null;
        username.value = "";
        nickname.value = "";
        clearToken();
        localStorage.removeItem(USER_KEY);
    }
    return { token, username, nickname, isLoggedIn, setLogin, clear };
});
