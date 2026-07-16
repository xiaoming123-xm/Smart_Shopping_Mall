<template>
  <div class="home">
    <section class="hero-grid">
      <aside class="category-panel">
        <router-link
          v-for="group in categoryGroups"
          :key="group.title"
          :to="categoryLink(group)"
          :class="['cat-group', { active: activeCategoryName === group.title }]"
        >
          <h3>{{ group.title }}</h3>
          <p>{{ group.items }}</p>
        </router-link>
      </aside>

      <router-link v-if="featured" :to="`/product/${featured.id}`" class="hero">
        <img :src="featured.cover" :alt="featured.name" />
        <div class="hero-caption">
          <h2>{{ featured.name }}</h2>
          <div class="dots"><span v-for="n in 5" :key="n" :class="{ on: n === 1 }" /></div>
        </div>
      </router-link>
      <div v-else class="hero empty-panel">暂无商品</div>

      <div class="recommend">
        <router-link v-for="p in sideProducts" :key="p.id" :to="`/product/${p.id}`" class="mini">
          <img :src="p.cover" :alt="p.name" />
          <h3>{{ p.name }}</h3>
          <div><b>¥{{ money(p.price) }}</b><span>{{ p.buyers }}人购买</span></div>
        </router-link>
        <div v-if="!sideProducts.length" class="empty-panel recommend-empty">你还没有添加商品</div>
      </div>
    </section>

    <section class="hot">
      <div class="section-title">
        <h2>{{ activeCategoryName ? `${activeCategoryName}商品` : "热门商品" }}</h2>
        <router-link v-if="activeCategoryName" to="/home" class="all-link">查看全部</router-link>
      </div>
      <div class="line" />
      <div v-if="products.length" class="hot-grid">
        <router-link v-for="p in products" :key="p.id" :to="`/product/${p.id}`" class="card">
          <img :src="p.cover" :alt="p.name" />
          <h3>{{ p.name }}</h3>
          <div class="meta"><b>¥{{ money(p.price) }}</b><span>{{ p.buyers }}人购买</span></div>
        </router-link>
      </div>
      <div v-else class="empty-panel hot-empty">当前分类暂无商品，可以先到后台商品管理添加。</div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import type { RouteLocationRaw } from "vue-router";
import type { Product } from "@/api/mock";
import { listCategoryTree, listProducts } from "@/api/mall";
import type { CategoryTreeDTO } from "@/api/mall";

interface CategoryGroup {
  title: string;
  items: string;
  id?: number;
}

const route = useRoute();
const products = ref<Product[]>([]);
const backendCategories = ref<CategoryTreeDTO[]>([]);
const featured = computed(() => products.value[0]);
const sideProducts = computed(() => products.value.slice(1, 5));
const activeCategoryName = computed(() => String(route.query.categoryName || ""));
const activeCategoryId = computed(() => Number(route.query.categoryId || 0) || undefined);
const resolvedCategoryId = computed(() => activeCategoryId.value || findCategoryId(activeCategoryName.value));
const money = (n: number) => Number(n).toFixed(2);
const baseCategoryGroups: CategoryGroup[] = [
  { title: "数码家电", items: "手机通讯、电脑办公、数码影音、家用电器" },
  { title: "服装鞋帽", items: "女装、男装、运动户外、鞋靴箱包、内衣配饰" },
  { title: "美妆个护", items: "美妆护肤、个人护理、母婴用品、香水彩妆" },
  { title: "家居生活", items: "家具家装、家居家纺、厨具餐具、收纳清洁" },
  { title: "食品生鲜", items: "生鲜食品、休闲食品、酒水饮料、粮油调味" },
  { title: "文体娱乐", items: "图书文娱、运动健身、玩具乐器、办公设备" },
  { title: "其他", items: "在线课程、软件服务、会员服务、游戏点卡" },
];
const categoryAliases: Record<string, string[]> = {
  数码家电: ["数码家电", "手机数码", "家用电器", "数码"],
  服装鞋帽: ["服装鞋帽", "服装鞋包", "服饰"],
  美妆个护: ["美妆个护", "美妆", "个护"],
  家居生活: ["家居生活", "家居"],
  食品生鲜: ["食品生鲜", "食品"],
  文体娱乐: ["文体娱乐", "文娱", "运动"],
  其他: ["其他"],
};

const categoryGroups = computed(() =>
  baseCategoryGroups.map((group) => ({
    ...group,
    id: findCategoryId(group.title),
  })),
);

function flattenCategories(categories: CategoryTreeDTO[]): CategoryTreeDTO[] {
  return categories.flatMap((category) => [category, ...flattenCategories(category.children || [])]);
}

function findCategoryId(title: string) {
  const aliases = categoryAliases[title] || [title];
  const categories = flattenCategories(backendCategories.value);
  return categories.find((category) => aliases.some((name) => category.name.includes(name) || name.includes(category.name)))?.id;
}

function categoryLink(group: CategoryGroup): RouteLocationRaw {
  return {
    path: "/home",
    query: group.id ? { categoryId: group.id, categoryName: group.title } : { categoryName: group.title },
  };
}

async function loadProducts() {
  products.value = await listProducts(resolvedCategoryId.value);
}

onMounted(async () => {
  backendCategories.value = await listCategoryTree();
  await loadProducts();
});

watch(() => [route.query.categoryId, route.query.categoryName, backendCategories.value.length], loadProducts);
</script>

<style scoped>
.home { display: flex; flex-direction: column; gap: 28px; }
.hero-grid { display: grid; grid-template-columns: 260px minmax(360px, 1fr) 430px; gap: 22px; align-items: stretch; }
.category-panel { background: #f7f7f7; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; }
.cat-group { display: block; padding: 8px; border-radius: 4px; color: #222; transition: background .15s ease, color .15s ease; }
.cat-group:hover, .cat-group.active { background: #fff; color: #d61f3c; }
.cat-group h3 { margin: 0 0 5px; font-size: 18px; color: inherit; }
.cat-group p { margin: 0 0 6px; color: #222; line-height: 1.45; font-size: 14px; }
.hero { min-height: 420px; position: relative; overflow: hidden; border-radius: 4px; background: #eee; }
.empty-panel { display: flex; align-items: center; justify-content: center; color: #999; background: #f7f7f7; border-radius: 4px; text-align: center; padding: 18px; }
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
.mini div, .meta, .section-title { display: flex; justify-content: space-between; align-items: center; color: #999; }
.mini b, .meta b { color: #d61f3c; font-size: 18px; }
.hot h2 { margin: 0; font-size: 24px; color: #222; }
.all-link { color: #d61f3c; font-size: 14px; }
.line { width: 58px; height: 4px; background: #ef5d67; margin: 12px 0 22px; }
.hot-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 22px; }
.recommend-empty { min-height: 170px; grid-column: 1 / -1; }
.hot-empty { min-height: 220px; }
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
