import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import type { CartItem } from "./cart";
import type { LogisticsTrace } from "@/api/mall";

export type OrderStatus = "CREATED" | "PAID" | "SHIPPED" | "RECEIVED" | "COMPLETED" | "CANCELLED" | "REFUND_REQUESTED" | "REFUNDED" | "REFUND_REJECTED";

export interface OrderRecord {
  id: string;
  orderNo: string;
  items: CartItem[];
  amount: number;
  status: OrderStatus;
  statusText: string;
  receiver: string;
  receiverPhone: string;
  address: string;
  logisticsCompany?: string;
  trackingNo?: string;
  logisticsTraces: LogisticsTrace[];
  rating?: number;
  reviewContent?: string;
  reviewReply?: string;
  refundReason?: string;
  refundRequestedAt?: string;
  refundHandleNote?: string;
  refundHandledAt?: string;
  createdAt: string;
}

const STORAGE_KEY = "smart_mall_storefront_orders";
const buyerName = "用户";

const statusLabel: Record<OrderStatus, string> = {
  CREATED: "待付款",
  PAID: "待发货",
  SHIPPED: "待收货",
  RECEIVED: "待评价",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
  REFUND_REQUESTED: "退货申请中",
  REFUNDED: "已退款",
  REFUND_REJECTED: "退货已拒绝",
};

function readOrders(): OrderRecord[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as OrderRecord[] : [];
  } catch {
    return [];
  }
}

export const useOrderStore = defineStore("order", () => {
  const orders = ref<OrderRecord[]>(readOrders());
  const latest = computed(() => orders.value[0]);
  const pendingReviewCount = computed(() => orders.value.filter((o) => o.status === "RECEIVED").length);

  watch(orders, (rows) => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    }
  }, { deep: true });

  function createOrder(items: CartItem[], amount: number, backendId?: string, backendOrderNo?: string): OrderRecord {
    const id = backendId || "SO" + Date.now().toString().slice(-8);
    const rec: OrderRecord = {
      id,
      orderNo: backendOrderNo || `2026${Date.now().toString().slice(-14)}`,
      items: JSON.parse(JSON.stringify(items)) as CartItem[],
      amount,
      status: "CREATED",
      statusText: statusLabel.CREATED,
      receiver: buyerName,
      receiverPhone: "18699999999",
      address: "湖北省武汉市武昌区八一路",
      logisticsTraces: [],
      createdAt: new Date().toLocaleString("zh-CN"),
    };
    upsertOrder(rec);
    return rec;
  }

  function replaceOrders(rows: OrderRecord[]) {
    orders.value = rows.slice().sort((a, b) => String(b.id).localeCompare(String(a.id), "zh-CN", { numeric: true }));
  }

  function upsertOrder(row: OrderRecord) {
    const index = orders.value.findIndex((item) => item.id === row.id);
    if (index >= 0) {
      orders.value.splice(index, 1, row);
    } else {
      orders.value.unshift(row);
    }
  }

  function setStatus(orderId: string, status: OrderStatus) {
    const o = getOrder(orderId);
    if (o) {
      o.status = status;
      o.statusText = statusLabel[status];
    }
  }

  function pay(orderId: string) {
    setStatus(orderId, "PAID");
  }

  function ship(orderId: string, traces?: LogisticsTrace[]) {
    const o = getOrder(orderId);
    if (!o) return;
    o.status = "SHIPPED";
    o.statusText = statusLabel.SHIPPED;
    o.logisticsCompany = "顺丰速运";
    o.trackingNo = "SF123456465";
    o.logisticsTraces = traces?.length ? traces : [];
  }

  function receive(orderId: string) {
    const o = getOrder(orderId);
    if (!o) return;
    o.status = "RECEIVED";
    o.statusText = statusLabel.RECEIVED;
  }

  function review(orderId: string, rating: number, content: string) {
    const o = getOrder(orderId);
    if (!o) return;
    o.status = "COMPLETED";
    o.statusText = statusLabel.COMPLETED;
    o.rating = rating;
    o.reviewContent = content;
  }

  function requestRefund(orderId: string, reason: string) {
    const o = getOrder(orderId);
    if (!o) return;
    o.status = "REFUND_REQUESTED";
    o.statusText = statusLabel.REFUND_REQUESTED;
    o.refundReason = reason;
    o.refundRequestedAt = new Date().toLocaleString("zh-CN");
  }

  function getOrder(orderId: string) {
    return orders.value.find((x) => x.id === orderId);
  }

  return { orders, latest, pendingReviewCount, createOrder, replaceOrders, upsertOrder, pay, ship, receive, review, requestRefund, getOrder };
});
