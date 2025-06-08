import { sign } from '../utils/jwt';

export async function onRequestPost({ request, env }) {
  try {
    const { user, pass } = await request.json();
    if (user === env.ADMIN_USER && pass === env.ADMIN_PASS) {
      const token = await sign({ user, admin: true }, env.JWT_SECRET);
      return Response.json({ token });
    }
    return Response.json({ error: '用户名或密码错误' }, { status: 403 });
  } catch {
    return Response.json({ error: '请求格式错误' }, { status: 400 });
  }
}
