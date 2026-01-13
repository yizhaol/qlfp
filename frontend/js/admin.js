// frontend/js/admin.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin JS loaded');
    
    // 元素引用
    const backToGameBtn = document.getElementById('back-to-game');
    const logoutBtn = document.getElementById('logout-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const punishmentsList = document.getElementById('punishments-list');
    const addPunishmentBtn = document.getElementById('add-punishment-btn');
    const updatePasswordBtn = document.getElementById('update-password-btn');
    const punishmentModal = document.getElementById('punishment-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    
    // 检查认证
    checkAdminAuth();
    
    // 事件监听
    if (backToGameBtn) {
        backToGameBtn.addEventListener('click', function() {
            window.location.href = '/';
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // 标签页切换
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // 更新活跃标签
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 显示对应内容
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // 加载惩罚列表
    loadPunishments();
    
    // 添加惩罚按钮
    if (addPunishmentBtn) {
        console.log('Add punishment button found');
        addPunishmentBtn.addEventListener('click', function() {
            console.log('Add punishment button clicked');
            showPunishmentModal();
        });
    }
    
    // 关闭模态框
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            punishmentModal.classList.add('hidden');
        });
    });
    
    // 点击模态框外部关闭
    if (punishmentModal) {
        punishmentModal.addEventListener('click', function(e) {
            if (e.target === punishmentModal) {
                punishmentModal.classList.add('hidden');
            }
        });
    }
    
    // 更新密码
    if (updatePasswordBtn) {
        updatePasswordBtn.addEventListener('click', updatePassword);
    }
    
    // ========== 功能函数 ==========
    
    // 检查管理员认证
    async function checkAdminAuth() {
        try {
            const response = await fetch('/api/auth/check');
            const data = await response.json();
            
            if (!data.authenticated) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('检查认证错误:', error);
            window.location.href = '/';
        }
    }
    
    // 加载惩罚列表
    async function loadPunishments() {
        console.log('Loading punishments...');
        try {
            const response = await fetch('/api/admin/punishments');
            const data = await response.json();
            console.log('Punishments response:', data);
            
            if (data.success) {
                renderPunishmentsList(data.punishments);
            } else {
                punishmentsList.innerHTML = '<div class="error">加载失败，请刷新页面</div>';
            }
        } catch (error) {
            console.error('加载惩罚列表错误:', error);
            punishmentsList.innerHTML = '<div class="error">网络错误，请稍后重试</div>';
        }
    }
    
    // 渲染惩罚列表（支持多尺度显示）
    function renderPunishmentsList(punishments) {
        console.log('Rendering punishments:', punishments);
        
        if (!punishments || punishments.length === 0) {
            punishmentsList.innerHTML = '<div class="empty-state">暂无惩罚，点击"添加新惩罚"按钮创建</div>';
            return;
        }
        
        let html = '';
        
        punishments.forEach(punishment => {
            const typeText = getPunishmentTypeText(punishment.punishment_type);
            const statusText = punishment.is_active ? '启用' : '禁用';
            const statusClass = punishment.is_active ? 'active' : 'inactive';
            
            // 解析多尺度
            let intensityTags = '';
            if (punishment.intensity_level) {
                const intensities = punishment.intensity_level.split(',');
                intensities.forEach(intensity => {
                    const trimmed = intensity.trim();
                    if (trimmed) {
                        intensityTags += `<span class="intensity-label ${trimmed}">${getIntensityText(trimmed)}</span>`;
                    }
                });
            }
            
            html += `
                <div class="punishment-item" data-id="${punishment.id}">
                    <div class="punishment-info">
                        <h3>${punishment.title}</h3>
                        <p>${punishment.description}</p>
                        <div class="punishment-meta">
                            <span class="type-label">${typeText}</span>
                            <div class="intensity-tags">
                                ${intensityTags}
                            </div>
                            <span class="status-label ${statusClass}">${statusText}</span>
                        </div>
                    </div>
                    <div class="punishment-actions">
                        <button class="btn-edit" data-id="${punishment.id}">
                            <i class="fas fa-edit"></i> 编辑
                        </button>
                        <button class="btn-delete" data-id="${punishment.id}">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </div>
                </div>
            `;
        });
        
        punishmentsList.innerHTML = html;
        
        // 添加编辑和删除按钮事件
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const punishmentId = this.dataset.id;
                editPunishment(punishmentId);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const punishmentId = this.dataset.id;
                deletePunishment(punishmentId);
            });
        });
    }
    
    // 显示添加/编辑惩罚模态框
    function showPunishmentModal(punishment = null) {
        console.log('Showing punishment modal, punishment:', punishment);
        
        const modalTitle = document.getElementById('modal-title');
        
        // 重置表单
        document.getElementById('punishment-form').reset();
        document.getElementById('punishment-id').value = '';
        
        if (punishment) {
            // 编辑模式
            modalTitle.textContent = '编辑惩罚';
            document.getElementById('punishment-id').value = punishment.id;
            document.getElementById('punishment-title').value = punishment.title;
            document.getElementById('punishment-description').value = punishment.description;
            document.getElementById('punishment-type').value = punishment.punishment_type;
            
            // 解析多尺度并设置复选框
            if (punishment.intensity_level) {
                const intensities = punishment.intensity_level.split(',');
                intensities.forEach(intensity => {
                    const trimmed = intensity.trim();
                    const checkbox = document.getElementById(`check-${trimmed}`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            }
            
            document.getElementById('punishment-active').value = punishment.is_active ? 'true' : 'false';
        } else {
            // 添加模式
            modalTitle.textContent = '添加新惩罚';
            
            // 默认选中中度
            document.getElementById('check-moderate').checked = true;
            document.getElementById('punishment-active').value = 'true';
        }
        
        punishmentModal.classList.remove('hidden');
        console.log('Modal shown');
    }
    
    // 保存惩罚（多选尺度版本）
    async function savePunishment(e) {
        console.log('savePunishment called');
        e.preventDefault();
        
        const punishmentId = document.getElementById('punishment-id').value;
        const title = document.getElementById('punishment-title').value.trim();
        const description = document.getElementById('punishment-description').value.trim();
        const punishmentType = document.getElementById('punishment-type').value;
        const isActive = document.getElementById('punishment-active').value === 'true';
        
        console.log('Form data:', { punishmentId, title, description, punishmentType, isActive });
        
        // 获取选中的尺度（多选）
        const selectedIntensities = [];
        const checkboxes = [
            { id: 'check-mild', value: 'mild' },
            { id: 'check-moderate', value: 'moderate' },
            { id: 'check-intimate', value: 'intimate' },
            { id: 'check-wild', value: 'wild' }
        ];
        
        checkboxes.forEach(checkbox => {
            const element = document.getElementById(checkbox.id);
            if (element && element.checked) {
                selectedIntensities.push(checkbox.value);
            }
        });
        
        console.log('Selected intensities:', selectedIntensities);
        
        if (!title || !description) {
            alert('请填写所有必填字段');
            return;
        }
        
        if (selectedIntensities.length === 0) {
            alert('请至少选择一个尺度等级');
            return;
        }
        
        // 拼接尺度字符串
        const intensityLevel = selectedIntensities.join(',');
        
        const punishmentData = {
            title,
            description,
            punishment_type: punishmentType,
            intensity_level: intensityLevel,
            is_active: isActive
        };
        
        console.log('Sending data:', punishmentData);
        
        try {
            let response;
            let url;
            let method;
            
            if (punishmentId) {
                // 更新现有惩罚
                url = `/api/admin/punishments/${punishmentId}`;
                method = 'PUT';
            } else {
                // 添加新惩罚
                url = '/api/admin/punishments';
                method = 'POST';
            }
            
            console.log(`Making ${method} request to ${url}`);
            
            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(punishmentData)
            });
            
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.success) {
                alert(data.message || '保存成功！');
                punishmentModal.classList.add('hidden');
                loadPunishments(); // 刷新列表
            } else {
                alert(data.message || '保存失败');
            }
        } catch (error) {
            console.error('保存惩罚错误:', error);
            alert('网络错误，请稍后重试: ' + error.message);
        }
    }
    
    // 编辑惩罚
    async function editPunishment(punishmentId) {
        console.log('Editing punishment:', punishmentId);
        try {
            const response = await fetch('/api/admin/punishments');
            const data = await response.json();
            
            if (data.success) {
                const punishment = data.punishments.find(p => p.id == punishmentId);
                if (punishment) {
                    showPunishmentModal(punishment);
                } else {
                    alert('未找到该惩罚');
                }
            }
        } catch (error) {
            console.error('编辑惩罚错误:', error);
            alert('网络错误，请稍后重试');
        }
    }
    
    // 删除惩罚
    async function deletePunishment(punishmentId) {
        if (!confirm('确定要删除这个惩罚吗？此操作不可撤销。')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/admin/punishments/${punishmentId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(data.message);
                loadPunishments(); // 刷新列表
            } else {
                alert(data.message || '删除失败');
            }
        } catch (error) {
            console.error('删除惩罚错误:', error);
            alert('网络错误，请稍后重试');
        }
    }
    
    // 更新密码
    async function updatePassword() {
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (!newPassword || !confirmPassword) {
            alert('请填写密码和确认密码');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('两次输入的密码不一致');
            return;
        }
        
        if (newPassword.length < 4) {
            alert('密码至少需要4个字符');
            return;
        }
        
        try {
            const response = await fetch('/api/admin/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: newPassword })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('密码更新成功');
                document.getElementById('new-password').value = '';
                document.getElementById('confirm-password').value = '';
            } else {
                alert(data.message || '密码更新失败');
            }
        } catch (error) {
            console.error('更新密码错误:', error);
            alert('网络错误，请稍后重试');
        }
    }
    
    // 注销
    async function logout() {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST'
            });
            
            window.location.href = '/';
        } catch (error) {
            console.error('注销错误:', error);
            window.location.href = '/';
        }
    }
    
    // 辅助函数
    function getIntensityText(intensity) {
        const intensityMap = {
            'mild': '轻度',
            'moderate': '中度',
            'intimate': '亲密',
            'wild': '狂野'
        };
        return intensityMap[intensity] || intensity;
    }
    
    function getPunishmentTypeText(type) {
        const typeMap = {
            'male': '男生惩罚',
            'female': '女生惩罚',
            'common': '通用惩罚'
        };
        return typeMap[type] || type;
    }
    
    // 为表单添加提交事件
    const punishmentForm = document.getElementById('punishment-form');
    if (punishmentForm) {
        // 移除旧的事件监听器
        const newForm = punishmentForm.cloneNode(true);
        punishmentForm.parentNode.replaceChild(newForm, punishmentForm);
        
        // 重新获取表单引用并添加事件
        const freshForm = document.getElementById('punishment-form');
        freshForm.addEventListener('submit', function(e) {
            console.log('Form submit triggered');
            savePunishment(e);
        });
    }
});