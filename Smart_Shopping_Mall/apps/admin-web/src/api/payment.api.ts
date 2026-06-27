import { httpGet } from "./http";
import type { PaymentDTO } from "./types";

export const paymentApi = {
  list: () => httpGet<PaymentDTO[]>("/payments"),
};
