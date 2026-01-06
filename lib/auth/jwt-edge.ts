// ============================================
// JWT for Edge Runtime (Middleware)
// Web Crypto API 사용 (Node.js API 없음)
// ============================================

export interface JWTPayload {
  userId: string;
  employeeId: string;
  role: string;
  team: string;
  exp?: number;
  iat?: number;
}

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'amano-korea-collaboration-platform-secret-key-2024'
);

/**
 * JWT 토큰 검증 (Edge Runtime용 - Web Crypto API)
 */
export async function verifyTokenEdge(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // Signature 검증
    const data = `${headerB64}.${payloadB64}`;
    const dataEncoded = new TextEncoder().encode(data);
    
    const key = await crypto.subtle.importKey(
      'raw',
      SECRET,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = base64UrlDecode(signatureB64);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      dataEncoded
    );

    if (!valid) {
      return null;
    }

    // Payload 디코딩
    const payloadStr = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const payload = JSON.parse(payloadStr) as JWTPayload;

    // 만료 확인
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Base64 URL 디코딩
 */
function base64UrlDecode(str: string): Uint8Array {
  // Base64 URL -> Base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Padding 추가
  while (base64.length % 4) {
    base64 += '=';
  }
  
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
