import { sign } from '../utils/jwt';

const ADMIN_USER = 'env.admin';
const ADMIN_PASS = 'env.password'; // 强烈建议环境变量读取

export async function onRequestPost({ request }) {
  try {
    const { user, pass } = await request.json();
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      const token = await sign({ user, admin: true });
      return Response.json({ token });
    }
    return Response.json({ error: '用户名或密码错误' }, { status: 403 });
  } catch {
    return Response.json({ error: '请求数据格式错误' }, { status: 400 });
  }
}
