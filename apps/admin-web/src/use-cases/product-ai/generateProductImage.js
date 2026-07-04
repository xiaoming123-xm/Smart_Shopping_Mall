import { productAiApi } from "@/api";
export const generateProductImage = (req) => productAiApi.generateImage(req);
