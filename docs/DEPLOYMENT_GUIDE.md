# 🚀 배포 가이드 (Vercel)

아마노코리아 통합 협업 플랫폼을 Vercel에 배포하는 전체 가이드입니다.

---

## 📋 사전 준비

### 1. 필수 계정
- [Supabase](https://supabase.com) 계정
- [Vercel](https://vercel.com) 계정
- [GitHub](https://github.com) 계정

### 2. 필수 확인 사항
- ✅ 로컬에서 프로젝트가 정상 작동하는지 확인
- ✅ Supabase 프로젝트 생성 및 데이터베이스 마이그레이션 완료
- ✅ GitHub 저장소 준비 완료

---

## 🗄️ 1단계: Supabase 프로젝트 설정

### 1.1 Supabase 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Name**: `amano-collaboration-platform`
   - **Database Password**: 안전한 비밀번호 생성 (저장 필수!)
   - **Region**: Northeast Asia (Seoul) 권장
4. "Create new project" 클릭 (1-2분 소요)

### 1.2 Database Migration 실행

1. Supabase Dashboard → SQL Editor 이동
2. `supabase/migrations/001_initial_schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기
4. "Run" 버튼 클릭
5. ✅ "Success" 메시지 확인

### 1.3 Seed Data 삽입 (선택 사항)

테스트용 초기 데이터를 삽입하려면:

1. SQL Editor에서 새 쿼리 생성
2. `supabase/seed.sql` 파일 내용 복사
3. 붙여넣고 "Run" 클릭
4. ✅ 7명의 테스트 사용자 생성 확인

### 1.4 API 키 확인

1. Supabase Dashboard → Settings → API
2. 다음 정보 복사 (나중에 사용):
   - **Project URL**: `https://xxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (긴 문자열)

---

## 🐙 2단계: GitHub 저장소 설정

### 2.1 GitHub 저장소 생성

1. [GitHub](https://github.com) 접속
2. "New repository" 클릭
3. 저장소 정보 입력:
   - **Repository name**: `amano-collaboration-platform`
   - **Private**: ✅ (회사 내부 프로젝트이므로 비공개 권장)
4. "Create repository" 클릭

### 2.2 코드 푸시

프로젝트 디렉토리에서:

```bash
# 원격 저장소 추가
git remote add origin https://github.com/YOUR_USERNAME/amano-collaboration-platform.git

# 코드 푸시
git push -u origin main
```

⚠️ **주의**: 
- `.env.local` 파일은 `.gitignore`에 포함되어 있어 푸시되지 않습니다
- 환경 변수는 Vercel에서 별도로 설정합니다

---

## 🚀 3단계: Vercel 배포

### 3.1 Vercel 프로젝트 생성

1. [Vercel Dashboard](https://vercel.com) 접속
2. "Add New..." → "Project" 클릭
3. "Import Git Repository" 섹션에서 GitHub 연결
4. 저장소 선택: `amano-collaboration-platform`
5. "Import" 클릭

### 3.2 프로젝트 설정

**Framework Preset**: Next.js (자동 감지됨)

**Build and Output Settings**:
- Build Command: `npm run build` (기본값)
- Output Directory: `.next` (기본값)
- Install Command: `npm install` (기본값)

### 3.3 환경 변수 설정 ⭐ 중요!

"Environment Variables" 섹션에서 다음 변수를 추가:

| Name | Value | 설명 |
|------|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxxx.supabase.co` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase anon public key |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Vercel 배포 URL (나중에 업데이트) |
| `NEXTAUTH_SECRET` | `생성된-시크릿-키` | 아래 명령어로 생성 |

#### NEXTAUTH_SECRET 생성 방법:

로컬 터미널에서:
```bash
openssl rand -base64 32
```

출력된 문자열을 복사하여 사용

### 3.4 배포 시작

1. "Deploy" 버튼 클릭
2. 빌드 진행 (2-3분 소요)
3. ✅ "Congratulations! Your project has been deployed" 메시지 확인

---

## 🔧 4단계: 배포 후 설정

### 4.1 NEXTAUTH_URL 업데이트

1. Vercel Dashboard → 프로젝트 선택 → Settings → Environment Variables
2. `NEXTAUTH_URL` 변수 수정:
   - 값: `https://your-app-name.vercel.app` (실제 배포된 URL)
3. "Save" 클릭
4. Deployments → 최신 배포 → "Redeploy" 클릭

### 4.2 Custom Domain 설정 (선택 사항)

1. Vercel Dashboard → Settings → Domains
2. "Add Domain" 클릭
3. 도메인 입력: `collaboration.amanokorea.com` (예시)
4. DNS 설정 안내에 따라 도메인 레지스트라에서 레코드 추가
5. ✅ SSL 인증서 자동 발급 완료 대기 (1-2시간)

---

## ✅ 5단계: 배포 확인

### 5.1 사이트 접속

1. Vercel이 제공한 URL 접속: `https://your-app-name.vercel.app`
2. 로그인 페이지가 정상적으로 표시되는지 확인

### 5.2 기능 테스트

#### 로그인 테스트
- 사원번호: `EMP001`
- 비밀번호: `password123`
- ✅ 로그인 후 대시보드로 이동 확인

#### 주요 기능 확인
- ✅ 대시보드 페이지 로딩
- ✅ 사이드바 네비게이션 작동
- ✅ 로그아웃 기능
- ✅ 역할별 권한 체크 (부서장/팀장/팀원)

### 5.3 모바일 반응형 확인

- 스마트폰 또는 개발자 도구의 모바일 뷰에서 확인
- ✅ 모바일 메뉴 정상 작동

---

## 🔒 6단계: 보안 설정

### 6.1 초기 비밀번호 변경

⚠️ **프로덕션 환경에서는 반드시 실행!**

1. Supabase Dashboard → SQL Editor
2. 다음 쿼리 실행하여 초기 비밀번호 변경:

```sql
-- 모든 사용자의 is_first_login을 true로 설정
UPDATE public.users SET is_first_login = true;

-- 또는 특정 사용자만 변경
UPDATE public.users 
SET is_first_login = true 
WHERE employee_id IN ('EMP001', 'EMP002', 'EMP003');
```

3. 각 사용자가 최초 로그인 시 비밀번호 변경 화면으로 이동

### 6.2 Row Level Security (RLS) 확인

Supabase Dashboard → Authentication → Policies에서:
- ✅ users 테이블 RLS 활성화 확인
- ✅ schedules 테이블 RLS 활성화 확인
- ✅ weekly_reports 테이블 RLS 활성화 확인
- ✅ posts 테이블 RLS 활성화 확인

### 6.3 Vercel 보안 설정

1. Settings → Security
2. "Password Protection" 활성화 (베타 테스트 시)
3. "Trusted IPs" 설정 (회사 IP만 허용, 선택 사항)

---

## 📊 7단계: 모니터링 설정

### 7.1 Vercel Analytics

1. Vercel Dashboard → Analytics
2. "Enable Analytics" 클릭
3. 방문자 통계, 성능 지표 모니터링

### 7.2 Supabase Monitoring

1. Supabase Dashboard → Reports
2. API 요청 수, 데이터베이스 사용량 확인

---

## 🛠 배포 트러블슈팅

### 문제 1: 빌드 실패

**증상**: Vercel 빌드 중 에러 발생

**해결**:
1. Vercel 빌드 로그 확인
2. 환경 변수 누락 여부 확인
3. `package.json`의 스크립트 확인
4. 로컬에서 `npm run build` 실행하여 미리 테스트

### 문제 2: 로그인 실패

**증상**: 로그인 시 "인증 처리 중 오류" 메시지

**해결**:
1. Supabase URL과 anon key 확인
2. `NEXTAUTH_SECRET` 설정 확인
3. Supabase Dashboard → Authentication 활성화 확인
4. 브라우저 콘솔에서 네트워크 탭 확인

### 문제 3: 환경 변수 적용 안 됨

**증상**: 환경 변수 변경 후에도 이전 값 사용

**해결**:
1. Vercel Dashboard → Deployments
2. 최신 배포 선택 → "Redeploy" 클릭
3. 환경 변수는 재배포해야 적용됨

### 문제 4: Database 연결 실패

**증상**: "Database connection error"

**해결**:
1. Supabase 프로젝트가 활성 상태인지 확인
2. SQL 마이그레이션 정상 실행 확인
3. Supabase Dashboard → Database → Connection string 확인

---

## 📞 추가 지원

### Vercel 공식 문서
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

### Supabase 공식 문서
- [Database Migrations](https://supabase.com/docs/guides/database/migrations)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ 배포 체크리스트

프로덕션 배포 전 최종 확인:

- [ ] Supabase 프로젝트 생성 완료
- [ ] Database 마이그레이션 실행 완료
- [ ] GitHub 저장소에 코드 푸시 완료
- [ ] Vercel 프로젝트 생성 완료
- [ ] 환경 변수 설정 완료 (4개 모두)
- [ ] 첫 배포 성공 확인
- [ ] NEXTAUTH_URL 업데이트 및 재배포
- [ ] 로그인 테스트 완료
- [ ] 주요 기능 테스트 완료
- [ ] 초기 비밀번호 변경 정책 적용
- [ ] RLS 정책 활성화 확인
- [ ] 모바일 반응형 테스트 완료
- [ ] 팀원들에게 URL 공유

---

🎉 **축하합니다!** 아마노코리아 통합 협업 플랫폼이 성공적으로 배포되었습니다.

© 2026 아마노코리아 영업기획 및 관리본부
