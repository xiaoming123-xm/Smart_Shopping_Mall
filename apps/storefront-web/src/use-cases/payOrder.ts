import { createAndPayBackendPayment, payBackendOrder } from "@/api/mall";
import { useOrderStore } from "@/stores/order";
import type { Router } from "vue-router";
import { syncOrdersFromBackend } from "./orderSync";

export async function payOrder(orderId: string, router: Router) {
  const orderStore = useOrderStore();
  const order = orderStore.getOrder(orderId);
  if (order) {
    if (order.status === "PAID") {
      router.push("/order");
      return;
    }
    const backendId = Number(order.id);
    if (Number.isFinite(backendId)) {
      let paymentError: unknown;
      let orderError: unknown;

      try {
        await createAndPayBackendPayment(backendId, Number(order.amount));
      } catch (error) {
        paymentError = error;
      }

      try {
        await payBackendOrder(backendId);
      } catch (error) {
        orderError = error;
      }

      await syncOrdersFromBackend();
      const latestOrder = orderStore.getOrder(orderId);
      if (latestOrder?.status === "PAID") {
        router.push("/order");
        return;
      }

      throw orderError || paymentError || new Error("支付失败，请稍后重试");
    }
  }
  else {
    orderStore.pay(orderId);
  }
  router.push("/order");
}
