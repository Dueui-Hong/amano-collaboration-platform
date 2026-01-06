# 🚀 아마노코리아 협업 플랫폼 테스트 가이드

## 목표
이 프로젝트를 실제로 테스트할 수 있도록 모든 단계를 처음부터 끝까지 안내합니다.

---

## ⏱️ 소요 시간
- **방법 A (로컬 테스트)**: 약 5-10분
- **방법 B (Vercel 배포)**: 약 15-20분

---

## 📌 사전 준비사항

### 1. Supabase 계정 (필수)
- https://supabase.com 에서 무료 가입
- 이메일 인증 완료

### 2. 로컬 환경 (방법 A용)
- Node.js 18 이상 설치 확인
- 터미널/명령 프롬프트 사용 가능

### 3. GitHub & Vercel 계정 (방법 B용)
- GitHub: https://github.com
- Vercel: https://vercel.com (GitHub로 로그인 가능)

---

## 🎯 방법 A: 로컬 개발 서버 테스트 (추천)

### Step 1: Supabase 프로젝트 생성 (3분)

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard 로그인
   - 우측 상단 "New project" 클릭

2. **프로젝트 설정**
   ```
   Organization: 본인 계정 선택
   Project Name: amano-collaboration-platform
   Database Password: 안전한 비밀번호 입력 (예: MySecurePassword123!)
   Region: Northeast Asia (Seoul) 선택 (한국과 가장 가까움)
   Pricing Plan: Free 선택
   ```
   - "Create new project" 클릭
   - 프로젝트 생성 대기 (약 1-2분)

