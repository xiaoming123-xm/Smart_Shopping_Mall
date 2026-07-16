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
        <el-table-column label="操作" width="340">
          <template #default="{ row }">
            <el-button link type="warning" size="small" @click="onToggle(row)">{{ row.status === 1 ? '下架' : '上架' }}</el-button>
            <el-button link type="primary" size="small" @click="openSkus(row)">SKU</el-button>
            <el-button link type="success" size="small" @click="openAiGenerate(row)">AI生成</el-button>
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
          <el-tree-select v-model="form.categoryId" :data="categoryTree" :props="{ label: 'name', children: 'children' }" node-key="id" check-strictly placeholder="选择分类" style="width:100%" @change="onCategoryChange" />
        </el-form-item>
        <el-form-item label="品牌">
          <el-select v-model="form.brandId" placeholder="选择品牌" clearable style="width:100%">
            <el-option v-for="b in brands" :key="b.id" :label="b.name" :value="b.id!" />
          </el-select>
        </el-form-item>
        <el-form-item label="主图">
          <div class="image-field">
            <div class="image-preview-frame">
              <el-image v-if="form.mainImage" :src="form.mainImage" fit="cover" class="image-preview" />
              <span v-else>暂无主图</span>
            </div>
            <div class="image-actions">
              <el-input v-model="form.mainImage" placeholder="图片URL 或上传图片后自动填充" />
              <div class="image-buttons">
                <el-button type="primary" plain @click="triggerImageUpload">上传图片</el-button>
                <el-button @click="clearMainImage">清空</el-button>
                <el-button v-if="form.id" type="success" link @click="openAiGenerate(form)">去AI内容生成优化</el-button>
              </div>
              <input ref="imageInput" type="file" accept="image/*" class="hidden-file" @change="onMainImageChange" />
            </div>
          </div>
        </el-form-item>
        <el-form-item label="售价"><el-input-number v-model="form.price" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="成本价"><el-input-number v-model="form.costPrice" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="库存"><el-input-number v-model="form.stock" :min="0" /></el-form-item>
        <el-form-item label="商品属性" v-if="attributeGroups.length">
          <div class="attr-editor">
            <div v-for="group in attributeGroups" :key="group.name" class="attr-row">
              <span class="attr-name">{{ group.name }}<i v-if="groupRequired(group)">*</i></span>
              <div class="attr-inputs">
                <el-select
                  v-if="group.options.length > 1"
                  v-model="selectedAttributeByGroup[group.name]"
                  clearable
                  filterable
                  placeholder="选择属性分类"
                  style="width: 100%"
                  @change="onAttributeGroupChange(group)"
                >
                  <el-option v-for="attr in group.options" :key="attrKey(attr)" :label="attr.name" :value="attr.name" />
                </el-select>
                <template v-if="currentGroupAttribute(group)">
                  <el-select
                    v-if="isSelectAttr(currentGroupAttribute(group)!)"
                    v-model="attributeValues[currentGroupAttribute(group)!.name]"
                    :multiple="isMultiAttr(currentGroupAttribute(group)!)"
                    clearable
                    filterable
                    placeholder="选择属性值"
                    style="width: 100%"
                  >
                    <el-option v-for="v in currentGroupAttribute(group)!.values || []" :key="v.id || v.value" :label="v.value" :value="v.value" />
                  </el-select>
                  <el-input v-else v-model="attributeValues[currentGroupAttribute(group)!.name]" placeholder="输入属性值" />
                </template>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="商品属性" v-else-if="form.categoryId">
          <span class="attr-empty">该分类暂未绑定属性</span>
        </el-form-item>
        <el-form-item label="商品属性" v-else>
          <span class="attr-empty">请先选择分类，再配置颜色、尺码等商品属性</span>
        </el-form-item>
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
        <el-form-item label="规格"><el-input v-model="skuForm.specs" placeholder='如 颜色:红;衣服尺码:L' /></el-form-item>
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
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Refresh } from "@element-plus/icons-vue";
import { loadProducts, saveProduct, deleteProduct, toggleProductStatus, loadSkus, saveSku, deleteSku } from "@/use-cases/product.uc";
import { loadAttributes } from "@/use-cases/attribute.uc";
import { loadCategoryTree } from "@/use-cases/category.uc";
import { loadBrands } from "@/use-cases/brand.uc";
import type { SpuDTO, SkuDTO, CategoryTreeDTO, BrandDTO, AttributeDTO } from "@/api";
import { ApiError } from "@/api";
import { pickImageFile, readFileAsDataUrl } from "@/utils/imageUpload";

