const BLOCKED_UA_KEYWORDS = [
  "micromessenger", "wechat", "qq/", "weibo", "toutiao", "dingtalk"
];

function isBlockedUA(ua) {
  if (!ua) return false;
  ua = ua.toLowerCase();
  return BLOCKED_UA_KEYWORDS.some(keyword => ua.includes(keyword));
}

// 你的环境变量：UPLOAD_TOKEN, R2_S3_ENDPOINT, BUCKET

export async function onRequestPost(context) {
  const { request, env } = context;
  const ua = request.headers.get("user-agent") || "";
  if (isBlockedUA(ua)) return new Response("Access Denied", { status: 403 });

  const form = await request.formData();
  const file = form.get("file");
  const filename = form.get("filename") || (file && file.name);
  const token = form.get("token");
  if (!token || token !== env.UPLOAD_TOKEN) return new Response("Unauthorized", { status: 401 });
  if (!file || !filename) return new Response("Missing file", { status: 400 });

  const key = encodeURIComponent(filename);
  const endpoint = env.R2_S3_ENDPOINT.replace(/\/$/, "");
  const bucket = env.BUCKET || "files";
  const s3Url = `${endpoint}/${bucket}/${key}`;

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
