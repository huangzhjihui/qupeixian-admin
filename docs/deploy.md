# 趣配鲜平台部署指南

## 目录
1. 环境准备
2. 数据库配置
3. 后端部署
4. 前端部署
5. Nginx配置
6. SSL配置
7. 安全配置
8. 运维监控

---

## 1. 环境准备

### 1.1 服务器要求
- **操作系统**: CentOS 7.x / Ubuntu 20.04+
- **CPU**: 2核及以上
- **内存**: 4GB及以上
- **存储**: 50GB及以上
- **网络**: 公网IP，开放80/443端口

### 1.2 安装依赖

**CentOS:**
```bash
# 更新系统
yum update -y

# 安装 Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# 安装 MySQL 8.0
wget https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm
rpm -ivh mysql80-community-release-el7-3.noarch.rpm
yum install -y mysql-community-server

# 安装 Nginx
yum install -y nginx

# 安装 PM2
npm install -g pm2
```

**Ubuntu:**
```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 安装 MySQL 8.0
apt install -y mysql-server

# 安装 Nginx
apt install -y nginx

# 安装 PM2
npm install -g pm2
```

---

## 2. 数据库配置

### 2.1 启动 MySQL 服务

```bash
# CentOS
systemctl start mysqld
systemctl enable mysqld

# Ubuntu
systemctl start mysql
systemctl enable mysql
```

### 2.2 配置数据库

```bash
# 登录 MySQL（初始密码在 /var/log/mysqld.log 中）
mysql -u root -p

# 创建数据库
CREATE DATABASE qupeixian CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户并授权
CREATE USER 'qupeixian'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON qupeixian.* TO 'qupeixian'@'localhost';
FLUSH PRIVILEGES;

# 导入初始化脚本
USE qupeixian;
source /path/to/database/schema.sql;
```

### 2.3 配置 MySQL 安全

```bash
# 运行安全配置向导
mysql_secure_installation
```

---

## 3. 后端部署

### 3.1 上传代码

```bash
# 创建项目目录
mkdir -p /var/www/qupeixian
cd /var/www/qupeixian

# 上传代码（通过 git 或 scp）
git clone <repository-url> .
```

### 3.2 安装依赖

```bash
cd backend
npm install --production
```

### 3.3 配置环境变量

创建 `.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=qupeixian
DB_USER=qupeixian
DB_PASSWORD=your_password

# JWT配置
JWT_SECRET=your_jwt_secret_key_here_must_be_long_and_secure
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000
NODE_ENV=production

# 微信支付配置
WECHAT_APPID=your_wechat_appid
WECHAT_MCHID=your_wechat_mchid
WECHAT_API_KEY=your_wechat_api_key

# Redis配置（可选）
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3.4 启动服务

```bash
# 使用 PM2 启动
pm2 start npm --name "qupeixian-api" -- run start

# 设置开机自启
pm2 startup
pm2 save
```

---

## 4. 前端部署

### 4.1 构建项目

```bash
cd frontend

# 安装依赖
npm install

# 构建生产版本
npm run build
```

### 4.2 配置 API 地址

在 `frontend/src/api/request.js` 中配置后端 API 地址：

```javascript
const baseURL = 'https://your-domain.com/api'
```

---

## 5. Nginx 配置

### 5.1 创建配置文件

```bash
vim /etc/nginx/conf.d/qupeixian.conf
```

配置内容：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com www.your-domain.com;

    # SSL 配置
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 前端静态文件
    location / {
        root /var/www/qupeixian/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 管理后台
    location /admin/ {
        root /var/www/qupeixian/frontend/dist;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }

    # 日志配置
    access_log /var/log/nginx/qupeixian.access.log;
    error_log /var/log/nginx/qupeixian.error.log;
}
```

### 5.2 启动 Nginx

```bash
# 检查配置
nginx -t

# 重启服务
systemctl restart nginx
systemctl enable nginx
```

---

