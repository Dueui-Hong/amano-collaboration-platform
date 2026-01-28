# 🔧 Supabase 프로젝트 복구 가이드

## 📌 상황
- 기존 Supabase 프로젝트가 삭제됨
- 데이터베이스 스키마와 마이그레이션 파일은 보존됨
- 완전한 복구 가능!

---

## 🚀 복구 절차

### 1단계: 새 Supabase 프로젝트 생성

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - **Project Name**: `amano-ppt-automation` (또는 원하는 이름)
   - **Database Password**: 안전한 비밀번호 입력 (꼭 기억하세요!)
   - **Region**: `Northeast Asia (Seoul)` (한국에서 가장 빠름)
   - "Create new project" 클릭

3. **프로젝트 생성 대기**
   - 약 2-3분 소요
   - 생성 완료 후 다음 정보 확인:
     - Project URL (예: `https://xxxxxxxxxxxxx.supabase.co`)
     - API Keys (anon public, service_role)

---

### 2단계: 프로젝트 정보 복사

프로젝트가 생성되면 **Settings → API** 메뉴로 이동:

1. **Project URL** 복사
   ```
   예시: https://abcdefghijklmnop.supabase.co
   ```

2. **anon public key** 복사
   ```
   예시: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **service_role key** 복사
   ```
   예시: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

### 3단계: 환경 변수 업데이트

위에서 복사한 정보를 아래에 입력하고, 이 정보를 저에게 알려주세요:

```bash
# 새 Supabase 프로젝트 정보
SUPABASE_URL=여기에_Project_URL_입력
SUPABASE_ANON_KEY=여기에_anon_public_key_입력
SUPABASE_SERVICE_ROLE_KEY=여기에_service_role_key_입력
```

**예시:**
```bash
SUPABASE_URL=https://newproject123.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

---

### 4단계: 데이터베이스 스키마 복구

새 프로젝트 정보를 주시면, 제가 다음 작업을 자동으로 수행합니다:

1. **.env.local 파일 업데이트**
   - 새 Supabase URL과 API 키로 교체

2. **데이터베이스 스키마 적용**
   - SQL Editor에서 마이그레이션 파일 실행
   - 테이블 생성 (profiles, tasks, board_posts)
   - Storage 버킷 생성 (task-images)
   - RLS 정책 설정
   - 인덱스 및 트리거 생성

3. **샘플 계정 생성**
   - 관리자: minseok_kim1@amano.co.kr / 1111
   - 팀원들: seyoung_hong@amano.co.kr / 1111 등

4. **서버 재시작**
   - 프로덕션 빌드
   - PM2 재시작
   - 정상 작동 확인

---

### 5단계: 테스트

복구 완료 후:
1. 로그인 페이지 접속
2. 샘플 계정으로 로그인
3. 모든 기능 정상 작동 확인

---

## 📋 복구될 내용

### ✅ 데이터베이스 구조
- **profiles 테이블**: 사용자 프로필 (관리자/팀원 구분)
- **tasks 테이블**: 업무 관리 (제목, 상태, 카테고리, 마감일 등)
- **board_posts 테이블**: 자료 게시판 (제목, 내용, 첨부파일)

### ✅ 스토리지
- **task-images 버킷**: 업무 이미지 및 게시판 첨부파일

### ✅ 보안 정책
- Row Level Security (RLS)
- 관리자/팀원 권한 구분
- 인증된 사용자만 접근 가능

### ✅ 샘플 데이터
- 관리자 계정 1개
- 팀원 계정 3개
- 샘플 업무 2개

### ❌ 복구 불가능한 내용
- 기존 프로젝트의 실제 데이터 (업무, 게시글 등)
- 업로드된 파일 및 이미지
- 기존 사용자 계정 (재생성 필요)

---

## 🎯 다음 단계

**홍두의님께서 하실 일:**
1. 새 Supabase 프로젝트 생성
2. Project URL과 API Keys 복사
3. 위의 정보를 저에게 제공

**제가 할 일:**
1. 환경 변수 업데이트
2. 데이터베이스 스키마 복구
3. 샘플 계정 생성
4. 서버 재시작 및 테스트

---

## 💡 팁

- **데이터베이스 비밀번호**: 생성 시 입력한 비밀번호는 잘 보관하세요 (나중에 필요할 수 있음)
- **프로젝트 URL**: 이전과 다른 URL이 생성됩니다
- **무료 플랜**: 7일간 미사용 시 자동 일시 중지되니 정기적으로 사용하세요
- **백업**: 중요한 데이터는 정기적으로 백업하세요

---

## 📞 도움이 필요하시면

새 프로젝트를 생성하신 후, 아래 정보를 알려주세요:

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

그러면 제가 즉시 복구 작업을 시작하겠습니다! 💪
