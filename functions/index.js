/**
 * functions/index.js
 * 动态渲染首页和 /admin 管理后台
 */
export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const path = url.pathname;

  // 判断路径是 /admin
  const isAdmin = path === '/admin' || path.startsWith('/admin?');

  return new Response(renderPage(isAdmin), {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' }
  });
}

function renderPage(isAdmin) {
  return `
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <title>${isAdmin ? '文件管理后台' : '文件分享系统'}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .error { color: red; }
    .hidden { display: none; }
    pre { background: #f4f4f4; padding: 10px; }
  </style>
</head>
<body>
  ${isAdmin ? adminHTML() : homeHTML()}
  <script>${clientScript()}</script>
</body>
</html>`;
}

function homeHTML() {
  return `
<h1>欢迎使用文件分享系统</h1>
<p><a href="/admin">进入后台管理</a></p>`;
}

function adminHTML() {
  return `
<h1>管理后台</h1>
<div id="login-section">
  <h2>登录</h2>
  <div id="login-error" class="error hidden"></div>
  <input id="login-user" placeholder="用户名" />
  <input id="login-pass" type="password" placeholder="密码" />
  <button onclick="login()">登录</button>
</div>

<div id="main-section" class="hidden">
  <h2>上传文件</h2>
  <div id="upload-error" class="error hidden"></div>
  <form id="upload-form">
    <input type="file" id="upload-input" required />
    <label>过期时间（可选）: <input type="datetime-local" id="upload-expire" /></label>
    <button type="submit">上传</button>
  </form>

  <h2>文件列表</h2>
  <div id="list-error" class="error hidden"></div>
  <div id="list-loading">加载中...</div>
  <table border="1" cellpadding="5" id="file-table">
    <thead><tr><th>ID</th><th>过期时间</th><th>操作</th></tr></thead>
    <tbody></tbody>
  </table>
</div>`;
}

function clientScript() {
  return `
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
    if (!res.ok) throw new Error(\`登录失败 (HTTP \${res.status})\`);
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
    if (!res.ok) throw new Error(\`上传失败 (HTTP \${res.status})\`);
    await loadList();
  } catch (e) {
    showError('upload-error', e.message);
  }
}

async function loadList() {
  clearError('list-error');
  document.getElementById('list-loading').classList.remove('hidden');
  try {
    const res = await fetch(api + '/list', {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (!res.ok) throw new Error(\`获取列表失败 (HTTP \${res.status})\`);
    const items = await res.json();
    const tbody = document.querySelector('#file-table tbody');
    tbody.innerHTML = '';
    items.forEach(f => {
      const tr = document.createElement('tr');
      tr.innerHTML = \`
        <td>\${f.id}</td>
        <td>\${f.expire || '-'}</td>
        <td>
          <button onclick="genShort('\${f.id}', this)">生成短链</button>
          <button onclick="del('\${f.id}', this)">删除</button>
        </td>\`;
      tbody.appendChild(tr);
    });
  } catch (e) {
    showError('list-error', e.message);
  } finally {
    document.getElementById('list-loading').classList.add('hidden');
  }
}

async function genShort(id, btn) {
  try {
    const res = await fetch(api + '/short', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ fileId: id })
    });
    if (!res.ok) throw new Error(\`生成失败 (HTTP \${res.status})\`);
    const { short } = await res.json();
    alert('短链: ' + location.origin + '/f/' + short);
  } catch (e) {
    alert('错误: ' + e.message);
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
    if (!res.ok) throw new Error(\`删除失败 (HTTP \${res.status})\`);
    loadList();
  } catch (e) {
    alert('错误: ' + e.message);
  }
}

function showMain() {
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('main-section').classList.remove('hidden');
  document.getElementById('upload-form').addEventListener('submit', uploadHandler);
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.remove('hidden');
}
function clearError(id) {
  const el = document.getElementById(id);
  el.textContent = '';
  el.classList.add('hidden');
}

// 自动登录尝试
if (token) {
  showMain();
  loadList();
}`;
}
