# 🔐 로그인 문제 해결 가이드

## 문제
- **증상**: 로그인 시 "아이디/비밀번호가 일치하지 않음" 에러
- **원인**: Supabase 데이터베이스에 사용자 계정이 생성되지 않았음

---

## ✅ 해결 방법: Supabase에서 사용자 계정 생성

### **1단계: Supabase SQL Editor 접속**

https://supabase.com/dashboard/project/wsredeftfoelzgkdalhx/sql/new

### **2단계: 아래 SQL 전체 복사**

```sql
-- 아마노코리아 테스트 사용자 생성 스크립트

-- 1. 관리자 계정 생성 (admin@amano.kr)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@amano.kr',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  'authenticated',
  'authenticated',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('password123', gen_salt('bf')),
  updated_at = NOW();

-- 관리자 프로필 생성
INSERT INTO public.profiles (id, name, role, position, email)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '김팀장',
  'admin',
  '팀장',
  'admin@amano.kr'
)
ON CONFLICT (id) DO UPDATE SET
  name = '김팀장',
  role = 'admin',
  position = '팀장',
  email = 'admin@amano.kr';

-- 2. 팀원 계정 생성 (designer@amano.kr)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'designer@amano.kr',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  'authenticated',
  'authenticated',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('password123', gen_salt('bf')),
  updated_at = NOW();

-- 팀원 프로필 생성
INSERT INTO public.profiles (id, name, role, position, email)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '박디자이너',
  'member',
  '디자이너',
  'designer@amano.kr'
)
ON CONFLICT (id) DO UPDATE SET
  name = '박디자이너',
  role = 'member',
  position = '디자이너',
  email = 'designer@amano.kr';
```

### **3단계: SQL Editor에 붙여넣고 Run 클릭**

1. Supabase SQL Editor 화면에서 위의 SQL 전체를 복사
2. 에디터에 붙여넣기
3. 우측 하단 **"Run"** 버튼 클릭
4. ✅ "Success" 메시지 확인

### **4단계: 사용자 확인**

SQL Editor에서 아래 쿼리 실행:

```sql
SELECT 
  u.id,
  u.email,
  p.name,
  p.role,
  p.position
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email IN ('admin@amano.kr', 'designer@amano.kr')
ORDER BY p.role DESC;
```

**예상 결과:**

| id | email | name | role | position |
|----|-------|------|------|----------|
| 00000000-0000-0000-0000-000000000001 | admin@amano.kr | 김팀장 | admin | 팀장 |
| 00000000-0000-0000-0000-000000000002 | designer@amano.kr | 박디자이너 | member | 디자이너 |

---

## 🧪 로그인 테스트

### **테스트 계정**

- **관리자**: 
  - 이메일: `admin@amano.kr`
  - 비밀번호: `password123`

- **팀원**: 
  - 이메일: `designer@amano.kr`
  - 비밀번호: `password123`

### **로그인 URL**

https://3000-isotlhp28qrkawj35ieh7-cc2fbc16.sandbox.novita.ai/login

---

## ❓ 문제가 계속되는 경우

### **1. 테이블이 존재하지 않는 경우**

먼저 전체 스키마를 생성하세요:

https://supabase.com/dashboard/project/wsredeftfoelzgkdalhx/sql/new

`/home/user/webapp/supabase/migrations/001_initial_schema.sql` 파일 내용을 복사하여 실행

### **2. 비밀번호 재설정**

Supabase SQL Editor에서:

```sql
-- 관리자 비밀번호 재설정
UPDATE auth.users
SET encrypted_password = crypt('password123', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'admin@amano.kr';

-- 팀원 비밀번호 재설정
UPDATE auth.users
SET encrypted_password = crypt('password123', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'designer@amano.kr';
```

### **3. 이메일 확인 상태 체크**

```sql
SELECT email, email_confirmed_at
FROM auth.users
WHERE email IN ('admin@amano.kr', 'designer@amano.kr');
```

`email_confirmed_at`이 NULL이면 확인:

```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email IN ('admin@amano.kr', 'designer@amano.kr');
```

---

## 📞 추가 지원

위의 단계를 모두 수행했는데도 로그인이 안 되면:
1. 브라우저 콘솔 (F12) 에러 확인
2. Supabase Dashboard → Authentication → Users에서 사용자 존재 확인
3. 에러 메시지를 공유해주세요

---

**마지막 업데이트**: 2026-01-15
