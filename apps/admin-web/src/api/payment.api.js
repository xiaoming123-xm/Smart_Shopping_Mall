import { httpGet } from "./http";
export const paymentApi = {
    list: () => httpGet("/payments"),
};
