<template>
  <div class="page">
    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="openCreate">新增品牌</el-button>
      <el-button :icon="Refresh" @click="load">刷新</el-button>
    </div>
    <el-card v-loading="loading">
      <el-table :data="list" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="Logo" width="90">
          <template #default="{ row }">
            <el-image v-if="row.logo" :src="row.logo" style="width:40px;height:40px" fit="cover" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.enabled === false ? 'info' : 'success'">{{ row.enabled === false ? '停用' : '启用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑品牌' : '新增品牌'" width="460px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="Logo"><el-input v-model="form.logo" placeholder="图片URL" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" /></el-form-item>
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
import { loadBrands, saveBrand, deleteBrand } from "@/use-cases/brand.uc";
import type { BrandDTO } from "@/api";
import { ApiError } from "@/api";

const loading = ref(false);
const saving = ref(false);
const list = ref<BrandDTO[]>([]);
const dialogVisible = ref(false);
const form = reactive<BrandDTO>({ name: "", logo: "", description: "", sort: 0, enabled: true });

async function load() {
  loading.value = true;
  try { list.value = await loadBrands(); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "加载失败"); }
  finally { loading.value = false; }
}

function reset() { Object.assign(form, { id: undefined, name: "", logo: "", description: "", sort: 0, enabled: true }); }
function openCreate() { reset(); dialogVisible.value = true; }
function openEdit(row: BrandDTO) { Object.assign(form, { ...row, enabled: row.enabled !== false }); dialogVisible.value = true; }

async function onSave() {
  if (!form.name.trim()) { ElMessage.warning("请输入名称"); return; }
  saving.value = true;
  try { await saveBrand({ ...form }); ElMessage.success("保存成功"); dialogVisible.value = false; load(); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "保存失败"); }
  finally { saving.value = false; }
}

async function onDelete(row: BrandDTO) {
  await ElMessageBox.confirm(`确认删除品牌「${row.name}」？`, "提示", { type: "warning" }).catch(() => null);
  try { await deleteBrand(row.id!); ElMessage.success("已删除"); load(); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "删除失败"); }
}

onMounted(load);
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 12px; }
.toolbar { display: flex; gap: 8px; }
</style>
