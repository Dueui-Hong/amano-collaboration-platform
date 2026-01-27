-- 자료 게시판 테이블 생성
-- Supabase SQL Editor에서 실행하세요

-- 1. 게시판 테이블 생성
CREATE TABLE IF NOT EXISTS board_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  author_name TEXT,
  attachments JSONB DEFAULT '[]'::jsonb, -- 첨부파일 URL 배열
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_board_posts_author ON board_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_board_posts_created ON board_posts(created_at DESC);

-- 3. RLS (Row Level Security) 활성화
ALTER TABLE board_posts ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 생성
-- 모든 인증된 사용자가 게시글 조회 가능
CREATE POLICY "Anyone can view posts"
  ON board_posts FOR SELECT
  TO authenticated
  USING (true);

-- 인증된 사용자만 게시글 작성 가능
CREATE POLICY "Authenticated users can create posts"
  ON board_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- 작성자만 자신의 게시글 수정 가능
CREATE POLICY "Users can update own posts"
  ON board_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- 작성자 또는 관리자만 게시글 삭제 가능
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

-- 5. 자동으로 updated_at 업데이트하는 트리거
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
