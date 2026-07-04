import { getBackendLogistics, receiveBackendOrder, reviewBackendOrder, shipBackendOrder } from "@/api/mall";
import { useOrderStore } from "@/stores/order";
function toBackendId(orderId) {
    const id = Number(orderId);
    return Number.isFinite(id) ? id : null;
}
export async function shipOrderFlow(orderId) {
    const store = useOrderStore();
    const backendId = toBackendId(orderId);
    if (backendId !== null) {
        await shipBackendOrder(backendId).catch(() => null);
        const traces = await getBackendLogistics(backendId).catch(() => []);
        store.ship(orderId, traces);
        return;
    }
    store.ship(orderId);
}
export async function receiveOrderFlow(orderId) {
    const store = useOrderStore();
    const backendId = toBackendId(orderId);
    if (backendId !== null) {
        await receiveBackendOrder(backendId).catch(() => null);
    }
    store.receive(orderId);
}
export async function reviewOrderFlow(orderId, rating, content) {
    const store = useOrderStore();
    const backendId = toBackendId(orderId);
    if (backendId !== null) {
        await reviewBackendOrder(backendId, rating, content).catch(() => null);
    }
    store.review(orderId, rating, content);
}
