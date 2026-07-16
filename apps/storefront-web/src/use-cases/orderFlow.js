import { getBackendLogistics, receiveBackendOrder, requestBackendRefund, reviewBackendOrder, shipBackendOrder } from "@/api/mall";
import { useOrderStore } from "@/stores/order";
import { syncOrdersFromBackend } from "./orderSync";
function toBackendId(orderId) {
    const id = Number(orderId);
    return Number.isFinite(id) ? id : null;
}
export async function shipOrderFlow(orderId) {
    const store = useOrderStore();
    const backendId = toBackendId(orderId);
    if (backendId !== null) {
        await shipBackendOrder(backendId);
        const traces = await getBackendLogistics(backendId);
        store.ship(orderId, traces);
        await syncOrdersFromBackend();
        return;
    }
    store.ship(orderId);
}
export async function receiveOrderFlow(orderId) {
    const store = useOrderStore();
    const backendId = toBackendId(orderId);
    if (backendId !== null) {
        await receiveBackendOrder(backendId);
        await syncOrdersFromBackend();
        return;
    }
    store.receive(orderId);
}
export async function reviewOrderFlow(orderId, rating, content) {
    const store = useOrderStore();
    const backendId = toBackendId(orderId);
    if (backendId !== null) {
        await reviewBackendOrder(backendId, rating, content);
        await syncOrdersFromBackend();
        return;
    }
    store.review(orderId, rating, content);
}
export async function requestRefundFlow(orderId, productName) {
    const store = useOrderStore();
    const backendId = toBackendId(orderId);
    const reason = productName ? `用户申请退款/退货：${productName}` : "用户申请退款/退货";
    if (backendId !== null) {
        await requestBackendRefund(backendId, reason);
        await syncOrdersFromBackend();
        return;
    }
    store.requestRefund(orderId, reason);
}
