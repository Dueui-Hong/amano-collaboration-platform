# 🚀 실제 팀 정보로 업데이트 완료!

**업데이트 일시**: 2026-01-15

---

## ✅ 변경 사항

### **기존 (삭제됨)**
- admin@amano.kr / password123
- designer@amano.kr / password123
- 기타 테스트 계정들

### **신규 (실제 팀원)**

#### 1. 팀장 (관리자)
- **이름**: 김민석
- **이메일**: minseok_kim1@amano.co.kr
- **비밀번호**: 1111
- **직책**: 기획홍보팀 팀장
- **역할**: admin (모든 업무 관리, PPT 생성)

#### 2. 팀원들
| 이름 | 이메일 | 비밀번호 | 직책 | 역할 |
|------|--------|----------|------|------|
| 홍세영 | seyoung_hong@amano.co.kr | 1111 | 계장 | member |
| 최예지 | yeji_choi@amano.co.kr | 1111 | 사원 | member |
| 홍두의 | dueui_hong@amano.co.kr | 1111 | 사원 | member |

---

## 📋 지금 해야 할 일

### **1단계: Supabase SQL Editor 접속**

👉 **https://supabase.com/dashboard/project/wsredeftfoelzgkdalhx/sql/new**

### **2단계: 업데이트 SQL 실행**

아래 전체 SQL을 복사하여 붙여넣고 **Run** 클릭:

```sql
-- ============================================
-- 아마노코리아 기획홍보팀 실제 팀원 데이터
-- ============================================

-- 기존 테스트 데이터 완전 삭제
DELETE FROM public.tasks;
DELETE FROM public.profiles;
DELETE FROM auth.users WHERE email LIKE '%@amano.kr' OR email LIKE '%@amano.co.kr';

-- ============================================
-- 1. 팀장: 김민석
-- ============================================
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  aud, role, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token
)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'minseok_kim1@amano.co.kr',
  crypt('1111', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  'authenticated', 'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{}', FALSE, ''
);

INSERT INTO public.profiles (id, name, role, position, email)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  '김민석', 'admin', '기획홍보팀 팀장', 'minseok_kim1@amano.co.kr'
);

-- ============================================
-- 2. 팀원: 홍세영 (계장)
-- ============================================
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  aud, role, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token
)
VALUES (
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'seyoung_hong@amano.co.kr',
  crypt('1111', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  'authenticated', 'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{}', FALSE, ''
);

INSERT INTO public.profiles (id, name, role, position, email)
VALUES (
  '10000000-0000-0000-0000-000000000002',
  '홍세영', 'member', '계장', 'seyoung_hong@amano.co.kr'
);

-- ============================================
-- 3. 팀원: 최예지 (사원)
-- ============================================
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  aud, role, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token
)
VALUES (
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'yeji_choi@amano.co.kr',
  crypt('1111', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  'authenticated', 'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{}', FALSE, ''
);

INSERT INTO public.profiles (id, name, role, position, email)
VALUES (
  '10000000-0000-0000-0000-000000000003',
  '최예지', 'member', '사원', 'yeji_choi@amano.co.kr'
);

-- ============================================
-- 4. 팀원: 홍두의 (사원)
-- ============================================
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  aud, role, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token
)
VALUES (
  '10000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'dueui_hong@amano.co.kr',
  crypt('1111', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  'authenticated', 'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{}', FALSE, ''
);

INSERT INTO public.profiles (id, name, role, position, email)
VALUES (
  '10000000-0000-0000-0000-000000000004',
  '홍두의', 'member', '사원', 'dueui_hong@amano.co.kr'
);

-- ============================================
-- 샘플 업무 데이터 (테스트용)
-- ============================================
INSERT INTO public.tasks (title, requester_dept, requester_name, description, category, status, due_date, created_at)
VALUES 
  ('신규 주차장 안내판 디자인', '영업팀', '홍길동', '서울 강남구 신규 주차장 안내판 디자인 요청합니다. A4 사이즈, 컬러 인쇄용입니다.', '디자인', 'Unassigned', CURRENT_DATE + INTERVAL '7 days', NOW()),
  ('제품 소개 영상 제작', '마케팅팀', '김철수', '신제품 주차관제시스템 소개 영상 제작 (30초, 1분 2종)', '영상', 'Unassigned', CURRENT_DATE + INTERVAL '10 days', NOW()),
  ('주차장 3D 조감도 제작', '기술팀', '박영희', '부산 해운대 지하주차장 3D 조감도 제작 (3면도)', '3D MAX', 'Unassigned', CURRENT_DATE + INTERVAL '14 days', NOW()),
  ('2026년 홍보 전략 기획안', '경영지원팀', '이사장', '2026년 1분기 홍보 전략 기획안 작성 및 발표 자료 준비', '기획', 'Unassigned', CURRENT_DATE + INTERVAL '5 days', NOW()),
  ('본사 주차장 맵작업', '총무팀', '최영수', '본사 주차장 구역 재배치에 따른 맵 업데이트', '맵작업', 'Unassigned', CURRENT_DATE + INTERVAL '3 days', NOW());

-- 확인 쿼리
SELECT u.email, u.email_confirmed_at, p.name, p.role, p.position
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE '%@amano.co.kr'
ORDER BY 
  CASE p.role WHEN 'admin' THEN 1 WHEN 'member' THEN 2 ELSE 3 END,
  p.name;
```

