<template>
  <div class="page">
    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="openCreate()">新增属性</el-button>
      <el-button :icon="Refresh" @click="load">刷新</el-button>
    </div>
    <el-card v-loading="loading">
      <el-table :data="list" border stripe row-key="id" default-expand-all>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" min-width="150">
          <template #default="{ row }">
            <span>{{ row.name }}</span>
            <el-tag v-if="isGroup(row)" class="name-tag" size="small" type="info">分组</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="父级" width="120">
          <template #default="{ row }">{{ parentName(row.parentId) || '-' }}</template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column label="可搜索" width="90">
          <template #default="{ row }"><el-tag size="small" :type="row.searchable ? 'success' : 'info'">{{ row.searchable ? '是' : '否' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="必填" width="90">
          <template #default="{ row }"><el-tag size="small" :type="row.required ? 'warning' : 'info'">{{ row.required ? '是' : '否' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="绑定分类" min-width="180">
          <template #default="{ row }">
            <span v-if="isGroup(row)">-</span>
            <template v-else>
              <el-tag v-for="id in row.categoryIds || []" :key="id" class="val-tag" size="small">{{ categoryName(id) }}</el-tag>
              <span v-if="!(row.categoryIds && row.categoryIds.length)">未绑定</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="取值" min-width="220">
          <template #default="{ row }">
            <span v-if="isGroup(row)">父级分组不配置取值</span>
            <template v-else>
              <el-tag v-for="v in row.values || []" :key="v.id" class="val-tag" size="small">{{ v.value }}</el-tag>
              <span v-if="!(row.values && row.values.length)">-</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="230">
          <template #default="{ row }">
            <el-button v-if="!isGroup(row)" link type="primary" size="small" @click="openValues(row)">值管理</el-button>
            <el-button v-if="isGroup(row)" link type="primary" size="small" @click="openCreate(row.id)">加子属性</el-button>
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑属性' : '新增属性'" width="560px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="父级">
          <el-select v-model="form.parentId" clearable placeholder="顶级属性/分组" style="width:100%" @change="onParentChange">
            <el-option v-for="p in parentOptions" :key="p.id" :label="p.name" :value="p.id!" :disabled="p.id === form.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" placeholder="选择类型" style="width:100%">
            <el-option label="分组" value="group" />
            <el-option label="单选" value="select" />
            <el-option label="多选" value="multi" />
            <el-option label="文本" value="text" />
          </el-select>
        </el-form-item>
        <el-form-item label="绑定分类" v-if="form.parentId">
          <el-tree-select
            v-model="form.categoryIds"
            :data="categoryTree"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            multiple
            check-strictly
            clearable
            placeholder="选择使用这个属性的商品分类"
            style="width:100%"
          />
        </el-form-item>
        <el-form-item label="可搜索"><el-switch v-model="form.searchable" :disabled="isEditingGroup" /></el-form-item>
        <el-form-item label="必填"><el-switch v-model="form.required" :disabled="isEditingGroup" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="onSave">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="valueVisible" :title="`属性值 - ${current?.name || ''}`" width="420px">
      <div class="value-add">
        <el-input v-model="newValue" placeholder="输入属性值" @keyup.enter="onAddValue" />
        <el-button type="primary" @click="onAddValue">添加</el-button>
      </div>
      <el-table :data="current?.values || []" border size="small" style="margin-top:12px">
        <el-table-column prop="value" label="值" />
        <el-table-column label="操作" width="80">
          <template #default="{ row }"><el-button link type="danger" size="small" @click="onRemoveValue(row)">删除</el-button></template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Refresh } from "@element-plus/icons-vue";
import { loadAttributes, saveAttribute, deleteAttribute, addAttributeValue, removeAttributeValue } from "@/use-cases/attribute.uc";
import { loadCategoryTree } from "@/use-cases/category.uc";
import type { AttributeDTO, AttributeValue, CategoryTreeDTO } from "@/api";
import { ApiError } from "@/api";

