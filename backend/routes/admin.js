// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// 中间件：检查管理员认证
const checkAdminAuth = (req, res, next) => {
    if (!req.session.authenticated) {
        return res.status(401).json({ success: false, message: '未授权访问' });
    }
    next();
};

// 获取所有惩罚
router.get('/punishments', checkAdminAuth, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM punishments ORDER BY created_at DESC'
        );
        
        console.log(`获取惩罚列表，数量: ${rows.length}`);
        res.json({ success: true, punishments: rows });
    } catch (error) {
        console.error('获取惩罚列表错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 添加惩罚（支持多尺度字符串）
router.post('/punishments', checkAdminAuth, async (req, res) => {
    try {
        console.log('收到惩罚数据:', req.body);
        
        const { title, description, punishment_type, intensity_level, is_active = true } = req.body;
        
        // 验证必填字段
        if (!title || !description || !punishment_type || !intensity_level) {
            return res.status(400).json({ 
                success: false, 
                message: '缺少必填字段：标题、描述、类型或尺度' 
            });
        }
        
        // 验证尺度格式
        if (typeof intensity_level !== 'string') {
            return res.status(400).json({ 
                success: false, 
                message: '尺度格式错误' 
            });
        }
        
        console.log(`添加惩罚: ${title}, 尺度: ${intensity_level}`);
        
        const [result] = await pool.execute(
            'INSERT INTO punishments (title, description, punishment_type, intensity_level, is_active) VALUES (?, ?, ?, ?, ?)',
            [title, description, punishment_type, intensity_level, is_active]
        );
        
        console.log('插入结果:', result);
        
        res.json({ 
            success: true, 
            message: '惩罚添加成功',
            id: result.insertId 
        });
    } catch (error) {
        console.error('添加惩罚错误:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器错误: ' + error.message 
        });
    }
});

// 更新惩罚
router.put('/punishments/:id', checkAdminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, punishment_type, intensity_level, is_active } = req.body;
        
        console.log(`更新惩罚 ${id}:`, { title, intensity_level });
        
        // 验证必填字段
        if (!title || !description || !punishment_type || !intensity_level) {
            return res.status(400).json({ 
                success: false, 
                message: '缺少必填字段' 
            });
        }
        
        await pool.execute(
            `UPDATE punishments 
             SET title = ?, description = ?, punishment_type = ?, 
                 intensity_level = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [title, description, punishment_type, intensity_level, is_active, id]
        );
        
        res.json({ success: true, message: '惩罚更新成功' });
    } catch (error) {
        console.error('更新惩罚错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 删除惩罚
router.delete('/punishments/:id', checkAdminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`删除惩罚 ${id}`);
        
        await pool.execute('DELETE FROM punishments WHERE id = ?', [id]);
        
        res.json({ success: true, message: '惩罚删除成功' });
    } catch (error) {
        console.error('删除惩罚错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 更新访问密码
router.put('/password', checkAdminAuth, async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password || password.length < 4) {
            return res.status(400).json({ 
                success: false, 
                message: '密码至少需要4个字符' 
            });
        }
        
        await pool.execute(
            `INSERT INTO game_config (config_key, config_value) 
             VALUES ('access_password', ?) 
             ON DUPLICATE KEY UPDATE config_value = ?`,
            [password, password]
        );
        
        res.json({ success: true, message: '密码更新成功' });
    } catch (error) {
        console.error('更新密码错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

module.exports = router;