-- ============================================
-- 아마노코리아 영업기획 및 관리본부 통합 협업 플랫폼
-- Database Schema Migration
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE (사용자 관리)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id VARCHAR(20) UNIQUE NOT NULL, -- 사원번호 (로그인 ID)
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash TEXT NOT NULL, -- bcrypt 해시
  role VARCHAR(20) NOT NULL CHECK (role IN ('DEPARTMENT_HEAD', 'TEAM_LEADER', 'TEAM_MEMBER')),
  team VARCHAR(50) NOT NULL CHECK (team IN ('기획홍보팀', '통합수주관리팀', '부서장')),
  position VARCHAR(50), -- 직급 (부장, 과장, 대리, 사원 등)
  profile_image_url TEXT,
  is_first_login BOOLEAN DEFAULT TRUE, -- 최초 로그인 여부
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users 인덱스
CREATE INDEX idx_users_employee_id ON public.users(employee_id);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_team ON public.users(team);

-- ============================================
-- 2. SCHEDULES TABLE (일정 관리)
-- ============================================
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('PUBLIC', 'PRIVATE')), -- 부서 일정 vs 개인 일정
  color VARCHAR(7) DEFAULT '#3b82f6', -- HEX color code
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedules 인덱스
CREATE INDEX idx_schedules_created_by ON public.schedules(created_by);
CREATE INDEX idx_schedules_type ON public.schedules(type);
CREATE INDEX idx_schedules_date_range ON public.schedules(start_date, end_date);

-- ============================================
-- 3. WEEKLY_REPORTS TABLE (주간 보고서)
-- ============================================
CREATE TABLE IF NOT EXISTS public.weekly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL, -- 해당 주의 시작일 (월요일)
  week_end_date DATE NOT NULL, -- 해당 주의 종료일 (일요일)
  
  -- 보고 내용
  this_week_work TEXT NOT NULL, -- 이번 주 업무
  next_week_plan TEXT NOT NULL, -- 다음 주 계획
  issues TEXT, -- 이슈 사항
  
  -- 워크플로우 상태
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')),
  
  -- 검토 정보
  reviewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- 검토자 (팀장)
  reviewer_comment TEXT, -- 팀장 코멘트
  reviewed_at TIMESTAMPTZ,
  
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 유니크 제약: 한 사용자는 특정 주에 하나의 보고서만 작성
  UNIQUE(author_id, week_start_date)
);

-- Weekly Reports 인덱스
CREATE INDEX idx_weekly_reports_author ON public.weekly_reports(author_id);
CREATE INDEX idx_weekly_reports_status ON public.weekly_reports(status);
CREATE INDEX idx_weekly_reports_week ON public.weekly_reports(week_start_date, week_end_date);
CREATE INDEX idx_weekly_reports_reviewer ON public.weekly_reports(reviewer_id);

-- ============================================
-- 4. POSTS TABLE (게시물 관리)
-- ============================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(300) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50), -- 카테고리 (공지사항, 업무자료, 회의록 등)
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT FALSE, -- 전체 공개 여부
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts 인덱스
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_category ON public.posts(category);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);

-- ============================================
-- 5. POST_PERMISSIONS TABLE (게시물 권한 관리)
-- ============================================
-- 팀장이 특정 팀원에게 특정 게시물의 읽기 권한을 부여
CREATE TABLE IF NOT EXISTS public.post_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  granted_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- 권한 부여자
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 중복 방지: 같은 게시물에 같은 사용자에게 중복 권한 부여 방지
  UNIQUE(post_id, user_id)
);

-- Post Permissions 인덱스
CREATE INDEX idx_post_permissions_post ON public.post_permissions(post_id);
CREATE INDEX idx_post_permissions_user ON public.post_permissions(user_id);
CREATE INDEX idx_post_permissions_granted_by ON public.post_permissions(granted_by);

-- ============================================
-- 6. SYSTEM_CONFIG TABLE (시스템 설정 - CMS)
-- ============================================
CREATE TABLE IF NOT EXISTS public.system_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_key VARCHAR(100) UNIQUE NOT NULL, -- 'main_logo', 'login_bg_image', 'banner_image' 등
  config_value TEXT NOT NULL, -- 이미지 URL 또는 설정 값
  description TEXT,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Config 인덱스
CREATE INDEX idx_system_config_key ON public.system_config(config_key);

