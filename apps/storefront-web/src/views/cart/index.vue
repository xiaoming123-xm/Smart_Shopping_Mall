<template>
  <div class="cart">
    <h2>购物车</h2>
    <div v-if="cart.items.length" class="list">
      <div v-for="it in cart.items" :key="it.product.id" class="item">
        <img class="cover" :src="it.product.cover" :alt="it.product.name" />
        <div class="name">{{ it.product.name }}</div>
        <div class="price">¥{{ it.product.price }}</div>
        <div class="qty">
          <button @click="cart.setQty(it.product.id, it.qty - 1)">-</button>
          <span>{{ it.qty }}</span>
          <button @click="cart.setQty(it.product.id, it.qty + 1)">+</button>
        </div>
        <div class="sub">¥{{ it.product.price * it.qty }}</div>
        <button class="del" @click="cart.remove(it.product.id)">删除</button>
      </div>
      <div class="bar">
        <span>合计：<b class="total">¥{{ cart.total }}</b></span>
        <button class="checkout" :disabled="loading" @click="doCheckout">
          {{ loading ? "提交中..." : `去结算（${cart.count}件）` }}
        </button>
      </div>
    </div>
    <div v-else class="empty">购物车是空的，<router-link to="/home">去逛逛</router-link></div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "@/stores/cart";
import { checkout } from "@/use-cases/checkout";

const cart = useCartStore();
const router = useRouter();
const loading = ref(false);

async function doCheckout() {
  loading.value = true;
  await checkout(router);
  loading.value = false;
}
</script>
<style scoped>
.cart { background: #fff; border-radius: 12px; padding: 24px; }
h2 { margin-bottom: 18px; }
.item { display: grid; grid-template-columns: 60px 1fr 90px 120px 90px 60px; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid #f0f0f0; }
.cover { width: 52px; height: 52px; object-fit: cover; border-radius: 6px; background: #f6f6f6; }
.price { color: #888; }
.qty { display: flex; align-items: center; gap: 8px; }
.qty button { width: 26px; height: 26px; border: 1px solid #ddd; background: #fff; cursor: pointer; border-radius: 4px; }
.sub { color: #ff4d4f; font-weight: 700; }
.del { background: none; border: none; color: #999; cursor: pointer; }
.del:hover { color: #ff4d4f; }
.bar { display: flex; justify-content: flex-end; align-items: center; gap: 24px; margin-top: 20px; }
.total { color: #ff4d4f; font-size: 24px; }
.checkout { background: #ff4d4f; color: #fff; border: none; padding: 12px 36px; border-radius: 24px; font-size: 16px; cursor: pointer; }
.checkout:disabled { opacity: .7; cursor: not-allowed; }
.empty { text-align: center; padding: 60px; color: #999; }
.empty a { color: #ff4d4f; }
</style>
