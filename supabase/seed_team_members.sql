-- ============================================
-- 아마노코리아 기획홍보팀 실제 팀원 데이터
-- ============================================

-- 기존 테스트 데이터 완전 삭제
DELETE FROM public.tasks;
DELETE FROM public.profiles;
DELETE FROM auth.users WHERE email LIKE '%@amano.kr' OR email LIKE '%@amano.co.kr';

-- ============================================
-- 1. 팀장: 김민석
-- ============================================
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
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'minseok_kim1@amano.co.kr',
  crypt('1111', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  ''
);

INSERT INTO public.profiles (id, name, role, position, email)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  '김민석',
  'admin',
  '기획홍보팀 팀장',
  'minseok_kim1@amano.co.kr'
);

-- ============================================
-- 2. 팀원: 홍세영 (계장)
-- ============================================
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
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'seyoung_hong@amano.co.kr',
  crypt('1111', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  ''
);

INSERT INTO public.profiles (id, name, role, position, email)
VALUES (
  '10000000-0000-0000-0000-000000000002',
  '홍세영',
  'member',
  '계장',
  'seyoung_hong@amano.co.kr'
);

-- ============================================
-- 3. 팀원: 최예지 (사원)
-- ============================================
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
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'yeji_choi@amano.co.kr',
  crypt('1111', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  ''
);

INSERT INTO public.profiles (id, name, role, position, email)
VALUES (
  '10000000-0000-0000-0000-000000000003',
  '최예지',
  'member',
  '사원',
  'yeji_choi@amano.co.kr'
);

-- ============================================
-- 4. 팀원: 홍두의 (사원)
-- ============================================
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
  '10000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'dueui_hong@amano.co.kr',
  crypt('1111', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  ''
);

INSERT INTO public.profiles (id, name, role, position, email)
VALUES (
  '10000000-0000-0000-0000-000000000004',
  '홍두의',
  'member',
  '사원',
  'dueui_hong@amano.co.kr'
);

-- ============================================
-- 샘플 업무 데이터 (테스트용)
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
);

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
);

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
);

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
);

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
);

-- ============================================
-- 확인 쿼리
-- ============================================
SELECT 
  u.email,
  u.email_confirmed_at,
  p.name,
  p.role,
  p.position
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE '%@amano.co.kr'
ORDER BY 
  CASE p.role 
    WHEN 'admin' THEN 1 
    WHEN 'member' THEN 2 
    ELSE 3 
  END,
  p.name;
