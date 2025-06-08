export async function onRequestGet({ params, env }) {
  const id = params.id;
  if (!id) return new Response('参数缺失', { status: 400 });

  let meta = {};
  try {
    meta = JSON.parse(await env.MY_KV.get(`meta:${id}`) || '{}');
  } catch {}
  // 判断过期
  if (meta.expire) {
    const now = Date.now();
    const expireAt = Date.parse(meta.expire);
    if (expireAt && now > expireAt) {
      await env.MY_BUCKET.delete(id);
      await env.MY_KV.delete(`meta:${id}`);
      // 清理短链
      const keys = await env.MY_KV.list({ prefix: 'short:' });
      for (const k of keys.keys) {
        const v = await env.MY_KV.get(k.name);
        if (v === id) await env.MY_KV.delete(k.name);
      }
      return new Response('文件已过期并删除', { status: 410 });
    }
  }
  const obj = await env.MY_BUCKET.get(id);
  if (!obj) return new Response('文件不存在或已被删除', { status: 404 });

  let ctype = meta.type || obj.httpMetadata?.contentType || 'application/octet-stream';
  let fname = meta.name || id;
  const headers = {
    'Content-Type': ctype,
    'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(fname)}`,
    'Cache-Control': 'public, max-age=3600'
  };
  return new Response(obj.body, { headers });
}
