// backend/database/testConnection.js
const pool = require('../config/database');

async function testConnection() {
    try {
        // 测试数据库连接
        const [rows] = await pool.execute('SELECT 1 + 1 AS result');
        console.log('✅ 数据库连接成功！');
        console.log('测试查询结果:', rows[0].result);
        
        // 检查表是否存在
        const [tables] = await pool.execute(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = 'couple_card_game'
        `);
        
        console.log('\n📊 数据库中的表：');
        tables.forEach(table => {
            console.log(`  - ${table.TABLE_NAME}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ 数据库连接失败：', error.message);
        process.exit(1);
    }
}

testConnection();