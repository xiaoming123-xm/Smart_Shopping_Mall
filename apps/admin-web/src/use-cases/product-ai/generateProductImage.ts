import { productAiApi } from "@/api";
import type { GenerateImageRequest, GenerateImageResponse } from "@/api";

export const generateProductImage = (req: GenerateImageRequest): Promise<GenerateImageResponse> => productAiApi.generateImage(req);
