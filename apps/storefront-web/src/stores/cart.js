import { defineStore } from "pinia";
import { ref, computed } from "vue";
export const useCartStore = defineStore("cart", () => {
    const items = ref([]);
    const count = computed(() => items.value.reduce((s, i) => s + i.qty, 0));
    const total = computed(() => items.value.reduce((s, i) => s + i.qty * i.product.price, 0));
    function add(product, qty = 1) {
        const found = items.value.find((i) => i.product.id === product.id);
        if (found)
            found.qty += qty;
        else
            items.value.push({ product, qty });
    }
    function setQty(id, qty) {
        const it = items.value.find((i) => i.product.id === id);
        if (it)
            it.qty = Math.max(1, qty);
    }
    function remove(id) { items.value = items.value.filter((i) => i.product.id !== id); }
    function clear() { items.value = []; }
    return { items, count, total, add, setQty, remove, clear };
});
