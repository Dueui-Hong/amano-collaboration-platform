// ============================================
// JWT Token Management
// ============================================

import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'amano-korea-collaboration-platform-secret-key-2024'
);

export interface JWTPayload {
  userId: string;
  employeeId: string;
  role: string;
  team: string;
  exp?: number;
}

/**
 * JWT 토큰 생성
 * @param payload 사용자 정보
 * @returns JWT 토큰 문자열
 */
export async function createToken(payload: Omit<JWTPayload, 'exp'>): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7일 만료
    .sign(JWT_SECRET);

  return token;
}

/**
 * JWT 토큰 검증
 * @param token JWT 토큰 문자열
 * @returns 검증된 페이로드 또는 null
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * 토큰 갱신 여부 확인
 * @param token JWT 토큰 문자열
 * @returns 갱신 필요 여부
 */
export async function shouldRefreshToken(token: string): Promise<boolean> {
  const payload = await verifyToken(token);
  if (!payload || !payload.exp) return true;

  // 만료 1일 전이면 갱신
  const expiresIn = payload.exp * 1000 - Date.now();
  const oneDayInMs = 24 * 60 * 60 * 1000;
  
  return expiresIn < oneDayInMs;
}
