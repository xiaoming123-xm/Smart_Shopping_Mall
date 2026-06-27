import { paymentApi } from "@/api";
export const loadPayments = () => paymentApi.list();
