Smart Shopping Mall
传统商城业务 + AI 增强能力的前后端分离项目，采用 Monorepo 工作区管理，后端基于 Spring Boot 模块化单体，前端使用 Vue3 管理后台。当前已完成商品、库存、订单、支付、系统管理等基础商城闭环，并扩展了选品中心和AI 内容生成两大增强能力。

特性
🧩 模块化后端：按业务域拆分为独立的 Maven 模块（商品、库存、订单、支付、AI、选品等），跨模块流程统一编排在 mall-application

🖥️ Vue3 管理后台：Element Plus UI，TypeScript，Pinia 状态管理，Vite 构建

🔍 选品中心：外部平台商品分类、热销榜单、利润估算，支持爬虫任务触发和状态查询

🤖 AI 内容生成：商品图片展示生成、商品视频展示生成，支持同步/异步任务、WebSocket 进度推送

📊 动态经营看板：首页销售额、订单数、待发货、库存预警与实时订单/库存数据联动

🗃️ 数据库版本控制：Flyway 风格迁移脚本，增量管理数据库变更

🛠️ Monorepo 工程化：pnpm workspace 管理多前端应用，根目录统一脚本

技术栈
层级	技术
工作区	pnpm workspace / Monorepo
管理后台	Vue 3, Vue Router 4, Pinia, Element Plus, Vite, TypeScript
用户端	预留 apps/storefront-web，后续增强
后端	Java 17, Spring Boot 3.3.5, Maven 多模块
认证	JWT 过滤器，/api/** 默认鉴权，放行登录、验证码等公开接口
数据库迁移	Flyway 风格脚本，位于 database/migrations
AI（当前）	Mock provider 实现，接口与前端流程已完全打通
爬虫工具	Python 脚本，位于 tools/crawler/pdd_selection_spider.py
项目结构
text
Smart_Shopping_Mall/
├── apps/
│   ├── admin-web/            # Vue3 管理后台（当前主要前端）
│   ├── storefront-web/       # 用户商城前端（预留）
│   └── api-server/           # Spring Boot 多模块后端
│       ├── mall-bootstrap    # 启动器、Web 配置、JWT、定时任务
│       ├── mall-common       # 统一响应、异常、结果码
│       ├── mall-auth         # 登录、验证码、认证
│       ├── mall-system       # 用户、系统管理
│       ├── mall-catalog      # 分类、品牌、属性、商品 SPU/SKU
│       ├── mall-inventory    # 库存查询、调整、预警
│       ├── mall-order        # 订单查询、发货、状态流转
│       ├── mall-payment      # 支付单、支付状态
│       ├── mall-member       # 会员模块（预留）
│       ├── mall-content      # 内容运营（预留）
│       ├── mall-file         # 文件/对象存储（预留）
│       ├── mall-search       # 搜索（预留）
│       ├── mall-ai           # AI 导购、问答、文案、图片/视频生成
│       ├── mall-selection    # 选品中心：外部平台商品、榜单、爬虫任务
│       └── mall-application  # 跨模块业务编排（爬虫启动、替换商品主图、支付回调等）
├── database/
│   └── migrations/           # V1～V8 数据库迁移脚本
├── infra/                    # 基础设施与部署预留
├── packages/                 # 前端共享包预留
└── tools/
    └── crawler/
        └── pdd_selection_spider.py   # 选品爬虫演示脚本
快速开始
环境要求
Node.js 18+ 及 pnpm

Java 17+

Maven 3.8+

MySQL 8.0+（或其他兼容数据库，迁移脚本基于 MySQL 语法）

1. 克隆项目
bash
git clone <your-repo-url>
cd Smart_Shopping_Mall
2. 初始化数据库
在 MySQL 中创建数据库（如 smart_shopping_mall），并根据项目配置修改 apps/api-server/mall-bootstrap/src/main/resources/application.yml 中的数据库连接信息。

数据库迁移脚本位于 database/migrations/，启动后端时会自动执行（Flyway），无需手动导入。

3. 构建并启动后端
bash
cd apps/api-server
mvn clean install -DskipTests
# 启动后端（默认端口 8080）
cd mall-bootstrap
mvn spring-boot:run
4. 安装前端依赖并启动管理后台
在项目根目录下：

bash
pnpm install
pnpm dev:admin
管理后台默认运行在 http://localhost:6002。

5. 访问系统
管理后台：http://localhost:6002

后端 API：http://localhost:8080

默认登录凭据请查看数据库用户表或项目内部文档

核心功能
选品中心
展示外部平台（如拼多多）的分类树和热销商品榜单

支持按销量、利润、抓取时间排序，查看利润估算和竞争程度

触发爬虫任务并查询任务状态（当前为内存模拟，后续接真实爬虫）

前端路由：/admin/selection

AI 内容生成
AI 内容生成工作台
独立工作区，可选择商品上下文

商品图片展示 AI 生成：上传图片或使用商品主图，输入改图要求，选择生成模式（换背景、风格转换、智能优化），同步返回结果，支持下载、重新生成、设为商品主图

商品视频展示 AI 生成：上传多张素材，填写推广文案（支持 AI 自动生成），选择视频模板和配音风格，异步生成并通过 WebSocket 推送进度，完成后可预览/下载 MP4

前端路由：/catalog/product-ai

单商品 AI 生成入口
从商品列表操作列进入，自动带入商品信息，可对该商品直接进行图片或视频生成

前端路由：/admin/products/:id/ai-generate

当前 AI 生成服务使用 Mock Provider，图片生成返回占位图，视频生成模拟异步任务进度。替换真实 AI 服务只需修改 AiContentGenerationService 的内部适配器，前端接口和流程无需改动。

首页经营看板
动态展示销售额、订单数、待发货列表、库存预警

从订单/库存实时接口获取数据，已付款订单计入销售统计，PAID 订单进入待发货，支持一键确认发货

库存低于预警值的商品进入预警列表

基础商城管理
商品中心：分类、品牌、属性、SPU/SKU 管理

库存管理：库存查询与调整

订单管理：订单列表、发货、状态流转、评价

支付管理：支付单查询与管理

系统管理：后台用户管理

数据库迁移
所有数据库变更通过 database/migrations/ 下的版本化 SQL 脚本管理，当前包含 V1～V8：

V1：占位初始化

V2：认证相关表

V3：商品中心表

V4：库存表

V5：订单表

V6：支付表

V7：系统管理表

V8：选品与 AI 内容生成相关表（selection_*、ai_generation_tasks、ai_generated_assets）

目前部分服务仍使用内存演示数据，相关表已建好，后续可直接切换至数据库持久化。
许可证
本项目仅用于学习和内部演示，请遵守相关平台的使用条款与法律法规。