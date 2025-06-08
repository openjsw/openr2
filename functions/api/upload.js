import { verify } from '../utils/jwt';

export async function onRequestPost({ request, env }) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const user = await verify(token, env.JWT_SECRET);
  if (!user || !user.admin) return Response.json({ error: '未登录或权限不足' }, { status: 401 });

  const form = await request.formData();
  const file = form.get('file');
  if (!file || typeof file === 'string') return Response.json({ error: '未上传文件' }, { status: 400 });

  const expire = form.get('expire') || '';
  const id = crypto.randomUUID();

  try {
    await env.MY_BUCKET.put(id, file.stream(), {
      customMetadata: { expire }
    });
    await env.MY_KV.put(`meta:${id}`, JSON.stringify({
      expire, name: file.name, size: file.size, type: file.type, ts: Date.now()
    }));
    return Response.json({ success: true, id });
  } catch (e) {
    return Response.json({ error: '上传失败: ' + e.message }, { status: 500 });
  }
}
