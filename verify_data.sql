-- ========================================
-- 데이터 완전 검증
-- ========================================

-- 1. profiles 테이블 전체 데이터
SELECT 
  id,
  email,
  name,
  role,
  position,
  created_at,
  updated_at
FROM profiles 
ORDER BY created_at;

-- 2. role별 카운트
SELECT 
  role,
  COUNT(*) as count
FROM profiles
GROUP BY role;

-- 3. 특정 이메일 검색
SELECT * FROM profiles WHERE email LIKE '%amano%';

-- 4. admin 조회
SELECT * FROM profiles WHERE role = 'admin';

-- 5. member 조회  
SELECT * FROM profiles WHERE role = 'member';

-- 6. 테이블 스키마 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
