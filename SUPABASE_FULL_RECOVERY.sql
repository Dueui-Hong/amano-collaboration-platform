-- ============================================
-- 아마노코리아 PPT 자동화 시스템 - 전체 데이터베이스 복구 스크립트
-- Supabase SQL Editor에서 한 번에 실행하세요!
-- ============================================

-- ============================================
-- PART 1: 기본 스키마 (profiles, tasks, storage)
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

-- 6. RLS 정책: 프로필
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- 7. RLS 정책: 업무
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

CREATE POLICY "Anyone can create tasks"
ON public.tasks FOR INSERT
WITH CHECK (true);

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
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON public.tasks(completed_at);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON public.tasks(category);

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

-- ============================================
-- PART 2: 자료 게시판 (board_posts)
-- ============================================

-- 1. 게시판 테이블 생성
CREATE TABLE IF NOT EXISTS board_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  author_name TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_board_posts_author ON board_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_board_posts_created ON board_posts(created_at DESC);

-- 3. RLS 활성화
ALTER TABLE board_posts ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책
CREATE POLICY "Anyone can view posts"
  ON board_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON board_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
  ON board_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts or admin can delete"
  ON board_posts FOR DELETE
  TO authenticated
  USING (
    auth.uid() = author_id 
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 5. 자동 updated_at 트리거
CREATE OR REPLACE FUNCTION update_board_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER board_posts_updated_at
  BEFORE UPDATE ON board_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_board_posts_updated_at();

-- ============================================
-- 완료! 이제 Authentication 탭에서 사용자를 생성하세요.
-- ============================================
