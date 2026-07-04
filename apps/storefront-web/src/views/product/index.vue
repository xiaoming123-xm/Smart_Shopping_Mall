<template>
  <div v-if="p" class="product-page">
    <section class="gallery">
      <div class="thumbs">
        <button v-for="img in p.images" :key="img" :class="{ on: activeImage === img }" @click="activeImage = img">
          <img :src="img" :alt="p.name" />
        </button>
      </div>
      <img class="main-img" :src="activeImage" :alt="p.name" />
    </section>

    <section class="info">
      <h1>{{ p.name }}</h1>
      <div class="price">¥{{ money(p.price) }}</div>
      <div class="label">颜色分类</div>
      <div class="variants">
        <button v-for="v in p.variants" :key="v.label" :class="{ on: selectedVariant === v.label }" @click="selectVariant(v.label, v.image)">
          <img :src="v.image" :alt="v.label" />
          <span>{{ v.label }}</span>
        </button>
      </div>
      <div class="stock">库存 <b>{{ p.stock }}</b></div>
      <div class="label">数量</div>
      <div class="qty">
        <button @click="qty = Math.max(1, qty - 1)">−</button>
        <span>{{ qty }}</span>
        <button @click="qty++">＋</button>
      </div>
      <div class="actions">
        <button class="add" @click="addCart">加入购物车</button>
        <button class="buy" @click="buyNow">立即购买</button>
      </div>
      <p v-if="tip" class="tip">{{ tip }}</p>
      <ul class="detail">
        <li v-for="line in p.detail" :key="line">{{ line }}</li>
      </ul>
    </section>

    <section class="below">
      <div class="tabs"><button class="on">用户评价</button><button>图文详情</button></div>
      <div class="review-empty">暂无评价。下单、发货、收货后可以提交五星好评。</div>
    </section>
  </div>
  <div v-else class="empty">商品不存在</div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { Product } from "@/api/mock";
import { getProductDetail } from "@/api/mall";
import { useCartStore } from "@/stores/cart";

const route = useRoute();
const router = useRouter();
const cart = useCartStore();
const p = ref<Product>();
const qty = ref(1);
const tip = ref("");
const activeImage = ref("");
const selectedVariant = ref("");
const money = (n: number) => Number(n).toFixed(2);

async function load() {
  p.value = await getProductDetail(Number(route.params.id));
  await nextTick();
  activeImage.value = p.value?.images[0] || p.value?.cover || "";
  selectedVariant.value = p.value?.variants[0]?.label || "";
}

function selectVariant(label: string, image: string) {
  selectedVariant.value = label;
  activeImage.value = image;
}

function addCart() {
  if (!p.value) return;
  cart.add(p.value, qty.value);
  tip.value = "已加入购物车";
  setTimeout(() => tip.value = "", 1500);
}

function buyNow() {
  if (!p.value) return;
  cart.add(p.value, qty.value);
  router.push("/cart");
}

onMounted(load);
watch(() => route.params.id, load);
</script>

<style scoped>
.product-page { display: grid; grid-template-columns: minmax(420px, 650px) 1fr; gap: 30px; background: #fff; padding: 28px; border-radius: 4px; }
.gallery { display: grid; grid-template-columns: 92px 1fr; gap: 18px; }
.thumbs { display: flex; flex-direction: column; gap: 12px; }
.thumbs button { width: 78px; height: 78px; padding: 0; border: 2px solid transparent; background: #f5f5f5; border-radius: 5px; overflow: hidden; cursor: pointer; }
.thumbs button.on { border-color: #ef5d67; }
.thumbs img, .main-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.main-img { height: 560px; background: #f5f5f5; border-radius: 2px; }
.info h1 { margin: 0 0 22px; font-size: 24px; color: #222; }
.price { color: #d61f3c; font-size: 34px; font-weight: 700; margin-bottom: 24px; }
.label { font-size: 16px; font-weight: 700; margin: 18px 0 10px; color: #555; }
.variants { display: flex; flex-wrap: wrap; gap: 12px; }
.variants button { display: inline-flex; align-items: center; gap: 8px; height: 46px; border: 1px solid #e2e2e2; background: #fff; border-radius: 6px; padding: 0 12px 0 6px; cursor: pointer; }
.variants button.on { border-color: #ef5d67; box-shadow: 0 0 0 1px #ef5d67 inset; }
.variants img { width: 34px; height: 34px; object-fit: cover; border-radius: 4px; }
.stock { margin-top: 28px; color: #555; font-size: 17px; }
.stock b { color: #d61f3c; margin-left: 8px; }
.qty { display: inline-grid; grid-template-columns: 44px 78px 44px; height: 38px; border: 1px solid #e5e7eb; }
.qty button { border: none; background: #f8fafc; font-size: 18px; cursor: pointer; }
.qty span { display: flex; align-items: center; justify-content: center; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; }
.actions { display: grid; grid-template-columns: 110px 1fr; margin-top: 20px; border-radius: 7px; overflow: hidden; max-width: 460px; }
.actions button { height: 52px; border: none; color: #fff; font-size: 16px; cursor: pointer; }
.add { background: #ffa000; }
.buy { background: #ff7300; }
.tip { color: #35a854; margin-top: 12px; }
.detail { margin: 22px 0 0; padding-left: 18px; color: #666; line-height: 1.9; }
.below { grid-column: 1 / -1; border-top: 1px solid #e5e7eb; margin-top: 8px; padding-top: 12px; }
.tabs { display: flex; gap: 32px; border-bottom: 1px solid #e5e7eb; }
.tabs button { border: none; background: transparent; height: 42px; font-size: 15px; cursor: pointer; }
.tabs .on { color: #ef5d67; border-bottom: 2px solid #ef5d67; }
.review-empty { text-align: center; padding: 60px; color: #999; }
.empty { text-align: center; padding: 80px; color: #999; }
@media (max-width: 960px) {
  .product-page { grid-template-columns: 1fr; padding: 16px; }
  .gallery { grid-template-columns: 1fr; }
  .thumbs { flex-direction: row; order: 2; overflow-x: auto; }
  .main-img { height: min(78vw, 520px); }
}
</style>
