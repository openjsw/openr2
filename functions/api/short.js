import { verify } from '../utils/jwt';

export async function onRequestPost({ request, env }) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const user = await verify(token, env.JWT_SECRET);
  if (!user || !user.admin) return Response.json({ error: '未登录或权限不足' }, { status: 401 });

  try {
    const { fileId } = await request.json();
    if (!fileId) return Response.json({ error: '缺少文件ID' }, { status: 400 });

    // 短链防冲突
    let short;
    let tryCount = 0;
    do {
      short = Math.random().toString(36).slice(2, 8);
      if (!await env.MY_KV.get('short:' + short)) break;
      tryCount++;
    } while (tryCount < 5);

    await env.MY_KV.put('short:' + short, fileId);
    return Response.json({ short });
  } catch (e) {
    return Response.json({ error: '生成短链失败: ' + e.message }, { status: 500 });
  }
}
