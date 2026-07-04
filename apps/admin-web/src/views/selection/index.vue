<template>
  <div class="selection-page">
    <div class="topbar">
      <div>
        <h2>选品中心</h2>
        <p>按平台热销趋势查看可选商品，支持手动刷新榜单。</p>
      </div>
      <div class="actions">
        <el-select v-model="sort" style="width: 132px" @change="loadProducts">
          <el-option label="按销量" value="sales" />
          <el-option label="按利润" value="profit" />
          <el-option label="按抓取时间" value="fetched_time" />
        </el-select>
        <el-button type="primary" :icon="Refresh" :loading="crawlerLoading" @click="startCrawler">启动抓取</el-button>
      </div>
    </div>

    <section class="category-band">
      <button
        v-for="c in categories"
        :key="c.id"
        :class="['category-tab', { active: activeRootId === c.id }]"
        @click="selectRoot(c.id)"
      >
        {{ c.categoryName }}
      </button>
    </section>

    <section class="sub-band" v-if="activeRoot?.children?.length">
      <button :class="['sub-tab', { active: !activeCategoryId || activeCategoryId === activeRootId }]" @click="selectCategory(activeRootId)">
        全部
      </button>
      <button
        v-for="c in activeRoot.children"
        :key="c.id"
        :class="['sub-tab', { active: activeCategoryId === c.id }]"
        @click="selectCategory(c.id)"
      >
        {{ c.categoryName }}
      </button>
    </section>

    <el-alert
      v-if="task"
      :title="`抓取任务 ${task.taskId}：${task.status}，成功 ${task.successCount}/${task.totalCount}`"
      :type="task.status === 'FAILED' ? 'error' : task.status === 'SUCCESS' ? 'success' : 'info'"
      show-icon
      :closable="false"
    />

    <div v-loading="loading" class="rank-grid">
      <article v-for="item in products" :key="item.id" class="product-card">
        <div class="rank">#{{ item.rankNo }}</div>
        <el-image class="cover" :src="item.imageUrl" fit="cover" />
        <div class="body">
          <a class="name" :href="item.sourceUrl" target="_blank" rel="noreferrer">{{ item.productName }}</a>
          <div class="metrics">
            <span><b>{{ formatNumber(item.sales7d) }}</b> 近7天销量</span>
            <span><b>¥{{ item.avgPrice }}</b> 均价</span>
            <span><b>¥{{ item.profitEstimate }}</b> 利润估算</span>
          </div>
          <div class="tags">
            <el-tag size="small" type="success">{{ item.trendTag }}</el-tag>
            <el-tag size="small" :type="competitionType(item.competitionLevel)">竞争{{ item.competitionLevel }}</el-tag>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
import { ApiError, type CrawlerTaskDTO, type SelectionCategoryDTO, type SelectionProductDTO } from "@/api";
import { loadSelectionCategories } from "@/use-cases/selection/loadSelectionCategories";
import { loadSelectionProducts } from "@/use-cases/selection/loadSelectionProducts";
import { startSelectionCrawler } from "@/use-cases/selection/startSelectionCrawler";
import { watchCrawlerStatus } from "@/use-cases/selection/watchCrawlerStatus";

const loading = ref(false);
const crawlerLoading = ref(false);
const categories = ref<SelectionCategoryDTO[]>([]);
const products = ref<SelectionProductDTO[]>([]);
const activeRootId = ref<number>();
const activeCategoryId = ref<number>();
const sort = ref("sales");
const task = ref<CrawlerTaskDTO | null>(null);

const activeRoot = computed(() => categories.value.find((c) => c.id === activeRootId.value));

async function init() {
  try {
    categories.value = await loadSelectionCategories();
    activeRootId.value = categories.value[0]?.id;
    activeCategoryId.value = activeRootId.value;
    await loadProducts();
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "加载选品数据失败");
  }
}

async function loadProducts() {
  if (!activeCategoryId.value) return;
  loading.value = true;
  try {
    products.value = await loadSelectionProducts({ categoryId: activeCategoryId.value, sort: sort.value, order: "desc" });
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "加载榜单失败");
  } finally {
    loading.value = false;
  }
}

function selectRoot(id: number) {
  activeRootId.value = id;
  activeCategoryId.value = id;
  loadProducts();
}

function selectCategory(id?: number) {
  activeCategoryId.value = id || activeRootId.value;
  loadProducts();
}

async function startCrawler() {
  if (!activeCategoryId.value) return;
  crawlerLoading.value = true;
  try {
    task.value = await startSelectionCrawler({ categoryId: activeCategoryId.value });
    await watchCrawlerStatus(task.value.taskId, (next) => { task.value = next; });
    await loadProducts();
    ElMessage.success("选品榜单已刷新");
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "启动抓取失败");
  } finally {
    crawlerLoading.value = false;
  }
}

function formatNumber(n: number) {
  return n >= 10000 ? `${(n / 10000).toFixed(1)}万` : String(n);
}

function competitionType(level?: string) {
  if (level === "低") return "success";
  if (level === "高") return "danger";
  return "warning";
}

onMounted(init);
</script>

<style scoped>
.selection-page { display: flex; flex-direction: column; gap: 14px; }
.topbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 18px; }
.topbar h2 { margin: 0; font-size: 20px; color: #111827; }
.topbar p { margin: 6px 0 0; color: #6b7280; font-size: 13px; }
.actions { display: flex; gap: 10px; align-items: center; }
.category-band, .sub-band { display: flex; gap: 8px; flex-wrap: wrap; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; }
.sub-band { padding: 8px 10px; }
.category-tab, .sub-tab { border: 1px solid #d1d5db; background: #fff; color: #374151; border-radius: 6px; min-height: 34px; padding: 0 14px; cursor: pointer; }
.category-tab.active, .sub-tab.active { color: #fff; background: #2563eb; border-color: #2563eb; }
.rank-grid { min-height: 260px; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
.product-card { position: relative; display: grid; grid-template-columns: 96px 1fr; gap: 12px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; overflow: hidden; }
.rank { position: absolute; top: 10px; left: 10px; z-index: 1; background: rgba(17, 24, 39, .72); color: #fff; border-radius: 4px; padding: 2px 6px; font-size: 12px; }
.cover { width: 96px; height: 96px; border-radius: 6px; background: #f3f4f6; }
.body { min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.name { color: #111827; font-weight: 600; line-height: 1.35; text-decoration: none; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.metrics { display: grid; gap: 4px; color: #6b7280; font-size: 12px; }
.metrics b { color: #111827; }
.tags { display: flex; gap: 6px; flex-wrap: wrap; }
@media (max-width: 720px) {
  .topbar { align-items: flex-start; flex-direction: column; }
  .actions { width: 100%; justify-content: space-between; }
}
</style>
