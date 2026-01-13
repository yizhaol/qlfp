// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// 验证密码
router.post('/verify', async (req, res) => {
    try {
        const { password } = req.body;

        // 从数据库获取密码
        const [rows] = await pool.execute(
            'SELECT config_value FROM game_config WHERE config_key = ?',
            ['access_password']
        );

        if (rows.length === 0) {
            return res.status(500).json({ success: false, message: '系统配置错误' });
        }

        const storedPassword = rows[0].config_value;

        if (password === storedPassword) {
            req.session.authenticated = true;
            return res.json({ success: true, message: '验证成功' });
        } else {
            return res.json({ success: false, message: '密码错误' });
        }
    } catch (error) {
        console.error('验证错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 检查认证状态
router.get('/check', (req, res) => {
    if (req.session.authenticated) {
        res.json({ authenticated: true });
    } else {
        res.json({ authenticated: false });
    }
});

// 注销
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

module.exports = router;