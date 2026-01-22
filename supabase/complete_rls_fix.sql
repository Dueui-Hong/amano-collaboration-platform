-- ============================================
-- 완전 수정: RLS 정책 전체 재설정
-- "Database error querying schema" 완전 해결
-- ============================================

-- ============================================
-- 1단계: 모든 기존 RLS 정책 삭제
-- ============================================

-- profiles 테이블 정책 삭제
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

-- tasks 테이블 정책 삭제
DROP POLICY IF EXISTS "Admin can view all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Members can view their assigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anyone can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admin can update all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Members can update their assigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admin can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anyone authenticated can view unassigned tasks" ON public.tasks;

-- ============================================
-- 2단계: profiles 테이블 - 새로운 정책
-- ============================================

-- 2-1. 모든 사용자가 자신의 프로필 조회
CREATE POLICY "profiles_select_own"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- 2-2. 관리자는 모든 프로필 조회 가능
CREATE POLICY "profiles_select_admin"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 2-3. 모든 사용자가 자신의 프로필 수정
CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- ============================================
-- 3단계: tasks 테이블 - 새로운 정책
-- ============================================

-- 3-1. 조회 정책
-- 관리자는 모든 업무 조회
CREATE POLICY "tasks_select_admin"
ON public.tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 팀원은 자신에게 배정된 업무만 조회
CREATE POLICY "tasks_select_member"
ON public.tasks FOR SELECT
USING (
  assignee_id = auth.uid()
);

-- 미배정 업무는 모든 인증 사용자가 조회 가능
CREATE POLICY "tasks_select_unassigned"
ON public.tasks FOR SELECT
USING (
  assignee_id IS NULL
);

-- 3-2. 삽입 정책 (공개 요청 폼 - 누구나 가능)
CREATE POLICY "tasks_insert_public"
ON public.tasks FOR INSERT
WITH CHECK (true);

-- 3-3. 업데이트 정책
-- 관리자는 모든 업무 수정
CREATE POLICY "tasks_update_admin"
ON public.tasks FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 팀원은 자신에게 배정된 업무만 수정
CREATE POLICY "tasks_update_member"
ON public.tasks FOR UPDATE
USING (
  assignee_id = auth.uid()
);

-- 3-4. 삭제 정책 (관리자만)
CREATE POLICY "tasks_delete_admin"
ON public.tasks FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- 4단계: 확인 쿼리
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN 'READ'
    WHEN cmd = 'INSERT' THEN 'CREATE'
    WHEN cmd = 'UPDATE' THEN 'UPDATE'
    WHEN cmd = 'DELETE' THEN 'DELETE'
  END as operation
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'tasks')
ORDER BY tablename, cmd, policyname;
