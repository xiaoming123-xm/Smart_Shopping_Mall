<template>
  <div class="messages-page">
    <div class="page-head">
      <div>
        <h2>用户消息</h2>
        <p>这里展示订单状态、物流动态和商家给用户的回复。</p>
      </div>
      <div class="head-actions">
        <button class="refresh-btn ghost" @click="clearHidden">恢复本地隐藏</button>
        <button class="refresh-btn" @click="refresh">刷新消息</button>
      </div>
    </div>

    <div v-if="messages.length" class="message-list">
      <article v-for="message in messages" :key="message.id" class="message-card">
        <div class="message-icon" :class="message.type">{{ iconMap[message.type] }}</div>
        <div class="message-body">
          <div class="message-head">
            <h3>{{ message.title }}</h3>
            <span>{{ message.time }}</span>
          </div>
          <p>{{ message.content }}</p>
          <div class="message-meta" v-if="message.note">{{ message.note }}</div>
          <div class="message-actions">
            <router-link v-if="message.orderId" to="/order" class="message-link">{{ message.actionText || "查看订单" }}</router-link>
            <button class="delete-btn" @click="hideMessage(message)">删除</button>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="empty">暂时还没有新消息，订单有更新或商家回复后会显示在这里。</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { hideBackendMessage, listBackendMessages, type BackendUserMessageDTO } from "@/api/mall";
import { syncOrdersFromBackend } from "@/use-cases/orderSync";
import { useOrderStore } from "@/stores/order";

type MessageType = "reply" | "logistics" | "order";

interface UserMessage {
  id: string;
  backendId?: number;
  orderId?: string;
  type: MessageType;
  title: string;
  content: string;
  time: string;
  actionText?: string;
  note?: string;
}

const HIDDEN_KEY = "smart_mall_hidden_messages";
const orderStore = useOrderStore();
const hiddenIds = ref<string[]>(readHidden());
const backendMessages = ref<UserMessage[]>([]);

const iconMap: Record<MessageType, string> = {
  reply: "回",
  logistics: "运",
  order: "单",
};

const messages = computed<UserMessage[]>(() => {
  const rows = backendMessages.value.length ? backendMessages.value : fallbackMessagesFromOrders();
  return rows
    .filter((item) => !hiddenIds.value.includes(item.id))
    .sort((a, b) => String(b.time).localeCompare(String(a.time), "zh-CN", { numeric: true }));
});

function fallbackMessagesFromOrders() {
  const rows: UserMessage[] = [];
  for (const order of orderStore.orders) {
    rows.push({
      id: `status-${order.id}-${order.status}`,
      orderId: order.id,
      type: "order",
      title: `订单 ${order.orderNo} 状态更新`,
      content: `当前状态：${order.statusText}`,
      time: order.createdAt,
      note: "订单状态消息，临时从订单数据生成。",
    });

    const latestTrace = order.logisticsTraces[order.logisticsTraces.length - 1];
    if (latestTrace) {
      rows.push({
        id: `logistics-${order.id}-${latestTrace.time}`,
        orderId: order.id,
        type: "logistics",
        title: `订单 ${order.orderNo} 物流更新`,
        content: latestTrace.content,
        time: latestTrace.time,
        note: "物流消息，临时从订单物流轨迹生成。",
      });
    }

    if (order.reviewReply) {
      rows.push({
        id: `reply-${order.id}`,
        orderId: order.id,
        type: "reply",
        title: `订单 ${order.orderNo} 收到商家回复`,
        content: order.reviewReply,
        time: order.createdAt,
        note: "商家回复消息，后端消息表不可用时从订单回复字段兜底展示。",
      });
    }
  }
  return rows;
}

function toMessage(row: BackendUserMessageDTO): UserMessage {
  const typeMap: Record<string, MessageType> = {
    REVIEW_REPLY: "reply",
    LOGISTICS: "logistics",
    ORDER_STATUS: "order",
  };
  const type = typeMap[row.type] || "order";
  const noteMap: Record<MessageType, string> = {
    reply: "商家回复消息，来自数据库 user_message 表。",
    logistics: "物流动态消息，来自数据库 user_message 表。",
    order: "订单状态消息，来自数据库 user_message 表。",
  };
  return {
    id: `db-${row.id}`,
    backendId: row.id,
    orderId: row.orderId ? String(row.orderId) : undefined,
    type,
    title: row.title,
    content: row.content,
    time: row.updatedAt || row.createdAt || "",
    actionText: row.actionText,
    note: noteMap[type],
  };
}

function readHidden() {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(HIDDEN_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function persistHidden() {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(HIDDEN_KEY, JSON.stringify(hiddenIds.value));
}

async function hideMessage(message: UserMessage) {
  if (message.backendId) {
    await hideBackendMessage(message.backendId).catch(() => null);
    backendMessages.value = backendMessages.value.filter((item) => item.id !== message.id);
    return;
  }
  if (hiddenIds.value.includes(message.id)) return;
  hiddenIds.value = [...hiddenIds.value, message.id];
  persistHidden();
}

function clearHidden() {
  hiddenIds.value = [];
  persistHidden();
}

async function refresh() {
  await syncOrdersFromBackend().catch(() => null);
  try {
    backendMessages.value = (await listBackendMessages(1)).map(toMessage);
  } catch {
    backendMessages.value = [];
  }
}

onMounted(refresh);
</script>

<style scoped>
.messages-page { display: flex; flex-direction: column; gap: 18px; }
.page-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; background: #fff; border-radius: 12px; padding: 20px 24px; }
.page-head h2 { margin: 0 0 6px; }
.page-head p { margin: 0; color: #888; }
.head-actions { display: flex; gap: 10px; }
.refresh-btn { border: none; background: #ef5d67; color: #fff; border-radius: 20px; padding: 10px 18px; cursor: pointer; }
.refresh-btn.ghost { background: #f3f4f6; color: #444; }
.message-list { display: flex; flex-direction: column; gap: 12px; }
.message-card { display: grid; grid-template-columns: 54px 1fr; gap: 16px; background: #fff; border-radius: 12px; padding: 18px 20px; border: 1px solid #f0f0f0; }
.message-icon { width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; }
.message-icon.reply { background: #67c23a; }
.message-icon.logistics { background: #409eff; }
.message-icon.order { background: #e6a23c; }
.message-body { min-width: 0; }
.message-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 8px; }
.message-head h3 { margin: 0; font-size: 16px; }
.message-head span { color: #999; font-size: 13px; white-space: nowrap; }
.message-body p { margin: 0 0 8px; color: #555; line-height: 1.6; }
.message-meta { margin: 0 0 10px; color: #999; font-size: 12px; }
.message-actions { display: flex; align-items: center; gap: 16px; }
.message-link { color: #ef5d67; text-decoration: none; }
.delete-btn { border: none; background: transparent; color: #999; cursor: pointer; }
.empty { background: #fff; border-radius: 12px; padding: 72px 20px; text-align: center; color: #999; }
@media (max-width: 760px) {
  .page-head { flex-direction: column; align-items: flex-start; }
  .head-actions { width: 100%; flex-wrap: wrap; }
  .message-card { grid-template-columns: 1fr; }
  .message-head { flex-direction: column; align-items: flex-start; }
}
</style>