-- ============================================
-- 7. AUDIT_LOGS TABLE (감사 로그)
-- ============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- 'LOGIN', 'CREATE_POST', 'UPDATE_REPORT', 'GRANT_PERMISSION' 등
  target_type VARCHAR(50), -- 'POST', 'REPORT', 'SCHEDULE' 등
  target_id UUID,
  details JSONB, -- 상세 정보 (JSON 형태)
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs 인덱스
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) 설정
-- ============================================

-- Users RLS: 본인 정보만 조회 가능 (관리자는 모든 정보 조회 가능)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'DEPARTMENT_HEAD'
    )
  );

-- Schedules RLS: PRIVATE 일정은 본인만, PUBLIC 일정은 모두 조회 가능
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public schedules"
  ON public.schedules FOR SELECT
  USING (type = 'PUBLIC');

CREATE POLICY "Users can view their own private schedules"
  ON public.schedules FOR SELECT
  USING (type = 'PRIVATE' AND created_by = auth.uid());

CREATE POLICY "Users can create schedules"
  ON public.schedules FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own schedules"
  ON public.schedules FOR UPDATE
  USING (created_by = auth.uid());

-- Weekly Reports RLS: 본인 보고서, 팀장은 팀원 보고서, 부서장은 모든 보고서 조회
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports"
  ON public.weekly_reports FOR SELECT
  USING (author_id = auth.uid());

CREATE POLICY "Team leaders can view team members' reports"
  ON public.weekly_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u1
      JOIN public.users u2 ON u1.team = u2.team
      WHERE u1.id = auth.uid() 
        AND u1.role = 'TEAM_LEADER'
        AND u2.id = weekly_reports.author_id
    )
  );

CREATE POLICY "Department head can view all reports"
  ON public.weekly_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'DEPARTMENT_HEAD'
    )
  );

-- Posts RLS: 작성자, 권한 부여받은 사용자, 공개 게시물은 모두 조회 가능
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors can view their own posts"
  ON public.posts FOR SELECT
  USING (author_id = auth.uid());

CREATE POLICY "Users can view posts with granted permissions"
  ON public.posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.post_permissions
      WHERE post_id = posts.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view public posts"
  ON public.posts FOR SELECT
  USING (is_public = TRUE);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 updated_at 트리거 적용
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_reports_updated_at
  BEFORE UPDATE ON public.weekly_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at
  BEFORE UPDATE ON public.system_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA SEEDING
-- ============================================
-- 이 섹션은 별도의 seed.sql 파일로 분리 권장
-- 여기서는 시스템 설정 기본값만 삽입

INSERT INTO public.system_config (config_key, config_value, description) VALUES
  ('main_logo', '/images/logo-default.png', '메인 로고 이미지'),
  ('login_bg_image', '/images/login-bg-default.jpg', '로그인 페이지 배경 이미지'),
  ('banner_image', '/images/banner-default.jpg', '메인 배너 이미지'),
  ('company_name', '아마노코리아 영업기획 및 관리본부', '회사명'),
  ('system_title', '통합 협업 플랫폼', '시스템 타이틀')
ON CONFLICT (config_key) DO NOTHING;

-- ============================================
-- COMMENTS (테이블 및 컬럼 설명)
-- ============================================

COMMENT ON TABLE public.users IS '사용자 정보 테이블';
COMMENT ON TABLE public.schedules IS '일정 관리 테이블 (부서 일정 + 개인 일정)';
COMMENT ON TABLE public.weekly_reports IS '주간 보고서 테이블';
COMMENT ON TABLE public.posts IS '게시물 테이블';
COMMENT ON TABLE public.post_permissions IS '게시물 권한 관리 테이블';
COMMENT ON TABLE public.system_config IS '시스템 설정 테이블 (CMS)';
COMMENT ON TABLE public.audit_logs IS '감사 로그 테이블';

COMMENT ON COLUMN public.users.role IS 'DEPARTMENT_HEAD: 부서장, TEAM_LEADER: 팀장, TEAM_MEMBER: 팀원';
COMMENT ON COLUMN public.schedules.type IS 'PUBLIC: 부서 일정, PRIVATE: 개인 일정';
COMMENT ON COLUMN public.weekly_reports.status IS 'DRAFT: 작성중, SUBMITTED: 제출됨, APPROVED: 승인됨, REJECTED: 반려됨';
