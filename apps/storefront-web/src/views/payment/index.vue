<template>
  <div v-if="order" class="alipay-page">
    <div class="pay-logo"><span class="mark">支</span><b>支付宝</b><em>ALIPAY</em></div>
    <section class="order-strip">
      <div>
        <p>正在使用即时到账交易，交易将在 24 分钟后关闭，请及时付款。</p>
        <h2>{{ firstItemName }}</h2>
        <span>收款方：qlahij9146@sandbox.com</span>
      </div>
      <strong>{{ money(order.amount) }}<small>元</small></strong>
    </section>

    <section class="pay-box">
      <div class="pay-tabs">订单详情</div>
      <div class="qr-area">
        <h3>扫码支付</h3>
        <img class="qr" src="/images/payment/alipay-demo-qr.png" alt="支付宝支付二维码" />
        <p>使用手机支付宝扫码完成付款</p>
        <div class="links">手机支付宝下载 | 如何使用？</div>
      </div>
      <div class="login-area">
        <div class="login-title">
          <h3>登录支付宝账户付款</h3>
          <a>新用户注册</a>
        </div>
        <label>账户名：</label>
        <input placeholder="手机号/邮箱" />
        <label>支付密码：</label>
        <input type="password" placeholder="请输入账户的支付密码" />
        <button :disabled="paying || !order" @click="doPay">
          {{ paying ? "正在提交中..." : order.status === "PAID" ? "查看订单" : "下一步" }}
        </button>
      </div>
    </section>
  </div>
  <div v-else class="empty">订单不存在</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useOrderStore } from "@/stores/order";
import { payOrder } from "@/use-cases/payOrder";
import { syncOrdersFromBackend } from "@/use-cases/orderSync";

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const paying = ref(false);
const order = computed(() => orderStore.getOrder(String(route.params.orderId)));
const firstItemName = computed(() => order.value?.items[0]?.product.name || "EasyMall 智慧商城订单");
const money = (n: number) => Number(n).toFixed(2);

async function doPay() {
  if (!order.value || paying.value) return;
  if (order.value.status === "PAID") {
    router.push("/order");
    return;
  }
  paying.value = true;
  try {
    await payOrder(String(route.params.orderId), router);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "支付失败，请稍后重试";
    window.alert(msg);
  } finally {
    paying.value = false;
  }
}

onMounted(() => {
  syncOrdersFromBackend().catch(() => null);
});
</script>

<style scoped>
.alipay-page { max-width: 1040px; margin: 0 auto; color: #333; }
.pay-logo { height: 72px; display: flex; align-items: center; gap: 10px; font-size: 28px; }
.mark { width: 42px; height: 42px; border-radius: 6px; background: #14a8df; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; }
.pay-logo em { font-size: 12px; color: #555; font-style: normal; letter-spacing: 2px; align-self: center; margin-left: -8px; margin-top: 28px; }
.order-strip { background: #dcecff; border-bottom: 4px solid #9fc4e2; padding: 24px 36px; display: flex; justify-content: space-between; align-items: center; }
.order-strip p { margin: 0 0 16px; color: #4c6177; }
.order-strip h2 { margin: 0 0 10px; font-size: 20px; }
.order-strip span { color: #4c6177; }
.order-strip strong { color: #ff8200; font-size: 34px; }
.order-strip small { color: #333; font-size: 16px; margin-left: 4px; }
.pay-box { position: relative; min-height: 440px; border: 3px solid #9fb8ca; border-top: 0; background: #fff; display: grid; grid-template-columns: 45% 55%; padding: 72px 80px 56px; }
.pay-tabs { position: absolute; right: 28px; top: 0; transform: translateY(-100%); background: #80a9c9; color: #fff; padding: 10px 24px; }
.qr-area { text-align: center; border-right: 1px solid #e6e6e6; }
.qr-area h3, .login-area h3 { margin: 0 0 18px; font-size: 24px; font-weight: 500; }
.qr { width: 188px; height: 188px; margin: 0 auto 14px; display: block; object-fit: cover; border: 1px solid #eee; background: #fff; }
.links { color: #1686a8; margin-top: 6px; }
.login-area { padding-left: 80px; display: flex; flex-direction: column; }
.login-title { display: flex; align-items: center; gap: 24px; border-bottom: 2px solid #ddd; margin-bottom: 22px; }
.login-title a { color: #1686a8; font-size: 17px; }
.login-area label { margin: 12px 0 8px; font-size: 16px; }
.login-area input { height: 42px; border: 1px solid #cfcfcf; padding: 0 14px; font-size: 15px; }
.login-area button { height: 48px; margin-top: 26px; border: none; background: #00a8e8; color: #fff; font-size: 18px; cursor: pointer; border-radius: 2px; }
.login-area button:disabled { background: #9fc4d8; cursor: not-allowed; }
.empty { text-align: center; padding: 80px; color: #999; }
@media (max-width: 820px) {
  .pay-box { grid-template-columns: 1fr; padding: 32px 24px; }
  .qr-area { border-right: 0; border-bottom: 1px solid #eee; padding-bottom: 24px; }
  .login-area { padding: 24px 0 0; }
}
</style>
