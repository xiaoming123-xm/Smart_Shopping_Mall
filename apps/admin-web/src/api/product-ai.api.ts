import { httpGet, httpPost } from "./http";
import type {
  AiTaskDTO,
  GenerateImageRequest,
  GenerateImageResponse,
  GenerateVideoRequest,
  GenerateVideoResponse,
  ReplaceMainImageRequest,
  SpuDTO,
} from "./types";

export const productAiApi = {
  generateImage: (req: GenerateImageRequest) => httpPost<GenerateImageResponse>("/ai/generate-image", req),
  replaceMainImage: (req: ReplaceMainImageRequest) => httpPost<SpuDTO>("/ai/replace-main-image", req),
  generateVideo: (req: GenerateVideoRequest) => httpPost<GenerateVideoResponse>("/ai/generate-video", req),
  taskStatus: (taskId: string) => httpGet<AiTaskDTO>(`/ai/task-status/${taskId}`),
};
