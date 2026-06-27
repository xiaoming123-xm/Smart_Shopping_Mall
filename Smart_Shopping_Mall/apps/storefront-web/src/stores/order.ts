import { defineStore } from "pinia";
import { ref } from "vue";
import type { CartItem } from "./cart";

// 资金状态：呼应文档“订单与支付双轨记账”——业务单(order)与资金单(payment)分离。
export type PayStatus = "待支付" | "已支付" | "退款中" | "已退款";

export interface OrderRecord {
  id: string;
  items: CartItem[];
  amount: number;
  payStatus: PayStatus;
  createdAt: string;
}

export const useOrderStore = defineStore("order", () => {
  const orders = ref<OrderRecord[]>([]);

  function createOrder(items: CartItem[], amount: number): OrderRecord {
    const id = "SO" + Date.now().toString().slice(-8);
    const rec: OrderRecord = {
      id, items: JSON.parse(JSON.stringify(items)), amount,
      payStatus: "待支付", createdAt: new Date().toLocaleString("zh-CN"),
    };
    orders.value.unshift(rec);
    return rec;
  }
  function pay(orderId: string) {
    const o = orders.value.find((x) => x.id === orderId);
    if (o) o.payStatus = "已支付";
  }
  function getOrder(orderId: string) { return orders.value.find((x) => x.id === orderId); }

  return { orders, createOrder, pay, getOrder };
});