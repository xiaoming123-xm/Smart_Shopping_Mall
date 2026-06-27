// 用例：结算下单。组装“购物车 -> 创建订单 -> 跳转支付”的完整流程。
// 对应文档：前端 use-cases 集中管理跨步骤业务操作，页面组件只触发用例。
import { useCartStore } from "@/stores/cart";
import { useOrderStore } from "@/stores/order";
import type { Router } from "vue-router";

export function checkout(router: Router) {
  const cart = useCartStore();
  const orderStore = useOrderStore();
  if (cart.items.length === 0) return { ok: false, msg: "购物车为空" };

  const order = orderStore.createOrder(cart.items, cart.total);
  cart.clear();
  router.push(`/payment/${order.id}`);
  return { ok: true, orderId: order.id };
}