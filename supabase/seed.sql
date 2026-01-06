-- ============================================
-- 아마노코리아 영업기획 및 관리본부
-- SEED DATA (초기 테스트 데이터)
-- ============================================

-- ⚠️ 주의: 실제 프로덕션 환경에서는 이 파일을 사용하지 마세요.
-- 개발/테스트 환경에서만 사용하세요.

-- ============================================
-- 1. 초기 사용자 데이터 (비밀번호: password123)
-- ============================================
-- 비밀번호 해시는 bcrypt로 생성된 값입니다.
-- 실제 운영 환경에서는 반드시 bcrypt 라이브러리를 사용하여 해시를 생성하세요.
-- 아래는 'password123'의 bcrypt 해시입니다.

INSERT INTO public.users (employee_id, email, name, password_hash, role, team, position) VALUES
  -- 부서장 (Level 1)
  ('EMP001', 'director@amano.kr', '김부장', '$2a$10$rXN5qhV5n5B5Q5Q5Q5Q5QuGxGxGxGxGxGxGxGxGxGxGxGxGxGxGx', 'DEPARTMENT_HEAD', '부서장', '부장'),
  
  -- 기획홍보팀 (Level 2: 팀장, Level 3: 팀원)
  ('EMP002', 'leader1@amano.kr', '이팀장', '$2a$10$rXN5qhV5n5B5Q5Q5Q5Q5QuGxGxGxGxGxGxGxGxGxGxGxGxGxGxGx', 'TEAM_LEADER', '기획홍보팀', '과장'),
  ('EMP003', 'member1@amano.kr', '박사원', '$2a$10$rXN5qhV5n5B5Q5Q5Q5Q5QuGxGxGxGxGxGxGxGxGxGxGxGxGxGxGx', 'TEAM_MEMBER', '기획홍보팀', '사원'),
  ('EMP004', 'member2@amano.kr', '최대리', '$2a$10$rXN5qhV5n5B5Q5Q5Q5Q5QuGxGxGxGxGxGxGxGxGxGxGxGxGxGxGx', 'TEAM_MEMBER', '기획홍보팀', '대리'),
  ('EMP005', 'member3@amano.kr', '정사원', '$2a$10$rXN5qhV5n5B5Q5Q5Q5Q5QuGxGxGxGxGxGxGxGxGxGxGxGxGxGxGx', 'TEAM_MEMBER', '기획홍보팀', '사원'),
  
  -- 통합수주관리팀 (Level 2: 팀장, Level 3: 팀원)
  ('EMP006', 'leader2@amano.kr', '강팀장', '$2a$10$rXN5qhV5n5B5Q5Q5Q5Q5QuGxGxGxGxGxGxGxGxGxGxGxGxGxGxGx', 'TEAM_LEADER', '통합수주관리팀', '과장'),
  ('EMP007', 'member4@amano.kr', '윤대리', '$2a$10$rXN5qhV5n5B5Q5Q5Q5Q5QuGxGxGxGxGxGxGxGxGxGxGxGxGxGxGx', 'TEAM_MEMBER', '통합수주관리팀', '대리')
ON CONFLICT (employee_id) DO NOTHING;

-- ============================================
-- 2. 샘플 부서 일정 (PUBLIC)
-- ============================================
INSERT INTO public.schedules (title, description, start_date, end_date, type, color, created_by) VALUES
  (
    '2026년 1분기 전략회의',
    '영업기획 및 관리본부 전체 전략회의',
    '2026-01-15 14:00:00+09',
    '2026-01-15 17:00:00+09',
    'PUBLIC',
    '#ef4444',
    (SELECT id FROM public.users WHERE employee_id = 'EMP001')
  ),
  (
    '기획홍보팀 정기 미팅',
    '월간 정기 미팅',
    '2026-01-20 10:00:00+09',
    '2026-01-20 12:00:00+09',
    'PUBLIC',
    '#3b82f6',
    (SELECT id FROM public.users WHERE employee_id = 'EMP002')
  ),
  (
    '통합수주관리팀 주간 회의',
    '주간 업무 현황 공유',
    '2026-01-13 15:00:00+09',
    '2026-01-13 16:00:00+09',
    'PUBLIC',
    '#10b981',
    (SELECT id FROM public.users WHERE employee_id = 'EMP006')
  );

