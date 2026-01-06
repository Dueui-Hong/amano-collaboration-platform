# 👨‍💻 개발 가이드

아마노코리아 통합 협업 플랫폼 개발자를 위한 상세 가이드입니다.

---

## 📚 목차

1. [프로젝트 구조](#프로젝트-구조)
2. [기술 스택](#기술-스택)
3. [로컬 개발 환경 설정](#로컬-개발-환경-설정)
4. [Database 스키마](#database-스키마)
5. [RBAC 권한 시스템](#rbac-권한-시스템)
6. [API 개발 가이드](#api-개발-가이드)
7. [컴포넌트 개발 가이드](#컴포넌트-개발-가이드)
8. [향후 개발 계획](#향후-개발-계획)

---

## 📂 프로젝트 구조

```
webapp/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (Backend)
│   │   ├── auth/                 # 인증 관련 API
│   │   │   ├── login/route.ts   # 로그인
│   │   │   ├── logout/route.ts  # 로그아웃
│   │   │   └── me/route.ts      # 현재 사용자 정보
│   │   ├── reports/              # TODO: 보고서 API
│   │   ├── schedules/            # TODO: 일정 API
│   │   ├── posts/                # TODO: 게시판 API
│   │   └── settings/             # TODO: 설정 API
│   ├── dashboard/                # 대시보드 페이지
│   │   ├── layout.tsx            # 사이드바 포함 레이아웃
│   │   └── page.tsx              # 메인 대시보드
│   ├── login/                    # 로그인 페이지
│   │   └── page.tsx
│   ├── reports/                  # TODO: 보고서 페이지
│   ├── schedules/                # TODO: 일정 페이지
│   ├── posts/                    # TODO: 게시판 페이지
│   └── settings/                 # TODO: 설정 페이지
├── lib/
│   ├── auth/                     # 인증 유틸리티
│   │   ├── permissions.ts        # RBAC 권한 체크 함수
│   │   └── utils.ts              # 인증 헬퍼 함수
│   └── supabase/                 # Supabase 클라이언트
│       ├── client.ts             # 브라우저 클라이언트
│       ├── server.ts             # 서버 컴포넌트 클라이언트
│       └── middleware.ts         # 미들웨어 클라이언트
├── types/
│   ├── index.ts                  # 공통 타입 정의
│   └── supabase.ts               # Supabase DB 타입
├── supabase/
│   ├── migrations/               # SQL 마이그레이션
│   │   └── 001_initial_schema.sql
│   └── seed.sql                  # 시드 데이터
├── docs/                         # 문서
│   ├── DATABASE_ERD.md           # ERD
│   ├── DEPLOYMENT_GUIDE.md       # 배포 가이드
│   └── DEVELOPMENT_GUIDE.md      # 이 파일
├── middleware.ts                 # Next.js 미들웨어 (RBAC)
├── .env.local.example            # 환경 변수 예시
└── README.md                     # 프로젝트 README
```

---

## 🛠 기술 스택

### Frontend
- **Next.js 14**: App Router, Server Components, API Routes
- **TypeScript**: 타입 안정성
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Heroicons**: React 아이콘 라이브러리

### Backend
- **Next.js API Routes**: RESTful API
- **Supabase**: PostgreSQL 데이터베이스
- **bcryptjs**: 비밀번호 해싱

### Authentication
- **Supabase Auth**: JWT 기반 세션 관리
- **Row Level Security (RLS)**: 데이터베이스 레벨 권한 제어

### 향후 추가 예정
- **react-big-calendar**: 일정 관리 캘린더 UI
- **react-hook-form + zod**: 폼 검증
- **zustand**: 상태 관리 (필요 시)

---

## 💻 로컬 개발 환경 설정

### 1. 저장소 클론

```bash
git clone https://github.com/YOUR_USERNAME/amano-collaboration-platform.git
cd amano-collaboration-platform
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일 생성:

```bash
cp .env.local.example .env.local
```

`.env.local` 파일 수정:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

### 4. Supabase 설정

1. Supabase 프로젝트 생성
2. `supabase/migrations/001_initial_schema.sql` 실행
3. `supabase/seed.sql` 실행 (선택)

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 🗄️ Database 스키마

### 주요 테이블

#### 1. users (사용자)
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY,
  employee_id VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL, -- DEPARTMENT_HEAD, TEAM_LEADER, TEAM_MEMBER
  team VARCHAR(50) NOT NULL, -- 기획홍보팀, 통합수주관리팀, 부서장
  position VARCHAR(50),
  is_first_login BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. weekly_reports (주간 보고서)
```sql
CREATE TABLE public.weekly_reports (
  id UUID PRIMARY KEY,
  author_id UUID REFERENCES public.users(id),
  week_start_date DATE NOT NULL,
  this_week_work TEXT NOT NULL,
  next_week_plan TEXT NOT NULL,
  issues TEXT,
  status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, APPROVED, REJECTED
  reviewer_id UUID REFERENCES public.users(id),
  reviewer_comment TEXT,
  submitted_at TIMESTAMPTZ
);
```

#### 3. schedules (일정)
```sql
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  type VARCHAR(20) NOT NULL, -- PUBLIC, PRIVATE
  created_by UUID REFERENCES public.users(id)
);
```

#### 4. posts (게시물)
```sql
CREATE TABLE public.posts (
  id UUID PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.users(id),
  is_public BOOLEAN DEFAULT FALSE
);
```

#### 5. post_permissions (게시물 권한)
```sql
CREATE TABLE public.post_permissions (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id),
  user_id UUID REFERENCES public.users(id),
  granted_by UUID REFERENCES public.users(id),
  UNIQUE(post_id, user_id)
);
```

자세한 ERD는 `docs/DATABASE_ERD.md` 참고

---

## 🔐 RBAC 권한 시스템

### 역할 레벨

```typescript
DEPARTMENT_HEAD (Level 1) - 부서장
  ↓ 모든 데이터 조회/수정/삭제
  
TEAM_LEADER (Level 2) - 팀장
  ↓ 소속 팀원 관리, 권한 부여, 보고서 검토
  
TEAM_MEMBER (Level 3) - 팀원
  ↓ 본인 데이터만 관리
```

### 권한 체크 함수 사용

```typescript
import {
  isDepartmentHead,
  isTeamLeader,
  canViewReport,
  canEditPost,
  getPermissions,
} from '@/lib/auth/permissions';

// 부서장 확인
if (isDepartmentHead(currentUser)) {
  // 모든 권한
}

// 보고서 조회 권한
if (canViewReport(currentUser, report, reportAuthor)) {
  // 보고서 표시
}

// 종합 권한 체크
const permissions = getPermissions(currentUser, {
  type: 'post',
  owner_id: post.author_id,
  is_public: post.is_public,
});

if (permissions.canEdit) {
  // 수정 버튼 표시
}
```

### Middleware 경로 보호

`middleware.ts`에서 자동으로 처리:

```typescript
// 인증 필요 경로
PROTECTED_ROUTES = ['/dashboard', '/reports', '/schedules', '/posts', '/settings', '/admin'];

// 부서장 전용
ADMIN_ONLY_ROUTES = ['/admin', '/settings/system'];

// 팀장 이상
TEAM_LEADER_ROUTES = ['/reports/review', '/posts/permissions'];
```

---

## 🔌 API 개발 가이드

### API Route 템플릿

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: '인증되지 않은 사용자입니다.',
            code: 'UNAUTHORIZED',
          },
        },
        { status: 401 }
      );
    }

    // DB에서 사용자 정보 조회
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    // 권한 체크
    if (userData.role !== 'DEPARTMENT_HEAD') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: '권한이 없습니다.',
            code: 'FORBIDDEN',
          },
        },
        { status: 403 }
      );
    }

    // 비즈니스 로직
    const { data, error } = await supabase
      .from('your_table')
      .select('*');

    if (error) throw error;

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          message: '서버 오류가 발생했습니다.',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
```

---

## 🎨 컴포넌트 개발 가이드

### 클라이언트 컴포넌트 템플릿

```typescript
'use client';

import { useState, useEffect } from 'react';

interface Props {
  // props 정의
}

export default function MyComponent({ }: Props) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/endpoint');
        const result = await response.json();

        if (!result.success) {
          setError(result.error.message);
          return;
        }

        setData(result.data);
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div>
      {/* 컴포넌트 내용 */}
    </div>
  );
}
```

### 서버 컴포넌트 템플릿

```typescript
import { createClient } from '@/lib/supabase/server';

export default async function MyServerComponent() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('your_table')
    .select('*');

  if (error) {
    return <div>데이터를 불러오는데 실패했습니다.</div>;
  }

  return (
    <div>
      {data.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

---

## 🚧 향후 개발 계획

### Phase 1: 핵심 기능 완성 (우선순위 높음)

#### 1. 주간 보고서 시스템
- [ ] 보고서 작성 페이지 (`/reports/new`)
- [ ] 보고서 목록 페이지 (`/reports`)
- [ ] 보고서 상세 페이지 (`/reports/[id]`)
- [ ] 팀장 검토 페이지 (`/reports/review`)
- [ ] API Routes:
  - `POST /api/reports` - 보고서 생성
  - `GET /api/reports` - 보고서 목록
  - `GET /api/reports/[id]` - 보고서 조회
  - `PUT /api/reports/[id]` - 보고서 수정
  - `POST /api/reports/[id]/submit` - 보고서 제출
  - `POST /api/reports/[id]/review` - 보고서 검토

#### 2. 일정 관리 시스템
- [ ] 캘린더 페이지 (`/schedules`)
- [ ] react-big-calendar 통합
- [ ] 일정 생성/수정/삭제 모달
- [ ] API Routes:
  - `POST /api/schedules` - 일정 생성
  - `GET /api/schedules` - 일정 목록
  - `PUT /api/schedules/[id]` - 일정 수정
  - `DELETE /api/schedules/[id]` - 일정 삭제

#### 3. 게시판 시스템
- [ ] 게시물 목록 페이지 (`/posts`)
- [ ] 게시물 작성 페이지 (`/posts/new`)
- [ ] 게시물 상세 페이지 (`/posts/[id]`)
- [ ] 권한 관리 모달 (팀장용)
- [ ] API Routes:
  - `POST /api/posts` - 게시물 생성
  - `GET /api/posts` - 게시물 목록
  - `GET /api/posts/[id]` - 게시물 조회
  - `PUT /api/posts/[id]` - 게시물 수정
  - `DELETE /api/posts/[id]` - 게시물 삭제
  - `POST /api/posts/[id]/permissions` - 권한 부여

### Phase 2: 추가 기능 (우선순위 중간)

#### 4. Admin CMS
- [ ] 시스템 설정 페이지 (`/settings/system`)
- [ ] 로고/이미지 업로드
- [ ] Supabase Storage 연동
- [ ] API Routes:
  - `GET /api/settings/config` - 설정 조회
  - `PUT /api/settings/config` - 설정 업데이트

#### 5. 사용자 프로필
- [ ] 프로필 페이지 (`/profile`)
- [ ] 비밀번호 변경
- [ ] 프로필 이미지 업로드

### Phase 3: 개선 사항 (우선순위 낮음)

#### 6. 실시간 알림
- [ ] Supabase Realtime 연동
- [ ] 알림 컴포넌트
- [ ] 알림 설정

#### 7. 파일 업로드
- [ ] Supabase Storage 버킷 생성
- [ ] 파일 업로드 컴포넌트
- [ ] 첨부 파일 다운로드

#### 8. 모바일 최적화
- [ ] 반응형 디자인 개선
- [ ] 터치 제스처 지원
- [ ] PWA 지원

---

## 📝 코딩 컨벤션

### TypeScript
- 모든 함수에 타입 정의
- `any` 사용 최소화
- interface보다 type 권장

### 파일 네이밍
- 컴포넌트: PascalCase (`MyComponent.tsx`)
- 유틸리티: camelCase (`authUtils.ts`)
- API 라우트: kebab-case (`/api/weekly-reports`)

### 커밋 메시지
```
feat: 새로운 기능
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 리팩토링
test: 테스트 추가
chore: 빌드 설정 등
```

---

## 🐛 디버깅 팁

### 1. Supabase RLS 디버깅

RLS 정책으로 인해 데이터가 안 보이는 경우:

```sql
-- SQL Editor에서 RLS 임시 비활성화
ALTER TABLE public.your_table DISABLE ROW LEVEL SECURITY;

-- 테스트 후 다시 활성화
ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;
```

### 2. Next.js 캐시 초기화

```bash
rm -rf .next
npm run dev
```

### 3. Supabase 클라이언트 디버깅

```typescript
const { data, error } = await supabase.from('users').select('*');

console.log('Data:', data);
console.log('Error:', error); // 자세한 에러 정보
```

---

## 📞 지원

개발 중 문의사항은 프로젝트 관리자에게 연락하세요.

---

© 2026 아마노코리아 영업기획 및 관리본부
