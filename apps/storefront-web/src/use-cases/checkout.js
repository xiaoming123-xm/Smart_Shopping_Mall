import { createBackendOrder } from "@/api/mall";
import { useCartStore } from "@/stores/cart";
import { useOrderStore } from "@/stores/order";
export async function checkout(router) {
    const cart = useCartStore();
    const orderStore = useOrderStore();
    if (cart.items.length === 0)
        return { ok: false, msg: "购物车为空" };
    const backendOrder = await createBackendOrder(cart.items, cart.total);
    const localOrder = orderStore.createOrder(cart.items, Number(backendOrder.totalAmount || cart.total), String(backendOrder.id), backendOrder.orderNo);
    cart.clear();
    router.push(`/payment/${localOrder.id}`);
    return { ok: true, orderId: localOrder.id };
}
