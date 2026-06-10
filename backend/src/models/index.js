const sequelize = require('../config/database');

const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');

// 导入其他模型
const Category = require('./Category');
const Recipe = require('./Recipe');
const Cart = require('./Cart');
const OrderItem = require('./OrderItem');
const Coupon = require('./Coupon');
const UserCoupon = require('./UserCoupon');
const UserAddress = require('./UserAddress');
const Favorite = require('./Favorite');
const ViewHistory = require('./ViewHistory');
const Review = require('./Review');
const AfterSale = require('./AfterSale');
const Banner = require('./Banner');
const Notice = require('./Notice');
const Agreement = require('./Agreement');
const Qualification = require('./Qualification');
const Admin = require('./Admin');
const AdminLog = require('./AdminLog');
const Config = require('./Config');
const ChatMessage = require('./ChatMessage');
const OrderLogistics = require('./OrderLogistics');

// 定义关联关系
User.hasMany(UserAddress, { foreignKey: 'user_id', as: 'addresses' });
UserAddress.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

User.hasMany(Cart, { foreignKey: 'user_id', as: 'carts' });
Cart.belongsTo(User, { foreignKey: 'user_id' });
Cart.belongsTo(Product, { foreignKey: 'product_id' });

User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(ViewHistory, { foreignKey: 'user_id', as: 'viewHistories' });
ViewHistory.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(UserCoupon, { foreignKey: 'user_id', as: 'coupons' });
UserCoupon.belongsTo(User, { foreignKey: 'user_id' });
UserCoupon.belongsTo(Coupon, { foreignKey: 'coupon_id' });

Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'product_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });

Order.hasMany(AfterSale, { foreignKey: 'order_id', as: 'afterSales' });
AfterSale.belongsTo(Order, { foreignKey: 'order_id' });
AfterSale.belongsTo(User, { foreignKey: 'user_id' });

Recipe.hasOne(Product, { foreignKey: 'recipe_id', as: 'product' });
Product.belongsTo(Recipe, { foreignKey: 'recipe_id', as: 'recipe' });

Order.belongsTo(UserAddress, { foreignKey: 'address_id', as: 'address' });

// 聊天消息关联
User.hasMany(ChatMessage, { foreignKey: 'user_id', as: 'chatMessages' });
ChatMessage.belongsTo(User, { foreignKey: 'user_id' });

// 订单物流关联
Order.hasMany(OrderLogistics, { foreignKey: 'order_id', as: 'logistics' });
OrderLogistics.belongsTo(Order, { foreignKey: 'order_id' });

module.exports = {
  sequelize,
  User,
  Product,
  Order,
  Category,
  Recipe,
  Cart,
  OrderItem,
  Coupon,
  UserCoupon,
  UserAddress,
  Favorite,
  ViewHistory,
  Review,
  AfterSale,
  Banner,
  Notice,
  Agreement,
  Qualification,
  Admin,
  AdminLog,
  Config,
  ChatMessage,
  OrderLogistics
};
