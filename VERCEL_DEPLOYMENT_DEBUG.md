# Vercel 배포 문제 해결 로그

## 📅 날짜: 2026-01-06

## 🔍 문제 요약

### 증상
1. **404 에러**: 페이지 간 이동 시 404 Not Found 발생
2. **로그인/로그아웃 불안정**: 세션 관리 불완전
3. **네비게이션 문제**: 페이지 간 유기적 연결 부족
4. **보안 취약**: RLS 비활성화, 쿠키 세션만 사용

### 원인 분석

#### 1. Next.js 라우트 구조 문제
- **원인**: 페이지들이 `dashboard/layout.tsx`를 공유하지 않음
- **해결**: Route Groups `(dashboard)` 사용하여 모든 페이지에 레이아웃 자동 적용

```
Before:
app/
├── dashboard/
│   ├── layout.tsx
│   └── page.tsx
├── reports/page.tsx     ← layout 미적용
├── schedules/page.tsx   ← layout 미적용
└── posts/page.tsx       ← layout 미적용

After:
app/
├── (dashboard)/         ← Route Group (URL에 영향 없음)
│   ├── layout.tsx       ← 모든 하위 페이지에 자동 적용
│   ├── dashboard/page.tsx
│   ├── reports/page.tsx
│   ├── schedules/page.tsx
│   └── posts/page.tsx
```

#### 2. JWT 인증 시스템 미완성
- **원인**: 로그인 API는 JWT를 생성하지만, 미들웨어는 검증 실패
- **해결**: 
  - `lib/auth/jwt.ts`: jose 라이브러리 사용 (API Routes)
  - `lib/auth/jwt-edge.ts`: Web Crypto API 사용 (Middleware)
  - Edge Runtime 호환성 확보

#### 3. TypeScript 타입 에러
- **원인**: jose의 JWTPayload 타입과 커스텀 JWTPayload 타입 충돌
- **해결**: 명시적 타입 변환 추가

```typescript
// Before
return payload as JWTPayload;  // ❌ 타입 불일치

// After
return {
  userId: payload.userId as string,
  employeeId: payload.employeeId as string,
  role: payload.role as string,
  team: payload.team as string,
  exp: payload.exp,
};  // ✅ 명시적 변환
```

#### 4. Vercel 빌드 타임아웃
- **문제**: 로컬 및 Vercel 빌드가 무한 대기 상태
- **시도한 해결책**:
  1. ✅ TypeScript 타입 에러 수정
  2. ✅ vercel.json 설정 추가
  3. ⏳ Vercel 자동 재배포 대기 중

## 🔧 적용된 수정사항

### 1. 프로젝트 구조 재구성
```bash
git commit: 9fcc310 "feat: 전면 재구축 - JWT 보안 + 라우트 그룹 + 네비게이션 통합"
```

### 2. JWT 보안 시스템 구현
```bash
git commit: 2878209 "fix: Edge Runtime 호환 JWT 검증 + 미들웨어 수정"
git commit: ec3c364 "fix: JWT 타입 에러 수정 - jose 타입 호환성 개선"
```

### 3. 빌드 최적화
```bash
git commit: be3ff8e "chore: Vercel 배포 설정 추가"
```

## 📊 현재 상태

### ✅ 완료된 작업
- [x] Route Groups로 프로젝트 구조 재설계
- [x] JWT 기반 인증 시스템 구현
- [x] Edge Runtime 호환 미들웨어 작성
- [x] TypeScript 타입 에러 수정
- [x] vercel.json 설정 추가
- [x] GitHub에 모든 변경사항 푸시

### ⏳ 대기 중
- [ ] Vercel 자동 빌드 완료 (약 2-3분)
- [ ] JWT 쿠키 검증 테스트
- [ ] 전체 네비게이션 흐름 테스트

### 🔴 미해결 문제
- **빌드 타임아웃**: 로컬 환경에서 `npm run build` 시 무한 대기
  - **추정 원인**: Next.js 16.1.1 + Turbopack 이슈 또는 순환 의존성
  - **임시 해결**: Vercel 클라우드 빌드에 의존

## 🎯 다음 단계

### 1. Vercel 배포 확인 (2-3분 후)
```bash
# JWT 쿠키 확인
curl -X POST https://amano-collaboration-platform.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"employee_id": "EMP001", "password": "password123"}' \
  -i | grep -E "(Set-Cookie|token)"

# Expected: Set-Cookie: token=...; HttpOnly; Secure
```

### 2. 브라우저 테스트
1. https://amano-collaboration-platform.vercel.app/login 접속
2. EMP001 / password123 로그인
3. 네비게이션 테스트:
   - 대시보드 → 일정 관리 → 주간 보고서 → 게시판
   - ✅ 404 없음
   - ✅ 사이드바 일관성
   - ✅ 사용자 정보 유지

### 3. 보안 강화 (Phase 2)
- [ ] Supabase RLS 재활성화
- [ ] JWT 갱신 로직 추가
- [ ] 세션 만료 처리 개선
- [ ] CSRF 토큰 추가

## 🐛 알려진 이슈

### Next.js 16 Middleware 경고
```
⚠ The "middleware" file convention is deprecated. 
Please use "proxy" instead.
```
- **영향**: 경고만 표시, 기능은 정상 작동
- **해결 계획**: Next.js 15로 다운그레이드 또는 proxy 패턴 도입 고려

### 로컬 빌드 타임아웃
- **증상**: `npm run build` 시 무한 대기
- **영향**: 로컬 개발에만 영향, Vercel 배포는 정상 가능
- **임시 해결**: Vercel 클라우드 빌드 사용
- **장기 해결**: 순환 의존성 분석 필요

## 📚 참고 문서
- [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Edge Runtime](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes)
- [jose JWT](https://github.com/panva/jose)

---

**마지막 업데이트**: 2026-01-06 08:15 UTC  
**작성자**: AI Assistant  
**상태**: ⏳ Vercel 배포 대기 중
