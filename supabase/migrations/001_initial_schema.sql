-- ============================================
-- 아마노코리아 PPT 자동화 시스템 데이터베이스 스키마
-- ============================================

-- 1. 프로필 테이블 (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  position TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 업무 테이블 (tasks)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  requester_dept TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Unassigned' CHECK (status IN ('Unassigned', 'Todo', 'Doing', 'Done')),
  category TEXT NOT NULL CHECK (category IN ('기획', '디자인', '영상', '3D MAX', '맵작업', '시설점검')),
  due_date DATE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  image_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Storage 버킷 생성 (이미지 첨부 파일용)
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-images', 'task-images', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage 정책 (누구나 업로드 가능, 읽기 가능)
CREATE POLICY "Public Access for Task Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'task-images');

CREATE POLICY "Authenticated Upload for Task Images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'task-images');

-- 5. RLS (Row Level Security) 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 6. RLS 정책: 프로필 (모든 사용자가 자신의 프로필 조회 가능)
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- 7. RLS 정책: 업무 (관리자는 모든 업무, 팀원은 자신의 업무만)
-- 7-1. 조회 정책
CREATE POLICY "Admin can view all tasks"
ON public.tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Members can view their assigned tasks"
ON public.tasks FOR SELECT
USING (assignee_id = auth.uid());

-- 7-2. 삽입 정책 (누구나 요청 가능 - 공개 요청 폼)
CREATE POLICY "Anyone can create tasks"
ON public.tasks FOR INSERT
WITH CHECK (true);

-- 7-3. 업데이트 정책 (관리자는 모든 업무, 팀원은 자신의 업무만)
CREATE POLICY "Admin can update all tasks"
ON public.tasks FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Members can update their assigned tasks"
ON public.tasks FOR UPDATE
USING (assignee_id = auth.uid());

-- 7-4. 삭제 정책 (관리자만)
CREATE POLICY "Admin can delete tasks"
ON public.tasks FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 8. 인덱스 생성 (성능 최적화)
CREATE INDEX idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_completed_at ON public.tasks(completed_at);
CREATE INDEX idx_tasks_category ON public.tasks(category);

-- 9. 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. 트리거 연결
CREATE TRIGGER set_updated_at_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_tasks
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 11. 샘플 데이터 (테스트용 - 실제 배포 시 제거 가능)
-- 관리자 계정 (팀장)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@amano.kr',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, name, role, position, email)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '김팀장',
  'admin',
  '팀장',
  'admin@amano.kr'
) ON CONFLICT (id) DO NOTHING;

-- 팀원 계정 (디자이너)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'designer@amano.kr',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, name, role, position, email)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '박디자이너',
  'member',
  '디자이너',
  'designer@amano.kr'
) ON CONFLICT (id) DO NOTHING;

-- 샘플 업무 1 (미배정)
INSERT INTO public.tasks (title, requester_dept, requester_name, description, category, due_date)
VALUES (
  '주차장 안내판 디자인',
  '시설관리팀',
  '이과장',
  '신규 주차장 안내판 디자인 요청',
  '디자인',
  CURRENT_DATE + INTERVAL '7 days'
) ON CONFLICT DO NOTHING;

-- 샘플 업무 2 (배정됨)
INSERT INTO public.tasks (title, requester_dept, requester_name, description, category, due_date, assignee_id, status)
VALUES (
  '홍보 영상 제작',
  '마케팅팀',
  '최부장',
  '회사 소개 영상 제작',
  '영상',
  CURRENT_DATE + INTERVAL '14 days',
  '00000000-0000-0000-0000-000000000002',
  'Doing'
) ON CONFLICT DO NOTHING;
