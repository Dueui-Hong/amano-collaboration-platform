-- ========================================
-- 아마노코리아 기획홍보팀 데이터 설정
-- ========================================

-- 1. 현재 데이터 확인
SELECT id, email, name, role, position, created_at 
FROM profiles 
ORDER BY created_at;

-- 2. 김민석 부장 (팀장) - role 확인 및 수정
UPDATE profiles 
SET 
  name = '김민석',
  role = '관리자',
  position = '부장'
WHERE email = 'minseok_kim1@amano.co.kr';

-- 3. 홍세영 계장 추가/업데이트
INSERT INTO profiles (email, name, role, position)
VALUES ('seyoung_hong@amano.co.kr', '홍세영', '팀원', '계장')
ON CONFLICT (email) 
DO UPDATE SET 
  name = '홍세영',
  role = '팀원',
  position = '계장';

-- 4. 최예지 사원 추가/업데이트
INSERT INTO profiles (email, name, role, position)
VALUES ('yeji_choi@amano.co.kr', '최예지', '팀원', '사원')
ON CONFLICT (email) 
DO UPDATE SET 
  name = '최예지',
  role = '팀원',
  position = '사원';

-- 5. 홍두의 사원 추가/업데이트
INSERT INTO profiles (email, name, role, position)
VALUES ('dueui_hong@amano.co.kr', '홍두의', '팀원', '사원')
ON CONFLICT (email) 
DO UPDATE SET 
  name = '홍두의',
  role = '팀원',
  position = '사원';

-- 6. 최종 확인
SELECT 
  id, 
  email, 
  name, 
  role, 
  position,
  created_at 
FROM profiles 
ORDER BY 
  CASE role 
    WHEN '관리자' THEN 1 
    WHEN '팀원' THEN 2 
    ELSE 3 
  END,
  position DESC,
  name;

-- 7. 역할별 카운트 확인
SELECT role, COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY role;
