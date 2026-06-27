<template>
  <div class="page">
    <div class="toolbar"><el-button :icon="Refresh" @click="load">刷新</el-button></div>
    <el-card v-loading="loading">
      <el-table :data="list" border stripe>
        <el-table-column prop="orderNo" label="订单号" min-width="160" />
        <el-table-column prop="memberId" label="会员ID" width="90" />
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column prop="totalAmount" label="金额" width="110" />
        <el-table-column prop="receiver" label="收货人" width="110" />
        <el-table-column prop="createdAt" label="下单时间" width="180" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetail(row)">详情</el-button>
            <el-button link type="success" size="small" @click="onShip(row)">发货</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="detailVisible" :title="`订单详情 - ${detail?.orderNo || ''}`" width="640px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ detail?.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detail?.status }}</el-descriptions-item>
        <el-descriptions-item label="金额">{{ detail?.totalAmount }}</el-descriptions-item>
        <el-descriptions-item label="收货人">{{ detail?.receiver }}</el-descriptions-item>
        <el-descriptions-item label="地址" :span="2">{{ detail?.address }}</el-descriptions-item>
      </el-descriptions>
      <el-table :data="detail?.items || []" border size="small" style="margin-top:12px">
        <el-table-column prop="productName" label="商品" />
        <el-table-column prop="skuCode" label="SKU" width="140" />
        <el-table-column prop="price" label="单价" width="100" />
        <el-table-column prop="quantity" label="数量" width="80" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
import { loadOrders, loadOrder, shipOrder } from "@/use-cases/order.uc";
import type { OrderDTO } from "@/api";
import { ApiError } from "@/api";

const loading = ref(false);
const list = ref<OrderDTO[]>([]);
const detailVisible = ref(false);
const detail = ref<OrderDTO | null>(null);

async function load() {
  loading.value = true;
  try { list.value = await loadOrders(); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "加载失败"); }
  finally { loading.value = false; }
}

async function openDetail(row: OrderDTO) {
  detailVisible.value = true;
  try { detail.value = await loadOrder(row.id); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "加载失败"); }
}

async function onShip(row: OrderDTO) {
  await ElMessageBox.confirm(`确认对订单「${row.orderNo}」发货？`, "提示", { type: "warning" }).catch(() => null);
  try { await shipOrder(row.id); ElMessage.success("已发货"); load(); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "发货失败"); }
}

onMounted(load);
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 12px; }
.toolbar { display: flex; gap: 8px; }
</style>
