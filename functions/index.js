export async function onRequestGet() {
  return new Response(`
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <title>文件分享系统</title>
  <style>body { font-family: Arial, sans-serif; padding: 30px; }</style>
</head>
<body>
  <h1>欢迎使用文件分享系统</h1>
  <p><a href="/admin">进入后台管理</a></p>
</body>
</html>
  `, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
