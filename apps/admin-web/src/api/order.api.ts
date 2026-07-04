import { httpGet, httpPost } from "./http";
import type { OrderDTO, ReplyReviewRequest, ShipOrderRequest } from "./types";

export const orderApi = {
  list: () => httpGet<OrderDTO[]>("/orders"),
  reviews: () => httpGet<OrderDTO[]>("/orders/reviews"),
  get: (id: number) => httpGet<OrderDTO>(`/orders/${id}`),
  ship: (id: number, data: ShipOrderRequest) => httpPost<OrderDTO>(`/orders/${id}/ship`, data),
  replyReview: (id: number, data: ReplyReviewRequest) => httpPost<OrderDTO>(`/orders/${id}/review/reply`, data),
};
