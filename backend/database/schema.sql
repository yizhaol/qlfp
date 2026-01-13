-- database/create_simple_db.sql
-- 简单的数据库创建脚本（支持多尺度）

DROP DATABASE IF EXISTS couple_card_game;
CREATE DATABASE couple_card_game;
USE couple_card_game;

-- 惩罚表（intensity_level 存储逗号分隔的尺度）
CREATE TABLE punishments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    punishment_type ENUM('male', 'female', 'common') NOT NULL,
    intensity_level VARCHAR(100) NOT NULL DEFAULT 'moderate',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 游戏会话表
CREATE TABLE game_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_code VARCHAR(50) UNIQUE NOT NULL,
    current_player ENUM('male', 'female') DEFAULT 'male',
    intensity_level ENUM('mild', 'moderate', 'intimate', 'wild') NOT NULL,
    game_state ENUM('waiting', 'playing', 'finished') DEFAULT 'waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 游戏配置表
CREATE TABLE game_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入默认配置
INSERT INTO game_config (config_key, config_value) VALUES ('access_password', 'love123');

-- 插入示例惩罚（支持多尺度）
INSERT INTO punishments (title, description, punishment_type, intensity_level) VALUES
('对视10秒', '深情对视10秒钟，不能笑场', 'common', 'mild,moderate'),
('模仿对方说话', '模仿对方说"我爱你"的样子', 'common', 'mild'),
('说出对方三个优点', '真诚地说出对方三个优点', 'common', 'mild,moderate,intimate'),
('亲额头', '轻轻亲吻对方的额头', 'common', 'moderate,intimate'),
('公主抱10秒', '男生公主抱女生10秒钟', 'male', 'moderate'),
('为对方按摩肩膀', '为对方按摩肩膀1分钟', 'common', 'moderate,intimate'),
('唱一首情歌', '为对方唱一首情歌', 'common', 'intimate,wild'),
('说出一件浪漫的事', '说出一件你想和对方做的浪漫事情', 'common', 'moderate,intimate'),
('喂对方吃水果', '亲手喂对方吃一块水果', 'common', 'moderate,intimate'),
('深情拥抱', '拥抱对方并说一句情话', 'common', 'moderate,intimate');

SELECT '数据库创建完成！' as message;
SELECT '默认密码: love123' as info;
SELECT COUNT(*) as '惩罚总数' FROM punishments;