# 아마노코리아 영업기획 및 관리본부 - Database ERD

## 📊 ERD (Entity Relationship Diagram)

```
┌─────────────────────────┐
│       USERS             │
├─────────────────────────┤
│ PK id (UUID)            │
│ UK employee_id          │
│ UK email                │
│    name                 │
│    password_hash        │
│    role (ENUM)          │  ◄─┐
│    team (ENUM)          │    │
│    position             │    │
│    profile_image_url    │    │
│    is_first_login       │    │
│    last_login_at        │    │
│    created_at           │    │
│    updated_at           │    │
└─────────────────────────┘    │
           │                   │
           │ 1                 │
           │                   │
           ├──────────────┐    │
           │              │    │
           │ N            │ N  │
           │              │    │
┌──────────▼────────────┐ │    │
│    SCHEDULES          │ │    │
├───────────────────────┤ │    │
│ PK id (UUID)          │ │    │
│    title              │ │    │
│    description        │ │    │
│    start_date         │ │    │
│    end_date           │ │    │
│    type (PUBLIC/      │ │    │
│         PRIVATE)      │ │    │
│    color              │ │    │
│ FK created_by ────────┼─┘    │
│    created_at         │      │
│    updated_at         │      │
└───────────────────────┘      │
                               │
┌───────────────────────┐      │
│   WEEKLY_REPORTS      │      │
├───────────────────────┤      │
│ PK id (UUID)          │      │
│ FK author_id ─────────┼──────┤
│    week_start_date    │      │
│    week_end_date      │      │
│    this_week_work     │      │
│    next_week_plan     │      │
│    issues             │      │
│    status (ENUM)      │      │
│ FK reviewer_id ───────┼──────┤
│    reviewer_comment   │      │
│    reviewed_at        │      │
│    submitted_at       │      │
│    created_at         │      │
│    updated_at         │      │
│ UK (author_id,        │      │
│     week_start_date)  │      │
└───────────────────────┘      │
                               │
┌───────────────────────┐      │
│       POSTS           │      │
├───────────────────────┤      │
│ PK id (UUID)          │      │
│    title              │      │
│    content            │      │
│    category           │      │
│ FK author_id ─────────┼──────┤
│    is_public          │      │
│    view_count         │      │
│    created_at         │      │
│    updated_at         │      │
└───────┬───────────────┘      │
        │                      │
        │ 1                    │
        │                      │
        │ N                    │
        │                      │
┌───────▼──────────────────┐   │
│   POST_PERMISSIONS       │   │
├──────────────────────────┤   │
│ PK id (UUID)             │   │
│ FK post_id               │   │
│ FK user_id ──────────────┼───┤
│ FK granted_by ───────────┼───┘
│    granted_at            │
│ UK (post_id, user_id)    │
└──────────────────────────┘

┌──────────────────────────┐
│    SYSTEM_CONFIG         │
├──────────────────────────┤
│ PK id (UUID)             │
│ UK config_key            │
│    config_value          │
│    description           │
│ FK updated_by ───────────┼─┐
│    updated_at            │ │
└──────────────────────────┘ │
                             │
┌──────────────────────────┐ │
│     AUDIT_LOGS           │ │
├──────────────────────────┤ │
│ PK id (UUID)             │ │
│ FK user_id ──────────────┼─┘
│    action                │
│    target_type           │
│    target_id (UUID)      │
│    details (JSONB)       │
│    ip_address            │
│    user_agent            │
│    created_at            │
└──────────────────────────┘
```

## 📋 테이블 설명

### 1. USERS (사용자)
- **용도**: 전체 부서원 정보 관리
- **특징**: 
  - 사원번호(employee_id)를 로그인 ID로 사용
  - 역할 기반 접근 제어 (RBAC) 구현
  - 최초 로그인 추적

### 2. SCHEDULES (일정)
- **용도**: 부서 공통 일정 + 개인 일정 관리
- **특징**:
  - PUBLIC: 모든 부서원 조회 가능
  - PRIVATE: 작성자만 조회 가능 (RLS 적용)

### 3. WEEKLY_REPORTS (주간 보고서)
- **용도**: 팀원 주간 업무 보고 및 팀장 검토
- **워크플로우**: DRAFT → SUBMITTED → APPROVED/REJECTED
- **특징**: 한 사용자당 주차별 1개 보고서만 작성 가능

### 4. POSTS (게시물)
- **용도**: 공지사항, 업무자료, 회의록 등 관리
- **특징**: 
  - is_public: true면 전체 공개
  - false면 작성자 + 권한 부여받은 사용자만 조회

### 5. POST_PERMISSIONS (게시물 권한)
- **용도**: 팀장이 특정 게시물을 특정 팀원에게 공유
- **특징**: 세밀한 권한 관리 가능

### 6. SYSTEM_CONFIG (시스템 설정)
- **용도**: CMS 기능 - 로고, 배경 이미지 등 동적 관리
- **특징**: 코드 수정 없이 UI 요소 변경 가능

### 7. AUDIT_LOGS (감사 로그)
- **용도**: 모든 주요 액션 추적 (보안, 컴플라이언스)
- **특징**: JSONB로 유연한 상세 정보 저장

## 🔐 Row Level Security (RLS) 정책

### USERS
- ✅ 본인 정보 조회 가능
- ✅ 부서장은 모든 사용자 정보 조회 가능

### SCHEDULES
- ✅ PUBLIC 일정은 모두 조회 가능
- ✅ PRIVATE 일정은 작성자만 조회 가능
- ✅ 자신이 생성한 일정만 수정/삭제 가능

### WEEKLY_REPORTS
- ✅ 본인이 작성한 보고서 조회 가능
- ✅ 팀장은 같은 팀 팀원의 보고서 조회 가능
- ✅ 부서장은 모든 보고서 조회 가능

### POSTS
- ✅ 작성자는 본인 게시물 조회 가능
- ✅ is_public=true인 게시물은 모두 조회 가능
- ✅ POST_PERMISSIONS에 등록된 사용자는 해당 게시물 조회 가능

## 🎯 핵심 비즈니스 로직

### 1. RBAC (역할 기반 접근 제어)
```
DEPARTMENT_HEAD (Level 1)
  ↓ 모든 데이터 조회/수정/삭제
  
TEAM_LEADER (Level 2)
  ↓ 소속 팀원 관리, 권한 부여
  
TEAM_MEMBER (Level 3)
  ↓ 본인 데이터만 관리
```

### 2. 주간 보고서 워크플로우
```
1. 팀원 작성 (DRAFT)
2. 팀원 제출 (SUBMITTED)
3. 팀장 검토 (APPROVED / REJECTED)
4. 부서장 확인 (Dashboard)
```

### 3. 게시물 권한 관리
```
- 작성자가 is_public=false로 게시물 작성
- 팀장이 POST_PERMISSIONS에 팀원 추가
- 팀원은 해당 게시물 조회 가능
```

## 📊 인덱스 전략

### 성능 최적화를 위한 인덱스
- `employee_id`, `role`, `team` (Users)
- `created_by`, `type`, `date_range` (Schedules)
- `author_id`, `status`, `week`, `reviewer_id` (Weekly Reports)
- `author_id`, `category`, `created_at DESC` (Posts)
- 모든 Foreign Key에 자동 인덱스

## 🔄 자동화 트리거

### updated_at 자동 업데이트
- Users, Schedules, Weekly Reports, Posts, System Config 테이블
- UPDATE 시 자동으로 updated_at 컬럼 업데이트
