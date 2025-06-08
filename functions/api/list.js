import { verify } from '../utils/jwt';

export async function onRequest({ request, env }) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const user = await verify(token);
  if (!user || !user.admin) return Response.json({ error: '未登录或权限不足' }, { status: 401 });

  // R2 列举文件
  try {
    const list = await env.MY_BUCKET.list();
    const files = [];
    for (const obj of list.objects) {
      let meta = {};
      try {
        meta = JSON.parse(await env.MY_KV.get(`meta:${obj.key}`) || '{}');
      } catch {}
      files.push({
        id: obj.key,
        expire: meta.expire || '',
        name: meta.name || obj.key,
        size: meta.size || obj.size,
        type: meta.type || '',
        ts: meta.ts || obj.uploaded
      });
    }
    return Response.json(files);
  } catch (e) {
    return Response.json({ error: '获取列表失败:' + e.message }, { status: 500 });
  }
}
