-- ========================================
-- profiles 테이블 제약 조건 수정 (한글 허용)
-- ========================================

-- 1. 기존 제약 조건 삭제
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. 한글을 포함한 새 제약 조건 추가
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'member', '관리자', '팀원'));

-- 3. 이제 한글 role로 업데이트
UPDATE profiles 
SET 
  name = '김민석',
  role = '관리자',
  position = '부장'
WHERE email = 'minseok_kim1@amano.co.kr';

-- 4. 팀원 추가
INSERT INTO profiles (id, email, name, role, position)
VALUES (gen_random_uuid(), 'seyoung_hong@amano.co.kr', '홍세영', '팀원', '계장')
ON CONFLICT (email) 
DO UPDATE SET 
  name = '홍세영',
  role = '팀원',
  position = '계장';

INSERT INTO profiles (id, email, name, role, position)
VALUES (gen_random_uuid(), 'yeji_choi@amano.co.kr', '최예지', '팀원', '사원')
ON CONFLICT (email) 
DO UPDATE SET 
  name = '최예지',
  role = '팀원',
  position = '사원';

INSERT INTO profiles (id, email, name, role, position)
VALUES (gen_random_uuid(), 'dueui_hong@amano.co.kr', '홍두의', '팀원', '사원')
ON CONFLICT (email) 
DO UPDATE SET 
  name = '홍두의',
  role = '팀원',
  position = '사원';

-- 5. 최종 확인
SELECT id, email, name, role, position, created_at 
FROM profiles 
ORDER BY 
  CASE role 
    WHEN '관리자' THEN 1 
    WHEN 'admin' THEN 1
    WHEN '팀원' THEN 2 
    WHEN 'member' THEN 2
    ELSE 3 
  END,
  position DESC,
  name;
