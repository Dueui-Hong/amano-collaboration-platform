// ============================================
// RBAC (Role-Based Access Control) Utilities
// 아마노코리아 영업기획 및 관리본부 권한 관리
// ============================================

import { User, UserRole, TeamName, PermissionCheck } from '@/types';

// ============================================
// 역할 레벨 정의
// ============================================
export const ROLE_LEVELS: Record<UserRole, number> = {
  DEPARTMENT_HEAD: 1, // 최고 권한
  TEAM_LEADER: 2,
  TEAM_MEMBER: 3,
};

// ============================================
// 역할별 기본 권한 체크
// ============================================

/**
 * 부서장인지 확인
 */
export const isDepartmentHead = (user: User | null): boolean => {
  return user?.role === 'DEPARTMENT_HEAD';
};

/**
 * 팀장인지 확인
 */
export const isTeamLeader = (user: User | null): boolean => {
  return user?.role === 'TEAM_LEADER';
};

/**
 * 팀원인지 확인
 */
export const isTeamMember = (user: User | null): boolean => {
  return user?.role === 'TEAM_MEMBER';
};

/**
 * 특정 역할 이상인지 확인
 */
export const hasRoleLevel = (
  user: User | null,
  minRole: UserRole
): boolean => {
  if (!user) return false;
  return ROLE_LEVELS[user.role] <= ROLE_LEVELS[minRole];
};

/**
 * 같은 팀인지 확인
 */
export const isSameTeam = (user1: User | null, user2: User | null): boolean => {
  if (!user1 || !user2) return false;
  return user1.team === user2.team;
};

// ============================================
// 게시물 권한 체크
// ============================================

/**
 * 게시물 조회 권한 확인
 */
export const canViewPost = (
  currentUser: User | null,
  post: { author_id: string; is_public: boolean },
  hasGrantedPermission: boolean = false
): boolean => {
  if (!currentUser) return false;

  // 부서장은 모든 게시물 조회 가능
  if (isDepartmentHead(currentUser)) return true;

  // 공개 게시물은 모두 조회 가능
  if (post.is_public) return true;

  // 작성자 본인
  if (post.author_id === currentUser.id) return true;

  // 권한 부여받은 경우
  if (hasGrantedPermission) return true;

  return false;
};

/**
 * 게시물 수정/삭제 권한 확인
 */
export const canEditPost = (
  currentUser: User | null,
  post: { author_id: string }
): boolean => {
  if (!currentUser) return false;

  // 부서장은 모든 게시물 수정 가능
  if (isDepartmentHead(currentUser)) return true;

  // 작성자 본인만 수정 가능
  return post.author_id === currentUser.id;
};

/**
 * 게시물 권한 부여 가능 여부 확인 (팀장 이상)
 */
export const canGrantPostPermission = (
  currentUser: User | null,
  post: { author_id: string }
): boolean => {
  if (!currentUser) return false;

  // 부서장은 모든 게시물에 권한 부여 가능
  if (isDepartmentHead(currentUser)) return true;

  // 팀장은 본인이 작성한 게시물에만 권한 부여 가능
  if (isTeamLeader(currentUser) && post.author_id === currentUser.id) {
    return true;
  }

  return false;
};

// ============================================
// 주간 보고서 권한 체크
// ============================================

/**
 * 주간 보고서 조회 권한 확인
 */
export const canViewReport = (
  currentUser: User | null,
  report: { author_id: string },
  reportAuthor?: User | null
): boolean => {
  if (!currentUser) return false;

  // 부서장은 모든 보고서 조회 가능
  if (isDepartmentHead(currentUser)) return true;

  // 본인이 작성한 보고서
  if (report.author_id === currentUser.id) return true;

  // 팀장은 같은 팀 팀원의 보고서 조회 가능
  if (isTeamLeader(currentUser) && reportAuthor) {
    return isSameTeam(currentUser, reportAuthor);
  }

  return false;
};

