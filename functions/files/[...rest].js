const BLOCKED_UA_KEYWORDS = [
  "micromessenger", "wechat", "qq/", "weibo", "toutiao", "dingtalk"
];

function isBlockedUA(ua) {
  if (!ua) return false;
  ua = ua.toLowerCase();
  return BLOCKED_UA_KEYWORDS.some(keyword => ua.includes(keyword));
}

function buildS3Url(env, key) {
  const bucket = env.BUCKET || "files";
  const endpoint = env.R2_S3_ENDPOINT.replace(/\/$/, "");
  return `${endpoint}/${bucket}/${key}`;
}

export async function onRequest(context) {
  const { request, env, params } = context;
  const method = request.method.toUpperCase();
  const ua = request.headers.get("user-agent") || "";

  if (isBlockedUA(ua)) return new Response("Access Denied", { status: 403 });

  // 修正：每个部分都encodeURIComponent，防止路径出错
  let key;
  if (Array.isArray(params.rest)) {
    key = params.rest.map(part => encodeURIComponent(part)).join('/');
  } else {
    key = encodeURIComponent(params.rest);
  }
  if (!key) return new Response("Missing key", { status: 400 });

  if (method === "GET") {
    const s3Url = buildS3Url(env, key);
    const s3Resp = await fetch(s3Url, { method: "GET" });
    if (s3Resp.status === 404) return new Response("File not found", { status: 404 });
    const headers = new Headers(s3Resp.headers);
    headers.set("X-Served-By", request.headers.get("host") || "proxy");
    return new Response(s3Resp.body, { status: s3Resp.status, headers });
  }

  if (method === "PUT") {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token || token !== env.UPLOAD_TOKEN) return new Response("Unauthorized", { status: 401 });
    const s3Url = buildS3Url(env, key);
    const contentType = request.headers.get("content-type") || "application/octet-stream";
    const s3Resp = await fetch(s3Url, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: request.body
    });
    if (s3Resp.ok) return new Response("Upload OK", { status: 200 });
    return new Response(await s3Resp.text(), { status: s3Resp.status });
  }

  return new Response("Not allowed", { status: 405 });
}
