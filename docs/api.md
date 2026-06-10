# 趣配鲜 API 文档

## 基础信息

- **API 地址**: `https://api.qupeixian.com`
- **版本**: v1
- **认证方式**: JWT Token
- **数据格式**: JSON

---

## 目录

1. 用户认证
2. 商品管理
3. 订单管理
4. 购物车
5. 用户管理
6. 营销管理
7. 内容管理
8. 系统管理

---

## 1. 用户认证

### 1.1 登录

**POST** `/api/auth/login`

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 手机号 |
| password | string | 是 | 密码 |

响应示例：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "phone": "13800138000",
      "nickname": "用户昵称",
      "member_level": 1
    }
  }
}
```

### 1.2 注册

**POST** `/api/auth/register`

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 手机号 |
| password | string | 是 | 密码 |
| nickname | string | 是 | 昵称 |

### 1.3 退出登录

**POST** `/api/auth/logout`

需要 Authorization Header。

---

## 2. 商品管理

### 2.1 获取商品列表

**GET** `/api/products`

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页数量，默认20 |
| category_id | int | 否 | 分类ID |
| keyword | string | 否 | 搜索关键词 |
| is_new | int | 否 | 是否新品 |
| is_hot | int | 否 | 是否热销 |

响应示例：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "data": [
      {
        "id": 1,
        "name": "宫保鸡丁套餐",
        "price": 39.9,
        "original_price": 49.9,
        "main_image": "https://...",
        "serving_size": "2人份",
        "cooking_time": "15分钟"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

### 2.2 获取商品详情

**GET** `/api/products/:id`

响应示例：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "宫保鸡丁套餐",
    "price": 39.9,
    "origin": "山东",
    "shelf_life": "24小时",
    "storage_conditions": "0-4℃冷藏",
    "ingredients": [...],
    "recipe": {...},
    "reviews": [...]
  }
}
```

---

## 3. 订单管理

### 3.1 创建订单

**POST** `/api/orders`

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| address_id | int | 是 | 收货地址ID |
| delivery_method | int | 是 | 配送方式（0:同城配送，1:到店自提） |
| delivery_time | string | 是 | 配送时段 |
| coupon_id | int | 否 | 优惠券ID |
| delivery_remark | string | 否 | 订单备注 |

响应示例：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "order_id": 10001,
    "order_no": "QPX202401010001"
  }
}
```

### 3.2 获取订单列表

**GET** `/api/orders`

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码 |
| status | int | 否 | 订单状态 |

### 3.3 获取订单详情

**GET** `/api/orders/:id`

### 3.4 取消订单

**PUT** `/api/orders/:id/cancel`

### 3.5 确认收货

**PUT** `/api/orders/:id/confirm`

---

## 4. 购物车

### 4.1 获取购物车

**GET** `/api/cart`

### 4.2 添加商品到购物车

**POST** `/api/cart`

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| product_id | int | 是 | 商品ID |
| quantity | int | 否 | 数量，默认1 |

### 4.3 更新购物车项

**PUT** `/api/cart/:id`

### 4.4 删除购物车项

**DELETE** `/api/cart/:id`

---

## 5. 用户管理

### 5.1 获取用户信息

**GET** `/api/user/info`

### 5.2 获取收货地址列表

**GET** `/api/user/addresses`

### 5.3 添加收货地址

**POST** `/api/user/addresses`

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| real_name | string | 是 | 收货人姓名 |
| phone | string | 是 | 手机号 |
| province | string | 是 | 省份 |
| city | string | 是 | 城市 |
| district | string | 是 | 区县 |
| detail_address | string | 是 | 详细地址 |
| is_default | int | 否 | 是否默认地址 |

### 5.4 更新收货地址

**PUT** `/api/user/addresses/:id`

### 5.5 删除收货地址

**DELETE** `/api/user/addresses/:id`

### 5.6 获取优惠券

**GET** `/api/user/coupons`

---

## 6. 营销管理

### 6.1 获取优惠券列表

**GET** `/api/coupons`

### 6.2 使用优惠券

**POST** `/api/coupons/:id/use`

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| order_id | int | 是 | 订单ID |

---

## 7. 内容管理

### 7.1 获取食谱列表

**GET** `/api/recipes`

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码 |
| cuisine | int | 否 | 菜系ID |
| filter | string | 否 | 筛选条件 |

### 7.2 获取食谱详情

**GET** `/api/recipes/:id`

### 7.3 收藏/取消收藏

**POST** `/api/favorites/toggle`

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | int | 是 | 类型（0:商品，1:食谱） |
| target_id | int | 是 | 目标ID |

---

## 8. 系统管理

### 8.1 获取首页数据

**GET** `/api/home`

响应示例：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "brand": {...},
    "banners": [...],
    "categories": [...],
    "newProducts": [...],
    "hotProducts": [...],
    "recipes": [...]
  }
}
```

### 8.2 获取资质信息

**GET** `/api/qualifications`

---

## 9. 管理员接口

### 9.1 管理员登录

**POST** `/api/admin/login`

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

### 9.2 获取统计数据

**GET** `/api/admin/stats`

### 9.3 商品管理

- `GET /api/admin/products` - 获取商品列表
- `POST /api/admin/products` - 创建商品
- `PUT /api/admin/products/:id` - 更新商品
- `DELETE /api/admin/products/:id` - 删除商品

### 9.4 订单管理

- `GET /api/admin/orders` - 获取订单列表
- `PUT /api/admin/orders/:id/status` - 更新订单状态
- `POST /api/admin/orders/export` - 导出订单

### 9.5 用户管理

- `GET /api/admin/users` - 获取用户列表
- `PUT /api/admin/users/:id/status` - 更新用户状态

### 9.6 优惠券管理

- `GET /api/admin/coupons` - 获取优惠券列表
- `POST /api/admin/coupons` - 创建优惠券
- `PUT /api/admin/coupons/:id` - 更新优惠券

---

## 状态码说明

| 状态码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 未登录 |
| 1003 | 权限不足 |
| 1004 | 数据不存在 |
| 1005 | 业务逻辑错误 |
| 500 | 服务器错误 |

---

## 认证说明

所有需要登录的接口，请求头需携带：

```
Authorization: Bearer <token>
```

---

## 请求示例

```bash
# 获取商品列表
curl -X GET "https://api.qupeixian.com/api/products?page=1&pageSize=10"

# 创建订单（需登录）
curl -X POST "https://api.qupeixian.com/api/orders" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"address_id":1,"delivery_method":0,"delivery_time":"now"}'
```
