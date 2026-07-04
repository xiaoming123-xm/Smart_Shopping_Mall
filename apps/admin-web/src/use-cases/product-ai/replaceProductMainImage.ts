import { productAiApi } from "@/api";
import type { SpuDTO } from "@/api";

export const replaceProductMainImage = (productId: number, imageUrl: string): Promise<SpuDTO> =>
  productAiApi.replaceMainImage({ productId, imageUrl });
