# 아마노코리아 PPT 자동화 시스템

아마노코리아 기획홍보팀을 위한 폐쇄형 업무 관리 및 PPT 주간보고서 자동 생성 시스템

## 📋 프로젝트 개요

### 핵심 기능
- **공개 요청 폼**: 외부 부서에서 로그인 없이 업무 요청 가능
- **➕ 팀 내부 업무 등록**: 팀원이 본인 업무 직접 등록 (NEW!)
  - 팀원: 본인 업무만 생성/조회
  - 관리자: 모든 업무 조회/수정/삭제
  - 권한 기반 UI/UX
- **📊 관리자 대시보드**: 팀 전체 업무 현황을 한눈에 파악
  - 오늘 마감 / 이번주 / 긴급(D-3) 업무 통계
  - 팀원별 업무 현황 및 진행률
  - 긴급 업무 자동 강조 (오늘 마감, D-3 이하)
- **업무 배분**: 팀장이 Drag & Drop으로 팀원에게 업무 배정
- **개인 캘린더**: 팀원이 FullCalendar로 업무 진행 상태 관리
- **📄 업무 상세 페이지**: 모든 업무의 상세 정보 조회 및 관리 (NEW!)
  - 권한 기반 상태 변경 (Todo/Doing/Done)
  - 결과물 이미지 업로드 및 갤러리
  - 긴급도 알림 시스템
- **로그아웃 & 계정 설정**: 비밀번호 변경 및 안전한 로그아웃
- **주간보고서 FAB**: 팀원도 개별적으로 주간보고서 PPT 생성 가능
- **PPT 자동 생성**: 매주 금요일, 완료된 업무를 회사 양식의 PPT로 자동 생성

### 📊 관리자 대시보드 주요 기능
- **전체 통계 카드 6개**: 오늘 마감 / 이번주 / 긴급(D-3) / 예정 / 진행중 / 완료
- **팀원별 업무 현황**: 각 팀원의 Todo/Doing/Done 개수 및 오늘 마감 업무 강조
- **미배정 업무 섹션**: 배정되지 않은 업무 목록 및 긴급도 표시
- **2가지 뷰 모드**: 
  - 📊 업무 현황 탭 (통계 중심)
  - 📋 업무 배정 탭 (Drag & Drop Kanban)
- **색상 코드 시스템**: 
  - 🔴 지연/오늘 마감
  - 🟡 긴급(D-3)
  - 🔵 진행중
  - 🟢 완료
- **📄 업무 클릭**: 모든 업무 카드 클릭 시 상세 페이지로 이동 (NEW!)

👉 **상세 가이드**: [ADMIN_DASHBOARD_GUIDE.md](./ADMIN_DASHBOARD_GUIDE.md)
👉 **업무 상세 페이지 가이드**: [TASK_DETAIL_FEATURE.md](./TASK_DETAIL_FEATURE.md)
👉 **팀 내부 업무 등록 가이드**: [INTERNAL_TASK_FEATURE.md](./INTERNAL_TASK_FEATURE.md)
👉 **서버 자동 재시작 가이드**: [SERVER_AUTO_RESTART.md](./SERVER_AUTO_RESTART.md)

### 기술 스택
- **Frontend**: Next.js 14, TypeScript, **Material-UI (MUI)**, Tailwind CSS
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
- **계정 설정**: https://3000-isotlhp28qrkawj35ieh7-cc2fbc16.sandbox.novita.ai/settings
- **업무 상세 페이지**: `/tasks/[업무ID]` (업무 클릭 시 자동 이동)

### Supabase 프로젝트
- **Project URL**: https://wsredeftfoelzgkdalhx.supabase.co

### 팀 계정 정보
**팀장 (관리자)**
- 김민석: `minseok_kim1@amano.co.kr` / `1111`

**팀원**
- 홍세영 (계장): `seyoung_hong@amano.co.kr` / `1111`
- 최예지 (사원): `yeji_choi@amano.co.kr` / `1111`
- 홍두의 (사원): `dueui_hong@amano.co.kr` / `1111`

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

## 📚 문서

- **[관리자 대시보드 가이드](./ADMIN_DASHBOARD_GUIDE.md)** - 대시보드 사용법 상세 설명
- **[팀원 추가 가이드](./ADD_MEMBERS_GUIDE.md)** - 팀원 계정 생성 방법
- **[실제 팀 정보 업데이트](./REAL_TEAM_UPDATE.md)** - 실제 팀원 정보 적용 내역

## 🎯 빠른 시작

1. **관리자로 로그인**
   ```
   URL: https://3000-isotlhp28qrkawj35ieh7-cc2fbc16.sandbox.novita.ai/login
   Email: minseok_kim1@amano.co.kr
   Password: 1111
   ```

2. **대시보드 확인**
   - 자동으로 `/admin/dashboard`로 리다이렉트
   - 📊 업무 현황 탭에서 전체 통계 확인
   - 팀원별 오늘 마감 업무 및 긴급 업무 확인

3. **업무 배정**
   - 📋 업무 배정 탭으로 전환
   - 미배정 업무를 팀원에게 Drag & Drop
   - 실시간으로 데이터베이스 업데이트

4. **PPT 생성**
   - 하단 "📊 주간보고서 PPT 생성" 버튼 클릭
   - 자동 다운로드

---

**마지막 업데이트**: 2026-01-22
