# 아마노코리아 영업기획 및 관리본부 - 통합 협업 플랫폼

## 📋 프로젝트 개요

**조직**: 아마노코리아 영업기획 및 관리본부 (총 7명)
- 부서장 (1명)
- 기획홍보팀 (4명: 팀장 1 + 팀원 3)
- 통합수주관리팀 (2명: 팀장 1 + 팀원 1)

**목적**: 업무 효율화, 보안 유지, 주간 보고 체계화, 일정 및 리소스 관리

**기술 스택**:
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS
- Backend: Next.js API Routes
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- Deployment: Vercel (권장)

---

## 🚀 주요 기능

### 1. 인증 및 사용자 관리
- ✅ 사원번호 기반 로그인 (회원가입 없음)
- ✅ 최초 로그인 시 비밀번호 변경 강제
- ✅ 역할 기반 접근 제어 (RBAC)

### 2. 역할 기반 권한 관리 (RBAC)
- **부서장 (Level 1)**: 모든 데이터 조회/수정/삭제 가능
- **팀장 (Level 2)**: 소속 팀원 관리, 권한 부여, 보고서 검토
- **팀원 (Level 3)**: 본인 데이터만 관리

### 3. 통합 일정 관리
- 부서 공통 일정 (PUBLIC): 모든 부서원 조회 가능
- 개인 일정 (PRIVATE): 본인만 조회 가능 (RLS 적용)
- 캘린더 뷰 (react-big-calendar)

### 4. 주간 보고서 워크플로우
- **작성 (팀원)**: 이번 주 업무, 다음 주 계획, 이슈 입력
- **검토 (팀장)**: 보고서 검토 및 코멘트 작성 → 승인/반려
- **확인 (부서장)**: 대시보드에서 통합 현황 확인
- **상태**: DRAFT → SUBMITTED → APPROVED/REJECTED

### 5. 게시판 및 권한 관리
- 공지사항, 업무자료, 회의록 관리
- 팀장이 특정 게시물을 특정 팀원에게 공유 가능
- 공개/비공개 설정

### 6. Admin CMS (부서장 전용)
- 로고, 배경 이미지 등 UI 요소 동적 관리
- 시스템 설정 변경 (코드 수정 없이)

---

## 📁 프로젝트 구조

```
webapp/
├── app/
│   ├── api/                      # API Routes
│   │   ├── auth/                 # 인증 API
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── me/route.ts
│   │   ├── reports/              # 보고서 API
│   │   ├── schedules/            # 일정 API
│   │   ├── posts/                # 게시물 API
│   │   └── settings/             # 시스템 설정 API
│   ├── dashboard/                # 대시보드 페이지
│   │   ├── layout.tsx            # 레이아웃 (사이드바 포함)
│   │   └── page.tsx              # 메인 대시보드
│   ├── login/                    # 로그인 페이지
│   │   └── page.tsx
│   ├── reports/                  # 보고서 페이지
│   ├── schedules/                # 일정 페이지
│   ├── posts/                    # 게시판 페이지
│   └── settings/                 # 설정 페이지
├── lib/
│   ├── auth/                     # 인증 유틸리티
│   │   ├── permissions.ts        # RBAC 권한 체크
│   │   └── utils.ts              # 인증 헬퍼 함수
│   └── supabase/                 # Supabase 클라이언트
│       ├── client.ts             # 브라우저 클라이언트
│       ├── server.ts             # 서버 클라이언트
│       └── middleware.ts         # 미들웨어 클라이언트
├── types/
│   ├── index.ts                  # 공통 타입 정의
│   └── supabase.ts               # Supabase DB 타입
├── supabase/
│   ├── migrations/               # SQL 마이그레이션
│   │   └── 001_initial_schema.sql
│   └── seed.sql                  # 시드 데이터
├── docs/
│   └── DATABASE_ERD.md           # ERD 문서
├── middleware.ts                 # Next.js 미들웨어 (RBAC)
├── .env.local.example            # 환경 변수 예시
└── README.md                     # 이 파일
```

---

## 🔧 환경 설정

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

### 2. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase/migrations/001_initial_schema.sql` 실행
3. (선택) `supabase/seed.sql` 실행하여 테스트 데이터 생성
4. Project Settings → API에서 URL과 anon key 복사하여 `.env.local`에 추가

### 3. 의존성 설치

```bash
npm install
```

---

## 🚀 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 👥 테스트 계정 (시드 데이터 실행 시)

| 사원번호 | 비밀번호 | 역할 | 팀 |
|---------|---------|------|-----|
| EMP001  | password123 | 부서장 | 부서장 |
| EMP002  | password123 | 팀장 | 기획홍보팀 |
| EMP003  | password123 | 팀원 | 기획홍보팀 |
| EMP004  | password123 | 팀원 | 기획홍보팀 |
| EMP005  | password123 | 팀원 | 기획홍보팀 |
| EMP006  | password123 | 팀장 | 통합수주관리팀 |
| EMP007  | password123 | 팀원 | 통합수주관리팀 |

⚠️ **프로덕션 환경에서는 반드시 비밀번호를 변경하세요!**

---

## 🌐 Vercel 배포

### 1. GitHub 저장소에 푸시

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Vercel에 배포

1. [Vercel](https://vercel.com)에 로그인
2. "New Project" 클릭
3. GitHub 저장소 연결
4. Environment Variables 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXTAUTH_URL` (Vercel 도메인으로 설정)
   - `NEXTAUTH_SECRET`
5. Deploy 클릭

---

## 📊 Database Schema

자세한 ERD는 `docs/DATABASE_ERD.md`를 참고하세요.

### 주요 테이블:
- **users**: 사용자 정보
- **schedules**: 일정 (PUBLIC/PRIVATE)
- **weekly_reports**: 주간 보고서 (워크플로우 포함)
- **posts**: 게시물
- **post_permissions**: 게시물 권한 관리
- **system_config**: 시스템 설정 (CMS)
- **audit_logs**: 감사 로그

---

## 🔒 보안

- Row Level Security (RLS) 적용
- bcrypt를 이용한 비밀번호 해싱
- JWT 기반 세션 관리
- Middleware를 통한 경로별 권한 체크
- 감사 로그 기록

---

## 📝 개발 가이드

### RBAC 권한 체크 예시

```typescript
import { canViewReport, isDepartmentHead } from '@/lib/auth/permissions';

// 부서장인지 확인
if (isDepartmentHead(currentUser)) {
  // 모든 데이터 접근 가능
}

// 보고서 조회 권한 확인
if (canViewReport(currentUser, report, reportAuthor)) {
  // 보고서 표시
}
```

### API 호출 예시

```typescript
// 로그인
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ employee_id: 'EMP001', password: 'password123' }),
});

// 현재 사용자 정보
const response = await fetch('/api/auth/me');
const data = await response.json();
```

---

## 🛠 향후 개발 계획

- [ ] 주간 보고서 전체 CRUD API 구현
- [ ] 일정 관리 시스템 (react-big-calendar 통합)
- [ ] 게시판 전체 기능 구현
- [ ] 파일 업로드 (Supabase Storage)
- [ ] 실시간 알림 (Supabase Realtime)
- [ ] 모바일 반응형 최적화
- [ ] 다크 모드 지원

---

## 📞 문의

프로젝트 관련 문의사항은 관리자에게 연락하세요.

---

## 📄 라이선스

이 프로젝트는 아마노코리아 영업기획 및 관리본부 전용입니다.
무단 복제 및 배포를 금지합니다.

© 2026 아마노코리아. All rights reserved.
