import { productAiApi } from "@/api";
export const replaceProductMainImage = (productId, imageUrl) => productAiApi.replaceMainImage({ productId, imageUrl });
