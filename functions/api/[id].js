/**
 * 文件直链访问（支持过期校验）
 * - 支持 GET 方式
 * - 过期自动删除并提示
 */
export async function onRequestGet({ params, env }) {
  const id = params.id;
  if (!id) return new Response('参数缺失', { status: 400 });

  // 1. 检查元数据
  let meta = {};
  try {
    meta = JSON.parse(await env.MY_KV.get(`meta:${id}`) || '{}');
  } catch {}
  // 2. 判断过期
  if (meta.expire) {
    const now = Date.now();
    const expireAt = Date.parse(meta.expire);
    if (expireAt && now > expireAt) {
      // 自动清理
      await env.MY_BUCKET.delete(id);
      await env.MY_KV.delete(`meta:${id}`);
      // 删除短链
      const keys = await env.MY_KV.list({ prefix: 'short:' });
      for (const k of keys.keys) {
        const v = await env.MY_KV.get(k.name);
        if (v === id) await env.MY_KV.delete(k.name);
      }
      return new Response('文件已过期并删除', { status: 410 });
    }
  }
  // 3. 读取文件流
  const obj = await env.MY_BUCKET.get(id);
  if (!obj) return new Response('文件不存在或已被删除', { status: 404 });

  // 4. 设置正确 Content-Type
  let ctype = meta.type || obj.httpMetadata?.contentType || 'application/octet-stream';
  let fname = meta.name || id;
  const headers = {
    'Content-Type': ctype,
    'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(fname)}`,
    'Cache-Control': 'public, max-age=3600'
  };
  return new Response(obj.body, { headers });
}
