import { paymentApi } from "@/api";
import type { PaymentDTO } from "@/api";

export const loadPayments = (): Promise<PaymentDTO[]> => paymentApi.list();
