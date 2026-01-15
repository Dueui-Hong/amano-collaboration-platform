-- 아마노코리아 테스트 사용자 생성 스크립트
-- Supabase SQL Editor에서 실행하세요

-- 1. 관리자 계정 생성 (admin@amano.kr)
-- Supabase Auth에 사용자 생성
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

-- 샘플 업무 데이터
INSERT INTO public.tasks (title, requester_dept, requester_name, description, category, due_date, status)
VALUES 
  ('주차장 안내판 디자인', '시설관리팀', '이과장', '신규 주차장 안내판 디자인 요청', '디자인', CURRENT_DATE + INTERVAL '7 days', 'Unassigned'),
  ('홍보 영상 제작', '마케팅팀', '최부장', '회사 소개 영상 제작', '영상', CURRENT_DATE + INTERVAL '14 days', 'Todo')
ON CONFLICT DO NOTHING;

-- 두 번째 업무를 팀원에게 배정
UPDATE public.tasks 
SET assignee_id = '00000000-0000-0000-0000-000000000002',
    status = 'Doing'
WHERE title = '홍보 영상 제작' AND assignee_id IS NULL;

-- 완료: 사용자 확인
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