const loading = ref(false);
const router = useRouter();
const saving = ref(false);
const list = ref<SpuDTO[]>([]);
const categoryTree = ref<CategoryTreeDTO[]>([]);
const brands = ref<BrandDTO[]>([]);
const attributes = ref<AttributeDTO[]>([]);
const flatAttributes = computed(() => flattenAttributes(attributes.value));
const selectedCategoryPathIds = computed(() => getCategoryPathIds(form.categoryId));
const visibleAttributes = computed(() => flatAttributes.value.filter((attr) => shouldShowAttribute(attr)));
const attributeGroups = computed<ProductAttributeGroup[]>(() => buildAttributeGroups(attributes.value));
const dialogVisible = ref(false);
const form = reactive<SpuDTO>({ name: "", categoryId: null, brandId: null, mainImage: "", description: "", attributesJson: "", price: 0, costPrice: 0, stock: 0, sort: 0 });
const attributeValues = reactive<Record<string, string | string[]>>({});
const selectedAttributeByGroup = reactive<Record<string, string>>({});
const imageInput = ref<HTMLInputElement | null>(null);

const skuVisible = ref(false);
const currentSpu = ref<SpuDTO | null>(null);
const skus = ref<SkuDTO[]>([]);
const skuEditVisible = ref(false);
const savingSku = ref(false);
const skuForm = reactive<SkuDTO>({ skuCode: "", specs: "", price: 0, costPrice: 0, stock: 0 });

type ProductAttributeGroup = { name: string; options: AttributeDTO[] };

async function load() {
  loading.value = true;
  try { list.value = await loadProducts(); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "加载失败"); }
  finally { loading.value = false; }
}

async function loadRefs() {
  try {
    const [categories, brandRows, attrRows] = await Promise.all([loadCategoryTree(), loadBrands(), loadAttributes()]);
    categoryTree.value = categories;
    brands.value = brandRows;
    attributes.value = attrRows;
    resetAttributeValues(parseAttributes(form.attributesJson));
  } catch { /* ignore */ }
}

function flattenAttributes(rows: AttributeDTO[]): AttributeDTO[] {
  return rows.flatMap((row) => [row, ...flattenAttributes(row.children || [])]);
}

function buildAttributeGroups(rows: AttributeDTO[]): ProductAttributeGroup[] {
  const groups: ProductAttributeGroup[] = [];
  rows.forEach((row) => {
    const childOptions = flattenAttributes(row.children || []).filter((attr) => shouldShowAttribute(attr));
    if (isGroupAttr(row) && childOptions.length) {
      groups.push({ name: row.name, options: childOptions });
      return;
    }
    if (!isGroupAttr(row) && shouldShowAttribute(row)) {
      groups.push({ name: row.name, options: [row] });
    }
  });
  syncAttributeGroupSelection(groups);
  return groups;
}

function syncAttributeGroupSelection(groups: ProductAttributeGroup[]) {
  const groupNames = new Set(groups.map((group) => group.name));
  Object.keys(selectedAttributeByGroup).forEach((name) => {
    if (!groupNames.has(name)) delete selectedAttributeByGroup[name];
  });
  groups.forEach((group) => {
    const selected = selectedAttributeByGroup[group.name];
    if (!selected || !group.options.some((attr) => attr.name === selected)) {
      selectedAttributeByGroup[group.name] = group.options.length === 1 ? group.options[0].name : "";
    }
  });
}

function getCategoryPathIds(categoryId?: number | null): number[] {
  if (!categoryId) return [];
  const targetId = Number(categoryId);
  const path: number[] = [];
  const walk = (rows: CategoryTreeDTO[], parents: number[]): boolean => {
    for (const row of rows) {
      const rowId = Number(row.id);
      const nextPath = [...parents, rowId];
      if (rowId === targetId) {
        path.push(...nextPath);
        return true;
      }
      if (walk(row.children || [], nextPath)) return true;
    }
    return false;
  };
  walk(categoryTree.value, []);
  return path.length ? path : [targetId];
}

function reset() {
  Object.assign(form, { id: undefined, name: "", categoryId: null, brandId: null, mainImage: "", description: "", attributesJson: "", price: 0, costPrice: 0, stock: 0, sort: 0 });
  resetAttributeValues({});
}
function openCreate() { reset(); dialogVisible.value = true; }
function openEdit(row: SpuDTO) {
  Object.assign(form, { ...row });
  resetAttributeValues(parseAttributes(row.attributesJson));
  dialogVisible.value = true;
}
function openAiGenerate(row: SpuDTO) { if (row.id) router.push(`/admin/products/${row.id}/ai-generate`); }
function triggerImageUpload() { imageInput.value?.click(); }
function onCategoryChange() { resetAttributeValues(parseAttributes(form.attributesJson)); }

async function onMainImageChange(event: Event) {
  const file = pickImageFile(event);
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    ElMessage.warning("请选择图片文件");
    return;
  }
  try {
    form.mainImage = await readFileAsDataUrl(file);
    ElMessage.success("主图已载入，保存后刷新页面也会保留");
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : "读取图片失败");
  } finally {
    if (imageInput.value) imageInput.value.value = "";
  }
}

function clearMainImage() {
  form.mainImage = "";
}

function parseAttributes(raw?: string) {
  if (!raw) return {} as Record<string, string | string[]>;
  try {
    const parsed = JSON.parse(raw) as Record<string, string | string[]>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {} as Record<string, string | string[]>;
  }
}

