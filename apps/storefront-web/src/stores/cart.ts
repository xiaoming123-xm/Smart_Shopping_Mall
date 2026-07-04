import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Product } from "@/api/mock";

export interface CartItem { product: Product; qty: number; }

export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>([]);
  const count = computed(() => items.value.reduce((s, i) => s + i.qty, 0));
  const total = computed(() => items.value.reduce((s, i) => s + i.qty * i.product.price, 0));

  function add(product: Product, qty = 1) {
    const found = items.value.find((i) => i.product.id === product.id);
    if (found) found.qty += qty;
    else items.value.push({ product, qty });
  }
  function setQty(id: number, qty: number) {
    const it = items.value.find((i) => i.product.id === id);
    if (it) it.qty = Math.max(1, qty);
  }
  function remove(id: number) { items.value = items.value.filter((i) => i.product.id !== id); }
  function clear() { items.value = []; }

  return { items, count, total, add, setQty, remove, clear };
});