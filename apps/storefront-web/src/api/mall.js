import { httpGet, httpPost } from "./http";
import { products as fallbackProducts } from "./mock";
const categoryNames = {
    1: "数码",
    2: "家居",
    3: "服饰",
    4: "食品",
};
function toProduct(spu) {
    const fallback = fallbackProducts.find((p) => p.id === Number(spu.id)) || fallbackProducts[0];
    const cover = spu.mainImage || fallback.cover;
    return {
        id: Number(spu.id),
        name: spu.name || "未命名商品",
        category: categoryNames[Number(spu.categoryId)] || "全部",
        price: Number(spu.price ?? 0),
        cost: Number(spu.costPrice ?? 0),
        stock: Number(spu.stock ?? 0),
        sales: Math.max(20, Number(spu.sort ?? 0) * 3),
        buyers: Math.max(0, Number(spu.sort ?? 0)),
        cover,
        images: [cover],
        variants: [{ label: "默认款", image: cover }],
        desc: spu.description || "商城精选商品，可加入购物车并完成模拟下单支付。",
        tags: fallback.tags,
        detail: fallback.detail,
    };
}
export async function listProducts() {
    try {
        const rows = await httpGet("/catalog/products");
        return rows.length ? rows.map(toProduct) : fallbackProducts;
    }
    catch {
        return fallbackProducts;
    }
}
export async function getProductDetail(id) {
    try {
        return toProduct(await httpGet(`/catalog/products/${id}`));
    }
    catch {
        return fallbackProducts.find((p) => p.id === id);
    }
}
export async function createBackendOrder(items, amount) {
    return httpPost("/orders", {
        memberId: 1,
        receiver: "用户",
        receiverPhone: "18699999999",
        address: "湖北省武汉市武昌区八一路",
        items: items.map((it) => ({
            skuId: it.product.id,
            skuCode: `SKU-${it.product.id}`,
            productName: it.product.name,
            price: it.product.price,
            quantity: it.qty,
        })),
    }).catch(() => ({
        id: Date.now(),
        orderNo: `LOCAL-${Date.now()}`,
        status: "CREATED",
        statusText: "待付款",
        totalAmount: amount,
        receiver: "用户",
        receiverPhone: "18699999999",
        address: "湖北省武汉市武昌区八一路",
        createdAt: new Date().toISOString(),
        items: items.map((it) => ({ productName: it.product.name, quantity: it.qty, price: it.product.price })),
    }));
}
export async function createAndPayBackendPayment(orderId, amount) {
    const payment = await httpPost("/payments", { orderId, channel: "MOCK", amount });
    return httpPost(`/payments/${payment.id}/pay`);
}
export async function payBackendOrder(orderId) {
    await httpPost(`/orders/${orderId}/pay`);
}
export async function shipBackendOrder(orderId) {
    return httpPost(`/orders/${orderId}/ship`, {
        sender: "悟空",
        senderPhone: "18600000000",
        senderAddress: "江苏省连云港市花果山水帘洞",
        logisticsCompany: "顺丰速运",
        trackingNo: "SF123456465",
    });
}
export async function receiveBackendOrder(orderId) {
    return httpPost(`/orders/${orderId}/receive`);
}
export async function reviewBackendOrder(orderId, rating, content) {
    return httpPost(`/orders/${orderId}/review`, { rating, content });
}
export async function getBackendLogistics(orderId) {
    return httpGet(`/orders/${orderId}/logistics`);
}
export async function askShoppingGuide(message) {
    try {
        const reply = await httpPost("/ai/shopping-guide", { message });
        return reply.answer || reply.content || reply.message || "AI 已收到你的问题，但暂时没有生成内容。";
    }
    catch {
        const hit = fallbackProducts.find((p) => message.includes(p.category) || message.includes(p.name.slice(0, 2)));
        return hit
            ? `推荐你看看「${hit.name}」，价格 ¥${hit.price}，库存 ${hit.stock}，适合当前演示下单。`
            : "可以告诉我品类、预算或用途，我会帮你从当前商品里挑选。";
    }
}
