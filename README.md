# Smart Shopping Mall

> 一个采用前后端分离架构的智能商城项目，在传统商城业务闭环基础上，扩展了选品中心、AI 商品内容生成、动态经营看板等能力。

Smart Shopping Mall 使用 Monorepo 管理前后端代码。后端基于 Java 17、Spring Boot 3 和 Maven 多模块构建，采用模块化单体架构；管理后台基于 Vue 3、TypeScript、Element Plus 和 Vite 开发。

> 当前项目主要用于学习、技术验证和内部演示。部分服务仍使用 Mock 或内存数据，相关数据库表及前后端流程已经预留，可继续接入真实服务。

## 目录

- [项目亮点](#项目亮点)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [模块职责](#模块职责)
- [快速开始](#快速开始)
- [核心功能](#核心功能)
- [接口认证](#接口认证)
- [数据库迁移](#数据库迁移)
- [当前实现状态](#当前实现状态)
- [常用命令](#常用命令)
- [后续规划](#后续规划)
- [注意事项](#注意事项)
- [License](#license)

## 项目亮点

| 能力 | 说明 |
| --- | --- |
| 模块化商城后端 | 按认证、系统、商品、库存、订单、支付、AI、选品等业务域拆分 Maven 模块。 |
| Vue 3 管理后台 | 使用 TypeScript、Vue Router、Pinia、Element Plus 和 Vite 构建。 |
| 基础商城闭环 | 覆盖商品、SKU、库存、订单、发货、支付和后台用户管理。 |
| 选品中心 | 支持外部平台分类、热销榜单、利润估算、竞争程度分析及爬虫任务管理。 |
| AI 内容生成 | 支持商品图片和视频生成，并提供同步任务、异步任务及 WebSocket 进度推送流程。 |
| 动态经营看板 | 实时展示销售额、订单数、待发货订单和库存预警。 |
| 数据库版本管理 | 通过版本化 SQL 迁移脚本管理数据库结构变更。 |
| Monorepo 工程化 | 使用 pnpm workspace 管理前端应用和共享包。 |

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 工作区 | pnpm workspace、Monorepo |
| 管理后台 | Vue 3、TypeScript、Vue Router 4、Pinia、Element Plus、Vite |
| 用户端 | `apps/storefront-web`，当前为预留应用 |
| 后端 | Java 17、Spring Boot 3.3.5、Maven 多模块 |
| 认证 | JWT、Spring Web Filter |
| 数据库 | MySQL 8.0+ |
| 数据库迁移 | Flyway 风格版本化 SQL 脚本 |
| 实时通信 | WebSocket |
| AI 服务 | Mock Provider，可替换为真实 AI 服务 |
| 爬虫工具 | Python |

## 项目结构

```text
Smart_Shopping_Mall/
├── apps/
│   ├── admin-web/                 # Vue 3 管理后台
│   ├── storefront-web/            # 用户商城前端（预留）
│   └── api-server/                # Spring Boot 多模块后端
│       ├── mall-bootstrap/        # 启动器、Web 配置、JWT、定时任务
│       ├── mall-common/           # 统一响应、异常和结果码
│       ├── mall-auth/             # 登录、验证码和认证
│       ├── mall-system/           # 后台用户与系统管理
│       ├── mall-catalog/          # 分类、品牌、属性、SPU 和 SKU
│       ├── mall-inventory/        # 库存查询、调整和预警
│       ├── mall-order/            # 订单查询、发货和状态流转
│       ├── mall-payment/          # 支付单和支付状态
│       ├── mall-member/           # 会员模块（预留）
│       ├── mall-content/          # 内容运营（预留）
│       ├── mall-file/             # 文件与对象存储（预留）
│       ├── mall-search/           # 搜索模块（预留）
│       ├── mall-ai/               # AI 导购、问答及内容生成
│       ├── mall-selection/        # 选品、榜单和爬虫任务
│       └── mall-application/      # 跨模块业务流程编排
├── database/
│   └── migrations/                # 数据库迁移脚本
├── infra/                         # 基础设施与部署配置（预留）
├── packages/                      # 前端共享包（预留）
├── tools/
│   └── crawler/
│       └── pdd_selection_spider.py
├── package.json
└── pnpm-workspace.yaml
```

## 模块职责

`mall-application` 负责跨模块业务流程编排，例如爬虫任务启动、支付回调处理，以及 AI 生成结果替换商品主图。

具体领域能力仍由对应业务模块负责，避免领域逻辑集中到启动模块或 Controller 中。

## 快速开始

### 环境要求

开始前请安装以下环境：

| 环境 | 版本要求 | 说明 |
| --- | --- | --- |
| Node.js | 18+ | 前端运行环境 |
| pnpm | 最新稳定版 | Monorepo 包管理 |
| Java | 17+ | 后端运行环境 |
| Maven | 3.8+ | 后端构建工具 |
| MySQL | 8.0+ | 数据库 |
| Python | 3+ | 仅运行爬虫工具时需要 |

### 1. 获取项目

```bash
git clone <your-repository-url>
cd Smart_Shopping_Mall
```

### 2. 初始化数据库

在 MySQL 中创建数据库：

```sql
CREATE DATABASE smart_shopping_mall
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
```

修改以下配置文件中的数据库地址、用户名和密码：

```text
apps/api-server/mall-bootstrap/src/main/resources/application.yml
```

数据库迁移脚本位于 `database/migrations/`。配置正确后，后端启动时会自动执行迁移，无需手动逐个导入 SQL 文件。

### 3. 构建并启动后端

```bash
cd apps/api-server
mvn clean install -DskipTests
cd mall-bootstrap
mvn spring-boot:run
```

后端默认地址：`http://localhost:8080`

### 4. 安装并启动管理后台

在项目根目录执行：

```bash
pnpm install
pnpm dev:admin
```

管理后台默认地址：`http://localhost:6002`

### 5. 登录系统

打开 `http://localhost:6002` 进入管理后台。

默认登录账号请查看数据库初始化数据或项目内部配置。建议在此处补充一个明确的演示账号，例如：

| 字段 | 示例 |
| --- | --- |
| 账号 | `admin` |
| 密码 | 请按项目实际配置填写 |

## 核心功能

### 商品中心

- 商品分类管理
- 品牌和商品属性管理
- SPU、SKU 管理
- 从商品列表进入单商品 AI 生成页面

### 库存管理

- SKU 库存查询
- 库存数量调整
- 低库存预警
- 经营看板库存预警联动

### 订单与支付

- 订单列表和详情查询
- 订单状态流转
- 已付款订单发货
- 商品评价管理
- 支付单和支付状态查询
- 支付结果回调流程编排

### 选品中心

选品中心用于展示外部电商平台的分类和商品数据，辅助运营人员进行选品决策。

主要能力包括：

- 外部平台分类树
- 热销商品榜单
- 按销量、利润和抓取时间排序
- 商品成本及利润估算
- 市场竞争程度展示
- 爬虫任务触发和状态查询

管理后台路由：`/admin/selection`

> 当前爬虫任务部分流程为演示实现。接入真实平台前，请确认目标平台的服务协议、访问规则以及相关法律要求。

### AI 内容生成

AI 内容生成工作台支持选择商品上下文，并围绕商品素材生成图片或视频。

#### AI 商品图片

- 上传本地图片或使用商品主图
- 输入图片修改要求
- 支持换背景、风格转换和智能优化等模式
- 查看和下载生成结果
- 重新生成图片
- 将生成结果设置为商品主图

#### AI 商品视频

- 上传多张商品素材
- 填写或自动生成推广文案
- 选择视频模板和配音风格
- 创建异步视频生成任务
- 通过 WebSocket 接收生成进度
- 预览和下载生成的视频

相关管理后台路由：

| 页面 | 路由 |
| --- | --- |
| AI 内容工作台 | `/catalog/product-ai` |
| 单商品生成 | `/admin/products/:id/ai-generate` |

> 当前 AI 服务使用 Mock Provider：图片接口返回演示结果，视频接口模拟异步任务和进度变化。接入真实 AI 服务时，可替换 `AiContentGenerationService` 内部适配实现，尽量保持现有接口契约和前端流程不变。

### 经营看板

首页经营看板从订单和库存接口获取动态数据，展示：

- 销售额
- 订单数量
- 待发货订单
- 库存预警
- 最近订单和库存变化

已付款订单会计入销售统计，状态为 `PAID` 的订单进入待发货列表，并支持在后台确认发货。

### 系统管理

- 后台用户查询
- 用户信息维护
- 用户状态管理
- 登录认证和接口权限控制

## 接口认证

后端使用 JWT 进行身份认证：

- `/api/**` 默认需要有效身份凭证。
- 登录、验证码等公开接口按后端安全配置放行。
- 管理后台请求会统一携带访问令牌。
- 令牌失效后，前端应清理登录状态并跳转到登录页面。
- 具体公开接口和权限规则以后端配置为准。

## 数据库迁移

数据库变更统一通过 `database/migrations/` 下的版本化脚本管理：

| 版本 | 内容 |
| --- | --- |
| V1 | 初始化占位 |
| V2 | 认证相关表 |
| V3 | 商品中心相关表 |
| V4 | 库存相关表 |
| V5 | 订单相关表 |
| V6 | 支付相关表 |
| V7 | 系统管理相关表 |
| V8 | 选品和 AI 内容生成相关表 |

`V8` 包含 `selection_*`、`ai_generation_tasks` 和 `ai_generated_assets` 等表。

新增数据库结构时，请创建新的迁移版本，不要直接修改已经在其他环境执行过的历史脚本。

## 当前实现状态

| 能力 | 状态 | 说明 |
| --- | --- | --- |
| 管理后台 | 已实现 | 当前主要前端应用 |
| 商品、库存、订单、支付 | 已实现基础流程 | 部分服务仍可能使用演示数据 |
| 系统管理和 JWT 认证 | 已实现 | `/api/**` 默认鉴权 |
| 选品中心 | 演示版 | 已打通界面、接口和任务流程 |
| AI 图片生成 | Mock | 可替换真实 Provider |
| AI 视频生成 | Mock | 已实现异步任务和进度推送流程 |
| 用户商城前端 | 预留 | 位于 `apps/storefront-web` |
| 搜索、会员、内容、文件模块 | 预留 | 后续按业务需求实现 |

## 常用命令

### 前端命令

在项目根目录执行：

```bash
# 安装前端依赖
pnpm install

# 启动管理后台
pnpm dev:admin

# 构建前端项目
pnpm build
```

### 后端命令

```bash
cd apps/api-server

# 编译全部后端模块
mvn clean install

# 跳过测试构建
mvn clean install -DskipTests

# 运行后端测试
mvn test
```

## 后续规划

- 将内存演示数据切换为数据库持久化实现
- 接入真实商品数据源和合规的爬虫任务系统
- 接入真实图片、视频生成服务
- 完善 AI 任务失败重试、取消和结果归档
- 实现用户商城前端
- 完善会员、搜索、内容和文件服务
- 增加 Docker、CI/CD 和生产环境部署配置
- 补充接口文档、自动化测试和监控能力

## 注意事项

- 项目中的外部平台名称和数据仅用于功能演示。
- 使用爬虫功能时，应遵守目标平台协议、robots 规则及相关法律法规。
- 生产环境中请修改数据库密码、JWT 密钥及默认管理员密码。
- Mock AI 返回结果不能作为真实业务内容直接使用。

## License

本项目仅用于学习和内部演示。使用项目代码、平台数据或第三方服务时，请遵守对应许可证、服务条款及相关法律法规。
