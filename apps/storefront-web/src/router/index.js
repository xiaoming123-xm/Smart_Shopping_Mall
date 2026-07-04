import { createRouter, createWebHistory } from "vue-router";
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/", component: () => import("@/layouts/StoreLayout.vue"),
            children: [
                { path: "", redirect: "/home" },
                { path: "home", component: () => import("@/views/home/index.vue") },
                { path: "product/:id", component: () => import("@/views/product/index.vue") },
                { path: "cart", component: () => import("@/views/cart/index.vue") },
                { path: "order", component: () => import("@/views/order/index.vue") },
                { path: "payment/:orderId", component: () => import("@/views/payment/index.vue") },
                { path: "member", component: () => import("@/views/member/index.vue") },
            ],
        },
        { path: "/:pathMatch(.*)*", redirect: "/" },
    ],
});
export default router;
