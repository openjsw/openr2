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
  <title>文件管理后台</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .error { color: red; }
    .hidden { display: none; }
    pre { background: #f4f4f4; padding: 10px; }
    table { border-collapse: collapse; min-width: 600px; }
    th, td { border: 1px solid #ddd; padding: 8px; }
    th { background: #eee; }
  </style>
</head>
<body>
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
  <table id="file-table">
    <thead><tr><th>ID</th><th>名称</th><th>大小</th><th>过期时间</th><th>操作</th></tr></thead>
    <tbody></tbody>
  </table>
  <button onclick="logout()">退出登录</button>
</div>
<script>
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
  document.getElementById('list-loading').classList.remove('hidden');
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
      tr.innerHTML = \`
        <td>\${f.id}</td>
        <td>\${f.name || '-'}</td>
        <td>\${f.size || '-'} B</td>
        <td>\${f.expire ? new Date(f.expire).toLocaleString() : '-'}</td>
        <td>
          <a href="/file/\${f.id}" target="_blank">访问</a>
          <button onclick="genShort('\${f.id}', this)">短链</button>
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
    if (!res.ok) {
      const err = await res.json().catch(()=>({error:'未知错误'}));
      throw new Error(err.error || \`生成失败 (HTTP \${res.status})\`);
    }
    const { short } = await res.json();
    prompt('短链：', location.origin + '/f/' + short);
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
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('main-section').classList.remove('hidden');
  document.getElementById('upload-form').addEventListener('submit', uploadHandler);
}

function logout() {
  localStorage.removeItem('token');
  token = '';
  location.reload();
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
}
</script>
</body>
</html>
  `;
}
