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
  <title>文件后台管理 · OpenJSW</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    /* 通用样式 v0.1（直接引用即可） */
    :root {
      --main-bg: #f7f9fa;
      --main-color: #222;
      --accent: #0066ff;
      --accent-hover: #0041a3;
      --border: #e5e7eb;
      --radius: 10px;
      --error: #e63946;
      --success: #2fb170;
      --warn: #ffb400;
      --info: #4064e7;
      --muted: #7e7e7e;
      --card-bg: #fff;
      --shadow: 0 2px 18px 0 rgba(30,54,90,.08);
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --main-bg: #161b22;
        --main-color: #e6e8eb;
        --accent: #5ab4ff;
        --accent-hover: #3988d9;
        --border: #262b33;
        --card-bg: #1b2027;
        --shadow: 0 2px 24px 0 rgba(40,90,190,.10);
        --muted: #b1b4b7;
      }
    }
    html, body { background: var(--main-bg); color: var(--main-color); font-family: 'Inter', Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 16px; margin: 0; min-height: 100vh;}
    .container { max-width: 520px; margin: 0 auto; padding: 36px 18px; background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow);}
    h1 { font-weight: 700; margin: 1.5em 0 1em 0; font-size: 2.1em;}
    a, button { color: var(--accent); text-decoration: none; transition: 0.2s; cursor: pointer;}
    button, .btn { display: inline-block; padding: 0.45em 1.2em; border-radius: var(--radius); border: none; background: var(--accent); color: #fff; font-size: 1em; font-weight: 500; cursor: pointer; box-shadow: var(--shadow); margin: 0.1em 0.25em; transition: background 0.2s, color 0.2s;}
    button:hover, .btn:hover { background: var(--accent-hover);}
    input { width: 100%; padding: 0.7em 1em; border-radius: var(--radius); border: 1px solid var(--border); background: #fafbfc; font-size: 1em; margin-bottom: 1em;}
    input:focus { border-color: var(--accent); background: #f2f6ff;}
    label { font-weight: 500; margin-bottom: 0.2em; display: block;}
    .error { color: var(--error); background: #fff0f1; border: 1px solid #fec5ca; padding: 0.85em 1em; border-radius: var(--radius); margin-bottom: 1.1em; font-size: 1em;}
    .info { color: var(--info); background: #f1f5fe; border: 1px solid #bfd6fa; padding: 0.85em 1em; border-radius: var(--radius); margin-bottom: 1.1em; font-size: 1em;}
    table { width: 100%; border-collapse: collapse; margin: 1.4em 0 2em 0; background: var(--card-bg); border-radius: var(--radius); overflow: hidden; font-size: 1em; box-shadow: 0 1px 4px #e5e7eb50;}
    th, td { border: 1px solid var(--border); padding: 0.95em 0.7em;}
    th { background: #f4f6fa; color: var(--accent-hover); font-weight: 600;}
    tr:nth-child(even) td { background: #f7fafd;}
    tr:hover td { background: #eef6ff;}
    .flex-between { display:flex; justify-content:space-between; align-items:center;}
    .muted { color: var(--muted); font-size: 0.98em;}
    @media (max-width: 650px) {.container{padding:14px 4px;} th,td{font-size:0.97em; padding:0.6em 0.4em;}}
  </style>
</head>
<body>
<div class="container" style="margin-top:6vh; margin-bottom:3vh;">
  <div id="login-section">
    <h1 style="text-align:center;margin-top:0;">后台登录</h1>
    <div id="login-error" class="error" style="display:none;"></div>
    <label for="login-user">用户名</label>
    <input id="login-user" autocomplete="username" placeholder="请输入管理员用户名">
    <label for="login-pass">密码</label>
    <input id="login-pass" type="password" autocomplete="current-password" placeholder="请输入密码">
    <button style="width:100%;" onclick="login()">登录</button>
  </div>

  <div id="main-section" style="display:none;">
    <div class="flex-between" style="margin-bottom:1.2em;">
      <h1 style="margin:0;font-size:1.4em;">文件后台管理</h1>
      <button onclick="logout()" style="background:#e63946;">退出登录</button>
    </div>
    <div style="margin-bottom:1.2em; border-bottom:1px solid var(--border);"></div>

    <h2 style="margin-top:1.3em;">上传新文件</h2>
    <div id="upload-error" class="error" style="display:none;"></div>
    <form id="upload-form" style="margin-bottom:1.2em;">
      <input type="file" id="upload-input" required />
      <label>过期时间（可选）:
        <input type="datetime-local" id="upload-expire" style="max-width:180px;display:inline-block;" />
      </label>
      <button type="submit" class="btn">上传</button>
    </form>

    <h2 style="margin-top:2.2em;">文件列表</h2>
    <div id="list-error" class="error" style="display:none;"></div>
    <div id="list-loading" class="info" style="display:none;">加载中...</div>
    <table id="file-table">
      <thead><tr><th>ID</th><th>名称</th><th>大小</th><th>过期时间</th><th>操作</th></tr></thead>
      <tbody></tbody>
    </table>
    <div class="muted" style="text-align:right;">Powered by openjsw.net</div>
  </div>
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
      tr.innerHTML = \`
        <td>\${f.id}</td>
        <td>\${f.name || '-'}</td>
        <td>\${f.size || '-'} B</td>
        <td>\${f.expire ? new Date(f.expire).toLocaleString() : '-'}</td>
        <td>
          <a href="/file/\${f.id}" target="_blank" class="btn" style="background:#e0e7ff;color:#222;margin-right:0.6em;">访问</a>
          <button onclick="genShort('\${f.id}', this)" class="btn" style="background:#fbbf24;">短链</button>
          <button onclick="del('\${f.id}', this)" class="btn" style="background:#ef4444;">删除</button>
        </td>\`;
      tbody.appendChild(tr);
    });
  } catch (e) {
    showError('list-error', e.message);
  } finally {
    document.getElementById('list-loading').style.display = 'none';
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
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('main-section').style.display = '';
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
