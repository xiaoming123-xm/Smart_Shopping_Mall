import { httpGet, httpPost } from "./http";
import type { OrderDTO } from "./types";

export const orderApi = {
  list: () => httpGet<OrderDTO[]>("/orders"),
  get: (id: number) => httpGet<OrderDTO>(`/orders/${id}`),
  ship: (id: number) => httpPost<OrderDTO>(`/orders/${id}/ship`),
};
