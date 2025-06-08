/**
 * 短链跳转
 * - 访问 /f/xxxx 会自动 302 跳转到真实文件直链（带友好报错）
 */
export async function onRequestGet({ params, env }) {
  const short = params.short;
  if (!short) return new Response('短链参数缺失', { status: 400 });

  const fileId = await env.MY_KV.get(`short:${short}`);
  if (!fileId) return new Response('短链不存在或已失效', { status: 404 });

  // 这里直接重定向到 /file/xxx
  return Response.redirect(`/file/${fileId}`, 302);
}
