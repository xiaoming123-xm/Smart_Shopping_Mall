import { createAndPayBackendPayment, payBackendOrder } from "@/api/mall";
import { useOrderStore } from "@/stores/order";
import type { Router } from "vue-router";

export async function payOrder(orderId: string, router: Router) {
  const orderStore = useOrderStore();
  const order = orderStore.getOrder(orderId);
  if (order) {
    const backendId = Number(order.id);
    if (Number.isFinite(backendId)) {
      await createAndPayBackendPayment(backendId, Number(order.amount)).catch(() => null);
      await payBackendOrder(backendId).catch(() => null);
    }
  }
  orderStore.pay(orderId);
  router.push("/order");
}
