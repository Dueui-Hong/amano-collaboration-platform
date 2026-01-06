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
│   ├── api/                                # API Routes (13개)
│   │   ├── auth/                           # 인증 API (3개)
│   │   │   ├── login/route.ts             # ✅ 로그인
│   │   │   ├── logout/route.ts            # ✅ 로그아웃
│   │   │   └── me/route.ts                # ✅ 현재 사용자
│   │   ├── reports/                        # 주간 보고서 API (4개)
│   │   │   ├── route.ts                   # ✅ 목록/생성
│   │   │   └── [id]/
│   │   │       ├── route.ts               # ✅ 조회/수정/삭제
│   │   │       ├── submit/route.ts        # ✅ 제출
│   │   │       └── review/route.ts        # ✅ 검토
│   │   ├── schedules/                      # 일정 관리 API (2개)
│   │   │   ├── route.ts                   # ✅ 목록/생성
│   │   │   └── [id]/route.ts              # ✅ 조회/수정/삭제
│   │   ├── posts/                          # 게시판 API (3개)
│   │   │   ├── route.ts                   # ✅ 목록/생성
│   │   │   └── [id]/
│   │   │       ├── route.ts               # ✅ 조회/수정/삭제
│   │   │       └── permissions/route.ts   # ✅ 권한 관리
│   │   └── upload/                         # 파일 업로드 API (1개)
│   │       └── route.ts                   # ✅ 파일 업로드
│   ├── dashboard/                          # 대시보드 페이지
│   │   ├── layout.tsx                     # ✅ 레이아웃 (사이드바)
│   │   └── page.tsx                       # ✅ 메인 대시보드
│   ├── login/                              # 로그인 페이지
│   │   └── page.tsx                       # ✅ 로그인
│   ├── reports/                            # 보고서 페이지 (TODO)
│   ├── schedules/                          # 일정 페이지 (TODO)
│   ├── posts/                              # 게시판 페이지 (TODO)
│   └── settings/                           # 설정 페이지 (TODO)
├── lib/
│   ├── auth/                               # 인증 유틸리티
│   │   ├── permissions.ts                 # ✅ RBAC 권한 체크
│   │   └── utils.ts                       # ✅ 인증 헬퍼 함수
│   └── supabase/                           # Supabase 클라이언트
│       ├── client.ts                      # ✅ 브라우저 클라이언트
│       ├── server.ts                      # ✅ 서버 클라이언트
│       └── middleware.ts                  # ✅ 미들웨어 클라이언트
├── types/
│   ├── index.ts                           # ✅ 공통 타입 정의
│   └── supabase.ts                        # ✅ Supabase DB 타입
├── supabase/
│   ├── migrations/                         # SQL 마이그레이션
│   │   └── 001_initial_schema.sql         # ✅ 초기 스키마
│   └── seed.sql                           # ✅ 시드 데이터
├── docs/                                   # 문서
│   ├── DATABASE_ERD.md                    # ✅ ERD 문서
│   ├── DEPLOYMENT_GUIDE.md                # ✅ 배포 가이드
│   └── DEVELOPMENT_GUIDE.md               # ✅ 개발 가이드
├── middleware.ts                           # ✅ Next.js 미들웨어 (RBAC)
├── .env.local.example                      # ✅ 환경 변수 예시
└── README.md                               # ✅ 이 파일
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

## ✅ 구현 완료 기능 (Phase 1)

### 주간 보고서 시스템
- ✅ 보고서 생성/조회/수정/삭제 API
- ✅ 보고서 제출 API (DRAFT → SUBMITTED)
- ✅ 보고서 검토 API (팀장: APPROVED/REJECTED)
- ✅ 권한 기반 필터링 (본인/팀/전체)

### 일정 관리 시스템
- ✅ 일정 생성/조회/수정/삭제 API
- ✅ PUBLIC/PRIVATE 일정 분리
- ✅ 팀장 이상만 PUBLIC 일정 생성 가능

### 게시판 시스템
- ✅ 게시물 생성/조회/수정/삭제 API
- ✅ 게시물 권한 관리 API (부여/해제/목록)
- ✅ 공개/비공개 설정
- ✅ 카테고리 및 검색 필터

### 파일 업로드 시스템
- ✅ Supabase Storage 연동
- ✅ 파일 크기 제한 (10MB)
- ✅ 파일 형식 검증
- ✅ 공개 URL 자동 생성

### API 통계
- **총 13개 API Route** 완전 구현
  - 인증: 3개 (로그인, 로그아웃, 현재사용자)
  - 주간보고서: 4개 (CRUD + 제출 + 검토)
  - 일정관리: 2개 (CRUD)
  - 게시판: 3개 (CRUD + 권한관리)
  - 파일업로드: 1개

## 🚧 향후 개발 계획 (Phase 2)

- [ ] 프론트엔드 UI 페이지 구현
  - 주간 보고서 목록/작성/상세/검토 페이지
  - 일정 관리 캘린더 (react-big-calendar)
  - 게시판 목록/작성/상세 페이지
- [ ] Admin CMS 설정 페이지
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
