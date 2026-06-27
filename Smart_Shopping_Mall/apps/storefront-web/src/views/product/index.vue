<template>
  <div v-if="p" class="detail">
    <div class="cover">{{ p.cover }}</div>
    <div class="info">
      <h1>{{ p.name }}</h1>
      <p class="desc">{{ p.desc }}</p>
      <div class="price">¥{{ p.price }}</div>
      <div class="meta">分类：{{ p.category }} ｜ 库存：{{ p.stock }} ｜ 已售：{{ p.sales }}</div>
      <div class="qty">
        数量：
        <button @click="qty = Math.max(1, qty - 1)">-</button>
        <span>{{ qty }}</span>
        <button @click="qty++">+</button>
      </div>
      <div class="actions">
        <button class="add" @click="addCart">加入购物车</button>
        <button class="buy" @click="buyNow">立即购买</button>
      </div>
      <p v-if="tip" class="tip">{{ tip }}</p>
    </div>
  </div>
  <div v-else class="empty">商品不存在</div>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getProduct } from "@/api/mock";
import { useCartStore } from "@/stores/cart";
const route = useRoute();
const router = useRouter();
const cart = useCartStore();
const p = computed(() => getProduct(Number(route.params.id)));
const qty = ref(1);
const tip = ref("");
function addCart() {
  if (p.value) { cart.add(p.value, qty.value); tip.value = "已加入购物车 ✓"; setTimeout(() => tip.value = "", 1500); }
}
function buyNow() {
  if (p.value) { cart.add(p.value, qty.value); router.push("/cart"); }
}
</script>
<style scoped>
.detail { background: #fff; border-radius: 12px; padding: 32px; display: flex; gap: 32px; }
.cover { width: 280px; height: 280px; background: #fafafa; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 120px; flex-shrink: 0; }
.info { flex: 1; }
h1 { font-size: 24px; margin-bottom: 12px; }
.desc { color: #666; line-height: 1.6; margin-bottom: 16px; }
.price { color: #ff4d4f; font-size: 32px; font-weight: 700; margin-bottom: 12px; }
.meta { color: #999; font-size: 13px; margin-bottom: 20px; }
.qty { margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
.qty button { width: 30px; height: 30px; border: 1px solid #ddd; background: #fff; cursor: pointer; border-radius: 4px; }
.actions { display: flex; gap: 14px; }
.add { background: #ffece8; color: #ff4d4f; border: 1px solid #ff4d4f; padding: 12px 30px; border-radius: 24px; cursor: pointer; font-size: 15px; }
.buy { background: #ff4d4f; color: #fff; border: none; padding: 12px 36px; border-radius: 24px; cursor: pointer; font-size: 15px; }
.tip { color: #52c41a; margin-top: 14px; }
.empty { text-align: center; padding: 80px; color: #999; }
</style>