const loading = ref(false);
const saving = ref(false);
const list = ref<AttributeDTO[]>([]);
const flatList = computed(() => flattenAttributes(list.value));
const categoryTree = ref<CategoryTreeDTO[]>([]);
const flatCategories = computed(() => flattenCategories(categoryTree.value));
const dialogVisible = ref(false);
const form = reactive<AttributeDTO>({ name: "", type: "select", parentId: null, searchable: false, required: false, sort: 0, categoryIds: [] });

const valueVisible = ref(false);
const current = ref<AttributeDTO | null>(null);
const newValue = ref("");
const parentOptions = computed(() => flatList.value.filter((a) => isGroup(a)));
const isEditingGroup = computed(() => isGroup(form));

async function load() {
  loading.value = true;
  try {
    const [attrs, categories] = await Promise.all([loadAttributes(), loadCategoryTree()]);
    list.value = attrs;
    categoryTree.value = categories;
  }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "加载失败"); }
  finally { loading.value = false; }
}

function flattenAttributes(rows: AttributeDTO[]): AttributeDTO[] {
  return rows.flatMap((row) => [row, ...flattenAttributes(row.children || [])]);
}

function flattenCategories(rows: CategoryTreeDTO[]): CategoryTreeDTO[] {
  return rows.flatMap((row) => [row, ...flattenCategories(row.children || [])]);
}

function reset(parentId: number | null = null) { Object.assign(form, { id: undefined, name: "", type: parentId ? "select" : "group", parentId, searchable: !!parentId, required: !!parentId, sort: 0, categoryIds: [] }); }
function openCreate(parentId: number | null = null) { reset(parentId); dialogVisible.value = true; }
function openEdit(row: AttributeDTO) { Object.assign(form, { ...row, categoryIds: [...(row.categoryIds || [])] }); dialogVisible.value = true; }
function onParentChange() { if (form.parentId && isGroup(form)) form.type = "select"; }

function isGroup(row: AttributeDTO) {
  return (row.type || "").toLowerCase() === "group" || !!(row.children && row.children.length > 0);
}

function parentName(parentId?: number | null) {
  return parentId ? flatList.value.find((item) => item.id === parentId)?.name : "";
}

function categoryName(id: number) {
  return flatCategories.value.find((item) => item.id === id)?.name || `分类${id}`;
}

async function onSave() {
  if (!form.name.trim()) { ElMessage.warning("请输入名称"); return; }
  if (form.parentId && isGroup(form)) { ElMessage.warning("子属性请选择单选、多选或文本类型"); return; }
  if (!form.parentId) {
    form.type = "group";
    form.searchable = false;
    form.required = false;
    form.categoryIds = [];
  }
  saving.value = true;
  try { await saveAttribute({ ...form }); ElMessage.success("保存成功"); dialogVisible.value = false; load(); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "保存失败"); }
  finally { saving.value = false; }
}

async function onDelete(row: AttributeDTO) {
  const ok = await ElMessageBox.confirm(`确认删除属性「${row.name}」？`, "提示", { type: "warning" }).then(() => true).catch(() => false);
  if (!ok) return;
  try { await deleteAttribute(row.id!); ElMessage.success("已删除"); load(); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "删除失败"); }
}

function openValues(row: AttributeDTO) { current.value = row; newValue.value = ""; valueVisible.value = true; }

async function onAddValue() {
  if (!current.value?.id) return;
  if (!newValue.value.trim()) { ElMessage.warning("请输入值"); return; }
  try {
    await addAttributeValue(current.value.id, newValue.value.trim());
    newValue.value = "";
    await load();
    current.value = flatList.value.find((a) => a.id === current.value?.id) || current.value;
  } catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "添加失败"); }
}

async function onRemoveValue(row: AttributeValue) {
  try {
    await removeAttributeValue(row.id!);
    await load();
    current.value = flatList.value.find((a) => a.id === current.value?.id) || current.value;
  } catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "删除失败"); }
}

onMounted(load);
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 12px; }
.toolbar { display: flex; gap: 8px; }
.name-tag { margin-left: 6px; }
.val-tag { margin: 2px; }
.value-add { display: flex; gap: 8px; }
</style>
