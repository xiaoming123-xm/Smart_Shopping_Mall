// 与后端 DTO 严格对齐的前端类型（后续可由 OpenAPI codegen 替代、以后端为主源）

// ---- auth ----
export interface CaptchaDTO { captchaKey: string; imageBase64: string; }
export interface LoginCommand { username: string; password: string; captchaKey: string; captchaCode: string; }
export interface LoginDTO { token: string; username: string; nickname: string; }

// ---- catalog: category ----
export interface CategoryDTO {
  id: number; parentId: number | null; name: string;
  sort: number | null; enabled: boolean | null;
  createdAt?: string; updatedAt?: string;
}
export interface CategoryTreeDTO extends CategoryDTO { children: CategoryTreeDTO[]; }
export interface CreateCategoryRequest { parentId?: number | null; name: string; sort?: number | null; enabled?: boolean | null; }
export interface UpdateCategoryRequest { name: string; sort?: number | null; enabled?: boolean | null; }

// ---- catalog: brand ----
export interface BrandDTO {
  id?: number; name: string; logo?: string; description?: string;
  enabled?: boolean | null; sort?: number | null; createdAt?: string;
}

// ---- catalog: attribute ----
export interface AttributeValue { id?: number; attrId?: number; value: string; sort?: number | null; }
export interface AttributeDTO {
  id?: number; name: string; type?: string; searchable?: boolean | null;
  required?: boolean | null; sort?: number | null; createdAt?: string; values?: AttributeValue[];
}

// ---- catalog: spu/sku ----
export interface SkuDTO {
  id?: number; spuId?: number; skuCode: string; specs?: string;
  price: number; costPrice?: number; stock?: number; status?: number;
}
export interface SpuDTO {
  id?: number; name: string; categoryId?: number | null; brandId?: number | null;
  mainImage?: string; description?: string; price: number; costPrice?: number;
  stock?: number; status?: number; sort?: number | null; createdAt?: string; skus?: SkuDTO[];
}

// ---- inventory ----
export interface StockDTO {
  id: number; skuId: number; skuCode: string; quantity: number;
  warnThreshold: number; costPrice?: number; updatedAt?: string;
}
export interface StockRecordDTO {
  id: number; skuId: number; type: string; change: number; after: number;
  remark?: string; createdAt?: string;
}

// ---- order ----
export interface OrderItemDTO { id: number; skuId: number; skuCode: string; productName: string; price: number; quantity: number; }
export interface LogisticsTraceDTO { time: string; content: string; }
export interface OrderDTO {
  id: number; orderNo: string; memberId: number; status: string; statusText?: string; totalAmount: number;
  receiver: string; receiverPhone?: string; address: string;
  sender?: string; senderPhone?: string; senderAddress?: string; logisticsCompany?: string; trackingNo?: string;
  shippedAt?: string; receivedAt?: string; rating?: number; reviewContent?: string; reviewedAt?: string;
  reviewReply?: string; reviewRepliedAt?: string; createdAt?: string; items?: OrderItemDTO[]; logisticsTraces?: LogisticsTraceDTO[];
}
export interface ShipOrderRequest {
  sender: string; senderPhone: string; senderAddress: string; logisticsCompany: string; trackingNo: string;
}
export interface ReplyReviewRequest { reply: string; }

// ---- payment ----
export interface PaymentDTO {
  id: number; paymentNo: string; orderId: number; channel: string; status: string;
  amount: number; createdAt?: string; paidAt?: string;
}

// ---- system ----
export interface SysUserDTO {
  id?: number; username: string; nickname?: string; role?: string;
  enabled?: boolean | null; createdAt?: string;
}
