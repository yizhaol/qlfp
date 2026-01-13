// frontend/js/auth.js
document.addEventListener('DOMContentLoaded', function() {
    const authContainer = document.getElementById('auth-container');
    const gameContainer = document.getElementById('game-container');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const adminBtn = document.getElementById('admin-btn');

    // 检查是否已认证
    checkAuth();

    // 登录按钮点击事件
    loginBtn.addEventListener('click', login);

    // 回车键登录
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });

    // 管理后台按钮
    if (adminBtn) {
        adminBtn.addEventListener('click', function() {
            window.location.href = '/admin';
        });
    }

    // 验证密码
    async function login() {
        const password = passwordInput.value.trim();

        if (!password) {
            alert('请输入密码');
            return;
        }

        try {
            const response = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (data.success) {
                // 认证成功，显示游戏界面
                authContainer.classList.add('hidden');
                gameContainer.classList.remove('hidden');
            } else {
                alert(data.message || '密码错误');
                passwordInput.value = '';
                passwordInput.focus();
            }
        } catch (error) {
            console.error('登录错误:', error);
            alert('网络错误，请稍后重试');
        }
    }

    // 检查认证状态
    async function checkAuth() {
        try {
            const response = await fetch('/api/auth/check');
            const data = await response.json();

            if (data.authenticated) {
                authContainer.classList.add('hidden');
                gameContainer.classList.remove('hidden');
            }
        } catch (error) {
            console.error('检查认证错误:', error);
        }
    }
});