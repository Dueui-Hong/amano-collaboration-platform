-- ========================================
-- 아마노코리아 기획홍보팀 데이터 설정 (영어 role)
-- ========================================

-- 1. 김민석 부장 (팀장) - role을 'admin'으로
UPDATE profiles 
SET 
  name = '김민석',
  role = 'admin',
  position = '부장'
WHERE email = 'minseok_kim1@amano.co.kr';

-- 2. 홍세영 계장
INSERT INTO profiles (id, email, name, role, position)
VALUES (gen_random_uuid(), 'seyoung_hong@amano.co.kr', '홍세영', 'member', '계장')
ON CONFLICT (email) 
DO UPDATE SET 
  name = '홍세영',
  role = 'member',
  position = '계장';

-- 3. 최예지 사원
INSERT INTO profiles (id, email, name, role, position)
VALUES (gen_random_uuid(), 'yeji_choi@amano.co.kr', '최예지', 'member', '사원')
ON CONFLICT (email) 
DO UPDATE SET 
  name = '최예지',
  role = 'member',
  position = '사원';

-- 4. 홍두의 사원
INSERT INTO profiles (id, email, name, role, position)
VALUES (gen_random_uuid(), 'dueui_hong@amano.co.kr', '홍두의', 'member', '사원')
ON CONFLICT (email) 
DO UPDATE SET 
  name = '홍두의',
  role = 'member',
  position = '사원';

-- 5. 최종 확인
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
    WHEN 'admin' THEN 1 
    WHEN 'member' THEN 2 
    ELSE 3 
  END,
  position DESC,
  name;

-- 6. 역할별 카운트
SELECT role, COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY role;
