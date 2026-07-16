<template>
  <div class="page">
    <div class="toolbar">
      <div>
        <h2>提示词管理</h2>
        <p>按场景维护多条提示词，启用的同类提示词会一起作用到对应 AI 能力。</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="startCreate">新增提示词</el-button>
    </div>

    <div class="prompt-layout">
      <section class="prompt-list" v-loading="loading">
        <button
          v-for="item in prompts"
          :key="item.code"
          :class="['prompt-item', { active: activeCode === item.code }]"
          @click="selectPrompt(item)"
        >
          <span class="item-main">
            <strong>{{ item.title }}</strong>
            <small>{{ categoryLabel(item.category) }}</small>
          </span>
          <el-tag size="small" :type="item.enabled ? 'success' : 'info'">{{ item.enabled ? "启用" : "停用" }}</el-tag>
        </button>
        <el-empty v-if="!loading && prompts.length === 0" description="暂无提示词" />
      </section>

      <section class="editor" v-loading="saving">
        <div class="editor-head">
          <div>
            <h3>{{ isCreating ? "新增提示词" : "编辑提示词" }}</h3>
            <p>{{ activeHelp }}</p>
          </div>
          <el-switch v-model="form.enabled" active-text="启用" inactive-text="停用" />
        </div>

        <el-form label-position="top">
          <el-form-item label="分类">
            <el-select v-model="form.category" placeholder="选择提示词分类">
              <el-option v-for="option in categoryOptions" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="名称">
            <el-input v-model="form.title" maxlength="100" show-word-limit placeholder="请输入提示词名称" />
          </el-form-item>
          <el-form-item label="提示词内容">
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="16"
              maxlength="12000"
              show-word-limit
              placeholder="例如：你是商城智能导购，只能基于现有商品回答，不能编造商品、价格、库存。"
            />
          </el-form-item>
        </el-form>

        <div class="actions">
          <el-button :icon="Refresh" @click="load">刷新</el-button>
          <el-button v-if="!isCreating && !isCorePrompt" type="danger" plain :icon="Delete" @click="removeCurrent">删除</el-button>
          <el-button type="primary" :icon="Check" :loading="saving" @click="save">保存</el-button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Check, Delete, Plus, Refresh } from "@element-plus/icons-vue";
import { ApiError } from "@/api";
import type { AiPromptDTO } from "@/api";
import { createPrompt, deletePrompt, loadPrompts, updatePrompt } from "@/use-cases/payment/prompt.uc";

const categoryOptions = [
  { value: "shopping_guide", label: "AI智能购物", help: "用于商城前台 AI智能购物，必须基于现有商品回答。" },
  { value: "product_qa", label: "商品问答", help: "用于商品资料、政策、售后等问答。" },
  { value: "image_generation", label: "图片生成", help: "用于商品 AI 图片生成和改图。" },
  { value: "copywriting", label: "运营文案", help: "用于卖点、标题、营销文案生成。" },
];

const loading = ref(false);
const saving = ref(false);
const isCreating = ref(false);
const activeCode = ref("");
const prompts = ref<AiPromptDTO[]>([]);
const form = reactive({
  category: "shopping_guide",
  title: "",
  content: "",
  enabled: true,
});

const activeHelp = computed(() => categoryOptions.find((item) => item.value === form.category)?.help || "");
const isCorePrompt = computed(() => activeCode.value.endsWith("-core"));

function categoryLabel(category: string) {
  return categoryOptions.find((item) => item.value === category)?.label || category;
}

function fillForm(prompt: AiPromptDTO) {
  activeCode.value = prompt.code;
  form.category = prompt.category || "shopping_guide";
  form.title = prompt.title || "";
  form.content = prompt.content || "";
  form.enabled = prompt.enabled !== false;
}

function selectPrompt(prompt: AiPromptDTO) {
  isCreating.value = false;
  fillForm(prompt);
}

function startCreate() {
  isCreating.value = true;
  activeCode.value = "";
  form.category = "shopping_guide";
  form.title = "";
  form.content = "";
  form.enabled = true;
}

async function load() {
  loading.value = true;
  try {
    prompts.value = await loadPrompts();
    if (prompts.value.length && !activeCode.value) {
      selectPrompt(prompts.value[0]);
    } else if (activeCode.value) {
      const current = prompts.value.find((item) => item.code === activeCode.value);
      if (current) fillForm(current);
    }
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "加载失败");
  } finally {
    loading.value = false;
  }
}

async function save() {
  if (!form.category || !form.title.trim() || !form.content.trim()) {
    ElMessage.warning("分类、名称和提示词内容不能为空");
    return;
  }
  saving.value = true;
  try {
    const payload = {
      category: form.category,
      title: form.title.trim(),
      content: form.content.trim(),
      enabled: form.enabled,
    };
    const data = isCreating.value ? await createPrompt(payload) : await updatePrompt(activeCode.value, payload);
    isCreating.value = false;
    fillForm(data);
    await load();
    ElMessage.success("提示词已保存");
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "保存失败");
  } finally {
    saving.value = false;
  }
}

async function removeCurrent() {
  if (!activeCode.value || isCorePrompt.value) return;
  const confirmed = await ElMessageBox.confirm(`确认删除提示词「${form.title}」？`, "提示", { type: "warning" }).catch(() => false);
  if (!confirmed) return;
  saving.value = true;
  try {
    await deletePrompt(activeCode.value);
    activeCode.value = "";
    await load();
    ElMessage.success("提示词已删除");
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "删除失败");
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 14px; }
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 18px; }
.toolbar h2 { margin: 0; font-size: 18px; color: #111827; }
.toolbar p { margin: 6px 0 0; color: #6b7280; font-size: 13px; }
.prompt-layout { display: grid; grid-template-columns: 320px minmax(0, 1fr); gap: 14px; align-items: start; }
.prompt-list, .editor { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; }
.prompt-list { display: flex; flex-direction: column; gap: 8px; min-height: 520px; }
.prompt-item { width: 100%; min-height: 64px; border: 1px solid #e5e7eb; background: #fff; border-radius: 6px; padding: 10px; display: flex; align-items: center; justify-content: space-between; gap: 10px; cursor: pointer; text-align: left; }
.prompt-item.active, .prompt-item:hover { border-color: #409eff; background: #f5f9ff; }
.item-main { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.item-main strong { color: #111827; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-main small { color: #6b7280; }
.editor-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; border-bottom: 1px solid #eef2f7; padding-bottom: 12px; margin-bottom: 14px; }
.editor-head h3 { margin: 0; font-size: 16px; color: #111827; }
.editor-head p { margin: 6px 0 0; color: #6b7280; font-size: 13px; }
.actions { display: flex; justify-content: flex-end; gap: 8px; }
@media (max-width: 980px) {
  .prompt-layout { grid-template-columns: 1fr; }
  .prompt-list { min-height: auto; }
}
</style>
