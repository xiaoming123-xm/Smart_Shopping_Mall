<template>
  <div class="home">
    <section class="hero-grid">
      <aside class="category-panel">
        <div v-for="group in categoryGroups" :key="group.title" class="cat-group">
          <h3>{{ group.title }}</h3>
          <p>{{ group.items }}</p>
        </div>
      </aside>

      <router-link v-if="featured" :to="`/product/${featured.id}`" class="hero">
        <img :src="featured.cover" :alt="featured.name" />
        <div class="hero-caption">
          <h2>{{ featured.name }}</h2>
          <div class="dots"><span v-for="n in 5" :key="n" :class="{ on: n === 1 }" /></div>
        </div>
      </router-link>

      <div class="recommend">
        <router-link v-for="p in sideProducts" :key="p.id" :to="`/product/${p.id}`" class="mini">
          <img :src="p.cover" :alt="p.name" />
          <h3>{{ p.name }}</h3>
          <div><b>¥{{ money(p.price) }}</b><span>{{ p.buyers }}人购买</span></div>
        </router-link>
      </div>
    </section>

    <section class="hot">
      <h2>热门商品</h2>
      <div class="line" />
      <div class="hot-grid">
        <router-link v-for="p in products" :key="p.id" :to="`/product/${p.id}`" class="card">
          <img :src="p.cover" :alt="p.name" />
          <h3>{{ p.name }}</h3>
          <div class="meta"><b>¥{{ money(p.price) }}</b><span>{{ p.buyers }}人购买</span></div>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { Product } from "@/api/mock";
import { listProducts } from "@/api/mall";

const products = ref<Product[]>([]);
const featured = computed(() => products.value[0]);
const sideProducts = computed(() => products.value.slice(1, 5));
const money = (n: number) => Number(n).toFixed(2);
const categoryGroups = [
  { title: "数码家电", items: "手机通讯　电脑办公　数码影音　家用电器" },
  { title: "服装鞋帽", items: "女装　男装　运动户外　鞋靴箱包　内衣配饰" },
  { title: "美妆个护", items: "美妆护肤　个人护理　母婴用品　香水彩妆" },
  { title: "家居生活", items: "家具家装　家居家纺　厨具餐具　收纳清洁" },
  { title: "食品生鲜", items: "生鲜食品　休闲食品　酒水饮料　粮油调味" },
  { title: "文体娱乐", items: "图书文娱　运动健身　玩具乐器　办公设备" },
  { title: "其他", items: "在线课程　软件服务　会员服务　游戏点卡" },
];

onMounted(async () => {
  products.value = await listProducts();
});
</script>

<style scoped>
.home { display: flex; flex-direction: column; gap: 28px; }
.hero-grid { display: grid; grid-template-columns: 260px minmax(360px, 1fr) 430px; gap: 22px; align-items: stretch; }
.category-panel { background: #f7f7f7; padding: 18px 20px; display: flex; flex-direction: column; justify-content: space-between; }
.cat-group h3 { margin: 0 0 5px; font-size: 18px; color: #333; }
.cat-group p { margin: 0 0 14px; color: #222; line-height: 1.45; font-size: 14px; }
.hero { min-height: 420px; position: relative; overflow: hidden; border-radius: 4px; background: #eee; }
.hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
.hero-caption { position: absolute; inset: auto 0 0; background: linear-gradient(transparent, rgba(0,0,0,.68)); color: #fff; padding: 80px 22px 18px; }
.hero-caption h2 { margin: 0 0 12px; font-size: 22px; }
.dots { display: flex; gap: 10px; }
.dots span { width: 12px; height: 12px; border-radius: 50%; background: rgba(255,255,255,.75); }
.dots span.on { background: #fff; }
.recommend { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
.mini, .card { color: #222; }
.mini img { width: 100%; height: 170px; object-fit: cover; border-radius: 4px; background: #f5f5f5; }
.mini h3, .card h3 { margin: 9px 0 8px; font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mini div, .meta { display: flex; justify-content: space-between; align-items: center; color: #999; }
.mini b, .meta b { color: #d61f3c; font-size: 18px; }
.hot h2 { margin: 0; font-size: 24px; }
.line { width: 58px; height: 4px; background: #ef5d67; margin: 12px 0 22px; }
.hot-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 22px; }
.card img { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; border-radius: 5px; background: #f5f5f5; }
@media (max-width: 1120px) {
  .hero-grid { grid-template-columns: 220px 1fr; }
  .recommend { grid-column: 1 / -1; grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 780px) {
  .hero-grid { grid-template-columns: 1fr; }
  .category-panel { display: none; }
  .recommend, .hot-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