/**
 * 주간 보고서 수정 권한 확인 (작성자 본인 + DRAFT/REJECTED 상태)
 */
export const canEditReport = (
  currentUser: User | null,
  report: { author_id: string; status: string }
): boolean => {
  if (!currentUser) return false;

  // 부서장은 모든 보고서 수정 가능
  if (isDepartmentHead(currentUser)) return true;

  // 본인이 작성한 보고서 + DRAFT 또는 REJECTED 상태만 수정 가능
  if (report.author_id === currentUser.id) {
    return report.status === 'DRAFT' || report.status === 'REJECTED';
  }

  return false;
};

/**
 * 주간 보고서 검토 권한 확인 (팀장 이상)
 */
export const canReviewReport = (
  currentUser: User | null,
  report: { author_id: string; status: string },
  reportAuthor?: User | null
): boolean => {
  if (!currentUser) return false;

  // 본인이 작성한 보고서는 검토 불가
  if (report.author_id === currentUser.id) return false;

  // SUBMITTED 상태만 검토 가능
  if (report.status !== 'SUBMITTED') return false;

  // 부서장은 모든 보고서 검토 가능
  if (isDepartmentHead(currentUser)) return true;

  // 팀장은 같은 팀 팀원의 보고서만 검토 가능
  if (isTeamLeader(currentUser) && reportAuthor) {
    return isSameTeam(currentUser, reportAuthor);
  }

  return false;
};

// ============================================
// 일정 권한 체크
// ============================================

/**
 * 일정 조회 권한 확인
 */
export const canViewSchedule = (
  currentUser: User | null,
  schedule: { type: string; created_by: string }
): boolean => {
  if (!currentUser) return false;

  // 부서장은 모든 일정 조회 가능
  if (isDepartmentHead(currentUser)) return true;

  // PUBLIC 일정은 모두 조회 가능
  if (schedule.type === 'PUBLIC') return true;

  // PRIVATE 일정은 작성자만 조회 가능
  return schedule.created_by === currentUser.id;
};

/**
 * 일정 수정/삭제 권한 확인
 */
export const canEditSchedule = (
  currentUser: User | null,
  schedule: { created_by: string }
): boolean => {
  if (!currentUser) return false;

  // 부서장은 모든 일정 수정 가능
  if (isDepartmentHead(currentUser)) return true;

  // 작성자 본인만 수정 가능
  return schedule.created_by === currentUser.id;
};

/**
 * PUBLIC 일정 생성 권한 확인 (팀장 이상)
 */
export const canCreatePublicSchedule = (user: User | null): boolean => {
  if (!user) return false;
  return isDepartmentHead(user) || isTeamLeader(user);
};

// ============================================
// 시스템 설정 권한 체크
// ============================================

/**
 * 시스템 설정 수정 권한 확인 (부서장만)
 */
export const canEditSystemConfig = (user: User | null): boolean => {
  return isDepartmentHead(user);
};

// ============================================
// 사용자 관리 권한 체크
// ============================================

/**
 * 사용자 정보 조회 권한 확인
 */
export const canViewUserProfile = (
  currentUser: User | null,
  targetUser: User | null
): boolean => {
  if (!currentUser || !targetUser) return false;

  // 부서장은 모든 사용자 정보 조회 가능
  if (isDepartmentHead(currentUser)) return true;

  // 본인 정보는 항상 조회 가능
  if (currentUser.id === targetUser.id) return true;

  // 팀장은 같은 팀원 정보 조회 가능
  if (isTeamLeader(currentUser) && isSameTeam(currentUser, targetUser)) {
    return true;
  }

  return false;
};

/**
 * 사용자 정보 수정 권한 확인
 */
export const canEditUserProfile = (
  currentUser: User | null,
  targetUser: User | null
): boolean => {
  if (!currentUser || !targetUser) return false;

  // 부서장은 모든 사용자 정보 수정 가능
  if (isDepartmentHead(currentUser)) return true;

  // 본인 정보만 수정 가능 (단, role과 team은 제외)
  return currentUser.id === targetUser.id;
};

