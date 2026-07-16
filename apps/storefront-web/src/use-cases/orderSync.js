import { listBackendOrders, listProducts } from "@/api/mall";
import { useOrderStore } from "@/stores/order";
function makeFallbackProduct(order, item, products) {
    const cover = products[0]?.cover || "";
    return {
        id: Number(order.id),
        skuId: item.skuId ? Number(item.skuId) : Number(order.id),
        skuCode: item.skuCode || `SKU-${order.id}`,
        name: item.productName,
        category: "商城商品",
        price: Number(item.price),
        cost: 0,
        stock: 0,
        sales: 0,
        buyers: 0,
        cover,
        images: cover ? [cover] : [],
        variants: [{ label: item.skuCode || "默认款", image: cover, skuId: item.skuId ? Number(item.skuId) : undefined, skuCode: item.skuCode }],
        desc: item.productName,
        tags: ["订单商品"],
        detail: [],
    };
}
function mapBackendOrder(order, products) {
    const items = (order.items || []).map((item) => {
        const product = products.find((row) => row.skuId === Number(item.skuId) || row.name === item.productName) || makeFallbackProduct(order, item, products);
        return {
            product,
            qty: Number(item.quantity || 0),
        };
    });
    return {
        id: String(order.id),
        orderNo: order.orderNo,
        items,
        amount: Number(order.totalAmount || 0),
        status: (order.status || "CREATED"),
        statusText: order.statusText || order.status || "CREATED",
        receiver: order.receiver || "用户",
        receiverPhone: order.receiverPhone || "18699999999",
        address: order.address || "湖北省武汉市武昌区八一路",
        logisticsCompany: order.logisticsCompany,
        trackingNo: order.trackingNo,
        logisticsTraces: order.logisticsTraces || [],
        rating: order.rating,
        reviewContent: order.reviewContent,
        reviewReply: order.reviewReply,
        refundReason: order.refundReason,
        refundRequestedAt: order.refundRequestedAt,
        refundHandleNote: order.refundHandleNote,
        refundHandledAt: order.refundHandledAt,
        createdAt: order.createdAt,
    };
}
export async function syncOrdersFromBackend() {
    const [orders, products] = await Promise.all([listBackendOrders(), listProducts()]);
    const rows = orders.map((order) => mapBackendOrder(order, products));
    useOrderStore().replaceOrders(rows);
    return rows;
}
