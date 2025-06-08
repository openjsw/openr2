import { verify } from '../utils/jwt';

export async function onRequestPost({ request, env }) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const user = await verify(token, env.JWT_SECRET);
  if (!user || !user.admin) return Response.json({ error: '未登录或权限不足' }, { status: 401 });

  try {
    const { fileId, expire } = await request.json();
    if (!fileId) return Response.json({ error: '缺少文件ID' }, { status: 400 });

    const metaRaw = await env.MY_KV.get(`meta:${fileId}`);
    let meta = {};
    try { meta = JSON.parse(metaRaw); } catch {}
    meta.expire = expire || '';
    await env.MY_KV.put(`meta:${fileId}`, JSON.stringify(meta));
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: '设置失败: ' + e.message }, { status: 500 });
  }
}
