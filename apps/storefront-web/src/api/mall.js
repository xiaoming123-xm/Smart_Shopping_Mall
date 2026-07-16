import { httpDelete, httpGet, httpPost } from "./http";
const categoryNames = {
    1: "数码家电",
    2: "服装鞋帽",
    3: "美妆个护",
    4: "家居生活",
    5: "食品生鲜",
    6: "文体娱乐",
    7: "其他",
    8: "羽绒服",
    9: "服装鞋帽",
    301: "衬衫",
    302: "羽绒服",
};
function buildPlaceholderProduct(spu) {
    return {
        id: Number(spu.id),
        skuId: Number(spu.id),
        skuCode: `SKU-${spu.id}`,
        name: spu.name || "未命名商品",
        category: categoryNames[Number(spu.categoryId)] || "全部",
        price: Number(spu.price ?? 0),
        cost: Number(spu.costPrice ?? 0),
        stock: Number(spu.stock ?? 0),
        sales: Math.max(0, Number(spu.sort ?? 0) * 3),
        buyers: Math.max(0, Number(spu.sort ?? 0)),
        cover: spu.mainImage || "",
        images: spu.mainImage ? [spu.mainImage] : [],
        variants: [],
        desc: spu.description || "",
        tags: buildAttributeTags(spu.attributesJson),
        detail: buildAttributeTags(spu.attributesJson),
    };
}
function buildVariants(spu, placeholder) {
    const attrTags = buildAttributeTags(spu.attributesJson);
    if (spu.skus?.length) {
        return spu.skus.map((sku) => ({
            label: sku.specs || attrTags.join("/") || sku.skuCode || "默认款",
            image: spu.mainImage || placeholder.cover,
            skuId: Number(sku.id),
            skuCode: sku.skuCode || undefined,
        }));
    }
    return [
        {
            label: "默认款",
            image: spu.mainImage || placeholder.cover,
            skuId: Number(spu.id),
            skuCode: `SKU-${spu.id}`,
        },
    ];
}
function buildAttributeTags(raw) {
    if (!raw)
        return [];
    try {
        const parsed = JSON.parse(raw);
        return Object.entries(parsed).flatMap(([key, value]) => Array.isArray(value) ? value.map((v) => `${key}:${v}`) : [`${key}:${value}`]);
    }
    catch {
        return [];
    }
}
function toProduct(spu) {
    const placeholder = buildPlaceholderProduct(spu);
    const variants = buildVariants(spu, placeholder);
    const defaultVariant = variants[0];
    const cover = spu.mainImage || "";
    return {
        id: Number(spu.id),
        skuId: defaultVariant?.skuId,
        skuCode: defaultVariant?.skuCode,
        name: spu.name || "未命名商品",
        category: categoryNames[Number(spu.categoryId)] || "全部",
        price: Number(spu.price ?? 0),
        cost: Number(spu.costPrice ?? 0),
        stock: Number(spu.stock ?? 0),
        sales: Math.max(0, Number(spu.sort ?? 0) * 3),
        buyers: Math.max(0, Number(spu.sort ?? 0)),
        cover,
        images: cover ? [cover] : [],
        variants,
        desc: spu.description || "",
        tags: buildAttributeTags(spu.attributesJson),
        detail: buildAttributeTags(spu.attributesJson),
    };
}
export async function listProducts(categoryId) {
    try {
        const query = categoryId ? `?categoryId=${categoryId}` : "";
        const rows = await httpGet(`/catalog/products${query}`);
        return rows.map(toProduct);
    }
    catch {
        return [];
    }
}
export async function listCategoryTree() {
    try {
        return await httpGet("/catalog/categories/tree");
    }
    catch {
        return [];
    }
}
export async function getProductDetail(id) {
    try {
        return toProduct(await httpGet(`/catalog/products/${id}`));
    }
    catch {
        return undefined;
    }
}
export async function createBackendOrder(items, amount) {
    return httpPost("/orders", {
        memberId: 1,
        receiver: "用户",
        receiverPhone: "18699999999",
        address: "湖北省武汉市武昌区八一路",
        items: items.map((it) => ({
            skuId: it.product.skuId || it.product.id,
            skuCode: it.product.skuCode || `SKU-${it.product.id}`,
            productName: it.product.name,
            price: it.product.price,
            quantity: it.qty,
        })),
    });
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
        trackingNo: `SF${Date.now()}`,
    });
}
export async function receiveBackendOrder(orderId) {
    return httpPost(`/orders/${orderId}/receive`);
}
export async function reviewBackendOrder(orderId, rating, content) {
    return httpPost(`/orders/${orderId}/review`, { rating, content });
}
export async function requestBackendRefund(orderId, reason) {
    return httpPost(`/orders/${orderId}/refund/request`, { reason });
}
export async function getBackendLogistics(orderId) {
    return httpGet(`/orders/${orderId}/logistics`);
}
export async function listBackendOrders() {
    return httpGet("/orders");
}
export async function listBackendMessages(memberId = 1) {
    return httpGet(`/messages?memberId=${memberId}`);
}
export async function hideBackendMessage(id) {
    await httpDelete(`/messages/${id}`);
}
export async function askShoppingGuide(message) {
    try {
        const reply = await httpPost("/ai/shopping-guide", { memberId: 1, message });
        return reply.reply || reply.answer || reply.content || reply.message || "AI 助手暂时没有返回内容。";
    }
    catch {
        return "AI 助手暂时不可用，请稍后重试。";
    }
}
export async function listAiHistory(limit = 30) {
    try {
        return await httpGet(`/ai/shopping-guide/history?memberId=1&limit=${limit}`);
    }
    catch {
        return [];
    }
}
