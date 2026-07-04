import { httpGet, httpPost } from "./http";
import { products as fallbackProducts, type Product } from "./mock";
import type { CartItem } from "@/stores/cart";

interface SpuDTO {
  id: number;
  name: string;
  categoryId?: number;
  brandId?: number;
  mainImage?: string;
  description?: string;
  price?: number;
  costPrice?: number;
  stock?: number;
  status?: number;
  sort?: number;
}

interface OrderDTO {
  id: number;
  orderNo: string;
  status: string;
  statusText?: string;
  totalAmount: number;
  receiver?: string;
  receiverPhone?: string;
  address?: string;
  logisticsCompany?: string;
  trackingNo?: string;
  rating?: number;
  reviewContent?: string;
  reviewReply?: string;
  createdAt: string;
  items?: Array<{ productName: string; quantity: number; price: number }>;
  logisticsTraces?: LogisticsTrace[];
}

interface PaymentDTO {
  id: number;
  orderId: number;
  status: string;
  amount: number;
}

interface ScenarioReply {
  answer?: string;
  content?: string;
  message?: string;
}

export interface LogisticsTrace {
  time: string;
  content: string;
}

const categoryNames: Record<number, string> = {
  1: "数码",
  2: "家居",
  3: "服饰",
  4: "食品",
};

function toProduct(spu: SpuDTO): Product {
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

export async function listProducts(): Promise<Product[]> {
  try {
    const rows = await httpGet<SpuDTO[]>("/catalog/products");
    return rows.length ? rows.map(toProduct) : fallbackProducts;
  } catch {
    return fallbackProducts;
  }
}

export async function getProductDetail(id: number): Promise<Product | undefined> {
  try {
    return toProduct(await httpGet<SpuDTO>(`/catalog/products/${id}`));
  } catch {
    return fallbackProducts.find((p) => p.id === id);
  }
}

export async function createBackendOrder(items: CartItem[], amount: number): Promise<OrderDTO> {
  return httpPost<OrderDTO>("/orders", {
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

export async function createAndPayBackendPayment(orderId: number, amount: number): Promise<PaymentDTO> {
  const payment = await httpPost<PaymentDTO>("/payments", { orderId, channel: "MOCK", amount });
  return httpPost<PaymentDTO>(`/payments/${payment.id}/pay`);
}

export async function payBackendOrder(orderId: number): Promise<void> {
  await httpPost(`/orders/${orderId}/pay`);
}

export async function shipBackendOrder(orderId: number): Promise<OrderDTO> {
  return httpPost<OrderDTO>(`/orders/${orderId}/ship`, {
    sender: "悟空",
    senderPhone: "18600000000",
    senderAddress: "江苏省连云港市花果山水帘洞",
    logisticsCompany: "顺丰速运",
    trackingNo: "SF123456465",
  });
}

export async function receiveBackendOrder(orderId: number): Promise<OrderDTO> {
  return httpPost<OrderDTO>(`/orders/${orderId}/receive`);
}

export async function reviewBackendOrder(orderId: number, rating: number, content: string): Promise<OrderDTO> {
  return httpPost<OrderDTO>(`/orders/${orderId}/review`, { rating, content });
}

export async function getBackendLogistics(orderId: number): Promise<LogisticsTrace[]> {
  return httpGet<LogisticsTrace[]>(`/orders/${orderId}/logistics`);
}

export async function askShoppingGuide(message: string): Promise<string> {
  try {
    const reply = await httpPost<ScenarioReply>("/ai/shopping-guide", { message });
    return reply.answer || reply.content || reply.message || "AI 已收到你的问题，但暂时没有生成内容。";
  } catch {
    const hit = fallbackProducts.find((p) => message.includes(p.category) || message.includes(p.name.slice(0, 2)));
    return hit
      ? `推荐你看看「${hit.name}」，价格 ¥${hit.price}，库存 ${hit.stock}，适合当前演示下单。`
      : "可以告诉我品类、预算或用途，我会帮你从当前商品里挑选。";
  }
}