-- ============================================
-- 3. 샘플 개인 일정 (PRIVATE)
-- ============================================
INSERT INTO public.schedules (title, description, start_date, end_date, type, color, created_by) VALUES
  (
    '거래처 미팅',
    'A사 미팅',
    '2026-01-14 14:00:00+09',
    '2026-01-14 16:00:00+09',
    'PRIVATE',
    '#8b5cf6',
    (SELECT id FROM public.users WHERE employee_id = 'EMP003')
  ),
  (
    '출장',
    '부산 지점 방문',
    '2026-01-22 09:00:00+09',
    '2026-01-22 18:00:00+09',
    'PRIVATE',
    '#f59e0b',
    (SELECT id FROM public.users WHERE employee_id = 'EMP007')
  );

-- ============================================
-- 4. 샘플 주간 보고서
-- ============================================
-- 2026년 1월 6일 주차 (1/6 ~ 1/12)
INSERT INTO public.weekly_reports (
  author_id,
  week_start_date,
  week_end_date,
  this_week_work,
  next_week_plan,
  issues,
  status,
  reviewer_id
) VALUES
  (
    (SELECT id FROM public.users WHERE employee_id = 'EMP003'),
    '2026-01-06',
    '2026-01-12',
    '# 이번 주 업무
- 신제품 마케팅 자료 초안 작성 완료
- SNS 콘텐츠 3건 게시
- 홈페이지 배너 디자인 시안 2안 제출',
    '# 다음 주 계획
- 신제품 마케팅 자료 최종 확정
- 1분기 캠페인 기획안 작성
- 거래처 A사 미팅 준비',
    '# 이슈 사항
- 디자인 외주 업체 일정 지연으로 배너 최종본 다음 주로 연기',
    'SUBMITTED',
    (SELECT id FROM public.users WHERE employee_id = 'EMP002')
  ),
  (
    (SELECT id FROM public.users WHERE employee_id = 'EMP004'),
    '2026-01-06',
    '2026-01-12',
    '# 이번 주 업무
- 언론 보도자료 3건 배포
- 업계 동향 리포트 작성
- 경쟁사 분석 자료 수집',
    '# 다음 주 계획
- 1분기 PR 전략 수립
- 미디어 킷 업데이트
- 기자간담회 준비',
    '# 이슈 사항
- 없음',
    'APPROVED',
    (SELECT id FROM public.users WHERE employee_id = 'EMP002')
  ),
  (
    (SELECT id FROM public.users WHERE employee_id = 'EMP007'),
    '2026-01-06',
    '2026-01-12',
    '# 이번 주 업무
- 신규 수주 계약서 검토 5건
- 수주 현황 주간 리포트 작성
- ERP 시스템 데이터 정리',
    '# 다음 주 계획
- 대형 프로젝트 입찰 준비
- 거래처 방문 (부산)
- 계약 갱신 협상 2건',
    '# 이슈 사항
- B사 계약 조건 재협상 필요',
    'SUBMITTED',
    (SELECT id FROM public.users WHERE employee_id = 'EMP006')
  );

