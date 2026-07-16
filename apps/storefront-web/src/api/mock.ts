// 用户端演示数据：用于本地无后端时完整复刻商品、下单、支付、AI 导购闭环。
export interface ProductVariant {
  label: string;
  image: string;
  skuId?: number;
  skuCode?: string;
}

export interface Product {
  id: number;
  skuId?: number;
  skuCode?: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  sales: number;
  buyers: number;
  cover: string;
  images: string[];
  variants: ProductVariant[];
  desc: string;
  tags: string[];
  detail: string[];
}

function svgImage(title: string, bg: string, stroke: string, body: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
    <rect width="640" height="640" fill="${bg}"/>
    <rect x="72" y="72" width="496" height="496" rx="18" fill="#f8f8f8" opacity=".72"/>
    <g fill="none" stroke="${stroke}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">${body}</g>
    <text x="56" y="594" font-family="Arial,'Microsoft YaHei',sans-serif" font-size="30" font-weight="700" fill="#333">${title}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const bird01 = svgImage(
  "真迹01",
  "#d7d3ca",
  "#333",
  `<path d="M205 235c45 12 68 52 96 80 66-58 120-86 164-64-30 45-57 82-75 133 40 13 67 33 91 58-68 8-119-3-168-29-41 37-97 45-154 20 40-21 61-49 71-87-40-27-64-62-25-111z"/>
   <path d="M228 212c-18-19-16-42 2-57 20-17 55-12 73 10"/>
   <path d="M178 152l22 16M213 124l6 28M261 123l-12 29M156 196l31-3M271 318l-28 61M340 331l9 70M210 445l-30 30M250 463l-8 38"/>`
);
const bird02 = svgImage(
  "真迹02",
  "#d6d7d2",
  "#3a3a3a",
  `<path d="M166 354c72-58 152-70 236-26"/>
   <path d="M124 296c28-22 64-22 89 4M188 277c35-35 86-43 133-25M332 247c70-12 122 8 160 62"/>
   <path d="M141 398c84 28 167 30 250 7M474 326c15 30 17 67 4 108"/>
   <circle cx="218" cy="343" r="5"/><circle cx="330" cy="320" r="5"/><circle cx="430" cy="364" r="5"/>`
);
const bird03 = svgImage(
  "真迹03",
  "#dad7ce",
  "#333",
  `<path d="M196 190c48 8 76 50 82 94"/>
   <path d="M281 287c56-23 113-18 171 17-45 16-79 45-104 86"/>
   <path d="M188 349c54 63 134 72 221 29"/>
   <path d="M225 397l-38 78M332 404l22 82M181 233c-18-24-15-52 8-67"/>
   <path d="M145 168l29 11M185 126l12 34M234 130l-13 33"/>`
);
const bird04 = svgImage(
  "真迹04",
  "#d2d1cb",
  "#2f2f2f",
  `<path d="M190 255c82-22 155-9 220 40"/>
   <path d="M155 335c67 72 169 83 289 23"/>
   <path d="M311 282c29-65 76-105 141-120 1 65-15 119-47 161"/>
   <path d="M202 408l-31 70M343 410l16 75M145 246c-18-23-12-50 10-62"/>
   <path d="M107 191l34 3M148 146l21 34M202 132l-10 41"/>`
);
const bird05 = svgImage(
  "真迹05",
  "#dedbd2",
  "#363636",
  `<path d="M162 248c56 16 93 45 111 87"/>
   <path d="M282 337c60-72 122-102 187-84-20 49-44 92-73 130 43 12 79 34 108 67-91 4-160-10-209-43-50 41-108 51-174 29 42-26 69-58 41-188z"/>
   <path d="M188 218c-12-28 4-55 35-61 25-5 50 6 69 32"/>
   <path d="M156 147l30 24M211 120l5 37M267 131l-19 32M292 410l-18 82M373 414l23 75"/>`
);

const shoe = svgImage(
  "运动鞋",
  "#eef5f4",
  "#d63535",
  `<path d="M122 390c95 8 180-3 258-39 36 32 85 50 144 54 18 2 30 17 24 34-7 20-23 31-48 33H154c-47 0-69-23-32-82z"/>
   <path d="M207 334c42 22 86 28 132 17M250 307l36 33M298 292l42 39M363 288l40 37"/>`
);
const sweater = svgImage(
  "毛衣",
  "#f4f1ed",
  "#7b8ba8",
  `<path d="M240 142h160l58 74 68 23-48 107-53-17v176H215V329l-53 17-48-107 68-23 58-74z"/>
   <path d="M248 149c29 48 115 51 144 0M216 329h210M247 469h143"/>`
);
const necklace = svgImage(
  "项链",
  "#f7eee8",
  "#222",
  `<path d="M210 108c26 108 192 108 220 0"/>
   <path d="M320 236l74 46-25 83h-98l-25-83 74-46z"/>
   <path d="M320 250l23 71-60-44h74l-60 44z"/>`
);

export const categories = ["全部", "数码家电", "服装鞋帽", "文体娱乐", "其他"];

export const products: Product[] = [
  {
    id: 1,
    name: "用户真迹 白鸟朝凤图 珍藏版",
    category: "文体娱乐",
    price: 200,
    cost: 28,
    stock: 997,
    sales: 1,
    buyers: 1,
    cover: bird01,
    images: [bird01, bird02, bird03, bird04, bird05],
    variants: [
      { label: "真迹01", image: bird01 },
      { label: "真迹02", image: bird02 },
      { label: "真迹03", image: bird03 },
      { label: "真迹04", image: bird04 },
      { label: "真迹05", image: bird05 },
    ],
    desc: "纸面手绘收藏款，适合作为演示商品打通推荐、下单、支付、发货、评价全链路。",
    tags: ["品质之选", "AI 推荐", "可发货"],
    detail: ["颜色分类：真迹01", "发货地：江苏省连云港市", "服务：支持模拟退款、物流查询、订单评价"],
  },
  {
    id: 2,
    name: "安踏星云红色运动鞋",
    category: "服装鞋帽",
    price: 150,
    cost: 82,
    stock: 120,
    sales: 0,
    buyers: 0,
    cover: shoe,
    images: [shoe],
    variants: [{ label: "红色/42", image: shoe }],
    desc: "轻量缓震跑步鞋，适合日常通勤和运动。",
    tags: ["运动", "热卖"],
    detail: ["尺码：42", "鞋面：网布", "服务：七天无理由模拟售后"],
  },
  {
    id: 3,
    name: "女大童加绒加厚毛衣",
    category: "服装鞋帽",
    price: 39.9,
    cost: 18,
    stock: 66,
    sales: 0,
    buyers: 0,
    cover: sweater,
    images: [sweater],
    variants: [{ label: "蓝色/L", image: sweater }],
    desc: "柔软保暖，加绒内里，秋冬基础款。",
    tags: ["保暖", "库存预警"],
    detail: ["颜色：蓝色", "尺码：L", "适用季节：秋冬"],
  },
  {
    id: 4,
    name: "恋爱星球项链高级款",
    category: "其他",
    price: 59.9,
    cost: 21,
    stock: 81,
    sales: 1,
    buyers: 1,
    cover: necklace,
    images: [necklace],
    variants: [{ label: "粉色星球", image: necklace }],
    desc: "星球吊坠设计，适合礼物场景。",
    tags: ["礼物", "饰品"],
    detail: ["材质：合金", "包装：礼盒", "服务：礼品推荐"],
  },
];

export function getProduct(id: number) {
  return products.find((p) => p.id === id);
}
