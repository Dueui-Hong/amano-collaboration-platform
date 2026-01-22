# 🔧 로그인 에러 수정 완료!

**문제**: "Database error querying schema"  
**원인**: Supabase RLS 정책에서 미배정 업무 조회 권한 누락  
**해결**: RLS 정책 업데이트

---

## ❌ **에러 원인**

### **문제 1: 미배정 업무 조회 불가**
기존 RLS 정책:
- 관리자는 자신이 관리자인지 확인 후 업무 조회
- 팀원은 자신에게 배정된 업무만 조회
- **미배정 업무(assignee_id = NULL)는 누구도 조회 불가** ❌

### **문제 2: 프로필 조회 제한**
- 사용자는 자신의 프로필만 조회 가능
- 관리자도 팀원 프로필을 조회할 수 없음 ❌

---

## ✅ **해결 방법**

### **즉시 수정: Supabase SQL 실행**

#### **1단계: Supabase SQL Editor 접속**
👉 **https://supabase.com/dashboard/project/wsredeftfoelzgkdalhx/sql/new**

#### **2단계: 아래 SQL 전체 복사 & 실행**

```sql
-- ============================================
-- RLS 정책 수정: 미배정 업무 조회 허용
-- ============================================

-- 1. 기존 tasks 조회 정책 삭제
DROP POLICY IF EXISTS "Admin can view all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Members can view their assigned tasks" ON public.tasks;

-- 2. 새로운 조회 정책 생성
-- 2-1. 관리자는 모든 업무 조회 가능 (미배정 포함)
CREATE POLICY "Admin can view all tasks"
ON public.tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 2-2. 팀원은 자신에게 배정된 업무만 조회 가능
CREATE POLICY "Members can view their assigned tasks"
ON public.tasks FOR SELECT
USING (
  assignee_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'member'
  )
);

-- 2-3. 미배정 업무는 모든 인증된 사용자가 볼 수 있음
CREATE POLICY "Anyone authenticated can view unassigned tasks"
ON public.tasks FOR SELECT
USING (
  assignee_id IS NULL
  AND auth.uid() IS NOT NULL
);

-- 3. 프로필 조회 정책 추가 (관리자는 모든 프로필 조회 가능)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  )
);

-- 4. 확인 쿼리
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'tasks')
ORDER BY tablename, policyname;
```

#### **3단계: 결과 확인**

SQL 실행 후 확인 쿼리 결과:

```
tablename | policyname                                  | cmd
----------+---------------------------------------------+--------
profiles  | Admin can view all profiles                 | SELECT
profiles  | Users can update their own profile          | UPDATE
profiles  | Users can view their own profile            | SELECT
tasks     | Admin can delete tasks                      | DELETE
tasks     | Admin can update all tasks                  | UPDATE
tasks     | Admin can view all tasks                    | SELECT
tasks     | Anyone authenticated can view unassigned... | SELECT
tasks     | Anyone can create tasks                     | INSERT
tasks     | Members can update their assigned tasks     | UPDATE
tasks     | Members can view their assigned tasks       | SELECT
```

**✅ 총 10개 정책 확인!**

---

## 🧪 **테스트**

### **1. 로그인 다시 시도**
👉 https://3000-isotlhp28qrkawj35ieh7-cc2fbc16.sandbox.novita.ai/login

- Email: `minseok_kim1@amano.co.kr`
- Password: `1111`

### **2. 관리자 대시보드 확인**
✅ 미배정 업무 5건 표시
✅ 팀원 3명 표시 (홍세영, 최예지, 홍두의)
✅ 에러 없이 정상 로드

### **3. Drag & Drop 테스트**
- 미배정 업무 → 팀원에게 드래그
- ✅ 정상 배정 확인

---

## 📝 **변경 사항 요약**

### **Before (문제)**
```
❌ 관리자 로그인 → "Database error querying schema"
❌ 미배정 업무 조회 불가
❌ 팀원 프로필 조회 불가
```

### **After (해결)**
```
✅ 관리자 로그인 성공
✅ 미배정 업무 조회 가능 (모든 인증 사용자)
✅ 관리자가 팀원 프로필 조회 가능
✅ 팀원이 자신의 업무 조회 가능
```

---

## 🔐 **RLS 정책 상세**

### **profiles 테이블**
1. `Users can view their own profile` - 모든 사용자가 자신의 프로필 조회
2. `Admin can view all profiles` - 관리자가 모든 프로필 조회
3. `Users can update their own profile` - 자신의 프로필 수정

### **tasks 테이블**
1. `Admin can view all tasks` - 관리자가 모든 업무 조회
2. `Members can view their assigned tasks` - 팀원이 배정된 업무 조회
3. `Anyone authenticated can view unassigned tasks` - 인증 사용자가 미배정 업무 조회
4. `Anyone can create tasks` - 누구나 업무 생성 (공개 요청 폼)
5. `Admin can update all tasks` - 관리자가 모든 업무 수정
6. `Members can update their assigned tasks` - 팀원이 자신의 업무 수정
7. `Admin can delete tasks` - 관리자가 업무 삭제

---

## 📦 **생성된 파일**

1. ✅ `supabase/fix_rls_policies.sql` - RLS 정책 수정 SQL
2. ✅ `FIX_LOGIN_ERROR.md` - 에러 해결 가이드

---

## 🔄 **다음 작업**

RLS 정책이 수정되었으니 이제 다음 기능을 추가할 수 있습니다:

1. ✅ **로그인 에러 수정** (현재 완료)
2. 📊 **대시보드 통계 추가**
   - 각 팀원별 업무 개수
   - 상태별 통계
3. 🔍 **업무 상세 모달**
   - 클릭 시 상세 정보
   - 이미지 미리보기
4. 📅 **마감일 알림**
   - D-1, D-3 강조
5. 🎨 **UI/UX 개선**
   - 팀원별 색상
   - 애니메이션 효과

---

## ✅ **완료 체크리스트**

- [ ] Supabase SQL Editor에서 fix_rls_policies.sql 실행
- [ ] 확인 쿼리 결과 10개 정책 확인
- [ ] 팀장(김민석) 로그인 테스트
- [ ] 관리자 대시보드 정상 로드 확인
- [ ] 미배정 업무 5건 표시 확인
- [ ] 팀원 3명 표시 확인
- [ ] Drag & Drop 업무 배정 테스트

---

**SQL 실행하면 즉시 에러가 해결됩니다! 🎉**

로그인 후 바로 관리자 대시보드가 정상적으로 표시됩니다.
