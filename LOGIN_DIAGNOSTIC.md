# 🔍 로그인 문제 진단 체크리스트

## ❌ 문제: 여전히 로그인이 안 됨

아래 단계를 **순서대로** 확인하세요.

---

## 1️⃣ **Supabase에서 사용자 존재 확인**

### **방법 1: SQL Editor에서 확인**

https://supabase.com/dashboard/project/wsredeftfoelzgkdalhx/sql/new

```sql
-- 사용자 확인
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email IN ('admin@amano.kr', 'designer@amano.kr')
ORDER BY email;
```

**예상 결과:** 2개의 행이 나와야 합니다.

- ✅ **2개 행 표시** → 사용자가 존재합니다. 2단계로 이동
- ❌ **0개 행** → 사용자가 없습니다. 아래 SQL 실행:

```sql
-- 사용자 생성 (간소화 버전)
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
VALUES 
(
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
),
(
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
ON CONFLICT (id) DO NOTHING;

-- 프로필 생성
INSERT INTO public.profiles (id, name, role, position, email)
VALUES 
  ('00000000-0000-0000-0000-000000000001', '김팀장', 'admin', '팀장', 'admin@amano.kr'),
  ('00000000-0000-0000-0000-000000000002', '박디자이너', 'member', '디자이너', 'designer@amano.kr')
ON CONFLICT (id) DO NOTHING;
```

---

## 2️⃣ **이메일 확인 상태 체크**

```sql
SELECT 
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ 미확인'
    ELSE '✅ 확인됨'
  END AS status
FROM auth.users
WHERE email IN ('admin@amano.kr', 'designer@amano.kr');
```

**결과가 "❌ 미확인"이면:**

```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email IN ('admin@amano.kr', 'designer@amano.kr')
AND email_confirmed_at IS NULL;
```

---

## 3️⃣ **비밀번호 강제 재설정**

```sql
UPDATE auth.users
SET 
  encrypted_password = crypt('password123', gen_salt('bf')),
  updated_at = NOW()
WHERE email IN ('admin@amano.kr', 'designer@amano.kr');
```

실행 후 확인:

```sql
SELECT 
  email,
  '비밀번호가 재설정되었습니다' AS message,
  updated_at
FROM auth.users
WHERE email IN ('admin@amano.kr', 'designer@amano.kr');
```

---

## 4️⃣ **Supabase 대시보드에서 직접 확인**

### **Authentication → Users 메뉴**

https://supabase.com/dashboard/project/wsredeftfoelzgkdalhx/auth/users

- ✅ `admin@amano.kr` 사용자가 보이나요?
- ✅ `designer@amano.kr` 사용자가 보이나요?

**보이지 않으면:**
- "Add user" 버튼 클릭
- Email: `admin@amano.kr`
- Password: `password123`
- Auto Confirm User: ✅ 체크
- "Create user" 클릭

---

## 5️⃣ **RLS (Row Level Security) 문제 확인**

```sql
-- RLS 비활성화 (임시 테스트용)
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- 다시 로그인 시도 후, 성공하면 RLS가 문제였던 것
```

---

## 6️⃣ **브라우저 콘솔 에러 확인**

1. 로그인 페이지 접속
2. F12 → Console 탭 열기
3. 로그인 시도
4. 빨간색 에러 메시지 복사

**흔한 에러 메시지:**

| 에러 메시지 | 원인 | 해결 |
|------------|------|------|
| `Invalid login credentials` | 비밀번호 불일치 | 3단계 비밀번호 재설정 |
| `Email not confirmed` | 이메일 미확인 | 2단계 이메일 확인 |
| `User not found` | 사용자 없음 | 1단계 사용자 생성 |
| `Network error` | Supabase 연결 문제 | 환경변수 확인 |

---

## 7️⃣ **환경변수 확인**

Supabase 프로젝트 설정이 올바른지 확인:

```bash
# .env.local 파일 내용 확인
cat /home/user/webapp/.env.local
```

**올바른 값:**
```
NEXT_PUBLIC_SUPABASE_URL=https://wsredeftfoelzgkdalhx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 8️⃣ **Supabase 대시보드에서 직접 사용자 생성 (GUI 방식)**

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard/project/wsredeftfoelzgkdalhx/auth/users

2. **"Add user" 버튼 클릭**

3. **사용자 정보 입력**
   - Email: `admin@amano.kr`
   - Password: `password123`
   - ✅ **Auto Confirm User 체크** (중요!)
   - Email Confirm: ✅ 체크

4. **"Create user" 클릭**

5. **프로필 수동 생성 (SQL Editor)**

```sql
-- 방금 생성한 사용자의 ID 확인
SELECT id, email FROM auth.users WHERE email = 'admin@amano.kr';

-- 위에서 확인한 ID를 사용하여 프로필 생성 (ID를 실제 값으로 교체)
INSERT INTO public.profiles (id, name, role, position, email)
VALUES 
  ('여기에-실제-UUID-입력', '김팀장', 'admin', '팀장', 'admin@amano.kr')
ON CONFLICT (id) DO UPDATE SET
  name = '김팀장',
  role = 'admin',
  position = '팀장';
```

---

## 9️⃣ **최종 확인 쿼리**

모든 단계를 수행한 후 실행:

```sql
-- 전체 사용자 및 프로필 확인
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.name,
  p.role,
  p.position,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL AND p.id IS NOT NULL THEN '✅ 완벽'
    WHEN u.email_confirmed_at IS NULL THEN '❌ 이메일 미확인'
    WHEN p.id IS NULL THEN '❌ 프로필 없음'
    ELSE '⚠️ 불완전'
  END AS status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email IN ('admin@amano.kr', 'designer@amano.kr')
ORDER BY u.email;
```

**예상 결과:**
```
id          | email            | name      | role  | status
------------|------------------|-----------|-------|--------
uuid-1      | admin@amano.kr   | 김팀장     | admin | ✅ 완벽
uuid-2      | designer@amano.kr| 박디자이너 | member| ✅ 완벽
```

---

## 🆘 **그래도 안 되면?**

위의 **모든 단계**를 수행했는데도 로그인이 안 되면:

1. **브라우저 콘솔 스크린샷** (F12 → Console 탭)
2. **Supabase Authentication → Users 스크린샷**
3. **9단계 최종 확인 쿼리 결과**

위 3가지를 공유해주시면 정확한 원인을 파악할 수 있습니다.

---

## 🎯 **빠른 해결 방법 (권장)**

**Supabase Dashboard에서 GUI로 사용자 생성 (8단계)**이 가장 확실합니다!

1. Dashboard → Authentication → Users
2. "Add user" 클릭
3. Email: `admin@amano.kr`, Password: `password123`
4. ✅ Auto Confirm User 체크
5. Create

그 다음 프로필만 SQL로 생성하면 끝!

---

**위의 단계들을 시도해보시고 결과를 알려주세요!** 🚀
