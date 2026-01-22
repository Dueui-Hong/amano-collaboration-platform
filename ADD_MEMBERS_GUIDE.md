# 🔧 팀원 3명 추가하기

**현재 상황**: 김민석 팀장만 생성됨 ✅  
**필요한 작업**: 팀원 3명 추가 (홍세영, 최예지, 홍두의)

---

## ⚡ **팀원 3명 추가 (2분)**

### **1단계: Supabase SQL Editor 접속**
👉 **https://supabase.com/dashboard/project/wsredeftfoelzgkdalhx/sql/new**

### **2단계: 아래 전체 SQL 복사 & 실행**

```sql
-- 팀원 1: 홍세영 (계장)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_sent_at, confirmation_token,
  recovery_token, email_change_token_new, email_change,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  created_at, updated_at, last_sign_in_at
) VALUES (
  '10000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated', 'authenticated', 'seyoung_hong@amano.co.kr',
  crypt('1111', gen_salt('bf')),
  NOW(), NOW(), '', '', '', '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb, false, NOW(), NOW(), NOW()
);

INSERT INTO public.profiles (id, name, role, position, email, created_at, updated_at)
VALUES (
  '10000000-0000-0000-0000-000000000002'::uuid,
  '홍세영', 'member', '계장', 'seyoung_hong@amano.co.kr', NOW(), NOW()
);

-- 팀원 2: 최예지 (사원)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_sent_at, confirmation_token,
  recovery_token, email_change_token_new, email_change,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  created_at, updated_at, last_sign_in_at
) VALUES (
  '10000000-0000-0000-0000-000000000003'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated', 'authenticated', 'yeji_choi@amano.co.kr',
  crypt('1111', gen_salt('bf')),
  NOW(), NOW(), '', '', '', '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb, false, NOW(), NOW(), NOW()
);

INSERT INTO public.profiles (id, name, role, position, email, created_at, updated_at)
VALUES (
  '10000000-0000-0000-0000-000000000003'::uuid,
  '최예지', 'member', '사원', 'yeji_choi@amano.co.kr', NOW(), NOW()
);

-- 팀원 3: 홍두의 (사원)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_sent_at, confirmation_token,
  recovery_token, email_change_token_new, email_change,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  created_at, updated_at, last_sign_in_at
) VALUES (
  '10000000-0000-0000-0000-000000000004'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated', 'authenticated', 'dueui_hong@amano.co.kr',
  crypt('1111', gen_salt('bf')),
  NOW(), NOW(), '', '', '', '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb, false, NOW(), NOW(), NOW()
);

INSERT INTO public.profiles (id, name, role, position, email, created_at, updated_at)
VALUES (
  '10000000-0000-0000-0000-000000000004'::uuid,
  '홍두의', 'member', '사원', 'dueui_hong@amano.co.kr', NOW(), NOW()
);

-- 확인 쿼리
SELECT 
  u.email,
  u.email_confirmed_at IS NOT NULL as confirmed,
  p.name,
  p.role,
  p.position
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE '%@amano.co.kr'
ORDER BY 
  CASE WHEN p.role = 'admin' THEN 1 ELSE 2 END,
  u.email;
```

### **3단계: 결과 확인**

```
email                       | confirmed | name   | role   | position
----------------------------+-----------+--------+--------+------------------
minseok_kim1@amano.co.kr   | t         | 김민석  | admin  | 기획홍보팀 팀장
dueui_hong@amano.co.kr     | t         | 홍두의  | member | 사원
seyoung_hong@amano.co.kr   | t         | 홍세영  | member | 계장
yeji_choi@amano.co.kr      | t         | 최예지  | member | 사원
```

**✅ 총 4명!**

---

## 🧪 **테스트**

### **관리자 대시보드**
👉 https://3000-isotlhp28qrkawj35ieh7-cc2fbc16.sandbox.novita.ai/admin/dashboard

**예상 화면**:
```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  미배정 업무    │  홍세영 (계장)  │  최예지 (사원)  │  홍두의 (사원)  │
│  (5건)          │  (0건)          │  (0건)          │  (0건)          │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

---

## ❓ **에러가 발생한다면?**

### **에러 1: "duplicate key value violates unique constraint"**

**원인**: 이미 사용자가 있음

**해결**:
```sql
-- 기존 사용자 삭제 후 재실행
DELETE FROM public.profiles WHERE email IN ('seyoung_hong@amano.co.kr', 'yeji_choi@amano.co.kr', 'dueui_hong@amano.co.kr');
DELETE FROM auth.users WHERE email IN ('seyoung_hong@amano.co.kr', 'yeji_choi@amano.co.kr', 'dueui_hong@amano.co.kr');
```

### **에러 2: "permission denied for table auth.users"**

**원인**: 권한 부족

**해결**: Supabase Dashboard에서 직접 추가
1. **Authentication → Users → Add User** 클릭
2. 각 팀원 정보 입력:
   - Email: seyoung_hong@amano.co.kr
   - Password: 1111
   - Auto Confirm User: ✅ 체크
3. 생성 후 UUID 복사
4. SQL Editor에서 프로필 생성:
```sql
INSERT INTO public.profiles (id, name, role, position, email)
VALUES ('복사한-UUID', '홍세영', 'member', '계장', 'seyoung_hong@amano.co.kr');
```

---

## 🎯 **빠른 확인**

SQL 실행 후 즉시:

```sql
SELECT COUNT(*) as total FROM auth.users WHERE email LIKE '%@amano.co.kr';
```

**결과**: `total = 4` 이면 성공! ✅

---

## ✅ **완료 후**

1. 로그인 페이지 접속
2. 팀장으로 로그인
3. 관리자 대시보드에서 **팀원 3명** 확인
4. Drag & Drop 테스트

---

**SQL 실행하고 결과를 알려주세요!** 🚀

에러가 발생하면 정확한 에러 메시지를 복사해서 알려주세요!
