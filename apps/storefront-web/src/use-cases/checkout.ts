import { createBackendOrder } from "@/api/mall";
import { useCartStore } from "@/stores/cart";
import { useOrderStore } from "@/stores/order";
import type { Router } from "vue-router";
import { syncOrdersFromBackend } from "./orderSync";

export async function checkout(router: Router) {
  const cart = useCartStore();
  const orderStore = useOrderStore();
  if (cart.items.length === 0) return { ok: false, msg: "购物车为空" };

  const backendOrder = await createBackendOrder(cart.items, cart.total);
  const localOrder = orderStore.createOrder(cart.items, Number(backendOrder.totalAmount || cart.total), String(backendOrder.id), backendOrder.orderNo);
  await syncOrdersFromBackend();
  cart.clear();
  router.push(`/payment/${localOrder.id}`);
  return { ok: true, orderId: localOrder.id };
}
