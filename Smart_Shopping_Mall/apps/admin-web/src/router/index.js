import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
const routes = [
    { path: "/login", name: "login", component: () => import("@/views/login/index.vue"), meta: { public: true } },
    {
        path: "/",
        component: () => import("@/layouts/AdminLayout.vue"),
        redirect: "/home",
        children: [
            { path: "home", name: "home", component: () => import("@/views/home/index.vue"), meta: { title: "首页" } },
            { path: "catalog/category", name: "category", component: () => import("@/views/catalog/category.vue"), meta: { title: "分类管理" } },
            { path: "catalog/brand", name: "brand", component: () => import("@/views/catalog/brand.vue"), meta: { title: "品牌管理" } },
            { path: "catalog/attribute", name: "attribute", component: () => import("@/views/catalog/attribute.vue"), meta: { title: "属性管理" } },
            { path: "catalog/product", name: "product", component: () => import("@/views/catalog/product.vue"), meta: { title: "商品管理" } },
            { path: "inventory", name: "inventory", component: () => import("@/views/inventory/index.vue"), meta: { title: "库存管理" } },
            { path: "order", name: "order", component: () => import("@/views/order/index.vue"), meta: { title: "订单管理" } },
            { path: "payment", name: "payment", component: () => import("@/views/payment/index.vue"), meta: { title: "支付管理" } },
            { path: "system/user", name: "system-user", component: () => import("@/views/system/user.vue"), meta: { title: "用户管理" } },
        ],
    },
    { path: "/:pathMatch(.*)*", redirect: "/home" },
];
const router = createRouter({
    history: createWebHistory(),
    routes,
});
router.beforeEach((to) => {
    const auth = useAuthStore();
    if (to.meta.public)
        return true;
    if (!auth.isLoggedIn) {
        return { path: "/login", query: { redirect: to.fullPath } };
    }
    return true;
});
export default router;
