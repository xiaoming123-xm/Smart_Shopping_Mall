<template>
  <svg :viewBox="`0 0 ${W} ${H}`" class="chart">
    <polyline :points="pts" fill="none" stroke="#1890ff" stroke-width="2"/>
    <polyline v-if="pts2" :points="pts2" fill="none" stroke="#52c41a" stroke-width="2"/>
    <g v-for="(d,i) in days" :key="i">
      <text :x="xOf(i)" :y="H-2" text-anchor="middle" font-size="9" fill="#999">{{ d.slice(5) }}</text>
    </g>
  </svg>
</template>
<script setup lang="ts">
import { computed } from "vue";
const props = defineProps<{days:string[];vals:number[];vals2?:number[];}>();
const W=560, H=120, pad=20;
function xOf(i:number){ return pad + i*(W-pad*2)/(props.days.length-1); }
function yOf(v:number,max:number){ return (H-16) - v/(max||1)*(H-30); }
const pts  = computed(()=>{
  const mx=Math.max(...props.vals);
  return props.vals.map((v,i)=>`${xOf(i)},${yOf(v,mx)}`).join(" ");
});
const pts2 = computed(()=>{
  if(!props.vals2) return "";
  const mx=Math.max(...props.vals2,1);
  return props.vals2.map((v,i)=>`${xOf(i)},${yOf(v,mx)}`).join(" ");
});
</script>
<style scoped>.chart{width:100%;height:100px;}</style>