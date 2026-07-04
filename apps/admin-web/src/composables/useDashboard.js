import { ref } from "vue";
import { loadOrders, shipOrder } from "@/use-cases/order.uc";
import { loadStocks } from "@/use-cases/inventory.uc";
const paidStatuses = new Set(["PAID", "SHIPPED", "RECEIVED", "COMPLETED"]);
export function useDashboard() {
    const loading = ref(false);
    const shippingOrderId = ref(null);
    const stats = ref([]);
    const days = ref(buildLastDays(8));
    const salesAmt = ref([]);
    const salesQty = ref([]);
    const refundAmt = ref([]);
    const refundQty = ref([]);
    const pendingOrders = ref([]);
    const lowStock = ref([]);
    async function loadDashboard() {
        loading.value = true;
        try {
            const [orders, stocks] = await Promise.all([
                loadOrders().catch(() => []),
                loadStocks().catch(() => []),
            ]);
            applyOrders(orders);
            applyStocks(stocks);
        }
        finally {
            loading.value = false;
        }
    }
    async function shipFromDashboard(orderId) {
        shippingOrderId.value = orderId;
        try {
            await shipOrder(orderId, {
                sender: "悟空",
                senderPhone: "18600000000",
                senderAddress: "江苏省连云港市花果山水帘洞",
                logisticsCompany: "顺丰速运",
                trackingNo: `SF${Date.now()}`,
            });
            await loadDashboard();
        }
        finally {
            shippingOrderId.value = null;
        }
    }
    function applyOrders(orders) {
        const dayKeys = days.value;
        salesAmt.value = dayKeys.map((day) => sumPaidAmount(orders, day));
        salesQty.value = dayKeys.map((day) => countPaidOrders(orders, day));
        refundAmt.value = dayKeys.map(() => 0);
        refundQty.value = dayKeys.map(() => 0);
        const today = dayKey(new Date());
        const yesterday = dayKey(offsetDate(new Date(), -1));
        const todaySales = sumPaidAmount(orders, today);
        const yesterdaySales = sumPaidAmount(orders, yesterday);
        const todayOrders = countPaidOrders(orders, today);
        const yesterdayOrders = countPaidOrders(orders, yesterday);
        stats.value = [
            {
                label: "今日销售额",
                value: money(todaySales),
                icon: "💰",
                color: "#1890ff",
                sub: `昨日:${money(yesterdaySales)}`,
                trend: trend(todaySales, yesterdaySales),
            },
            {
                label: "今日订单数",
                value: String(todayOrders),
                icon: "🛒",
                color: "#52c41a",
                sub: `昨日:${yesterdayOrders}`,
                trend: trend(todayOrders, yesterdayOrders),
            },
            {
                label: "新增用户",
                value: "0",
                icon: "👤",
                color: "#fa8c16",
                sub: "昨日:0",
                trend: "0%",
            },
            {
                label: "今日退款",
                value: "¥0.00",
                icon: "↩️",
                color: "#f5222d",
                sub: "昨日:¥0.00",
                trend: "0%",
            },
        ];
        pendingOrders.value = orders
            .filter((o) => o.status === "PAID")
            .map((o) => ({
            id: o.id,
            time: formatTime(o.createdAt),
            no: o.orderNo,
            buyer: o.receiver || "商城用户",
            status: o.statusText || "待发货",
            product: o.items?.[0]?.productName || "-",
            qty: o.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0,
            price: money(Number(o.totalAmount || 0)),
        }));
    }
    function applyStocks(stocks) {
        lowStock.value = stocks
            .filter((s) => Number(s.quantity) <= Number(s.warnThreshold ?? 10))
            .sort((a, b) => Number(a.quantity) - Number(b.quantity))
            .slice(0, 5)
            .map((s) => ({
            id: String(s.skuId),
            name: s.skuCode || `SKU-${s.skuId}`,
            stock: Number(s.quantity),
        }));
    }
    return {
        loading,
        shippingOrderId,
        stats,
        days,
        salesAmt,
        salesQty,
        refundAmt,
        refundQty,
        pendingOrders,
        lowStock,
        loadDashboard,
        shipFromDashboard,
    };
}
function buildLastDays(size) {
    return Array.from({ length: size }, (_, idx) => dayKey(offsetDate(new Date(), idx - size + 1)));
}
function offsetDate(base, offset) {
    const d = new Date(base);
    d.setDate(d.getDate() + offset);
    return d;
}
function dayKey(value) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}
function orderDay(order) {
    return order.createdAt ? order.createdAt.slice(0, 10) : dayKey(new Date());
}
function sumPaidAmount(orders, day) {
    return orders
        .filter((o) => paidStatuses.has(o.status) && orderDay(o) === day)
        .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
}
function countPaidOrders(orders, day) {
    return orders.filter((o) => paidStatuses.has(o.status) && orderDay(o) === day).length;
}
function trend(current, previous) {
    if (previous === 0)
        return current === 0 ? "0%" : "+100%";
    const rate = ((current - previous) / previous) * 100;
    return `${rate >= 0 ? "+" : ""}${rate.toFixed(0)}%`;
}
function money(value) {
    return `¥${Number(value || 0).toFixed(2)}`;
}
function formatTime(value) {
    if (!value)
        return "";
    return value.replace("T", " ").slice(0, 19);
}
