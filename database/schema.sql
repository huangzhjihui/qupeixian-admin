-- ===========================================
-- 趣配鲜 - 数据库初始化脚本
-- 项目名称: 趣配鲜食谱净菜电商平台
-- 创建日期: 2026-05-29
-- ===========================================

CREATE DATABASE IF NOT EXISTS qupeixian CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qupeixian;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ===========================================
-- 用户表
-- ===========================================
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
  `openid` VARCHAR(100) DEFAULT NULL COMMENT '微信OpenID',
  `unionid` VARCHAR(100) DEFAULT NULL COMMENT '微信UnionID',
  `nickname` VARCHAR(100) NOT NULL COMMENT '昵称',
  `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号(脱敏存储)',
  `phone_encrypted` TEXT DEFAULT NULL COMMENT '手机号加密',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `password_hash` VARCHAR(255) DEFAULT NULL COMMENT '密码Hash',
  `real_name` VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
  `id_card` VARCHAR(50) DEFAULT NULL COMMENT '身份证号',
  `member_level` TINYINT NOT NULL DEFAULT 0 COMMENT '会员等级:0-普通,1-月卡,2-季卡,3-年卡',
  `member_expire_time` DATETIME DEFAULT NULL COMMENT '会员到期时间',
  `points` INT NOT NULL DEFAULT 0 COMMENT '积分',
  `balance` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '余额',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:0-禁用,1-正常',
  `is_blacklist` TINYINT NOT NULL DEFAULT 0 COMMENT '是否黑名单',
  `tags` JSON DEFAULT NULL COMMENT '用户标签',
  `last_login_time` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` VARCHAR(50) DEFAULT NULL COMMENT '最后登录IP',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
  INDEX `idx_phone` (`phone`),
  INDEX `idx_openid` (`openid`),
  INDEX `idx_member_level` (`member_level`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ===========================================
-- 用户地址表
-- ===========================================
CREATE TABLE `user_addresses` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '地址ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `real_name` VARCHAR(50) NOT NULL COMMENT '收货人姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '收货人电话',
  `province` VARCHAR(50) NOT NULL COMMENT '省',
  `city` VARCHAR(50) NOT NULL COMMENT '市',
  `district` VARCHAR(50) NOT NULL COMMENT '区',
  `detail_address` VARCHAR(200) NOT NULL COMMENT '详细地址',
  `full_address` VARCHAR(300) NOT NULL COMMENT '完整地址',
  `postal_code` VARCHAR(10) DEFAULT NULL COMMENT '邮编',
  `is_default` TINYINT NOT NULL DEFAULT 0 COMMENT '是否默认:0-否,1-是',
  `longitude` DECIMAL(10,7) DEFAULT NULL COMMENT '经度',
  `latitude` DECIMAL(10,7) DEFAULT NULL COMMENT '纬度',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_is_default` (`is_default`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户地址表';

-- ===========================================
-- 商品分类表
-- ===========================================
CREATE TABLE `categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
  `parent_id` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '父分类ID',
  `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
  `icon` VARCHAR(500) DEFAULT NULL COMMENT '图标',
  `image` VARCHAR(500) DEFAULT NULL COMMENT '分类图片',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '描述',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:0-禁用,1-启用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

-- ===========================================
-- 商品表
-- ===========================================
CREATE TABLE `products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '商品ID',
  `category_id` BIGINT UNSIGNED NOT NULL COMMENT '分类ID',
  `name` VARCHAR(200) NOT NULL COMMENT '商品名称',
  `subtitle` VARCHAR(500) DEFAULT NULL COMMENT '副标题',
  `main_image` VARCHAR(500) NOT NULL COMMENT '主图',
  `images` JSON DEFAULT NULL COMMENT '轮播图片',
  `video_url` VARCHAR(500) DEFAULT NULL COMMENT '视频URL',
  `description` TEXT DEFAULT NULL COMMENT '商品描述',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
  `member_price` DECIMAL(10,2) DEFAULT NULL COMMENT '会员价',
  `original_price` DECIMAL(10,2) DEFAULT NULL COMMENT '原价',
  `stock` INT NOT NULL DEFAULT 0 COMMENT '库存',
  `stock_type` TINYINT NOT NULL DEFAULT 0 COMMENT '库存类型:0-无限,1-固定库存',
  `sales` INT NOT NULL DEFAULT 0 COMMENT '销量',
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 5.00 COMMENT '评分',
  `review_count` INT NOT NULL DEFAULT 0 COMMENT '评价数',
  `serving_size` VARCHAR(50) DEFAULT NULL COMMENT '适用人数',
  `cooking_time` VARCHAR(50) DEFAULT NULL COMMENT '烹饪时长',
  `difficulty` VARCHAR(50) DEFAULT NULL COMMENT '难度',
  `tags` JSON DEFAULT NULL COMMENT '标签',
  `origin` VARCHAR(200) DEFAULT NULL COMMENT '食材产地',
  `packing_date` VARCHAR(100) DEFAULT NULL COMMENT '分装日期',
  `shelf_life` VARCHAR(100) DEFAULT NULL COMMENT '保质期',
  `storage_conditions` VARCHAR(200) DEFAULT NULL COMMENT '储存条件',
  `ingredient_list` TEXT DEFAULT NULL COMMENT '配料表',
  `producer_info` TEXT DEFAULT NULL COMMENT '生产者信息',
  `recipe_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联食谱ID',
  `is_on_sale` TINYINT NOT NULL DEFAULT 1 COMMENT '是否上架:0-下架,1-上架',
  `is_new` TINYINT NOT NULL DEFAULT 0 COMMENT '是否新品',
  `is_hot` TINYINT NOT NULL DEFAULT 0 COMMENT '是否热销',
  `is_recommend` TINYINT NOT NULL DEFAULT 0 COMMENT '是否推荐',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
  INDEX `idx_category_id` (`category_id`),
  INDEX `idx_is_on_sale` (`is_on_sale`),
  INDEX `idx_is_new` (`is_new`),
  INDEX `idx_is_hot` (`is_hot`),
  INDEX `idx_sales` (`sales`),
  INDEX `idx_sort_order` (`sort_order`),
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- ===========================================
-- 商品规格表
-- ===========================================
CREATE TABLE `product_specs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '规格ID',
  `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  `spec_name` VARCHAR(100) NOT NULL COMMENT '规格名称',
  `spec_values` JSON NOT NULL COMMENT '规格值',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
  `stock` INT NOT NULL DEFAULT 0 COMMENT '库存',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_product_id` (`product_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品规格表';

-- ===========================================
-- 商品食材清单表
-- ===========================================
CREATE TABLE `product_ingredients` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  `name` VARCHAR(100) NOT NULL COMMENT '食材名称',
  `quantity` VARCHAR(50) NOT NULL COMMENT '数量',
  `unit` VARCHAR(20) DEFAULT NULL COMMENT '单位',
  `is_preprocessed` TINYINT NOT NULL DEFAULT 1 COMMENT '是否预处理:0-否,1-是',
  `is_seasoning` TINYINT NOT NULL DEFAULT 0 COMMENT '是否调料:0-否,1-是',
  `image` VARCHAR(500) DEFAULT NULL COMMENT '食材图片',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_product_id` (`product_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品食材清单表';

-- ===========================================
-- 食谱表
-- ===========================================
CREATE TABLE `recipes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '食谱ID',
  `title` VARCHAR(200) NOT NULL COMMENT '食谱标题',
  `subtitle` VARCHAR(500) DEFAULT NULL COMMENT '副标题',
  `cover_image` VARCHAR(500) NOT NULL COMMENT '封面图',
  `images` JSON DEFAULT NULL COMMENT '食谱图片',
  `video_url` VARCHAR(500) DEFAULT NULL COMMENT '视频URL',
  `description` TEXT DEFAULT NULL COMMENT '描述',
  `cuisine` VARCHAR(100) DEFAULT NULL COMMENT '菜系',
  `cooking_time` VARCHAR(50) DEFAULT NULL COMMENT '烹饪时长',
  `difficulty` VARCHAR(50) DEFAULT NULL COMMENT '难度',
  `taste` VARCHAR(100) DEFAULT NULL COMMENT '口味',
  `scene` VARCHAR(100) DEFAULT NULL COMMENT '场景',
  `servings` VARCHAR(50) DEFAULT NULL COMMENT '适用人数',
  `tags` JSON DEFAULT NULL COMMENT '标签',
  `steps` JSON DEFAULT NULL COMMENT '烹饪步骤',
  `tips` TEXT DEFAULT NULL COMMENT '小贴士',
  `view_count` INT NOT NULL DEFAULT 0 COMMENT '浏览量',
  `collect_count` INT NOT NULL DEFAULT 0 COMMENT '收藏量',
  `is_on_sale` TINYINT NOT NULL DEFAULT 1 COMMENT '是否上架',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
  INDEX `idx_cuisine` (`cuisine`),
  INDEX `idx_scene` (`scene`),
  INDEX `idx_is_on_sale` (`is_on_sale`),
  INDEX `idx_view_count` (`view_count`),
  INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='食谱表';

-- ===========================================
-- 购物车表
-- ===========================================
CREATE TABLE `cart` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '购物车ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  `spec_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '规格ID',
  `quantity` INT NOT NULL DEFAULT 1 COMMENT '数量',
  `selected` TINYINT NOT NULL DEFAULT 1 COMMENT '是否选中:0-否,1-是',
  `dietary_note` VARCHAR(500) DEFAULT NULL COMMENT '忌口备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_product_id` (`product_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车表';

-- ===========================================
-- 订单表
-- ===========================================
CREATE TABLE `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '订单ID',
  `order_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '订单号',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `address_id` BIGINT UNSIGNED NOT NULL COMMENT '地址ID',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '订单总额',
  `discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '优惠金额',
  `freight` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '运费',
  `pay_amount` DECIMAL(10,2) NOT NULL COMMENT '实付金额',
  `points_used` INT NOT NULL DEFAULT 0 COMMENT '使用积分',
  `points_earned` INT NOT NULL DEFAULT 0 COMMENT '获得积分',
  `coupon_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '使用优惠券ID',
  `delivery_method` TINYINT NOT NULL DEFAULT 0 COMMENT '配送方式:0-同城配送,1-到店自提',
  `delivery_time` DATETIME DEFAULT NULL COMMENT '配送时段',
  `delivery_remark` VARCHAR(500) DEFAULT NULL COMMENT '配送备注',
  `pay_method` VARCHAR(50) DEFAULT NULL COMMENT '支付方式',
  `pay_time` DATETIME DEFAULT NULL COMMENT '支付时间',
  `transaction_id` VARCHAR(100) DEFAULT NULL COMMENT '第三方交易号',
  `invoice_title` VARCHAR(200) DEFAULT NULL COMMENT '发票抬头',
  `invoice_tax_no` VARCHAR(50) DEFAULT NULL COMMENT '税号',
  `invoice_type` VARCHAR(50) DEFAULT NULL COMMENT '发票类型',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '订单状态:0-待付款,1-待备货,2-配送中,3-待收货,4-已完成,5-售后中,6-已关闭',
  `cancel_reason` VARCHAR(500) DEFAULT NULL COMMENT '取消原因',
  `cancel_time` DATETIME DEFAULT NULL COMMENT '取消时间',
  `prepare_time` DATETIME DEFAULT NULL COMMENT '备货时间',
  `ship_time` DATETIME DEFAULT NULL COMMENT '发货时间',
  `receive_time` DATETIME DEFAULT NULL COMMENT '收货时间',
  `complete_time` DATETIME DEFAULT NULL COMMENT '完成时间',
  `admin_remark` VARCHAR(500) DEFAULT NULL COMMENT '管理员备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_order_no` (`order_no`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`address_id`) REFERENCES `user_addresses` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- ===========================================
-- 订单商品表
-- ===========================================
CREATE TABLE `order_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
  `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  `spec_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '规格ID',
  `product_name` VARCHAR(200) NOT NULL COMMENT '商品名称快照',
  `product_image` VARCHAR(500) NOT NULL COMMENT '商品图片快照',
  `spec_name` VARCHAR(200) DEFAULT NULL COMMENT '规格名称快照',
  `price` DECIMAL(10,2) NOT NULL COMMENT '单价快照',
  `quantity` INT NOT NULL COMMENT '数量',
  `total_price` DECIMAL(10,2) NOT NULL COMMENT '小计',
  `dietary_note` VARCHAR(500) DEFAULT NULL COMMENT '忌口备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_product_id` (`product_id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单商品表';

-- ===========================================
-- 优惠券表
-- ===========================================
CREATE TABLE `coupons` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '优惠券ID',
  `name` VARCHAR(100) NOT NULL COMMENT '优惠券名称',
  `type` TINYINT NOT NULL COMMENT '类型:0-满减券,1-折扣券,2-新人券',
  `discount_value` DECIMAL(10,2) NOT NULL COMMENT '优惠值',
  `min_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '最低使用金额',
  `max_discount` DECIMAL(10,2) DEFAULT NULL COMMENT '最大优惠金额',
  `total_count` INT NOT NULL DEFAULT 0 COMMENT '发放总量',
  `used_count` INT NOT NULL DEFAULT 0 COMMENT '已使用数量',
  `limit_per_user` INT NOT NULL DEFAULT 1 COMMENT '每人限领数量',
  `valid_type` TINYINT NOT NULL DEFAULT 0 COMMENT '有效期类型:0-固定天数,1-固定日期',
  `valid_days` INT DEFAULT NULL COMMENT '有效天数',
  `start_time` DATETIME DEFAULT NULL COMMENT '开始时间',
  `end_time` DATETIME DEFAULT NULL COMMENT '结束时间',
  `category_ids` JSON DEFAULT NULL COMMENT '适用分类ID',
  `product_ids` JSON DEFAULT NULL COMMENT '适用商品ID',
  `is_new_user` TINYINT NOT NULL DEFAULT 0 COMMENT '是否仅限新人',
  `is_active` TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_type` (`type`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_start_end_time` (`start_time`, `end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优惠券表';

-- ===========================================
-- 用户优惠券表
-- ===========================================
CREATE TABLE `user_coupons` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `coupon_id` BIGINT UNSIGNED NOT NULL COMMENT '优惠券ID',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态:0-未使用,1-已使用,2-已过期',
  `order_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '使用订单ID',
  `use_time` DATETIME DEFAULT NULL COMMENT '使用时间',
  `receive_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
  `expire_time` DATETIME NOT NULL COMMENT '过期时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_coupon_id` (`coupon_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户优惠券表';

-- ===========================================
-- 用户收藏表
-- ===========================================
CREATE TABLE `favorites` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `type` TINYINT NOT NULL COMMENT '类型:0-商品,1-食谱',
  `target_id` BIGINT UNSIGNED NOT NULL COMMENT '目标ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY `uk_user_type_target` (`user_id`, `type`, `target_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收藏表';

-- ===========================================
-- 用户浏览记录表
-- ===========================================
CREATE TABLE `view_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `type` TINYINT NOT NULL COMMENT '类型:0-商品,1-食谱',
  `target_id` BIGINT UNSIGNED NOT NULL COMMENT '目标ID',
  `view_count` INT NOT NULL DEFAULT 1 COMMENT '浏览次数',
  `last_view_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '最后浏览时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY `uk_user_type_target` (`user_id`, `type`, `target_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_last_view_time` (`last_view_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户浏览记录表';

-- ===========================================
-- 商品评价表
-- ===========================================
CREATE TABLE `reviews` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '评价ID',
  `order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
  `order_item_id` BIGINT UNSIGNED NOT NULL COMMENT '订单项ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  `rating` TINYINT NOT NULL COMMENT '评分:1-5星',
  `content` TEXT COMMENT '评价内容',
  `images` JSON DEFAULT NULL COMMENT '评价图片',
  `video_url` VARCHAR(500) DEFAULT NULL COMMENT '评价视频',
  `is_anonymous` TINYINT NOT NULL DEFAULT 0 COMMENT '是否匿名',
  `is_top` TINYINT NOT NULL DEFAULT 0 COMMENT '是否置顶',
  `reply` TEXT DEFAULT NULL COMMENT '商家回复',
  `reply_time` DATETIME DEFAULT NULL COMMENT '回复时间',
  `like_count` INT NOT NULL DEFAULT 0 COMMENT '点赞数',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_rating` (`rating`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品评价表';

-- ===========================================
-- 追评表
-- ===========================================
CREATE TABLE `review_addons` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `review_id` BIGINT UNSIGNED NOT NULL COMMENT '评价ID',
  `content` TEXT COMMENT '追评内容',
  `images` JSON DEFAULT NULL COMMENT '追评图片',
  `days_after` INT DEFAULT NULL COMMENT '收货后第几天追评',
  `reply` TEXT DEFAULT NULL COMMENT '商家回复',
  `reply_time` DATETIME DEFAULT NULL COMMENT '回复时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_review_id` (`review_id`),
  FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='追评表';

-- ===========================================
-- 售后表
-- ===========================================
CREATE TABLE `after_sales` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '售后ID',
  `after_sale_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '售后单号',
  `order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
  `order_item_id` BIGINT UNSIGNED NOT NULL COMMENT '订单项ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `type` TINYINT NOT NULL COMMENT '类型:0-仅退款,1-退货退款',
  `reason` VARCHAR(500) NOT NULL COMMENT '退款原因',
  `description` TEXT COMMENT '详细描述',
  `images` JSON DEFAULT NULL COMMENT '凭证图片',
  `refund_amount` DECIMAL(10,2) NOT NULL COMMENT '退款金额',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态:0-待审核,1-审核通过,2-审核拒绝,3-退货中,4-退款中,5-已完成,6-已关闭',
  `refuse_reason` VARCHAR(500) DEFAULT NULL COMMENT '拒绝原因',
  `audit_time` DATETIME DEFAULT NULL COMMENT '审核时间',
  `refund_time` DATETIME DEFAULT NULL COMMENT '退款时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_after_sale_no` (`after_sale_no`),
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='售后表';

-- ===========================================
-- 拼团活动表
-- ===========================================
CREATE TABLE `group_buy` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '拼团ID',
  `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  `group_price` DECIMAL(10,2) NOT NULL COMMENT '拼团价',
  `group_size` INT NOT NULL COMMENT '成团人数',
  `current_count` INT NOT NULL DEFAULT 0 COMMENT '当前人数',
  `start_time` DATETIME NOT NULL COMMENT '开始时间',
  `end_time` DATETIME NOT NULL COMMENT '结束时间',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态:0-进行中,1-已完成,2-已结束',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拼团活动表';

-- ===========================================
-- 拼团记录表
-- ===========================================
CREATE TABLE `group_buy_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `group_buy_id` BIGINT UNSIGNED NOT NULL COMMENT '拼团ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
  `is_leader` TINYINT NOT NULL DEFAULT 0 COMMENT '是否团长',
  `join_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  INDEX `idx_group_buy_id` (`group_buy_id`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`group_buy_id`) REFERENCES `group_buy` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拼团记录表';

-- ===========================================
-- 秒杀活动表
-- ===========================================
CREATE TABLE `flash_sales` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '秒杀ID',
  `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  `flash_price` DECIMAL(10,2) NOT NULL COMMENT '秒杀价',
  `stock` INT NOT NULL COMMENT '秒杀库存',
  `sold_count` INT NOT NULL DEFAULT 0 COMMENT '已售数量',
  `start_time` DATETIME NOT NULL COMMENT '开始时间',
  `end_time` DATETIME NOT NULL COMMENT '结束时间',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态:0-未开始,1-进行中,2-已结束',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_start_end_time` (`start_time`, `end_time`),
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='秒杀活动表';

-- ===========================================
-- 签到规则表
-- ===========================================
CREATE TABLE `sign_in_rules` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `day` TINYINT NOT NULL COMMENT '连续第几天',
  `points` INT NOT NULL COMMENT '获得积分',
  `description` VARCHAR(200) DEFAULT NULL COMMENT '描述',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  INDEX `idx_day` (`day`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='签到规则表';

-- ===========================================
-- 用户签到记录表
-- ===========================================
CREATE TABLE `sign_in_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `sign_in_date` DATE NOT NULL COMMENT '签到日期',
  `continuous_days` INT NOT NULL DEFAULT 1 COMMENT '连续签到天数',
  `points_earned` INT NOT NULL COMMENT '获得积分',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY `uk_user_date` (`user_id`, `sign_in_date`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_sign_in_date` (`sign_in_date`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户签到记录表';

-- ===========================================
-- 积分商城表
-- ===========================================
CREATE TABLE `point_products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `name` VARCHAR(200) NOT NULL COMMENT '商品名称',
  `image` VARCHAR(500) DEFAULT NULL COMMENT '图片',
  `description` TEXT COMMENT '描述',
  `points_required` INT NOT NULL COMMENT '所需积分',
  `stock` INT NOT NULL DEFAULT 0 COMMENT '库存',
  `exchanged_count` INT NOT NULL DEFAULT 0 COMMENT '已兑换数量',
  `is_active` TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分商城表';

-- ===========================================
-- 积分兑换记录表
-- ===========================================
CREATE TABLE `point_exchange_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `point_product_id` BIGINT UNSIGNED NOT NULL COMMENT '积分商品ID',
  `points_used` INT NOT NULL COMMENT '使用积分',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态:0-待处理,1-已完成',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分兑换记录表';

-- ===========================================
-- Banner表
-- ===========================================
CREATE TABLE `banners` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'BannerID',
  `position` VARCHAR(50) NOT NULL COMMENT '位置',
  `title` VARCHAR(200) DEFAULT NULL COMMENT '标题',
  `image` VARCHAR(500) NOT NULL COMMENT '图片',
  `link_type` VARCHAR(50) DEFAULT NULL COMMENT '链接类型',
  `link_url` VARCHAR(500) DEFAULT NULL COMMENT '链接地址',
  `product_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联商品ID',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `start_time` DATETIME DEFAULT NULL COMMENT '显示开始时间',
  `end_time` DATETIME DEFAULT NULL COMMENT '显示结束时间',
  `is_active` TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_position` (`position`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Banner表';

-- ===========================================
-- 公告表
-- ===========================================
CREATE TABLE `notices` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '公告ID',
  `title` VARCHAR(200) NOT NULL COMMENT '标题',
  `content` TEXT NOT NULL COMMENT '内容',
  `type` TINYINT NOT NULL DEFAULT 0 COMMENT '类型:0-普通公告,1-重要通知',
  `is_popup` TINYINT NOT NULL DEFAULT 0 COMMENT '是否弹窗',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `is_active` TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公告表';

-- ===========================================
-- 协议与内容页表
-- ===========================================
CREATE TABLE `agreements` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `type` VARCHAR(50) NOT NULL UNIQUE COMMENT '类型:user_agreement,privacy_policy,food_safety,return_policy',
  `title` VARCHAR(200) NOT NULL COMMENT '标题',
  `content` TEXT NOT NULL COMMENT '内容',
  `version` VARCHAR(50) NOT NULL COMMENT '版本号',
  `published_at` DATETIME DEFAULT NULL COMMENT '发布时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='协议与内容页表';

-- ===========================================
-- 资质备案表
-- ===========================================
CREATE TABLE `qualifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `type` VARCHAR(50) NOT NULL COMMENT '类型:business_license,food_license,website_record',
  `title` VARCHAR(200) NOT NULL COMMENT '资质名称',
  `license_no` VARCHAR(100) DEFAULT NULL COMMENT '证号',
  `image` VARCHAR(500) DEFAULT NULL COMMENT '资质图片',
  `issuing_authority` VARCHAR(200) DEFAULT NULL COMMENT '发证机关',
  `issue_date` DATE DEFAULT NULL COMMENT '发证日期',
  `expire_date` DATE DEFAULT NULL COMMENT '到期日期',
  `content` TEXT DEFAULT NULL COMMENT '详细内容',
  `is_public` TINYINT NOT NULL DEFAULT 1 COMMENT '是否公开',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资质备案表';

-- ===========================================
-- 供应商表
-- ===========================================
CREATE TABLE `suppliers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '供应商ID',
  `name` VARCHAR(200) NOT NULL COMMENT '供应商名称',
  `contact_person` VARCHAR(100) DEFAULT NULL COMMENT '联系人',
  `contact_phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  `address` VARCHAR(500) DEFAULT NULL COMMENT '地址',
  `business_license` VARCHAR(500) DEFAULT NULL COMMENT '营业执照图片',
  `food_license` VARCHAR(500) DEFAULT NULL COMMENT '食品经营许可证',
  `health_certificates` JSON DEFAULT NULL COMMENT '健康证',
  `license_expire_date` DATE DEFAULT NULL COMMENT '许可证到期日期',
  `last_check_date` DATE DEFAULT NULL COMMENT '最后核验日期',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:0-禁用,1-正常',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='供应商表';

-- ===========================================
-- 食品安全管理员表
-- ===========================================
CREATE TABLE `food_safety_managers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `name` VARCHAR(100) NOT NULL COMMENT '姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '电话',
  `id_card` VARCHAR(50) DEFAULT NULL COMMENT '身份证号',
  `certificate` VARCHAR(500) DEFAULT NULL COMMENT '资格证书',
  `certificate_no` VARCHAR(100) DEFAULT NULL COMMENT '证书编号',
  `start_date` DATE DEFAULT NULL COMMENT '任职开始日期',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:0-离职,1-在职',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='食品安全管理员表';

-- ===========================================
-- 食品安全自查记录表
-- ===========================================
CREATE TABLE `food_safety_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `type` TINYINT NOT NULL COMMENT '类型:0-日管控,1-周排查,2-月调度',
  `record_date` DATE NOT NULL COMMENT '记录日期',
  `content` TEXT NOT NULL COMMENT '检查内容',
  `issues` TEXT DEFAULT NULL COMMENT '发现问题',
  `measures` TEXT DEFAULT NULL COMMENT '整改措施',
  `manager_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '负责人ID',
  `attachments` JSON DEFAULT NULL COMMENT '附件',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_type` (`type`),
  INDEX `idx_record_date` (`record_date`),
  FOREIGN KEY (`manager_id`) REFERENCES `food_safety_managers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='食品安全自查记录表';

-- ===========================================
-- 管理员表
-- ===========================================
CREATE TABLE `admins` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '管理员ID',
  `username` VARCHAR(100) NOT NULL UNIQUE COMMENT '用户名',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '密码Hash',
  `real_name` VARCHAR(100) DEFAULT NULL COMMENT '真实姓名',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '电话',
  `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像',
  `role` TINYINT NOT NULL DEFAULT 1 COMMENT '角色:0-超级管理员,1-运营,2-客服,3-财务',
  `permissions` JSON DEFAULT NULL COMMENT '权限列表',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:0-禁用,1-正常',
  `last_login_time` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` VARCHAR(50) DEFAULT NULL COMMENT '最后登录IP',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_username` (`username`),
  INDEX `idx_role` (`role`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- ===========================================
-- 操作日志表
-- ===========================================
CREATE TABLE `admin_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
  `admin_id` BIGINT UNSIGNED NOT NULL COMMENT '管理员ID',
  `username` VARCHAR(100) NOT NULL COMMENT '管理员用户名',
  `module` VARCHAR(50) NOT NULL COMMENT '模块',
  `action` VARCHAR(50) NOT NULL COMMENT '操作',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '描述',
  `ip` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
  `params` TEXT DEFAULT NULL COMMENT '请求参数',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_admin_id` (`admin_id`),
  INDEX `idx_module` (`module`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- ===========================================
-- 配置表
-- ===========================================
CREATE TABLE `configs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `key` VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
  `value` TEXT DEFAULT NULL COMMENT '配置值',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '描述',
  `type` VARCHAR(50) NOT NULL DEFAULT 'string' COMMENT '类型:string,number,boolean,json',
  `group` VARCHAR(50) DEFAULT NULL COMMENT '分组',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_key` (`key`),
  INDEX `idx_group` (`group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='配置表';

-- ===========================================
-- 客服会话表
-- ===========================================
CREATE TABLE `customer_service_sessions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '会话ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `admin_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '客服ID',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态:0-进行中,1-已结束',
  `last_message_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '最后消息时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客服会话表';

-- ===========================================
-- 客服消息表
-- ===========================================
CREATE TABLE `customer_service_messages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '消息ID',
  `session_id` BIGINT UNSIGNED NOT NULL COMMENT '会话ID',
  `sender_type` TINYINT NOT NULL COMMENT '发送者类型:0-用户,1-客服',
  `sender_id` BIGINT UNSIGNED NOT NULL COMMENT '发送者ID',
  `message_type` TINYINT NOT NULL DEFAULT 0 COMMENT '消息类型:0-文本,1-图片,2-系统消息',
  `content` TEXT NOT NULL COMMENT '内容',
  `is_read` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_session_id` (`session_id`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`session_id`) REFERENCES `customer_service_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客服消息表';

-- ===========================================
-- 交易日志表
-- ===========================================
CREATE TABLE `transaction_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
  `type` VARCHAR(50) NOT NULL COMMENT '类型',
  `order_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联订单ID',
  `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '用户ID',
  `amount` DECIMAL(10,2) DEFAULT NULL COMMENT '金额',
  `balance_before` DECIMAL(10,2) DEFAULT NULL COMMENT '变动前余额',
  `balance_after` DECIMAL(10,2) DEFAULT NULL COMMENT '变动后余额',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '描述',
  `extra` JSON DEFAULT NULL COMMENT '额外数据',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_type` (`type`),
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='交易日志表';

-- ===========================================
-- 数据备份记录表
-- ===========================================
CREATE TABLE `backup_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `backup_name` VARCHAR(200) NOT NULL COMMENT '备份名称',
  `backup_type` VARCHAR(50) NOT NULL COMMENT '备份类型:full,incremental',
  `file_path` VARCHAR(500) NOT NULL COMMENT '文件路径',
  `file_size` BIGINT DEFAULT NULL COMMENT '文件大小(字节)',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态:0-进行中,1-成功,2-失败',
  `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_backup_type` (`backup_type`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据备份记录表';

SET FOREIGN_KEY_CHECKS = 1;

-- ===========================================
-- 初始化数据
-- ===========================================

-- 插入默认管理员 (密码: admin123)
INSERT INTO `admins` (`username`, `password_hash`, `real_name`, `phone`, `role`, `status`) VALUES
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyQ5z5Xvz5aS', '超级管理员', '13800138000', 0, 1);

-- 插入配置
INSERT INTO `configs` (`key`, `value`, `description`, `type`, `group`) VALUES
('site_name', '趣配鲜', '网站名称', 'string', 'site'),
('site_slogan', '食材配齐，下锅即烹，轻松享受做饭乐趣', 'Slogan', 'string', 'site'),
('site_logo', '', 'Logo', 'string', 'site'),
('site_icp', '', 'ICP备案号', 'string', 'site'),
('site_copyright', '©2026 趣配鲜 版权所有', '版权信息', 'string', 'site'),
('service_phone', '400-888-8888', '客服电话', 'string', 'contact'),
('service_email', 'service@qupeixian.com', '客服邮箱', 'string', 'contact'),
('service_wechat', '', '客服微信', 'string', 'contact'),
('delivery_fee', '5.00', '配送费', 'number', 'delivery'),
('free_delivery_threshold', '99.00', '免配送费门槛', 'number', 'delivery'),
('order_auto_cancel_minutes', '30', '订单自动取消时间(分钟)', 'number', 'order'),
('order_auto_confirm_days', '7', '订单自动确认收货天数', 'number', 'order'),
('after_sale_available_hours', '24', '售后申请有效时间(小时)', 'number', 'after_sale');

-- 插入分类
INSERT INTO `categories` (`parent_id`, `name`, `icon`, `description`, `sort_order`, `status`) VALUES
(0, '单人餐', '', '一人食精选套餐', 1, 1),
(0, '双人餐', '', '两人世界套餐', 2, 1),
(0, '家庭餐', '', '3-5人家庭套餐', 3, 1),
(0, '减脂餐', '', '健康轻食减脂套餐', 4, 1),
(0, '儿童餐', '', '儿童营养套餐', 5, 1),
(0, '单品净菜', '', '单品预处理净菜', 6, 1),
(0, '调料专区', '', '精选调料组合', 7, 1);

-- 插入签到规则
INSERT INTO `sign_in_rules` (`day`, `points`, `description`, `sort_order`) VALUES
(1, 5, '第一天签到', 1),
(2, 10, '第二天签到', 2),
(3, 15, '第三天签到', 3),
(4, 20, '第四天签到', 4),
(5, 25, '第五天签到', 5),
(6, 30, '第六天签到', 6),
(7, 50, '第七天签到', 7);

-- 插入默认协议
INSERT INTO `agreements` (`type`, `title`, `content`, `version`, `published_at`) VALUES
('user_agreement', '用户协议', '<h1>用户协议</h1><p>欢迎使用趣配鲜服务...</p>', '1.0.0', NOW()),
('privacy_policy', '隐私政策', '<h1>隐私政策</h1><p>我们非常重视您的隐私...</p>', '1.0.0', NOW()),
('food_safety', '食品安全告知书', '<h1>食品安全告知书</h1><p>本平台所售为生鲜预处理食材包...</p>', '1.0.0', NOW()),
('return_policy', '退换货规则', '<h1>退换货规则</h1><p>1. 生鲜属于易损耗定制商品，不支持七天无理由退货...</p>', '1.0.0', NOW());

-- 插入示例Banner
INSERT INTO `banners` (`position`, `title`, `image`, `link_type`, `sort_order`, `is_active`) VALUES
('home', '新品上市', '', 'product', 1, 1),
('home', '爆款推荐', '', 'product', 2, 1),
('home', '限时特惠', '', 'activity', 3, 1);

-- ===========================================
-- 数据库初始化完成
-- ===========================================
