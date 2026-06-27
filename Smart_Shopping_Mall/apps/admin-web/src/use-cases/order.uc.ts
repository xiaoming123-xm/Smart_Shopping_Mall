import { orderApi } from "@/api";
import type { OrderDTO } from "@/api";

export const loadOrders = (): Promise<OrderDTO[]> => orderApi.list();
export const loadOrder = (id: number): Promise<OrderDTO> => orderApi.get(id);
export const shipOrder = (id: number): Promise<OrderDTO> => orderApi.ship(id);
