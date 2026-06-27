<template>
  <div class="page">
    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="openCreate">新增商品</el-button>
      <el-button :icon="Refresh" @click="load">刷新</el-button>
    </div>
    <el-card v-loading="loading">
      <el-table :data="list" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="主图" width="80">
          <template #default="{ row }">
            <el-image v-if="row.mainImage" :src="row.mainImage" style="width:40px;height:40px" fit="cover" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column prop="price" label="售价" width="100" />
        <el-table-column prop="costPrice" label="成本" width="100" />
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '上架' : '下架' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-button link type="warning" size="small" @click="onToggle(row)">{{ row.status === 1 ? '下架' : '上架' }}</el-button>
            <el-button link type="primary" size="small" @click="openSkus(row)">SKU</el-button>
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑商品' : '新增商品'" width="560px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="分类">
          <el-tree-select v-model="form.categoryId" :data="categoryTree" :props="{ label: 'name', children: 'children' }" node-key="id" check-strictly placeholder="选择分类" style="width:100%" />
        </el-form-item>
        <el-form-item label="品牌">
          <el-select v-model="form.brandId" placeholder="选择品牌" clearable style="width:100%">
            <el-option v-for="b in brands" :key="b.id" :label="b.name" :value="b.id!" />
          </el-select>
        </el-form-item>
        <el-form-item label="主图"><el-input v-model="form.mainImage" placeholder="图片URL" /></el-form-item>
        <el-form-item label="售价"><el-input-number v-model="form.price" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="成本价"><el-input-number v-model="form.costPrice" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="库存"><el-input-number v-model="form.stock" :min="0" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="onSave">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="skuVisible" :title="`SKU 管理 - ${currentSpu?.name || ''}`" width="640px">
      <div class="toolbar"><el-button type="primary" size="small" :icon="Plus" @click="openSkuEdit(null)">新增SKU</el-button></div>
      <el-table :data="skus" border size="small" style="margin-top:8px">
        <el-table-column prop="skuCode" label="编码" />
        <el-table-column prop="specs" label="规格" />
        <el-table-column prop="price" label="售价" width="90" />
        <el-table-column prop="costPrice" label="成本" width="90" />
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column label="操作" width="130">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openSkuEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="onDeleteSku(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog v-model="skuEditVisible" :title="skuForm.id ? '编辑SKU' : '新增SKU'" width="440px">
      <el-form :model="skuForm" label-width="80px">
        <el-form-item label="编码"><el-input v-model="skuForm.skuCode" /></el-form-item>
        <el-form-item label="规格"><el-input v-model="skuForm.specs" placeholder='如 颜色:红;尺寸:L' /></el-form-item>
        <el-form-item label="售价"><el-input-number v-model="skuForm.price" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="成本价"><el-input-number v-model="skuForm.costPrice" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="库存"><el-input-number v-model="skuForm.stock" :min="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="skuEditVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingSku" @click="onSaveSku">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Refresh } from "@element-plus/icons-vue";
import { loadProducts, saveProduct, deleteProduct, toggleProductStatus, loadSkus, saveSku, deleteSku } from "@/use-cases/product.uc";
import { loadCategoryTree } from "@/use-cases/category.uc";
import { loadBrands } from "@/use-cases/brand.uc";
import type { SpuDTO, SkuDTO, CategoryTreeDTO, BrandDTO } from "@/api";
import { ApiError } from "@/api";

const loading = ref(false);
const saving = ref(false);
const list = ref<SpuDTO[]>([]);
const categoryTree = ref<CategoryTreeDTO[]>([]);
const brands = ref<BrandDTO[]>([]);
const dialogVisible = ref(false);
const form = reactive<SpuDTO>({ name: "", categoryId: null, brandId: null, mainImage: "", description: "", price: 0, costPrice: 0, stock: 0, sort: 0 });

const skuVisible = ref(false);
const currentSpu = ref<SpuDTO | null>(null);
const skus = ref<SkuDTO[]>([]);
const skuEditVisible = ref(false);
const savingSku = ref(false);
const skuForm = reactive<SkuDTO>({ skuCode: "", specs: "", price: 0, costPrice: 0, stock: 0 });

async function load() {
  loading.value = true;
  try { list.value = await loadProducts(); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "加载失败"); }
  finally { loading.value = false; }
}

async function loadRefs() {
  try { categoryTree.value = await loadCategoryTree(); brands.value = await loadBrands(); } catch { /* ignore */ }
}

function reset() { Object.assign(form, { id: undefined, name: "", categoryId: null, brandId: null, mainImage: "", description: "", price: 0, costPrice: 0, stock: 0, sort: 0 }); }
function openCreate() { reset(); dialogVisible.value = true; }
function openEdit(row: SpuDTO) { Object.assign(form, { ...row }); dialogVisible.value = true; }

async function onSave() {
  if (!form.name.trim()) { ElMessage.warning("请输入名称"); return; }
  saving.value = true;
  try { await saveProduct({ ...form }); ElMessage.success("保存成功"); dialogVisible.value = false; load(); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "保存失败"); }
  finally { saving.value = false; }
}

async function onToggle(row: SpuDTO) {
  try { await toggleProductStatus(row.id!, row.status !== 1); ElMessage.success("操作成功"); load(); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "操作失败"); }
}

async function onDelete(row: SpuDTO) {
  await ElMessageBox.confirm(`确认删除商品「${row.name}」？`, "提示", { type: "warning" }).catch(() => null);
  try { await deleteProduct(row.id!); ElMessage.success("已删除"); load(); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "删除失败"); }
}

async function openSkus(row: SpuDTO) {
  currentSpu.value = row;
  skuVisible.value = true;
  try { skus.value = await loadSkus(row.id!); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "加载SKU失败"); }
}

function openSkuEdit(row: SkuDTO | null) {
  if (row) Object.assign(skuForm, { ...row });
  else Object.assign(skuForm, { id: undefined, skuCode: "", specs: "", price: 0, costPrice: 0, stock: 0 });
  skuEditVisible.value = true;
}

async function onSaveSku() {
  if (!currentSpu.value?.id) return;
  if (!skuForm.skuCode.trim()) { ElMessage.warning("请输入编码"); return; }
  savingSku.value = true;
  try { await saveSku(currentSpu.value.id, { ...skuForm }); ElMessage.success("保存成功"); skuEditVisible.value = false; skus.value = await loadSkus(currentSpu.value.id); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "保存失败"); }
  finally { savingSku.value = false; }
}

async function onDeleteSku(row: SkuDTO) {
  await ElMessageBox.confirm("确认删除该 SKU？", "提示", { type: "warning" }).catch(() => null);
  try { await deleteSku(row.id!); ElMessage.success("已删除"); if (currentSpu.value?.id) skus.value = await loadSkus(currentSpu.value.id); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "删除失败"); }
}

onMounted(() => { load(); loadRefs(); });
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 12px; }
.toolbar { display: flex; gap: 8px; }
</style>
