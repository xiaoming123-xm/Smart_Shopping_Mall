<template>
  <div class="page">
    <div class="toolbar">
      <el-button :icon="Refresh" @click="load">刷新</el-button>
      <el-button v-if="refundOrders.length" type="warning" plain @click="showOnlyRefund = !showOnlyRefund">
        {{ showOnlyRefund ? "查看全部订单" : `只看退货 ${refundOrders.length} 个` }}
      </el-button>
    </div>
    <el-alert
      v-if="refundOrders.length"
      class="refund-alert"
      type="warning"
      :closable="false"
      show-icon
      :title="`待处理退货 ${refundOrders.length} 个`"
      description="用户已提交退款/退货申请，需商家审核后再处理退款与入库。"
    />
    <el-card v-loading="loading">
      <el-table :data="filteredList" border stripe>
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column prop="receiver" label="收货人" width="110" />
        <el-table-column prop="statusText" label="状态" width="110">
          <template #default="{ row }"><el-tag :type="tagType(row.status)">{{ row.statusText || row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="金额" width="110" />
        <el-table-column prop="logisticsCompany" label="物流公司" width="120" />
        <el-table-column prop="trackingNo" label="物流单号" width="150" />
        <el-table-column prop="createdAt" label="下单时间" width="180" />
        <el-table-column label="操作" width="190" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetail(row)">详情</el-button>
            <el-button link type="warning" size="small" :disabled="row.status !== 'REFUND_REQUESTED'" @click="onApproveRefund(row)">同意退货</el-button>
            <el-button link type="danger" size="small" :disabled="row.status !== 'REFUND_REQUESTED'" @click="onRejectRefund(row)">拒绝退货</el-button>
            <el-button link type="success" size="small" :disabled="row.status !== 'PAID'" @click="openShip(row)">发货</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="detailVisible" :title="`订单详情 - ${detail?.orderNo || ''}`" width="720px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ detail?.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detail?.statusText || detail?.status }}</el-descriptions-item>
        <el-descriptions-item label="金额">{{ detail?.totalAmount }}</el-descriptions-item>
        <el-descriptions-item label="收货人">{{ detail?.receiver }} {{ detail?.receiverPhone }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">{{ detail?.address }}</el-descriptions-item>
        <el-descriptions-item label="物流" :span="2">{{ detail?.logisticsCompany || "-" }} {{ detail?.trackingNo || "" }}</el-descriptions-item>
        <el-descriptions-item v-if="detail?.status === 'REFUND_REQUESTED'" label="退货备注" :span="2">
          {{ detail?.refundReason || "用户申请退款/退货" }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detail?.status === 'REFUND_REQUESTED'" label="申请时间" :span="2">
          {{ formatTime(detail?.refundRequestedAt) || "-" }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detail?.refundHandleNote" label="退货处理" :span="2">
          {{ detail.refundHandleNote }} {{ formatTime(detail?.refundHandledAt) }}
        </el-descriptions-item>
      </el-descriptions>
      <el-table :data="detail?.items || []" border size="small" style="margin-top:12px">
        <el-table-column prop="productName" label="商品" />
        <el-table-column prop="skuCode" label="SKU" width="150" />
        <el-table-column prop="price" label="单价" width="100" />
        <el-table-column prop="quantity" label="数量" width="80" />
      </el-table>
      <el-timeline v-if="detail?.logisticsTraces?.length" style="margin-top:16px">
        <el-timeline-item v-for="t in detail.logisticsTraces" :key="t.time + t.content" :timestamp="t.time">{{ t.content }}</el-timeline-item>
      </el-timeline>
    </el-dialog>

    <el-dialog v-model="shipVisible" title="发货" width="760px">
      <el-form :model="shipForm" label-width="110px">
        <el-form-item label="收件人"><el-input :model-value="shipOrderRow?.receiver" disabled /></el-form-item>
        <el-form-item label="联系电话"><el-input :model-value="shipOrderRow?.receiverPhone" disabled /></el-form-item>
        <el-form-item label="收货地址"><el-input :model-value="shipOrderRow?.address" type="textarea" disabled /></el-form-item>
        <el-form-item label="发件人"><el-input v-model="shipForm.sender" /></el-form-item>
        <el-form-item label="联系电话"><el-input v-model="shipForm.senderPhone" /></el-form-item>
        <el-form-item label="发货地址"><el-input v-model="shipForm.senderAddress" type="textarea" /></el-form-item>
        <el-form-item label="物流公司">
          <el-select v-model="shipForm.logisticsCompany" placeholder="选择物流公司" style="width:100%">
            <el-option label="顺丰速运" value="顺丰速运" />
            <el-option label="京东物流" value="京东物流" />
            <el-option label="中通快递" value="中通快递" />
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号"><el-input v-model="shipForm.trackingNo" placeholder="请输入物流单号" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipVisible = false">取消</el-button>
        <el-button type="primary" :loading="shipping" @click="submitShip">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
import { approveRefund, loadOrder, loadOrders, rejectRefund, shipOrder } from "@/use-cases/order.uc";
import type { OrderDTO, ShipOrderRequest } from "@/api";
import { ApiError } from "@/api";

const loading = ref(false);
const shipping = ref(false);
const list = ref<OrderDTO[]>([]);
const showOnlyRefund = ref(false);
const detailVisible = ref(false);
const shipVisible = ref(false);
const detail = ref<OrderDTO | null>(null);
const shipOrderRow = ref<OrderDTO | null>(null);
const shipForm = reactive<ShipOrderRequest>({
  sender: "悟空",
  senderPhone: "18600000000",
  senderAddress: "江苏省连云港市花果山水帘洞",
  logisticsCompany: "顺丰速运",
  trackingNo: "SF123456465",
});

const refundOrders = computed(() => list.value.filter((order) => order.status === "REFUND_REQUESTED"));
const filteredList = computed(() => (showOnlyRefund.value ? refundOrders.value : list.value));

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

function openShip(row: OrderDTO) {
  shipOrderRow.value = row;
  shipForm.trackingNo = row.trackingNo || "SF123456465";
  shipVisible.value = true;
}

async function submitShip() {
  if (!shipOrderRow.value) return;
  shipping.value = true;
  try {
    await shipOrder(shipOrderRow.value.id, { ...shipForm });
    ElMessage.success("已发货");
    shipVisible.value = false;
    await load();
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "发货失败");
  } finally {
    shipping.value = false;
  }
}

async function onApproveRefund(row: OrderDTO) {
  const confirmed = await ElMessageBox.confirm("确认同意退货并退款？同意后只退款，不会自动回补库存，商品需在库存管理里人工入库。", "同意退货", { type: "warning" }).then(() => true).catch(() => false);
  if (!confirmed) return;
  try {
    await approveRefund(row.id, "商家已同意退货，钱已退回。");
    ElMessage.success("已同意退货并退款");
    await load();
    if (detail.value?.id === row.id) detail.value = await loadOrder(row.id);
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "处理退货失败");
  }
}

async function onRejectRefund(row: OrderDTO) {
  const note = await ElMessageBox.prompt("请输入拒绝原因", "拒绝退货", { inputValue: "商品不符合退货条件", confirmButtonText: "拒绝", cancelButtonText: "取消", type: "warning" }).catch(() => null);
  if (!note) return;
  try {
    await rejectRefund(row.id, note.value || "商家已拒绝退货申请");
    ElMessage.success("已拒绝退货申请");
    await load();
    if (detail.value?.id === row.id) detail.value = await loadOrder(row.id);
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "处理退货失败");
  }
}

function tagType(status: string) {
  if (status === "PAID") return "warning";
  if (status === "REFUND_REQUESTED") return "danger";
  if (status === "REFUNDED") return "success";
  if (status === "REFUND_REJECTED") return "info";
  if (status === "SHIPPED") return "success";
  if (status === "COMPLETED") return "info";
  return "";
}

function formatTime(value?: string) {
  return value ? value.replace("T", " ").slice(0, 19) : "";
}

load();
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 12px; }
.toolbar { display: flex; gap: 8px; }
.refund-alert { margin-bottom: 2px; }
</style>
