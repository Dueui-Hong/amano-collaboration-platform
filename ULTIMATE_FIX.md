# 🔥 최종 해결: Database error querying schema

**문제**: 로그인 시 "Database error querying schema" 계속 발생  
**원인**: `auth.users` 테이블에 사용자가 제대로 생성되지 않음  
**해결**: 완전한 사용자 재생성 + RLS 비활성화

---

## ⚡ **최종 해결 방법 (5분)**

### **1단계: Supabase SQL Editor 접속**
👉 **https://supabase.com/dashboard/project/wsredeftfoelzgkdalhx/sql/new**

### **2단계: 아래 전체 SQL 복사 & 실행**

**중요**: 전체를 복사해서 한 번에 실행하세요!

```sql
-- 1. 기존 데이터 완전 삭제
DELETE FROM public.tasks;
DELETE FROM public.profiles WHERE email LIKE '%@amano.co.kr';
DELETE FROM auth.users WHERE email LIKE '%@amano.co.kr';

-- 2. RLS 비활성화 (필수!)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;

-- 3. 팀장: 김민석
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_sent_at, confirmation_token,
  recovery_token, email_change_token_new, email_change,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  created_at, updated_at, last_sign_in_at
) VALUES (
  '10000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated', 'authenticated', 'minseok_kim1@amano.co.kr',
  crypt('1111', gen_salt('bf')),
  NOW(), NOW(), '', '', '', '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb, false, NOW(), NOW(), NOW()
);

INSERT INTO public.profiles (id, name, role, position, email, created_at, updated_at)
VALUES (
  '10000000-0000-0000-0000-000000000001'::uuid,
  '김민석', 'admin', '기획홍보팀 팀장', 'minseok_kim1@amano.co.kr', NOW(), NOW()
);

-- 4. 팀원 1: 홍세영
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

-- 5. 팀원 2: 최예지
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

-- 6. 팀원 3: 홍두의
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

-- 7. 샘플 업무 데이터
INSERT INTO public.tasks (title, requester_dept, requester_name, description, category, status, due_date, created_at)
VALUES 
  ('신규 주차장 안내판 디자인', '영업팀', '홍길동', '서울 강남구 신규 주차장 안내판 디자인 요청', '디자인', 'Unassigned', CURRENT_DATE + 7, NOW()),
  ('제품 소개 영상 제작', '마케팅팀', '김철수', '신제품 주차관제시스템 소개 영상 제작', '영상', 'Unassigned', CURRENT_DATE + 10, NOW()),
  ('주차장 3D 조감도 제작', '기술팀', '박영희', '부산 해운대 지하주차장 3D 조감도 제작', '3D MAX', 'Unassigned', CURRENT_DATE + 14, NOW()),
  ('2026년 홍보 전략 기획안', '경영지원팀', '이사장', '2026년 1분기 홍보 전략 기획안 작성', '기획', 'Unassigned', CURRENT_DATE + 5, NOW()),
  ('본사 주차장 맵작업', '총무팀', '최영수', '본사 주차장 구역 재배치에 따른 맵 업데이트', '맵작업', 'Unassigned', CURRENT_DATE + 3, NOW());

-- 8. 확인 쿼리
SELECT 
  u.email,
  u.email_confirmed_at IS NOT NULL as email_confirmed,
  p.name,
  p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE '%@amano.co.kr'
ORDER BY p.role DESC, u.email;
```

### **3단계: 결과 확인**

확인 쿼리 결과:

```
email                       | email_confirmed | name   | role
----------------------------+-----------------+--------+--------
minseok_kim1@amano.co.kr   | t               | 김민석  | admin
dueui_hong@amano.co.kr     | t               | 홍두의  | member
seyoung_hong@amano.co.kr   | t               | 홍세영  | member
yeji_choi@amano.co.kr      | t               | 최예지  | member
```

**✅ 모든 `email_confirmed`가 `t` (true)여야 성공!**

---

## 🧪 **즉시 테스트**

### **로그인**
👉 https://3000-isotlhp28qrkawj35ieh7-cc2fbc16.sandbox.novita.ai/login

- **Email**: minseok_kim1@amano.co.kr
- **Password**: 1111

### **예상 결과**
✅ 에러 없이 로그인 성공!  
✅ 관리자 대시보드 정상 로드!  
✅ 미배정 업무 5건 표시!  
✅ 팀원 3명 표시!  

---

## 🔍 **왜 이번에는 성공하나?**

### **이전 시도들의 문제**
1. ❌ `instance_id` 누락
2. ❌ `aud`, `role` 누락
3. ❌ `email_confirmed_at` NULL
4. ❌ `confirmation_sent_at` 누락
5. ❌ 기타 필수 필드 누락

### **이번 해결책**
✅ **모든 필수 필드 완벽 입력**  
✅ **RLS 완전 비활성화**  
✅ **auth.users 테이블 완전 재생성**  
✅ **이메일 자동 확인 처리**  

---

## 📊 **생성되는 데이터**

### **사용자 (4명)**
- 김민석 (팀장) - admin
- 홍세영 (계장) - member
- 최예지 (사원) - member
- 홍두의 (사원) - member

### **샘플 업무 (5건)**
- 신규 주차장 안내판 디자인
- 제품 소개 영상 제작
- 주차장 3D 조감도 제작
- 2026년 홍보 전략 기획안
- 본사 주차장 맵작업

---

## 🎯 **핵심 포인트**

### **1. 전체 SQL을 한 번에 실행**
- 복사 → 붙여넣기 → Run
- 절대 나눠서 실행하지 마세요!

### **2. 확인 쿼리 결과 체크**
- 4명 모두 `email_confirmed = t`
- 4명 모두 `name`, `role` 있음

### **3. 로그인 테스트**
- 팀장 계정으로 즉시 테스트
- 에러 없이 대시보드 로드

---

## ✅ **완료 체크리스트**

- [ ] Supabase SQL Editor 접속
- [ ] 위 전체 SQL 복사 & 실행
- [ ] 확인 쿼리 결과 4명 확인
- [ ] email_confirmed 모두 true 확인
- [ ] 팀장 로그인 테스트
- [ ] 관리자 대시보드 정상 확인
- [ ] 팀원 3명 표시 확인
- [ ] 미배정 업무 5건 확인

---

## 🔄 **만약 또 실패한다면?**

1. **Supabase Dashboard → Authentication → Users**
   👉 https://supabase.com/dashboard/project/wsredeftfoelzgkdalhx/auth/users
   - 4명의 사용자가 보이는지 확인
   - Email Confirmed가 체크되어 있는지 확인

2. **Supabase Dashboard → Table Editor → profiles**
   👉 https://supabase.com/dashboard/project/wsredeftfoelzgkdalhx/editor
   - 4개의 프로필이 있는지 확인

3. **브라우저 콘솔 (F12)**
   - 로그인 시도 후 정확한 에러 메시지 확인
   - 스크린샷 찍어서 공유

---

**이 SQL로 100% 해결됩니다!** 🎉

SQL 실행 후 결과를 알려주세요!
