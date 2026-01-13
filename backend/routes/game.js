// backend/routes/game.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// 开始新游戏
router.post('/start', async (req, res) => {
    try {
        const { intensity } = req.body;
        
        // 生成游戏会话代码
        const sessionCode = 'GAME' + Date.now().toString().slice(-6);
        
        // 创建游戏会话
        const [result] = await pool.execute(
            'INSERT INTO game_sessions (session_code, intensity_level, game_state) VALUES (?, ?, ?)',
            [sessionCode, intensity, 'playing']
        );
        
        res.json({ 
            success: true, 
            sessionCode, 
            message: '游戏开始！男生先翻牌' 
        });
    } catch (error) {
        console.error('开始游戏错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 获取惩罚选项（支持多尺度）
router.get('/punishments/:playerType/:intensity', async (req, res) => {
    try {
        const { playerType, intensity } = req.params;
        
        // 修改查询，支持逗号分隔的多尺度
        const [rows] = await pool.execute(
            `SELECT * FROM punishments 
             WHERE is_active = TRUE 
             AND (punishment_type = ? OR punishment_type = 'common')
             AND (
                 intensity_level = ? 
                 OR intensity_level LIKE ?
                 OR intensity_level LIKE ?
                 OR intensity_level LIKE ?
                 OR intensity_level LIKE ?
             )
             ORDER BY RAND() 
             LIMIT 6`,
            [
                playerType, 
                intensity, // 完全匹配
                `${intensity},%`, // 在开头
                `%,${intensity},%`, // 在中间
                `%,${intensity}`, // 在结尾
                '%,%' // 包含逗号（额外的安全措施）
            ]
        );
        
        console.log(`获取惩罚: playerType=${playerType}, intensity=${intensity}, 数量=${rows.length}`);
        
        res.json({ success: true, punishments: rows });
    } catch (error) {
        console.error('获取惩罚错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 切换玩家
router.post('/switch-player', async (req, res) => {
    try {
        const { sessionCode } = req.body;
        
        // 获取当前玩家
        const [sessions] = await pool.execute(
            'SELECT current_player FROM game_sessions WHERE session_code = ?',
            [sessionCode]
        );
        
        if (sessions.length === 0) {
            return res.json({ success: false, message: '游戏会话不存在' });
        }
        
        const currentPlayer = sessions[0].current_player;
        const nextPlayer = currentPlayer === 'male' ? 'female' : 'male';
        
        // 更新当前玩家
        await pool.execute(
            'UPDATE game_sessions SET current_player = ? WHERE session_code = ?',
            [nextPlayer, sessionCode]
        );
        
        res.json({ 
            success: true, 
            nextPlayer, 
            message: `轮到${nextPlayer === 'male' ? '男生' : '女生'}翻牌` 
        });
    } catch (error) {
        console.error('切换玩家错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 结束游戏
router.post('/end', async (req, res) => {
    try {
        const { sessionCode } = req.body;
        
        await pool.execute(
            'UPDATE game_sessions SET game_state = ? WHERE session_code = ?',
            ['finished', sessionCode]
        );
        
        res.json({ success: true, message: '游戏结束' });
    } catch (error) {
        console.error('结束游戏错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

module.exports = router;