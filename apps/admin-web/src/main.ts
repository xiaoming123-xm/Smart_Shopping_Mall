import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import App from "./App.vue";
import router from "./router";
import { setUnauthorizedHandler } from "@/api";
import "./styles/global.css";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(ElementPlus);
// 全量注册图标
for (const [key, comp] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, comp as any);
}
// token 失效时由 http 层回调跳转登录
setUnauthorizedHandler(() => {
  router.push("/login");
});
app.mount("#app");