function resetAttributeValues(values: Record<string, string | string[]>) {
  Object.keys(attributeValues).forEach((key) => delete attributeValues[key]);
  attributeGroups.value.forEach((group) => {
    const savedAttr = group.options.find((attr) => !isEmptyAttr(values[attr.name]));
    const selectedAttr = savedAttr || (group.options.length === 1 ? group.options[0] : null);
    selectedAttributeByGroup[group.name] = selectedAttr?.name || "";
    group.options.forEach((attr) => {
      attributeValues[attr.name] = values[attr.name] ?? (isMultiAttr(attr) ? [] : "");
    });
  });
}

function shouldShowAttribute(attr: AttributeDTO) {
  if ((attr.children && attr.children.length > 0) || isGroupAttr(attr)) return false;
  const categoryPathIds = selectedCategoryPathIds.value;
  if (!categoryPathIds.length) return false;
  const categoryIds = attr.categoryIds || [];
  return categoryIds.length === 0 || categoryIds.some((id) => categoryPathIds.includes(Number(id)));
}

function isSelectAttr(attr: AttributeDTO) {
  return ["select", "multi", "SELECT", "MULTI"].includes(attr.type || "select");
}

function isGroupAttr(attr: AttributeDTO) {
  return (attr.type || "").toLowerCase() === "group";
}

function attrKey(attr: AttributeDTO) {
  return attr.id || attr.name;
}

function currentGroupAttribute(group: ProductAttributeGroup) {
  const selected = selectedAttributeByGroup[group.name];
  return group.options.find((attr) => attr.name === selected) || (group.options.length === 1 ? group.options[0] : null);
}

function groupRequired(group: ProductAttributeGroup) {
  return group.options.some((attr) => attr.required);
}

function onAttributeGroupChange(group: ProductAttributeGroup) {
  group.options.forEach((attr) => {
    if (attr.name !== selectedAttributeByGroup[group.name]) {
      attributeValues[attr.name] = isMultiAttr(attr) ? [] : "";
    }
  });
}

function isMultiAttr(attr: AttributeDTO) {
  return (attr.type || "").toLowerCase() === "multi";
}

function isEmptyAttr(value: string | string[] | undefined) {
  return Array.isArray(value) ? value.length === 0 : !String(value || "").trim();
}

function cleanAttributeValues() {
  const allowed = new Set(attributeGroups.value.map((group) => currentGroupAttribute(group)?.name).filter(Boolean));
  return Object.fromEntries(Object.entries(attributeValues).filter(([key, value]) => allowed.has(key) && !isEmptyAttr(value)));
}

async function onSave() {
  if (!form.name.trim()) { ElMessage.warning("请输入名称"); return; }
  const missingGroup = attributeGroups.value.find((group) => groupRequired(group) && !currentGroupAttribute(group));
  if (missingGroup) { ElMessage.warning(`请选择属性分类：${missingGroup.name}`); return; }
  const missing = attributeGroups.value.map((group) => currentGroupAttribute(group)).find((attr) => attr?.required && isEmptyAttr(attributeValues[attr.name]));
  if (missing) { ElMessage.warning(`请填写必填属性：${missing.name}`); return; }
  form.attributesJson = JSON.stringify(cleanAttributeValues());
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
  const ok = await ElMessageBox.confirm(`确认删除商品「${row.name}」？`, "提示", { type: "warning" }).then(() => true).catch(() => false);
  if (!ok) return;
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
  const ok = await ElMessageBox.confirm("确认删除该 SKU？", "提示", { type: "warning" }).then(() => true).catch(() => false);
  if (!ok) return;
  try { await deleteSku(row.id!); ElMessage.success("已删除"); if (currentSpu.value?.id) skus.value = await loadSkus(currentSpu.value.id); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "删除失败"); }
}

onMounted(() => { load(); loadRefs(); });
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 12px; }
.toolbar { display: flex; gap: 8px; }
.image-field { display: grid; grid-template-columns: 116px 1fr; gap: 12px; width: 100%; }
.image-preview-frame { width: 116px; height: 116px; border: 1px dashed #cfd6e4; border-radius: 10px; background: #f8fafc; display: flex; align-items: center; justify-content: center; overflow: hidden; color: #94a3b8; font-size: 12px; text-align: center; padding: 8px; box-sizing: border-box; }
.image-preview { width: 100%; height: 100%; }
.image-actions { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.image-buttons { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.hidden-file { display: none; }
.attr-editor { width: 100%; display: grid; gap: 10px; }
.attr-row { display: grid; grid-template-columns: 96px 1fr; gap: 10px; align-items: center; }
.attr-inputs { display: grid; gap: 8px; min-width: 0; }
.attr-name { color: #4b5563; }
.attr-name i { color: #ef4444; font-style: normal; margin-left: 2px; }
.attr-empty { color: #94a3b8; }
</style>
