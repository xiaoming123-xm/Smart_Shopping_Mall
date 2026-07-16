<template>
  <div class="selection-page">
    <section class="topbar">
      <div>
        <h2>选品中心</h2>
        <p>先选择平台，再登录对应平台；当前已接入拼多多，淘宝和京东保留入口但暂未接入。</p>
      </div>
      <div class="actions">
        <el-select v-model="selectedPlatform" style="width: 120px" @change="onPlatformChange">
          <el-option v-for="platform in platformOptions" :key="platform.value" :label="platform.label" :value="platform.value" />
        </el-select>
        <el-select v-model="sort" style="width: 132px" @change="loadProducts">
          <el-option label="按销量" value="sales" />
          <el-option label="按成交额" value="amount" />
          <el-option label="按抓取时间" value="fetched_time" />
        </el-select>
        <el-input v-model="keyword" placeholder="如：蚊子、羽绒服" clearable style="width: 180px" @keyup.enter="startCrawler" />
        <el-input-number v-model="limit" :min="10" :max="100" controls-position="right" style="width: 116px" />
        <el-button type="primary" :icon="Refresh" :loading="crawlerLoading" @click="startCrawler">启动抓取</el-button>
      </div>
    </section>

    <section class="pdd-session-panel">
      <div>
        <strong>{{ currentPlatform.label }}登录会话</strong>
        <span :class="['session-pill', currentSessionReady ? 'ready' : 'pending']">{{ currentSessionReady ? "已验证" : "未验证" }}</span>
        <span v-if="!currentPlatform.enabled" class="session-pill disabled">暂未接入</span>
        <p>{{ sessionMessage }}</p>
        <p v-if="selectedPlatform === 'PDD' && pddSession?.confirmedAt" class="session-time">验证时间：{{ pddSession.confirmedAt }}</p>
      </div>
      <div class="session-actions">
        <el-button :icon="Link" :loading="sessionLoading" @click="openPlatformLogin">登录{{ currentPlatform.label }}</el-button>
        <el-button type="success" :icon="Check" :loading="sessionLoading" @click="confirmPlatformLogin">我已完成登录</el-button>
        <el-button :icon="Delete" :loading="sessionLoading" @click="clearPlatformSession">清除会话</el-button>
      </div>
    </section>

    <el-alert
      v-if="task"
      :title="taskTitle"
      :type="taskAlertType"
      show-icon
      :closable="false"
    />

    <section class="compare-panel" v-if="selectedProducts.length">
      <div class="compare-head">
        <div>
          <h3>商品对比</h3>
          <p>已选择 {{ selectedProducts.length }} 个真实商品。AI分析只基于这些结构化数据，缺失内容会显示“数据不足”。</p>
        </div>
        <el-button :icon="MagicStick" @click="buildAiAnalysis">AI分析所选商品</el-button>
      </div>
      <div class="compare-table-wrap">
        <table class="compare-table">
          <thead>
            <tr>
              <th>对比项</th>
              <th v-for="item in selectedProducts" :key="item.id">#{{ item.rankNo }} {{ item.productName }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>图片</td>
              <td v-for="item in selectedProducts" :key="`img-${item.id}`"><img class="compare-image" :src="item.imageUrl" :alt="item.productName" /></td>
            </tr>
            <tr><td>平台</td><td v-for="item in selectedProducts" :key="`platform-${item.id}`">{{ item.platform || "数据不足" }}</td></tr>
            <tr><td>单价</td><td v-for="item in selectedProducts" :key="`price-${item.id}`">¥{{ formatMoney(item.avgPrice) }}</td></tr>
            <tr><td>销量</td><td v-for="item in selectedProducts" :key="`sales-${item.id}`">{{ formatNumber(item.sales7d) }}</td></tr>
            <tr><td>成交额估算</td><td v-for="item in selectedProducts" :key="`amount-${item.id}`">¥{{ formatMoney(item.salesAmount) }}（估算）</td></tr>
            <tr><td>抓取时间</td><td v-for="item in selectedProducts" :key="`time-${item.id}`">{{ item.fetchedAt || "数据不足" }}</td></tr>
            <tr><td>来源</td><td v-for="item in selectedProducts" :key="`source-${item.id}`"><a v-if="item.sourceUrl" :href="item.sourceUrl" target="_blank" rel="noreferrer">查看来源</a><span v-else>数据不足</span></td></tr>
          </tbody>
        </table>
      </div>
      <pre v-if="aiAnalysis" class="ai-analysis">{{ aiAnalysis }}</pre>
    </section>

    <el-empty v-if="!loading && !products.length" description="暂无真实选品数据。请先登录拼多多并启动小批量抓取；没有真实来源的数据不会显示。" />

    <el-table v-else v-loading="loading" :data="products" border stripe class="product-table" @selection-change="onSelectionChange">
      <el-table-column type="selection" width="48" />
      <el-table-column label="商品" min-width="320">
        <template #default="{ row }">
          <div class="product-cell">
            <el-image class="cover" :src="row.imageUrl" fit="cover" />
            <div>
              <a class="name" :href="row.sourceUrl" target="_blank" rel="noreferrer">{{ row.productName }}</a>
              <p>{{ row.platform || "PDD" }} · 商品ID：{{ row.sourceProductId || "数据不足" }}</p>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="rankNo" label="榜单" width="80" />
      <el-table-column label="单价" width="110"><template #default="{ row }">¥{{ formatMoney(row.avgPrice) }}</template></el-table-column>
      <el-table-column label="销量" width="110"><template #default="{ row }">{{ formatNumber(row.sales7d) }}</template></el-table-column>
      <el-table-column label="成交额估算" width="150"><template #default="{ row }">¥{{ formatMoney(row.salesAmount) }}</template></el-table-column>
      <el-table-column prop="trendTag" label="信息" width="120" />
      <el-table-column prop="fetchedAt" label="抓取时间" width="180" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { Check, Delete, Link, MagicStick, Refresh } from "@element-plus/icons-vue";
