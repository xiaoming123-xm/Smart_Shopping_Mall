// 模拟数据层：复刻视频项目的商品/分类结构，前端 demo 用本地 mock 代替后端接口。
// 真实接入时，这里改为调用 packages/api-client，对接 mall-catalog / mall-order 等后端模块。
export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  cost: number;        // 成本字段（呼应文档：库存成本与资金占用）
  stock: number;
  sales: number;
  cover: string;       // emoji 占位封面
  desc: string;
}

export const categories = ["全部", "数码", "家居", "服饰", "食品"];

export const products: Product[] = [
  { id: 1, name: "无线蓝牙耳机 Pro", category: "数码", price: 299, cost: 150, stock: 120, sales: 860, cover: "🎧", desc: "主动降噪，30 小时续航，低延迟游戏模式。" },
  { id: 2, name: "机械键盘 87 键", category: "数码", price: 459, cost: 220, stock: 64, sales: 530, cover: "⌨️", desc: "热插拔轴体，RGB 背光，PBT 键帽。" },
  { id: 3, name: "智能手表 S8", category: "数码", price: 1299, cost: 700, stock: 35, sales: 410, cover: "⌚", desc: "血氧心率监测，独立通话，多运动模式。" },
  { id: 4, name: "北欧实木餐桌", category: "家居", price: 1880, cost: 1100, stock: 18, sales: 96, cover: "🪑", desc: "白橡木材质，1.4 米，可坐 4-6 人。" },
  { id: 5, name: "全棉四件套", category: "家居", price: 359, cost: 160, stock: 200, sales: 1230, cover: "🛏️", desc: "100% 长绒棉，亲肤透气，多色可选。" },
  { id: 6, name: "纯棉圆领 T 恤", category: "服饰", price: 89, cost: 35, stock: 500, sales: 3400, cover: "👕", desc: "230g 厚磅，不易变形，男女同款。" },
  { id: 7, name: "轻薄羽绒服", category: "服饰", price: 599, cost: 280, stock: 80, sales: 220, cover: "🧥", desc: "90 白鸭绒，可机洗，便携收纳。" },
  { id: 8, name: "云南普洱茶饼", category: "食品", price: 168, cost: 70, stock: 150, sales: 640, cover: "🍵", desc: "古树原料，357g 标准饼，越陈越香。" },
  { id: 9, name: "进口混合坚果", category: "食品", price: 79, cost: 40, stock: 320, sales: 2100, cover: "🥜", desc: "每日一袋，6 种坚果，独立包装。" },
];

export function getProduct(id: number) {
  return products.find((p) => p.id === id);
}