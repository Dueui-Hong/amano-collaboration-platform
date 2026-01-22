-- ============================================
-- 긴급 해결: RLS 완전 비활성화 (임시 테스트용)
-- ============================================
-- 주의: 이 방법은 보안을 완전히 해제합니다.
-- 개발/테스트 환경에서만 사용하세요!
-- 프로덕션에서는 complete_rls_fix.sql을 사용하세요.

-- RLS 비활성화
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;

-- 확인
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'tasks');

-- 결과: rowsecurity = false 이면 성공
