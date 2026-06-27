import { httpGet, httpPost } from "./http";
export const orderApi = {
    list: () => httpGet("/orders"),
    get: (id) => httpGet(`/orders/${id}`),
    ship: (id) => httpPost(`/orders/${id}/ship`),
};
