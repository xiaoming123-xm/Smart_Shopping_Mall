<template>
  <div class="page">
    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="openCreate(null)">新增根分类</el-button>
      <el-button :icon="Refresh" @click="load">刷新</el-button>
    </div>
    <el-card v-loading="loading">
      <el-tree
        :data="tree"
        node-key="id"
        :props="{ label: 'name', children: 'children' }"
        default-expand-all
      >
        <template #default="{ data }">
          <div class="node">
            <span>{{ data.name }}</span>
            <span class="ops">
              <el-tag v-if="data.enabled === false" type="info" size="small">停用</el-tag>
              <el-button link type="primary" size="small" @click="openCreate(data.id)">添加子级</el-button>
              <el-button link type="primary" size="small" @click="openEdit(data)">编辑</el-button>
              <el-button link type="danger" size="small" @click="onDelete(data)">删除</el-button>
            </span>
          </div>
        </template>
      </el-tree>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="420px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" /></el-form-item>
        <el-form-item label="启用"><el-switch v-model="form.enabled" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="onSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Refresh } from "@element-plus/icons-vue";
import { loadCategoryTree, createCategory, updateCategory, deleteCategory } from "@/use-cases/category.uc";
import type { CategoryTreeDTO } from "@/api";
import { ApiError } from "@/api";

const loading = ref(false);
const saving = ref(false);
const tree = ref<CategoryTreeDTO[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref("");
const editingId = ref<number | null>(null);
const form = reactive<{ parentId: number | null; name: string; sort: number; enabled: boolean }>({ parentId: null, name: "", sort: 0, enabled: true });

async function load() {
  loading.value = true;
  try { tree.value = await loadCategoryTree(); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "加载失败"); }
  finally { loading.value = false; }
}

function openCreate(parentId: number | null) {
  editingId.value = null;
  dialogTitle.value = parentId ? "新增子分类" : "新增根分类";
  Object.assign(form, { parentId, name: "", sort: 0, enabled: true });
  dialogVisible.value = true;
}

function openEdit(data: CategoryTreeDTO) {
  editingId.value = data.id;
  dialogTitle.value = "编辑分类";
  Object.assign(form, { parentId: data.parentId, name: data.name, sort: data.sort ?? 0, enabled: data.enabled !== false });
  dialogVisible.value = true;
}

async function onSave() {
  if (!form.name.trim()) { ElMessage.warning("请输入名称"); return; }
  saving.value = true;
  try {
    if (editingId.value) {
      await updateCategory(editingId.value, { name: form.name, sort: form.sort, enabled: form.enabled });
    } else {
      await createCategory({ parentId: form.parentId, name: form.name, sort: form.sort, enabled: form.enabled });
    }
    ElMessage.success("保存成功");
    dialogVisible.value = false;
    load();
  } catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "保存失败"); }
  finally { saving.value = false; }
}

async function onDelete(data: CategoryTreeDTO) {
  await ElMessageBox.confirm(`确认删除分类「${data.name}」？`, "提示", { type: "warning" }).catch(() => null);
  try { await deleteCategory(data.id); ElMessage.success("已删除"); load(); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "删除失败"); }
}

onMounted(load);
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 12px; }
.toolbar { display: flex; gap: 8px; }
.node { flex: 1; display: flex; align-items: center; justify-content: space-between; padding-right: 8px; }
.ops { display: flex; align-items: center; gap: 6px; }
</style>
