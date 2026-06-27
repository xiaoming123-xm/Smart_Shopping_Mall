<template>
  <div class="page">
    <div class="toolbar"><el-button :icon="Refresh" @click="load">刷新</el-button></div>
    <el-card v-loading="loading">
      <el-table :data="list" border stripe>
        <el-table-column prop="paymentNo" label="支付单号" min-width="160" />
        <el-table-column prop="orderId" label="订单ID" width="90" />
        <el-table-column prop="channel" label="渠道" width="120" />
        <el-table-column prop="status" label="资金状态" width="120" />
        <el-table-column prop="amount" label="金额" width="110" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column prop="paidAt" label="支付时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
import { loadPayments } from "@/use-cases/payment.uc";
import type { PaymentDTO } from "@/api";
import { ApiError } from "@/api";

const loading = ref(false);
const list = ref<PaymentDTO[]>([]);

async function load() {
  loading.value = true;
  try { list.value = await loadPayments(); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "加载失败"); }
  finally { loading.value = false; }
}

onMounted(load);
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 12px; }
.toolbar { display: flex; gap: 8px; }
</style>