import { ApiError, selectionApi, type CrawlerTaskDTO, type PddCrawlerSessionDTO, type SelectionProductDTO } from "@/api";
import { loadSelectionProducts } from "@/use-cases/selection/loadSelectionProducts";
import { startSelectionCrawler } from "@/use-cases/selection/startSelectionCrawler";
import { watchCrawlerStatus } from "@/use-cases/selection/watchCrawlerStatus";

const loading = ref(false);
const crawlerLoading = ref(false);
const sessionLoading = ref(false);
const products = ref<SelectionProductDTO[]>([]);
const selectedProducts = ref<SelectionProductDTO[]>([]);
const platformOptions = [
  { label: "拼多多", value: "PDD", enabled: true },
  { label: "淘宝", value: "TAOBAO", enabled: false },
  { label: "京东", value: "JD", enabled: false },
] as const;
type SelectionPlatform = typeof platformOptions[number]["value"];
const selectedPlatform = ref<SelectionPlatform>("PDD");
const sort = ref("sales");
const keyword = ref("蚊子");
const limit = ref(100);
const task = ref<CrawlerTaskDTO | null>(null);
const pddSession = ref<PddCrawlerSessionDTO | null>(null);
const aiAnalysis = ref("");

const taskAlertType = computed(() => {
  if (!task.value) return "info";
  if (["SUCCESS", "PARTIAL_SUCCESS"].includes(task.value.status)) return "success";
  if (["NOT_LOGGED_IN", "LOGIN_EXPIRED", "NO_REAL_DATA", "FAILED"].includes(task.value.status)) return "error";
  return "info";
});
const taskTitle = computed(() => task.value ? `抓取任务 ${task.value.taskId}：${task.value.status}，真实商品 ${task.value.successCount}/${task.value.totalCount}${task.value.failReason ? `，${task.value.failReason}` : ""}` : "");
const currentPlatform = computed(() => platformOptions.find((platform) => platform.value === selectedPlatform.value) || platformOptions[0]);
const currentSessionReady = computed(() => selectedPlatform.value === "PDD" && Boolean(pddSession.value?.ready));
const sessionMessage = computed(() => {
  if (selectedPlatform.value === "PDD") return pddSession.value?.message || "启动抓取前需要先完成拼多多登录。";
  return `${currentPlatform.value.label}入口已预留，当前版本暂未接入登录和抓取接口。`; 
});

