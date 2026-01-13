// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
require('dotenv').config();

// 导入路由
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 8080;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'couple-game-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // 生产环境应设为true并配置HTTPS
}));

// 静态文件服务（用于前端）
app.use(express.static('../frontend'));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/admin', adminRoutes);

// 主页路由
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: '../frontend' });
});

app.get('/admin', (req, res) => {
    res.sendFile('admin.html', { root: '../frontend' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});