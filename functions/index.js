const BLOCKED_UA_KEYWORDS = [
  "micromessenger", "wechat", "qq/", "weibo", "toutiao", "dingtalk"
];

function isBlockedUA(ua) {
  if (!ua) return false;
  ua = ua.toLowerCase();
  return BLOCKED_UA_KEYWORDS.some(keyword => ua.includes(keyword));
}

// 构造 S3 目标 URL
function buildS3Url(env, key) {
  const bucket = env.BUCKET || "files";
  const endpoint = env.R2_S3_ENDPOINT.replace(/\/$/, "");
  // /files/xxx → /files/xxx
  return `${endpoint}/${bucket}/${key}`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method.toUpperCase();
    const ua = request.headers.get("user-agent") || "";

    // 拦截中国主流爬虫
    if (isBlockedUA(ua)) {
      return new Response("Access Denied", { status: 403 });
    }

    // Web前端页面
    if (pathname === "/" && method === "GET") {
      return new Response(renderHtmlPage(request.headers.get("host")), {
        headers: { "content-type": "text/html; charset=utf-8" }
      });
    }

    // 文件下载/查看
    if (pathname.startsWith("/files/") && method === "GET") {
      const key = encodeURIComponent(pathname.substring("/files/".length));
      const s3Url = buildS3Url(env, key);

      // 代理 GET 到 S3 endpoint
      const s3Resp = await fetch(s3Url, { method: "GET" });
      // S3 404时响应 404
      if (s3Resp.status === 404) return new Response("File not found", { status: 404 });
      // 保留 S3 内容类型等元信息
      const headers = new Headers(s3Resp.headers);
      headers.set("X-Served-By", request.headers.get("host") || "proxy");
      return new Response(s3Resp.body, { status: s3Resp.status, headers });
    }

    // API 上传（PUT），需 Token
    if (pathname.startsWith("/files/") && method === "PUT") {
      const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
      if (!token || token !== env.UPLOAD_TOKEN) {
        return new Response("Unauthorized", { status: 401 });
      }
      const key = encodeURIComponent(pathname.substring("/files/".length));
      const s3Url = buildS3Url(env, key);
      const contentType = request.headers.get("content-type") || "application/octet-stream";

      const s3Resp = await fetch(s3Url, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: request.body
      });

      if (s3Resp.ok) {
        return new Response("Upload OK", { status: 200 });
      } else {
        return new Response(await s3Resp.text(), { status: s3Resp.status });
      }
    }

    // Web表单上传（POST）
    if (pathname === "/upload" && method === "POST") {
      const formData = await request.formData();
      const file = formData.get("file");
      const filename = formData.get("filename") || (file && file.name);
      const token = formData.get("token");
      if (!token || token !== env.UPLOAD_TOKEN) {
        return new Response("Unauthorized", { status: 401 });
      }
      if (!file || !filename) {
        return new Response("Missing file", { status: 400 });
      }

      const key = encodeURIComponent(filename);
      const s3Url = buildS3Url(env, key);

      const s3Resp = await fetch(s3Url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file.stream()
      });

      if (s3Resp.ok) {
        const host = request.headers.get("host") || "proxy";
        return new Response(`Upload success: https://${host}/files/${encodeURIComponent(filename)}`,
          { headers: { "content-type": "text/plain" } });
      } else {
        return new Response(await s3Resp.text(), { status: s3Resp.status });
      }
    }

    return new Response("Not found", { status: 404 });
  }
}

// 上传页面
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
  <form id="uploadForm" method="POST" enctype="multipart/form-data">
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