async function init() {
  try {
    await loadPddSession();
    await loadProducts();
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "加载选品数据失败");
  }
}

async function loadProducts() {
  loading.value = true;
  try {
    products.value = await loadSelectionProducts({ sort: sort.value, order: "desc" });
    selectedProducts.value = [];
    aiAnalysis.value = "";
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "加载真实商品失败");
  } finally {
    loading.value = false;
  }
}

async function loadPddSession() {
  pddSession.value = await selectionApi.pddSession();
}

async function onPlatformChange() {
  task.value = null;
  selectedProducts.value = [];
  aiAnalysis.value = "";
  if (selectedPlatform.value === "PDD") await loadPddSession();
}

function ensurePlatformEnabled() {
  if (selectedPlatform.value === "PDD") return true;
  ElMessage.warning(`${currentPlatform.value.label}暂未接入，当前只能使用拼多多抓取。`);
  return false;
}

async function openPddLogin() {
  sessionLoading.value = true;
  try {
    pddSession.value = await selectionApi.openPddLogin();
    ElMessage.success("已打开拼多多登录窗口，请在浏览器里完成登录");
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "打开拼多多登录失败");
  } finally {
    sessionLoading.value = false;
  }
}

async function openPlatformLogin() {
  if (!ensurePlatformEnabled()) return;
  await openPddLogin();
}

async function confirmPddLogin() {
  sessionLoading.value = true;
  try {
    pddSession.value = await selectionApi.confirmPddLogin();
    if (pddSession.value.ready) ElMessage.success("拼多多登录会话已验证");
    else ElMessage.warning(pddSession.value.message || "还没有检测到有效登录，请确认拼多多页面已经登录成功");
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "确认登录失败");
  } finally {
    sessionLoading.value = false;
  }
}

async function confirmPlatformLogin() {
  if (!ensurePlatformEnabled()) return;
  await confirmPddLogin();
}

async function clearPddSession() {
  sessionLoading.value = true;
  try {
    pddSession.value = await selectionApi.clearPddSession();
    ElMessage.success("拼多多登录确认已清除");
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "清除会话失败");
  } finally {
    sessionLoading.value = false;
  }
}

async function clearPlatformSession() {
  if (!ensurePlatformEnabled()) return;
  await clearPddSession();
}

async function startCrawler() {
  if (!ensurePlatformEnabled()) return;
  await loadPddSession();
  if (!pddSession.value?.ready) {
    ElMessage.warning("请先登录拼多多，并完成后端会话验证");
    return;
  }
  crawlerLoading.value = true;
  try {
    task.value = await startSelectionCrawler({ keyword: keyword.value.trim() || undefined, limit: limit.value });
    await watchCrawlerStatus(task.value.taskId, (next) => { task.value = next; });
    await loadProducts();
    if (["SUCCESS", "PARTIAL_SUCCESS"].includes(task.value.status)) ElMessage.success("真实选品数据已刷新");
    else ElMessage.warning(task.value.failReason || "没有抓到真实商品数据");
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "启动抓取失败");
  } finally {
    crawlerLoading.value = false;
  }
}

function onSelectionChange(rows: SelectionProductDTO[]) {
  selectedProducts.value = rows.slice(0, 4);
  aiAnalysis.value = "";
}

