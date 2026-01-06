# 🔒 보안 아키텍처 문서

## 📊 보안 개요

이 문서는 아마노코리아 통합 협업 플랫폼의 보안 구조를 설명합니다.

---

## 🛡️ 인증 시스템

### 인증 방식: 쿠키 기반 세션 (Cookie-Based Session)

**선택 이유:**
- ✅ XSS 공격 방어 (`httpOnly: true`)
- ✅ CSRF 공격 방어 (`sameSite: strict`)
- ✅ HTTPS 전용 전송 (`secure: true`)
- ✅ 간단한 구현 및 유지보수
- ✅ 서버 측 세션 무효화 가능

---

## 🔐 쿠키 설정 (보안 강화)

### 1. user_id 쿠키
```typescript
response.cookies.set('user_id', user.id, {
  httpOnly: true,      // XSS 방지: JavaScript로 접근 불가
  secure: true,        // HTTPS에서만 전송
  sameSite: 'strict',  // CSRF 방지: 같은 사이트에서만 쿠키 전송
  maxAge: 60 * 60 * 24 * 7, // 7일
  path: '/',
});
```

**보안 특징:**
- **httpOnly**: 클라이언트 JavaScript에서 접근 불가 → XSS 공격 방어
- **secure**: HTTPS 연결에서만 전송 → 중간자 공격(MITM) 방어
- **sameSite: strict**: 타 사이트에서 발생한 요청에는 쿠키 미포함 → CSRF 공격 완전 차단

### 2. user_session 쿠키
```typescript
response.cookies.set('user_session', JSON.stringify({
  id: user.id,
  employee_id: user.employee_id,
  role: user.role,
  team: user.team,
}), {
  httpOnly: true,      // XSS 방지
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF 방지
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
});
```

---

## 🔒 미들웨어 보안 검증

### 세션 유효성 검증 로직

```typescript
// 1. 두 쿠키가 모두 존재해야 인증된 것으로 간주
const userSessionCookie = request.cookies.get('user_session');
const userIdCookie = request.cookies.get('user_id');

if (userSessionCookie && userIdCookie) {
  try {
    userSession = JSON.parse(userSessionCookie.value);
    
    // 2. 세션 ID와 쿠키 ID가 일치하는지 확인
    if (!userSession.id || userSession.id !== userIdCookie.value) {
      // 일치하지 않으면 세션 무효화
      userSession = null;
    }
  } catch (error) {
    // JSON 파싱 실패 시 세션 무효화
    userSession = null;
  }
}
```

**검증 단계:**
1. ✅ 두 쿠키 존재 여부 확인
2. ✅ JSON 파싱 성공 확인
3. ✅ `user_session.id` === `user_id` 일치 확인

**세션 무효화 조건:**
- user_id 쿠키가 없는 경우
- user_session 쿠키가 없는 경우
- user_session JSON 파싱 실패
- user_session.id와 user_id가 불일치

---

## 🚪 로그아웃 시스템

### 완전한 쿠키 삭제 (보안 강화)

```typescript
// 1. delete() 메서드로 쿠키 제거
response.cookies.delete('user_id');
response.cookies.delete('user_session');

// 2. 추가 보안: 과거 시간으로 만료 처리
response.cookies.set('user_id', '', {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/',
  maxAge: -1,
  expires: new Date(0), // 1970-01-01
});

response.cookies.set('user_session', '', {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/',
  maxAge: -1,
  expires: new Date(0),
});
```

**삭제 방법:**
1. ✅ `cookies.delete()` 메서드 호출
2. ✅ `maxAge: -1` 설정 (즉시 만료)
3. ✅ `expires: new Date(0)` 설정 (과거 날짜)

**클라이언트 측 로그아웃:**
```typescript
const handleLogout = async () => {
  const response = await fetch('/api/auth/logout', { 
    method: 'POST',
    credentials: 'include', // 쿠키 포함
  });
  
  if (response.ok) {
    // 강제 페이지 새로고침으로 클라이언트 상태 초기화
    window.location.href = '/login';
  }
};
```

---

## 🔑 비밀번호 보안

### bcrypt 해싱 (Salt Rounds: 10)

**비밀번호 검증:**
```typescript
import bcrypt from 'bcryptjs';

const isValidPassword = await bcrypt.compare(
  plainPassword,
  user.password_hash
);
```

**특징:**
- ✅ Salt 자동 생성 (10 rounds)
- ✅ 레인보우 테이블 공격 방어
- ✅ 해시 충돌 최소화
- ✅ 느린 속도로 무차별 대입 공격 방어

