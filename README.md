# 아마노코리아 PPT 자동화 시스템

아마노코리아 기획홍보팀을 위한 폐쇄형 업무 관리 및 PPT 주간보고서 자동 생성 시스템

## 📋 프로젝트 개요

### 핵심 기능
- **공개 요청 폼**: 외부 부서에서 로그인 없이 업무 요청 가능
- **업무 배분**: 팀장이 Drag & Drop으로 팀원에게 업무 배정
- **개인 캘린더**: 팀원이 FullCalendar로 업무 진행 상태 관리
- **PPT 자동 생성**: 매주 금요일, 완료된 업무를 회사 양식의 PPT로 자동 생성

### 기술 스택
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: Supabase (PostgreSQL + RLS)
- **Storage**: Supabase Storage (이미지 첨부)
- **PPT Generation**: PptxGenJS
- **Calendar**: FullCalendar
- **Drag & Drop**: @hello-pangea/dnd

## 🌐 현재 실행 중인 시스템

**✅ 시스템 상태**: 정상 운영 중

### 접속 URL
- **메인 페이지**: https://3000-isotlhp28qrkawj35ieh7-cc2fbc16.sandbox.novita.ai
- **공개 요청 폼**: https://3000-isotlhp28qrkawj35ieh7-cc2fbc16.sandbox.novita.ai/request
- **로그인**: https://3000-isotlhp28qrkawj35ieh7-cc2fbc16.sandbox.novita.ai/login
- **관리자 대시보드**: https://3000-isotlhp28qrkawj35ieh7-cc2fbc16.sandbox.novita.ai/admin/dashboard
- **팀원 캘린더**: https://3000-isotlhp28qrkawj35ieh7-cc2fbc16.sandbox.novita.ai/dashboard

### Supabase 프로젝트
- **Project URL**: https://wsredeftfoelzgkdalhx.supabase.co

### 테스트 계정
- 관리자: `admin@amano.kr` / `password123`
- 팀원: `designer@amano.kr` / `password123`

## 🚀 로컬 개발 시작하기

### 1. 환경변수 설정

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wsredeftfoelzgkdalhx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXTAUTH_SECRET=amano-ppt-automation-secret-key-2026
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Supabase 데이터베이스 설정

1. Supabase SQL Editor 접속: https://supabase.com/dashboard/project/wsredeftfoelzgkdalhx/sql/new
2. `supabase/migrations/001_initial_schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기 후 실행

**또는** 테스트 계정 수동 생성:
1. Supabase → Authentication → Users
2. "Add user" 클릭
3. Email: `admin@amano.kr`, Password: `password123`
4. "Auto Confirm User" 체크
5. SQL Editor에서 프로필 생성:
```sql
INSERT INTO public.profiles (id, name, role, position, email)
VALUES ('사용자UUID', '김팀장', 'admin', '팀장', 'admin@amano.kr');
```

### 3. 패키지 설치 및 실행

```bash
npm install
npm run dev
```

http://localhost:3000 접속

## 📁 프로젝트 구조

```
webapp/
├── src/
│   ├── app/
│   │   ├── request/          # 공개 요청 폼 (로그인 불필요)
│   │   ├── login/            # 로그인 페이지
│   │   ├── admin/dashboard/  # 관리자 대시보드 (업무 배분)
│   │   ├── dashboard/        # 팀원 대시보드 (개인 캘린더)
│   │   └── api/
│   │       ├── tasks/        # 업무 CRUD API
│   │       └── pptx/         # PPT 생성 API
│   ├── lib/
│   │   ├── supabase.ts       # Supabase 클라이언트
│   │   └── pptx-generator.ts # PPT 생성 모듈
│   └── middleware.ts         # 인증 미들웨어
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
└── package.json
```

## 🔐 인증 및 권한

### 사용자 역할
- **admin**: 팀장 - 모든 업무 조회/배정 가능
- **member**: 팀원 - 자신의 업무만 조회/수정 가능

### 보호된 경로
- `/admin/*`: 관리자만 접근
- `/dashboard`: 로그인 유저만 접근
- `/request`: 누구나 접근 가능

### 테스트 계정
- 관리자: `admin@amano.kr` / `password123`
- 팀원: `designer@amano.kr` / `password123`

## 📊 데이터베이스 스키마

### profiles 테이블
- `id`: UUID (PK)
- `name`: 이름
- `role`: 역할 (admin | member)
- `position`: 직책
- `email`: 이메일

### tasks 테이블
- `id`: UUID (PK)
- `title`: 업무 제목
- `requester_dept`: 요청 부서
- `requester_name`: 담당자명
- `description`: 상세내용
- `status`: 상태 (Unassigned | Todo | Doing | Done)
- `category`: 카테고리 (기획 | 디자인 | 영상 | 3D MAX | 맵작업 | 시설점검)
- `due_date`: 마감일
- `completed_at`: 완료 시각
- `assignee_id`: 배정된 팀원 ID
- `image_urls`: 첨부 이미지 배열

## 📝 PPT 자동 생성 로직

### 생성 조건
- **버튼 클릭 시점** 기준
- **지난주 금요일 00:00 ~ 이번주 목요일 23:59** 사이에 완료된 업무

### 슬라이드 타입

#### Type A (리스트형)
- **조건**: 카테고리가 '기획'/'시설점검' 또는 이미지 없음
- **레이아웃**: 
  - 상단: 날짜 + 카테고리
  - 본문: 현장명/담당자/상세스펙 표 형태

#### Type B (이미지 중심)
- **조건**: 카테고리 '디자인'/'3D MAX'/'맵작업' + 이미지 있음
- **레이아웃**:
  - 좌상단: 날짜/카테고리/프로젝트명/담당자
  - 메인: 결과물 이미지 80% 배치 (그리드 또는 중앙 배치)

### 마스터 슬라이드 공통 요소
- **좌상단**: "Total Parking Management System" (10pt 회색)
- **우상단**: "Worldwide Parking NO.1 | A AMANO" 로고
- **배경**: 흰색/연회색

## 🔄 업무 흐름

1. **외부 부서 요청**: `/request` 페이지에서 업무 요청 (파일 첨부 가능)
2. **팀장 배분**: `/admin/dashboard`에서 Drag & Drop으로 팀원에게 배정
3. **팀원 진행**: `/dashboard` 개인 캘린더에서 상태 변경 (Todo → Doing → Done)
4. **PPT 생성**: 매주 금요일, 완료된 업무 자동 PPT 생성 버튼 클릭

## 📦 배포

### Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

### 환경변수 설정
Vercel 대시보드에서 환경변수 추가:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET`

## 📄 라이선스

Proprietary - 아마노코리아 내부 사용 전용

## 📞 문의

기획홍보팀 내선: 1234

---

**마지막 업데이트**: 2026-01-15