function buildAiAnalysis() {
  if (selectedProducts.value.length < 2) {
    ElMessage.warning("请至少选择两个商品进行对比");
    return;
  }
  const sorted = selectedProducts.value.slice().sort((a, b) => Number(b.salesAmount || 0) - Number(a.salesAmount || 0));
  const lines = ["AI客观对比（只基于已选真实数据）："];
  sorted.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.productName}：单价 ¥${formatMoney(item.avgPrice)}，销量 ${formatNumber(item.sales7d)}，成交额估算 ¥${formatMoney(item.salesAmount)}，来源 ${item.sourceUrl ? "有" : "数据不足"}。`);
  });
  const maxSales = sorted[0];
  const minSales = sorted[sorted.length - 1];
  lines.push(`销量差异：${maxSales.productName} 高于 ${minSales.productName}，差值 ${formatNumber(Number(maxSales.sales7d || 0) - Number(minSales.sales7d || 0))}。`);
  lines.push("利润、采购成本、运费、平台费用：数据不足，不能估算利润或给出赚钱结论。");
  aiAnalysis.value = lines.join("\n");
}

function formatNumber(n?: number) {
  const value = Number(n || 0);
  return value >= 10000 ? `${(value / 10000).toFixed(1)}万` : String(value);
}

function formatMoney(n?: number) {
  return Number(n || 0).toFixed(2);
}

onMounted(init);
</script>

<style scoped>
.selection-page { display: flex; flex-direction: column; gap: 14px; }
.topbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 18px; }
.topbar h2 { margin: 0; font-size: 20px; color: #111827; }
.topbar p { margin: 6px 0 0; color: #6b7280; font-size: 13px; }
.actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
.pdd-session-panel { display: flex; align-items: center; justify-content: space-between; gap: 16px; background: #fff; border: 1px solid #dbeafe; border-radius: 8px; padding: 14px 16px; }
.pdd-session-panel strong { color: #111827; margin-right: 8px; }
.pdd-session-panel p { margin: 6px 0 0; color: #6b7280; font-size: 13px; }
.session-pill { display: inline-flex; align-items: center; height: 22px; padding: 0 8px; border-radius: 999px; font-size: 12px; }
.session-pill.ready { background: #dcfce7; color: #166534; }
.session-pill.pending { background: #fef3c7; color: #92400e; }
.session-time { color: #9ca3af !important; }
.session-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.compare-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; }
.compare-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.compare-head h3 { margin: 0; font-size: 16px; color: #111827; }
.compare-head p { margin: 4px 0 0; color: #6b7280; font-size: 13px; }
.compare-table-wrap { overflow-x: auto; }
.compare-table { width: 100%; border-collapse: collapse; min-width: 760px; }
.compare-table th, .compare-table td { border: 1px solid #e5e7eb; padding: 10px; vertical-align: top; text-align: left; }
.compare-table th { background: #f8fafc; color: #111827; }
.compare-image { width: 84px; height: 84px; object-fit: cover; border-radius: 6px; background: #f3f4f6; }
.ai-analysis { margin: 12px 0 0; padding: 12px; background: #f8fafc; border-radius: 6px; color: #374151; white-space: pre-wrap; line-height: 1.6; }
.product-table { background: #fff; border-radius: 8px; overflow: hidden; }
.product-cell { display: grid; grid-template-columns: 72px 1fr; gap: 10px; align-items: center; }
.cover { width: 72px; height: 72px; border-radius: 6px; background: #f3f4f6; }
.name { color: #111827; font-weight: 600; line-height: 1.35; text-decoration: none; }
.product-cell p { margin: 6px 0 0; color: #6b7280; font-size: 12px; }
@media (max-width: 720px) {
  .topbar, .pdd-session-panel, .compare-head { align-items: flex-start; flex-direction: column; }
  .actions, .session-actions { justify-content: flex-start; }
}
</style>
