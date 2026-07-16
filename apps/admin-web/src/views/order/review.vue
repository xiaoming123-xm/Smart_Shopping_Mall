<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="card-head">
          <span>订单评价</span>
          <div class="filters">
            <el-input v-model="nickname" placeholder="输入用户昵称" clearable />
            <el-input v-model="productName" placeholder="输入商品名称" clearable />
            <el-button type="primary" @click="load">搜索</el-button>
          </div>
        </div>
      </template>
      <el-table :data="filtered" v-loading="loading" border>
        <el-table-column label="用户信息" width="180">
          <template #default="{ row }">
            <div class="user-cell"><div class="avatar">用户</div><span>商城用户</span></div>
          </template>
        </el-table-column>
        <el-table-column label="商品信息" width="360">
          <template #default="{ row }">
            <div class="goods">
              <el-image
                v-if="row.items?.[0]?.imageUrl"
                class="cover"
                :src="row.items[0].imageUrl"
                fit="cover"
                :preview-src-list="[row.items[0].imageUrl]"
                preview-teleported
              />
              <div v-else class="cover empty-cover">图</div>
              <span>{{ row.items?.[0]?.productName || "-" }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="评论内容">
          <template #default="{ row }">
            <div class="comment">
              <div class="comment-head"><b>初次评价</b><span>{{ row.reviewedAt }}</span></div>
              <p>{{ row.reviewContent }}</p>
              <div class="stars"><span v-for="n in row.rating || 5" :key="n">★</span></div>
              <el-alert v-if="row.reviewReply" :title="`商家回复：${row.reviewReply}`" type="success" :closable="false" />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" @click="openReply(row)">回复</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="replyVisible" title="回复评价" width="520px">
      <el-input v-model="replyText" type="textarea" :rows="5" placeholder="请输入商家回复" />
      <template #footer>
        <el-button @click="replyVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReply">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";
import { loadOrderReviews, replyOrderReview } from "@/use-cases/order.uc";
import type { OrderDTO } from "@/api";
import { ApiError } from "@/api";

const loading = ref(false);
const list = ref<OrderDTO[]>([]);
const nickname = ref("");
const productName = ref("");
const replyVisible = ref(false);
const replyText = ref("感谢您的认可，我们会继续保持品质和服务。");
const current = ref<OrderDTO | null>(null);

const filtered = computed(() => list.value.filter((row) => {
  const product = row.items?.[0]?.productName || "";
  return (!productName.value || product.includes(productName.value)) && (!nickname.value || "商城用户".includes(nickname.value));
}));

async function load() {
  loading.value = true;
  try { list.value = await loadOrderReviews(); }
  catch (e) { ElMessage.error(e instanceof ApiError ? e.message : "加载失败"); }
  finally { loading.value = false; }
}

function openReply(row: OrderDTO) {
  current.value = row;
  replyText.value = row.reviewReply || "感谢您的认可，我们会继续保持品质和服务。";
  replyVisible.value = true;
}

async function submitReply() {
  if (!current.value) return;
  try {
    await replyOrderReview(current.value.id, replyText.value);
    ElMessage.success("已回复");
    replyVisible.value = false;
    await load();
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "回复失败");
  }
}

load();
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 12px; }
.card-head { display: flex; justify-content: space-between; align-items: center; gap: 18px; }
.filters { display: flex; gap: 12px; width: 620px; }
.user-cell { display: flex; align-items: center; gap: 10px; }
.avatar { width: 48px; height: 48px; border-radius: 50%; background: #2f95bd; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; }
.goods { display: flex; align-items: center; gap: 14px; }
.cover { width: 72px; height: 72px; border-radius: 6px; background: #d8d8d8; display: flex; align-items: center; justify-content: center; color: #777; overflow: hidden; flex: 0 0 72px; }
.empty-cover { background: #d8d8d8; }
.comment-head { display: flex; justify-content: space-between; color: #777; background: #eee; padding: 8px 10px; margin-bottom: 10px; }
.comment p { margin: 0 0 10px; color: #333; }
.stars { color: #f7b733; font-size: 20px; margin-bottom: 10px; }
@media (max-width: 900px) {
  .card-head { align-items: flex-start; flex-direction: column; }
  .filters { width: 100%; flex-direction: column; }
}
</style>