-- ============================================
-- 5. 샘플 게시물
-- ============================================
INSERT INTO public.posts (title, content, category, author_id, is_public) VALUES
  (
    '[공지] 2026년 1분기 업무 목표',
    '안녕하세요. 영업기획 및 관리본부입니다.

2026년 1분기 주요 업무 목표를 공유드립니다.

## 주요 목표
1. 신규 거래처 확보 10곳 이상
2. 기존 거래처 만족도 조사 실시
3. 내부 업무 프로세스 개선

자세한 내용은 첨부 파일을 참고해주세요.

감사합니다.',
    '공지사항',
    (SELECT id FROM public.users WHERE employee_id = 'EMP001'),
    true
  ),
  (
    '[업무자료] 마케팅 가이드라인 v2.0',
    '# 마케팅 가이드라인 업데이트

2026년 새로운 마케팅 가이드라인을 공유드립니다.

## 주요 변경사항
- 브랜드 컬러 팔레트 업데이트
- SNS 채널별 콘텐츠 가이드
- 카피라이팅 톤앤매너 정의

첨부된 PDF를 확인해주세요.',
    '업무자료',
    (SELECT id FROM public.users WHERE employee_id = 'EMP002'),
    false
  ),
  (
    '[회의록] 1/10 기획홍보팀 정기회의',
    '# 기획홍보팀 정기회의 회의록

**일시:** 2026-01-10 10:00-12:00
**참석자:** 이팀장, 박사원, 최대리, 정사원

## 안건
1. 1분기 캠페인 기획 방향 논의
2. 신제품 런칭 일정 공유
3. 예산 집행 현황 점검

## 결정 사항
- 캠페인 콘셉트: "혁신과 신뢰"
- 런칭 일정: 2월 15일
- 예산 추가 요청: 마케팅 비용 20% 증액',
    '회의록',
    (SELECT id FROM public.users WHERE employee_id = 'EMP002'),
    false
  );

-- ============================================
-- 6. 샘플 게시물 권한
-- ============================================
-- 팀장이 팀원들에게 업무자료 열람 권한 부여
INSERT INTO public.post_permissions (post_id, user_id, granted_by) VALUES
  (
    (SELECT id FROM public.posts WHERE title = '[업무자료] 마케팅 가이드라인 v2.0'),
    (SELECT id FROM public.users WHERE employee_id = 'EMP003'),
    (SELECT id FROM public.users WHERE employee_id = 'EMP002')
  ),
  (
    (SELECT id FROM public.posts WHERE title = '[업무자료] 마케팅 가이드라인 v2.0'),
    (SELECT id FROM public.users WHERE employee_id = 'EMP004'),
    (SELECT id FROM public.users WHERE employee_id = 'EMP002')
  ),
  (
    (SELECT id FROM public.posts WHERE title = '[업무자료] 마케팅 가이드라인 v2.0'),
    (SELECT id FROM public.users WHERE employee_id = 'EMP005'),
    (SELECT id FROM public.users WHERE employee_id = 'EMP002')
  );

-- ============================================
-- 7. 샘플 감사 로그
-- ============================================
INSERT INTO public.audit_logs (user_id, action, target_type, target_id, details) VALUES
  (
    (SELECT id FROM public.users WHERE employee_id = 'EMP001'),
    'LOGIN',
    NULL,
    NULL,
    '{"ip": "192.168.1.100", "device": "Desktop"}'::jsonb
  ),
  (
    (SELECT id FROM public.users WHERE employee_id = 'EMP002'),
    'CREATE_POST',
    'POST',
    (SELECT id FROM public.posts WHERE title = '[업무자료] 마케팅 가이드라인 v2.0'),
    '{"category": "업무자료", "is_public": false}'::jsonb
  ),
  (
    (SELECT id FROM public.users WHERE employee_id = 'EMP002'),
    'GRANT_PERMISSION',
    'POST_PERMISSION',
    NULL,
    '{"post_title": "마케팅 가이드라인 v2.0", "granted_to": ["EMP003", "EMP004", "EMP005"]}'::jsonb
  );

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '시드 데이터 삽입이 완료되었습니다.';
  RAISE NOTICE '========================================';
  RAISE NOTICE '생성된 테스트 계정:';
  RAISE NOTICE '1. 부서장: EMP001 / password123';
  RAISE NOTICE '2. 기획홍보팀 팀장: EMP002 / password123';
  RAISE NOTICE '3. 기획홍보팀 팀원: EMP003, EMP004, EMP005 / password123';
  RAISE NOTICE '4. 통합수주관리팀 팀장: EMP006 / password123';
  RAISE NOTICE '5. 통합수주관리팀 팀원: EMP007 / password123';
  RAISE NOTICE '========================================';
  RAISE NOTICE '⚠️ 프로덕션 환경에서는 반드시 비밀번호를 변경하세요!';
  RAISE NOTICE '========================================';
END $$;
