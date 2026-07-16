import { httpDelete, httpGet, httpPost } from "./http";
import type { Product, ProductVariant } from "./mock";
import type { CartItem } from "@/stores/cart";

interface SkuDTO {
  id?: number;
  spuId?: number;
  skuCode?: string;
  specs?: string;
  price?: number;
  costPrice?: number;
  stock?: number;
  status?: number;
}

interface SpuDTO {
  id: number;
  name: string;
  categoryId?: number;
  brandId?: number;
  mainImage?: string;
  description?: string;
  attributesJson?: string;
  price?: number;
  costPrice?: number;
  stock?: number;
  status?: number;
  sort?: number;
  skus?: SkuDTO[];
}

export interface CategoryTreeDTO {
  id: number;
  parentId?: number | null;
  name: string;
  sort?: number;
  enabled?: boolean;
  children?: CategoryTreeDTO[];
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
  refundReason?: string;
  refundRequestedAt?: string;
  refundHandleNote?: string;
  refundHandledAt?: string;
  createdAt: string;
  items?: Array<{ skuId?: number; skuCode?: string; productName: string; quantity: number; price: number }>;
  logisticsTraces?: LogisticsTrace[];
}

export type BackendOrderDTO = OrderDTO;

interface PaymentDTO {
  id: number;
  orderId: number;
  status: string;
  amount: number;
}

interface ScenarioReply {
  reply?: string;
  answer?: string;
  content?: string;
  message?: string;
}

export interface LogisticsTrace {
  time: string;
  content: string;
}

export interface AiHistoryItem {
  id: number;
  memberId: number;
  role: "user" | "assistant";
  message: string;
  createdAt: string;
}

export interface BackendUserMessageDTO {
  id: number;
  memberId: number;
  orderId?: number;
  businessKey: string;
  type: "REVIEW_REPLY" | "ORDER_STATUS" | "LOGISTICS" | string;
  title: string;
  content: string;
  actionText?: string;
  actionUrl?: string;
  readFlag?: boolean;
  visible?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const categoryNames: Record<number, string> = {
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

function buildPlaceholderProduct(spu: SpuDTO): Product {
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

function buildVariants(spu: SpuDTO, placeholder: Product): ProductVariant[] {
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

function buildAttributeTags(raw?: string) {
  if (!raw) return [] as string[];
  try {
    const parsed = JSON.parse(raw) as Record<string, string | string[]>;
    return Object.entries(parsed).flatMap(([key, value]) => Array.isArray(value) ? value.map((v) => `${key}:${v}`) : [`${key}:${value}`]);
  } catch {
    return [] as string[];
  }
}

function toProduct(spu: SpuDTO): Product {
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

export async function listProducts(categoryId?: number): Promise<Product[]> {
  try {
    const query = categoryId ? `?categoryId=${categoryId}` : "";
    const rows = await httpGet<SpuDTO[]>(`/catalog/products${query}`);
    return rows.map(toProduct);
  } catch {
    return [];
  }
}

export async function listCategoryTree(): Promise<CategoryTreeDTO[]> {
  try {
    return await httpGet<CategoryTreeDTO[]>("/catalog/categories/tree");
  } catch {
    return [];
  }
}

export async function getProductDetail(id: number): Promise<Product | undefined> {
  try {
    return toProduct(await httpGet<SpuDTO>(`/catalog/products/${id}`));
  } catch {
    return undefined;
  }
}

export async function createBackendOrder(items: CartItem[], amount: number): Promise<OrderDTO> {
  return httpPost<OrderDTO>("/orders", {
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
    trackingNo: `SF${Date.now()}`,
  });
}

export async function receiveBackendOrder(orderId: number): Promise<OrderDTO> {
  return httpPost<OrderDTO>(`/orders/${orderId}/receive`);
}

export async function reviewBackendOrder(orderId: number, rating: number, content: string): Promise<OrderDTO> {
  return httpPost<OrderDTO>(`/orders/${orderId}/review`, { rating, content });
}

export async function requestBackendRefund(orderId: number, reason?: string): Promise<OrderDTO> {
  return httpPost<OrderDTO>(`/orders/${orderId}/refund/request`, { reason });
}

export async function getBackendLogistics(orderId: number): Promise<LogisticsTrace[]> {
  return httpGet<LogisticsTrace[]>(`/orders/${orderId}/logistics`);
}

export async function listBackendOrders(): Promise<BackendOrderDTO[]> {
  return httpGet<BackendOrderDTO[]>("/orders");
}

export async function listBackendMessages(memberId = 1): Promise<BackendUserMessageDTO[]> {
  return httpGet<BackendUserMessageDTO[]>(`/messages?memberId=${memberId}`);
}

export async function hideBackendMessage(id: number): Promise<void> {
  await httpDelete<void>(`/messages/${id}`);
}

export async function askShoppingGuide(message: string): Promise<string> {
  try {
    const reply = await httpPost<ScenarioReply>("/ai/shopping-guide", { memberId: 1, message });
    return reply.reply || reply.answer || reply.content || reply.message || "AI 助手暂时没有返回内容。";
  } catch {
    return "AI 助手暂时不可用，请稍后重试。";
  }
}

export async function listAiHistory(limit = 30): Promise<AiHistoryItem[]> {
  try {
    return await httpGet<AiHistoryItem[]>(`/ai/shopping-guide/history?memberId=1&limit=${limit}`);
  } catch {
    return [];
  }
}
