-- ============================================
-- 아마노코리아 기획홍보팀 팀원 데이터
-- ============================================

-- 1. 관리자 계정 (팀장)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  aud,
  role,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@amano.kr',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  ''
)
ON CONFLICT (id) DO UPDATE SET
  email = 'admin@amano.kr',
  encrypted_password = crypt('password123', gen_salt('bf')),
  email_confirmed_at = NOW();

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

-- 2. 디자이너 (팀원)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  aud,
  role,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'designer@amano.kr',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  ''
)
ON CONFLICT (id) DO UPDATE SET
  email = 'designer@amano.kr',
  encrypted_password = crypt('password123', gen_salt('bf')),
  email_confirmed_at = NOW();

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

-- 3. 영상 담당 (팀원)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  aud,
  role,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'video@amano.kr',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  ''
)
ON CONFLICT (id) DO UPDATE SET
  email = 'video@amano.kr',
  encrypted_password = crypt('password123', gen_salt('bf')),
  email_confirmed_at = NOW();

INSERT INTO public.profiles (id, name, role, position, email)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '이영상',
  'member',
  '영상',
  'video@amano.kr'
)
ON CONFLICT (id) DO UPDATE SET
  name = '이영상',
  role = 'member',
  position = '영상',
  email = 'video@amano.kr';

-- 4. 3D MAX 담당 (팀원)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  aud,
  role,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  '3d@amano.kr',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  ''
)
ON CONFLICT (id) DO UPDATE SET
  email = '3d@amano.kr',
  encrypted_password = crypt('password123', gen_salt('bf')),
  email_confirmed_at = NOW();

INSERT INTO public.profiles (id, name, role, position, email)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  '최3D',
  'member',
  '3D MAX',
  '3d@amano.kr'
)
ON CONFLICT (id) DO UPDATE SET
  name = '최3D',
  role = 'member',
  position = '3D MAX',
  email = '3d@amano.kr';

-- 5. 기획 담당 (팀원)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  aud,
  role,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000000',
  'plan@amano.kr',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  ''
)
ON CONFLICT (id) DO UPDATE SET
  email = 'plan@amano.kr',
  encrypted_password = crypt('password123', gen_salt('bf')),
  email_confirmed_at = NOW();

INSERT INTO public.profiles (id, name, role, position, email)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  '정기획',
  'member',
  '기획',
  'plan@amano.kr'
)
ON CONFLICT (id) DO UPDATE SET
  name = '정기획',
  role = 'member',
  position = '기획',
  email = 'plan@amano.kr';

-- ============================================
-- 샘플 업무 데이터
-- ============================================

-- 미배정 업무 1
INSERT INTO public.tasks (
  title,
  requester_dept,
  requester_name,
  description,
  category,
  status,
  due_date,
  created_at
)
VALUES (
  '신규 주차장 안내판 디자인',
  '영업팀',
  '홍길동',
  '서울 강남구 신규 주차장 안내판 디자인 요청합니다. A4 사이즈, 컬러 인쇄용입니다.',
  '디자인',
  'Unassigned',
  CURRENT_DATE + INTERVAL '7 days',
  NOW()
)
ON CONFLICT DO NOTHING;

-- 미배정 업무 2
INSERT INTO public.tasks (
  title,
  requester_dept,
  requester_name,
  description,
  category,
  status,
  due_date,
  created_at
)
VALUES (
  '제품 소개 영상 제작',
  '마케팅팀',
  '김철수',
  '신제품 주차관제시스템 소개 영상 제작 (30초, 1분 2종)',
  '영상',
  'Unassigned',
  CURRENT_DATE + INTERVAL '10 days',
  NOW()
)
ON CONFLICT DO NOTHING;

-- 미배정 업무 3
INSERT INTO public.tasks (
  title,
  requester_dept,
  requester_name,
  description,
  category,
  status,
  due_date,
  created_at
)
VALUES (
  '주차장 3D 조감도 제작',
  '기술팀',
  '박영희',
  '부산 해운대 지하주차장 3D 조감도 제작 (3면도)',
  '3D MAX',
  'Unassigned',
  CURRENT_DATE + INTERVAL '14 days',
  NOW()
)
ON CONFLICT DO NOTHING;

-- 미배정 업무 4
INSERT INTO public.tasks (
  title,
  requester_dept,
  requester_name,
  description,
  category,
  status,
  due_date,
  created_at
)
VALUES (
  '2026년 홍보 전략 기획안',
  '경영지원팀',
  '이사장',
  '2026년 1분기 홍보 전략 기획안 작성 및 발표 자료 준비',
  '기획',
  'Unassigned',
  CURRENT_DATE + INTERVAL '5 days',
  NOW()
)
ON CONFLICT DO NOTHING;

-- 미배정 업무 5
INSERT INTO public.tasks (
  title,
  requester_dept,
  requester_name,
  description,
  category,
  status,
  due_date,
  created_at
)
VALUES (
  '본사 주차장 맵작업',
  '총무팀',
  '최영수',
  '본사 주차장 구역 재배치에 따른 맵 업데이트',
  '맵작업',
  'Unassigned',
  CURRENT_DATE + INTERVAL '3 days',
  NOW()
)
ON CONFLICT DO NOTHING;

-- 확인 쿼리
SELECT 
  u.email,
  u.email_confirmed_at,
  p.name,
  p.role,
  p.position
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE '%@amano.kr'
ORDER BY p.role DESC, p.name;
