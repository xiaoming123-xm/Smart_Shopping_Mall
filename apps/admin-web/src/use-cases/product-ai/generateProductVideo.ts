import { productAiApi } from "@/api";
import type { GenerateVideoRequest, GenerateVideoResponse } from "@/api";

export const generateProductVideo = (req: GenerateVideoRequest): Promise<GenerateVideoResponse> => productAiApi.generateVideo(req);
