-- ============================================
-- 최종 해결: 사용자 확인 및 재생성
-- ============================================
-- "Database error querying schema" 완전 해결

-- 1단계: 기존 데이터 확인
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.encrypted_password IS NOT NULL as has_password,
  p.name,
  p.role,
  p.position
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE '%@amano.co.kr'
ORDER BY u.email;

-- 결과가 비어있거나 email_confirmed_at이 NULL이면 문제!

-- 2단계: 기존 데이터 완전 삭제
DELETE FROM public.tasks;
DELETE FROM public.profiles WHERE email LIKE '%@amano.co.kr';
DELETE FROM auth.users WHERE email LIKE '%@amano.co.kr';

-- 3단계: RLS 비활성화 (필수!)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;

-- 4단계: 사용자 재생성
-- 팀장: 김민석
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  last_sign_in_at
) VALUES (
  '10000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated',
  'authenticated',
  'minseok_kim1@amano.co.kr',
  crypt('1111', gen_salt('bf')),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  false,
  NOW(),
  NOW(),
  NOW()
);

INSERT INTO public.profiles (id, name, role, position, email, created_at, updated_at)
VALUES (
  '10000000-0000-0000-0000-000000000001'::uuid,
  '김민석',
  'admin',
  '기획홍보팀 팀장',
  'minseok_kim1@amano.co.kr',
  NOW(),
  NOW()
);

-- 팀원 1: 홍세영
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  last_sign_in_at
) VALUES (
  '10000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated',
  'authenticated',
  'seyoung_hong@amano.co.kr',
  crypt('1111', gen_salt('bf')),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  false,
  NOW(),
  NOW(),
  NOW()
);

INSERT INTO public.profiles (id, name, role, position, email, created_at, updated_at)
VALUES (
  '10000000-0000-0000-0000-000000000002'::uuid,
  '홍세영',
  'member',
  '계장',
  'seyoung_hong@amano.co.kr',
  NOW(),
  NOW()
);

-- 팀원 2: 최예지
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  last_sign_in_at
) VALUES (
  '10000000-0000-0000-0000-000000000003'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated',
  'authenticated',
  'yeji_choi@amano.co.kr',
  crypt('1111', gen_salt('bf')),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  false,
  NOW(),
  NOW(),
  NOW()
);

INSERT INTO public.profiles (id, name, role, position, email, created_at, updated_at)
VALUES (
  '10000000-0000-0000-0000-000000000003'::uuid,
  '최예지',
  'member',
  '사원',
  'yeji_choi@amano.co.kr',
  NOW(),
  NOW()
);

-- 팀원 3: 홍두의
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  last_sign_in_at
) VALUES (
  '10000000-0000-0000-0000-000000000004'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated',
  'authenticated',
  'dueui_hong@amano.co.kr',
  crypt('1111', gen_salt('bf')),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  false,
  NOW(),
  NOW(),
  NOW()
);

INSERT INTO public.profiles (id, name, role, position, email, created_at, updated_at)
VALUES (
  '10000000-0000-0000-0000-000000000004'::uuid,
  '홍두의',
  'member',
  '사원',
  'dueui_hong@amano.co.kr',
  NOW(),
  NOW()
);

-- 5단계: 샘플 업무 데이터
INSERT INTO public.tasks (title, requester_dept, requester_name, description, category, status, due_date, created_at)
VALUES 
  ('신규 주차장 안내판 디자인', '영업팀', '홍길동', '서울 강남구 신규 주차장 안내판 디자인 요청', '디자인', 'Unassigned', CURRENT_DATE + 7, NOW()),
  ('제품 소개 영상 제작', '마케팅팀', '김철수', '신제품 주차관제시스템 소개 영상 제작', '영상', 'Unassigned', CURRENT_DATE + 10, NOW()),
  ('주차장 3D 조감도 제작', '기술팀', '박영희', '부산 해운대 지하주차장 3D 조감도 제작', '3D MAX', 'Unassigned', CURRENT_DATE + 14, NOW()),
  ('2026년 홍보 전략 기획안', '경영지원팀', '이사장', '2026년 1분기 홍보 전략 기획안 작성', '기획', 'Unassigned', CURRENT_DATE + 5, NOW()),
  ('본사 주차장 맵작업', '총무팀', '최영수', '본사 주차장 구역 재배치에 따른 맵 업데이트', '맵작업', 'Unassigned', CURRENT_DATE + 3, NOW());

-- 6단계: 최종 확인
SELECT 
  u.email,
  u.email_confirmed_at IS NOT NULL as email_confirmed,
  u.encrypted_password IS NOT NULL as has_password,
  p.name,
  p.role,
  p.position
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE '%@amano.co.kr'
ORDER BY 
  CASE WHEN p.role = 'admin' THEN 1 ELSE 2 END,
  u.email;

-- 모든 사용자의 email_confirmed가 true여야 함!
