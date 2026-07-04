import { orderApi } from "@/api";
import type { OrderDTO, ShipOrderRequest } from "@/api";

export const loadOrders = (): Promise<OrderDTO[]> => orderApi.list();
export const loadOrderReviews = (): Promise<OrderDTO[]> => orderApi.reviews();
export const loadOrder = (id: number): Promise<OrderDTO> => orderApi.get(id);
export const shipOrder = (id: number, data: ShipOrderRequest): Promise<OrderDTO> => orderApi.ship(id, data);
export const replyOrderReview = (id: number, reply: string): Promise<OrderDTO> => orderApi.replyReview(id, { reply });
