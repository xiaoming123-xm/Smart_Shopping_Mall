import { productAiApi } from "@/api";
import type { AiTaskDTO } from "@/api";

export const loadAiTaskStatus = (taskId: string): Promise<AiTaskDTO> => productAiApi.taskStatus(taskId);
