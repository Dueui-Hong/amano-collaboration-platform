-- ============================================
-- RLS 정책 수정: 미배정 업무 조회 허용
-- ============================================
-- 이 SQL은 "Database error querying schema" 에러를 수정합니다.
-- 문제: 미배정 업무(assignee_id = NULL)를 관리자가 조회할 수 없음
-- 해결: 관리자가 미배정 업무도 볼 수 있도록 정책 추가

-- 1. 기존 tasks 조회 정책 삭제
DROP POLICY IF EXISTS "Admin can view all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Members can view their assigned tasks" ON public.tasks;

-- 2. 새로운 조회 정책 생성
-- 2-1. 관리자는 모든 업무 조회 가능 (미배정 포함)
CREATE POLICY "Admin can view all tasks"
ON public.tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 2-2. 팀원은 자신에게 배정된 업무만 조회 가능
CREATE POLICY "Members can view their assigned tasks"
ON public.tasks FOR SELECT
USING (
  assignee_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'member'
  )
);

-- 2-3. 미배정 업무는 모든 인증된 사용자가 볼 수 있음 (선택적)
-- 이 정책은 팀원도 미배정 업무를 볼 수 있게 하려면 추가
CREATE POLICY "Anyone authenticated can view unassigned tasks"
ON public.tasks FOR SELECT
USING (
  assignee_id IS NULL
  AND auth.uid() IS NOT NULL
);

-- 3. 프로필 조회 정책 수정 (관리자는 모든 프로필 조회 가능)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  )
);

-- 4. 확인 쿼리 (정책이 제대로 생성되었는지 확인)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'tasks')
ORDER BY tablename, policyname;
