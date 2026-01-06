// ============================================
// TypeScript Type Definitions
// 아마노코리아 영업기획 및 관리본부 통합 협업 플랫폼
// ============================================

// Database Enums
export type UserRole = 'DEPARTMENT_HEAD' | 'TEAM_LEADER' | 'TEAM_MEMBER';
export type TeamName = '기획홍보팀' | '통합수주관리팀' | '부서장';
export type ScheduleType = 'PUBLIC' | 'PRIVATE';
export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
export type PostCategory = '공지사항' | '업무자료' | '회의록' | '기타';

// ============================================
// User Types
// ============================================
export interface User {
  id: string;
  employee_id: string;
  email: string;
  name: string;
  password_hash?: string; // 클라이언트에서는 제외
  role: UserRole;
  team: TeamName;
  position?: string;
  profile_image_url?: string;
  is_first_login: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserWithoutSensitive extends Omit<User, 'password_hash'> {}

export interface UserSession {
  user: UserWithoutSensitive;
  accessToken: string;
  expiresAt: number;
}

// ============================================
// Schedule Types
// ============================================
export interface Schedule {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  type: ScheduleType;
  color: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: UserWithoutSensitive; // Join 시 포함
}

export interface CreateScheduleInput {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  type: ScheduleType;
  color?: string;
}

export interface UpdateScheduleInput extends Partial<CreateScheduleInput> {
  id: string;
}

// ============================================
// Weekly Report Types
// ============================================
export interface WeeklyReport {
  id: string;
  author_id: string;
  week_start_date: string;
  week_end_date: string;
  this_week_work: string;
  next_week_plan: string;
  issues?: string;
  status: ReportStatus;
  reviewer_id?: string;
  reviewer_comment?: string;
  reviewed_at?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  author?: UserWithoutSensitive; // Join 시 포함
  reviewer?: UserWithoutSensitive; // Join 시 포함
}

export interface CreateReportInput {
  week_start_date: string;
  week_end_date: string;
  this_week_work: string;
  next_week_plan: string;
  issues?: string;
}

export interface UpdateReportInput extends Partial<CreateReportInput> {
  id: string;
  status?: ReportStatus;
  reviewer_comment?: string;
}

export interface ReportSubmitInput {
  id: string;
}

export interface ReportReviewInput {
  id: string;
  status: 'APPROVED' | 'REJECTED';
  reviewer_comment?: string;
}

// ============================================
// Post Types
// ============================================
export interface Post {
  id: string;
  title: string;
  content: string;
  category?: PostCategory;
  author_id: string;
  is_public: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  author?: UserWithoutSensitive; // Join 시 포함
}

export interface CreatePostInput {
  title: string;
  content: string;
  category?: PostCategory;
  is_public: boolean;
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  id: string;
}

// ============================================
// Post Permission Types
// ============================================
export interface PostPermission {
  id: string;
  post_id: string;
  user_id: string;
  granted_by: string;
  granted_at: string;
  user?: UserWithoutSensitive; // Join 시 포함
  granted_by_user?: UserWithoutSensitive; // Join 시 포함
}

export interface GrantPermissionInput {
  post_id: string;
  user_ids: string[]; // 여러 사용자에게 한 번에 권한 부여 가능
}

export interface RevokePermissionInput {
  post_id: string;
  user_id: string;
}

// ============================================
// System Config Types
// ============================================
export interface SystemConfig {
  id: string;
  config_key: string;
  config_value: string;
  description?: string;
  updated_by?: string;
  updated_at: string;
}

export interface UpdateSystemConfigInput {
  config_key: string;
  config_value: string;
}

// ============================================
// Audit Log Types
// ============================================
export type AuditAction = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE_POST'
  | 'UPDATE_POST'
  | 'DELETE_POST'
  | 'CREATE_REPORT'
  | 'UPDATE_REPORT'
  | 'SUBMIT_REPORT'
  | 'APPROVE_REPORT'
  | 'REJECT_REPORT'
  | 'GRANT_PERMISSION'
  | 'REVOKE_PERMISSION'
  | 'CREATE_SCHEDULE'
  | 'UPDATE_SCHEDULE'
  | 'DELETE_SCHEDULE'
  | 'UPDATE_SYSTEM_CONFIG';

export type AuditTargetType = 'POST' | 'REPORT' | 'SCHEDULE' | 'PERMISSION' | 'CONFIG' | null;

export interface AuditLog {
  id: string;
  user_id?: string;
  action: AuditAction;
  target_type?: AuditTargetType;
  target_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: UserWithoutSensitive; // Join 시 포함
}

export interface CreateAuditLogInput {
  action: AuditAction;
  target_type?: AuditTargetType;
  target_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

// ============================================
// API Response Types
// ============================================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// ============================================
// Pagination Types
// ============================================
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// ============================================
// Filter Types
// ============================================
export interface ReportFilterParams extends PaginationParams {
  author_id?: string;
  status?: ReportStatus;
  week_start_date?: string;
  team?: TeamName;
}

export interface PostFilterParams extends PaginationParams {
  author_id?: string;
  category?: PostCategory;
  is_public?: boolean;
  search?: string;
}

export interface ScheduleFilterParams {
  start_date?: string;
  end_date?: string;
  type?: ScheduleType;
  created_by?: string;
}

// ============================================
// Dashboard Types
// ============================================
export interface DashboardStats {
  total_reports_this_week: number;
  submitted_reports: number;
  approved_reports: number;
  pending_reports: number;
  total_schedules_this_month: number;
  total_posts_this_month: number;
  team_stats: TeamStats[];
}

export interface TeamStats {
  team: TeamName;
  total_members: number;
  reports_submitted: number;
  reports_approved: number;
  reports_pending: number;
}

// ============================================
// Permission Check Types
// ============================================
export interface PermissionCheck {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canGrantPermission: boolean;
}

// ============================================
// Calendar Event Types (for react-big-calendar)
// ============================================
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: Schedule; // 원본 Schedule 데이터
  allDay?: boolean;
}

// ============================================
// Form Validation Types
// ============================================
export interface LoginFormData {
  employee_id: string;
  password: string;
}

export interface ChangePasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ProfileUpdateFormData {
  name?: string;
  email?: string;
  position?: string;
  profile_image_url?: string;
}

// ============================================
// Utility Types
// ============================================
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ============================================
// NextAuth Types Extension
// ============================================
declare module 'next-auth' {
  interface Session {
    user: UserWithoutSensitive;
    accessToken: string;
  }

  interface User extends UserWithoutSensitive {}
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: UserWithoutSensitive;
    accessToken: string;
  }
}
