# 🎯 Supabase 프로젝트 설정 완벽 가이드

## Step 1: Supabase 프로젝트 생성

### 1.1 회원가입 및 로그인
1. [https://supabase.com](https://supabase.com) 접속
2. 우측 상단 **"Start your project"** 클릭
3. GitHub 계정으로 로그인 (추천) 또는 이메일 가입

### 1.2 새 프로젝트 생성
1. **"New Project"** 버튼 클릭
2. 프로젝트 정보 입력:
   - **Name**: `amano-collaboration` (원하는 이름)
   - **Database Password**: **강력한 비밀번호 생성 후 반드시 메모!**
   - **Region**: `Northeast Asia (Seoul)` 선택 (가장 빠름)
   - **Pricing Plan**: `Free` 선택
3. **"Create new project"** 클릭
4. ⏱️ 프로젝트 생성 대기 (1-2분)

---

## Step 2: Database Schema 생성

### 2.1 SQL Editor 열기
1. 좌측 메뉴에서 **"SQL Editor"** 클릭
2. **"New query"** 버튼 클릭

### 2.2 초기 스키마 실행
1. 아래 파일 내용을 복사:
   - 📁 파일 위치: `supabase/migrations/001_initial_schema.sql`
   
2. SQL Editor에 **전체 내용 붙여넣기**

3. 우측 하단 **"Run"** 버튼 클릭 (또는 Ctrl/Cmd + Enter)

4. ✅ 성공 확인:
   ```
   Success. No rows returned
   ```
   메시지가 표시되면 성공!

### 2.3 테이블 생성 확인
1. 좌측 메뉴에서 **"Table Editor"** 클릭
2. 다음 테이블들이 생성되었는지 확인:
   - ✅ users
   - ✅ schedules
   - ✅ weekly_reports
   - ✅ posts
   - ✅ post_permissions
   - ✅ system_config
   - ✅ audit_logs

---

## Step 3: 테스트 데이터 삽입 (선택 사항)

### 3.1 Seed Data 실행
1. SQL Editor에서 **"New query"** 클릭
2. 아래 파일 내용을 복사:
   - 📁 파일 위치: `supabase/seed.sql`
   
3. SQL Editor에 붙여넣기
4. **"Run"** 버튼 클릭

5. ✅ 성공 확인:
   ```
   Success. No rows returned
   ```

### 3.2 테스트 계정 확인
1. 좌측 메뉴 **"Table Editor"** → **users** 테이블 선택
2. 7명의 사용자가 생성되었는지 확인:
   - EMP001 (부서장)
   - EMP002 (기획홍보팀 팀장)
   - EMP003, EMP004, EMP005 (기획홍보팀 팀원)
   - EMP006 (통합수주관리팀 팀장)
   - EMP007 (통합수주관리팀 팀원)

**⚠️ 중요: 모든 계정의 초기 비밀번호는 `password123` 입니다.**

---

## Step 4: Supabase Storage 버킷 생성 (파일 업로드용)

### 4.1 Storage 설정
1. 좌측 메뉴에서 **"Storage"** 클릭
2. **"Create a new bucket"** 클릭
3. 버킷 정보 입력:
   - **Name**: `uploads`
   - **Public bucket**: ✅ 체크 (파일을 공개적으로 접근 가능하게)
4. **"Create bucket"** 클릭

### 4.2 Storage 정책 설정 (선택)
1. `uploads` 버킷 클릭
2. 상단 **"Policies"** 탭 클릭
3. **"New Policy"** → **"For full customization"** 선택
4. 다음 정책 추가:

```sql
-- 업로드 정책 (모든 인증된 사용자)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- 조회 정책 (모든 사용자)
CREATE POLICY "Allow public access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'uploads');
```

---

## Step 5: API 키 복사

### 5.1 Project Settings 열기
1. 좌측 하단 **톱니바퀴 아이콘 (Settings)** 클릭
2. **"API"** 메뉴 선택

### 5.2 필요한 정보 복사 (중요!)
다음 정보를 **메모장에 복사**해두세요:

1. **Project URL**
   ```
   예시: https://abcdefghijklmnop.supabase.co
   ```

2. **anon public key** (project API keys 섹션)
   ```
   예시: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

⚠️ **절대로 service_role key는 사용하지 마세요!** (보안상 위험)

---

## ✅ Supabase 설정 완료 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] Database Password 메모
- [ ] 초기 스키마 실행 (001_initial_schema.sql)
- [ ] 7개 테이블 생성 확인
- [ ] (선택) 테스트 데이터 삽입 (seed.sql)
- [ ] (선택) Storage 버킷 `uploads` 생성
- [ ] Project URL 복사
- [ ] anon public key 복사

---

## 🚨 문제 해결

### SQL 실행 시 에러가 발생하는 경우

**에러 1: "relation already exists"**
```
해결: 테이블이 이미 존재합니다. SQL Editor에서 다음 실행:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
그 후 다시 001_initial_schema.sql 실행
```

**에러 2: "permission denied"**
```
해결: 
1. Project Settings → Database → Reset Database Password
2. 새 비밀번호 설정 후 다시 시도
```

**에러 3: Seed 데이터 삽입 시 "duplicate key value"**
```
해결: 정상입니다! 이미 데이터가 존재한다는 의미입니다.
Table Editor에서 users 테이블을 확인하세요.
```

---

## 📞 추가 도움

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase SQL 가이드](https://supabase.com/docs/guides/database)

---

다음 단계: **환경 변수 설정**으로 이동하세요!
