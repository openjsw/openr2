export async function onRequestGet() {
  return new Response(`
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <title>OpenJSW 开放技术文件托管</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    /* 通用样式 v0.1 */
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
    html, body { background: var(--main-bg); color: var(--main-color); font-family: 'Inter', Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 16px; margin: 0; min-height: 100vh; }
    h1 { font-weight: 700; margin: 1.5em 0 1em 0; font-size: 2.1em;}
    a, button { color: var(--accent); text-decoration: none; transition: 0.2s; cursor: pointer;}
    button, .btn { display: inline-block; padding: 0.45em 1.2em; border-radius: var(--radius); border: none; background: var(--accent); color: #fff; font-size: 1em; font-weight: 500; cursor: pointer; box-shadow: var(--shadow); margin: 0.1em 0.25em; transition: background 0.2s, color 0.2s;}
    button:hover, .btn:hover { background: var(--accent-hover);}
    .container { max-width: 460px; margin: 0 auto; padding: 36px 18px; background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow);}
    .muted { color: var(--muted);}
    @media (max-width:600px) {.container{padding:16px 4px;}}
  </style>
</head>
<body>
  <div class="container">
    <h1 style="text-align:center;margin-top:0;">OpenJSW 文件托管</h1>
    <p style="text-align:center;font-size:1.13em;margin:2em 0 1.4em 0;">
      极速安全的云端文件分享与管理系统，<br>为开放技术社群和个人提供可靠文件分发能力。
    </p>
    <ul style="margin:2em 0 2.5em 1.3em; font-size:1.08em; line-height:1.7;">
      <li>多格式文件安全上传与高可用托管</li>
      <li>短链生成与文件过期控制</li>
      <li>专属后台管理，权限安全</li>
      <li>自动过期清理，节省存储空间</li>
    </ul>
    <a href="/admin"><button class="btn" style="width:100%;margin-top:1.8em;">进入后台管理</button></a>
    <div class="muted" style="text-align:center;margin-top:2em;">Powered by openjsw.net</div>
  </div>
</body>
</html>
  `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
