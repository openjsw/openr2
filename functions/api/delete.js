import { verify } from '../utils/jwt';

export async function onRequestPost({ request, env }) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const user = await verify(token, env.JWT_SECRET);
  if (!user || !user.admin) return Response.json({ error: '未登录或权限不足' }, { status: 401 });

  try {
    const { fileId } = await request.json();
    if (!fileId) return Response.json({ error: '缺少文件ID' }, { status: 400 });

    await env.MY_BUCKET.delete(fileId);
    await env.MY_KV.delete(`meta:${fileId}`);
    // 删除短链
    const keys = await env.MY_KV.list({ prefix: 'short:' });
    for (const k of keys.keys) {
      const v = await env.MY_KV.get(k.name);
      if (v === fileId) await env.MY_KV.delete(k.name);
    }
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: '删除失败: ' + e.message }, { status: 500 });
  }
}
