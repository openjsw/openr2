export async function onRequestGet({ params, env }) {
  const short = params.short;
  if (!short) return new Response('短链参数缺失', { status: 400 });

  const fileId = await env.MY_KV.get(`short:${short}`);
  if (!fileId) return new Response('短链不存在或已失效', { status: 404 });

  return Response.redirect(`/file/${fileId}`, 302);
}
