export async function onRequestGet() {
  return new Response(`
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <title>OpenJSW 文件托管</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://styl.openjsw.net/style.css" />
  <style>
    html, body {
      height: 100%; margin:0; padding:0;
      display: flex; flex-direction: column; min-height: 100vh;
    }
    main { flex: 1 0 auto; }
    footer { flex-shrink: 0; }
    /* header/drawer 样式见上方 */
    .header-main { display: flex; align-items: center; justify-content: space-between; max-width: 950px; margin: 0 auto; padding: 0.7em 1.5em; position: relative; }
    nav.nav-links { display: flex; gap: 2em; }
    .menu-btn { display: none; flex-direction: column; justify-content: center; gap: 3px; background: none; border: none; cursor: pointer; }
    .menu-btn span { display: block; width: 24px; height: 3px; background: #222; border-radius: 3px; }
    .drawer { display: none; position: fixed; top: 0; right: 0; width: 200px; height: 100vh; background: #fff; box-shadow: -2px 0 20px #0001; flex-direction: column; z-index: 1000; padding: 2em 1.2em; }
    .drawer a { margin-bottom: 1.5em; font-size: 1.15em; color: var(--accent);}
    .close-btn { margin-top: 2em; background: var(--accent); color: #fff; border: none; border-radius: 7px; padding: 0.6em 1.5em; }
    @media (max-width: 640px) {
      .header-main { padding: 0.5em 0.7em; }
      nav.nav-links { display: none; }
      .menu-btn { display: flex; }
    }
    .drawer.open { display: flex; }
  </style>
</head>
<body>
  <header>
    <div class="header-main">
      <span class="logo">OpenJSW 文件托管</span>
      <nav class="nav-links">
        <a href="/">首页</a>
        <a href="/admin">后台管理</a>
      </nav>
      <button class="menu-btn" aria-label="菜单" onclick="toggleMenu()">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="drawer" id="drawer-menu">
      <a href="/">首页</a>
      <a href="/admin">后台管理</a>
      <button class="close-btn" onclick="toggleMenu()">关闭</button>
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
  <script>
    function toggleMenu() {
      var drawer = document.getElementById('drawer-menu');
      drawer.classList.toggle('open');
      if (drawer.classList.contains('open')) document.body.style.overflow='hidden';
      else document.body.style.overflow='';
    }
  </script>
</body>
</html>
  `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
