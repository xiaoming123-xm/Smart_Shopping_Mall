import { computed } from "vue";
const props = defineProps();
const W = 560, H = 120, pad = 20;
function xOf(i) { return pad + i * (W - pad * 2) / (props.days.length - 1); }
function yOf(v, max) { return (H - 16) - v / (max || 1) * (H - 30); }
const pts = computed(() => {
    const mx = Math.max(...props.vals);
    return props.vals.map((v, i) => `${xOf(i)},${yOf(v, mx)}`).join(" ");
});
const pts2 = computed(() => {
    if (!props.vals2)
        return "";
    const mx = Math.max(...props.vals2, 1);
    return props.vals2.map((v, i) => `${xOf(i)},${yOf(v, mx)}`).join(" ");
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    viewBox: (`0 0 ${__VLS_ctx.W} ${__VLS_ctx.H}`),
    ...{ class: "chart" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.polyline)({
    points: (__VLS_ctx.pts),
    fill: "none",
    stroke: "#1890ff",
    'stroke-width': "2",
});
if (__VLS_ctx.pts2) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.polyline)({
        points: (__VLS_ctx.pts2),
        fill: "none",
        stroke: "#52c41a",
        'stroke-width': "2",
    });
}
for (const [d, i] of __VLS_getVForSourceType((__VLS_ctx.days))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.g, __VLS_intrinsicElements.g)({
        key: (i),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.text, __VLS_intrinsicElements.text)({
        x: (__VLS_ctx.xOf(i)),
        y: (__VLS_ctx.H - 2),
        'text-anchor': "middle",
        'font-size': "9",
        fill: "#999",
    });
    (d.slice(5));
}
/** @type {__VLS_StyleScopedClasses['chart']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            W: W,
            H: H,
            xOf: xOf,
            pts: pts,
            pts2: pts2,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
