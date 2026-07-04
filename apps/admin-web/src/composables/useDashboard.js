import { ref } from "vue";
export function useDashboard() {
    const stats = ref([
        { label: "今日销售额", value: "¥0.00", icon: "💰", color: "#1890ff", sub: "昨日:¥98.50", trend: "-100%" },
        { label: "今日订单数", value: "0", icon: "🛒", color: "#52c41a", sub: "昨日:0", trend: "0%" },
        { label: "新增用户", value: "0", icon: "👤", color: "#fa8c16", sub: "昨日:0", trend: "0%" },
        { label: "今日退款", value: "¥0.00", icon: "↩️", color: "#f5222d", sub: "昨日:¥0.00", trend: "0%" },
    ]);
    const days = ["01-03", "01-04", "01-05", "01-06", "01-07", "01-08", "01-09", "01-10"].map(d => "2026-" + d);
    const salesAmt = [200, 180, 160, 330, 260, 200, 180, 120];
    const salesQty = [12, 10, 8, 20, 15, 12, 10, 7];
    const refundAmt = [15, 5, 0, 0, 0, 0, 0, 0];
    const refundQty = [2, 1, 0, 0, 0, 0, 0, 0];
    const pendingOrders = ref([
        { time: "2026-01-06 11:32:14", no: "20260111...LKAGO", buyer: "商城用户", status: "已付款,待发货", product: "恋爱星球项链高级感粉钻小爱心...", qty: 1, price: "¥59.90" },
        { time: "2026-01-05 11:33:00", no: "20260111...NBYQ", buyer: "商城用户", status: "已付款,待发货", product: "芦荟水乳爽肤水男士女保湿补水...", qty: 1, price: "¥59.90" },
    ]);
    const lowStock = ref([
        { name: "鲫鱼竿钓鱼竿手竿溪流碳素野钓竿...", id: "245524...", stock: 4 },
        { name: "女大童加绒加厚毛衣女秋冬15岁...", id: "422543...", stock: 0 },
        { name: "天然乳胶0胶水床垫卧室护脊弹簧...", id: "423205...", stock: 1 },
    ]);
    return { stats, days, salesAmt, salesQty, refundAmt, refundQty, pendingOrders, lowStock };
}
