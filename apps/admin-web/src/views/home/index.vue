<template>
  <div>
    <div class="page-title">首页</div>
    <div class="stat-row">
      <div v-for="s in stats" :key="s.label" class="stat-card">
        <div class="stat-icon" :style="{background:s.color}">{{ s.icon }}</div>
        <div class="stat-body">
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-val">{{ s.value }}</div>
          <div class="stat-sub">{{ s.sub }} {{ s.trend }}</div>
        </div>
      </div>
    </div>
    <div class="charts-row">
      <div class="chart-card">
        <div class="card-title">近七日销售数据</div>
        <LineChart :days="days" :vals="salesAmt" :vals2="salesQty" />
        <div class="legend"><span class="dot blue"/>金额(元) <span class="dot green"/>数量(单)</div>
      </div>
      <div class="chart-card">
        <div class="card-title">近七日退款数据</div>
        <LineChart :days="days" :vals="refundAmt" :vals2="refundQty" />
        <div class="legend"><span class="dot blue"/>金额(元) <span class="dot green"/>数量(单)</div>
      </div>
    </div>
    <div class="bottom-row">
      <div class="table-card wide">
        <div class="card-title">待发货信息</div>
        <table>
          <thead><tr><th>时间</th><th>订单号</th><th>买家</th><th>状态</th><th>商品</th><th>数量</th><th>实付</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="o in pendingOrders" :key="o.no">
              <td>{{ o.time }}</td><td class="small">{{ o.no }}</td><td>{{ o.buyer }}</td>
              <td><span class="tag red">{{ o.status }}</span></td>
              <td class="product-name">{{ o.product }}</td>
              <td>x{{ o.qty }}</td><td>{{ o.price }}</td>
              <td><button class="btn-ship">确认发货</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-card">
        <div class="card-title">库存预警</div>
        <table>
          <thead><tr><th>商品</th><th>库存</th></tr></thead>
          <tbody>
            <tr v-for="s in lowStock" :key="s.id">
              <td class="product-name">{{ s.name }}</td>
              <td><span :class="s.stock===0?'tag red':'tag orange'">{{ s.stock }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import LineChart from "./LineChart.vue";
import { useDashboard } from "@/composables/useDashboard";
const { stats, days, salesAmt, salesQty, refundAmt, refundQty, pendingOrders, lowStock } = useDashboard();
</script>
<style scoped>
.page-title{font-size:16px;font-weight:600;margin-bottom:16px;color:#333;}
.stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:16px;}
.stat-card{background:#fff;border-radius:6px;padding:16px;display:flex;gap:14px;align-items:center;box-shadow:0 1px 4px rgba(0,0,0,.08);}
.stat-icon{width:48px;height:48px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;}
.stat-label{font-size:13px;color:#888;margin-bottom:4px;}
.stat-val{font-size:22px;font-weight:700;}
.stat-sub{font-size:12px;color:#aaa;margin-top:2px;}
.charts-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;}
.chart-card{background:#fff;border-radius:6px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,.08);}
.card-title{font-size:14px;font-weight:600;margin-bottom:12px;}
.legend{font-size:12px;color:#888;display:flex;gap:12px;margin-top:6px;}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px;}
.dot.blue{background:#1890ff;}.dot.green{background:#52c41a;}
.bottom-row{display:grid;grid-template-columns:2fr 1fr;gap:16px;}
.table-card{background:#fff;border-radius:6px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,.08);overflow:auto;}
table{width:100%;border-collapse:collapse;font-size:13px;}
th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #f0f0f0;}
th{color:#888;font-weight:500;background:#fafafa;}
.small{font-size:11px;color:#aaa;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.product-name{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.tag{padding:2px 8px;border-radius:3px;font-size:12px;}
.tag.red{background:#fff1f0;color:#cf1322;}
.tag.orange{background:#fff7e6;color:#d46b08;}
.btn-ship{background:#1890ff;color:#fff;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;}
.btn-ship:hover{background:#096dd9;}
</style>