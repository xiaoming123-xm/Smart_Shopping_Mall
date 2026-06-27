// 用例：支付订单。demo 中模拟支付成功，更新资金单状态。
// 真实接入：此处对接后端 mall-application 的 PayOrderUseCase（支付回调/双轨记账在后端编排）。
import { useOrderStore } from "@/stores/order";
import type { Router } from "vue-router";

export function payOrder(orderId: string, router: Router) {
  const orderStore = useOrderStore();
  orderStore.pay(orderId);
  router.push("/order");
}