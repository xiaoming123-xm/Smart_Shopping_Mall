import { httpGet, httpPost } from "./http";
export const orderApi = {
    list: () => httpGet("/orders"),
    reviews: () => httpGet("/orders/reviews"),
    get: (id) => httpGet(`/orders/${id}`),
    ship: (id, data) => httpPost(`/orders/${id}/ship`, data),
    replyReview: (id, data) => httpPost(`/orders/${id}/review/reply`, data),
};