---

## 🛡️ RBAC (역할 기반 접근 제어)

### 역할 계층 구조

```
DEPARTMENT_HEAD (부서장)
    ↓ 모든 권한
TEAM_LEADER (팀장)
    ↓ 팀 관리 권한
TEAM_MEMBER (팀원)
    ↓ 제한된 권한
```

### 경로별 권한 제어

```typescript
// 부서장 전용 경로
const ADMIN_ONLY_ROUTES = ['/admin', '/settings/system'];

// 팀장 이상 경로
const TEAM_LEADER_ROUTES = ['/reports/review', '/posts/permissions'];

// 인증 필요 경로
const PROTECTED_ROUTES = ['/dashboard', '/reports', '/schedules', '/posts'];
```

**권한 체크 순서:**
1. ✅ 인증 여부 확인
2. ✅ 역할 확인
3. ✅ 경로별 권한 매칭
4. ✅ 권한 부족 시 `/dashboard`로 리다이렉트

---

## 📝 감사 로그 (Audit Logs)

### 로그 기록 이벤트

**로그인:**
```typescript
await supabaseAdmin.from('audit_logs').insert({
  user_id: user.id,
  action: 'LOGIN',
  ip_address: request.headers.get('x-forwarded-for'),
  user_agent: request.headers.get('user-agent'),
});
```

**로그아웃:**
```typescript
await supabase.from('audit_logs').insert({
  user_id: userId,
  action: 'LOGOUT',
  ip_address: ip,
  user_agent: userAgent,
});
```

**기록 정보:**
- ✅ 사용자 ID
- ✅ 액션 유형 (LOGIN, LOGOUT, CREATE, UPDATE, DELETE)
- ✅ IP 주소
- ✅ User Agent
- ✅ 타임스탬프

---

## ⚠️ 보안 주의사항

### 1. 환경 변수 관리

**절대 노출 금지:**
```bash
SUPABASE_SERVICE_ROLE_KEY=xxx  # RLS 우회 가능! 매우 위험!
NEXTAUTH_SECRET=xxx
```

**안전한 관리:**
- ✅ `.env.local` 파일에 저장
- ✅ `.gitignore`에 추가
- ✅ Vercel 환경 변수로 설정
- ❌ 절대 GitHub에 커밋하지 않기

### 2. HTTPS 필수

**프로덕션 환경:**
- ✅ 모든 쿠키 `secure: true` 설정
- ✅ Vercel 자동 HTTPS 제공
- ✅ HTTP → HTTPS 자동 리다이렉트

### 3. Rate Limiting (향후 추가 권장)

**무차별 대입 공격 방어:**
- IP 기반 로그인 시도 제한
- 5회 실패 시 15분 잠금
- Cloudflare Rate Limiting 활용 권장

### 4. 세션 만료 관리

**현재 설정:**
- 세션 만료: 7일
- 향후 추가 권장:
  - 비활동 시간 기반 자동 로그아웃
  - Remember Me 옵션
  - Refresh Token 구현

---

## 🔍 보안 체크리스트

### 로그인/로그아웃
- [x] bcrypt 비밀번호 해싱
- [x] httpOnly 쿠키 사용
- [x] sameSite: strict 설정
- [x] secure: true (HTTPS only)
- [x] 로그아웃 시 완전한 쿠키 삭제
- [x] 감사 로그 기록

### 세션 관리
- [x] 세션 유효성 검증 (user_id === user_session.id)
- [x] 쿠키 파싱 에러 핸들링
- [x] 무효한 세션 자동 제거
- [ ] 세션 만료 시간 관리 (향후 추가)
- [ ] Refresh Token (향후 추가)

### 권한 관리
- [x] RBAC 구현
- [x] 경로별 권한 체크
- [x] 미들웨어 기반 접근 제어
- [x] 권한 부족 시 안전한 리다이렉트

### 공격 방어
- [x] XSS 방어 (httpOnly)
- [x] CSRF 방어 (sameSite: strict)
- [x] SQL Injection 방어 (Supabase Prepared Statements)
- [ ] Rate Limiting (향후 추가)
- [ ] 2FA (향후 추가)

---

## 📞 보안 관련 문의

보안 취약점을 발견하시면 즉시 관리자에게 연락하세요.

**우선순위:**
1. 🔴 Critical: 즉시 수정 필요
2. 🟡 High: 24시간 내 수정
3. 🟢 Medium: 1주일 내 수정

---

© 2026 아마노코리아. All rights reserved.
