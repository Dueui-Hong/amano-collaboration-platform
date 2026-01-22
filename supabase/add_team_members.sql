-- ============================================
-- 팀원 3명 추가 (김민석 팀장은 이미 있음)
-- ============================================

-- 팀원 1: 홍세영 (계장)
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

-- 팀원 2: 최예지 (사원)
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

-- 팀원 3: 홍두의 (사원)
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
