-- ========================================
-- profiles 테이블의 role 제약 조건 확인
-- ========================================

-- 1. 제약 조건 확인
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'profiles' AND con.contype = 'c';

-- 2. 현재 데이터의 role 값 확인
SELECT DISTINCT role 
FROM profiles;

-- 3. 현재 모든 프로필 확인
SELECT id, email, name, role, position, created_at 
FROM profiles 
ORDER BY created_at;
