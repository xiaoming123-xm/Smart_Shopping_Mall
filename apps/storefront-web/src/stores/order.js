import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
const STORAGE_KEY = "smart_mall_storefront_orders";
const oldBuyerName = "老罗";
const buyerName = "用户";
const statusLabel = {
    CREATED: "待付款",
    PAID: "待发货",
    SHIPPED: "待收货",
    RECEIVED: "待评价",
    COMPLETED: "已完成",
    CANCELLED: "已取消",
};
function defaultTraces(address) {
    const date = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const stamp = (offsetSeconds) => {
        const d = new Date(date.getTime() + offsetSeconds * 1000);
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    return [
        { time: stamp(-66), content: "连云港花果山水帘洞（起点）" },
        { time: stamp(-51), content: "武汉黄陂横店街道" },
        { time: stamp(-36), content: "郑州新郑薛店镇" },
        { time: stamp(-26), content: "泉州晋江磁灶镇" },
        { time: stamp(-16), content: "海口美兰机场物流中心" },
        { time: stamp(0), content: `已送达（${address}）` },
    ];
}
function readOrders() {
    if (typeof localStorage === "undefined")
        return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const rows = raw ? JSON.parse(raw) : [];
        return rows.map(normalizeOrder);
    }
    catch {
        return [];
    }
}
function normalizeOrder(order) {
    if (order.receiver === oldBuyerName)
        order.receiver = buyerName;
    order.items?.forEach((item) => {
        const product = item.product;
        if (product?.name)
            product.name = product.name.split(oldBuyerName).join(buyerName);
    });
    return order;
}
export const useOrderStore = defineStore("order", () => {
    const orders = ref(readOrders());
    const latest = computed(() => orders.value[0]);
    const pendingReviewCount = computed(() => orders.value.filter((o) => o.status === "RECEIVED").length);
    watch(orders, (rows) => {
        if (typeof localStorage !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
        }
    }, { deep: true });
    function createOrder(items, amount, backendId, backendOrderNo) {
        const id = backendId || "SO" + Date.now().toString().slice(-8);
        const rec = {
            id,
            orderNo: backendOrderNo || `2026${Date.now().toString().slice(-14)}`,
            items: JSON.parse(JSON.stringify(items)),
            amount,
            status: "CREATED",
            statusText: statusLabel.CREATED,
            receiver: buyerName,
            receiverPhone: "18699999999",
            address: "湖北省武汉市武昌区八一路",
            logisticsTraces: [],
            createdAt: new Date().toLocaleString("zh-CN"),
        };
        orders.value.unshift(rec);
        return rec;
    }
    function setStatus(orderId, status) {
        const o = getOrder(orderId);
        if (o) {
            o.status = status;
            o.statusText = statusLabel[status];
        }
    }
    function pay(orderId) {
        setStatus(orderId, "PAID");
    }
    function ship(orderId, traces) {
        const o = getOrder(orderId);
        if (!o)
            return;
        o.status = "SHIPPED";
        o.statusText = statusLabel.SHIPPED;
        o.logisticsCompany = "顺丰速运";
        o.trackingNo = "SF123456465";
        o.logisticsTraces = traces?.length ? traces : defaultTraces(o.address);
    }
    function receive(orderId) {
        const o = getOrder(orderId);
        if (!o)
            return;
        o.status = "RECEIVED";
        o.statusText = statusLabel.RECEIVED;
        if (!o.logisticsTraces.some((t) => t.content.includes("确认收货"))) {
            o.logisticsTraces.push({ time: new Date().toLocaleString("zh-CN"), content: "收件人已确认收货" });
        }
    }
    function review(orderId, rating, content) {
        const o = getOrder(orderId);
        if (!o)
            return;
        o.status = "COMPLETED";
        o.statusText = statusLabel.COMPLETED;
        o.rating = rating;
        o.reviewContent = content;
    }
    function getOrder(orderId) {
        return orders.value.find((x) => x.id === orderId);
    }
    return { orders, latest, pendingReviewCount, createOrder, pay, ship, receive, review, getOrder };
});
