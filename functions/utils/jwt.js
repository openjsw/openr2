const SECRET = 'env.jwt-secret'; // 建议改为环境变量或 .env 配置

function base64urlEncode(arr) {
  return btoa(String.fromCharCode(...new Uint8Array(arr)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}

export async function sign(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  payload = { ...payload, iat: now, exp: now + 7200 }; // 2小时
  const enc = txt => base64urlEncode(new TextEncoder().encode(JSON.stringify(txt)));
  const head = enc(header);
  const body = enc(payload);
  const data = `${head}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return `${data}.${base64urlEncode(new Uint8Array(sig))}`;
}

export async function verify(token) {
  if (!token || typeof token !== 'string') return null;
  const [head, body, sig] = token.split('.');
  if (!head || !body || !sig) return null;
  const data = `${head}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64urlDecode(sig),
    new TextEncoder().encode(data)
  );
  if (!valid) return null;
  try {
    const payload = JSON.parse(
      new TextDecoder().decode(base64urlDecode(body))
    );
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