3. **API 키 복사**
   - 좌측 메뉴에서 "Settings" > "API" 클릭
   - 다음 두 값을 복사해두세요:
     * `Project URL` (예: https://xxxxxxxxxxxxx.supabase.co)
     * `anon public` API key (매우 긴 문자열)

### Step 2: 데이터베이스 스키마 적용 (2분)

1. **SQL Editor 열기**
   - 좌측 메뉴에서 "SQL Editor" 클릭
   - "+ New query" 버튼 클릭

2. **마이그레이션 SQL 실행**
   - 이 프로젝트의 `supabase/migrations/001_initial_schema.sql` 파일 내용 전체를 복사
   - SQL Editor에 붙여넣기
   - 우측 하단 "Run" 버튼 클릭
   - ✅ Success 메시지 확인

3. **테스트 데이터 추가 (선택사항)**
   - 다시 "+ New query" 클릭
   - `supabase/seed.sql` 파일 내용 전체를 복사
   - 붙여넣고 "Run" 클릭
   - ✅ 7명의 테스트 계정이 생성됨

### Step 3: 환경 변수 설정 (1분)

1. **프로젝트 폴더로 이동**
   ```bash
   cd /home/user/webapp
   ```

2. **`.env.local` 파일 생성**
   ```bash
   # .env.local.example을 복사해서 .env.local 생성
   cp .env.local.example .env.local
   ```

3. **환경 변수 입력**
   `.env.local` 파일을 열어서 다음 값들을 입력:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   - Step 1에서 복사한 Project URL과 anon public key를 붙여넣기

### Step 4: 개발 서버 실행 (1분)

1. **의존성 설치 (이미 완료된 경우 생략)**
   ```bash
   npm install
   ```

2. **개발 서버 시작**
   ```bash
   npm run dev
   ```

3. **브라우저 열기**
   - http://localhost:3000 접속
   - 로그인 페이지가 표시됨

### Step 5: 테스트 로그인 및 기능 확인 (3분)

#### 테스트 계정 목록
| 사원번호 | 역할 | 비밀번호 | 권한 |
|---------|------|---------|------|
| EMP001 | 부서장 (본부장) | password123 | 전체 데이터 접근 |
| EMP002 | 팀장 (기획홍보팀) | password123 | 팀원 관리 + 보고서 검토 |
| EMP003 | 팀원 (기획홍보팀) | password123 | 본인 데이터만 |
| EMP004 | 팀원 (기획홍보팀) | password123 | 본인 데이터만 |
| EMP005 | 팀원 (기획홍보팀) | password123 | 본인 데이터만 |
| EMP006 | 팀장 (통합수주관리팀) | password123 | 팀원 관리 + 보고서 검토 |
| EMP007 | 팀원 (통합수주관리팀) | password123 | 본인 데이터만 |

#### 테스트 시나리오

1. **부서장 계정 테스트 (EMP001)**
   - 사원번호: `EMP001`
   - 비밀번호: `password123`
   - 로그인 후 대시보드 확인
   - 모든 메뉴가 보이는지 확인

2. **팀장 계정 테스트 (EMP002)**
   - 로그아웃 후 재로그인
   - 사원번호: `EMP002`
   - 비밀번호: `password123`
   - 팀원 관리 메뉴 확인

3. **팀원 계정 테스트 (EMP003)**
   - 로그아웃 후 재로그인
   - 사원번호: `EMP003`
   - 비밀번호: `password123`
   - 제한된 메뉴만 보이는지 확인

#### API 엔드포인트 테스트 (선택사항)

터미널에서 curl 명령어로 API 테스트:

```bash
# 1. 로그인 API 테스트
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"EMP001","password":"password123"}'

# 2. 주간 보고서 목록 조회 (로그인 후 토큰 필요)
curl http://localhost:3000/api/reports \
  -H "Cookie: sb-access-token=YOUR_TOKEN_HERE"

# 3. 일정 목록 조회
curl http://localhost:3000/api/schedules \
  -H "Cookie: sb-access-token=YOUR_TOKEN_HERE"

# 4. 게시판 목록 조회
curl http://localhost:3000/api/posts \
  -H "Cookie: sb-access-token=YOUR_TOKEN_HERE"
```

---

## 🌐 방법 B: Vercel 프로덕션 배포 테스트

### Step 1: GitHub 리포지토리 생성 및 푸시 (5분)

1. **GitHub 설정**
   - GitHub 웹사이트에서 새 리포지토리 생성
   - Repository name: `amano-collaboration-platform`
   - Private 선택 (보안을 위해)
   - "Create repository" 클릭

2. **로컬 코드를 GitHub에 푸시**
   ```bash
   cd /home/user/webapp
   git remote add origin https://github.com/YOUR_USERNAME/amano-collaboration-platform.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Vercel 배포 설정 (5분)

1. **Vercel 로그인**
   - https://vercel.com 접속
   - "Sign up" 또는 "Login with GitHub" 클릭

2. **새 프로젝트 생성**
   - 대시보드에서 "Add New..." > "Project" 클릭
   - GitHub에서 `amano-collaboration-platform` 리포지토리 선택
   - "Import" 클릭

3. **환경 변수 설정**
   - "Configure Project" 화면에서 아래로 스크롤
   - "Environment Variables" 섹션에서 다음 변수 추가:
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://xxxxxxxxxxxxx.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
   - "Deploy" 버튼 클릭

4. **배포 완료 대기 (약 2-3분)**
   - 빌드 로그 확인
   - ✅ "Congratulations!" 메시지 확인
   - 배포된 URL 복사 (예: https://amano-collaboration-platform.vercel.app)

### Step 3: 프로덕션 환경에서 테스트 (3분)

1. **브라우저에서 접속**
   - Vercel에서 제공한 URL로 접속
   - 로그인 페이지 확인

2. **테스트 계정으로 로그인**
   - 위의 "테스트 계정 목록" 참조
   - 다양한 역할로 로그인하여 권한 확인

3. **모바일에서 테스트**
   - 스마트폰 브라우저로 URL 접속
   - 반응형 디자인 확인

---

## 🔧 문제 해결 (Troubleshooting)

### 로그인이 안 될 때
- Supabase SQL Editor에서 seed.sql을 실행했는지 확인
- `.env.local` 파일에 올바른 API 키가 입력되었는지 확인
- 개발 서버를 재시작 (Ctrl+C 후 `npm run dev`)

### "Module not found" 에러
```bash
rm -rf node_modules package-lock.json
npm install
```

### Supabase 연결 에러
- Supabase 프로젝트가 정상적으로 생성되었는지 확인
- Project URL과 anon key가 정확한지 확인
- Supabase 대시보드에서 프로젝트 상태 확인

### 권한 에러 (403 Forbidden)
- 로그인한 계정의 역할(role)이 올바른지 확인
- Supabase SQL Editor에서 users 테이블의 role 컬럼 확인
- 필요 시 SQL로 직접 수정:
  ```sql
  UPDATE users SET role = 'DepartmentHead' WHERE employee_id = 'EMP001';
  ```

---

## ✅ 테스트 완료 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] 데이터베이스 스키마 적용 완료 (001_initial_schema.sql)
- [ ] 테스트 데이터 삽입 완료 (seed.sql)
- [ ] 환경 변수 설정 완료 (.env.local)
- [ ] 로컬 개발 서버 실행 성공 (npm run dev)
- [ ] 부서장 계정으로 로그인 성공 (EMP001)
- [ ] 팀장 계정으로 로그인 성공 (EMP002)
- [ ] 팀원 계정으로 로그인 성공 (EMP003)
- [ ] 대시보드 화면 정상 표시
- [ ] API 엔드포인트 정상 응답
- [ ] (선택) Vercel 배포 성공
- [ ] (선택) 프로덕션 URL 접속 성공

---

## 📞 추가 도움이 필요하신가요?

위 단계를 따라하시면서 어려운 부분이 있으면 언제든지 질문해주세요!

- Supabase 설정 관련 질문
- 환경 변수 설정 문제
- 로그인/권한 관련 이슈
- Vercel 배포 문제
- 기능 추가 요청

프로젝트가 정상적으로 작동하는 것을 확인하셨다면, Phase 2 UI 개발을 진행할 수 있습니다!