// ============================================
// 종합 권한 체크 함수
// ============================================

/**
 * 리소스에 대한 종합 권한 확인
 */
export const getPermissions = (
  currentUser: User | null,
  resource: {
    type: 'post' | 'report' | 'schedule' | 'user' | 'config';
    owner_id?: string;
    status?: string;
    is_public?: boolean;
    schedule_type?: string;
  },
  additionalData?: any
): PermissionCheck => {
  const permissions: PermissionCheck = {
    canView: false,
    canEdit: false,
    canDelete: false,
    canApprove: false,
    canGrantPermission: false,
  };

  if (!currentUser) return permissions;

  switch (resource.type) {
    case 'post':
      permissions.canView = canViewPost(
        currentUser,
        {
          author_id: resource.owner_id!,
          is_public: resource.is_public!,
        },
        additionalData?.hasGrantedPermission
      );
      permissions.canEdit = canEditPost(currentUser, {
        author_id: resource.owner_id!,
      });
      permissions.canDelete = permissions.canEdit;
      permissions.canGrantPermission = canGrantPostPermission(currentUser, {
        author_id: resource.owner_id!,
      });
      break;

    case 'report':
      permissions.canView = canViewReport(
        currentUser,
        { author_id: resource.owner_id! },
        additionalData?.reportAuthor
      );
      permissions.canEdit = canEditReport(currentUser, {
        author_id: resource.owner_id!,
        status: resource.status!,
      });
      permissions.canApprove = canReviewReport(
        currentUser,
        { author_id: resource.owner_id!, status: resource.status! },
        additionalData?.reportAuthor
      );
      break;

    case 'schedule':
      permissions.canView = canViewSchedule(currentUser, {
        type: resource.schedule_type!,
        created_by: resource.owner_id!,
      });
      permissions.canEdit = canEditSchedule(currentUser, {
        created_by: resource.owner_id!,
      });
      permissions.canDelete = permissions.canEdit;
      break;

    case 'config':
      const canEditConfig = canEditSystemConfig(currentUser);
      permissions.canView = true; // 시스템 설정은 모두 조회 가능
      permissions.canEdit = canEditConfig;
      permissions.canDelete = canEditConfig;
      break;

    case 'user':
      permissions.canView = canViewUserProfile(
        currentUser,
        additionalData?.targetUser
      );
      permissions.canEdit = canEditUserProfile(
        currentUser,
        additionalData?.targetUser
      );
      break;
  }

  return permissions;
};

// ============================================
// 팀별 사용자 필터링
// ============================================

/**
 * 현재 사용자가 관리할 수 있는 사용자 목록 필터링
 */
export const filterManageableUsers = (
  currentUser: User | null,
  allUsers: User[]
): User[] => {
  if (!currentUser) return [];

  // 부서장은 모든 사용자 관리 가능
  if (isDepartmentHead(currentUser)) return allUsers;

  // 팀장은 같은 팀원만 관리 가능
  if (isTeamLeader(currentUser)) {
    return allUsers.filter((user) => isSameTeam(currentUser, user));
  }

  // 팀원은 본인만 관리 가능
  return allUsers.filter((user) => user.id === currentUser.id);
};

// ============================================
// 에러 메시지
// ============================================

export const PERMISSION_ERRORS = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '리소스를 찾을 수 없습니다.',
  INVALID_ROLE: '유효하지 않은 역할입니다.',
  SAME_TEAM_REQUIRED: '같은 팀 소속이어야 합니다.',
  OWNER_ONLY: '작성자만 수정할 수 있습니다.',
  TEAM_LEADER_REQUIRED: '팀장 이상 권한이 필요합니다.',
  DEPARTMENT_HEAD_REQUIRED: '부서장 권한이 필요합니다.',
} as const;
