<template>
  <div>
    <div class="banner">🎉 Smart_Shopping_Mall 智能购物商城 · 全场包邮 · AI 帮你挑好物</div>
    <div class="cats">
      <button v-for="c in categories" :key="c" :class="['cat', { on: active === c }]" @click="active = c">{{ c }}</button>
    </div>
    <div class="grid">
      <router-link v-for="p in list" :key="p.id" :to="`/product/${p.id}`" class="card">
        <div class="cover">{{ p.cover }}</div>
        <div class="name">{{ p.name }}</div>
        <div class="row"><span class="price">¥{{ p.price }}</span><span class="sales">已售 {{ p.sales }}</span></div>
      </router-link>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";
import { products, categories } from "@/api/mock";
const active = ref("全部");
const list = computed(() => active.value === "全部" ? products : products.filter(p => p.category === active.value));
</script>
<style scoped>
.banner { background: linear-gradient(135deg,#ff7a45,#ff4d4f); color:#fff; padding: 20px 24px; border-radius: 10px; font-size: 16px; font-weight: 600; margin-bottom: 18px; }
.cats { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
.cat { border: 1px solid #ddd; background: #fff; padding: 6px 18px; border-radius: 18px; cursor: pointer; font-size: 14px; }
.cat.on { background: #ff4d4f; color: #fff; border-color: #ff4d4f; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.card { background: #fff; border-radius: 10px; overflow: hidden; transition: transform .15s, box-shadow .15s; }
.card:hover { transform: translateY(-3px); box-shadow: 0 6px 18px rgba(0,0,0,.12); }
.cover { height: 140px; display: flex; align-items: center; justify-content: center; font-size: 64px; background: #fafafa; }
.name { padding: 10px 12px 4px; font-size: 14px; height: 44px; overflow: hidden; }
.row { padding: 0 12px 12px; display: flex; justify-content: space-between; align-items: center; }
.price { color: #ff4d4f; font-size: 18px; font-weight: 700; }
.sales { color: #999; font-size: 12px; }
</style>