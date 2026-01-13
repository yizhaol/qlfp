# 情侣翻牌游戏

一个有趣的情侣互动游戏网站，支持密码保护、男女轮流翻牌、惩罚执行和后台管理。

## 功能特点

### 核心功能
- 🔐 密码保护访问
- 👫 男女轮流翻牌游戏机制
- 🎯 按尺度分级惩罚系统
- 📱 响应式设计（支持PC和手机）
- 🗃️ MySQL数据存储

### 惩罚管理
- ✏️ 添加/编辑/删除惩罚
- 🏷️ 惩罚类型：男生/女生/通用
- 📏 尺度等级：轻度/中度/亲密/狂野
- 🔄 实时更新惩罚列表

### 游戏流程
1. 输入密码进入游戏
2. 选择游戏尺度
3. 男女轮流翻牌（每次3选1）
4. 执行翻到的惩罚
5. 切换到对方继续游戏

## 技术栈

### 后端
- Node.js + Express
- MySQL数据库
- RESTful API

### 前端
- HTML5 + CSS3 + JavaScript
- 响应式设计
- 无框架原生实现

## 快速开始

### 1. 环境要求
- Node.js 14+
- MySQL 5.7+
- 现代浏览器

### 2. 安装步骤

```bash
# 克隆项目
讲项目下载到服务器/电脑

# 进入后端目录
cd backend

# 复制环境变量文件
cp .env.example .env

# 编辑.env文件，配置数据库信息
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=couple_card_game

# 安装依赖
npm install

# 初始化数据库
npm run init-db

# 启动服务器
npm start
```
### 界面展示
## 电脑端界面
# 登录界面
<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/8a1174fd-e2d7-40e0-82e5-9b2bfd25acb5" />
# 选择游戏界面
<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/ae3144ae-aba3-4caf-a7e1-70139d83dca8" />
# 游戏界面
<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/380ed814-cce9-442e-973f-79ef30fef0fb" />
# 后台界面
<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/f5828c52-a4be-483b-ab0e-a816698ec06c" />
<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/ed381444-a981-4671-b8b0-a6f43a0bf910" />