### **3단계: 결과 확인**

SQL 실행 후 확인 쿼리 결과:

```
email                          | email_confirmed_at | name   | role   | position
-------------------------------+--------------------+--------+--------+------------------
minseok_kim1@amano.co.kr      | 2026-01-15...     | 김민석  | admin  | 기획홍보팀 팀장
dueui_hong@amano.co.kr        | 2026-01-15...     | 홍두의  | member | 사원
seyoung_hong@amano.co.kr      | 2026-01-15...     | 홍세영  | member | 계장
yeji_choi@amano.co.kr         | 2026-01-15...     | 최예지  | member | 사원
```

✅ **총 4명 (팀장 1명 + 팀원 3명)**

---

## 🧪 로그인 테스트

### **1. 팀장으로 로그인**
👉 https://3000-isotlhp28qrkawj35ieh7-cc2fbc16.sandbox.novita.ai/login

- **Email**: minseok_kim1@amano.co.kr
- **Password**: 1111

→ 자동 리다이렉트: `/admin/dashboard` ✅

### **2. 관리자 대시보드 확인**

예상 화면:
```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  미배정 업무    │  홍세영         │  최예지         │  홍두의         │
│  (5건)          │  (계장)         │  (사원)         │  (사원)         │
│                 │  (0건)          │  (0건)          │  (0건)          │
│                 │                 │                 │                 │
│ • 안내판 디자인 │                 │                 │                 │
│ • 영상 제작     │                 │                 │                 │
│ • 3D 조감도     │                 │                 │                 │
│ • 홍보 기획안   │                 │                 │                 │
│ • 맵작업        │                 │                 │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### **3. Drag & Drop 테스트**
1. "안내판 디자인" 업무 → "홍세영" 열로 드래그
2. ✅ 업무 이동 확인
3. 새로고침 버튼 클릭 → 변경사항 유지 확인

### **4. 팀원으로 로그인 테스트**
- Email: dueui_hong@amano.co.kr
- Password: 1111
- → 자동 리다이렉트: `/dashboard` (개인 캘린더)

---

## 📝 업데이트된 파일

1. ✅ `/supabase/seed_team_members.sql` - 실제 팀원 데이터
2. ✅ `/src/app/login/page.tsx` - 로그인 페이지 계정 안내
3. ✅ `/README.md` - 프로젝트 문서

---

## 🔄 다음 작업 제안

1. ✅ **실제 팀원 데이터 적용** (현재 완료)
2. 📊 **대시보드 개선**
   - 각 팀원별 업무 개수 실시간 표시
   - 상태별 색상 강조 (Todo/Doing/Done)
   - 마감일 임박 알림 (빨간색 강조)
3. 🔍 **업무 상세 모달**
   - 클릭 시 상세 정보 팝업
   - 이미지 첨부파일 미리보기
   - 상태 변경 히스토리
4. 📱 **모바일 최적화**
   - 반응형 레이아웃
   - 터치 드래그 지원
5. 🔔 **알림 기능**
   - 신규 업무 배정 알림
   - 마감일 임박 알림
   - 완료 업무 알림

---

## ✅ 완료 체크리스트

- [ ] Supabase SQL 실행
- [ ] 확인 쿼리 결과 4명 확인
- [ ] 팀장(김민석) 로그인 테스트
- [ ] 관리자 대시보드에서 3명 팀원 확인
- [ ] Drag & Drop 업무 배정 테스트
- [ ] 팀원(홍두의) 로그인 테스트
- [ ] 개인 캘린더 확인

---

**SQL 실행 후 새로고침하면 실제 팀원 목록이 표시됩니다! 🎉**

모든 기존 테스트 계정은 삭제되고 실제 팀원만 표시됩니다.
