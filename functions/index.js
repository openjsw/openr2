export async function onRequestGet(context) {
  const host = context.request.headers.get("host");
  return new Response(renderHtmlPage(host), {
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}

function renderHtmlPage(host) {
  return `<!DOCTYPE html>
<html lang="zh-cn">
<head>
  <meta charset="UTF-8">
  <title>R2 文件上传</title>
  <style>
    body { font-family: sans-serif; margin: 2em; }
    input[type=file], input[type=text], input[type=password] { margin: 0.5em 0; }
    button { padding: 0.5em 1em; }
    .msg { margin-top: 1em; color: green; }
  </style>
</head>
<body>
  <h2>Cloudflare R2 文件上传</h2>
  <form id="uploadForm" method="POST" enctype="multipart/form-data" action="/upload">
    <label>文件：<input type="file" name="file" required></label><br>
    <label>自定义文件名（可选）：<input type="text" name="filename"></label><br>
    <label>上传Token：<input type="password" name="token" required></label><br>
    <button type="submit">上传</button>
  </form>
  <div class="msg" id="msg"></div>
  <script>
    document.getElementById('uploadForm').onsubmit = async function(e) {
      e.preventDefault();
      const form = e.target;
      const data = new FormData(form);
      document.getElementById('msg').innerText = "上传中…";
      try {
        const resp = await fetch('/upload', { method: 'POST', body: data });
        document.getElementById('msg').innerText = await resp.text();
      } catch (err) {
        document.getElementById('msg').innerText = "上传失败: " + err;
      }
    };
  </script>
  <p>文件访问地址举例：<br>
    <code>https://${host}/files/你的文件名</code>
  </p>
</body>
</html>`;
}
