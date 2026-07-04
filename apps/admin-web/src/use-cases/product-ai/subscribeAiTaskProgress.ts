import type { AiTaskDTO } from "@/api";
import { loadAiTaskStatus } from "./loadAiTaskStatus";

export function subscribeAiTaskProgress(taskId: string, onUpdate: (task: AiTaskDTO) => void): () => void {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const socket = new WebSocket(`${protocol}://${window.location.host}/ws/ai/task-progress/${taskId}`);
  let stopped = false;
  let pollTimer: number | undefined;

  socket.onmessage = (event) => {
    onUpdate(JSON.parse(event.data) as AiTaskDTO);
  };
  socket.onerror = () => {
    if (pollTimer) return;
    pollTimer = window.setInterval(async () => {
      if (stopped) return;
      const task = await loadAiTaskStatus(taskId);
      onUpdate(task);
      if (task.status === "SUCCESS" || task.status === "FAILED") {
        window.clearInterval(pollTimer);
      }
    }, 900);
  };

  return () => {
    stopped = true;
    if (pollTimer) window.clearInterval(pollTimer);
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      socket.close();
    }
  };
}
