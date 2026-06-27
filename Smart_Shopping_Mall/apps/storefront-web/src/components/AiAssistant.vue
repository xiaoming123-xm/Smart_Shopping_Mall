<template>
  <div class="ai-wrap">
    <button class="ai-fab" @click="open = !open" title="AI 智能导购">🤖</button>
    <div v-if="open" class="ai-panel">
      <div class="ai-head">
        <span>AI 智能导购</span>
        <button class="ai-close" @click="open = false">×</button>
      </div>
      <div class="ai-body" ref="bodyEl">
        <div v-for="(m, i) in messages" :key="i" :class="['msg', m.role]">{{ m.text }}</div>
      </div>
      <div class="ai-input">
        <input v-model="draft" placeholder="问问要买什么…" @keyup.enter="send" />
        <button @click="send">发送</button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick } from "vue";
import { products } from "@/api/mock";

const open = ref(false);
const draft = ref("");
const messages = ref<{ role: "user" | "ai"; text: string }[]>([
  { role: "ai", text: "你好，我是智能导购助手 🤖 试试输入“数码”“便宜”“耳机”等关键词。" },
]);
const bodyEl = ref<HTMLElement>();

// demo 版规则应答：模拟 Function Calling 工具 searchProducts。
// 真实接入：改为调用后端 mall-ai 场景用例（经 mall-application 编排）。
function reply(q: string): string {
  const kw = q.trim();
  const cat = products.filter((p) => p.category.includes(kw) || kw.includes(p.category));
  if (cat.length) return "为你找到" + cat.length + "件「" + cat[0].category + "」商品，推荐：" + cat.slice(0,3).map(p=>p.name).join("、") + "。";
  if (kw.includes("便宜") || kw.includes("低价")) {
    const cheap = [...products].sort((a,b)=>a.price-b.price).slice(0,3);
    return "性价比之选：" + cheap.map(p=>p.name+"（¥"+p.price+"）").join("、") + "。";
  }
  const hit = products.find((p) => p.name.includes(kw) || (kw && p.desc.includes(kw)));
  if (hit) return "「" + hit.name + "」¥" + hit.price + "，" + hit.desc;
  return "可以告诉我品类（数码/家居/服饰/食品）或预算，我来帮你挑～";
}

async function send() {
  const q = draft.value.trim();
  if (!q) return;
  messages.value.push({ role: "user", text: q });
  draft.value = "";
  messages.value.push({ role: "ai", text: reply(q) });
  await nextTick();
  if (bodyEl.value) bodyEl.value.scrollTop = bodyEl.value.scrollHeight;
}
</script>
<style scoped>
.ai-fab { position: fixed; right: 28px; bottom: 28px; width: 54px; height: 54px; border-radius: 50%; border: none; background: #1890ff; color: #fff; font-size: 26px; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,.25); z-index: 50; }
.ai-panel { position: fixed; right: 28px; bottom: 92px; width: 320px; height: 420px; background: #fff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,.25); display: flex; flex-direction: column; overflow: hidden; z-index: 50; }
.ai-head { background: #1890ff; color: #fff; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
.ai-close { background: none; border: none; color: #fff; font-size: 20px; cursor: pointer; }
.ai-body { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.msg { max-width: 85%; padding: 8px 12px; border-radius: 10px; font-size: 13px; line-height: 1.5; }
.msg.ai { background: #f0f2f5; align-self: flex-start; }
.msg.user { background: #1890ff; color: #fff; align-self: flex-end; }
.ai-input { display: flex; border-top: 1px solid #eee; padding: 8px; gap: 6px; }
.ai-input input { flex: 1; border: 1px solid #d9d9d9; border-radius: 6px; padding: 8px; font-size: 13px; outline: none; }
.ai-input button { background: #1890ff; color: #fff; border: none; border-radius: 6px; padding: 0 14px; cursor: pointer; }
</style>