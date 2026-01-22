# 🚀 관리자 대시보드 팀원 표시 가이드

## 📋 현재 상황
- ✅ 관리자 대시보드 로그인 가능
- ⚠️ 팀원 목록이 표시되지 않음
- **원인**: Supabase에 팀원 데이터가 없음

---

## ✅ 해결 방법: 팀원 데이터 추가

### **1단계: Supabase SQL Editor 접속**

👉 https://supabase.com/dashboard/project/wsredeftfoelzgkdalhx/sql/new

### **2단계: SQL 파일 내용 복사**

아래 파일의 전체 내용을 복사하세요:

**파일 위치**: `/home/user/webapp/supabase/seed_team_members.sql`

또는 아래 내용을 직접 복사:

```sql
-- [전체 SQL 내용은 seed_team_members.sql 파일 참조]
```

### **3단계: SQL 실행**

1. SQL Editor에 붙여넣기
2. 우측 하단 **"Run"** 버튼 클릭
3. ✅ "Success" 메시지 확인

### **4단계: 결과 확인**

SQL 실행 후 마지막에 자동으로 실행되는 확인 쿼리 결과를 확인:

| email | email_confirmed_at | name | role | position |
|-------|-------------------|------|------|----------|
| admin@amano.kr | 2026-01-15... | 김팀장 | admin | 팀장 |
| designer@amano.kr | 2026-01-15... | 박디자이너 | member | 디자이너 |
| video@amano.kr | 2026-01-15... | 이영상 | member | 영상 |
| 3d@amano.kr | 2026-01-15... | 최3D | member | 3D MAX |
| plan@amano.kr | 2026-01-15... | 정기획 | member | 기획 |

**총 5명 (관리자 1명 + 팀원 4명)**

---

## 📊 추가된 팀원 정보

### 관리자 (1명)
| 이름 | 이메일 | 비밀번호 | 역할 | 직책 |
|------|--------|----------|------|------|
| 김팀장 | admin@amano.kr | password123 | admin | 팀장 |

### 팀원 (4명)
| 이름 | 이메일 | 비밀번호 | 역할 | 직책 |
|------|--------|----------|------|------|
| 박디자이너 | designer@amano.kr | password123 | member | 디자이너 |
| 이영상 | video@amano.kr | password123 | member | 영상 |
| 최3D | 3d@amano.kr | password123 | member | 3D MAX |
| 정기획 | plan@amano.kr | password123 | member | 기획 |

---

## 📝 샘플 업무 데이터

SQL 실행 시 다음 샘플 업무도 자동 생성됩니다:

1. **신규 주차장 안내판 디자인** (디자인, 영업팀, 7일 후 마감)
2. **제품 소개 영상 제작** (영상, 마케팅팀, 10일 후 마감)
3. **주차장 3D 조감도 제작** (3D MAX, 기술팀, 14일 후 마감)
4. **2026년 홍보 전략 기획안** (기획, 경영지원팀, 5일 후 마감)
5. **본사 주차장 맵작업** (맵작업, 총무팀, 3일 후 마감)

---

## 🔄 관리자 대시보드 확인

### **1. 로그인**
👉 https://3000-isotlhp28qrkawj35ieh7-cc2fbc16.sandbox.novita.ai/login
- Email: `admin@amano.kr`
- Password: `password123`

### **2. 대시보드에서 확인할 내용**

#### **예상 화면 구성**:
```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  미배정 업무    │  박디자이너     │  이영상         │  최3D          │  정기획         │
│  (5건)          │  (디자이너)     │  (영상)         │  (3D MAX)      │  (기획)         │
│                 │  (0건)          │  (0건)          │  (0건)         │  (0건)         │
│                 │                 │                 │                │                │
│ • 안내판 디자인 │                 │                 │                │                │
│ • 영상 제작     │                 │                 │                │                │
│ • 3D 조감도     │                 │                 │                │                │
│ • 홍보 기획안   │                 │                 │                │                │
│ • 맵작업        │                 │                 │                │                │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### **3. Drag & Drop 테스트**

1. **"안내판 디자인"** 업무를 드래그
2. **"박디자이너"** 열로 드롭
3. ✅ 업무가 이동하고 상태가 "Todo"로 변경
4. **새로고침** 버튼 클릭하여 저장 확인

---

## 🐛 문제 해결

### ❌ 팀원이 표시되지 않는 경우

**원인**: SQL이 실행되지 않았거나 실패

**해결**:
```sql
-- 팀원 목록 확인 쿼리
SELECT * FROM public.profiles WHERE role = 'member';
```

결과가 **0행**이면 SQL 재실행 필요.

### ❌ "email already exists" 에러

**원인**: 이메일이 이미 존재

**해결**:
```sql
-- 기존 데이터 삭제 후 재실행
DELETE FROM public.profiles WHERE email LIKE '%@amano.kr';
DELETE FROM auth.users WHERE email LIKE '%@amano.kr';

-- 그 후 seed_team_members.sql 재실행
```

### ❌ 로그인 실패

**원인**: `email_confirmed_at`이 NULL

**해결**:
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email LIKE '%@amano.kr';
```

---

## 📌 다음 개선 사항

1. ✅ **팀원 목록 표시** (이번 작업)
2. 📊 **업무 상태별 통계** (Todo/Doing/Done 개수)
3. 🔍 **업무 상세 모달** (클릭 시 상세 정보 표시)
4. 🎨 **팀원별 색상 구분** (구별하기 쉽게)
5. 📅 **마감일 임박 알림** (D-1, D-3 강조)
6. 🔔 **실시간 업데이트** (Supabase Realtime)

---

## ✅ 완료 확인 체크리스트

- [ ] Supabase SQL Editor에서 `seed_team_members.sql` 실행
- [ ] 확인 쿼리 결과 5명 표시 확인
- [ ] 관리자 대시보드 접속
- [ ] 4개 팀원 열 표시 확인
- [ ] 미배정 업무 5건 표시 확인
- [ ] Drag & Drop으로 업무 배정 테스트
- [ ] 새로고침 후 변경 사항 유지 확인

---

**SQL 실행 후 대시보드를 새로고침하면 팀원 목록이 표시됩니다! 🎉**
