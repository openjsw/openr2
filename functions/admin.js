export async function onRequestGet() {
  return new Response(renderAdminPage(), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

function renderAdminPage() {
  return `
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <title>后台管理 · OpenJSW 文件托管</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://styl.openjsw.net/style.css" />
  <style>
    html, body {
      min-height: 100vh; margin: 0; padding: 0;
      display: flex; flex-direction: column;
    }
    main { flex: 1 0 auto; }
    footer { flex-shrink: 0; }
  </style>
</head>
<body>
  <header>
    <div class="header-main">
      <span class="logo">OpenJSW 文件托管</span>
      <nav class="nav-links" aria-label="主导航">
        <a href="/">首页</a>
        <a href="/admin" aria-current="page">后台管理</a>
      </nav>
      <button class="menu-btn" aria-label="打开菜单" aria-controls="drawer-menu" aria-expanded="false" onclick="toggleMenu()" tabindex="0">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="drawer" id="drawer-menu" role="navigation" aria-label="主菜单">
      <a href="/" tabindex="0">首页</a>
      <a href="/admin" aria-current="page" tabindex="0">后台管理</a>
      <button class="close-btn" aria-label="关闭菜单" onclick="toggleMenu()" tabindex="0">关闭</button>
    </div>
  </header>
  <main>
    <div class="container" aria-label="后台管理界面">
      <div id="login-section">
        <h1 style="text-align:center;margin-top:0;">后台登录</h1>
        <div id="login-error" class="error" role="alert" style="display:none;"></div>
        <form onsubmit="login();return false;" aria-label="登录表单">
          <label for="login-user">用户名</label>
          <input id="login-user" autocomplete="username" placeholder="请输入管理员用户名" required>
          <label for="login-pass">密码</label>
          <input id="login-pass" type="password" autocomplete="current-password" placeholder="请输入密码" required>
          <button style="width:100%;" type="submit">登录</button>
        </form>
      </div>
      <div id="main-section" style="display:none;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2em;">
          <h1 style="margin:0;font-size:1.4em;">文件后台管理</h1>
          <button onclick="logout()" style="background:#e63946;" aria-label="退出登录">退出登录</button>
        </div>
        <div style="margin-bottom:1.2em; border-bottom:1px solid var(--border);"></div>
        <h2 style="margin-top:1.3em;">上传新文件</h2>
        <div id="upload-error" class="error" role="alert" style="display:none;"></div>
        <form id="upload-form" style="margin-bottom:1.2em;" aria-label="上传表单">
          <label for="upload-input">选择文件</label>
          <input type="file" id="upload-input" required />
          <label for="upload-expire">过期时间（可选）</label>
          <input type="datetime-local" id="upload-expire" style="max-width:180px;display:inline-block;" />
          <button type="submit" class="btn">上传</button>
        </form>
        <h2 style="margin-top:2.2em;">文件列表</h2>
        <div id="list-error" class="error" role="alert" style="display:none;"></div>
        <div id="list-loading" class="info" style="display:none;">加载中...</div>
        <table id="file-table" aria-label="文件列表">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">名称</th>
              <th scope="col">大小</th>
              <th scope="col">过期时间</th>
              <th scope="col">操作</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
        <div style="text-align:right;color:#999;font-size:0.96em;">Powered by openjsw.net</div>
      </div>
    </div>
  </main>
  <footer>
    <div class="footer-main">
      Powered by <a href="https://openjsw.net" target="_blank">openjsw.net</a>
    </div>
  </footer>
  <script>
    // Header无障碍抽屉菜单
    function toggleMenu() {
      var drawer = document.getElementById('drawer-menu');
      var btn = document.querySelector('.menu-btn');
      var open = !drawer.classList.contains('open');
      drawer.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        drawer.querySelector('a').focus();
        document.body.style.overflow='hidden';
      } else {
        btn.focus();
        document.body.style.overflow='';
      }
    }
    document.addEventListener('keydown', function(e) {
      var drawer = document.getElementById('drawer-menu');
      if (drawer.classList.contains('open') && (e.key === 'Escape' || e.keyCode === 27)) {
        toggleMenu();
      }
    });

    // 后台JS（与前述兼容）
    const api = '/api';
    let token = localStorage.getItem('token') || '';

    async function login() {
      clearError('login-error');
      const user = document.getElementById('login-user').value;
      const pass = document.getElementById('login-pass').value;
      try {
        const res = await fetch(api + '/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user, pass })
        });
        if (!res.ok) {
          const err = await res.json().catch(()=>({error:'未知错误'}));
          throw new Error(err.error || \`登录失败 (HTTP \${res.status})\`);
        }
        const { token: t } = await res.json();
        token = t;
        localStorage.setItem('token', token);
        showMain();
        loadList();
      } catch (e) {
        showError('login-error', e.message);
      }
    }

    async function uploadHandler(e) {
      e.preventDefault();
      clearError('upload-error');
      const file = document.getElementById('upload-input').files[0];
      const expire = document.getElementById('upload-expire').value;
      if (!file) return showError('upload-error', '请选择文件');
      const form = new FormData();
      form.append('file', file);
      if (expire) form.append('expire', new Date(expire).toISOString());
      try {
        const res = await fetch(api + '/upload', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token },
          body: form
        });
        if (!res.ok) {
          const err = await res.json().catch(()=>({error:'未知错误'}));
          throw new Error(err.error || \`上传失败 (HTTP \${res.status})\`);
        }
        document.getElementById('upload-input').value = '';
        await loadList();
      } catch (e) {
        showError('upload-error', e.message);
      }
    }

    async function loadList() {
      clearError('list-error');
      document.getElementById('list-loading').style.display = '';
      try {
        const res = await fetch(api + '/list', {
          headers: { Authorization: 'Bearer ' + token }
        });
        if (!res.ok) {
          const err = await res.json().catch(()=>({error:'未知错误'}));
          throw new Error(err.error || \`获取列表失败 (HTTP \${res.status})\`);
        }
        const items = await res.json();
        const tbody = document.querySelector('#file-table tbody');
        tbody.innerHTML = '';
        items.forEach(f => {
          const tr = document.createElement('tr');
          tr.tabIndex = 0; // 支持键盘聚焦
          tr.innerHTML = \`
            <td>\${f.id}</td>
            <td>\${f.name || '-'}</td>
            <td>\${f.size || '-'} B</td>
            <td>\${f.expire ? new Date(f.expire).toLocaleString() : '-'}</td>
            <td>
              <a href="/file/\${f.id}" target="_blank" class="btn" style="background:#e0e7ff;color:#222;margin-right:0.6em;">访问</a>
              <button onclick="del('\${f.id}', this)" class="btn" style="background:#ef4444;" aria-label="删除">删除</button>
            </td>\`;
          tbody.appendChild(tr);
        });
      } catch (e) {
        showError('list-error', e.message);
      } finally {
        document.getElementById('list-loading').style.display = 'none';
      }
    }

    async function del(id, btn) {
      if (!confirm('确认删除?')) return;
      try {
        const res = await fetch(api + '/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ fileId: id })
        });
        if (!res.ok) {
          const err = await res.json().catch(()=>({error:'未知错误'}));
          throw new Error(err.error || \`删除失败 (HTTP \${res.status})\`);
        }
        loadList();
      } catch (e) {
        alert('错误: ' + e.message);
      }
    }

    function showMain() {
      document.getElementById('login-section').style.display = 'none';
      document.getElementById('main-section').style.display = '';
      document.getElementById('upload-form').addEventListener('submit', uploadHandler);
      document.getElementById('file-table').focus();
    }

    function logout() {
      localStorage.removeItem('token');
      token = '';
      location.reload();
    }

    function showError(id, msg) {
      const el = document.getElementById(id);
      el.textContent = msg;
      el.style.display = '';
    }
    function clearError(id) {
      const el = document.getElementById(id);
      el.textContent = '';
      el.style.display = 'none';
    }

    // 自动登录尝试
    if (token) {
      showMain();
      loadList();
    }
  </script>
</body>
</html>
  `;
}