## 6. SSL 配置

### 6.1 使用 Let's Encrypt

```bash
# 安装 Certbot
yum install -y certbot python3-certbot-nginx  # CentOS
apt install -y certbot python3-certbot-nginx   # Ubuntu

# 获取证书
certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
certbot renew --dry-run
```

---

## 7. 安全配置

### 7.1 防火墙配置

```bash
# 开放必要端口
firewall-cmd --zone=public --add-port=80/tcp --permanent
firewall-cmd --zone=public --add-port=443/tcp --permanent
firewall-cmd --reload
```

### 7.2 禁用 root 远程登录

```bash
vim /etc/ssh/sshd_config
# 修改 PermitRootLogin no
systemctl restart sshd
```

### 7.3 创建普通用户

```bash
useradd -m deploy
passwd deploy
usermod -aG wheel deploy
```

---

## 8. 运维监控

### 8.1 PM2 监控

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs qupeixian-api

# 重启服务
pm2 restart qupeixian-api
```

### 8.2 日志管理

```bash
# 查看 Nginx 日志
tail -f /var/log/nginx/qupeixian.access.log

# 查看错误日志
tail -f /var/log/nginx/qupeixian.error.log
```

### 8.3 备份策略

```bash
# 数据库备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mysql"
mkdir -p $BACKUP_DIR
mysqldump -u qupeixian -p'your_password' qupeixian > $BACKUP_DIR/qupeixian_$DATE.sql
gzip $BACKUP_DIR/qupeixian_$DATE.sql

# 保留最近7天备份
find $BACKUP_DIR -name "*.sql.gz" -type f -mtime +7 -delete
```

添加到 crontab 每日备份：
```bash
0 2 * * * /path/to/backup_script.sh
```

---

## 9. 宝塔面板部署（可选）

### 9.1 安装宝塔

```bash
yum install -y wget && wget -O install.sh http://download.bt.cn/install/install_6.0.sh && sh install.sh
```

### 9.2 配置步骤

1. 登录宝塔面板
2. 添加站点（域名、根目录指向 frontend/dist）
3. 创建数据库（导入 schema.sql）
4. 安装 Node.js 版本管理
5. 配置反向代理（API 路径指向 127.0.0.1:3000）
6. 配置 SSL 证书

---

## 10. 故障排查

### 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 无法连接数据库 | 数据库未启动或配置错误 | 检查 MySQL 状态、配置文件 |
| 前端页面空白 | 构建失败或路径错误 | 检查构建日志、Nginx 配置 |
| API 请求失败 | 后端服务未启动 | 检查 PM2 状态、端口占用 |
| SSL 证书过期 | 证书未自动续期 | 手动执行 certbot renew |

### 日志位置

- Nginx 日志: `/var/log/nginx/`
- 应用日志: `pm2 logs qupeixian-api`
- MySQL 日志: `/var/log/mysqld.log`

---

## 11. 性能优化

### 11.1 启用 Redis 缓存

安装 Redis：
```bash
yum install -y redis
systemctl start redis
systemctl enable redis
```

在后端配置中启用 Redis。

### 11.2 数据库优化

```sql
-- 添加索引
ALTER TABLE orders ADD INDEX idx_status (status);
ALTER TABLE orders ADD INDEX idx_created_at (created_at);
ALTER TABLE products ADD INDEX idx_category (category_id);
ALTER TABLE products ADD INDEX idx_status (status);
```

### 11.3 启用 Gzip 压缩

在 Nginx 配置中添加：
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

---

## 12. 上线检查清单

- [ ] 数据库配置完成
- [ ] 后端服务启动正常
- [ ] 前端构建成功
- [ ] Nginx 配置正确
- [ ] SSL 证书安装完成
- [ ] 防火墙配置正确
- [ ] 安全配置完成
- [ ] 备份策略配置完成
- [ ] 测试订单流程
- [ ] 测试支付功能
- [ ] 资质公示页面配置完成
