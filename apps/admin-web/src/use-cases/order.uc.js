import { orderApi } from "@/api";
export const loadOrders = () => orderApi.list();
export const loadOrderReviews = () => orderApi.reviews();
export const loadOrder = (id) => orderApi.get(id);
export const shipOrder = (id, data) => orderApi.ship(id, data);
export const approveRefund = (id, note) => orderApi.handleRefund(id, { action: "APPROVE", note });
export const rejectRefund = (id, note) => orderApi.handleRefund(id, { action: "REJECT", note });
export const replyOrderReview = (id, reply) => orderApi.replyReview(id, { reply });
