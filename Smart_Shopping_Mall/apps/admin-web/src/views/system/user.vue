<template>
  <div class="page">
    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="openCreate">新增用户</el-button>
      <el-button :icon="Refresh" @click="load">刷新</el-button>
    </div>
    <el-card v-loading="loading">
      <el-table :data="list" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="role" label="角色" width="140" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.enabled === false ? 'info' : 'success'">{{ row.enabled === false ? '停用' : '启用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑用户' : '新增用户'" width="460px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item label="昵称"><el-input v-model="form.nickname" /></el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role" placeholder="请选择角色" style="width:100%">
            <el-option label="管理员 (ADMIN)" value="ADMIN" />
            <el-option label="运营 (OPERATOR)" value="OPERATOR" />
          </el-select>
        </el-form-item>
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
import { loadSysUsers, saveSysUser, deleteSysUser } from "@/use-cases/sysUser.uc";
import type { SysUserDTO } from "@/api";
import { ApiError } from "@/api";

const loading = ref(false);
const saving = ref(false);
const list = ref<SysUserDTO[]>([]);
const dialogVisible = ref(false);
const form = reactive<SysUserDTO>({ username: "", nickname: "", role: "OPERATOR", enabled: true });

async function load() {
  loading.value = true;
  try { list.value = await loadSysUsers(); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "加载失败"); }
  finally { loading.value = false; }
}

function reset() {
  Object.assign(form, { id: undefined, username: "", nickname: "", role: "OPERATOR", enabled: true });
}
function openCreate() { reset(); dialogVisible.value = true; }
function openEdit(row: SysUserDTO) {
  Object.assign(form, { ...row, enabled: row.enabled !== false });
  dialogVisible.value = true;
}

async function onSave() {
  if (!form.username.trim()) { ElMessage.warning("请输入用户名"); return; }
  saving.value = true;
  try {
    await saveSysUser({ ...form });
    ElMessage.success("保存成功");
    dialogVisible.value = false;
    load();
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "保存失败");
  } finally {
    saving.value = false;
  }
}

async function onDelete(row: SysUserDTO) {
  const ok = await ElMessageBox.confirm(`确认删除用户「${row.username}」？`, "提示", { type: "warning" }).catch(() => null);
  if (!ok) return;
  try { await deleteSysUser(row.id!); ElMessage.success("已删除"); load(); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "删除失败"); }
}

onMounted(load);
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 12px; }
.toolbar { display: flex; gap: 8px; }
</style>
