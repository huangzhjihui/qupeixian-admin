# 趣配鲜 - 食谱净菜电商平台

> 食材配齐，下锅即烹，轻松享受做饭乐趣

## 项目简介

趣配鲜是一个专注于食谱净菜配送的电商平台，为用户提供「预处理净菜+定量调料+烹饪教程」的一站式解决方案。

## 技术栈

### 前端
- **框架**: Vue 3 + Vite
- **UI组件**: Vant 4
- **样式**: TailwindCSS 3
- **状态管理**: Pinia
- **路由**: Vue Router

### 后端
- **框架**: Node.js + Express
- **数据库**: MySQL
- **ORM**: Sequelize
- **认证**: JWT
- **安全**: bcrypt, helmet, express-rate-limit

## 功能模块

### 用户端（H5/小程序）
- 首页展示（轮播Banner、分类导航、新品/热销推荐）
- 商品详情（食材清单、烹饪教程、合规信息展示）
- 购物车（商品管理、数量调整、忌口备注）
- 结算页（地址选择、配送时段、支付方式）
- 订单管理（订单列表、订单详情、售后申请）
- 个人中心（会员信息、收藏、优惠券、积分）
- 食谱专区（食谱浏览、一键购买食材）
- 资质公示（营业执照、食品经营许可证）

### 运营后台
- 数据统计（销售数据、订单趋势）
- 商品管理（商品CRUD、库存管理）
- 订单管理（订单处理、状态更新）
- 用户管理（用户列表、会员管理）
- 营销管理（优惠券、拼团活动）
- 内容管理（食谱、Banner）
- 系统设置（平台信息、资质管理）

## 项目结构

```
qupeixian/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── models/          # 数据库模型
│   │   ├── routes/          # API路由
│   │   ├── middleware/      # 中间件
│   │   ├── config/          # 配置文件
│   │   └── app.js           # 应用入口
│   ├── package.json
│   └── .env                 # 环境变量

├── frontend/                # 前端应用
│   ├── src/
│   │   ├── views/           # 页面组件
│   │   ├── components/      # 公共组件
│   │   ├── store/           # Pinia状态管理
│   │   ├── router/          # 路由配置
│   │   ├── api/             # API接口
│   │   ├── assets/          # 静态资源
│   │   └── main.js          # 应用入口
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js

├── database/                # 数据库脚本
│   └── schema.sql           # 初始化脚本

├── docs/                    # 文档
│   ├── api.md               # API文档
│   └── deploy.md            # 部署指南

└── README.md
```

## 环境要求

- Node.js >= 18.x
- MySQL >= 8.0
- npm >= 9.x

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd qupeixian
```

### 2. 配置数据库

创建数据库并导入初始化脚本：

```bash
mysql -u root -p
CREATE DATABASE qupeixian CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qupeixian;
source database/schema.sql;
```

### 3. 配置环境变量

后端：复制 `backend/.env.example` 为 `backend/.env`，配置数据库连接信息。

### 4. 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

### 5. 启动开发服务器

```bash
# 后端（端口 3000）
cd backend
npm run dev

# 前端（端口 5173）
cd frontend
npm run dev
```

### 6. 访问应用

- 用户端：http://localhost:5173
- 管理后台：http://localhost:5173/admin/login

## 生产部署

### 环境要求
- Linux 服务器（推荐 CentOS 7+）
- Nginx 反向代理
- SSL证书（推荐 Let's Encrypt）

### 部署步骤

1. **构建前端项目**
```bash
cd frontend
npm run build
```

2. **配置 Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /path/to/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. **启动后端服务**（推荐使用 PM2）
```bash
cd backend
npm run build
pm2 start dist/app.js --name qupeixian-api
```

## 数据库结构

主要数据表：
- `users` - 用户信息
- `products` - 商品信息
- `orders` - 订单信息
- `cart_items` - 购物车项
- `coupons` - 优惠券
- `recipes` - 食谱信息
- `ingredients` - 食材信息
- `admins` - 管理员信息

## 安全合规

### 食品电商合规
- 资质公示（营业执照、食品经营许可证）
- 商品合规信息（产地、保质期、储存条件）
- 售后合规（生鲜特殊说明）

### 技术安全
- HTTPS全站加密
- SQL注入防护
- XSS/CSRF防护
- 密码bcrypt加密
- 接口限流

## 开发规范

### 代码风格
- 使用 ESLint 检查代码规范
- 使用 Prettier 格式化代码
- 变量命名使用 camelCase
- 组件命名使用 PascalCase

### 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式
- refactor: 重构

## 许可证

MIT License

## 联系方式

- 客服热线：400-888-8888
- 邮箱：service@qupeixian.com
