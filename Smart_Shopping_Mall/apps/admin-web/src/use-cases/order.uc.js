import { orderApi } from "@/api";
export const loadOrders = () => orderApi.list();
export const loadOrder = (id) => orderApi.get(id);
export const shipOrder = (id) => orderApi.ship(id);
