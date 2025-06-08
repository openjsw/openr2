export async function onRequestGet() {
  return new Response(`
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <title>OpenJSW 文件托管</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://styl.openjsw.net/style.css" />
</head>
<body>
  <header>
    <div class="header-main">
      <span class="logo">OpenJSW 文件托管</span>
      <nav>
        <a href="/">首页</a>
        <a href="/admin">后台管理</a>
      </nav>
    </div>
  </header>
  <main>
    <div class="container">
      <h1 style="text-align:center;">OpenJSW 文件托管</h1>
      <p style="text-align:center;font-size:1.13em;margin:2em 0 1.4em 0;">
        极速安全的云端文件分享与管理系统，<br>
        为开放技术社群和个人提供可靠文件分发能力。
      </p>
      <ul style="margin:2em 0 2.5em 1.3em; font-size:1.08em; line-height:1.7;">
        <li>多格式文件安全上传与高可用托管</li>
        <li>可设置文件过期时间，自动清理</li>
        <li>专属后台管理，权限安全</li>
        <li>节省存储空间，便捷分享</li>
      </ul>
      <a href="/admin"><button class="btn" style="width:100%;margin-top:1.8em;">进入后台管理</button></a>
    </div>
  </main>
  <footer>
    <div class="footer-main">
      Powered by <a href="https://openjsw.net" target="_blank">openjsw.net</a>
    </div>
  </footer>
</body>
</html>
  `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
