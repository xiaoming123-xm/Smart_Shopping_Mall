<template>
  <div class="page">
    <div class="toolbar"><el-button :icon="Refresh" @click="load">刷新</el-button></div>
    <el-card v-loading="loading">
      <el-table :data="list" border stripe>
        <el-table-column prop="skuId" label="SKU ID" width="90" />
        <el-table-column prop="skuCode" label="SKU 编码" />
        <el-table-column prop="quantity" label="当前库存" width="110" />
        <el-table-column label="预警阈值" width="110">
          <template #default="{ row }">
            <el-tag v-if="row.quantity <= row.warnThreshold" type="danger" size="small">{{ row.warnThreshold }}</el-tag>
            <span v-else>{{ row.warnThreshold }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="costPrice" label="成本价" width="100" />
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="240">
          <template #default="{ row }">
            <el-button link type="success" size="small" @click="openMove(row, 'in')">入库</el-button>
            <el-button link type="warning" size="small" @click="openMove(row, 'out')">出库</el-button>
            <el-button link type="primary" size="small" @click="openRecords(row)">流水</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="moveVisible" :title="moveType === 'in' ? '入库' : '出库'" width="400px">
      <el-form label-width="80px">
        <el-form-item label="SKU"><span>{{ currentRow?.skuCode }}</span></el-form-item>
        <el-form-item label="数量"><el-input-number v-model="qty" :min="1" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="remark" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="moveVisible = false">取消</el-button>
        <el-button type="primary" :loading="moving" @click="onMove">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="recordVisible" :title="`库存流水 - ${currentRow?.skuCode || ''}`" width="560px">
      <el-table :data="records" border size="small">
        <el-table-column prop="type" label="类型" width="90" />
        <el-table-column prop="change" label="变化" width="90" />
        <el-table-column prop="after" label="变化后" width="90" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column prop="createdAt" label="时间" width="170" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
import { loadStocks, stockIn, stockOut, loadStockRecords } from "@/use-cases/inventory.uc";
import type { StockDTO, StockRecordDTO } from "@/api";
import { ApiError } from "@/api";

const loading = ref(false);
const list = ref<StockDTO[]>([]);
const moveVisible = ref(false);
const moveType = ref<"in" | "out">("in");
const moving = ref(false);
const currentRow = ref<StockDTO | null>(null);
const qty = ref(1);
const remark = ref("");
const recordVisible = ref(false);
const records = ref<StockRecordDTO[]>([]);

async function load() {
  loading.value = true;
  try { list.value = await loadStocks(); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "加载失败"); }
  finally { loading.value = false; }
}

function openMove(row: StockDTO, type: "in" | "out") { currentRow.value = row; moveType.value = type; qty.value = 1; remark.value = ""; moveVisible.value = true; }

async function onMove() {
  if (!currentRow.value) return;
  moving.value = true;
  try {
    if (moveType.value === "in") await stockIn(currentRow.value.skuId, qty.value, remark.value);
    else await stockOut(currentRow.value.skuId, qty.value, remark.value);
    ElMessage.success("操作成功"); moveVisible.value = false; load();
  } catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "操作失败"); }
  finally { moving.value = false; }
}

async function openRecords(row: StockDTO) {
  currentRow.value = row; recordVisible.value = true;
  try { records.value = await loadStockRecords(row.skuId); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "加载失败"); }
}

onMounted(load);
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 12px; }
.toolbar { display: flex; gap: 8px; }
</style>
