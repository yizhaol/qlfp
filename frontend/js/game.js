// frontend/js/game.js
document.addEventListener('DOMContentLoaded', function() {
    // 元素引用
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    const startGameBtn = document.getElementById('start-game-btn');
    const backToSetupBtn = document.getElementById('back-to-setup-btn');
    const endGameBtn = document.getElementById('end-game-btn');
    
    // 游戏状态
    let gameState = {
        sessionCode: null,
        currentPlayer: 'male',
        intensity: 'moderate',
        isPunishmentRevealed: false,
        currentPunishment: null
    };
    
    // ========== 尺度选择卡片交互 ==========
    const intensityCards = document.querySelectorAll('.intensity-card');
    const intensitySelect = document.getElementById('intensity-select');
    
    // 初始化尺度卡片点击事件
    intensityCards.forEach(card => {
        card.addEventListener('click', function() {
            // 移除所有卡片的active类
            intensityCards.forEach(c => c.classList.remove('active'));
            
            // 添加active类到点击的卡片
            this.classList.add('active');
            
            // 更新隐藏的input值
            const intensity = this.dataset.intensity;
            intensitySelect.value = intensity;
            
            // 添加视觉反馈
            highlightSelectedIntensity(intensity);
            
            // 更新尺度信息面板（如果存在）
            updateIntensityInfoPanel(intensity);
        });
    });
    
    // 高亮显示已选择的尺度
    function highlightSelectedIntensity(intensity) {
        const selectedCard = document.querySelector(`.intensity-card[data-intensity="${intensity}"]`);
        if (selectedCard) {
            selectedCard.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                selectedCard.style.animation = '';
            }, 500);
        }
    }
    
    // 更新尺度信息面板（可选功能）
    function updateIntensityInfoPanel(intensity) {
        const infoTabs = document.querySelectorAll('.info-tab');
        const infoPanels = document.querySelectorAll('.info-panel');
        
        if (infoTabs.length > 0) {
            // 移除所有激活状态
            infoTabs.forEach(tab => tab.classList.remove('active'));
            infoPanels.forEach(panel => panel.classList.remove('active'));
            
            // 激活对应的标签和面板
            const activeTab = document.querySelector(`.info-tab[data-tab="${intensity}"]`);
            const activePanel = document.getElementById(`${intensity}-info`);
            
            if (activeTab) activeTab.classList.add('active');
            if (activePanel) activePanel.classList.add('active');
        }
    }
    
    // 初始化尺度信息面板点击事件（可选功能）
    const infoTabs = document.querySelectorAll('.info-tab');
    infoTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // 移除所有激活状态
            infoTabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.info-panel').forEach(p => p.classList.remove('active'));
            
            // 激活点击的标签和对应的面板
            this.classList.add('active');
            document.getElementById(`${tabId}-info`).classList.add('active');
            
            // 同时选中对应的尺度卡片
            intensityCards.forEach(card => card.classList.remove('active'));
            const correspondingCard = document.querySelector(`.intensity-card[data-intensity="${tabId}"]`);
            if (correspondingCard) {
                correspondingCard.classList.add('active');
                intensitySelect.value = tabId;
                highlightSelectedIntensity(tabId);
            }
        });
    });
    
    // ========== 游戏事件监听 ==========
    if (startGameBtn) {
        startGameBtn.addEventListener('click', startGame);
    }
    
    if (backToSetupBtn) {
        backToSetupBtn.addEventListener('click', function() {
            gameScreen.classList.add('hidden');
            setupScreen.classList.remove('hidden');
        });
    }
    
    if (endGameBtn) {
        endGameBtn.addEventListener('click', endGame);
    }
    
    // ========== 游戏功能函数 ==========
    
    // 开始游戏
    async function startGame() {
        gameState.intensity = intensitySelect.value;
        
        try {
            const response = await fetch('/api/game/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    intensity: gameState.intensity
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                gameState.sessionCode = data.sessionCode;
                
                // 切换到游戏界面
                setupScreen.classList.add('hidden');
                gameScreen.classList.remove('hidden');
                
                // 更新界面
                updateGameUI();
                loadCards();
            } else {
                alert(data.message || '开始游戏失败');
            }
        } catch (error) {
            console.error('开始游戏错误:', error);
            alert('网络错误，请稍后重试');
        }
    }
    
    // 更新游戏界面
    function updateGameUI() {
        // 更新会话代码
        document.getElementById('session-code').textContent = `游戏代码: ${gameState.sessionCode}`;
        
        // 更新当前玩家显示
        const playerText = document.getElementById('current-player-text');
        playerText.textContent = `当前玩家：${gameState.currentPlayer === 'male' ? '男生' : '女生'}`;
        
        // 更新玩家卡片状态
        document.querySelector('.player-card.male').classList.toggle('active', gameState.currentPlayer === 'male');
        document.querySelector('.player-card.female').classList.toggle('active', gameState.currentPlayer === 'female');
        
        // 更新玩家状态文本
        document.querySelector('.player-card.male .player-status').textContent = 
            gameState.currentPlayer === 'male' ? '当前回合' : '等待中';
        document.querySelector('.player-card.female .player-status').textContent = 
            gameState.currentPlayer === 'female' ? '当前回合' : '等待中';
        
        // 更新指令文本
        document.getElementById('instruction-text').textContent = 
            `${gameState.currentPlayer === 'male' ? '男生' : '女生'}，请选择一张牌`;
    }
    
    // 加载卡片
    async function loadCards() {
        const cardsContainer = document.getElementById('cards-container');
        cardsContainer.innerHTML = '';
        
        try {
            const response = await fetch(`/api/game/punishments/${gameState.currentPlayer}/${gameState.intensity}`);
            const data = await response.json();
            
            if (data.success && data.punishments.length >= 3) {
                // 取前3个惩罚作为卡片
                const punishments = data.punishments.slice(0, 3);
                
                // 创建卡片
                punishments.forEach((punishment, index) => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.dataset.punishmentId = punishment.id;
                    card.dataset.punishmentData = JSON.stringify(punishment);
                    
                    card.innerHTML = `
                        <div class="card-front">
                            <i class="fas fa-question"></i>
                        </div>
                        <div class="card-back">
                            <h4>${punishment.title}</h4>
                            <p>${punishment.description}</p>
                        </div>
                    `;
                    
                    // 添加点击事件
                    card.addEventListener('click', function() {
                        if (!gameState.isPunishmentRevealed) {
                            revealPunishment(this);
                        }
                    });
                    
                    cardsContainer.appendChild(card);
                });
                
                // 显示卡片区域，隐藏惩罚区域
                document.querySelector('.cards-section').classList.remove('hidden');
                document.getElementById('punishment-section').classList.add('hidden');
                gameState.isPunishmentRevealed = false;
            } else {
                alert('获取惩罚失败，请稍后重试');
            }
        } catch (error) {
            console.error('加载卡片错误:', error);
            alert('网络错误，请稍后重试');
        }
    }
    
    // 揭示惩罚
    function revealPunishment(cardElement) {
        // 翻转卡片
        cardElement.classList.add('flipped');
        
        // 获取惩罚数据
        const punishmentData = JSON.parse(cardElement.dataset.punishmentData);
        gameState.currentPunishment = punishmentData;
        
        // 显示惩罚内容
        document.getElementById('punishment-title').textContent = punishmentData.title;
        document.getElementById('punishment-desc').textContent = punishmentData.description;
        
        // 设置惩罚强度标签
        const intensityElement = document.getElementById('punishment-intensity');
        intensityElement.textContent = getIntensityText(punishmentData.intensity_level);
        intensityElement.className = `intensity-label ${punishmentData.intensity_level}`;
        
        // 设置惩罚类型标签
        const typeElement = document.getElementById('punishment-type');
        typeElement.textContent = getPunishmentTypeText(punishmentData.punishment_type);
        
        // 显示惩罚区域，隐藏卡片区域
        document.querySelector('.cards-section').classList.add('hidden');
        document.getElementById('punishment-section').classList.remove('hidden');
        
        // 设置合并按钮事件（移除旧的事件监听器，添加新的）
        const completeBtn = document.getElementById('complete-and-next-btn');
        const newCompleteBtn = completeBtn.cloneNode(true);
        completeBtn.parentNode.replaceChild(newCompleteBtn, completeBtn);
        newCompleteBtn.addEventListener('click', completeAndSwitchPlayer);
        
        gameState.isPunishmentRevealed = true;
    }
    
    // 完成惩罚并切换到下一个玩家
    async function completeAndSwitchPlayer() {
        try {
            const response = await fetch('/api/game/switch-player', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionCode: gameState.sessionCode
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // 切换当前玩家
                gameState.currentPlayer = data.nextPlayer;
                
                // 显示视觉反馈
                showSwitchFeedback(`轮到${gameState.currentPlayer === 'male' ? '男生' : '女生'}抽卡`);
                
                // 更新界面
                updateGameUI();
                loadCards();
            } else {
                alert(data.message || '切换玩家失败');
            }
        } catch (error) {
            console.error('切换玩家错误:', error);
            alert('网络错误，请稍后重试');
        }
    }
    
    // 显示切换玩家的视觉反馈
    function showSwitchFeedback(message) {
        // 创建一个反馈提示元素
        const feedback = document.createElement('div');
        feedback.className = 'switch-feedback';
        feedback.textContent = message;
        
        document.body.appendChild(feedback);
        
        // 1.5秒后自动移除
        setTimeout(() => {
            feedback.remove();
        }, 1500);
    }
    
    // 结束游戏
    async function endGame() {
        if (confirm('确定要结束游戏吗？')) {
            try {
                const response = await fetch('/api/game/end', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sessionCode: gameState.sessionCode
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // 返回设置界面
                    gameScreen.classList.add('hidden');
                    setupScreen.classList.remove('hidden');
                    
                    // 重置游戏状态
                    gameState = {
                        sessionCode: null,
                        currentPlayer: 'male',
                        intensity: 'moderate',
                        isPunishmentRevealed: false,
                        currentPunishment: null
                    };
                }
            } catch (error) {
                console.error('结束游戏错误:', error);
                alert('网络错误，请稍后重试');
            }
        }
    }
    
    // ========== 辅助函数 ==========
    
    // 获取尺度文本
    function getIntensityText(intensity) {
        const intensityMap = {
            'mild': '轻度',
            'moderate': '中度',
            'intimate': '亲密',
            'wild': '狂野'
        };
        return intensityMap[intensity] || intensity;
    }
    
    // 获取惩罚类型文本
    function getPunishmentTypeText(type) {
        const typeMap = {
            'male': '男生惩罚',
            'female': '女生惩罚',
            'common': '通用惩罚'
        };
        return typeMap[type] || type;
    }
    
    // 添加动画样式到页面
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { 
                opacity: 0; 
                transform: translate(-50%, -50%) scale(0.8); 
            }
            20% { 
                opacity: 1; 
                transform: translate(-50%, -50%) scale(1.1); 
            }
            40% { 
                opacity: 1; 
                transform: translate(-50%, -50%) scale(1); 
            }
            80% { 
                opacity: 1; 
                transform: translate(-50%, -50%) scale(1); 
            }
            100% { 
                opacity: 0; 
                transform: translate(-50%, -50%) scale(0.9); 
            }
        }
        
        @keyframes pulse {
            0% { transform: translateY(-5px) scale(1); box-shadow: 0 12px 25px rgba(255, 107, 139, 0.25); }
            50% { transform: translateY(-5px) scale(1.05); box-shadow: 0 15px 30px rgba(255, 107, 139, 0.4); }
            100% { transform: translateY(-5px) scale(1); box-shadow: 0 12px 25px rgba(255, 107, 139, 0.25); }
        }
        
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
            100% { transform: translateY(0px); }
        }
    `;
    document.head.appendChild(style);
});