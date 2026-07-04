import { productAiApi } from "@/api";
export const loadAiTaskStatus = (taskId) => productAiApi.taskStatus(taskId);
