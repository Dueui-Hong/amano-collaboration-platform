# 🔍 문제 진단 가이드

## Issue 1: 팀원이 추가한 업무가 관리자에게 안 보이는 문제

### 현재 동작
- 팀원이 "새 업무 등록" 버튼으로 업무를 추가하면 `assignee_id`가 자동으로 본인 ID로 설정됨
- 이는 **정상 동작**입니다

### 확인 방법
관리자 대시보드에서:
1. "업무 현황" 탭 → "👥 팀원별 업무 현황" 섹션 확인
2. 해당 팀원의 카드에 업무가 표시되어야 함

---

## Issue 2: "등록된 팀원이 없습니다" 문제

### 원인
`profiles` 테이블에서 `role='member'`인 사용자가 조회되지 않음

### 진단 방법

1. **관리자로 로그인**
   - minseok_kim1@amano.co.kr / 1111

2. **브라우저 개발자 도구 열기**
   - Chrome/Edge: F12 또는 Ctrl+Shift+I
   - Safari: Cmd+Option+I

3. **Console 탭 확인**
   - 다음 메시지 찾기:
   ```
   조회된 팀원 목록: [...]
   팀원 수: X
   ```

### 예상 결과

**정상 (팀원 3명):**
```javascript
조회된 팀원 목록: [
  { id: "...", name: "홍두의", role: "member", ... },
  { id: "...", name: "김민석", role: "member", ... },
  { id: "...", name: "...", role: "member", ... }
]
팀원 수: 3
```

**문제 (팀원 0명):**
```javascript
조회된 팀원 목록: []
팀원 수: 0
```

### 해결 방법

**만약 팀원 수가 0이면:**

Supabase 데이터베이스에서 `profiles` 테이블의 `role` 컬럼을 확인하세요:

```sql
-- 모든 사용자의 role 확인
SELECT id, name, email, role FROM profiles;

-- role이 null이거나 잘못된 경우 수정
UPDATE profiles 
SET role = 'member' 
WHERE email IN (
  'dueui_hong@amano.co.kr',
  '다른팀원@amano.co.kr',
  '또다른팀원@amano.co.kr'
);

-- 관리자만 'admin' role 설정
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'minseok_kim1@amano.co.kr';
```

---

## 확인 스크린샷 위치

관리자 대시보드:
- URL: `/admin/dashboard`
- "업무 현황" 탭에서 `👥 팀원별 업무 현황 (3명)` 확인
- "업무 배정" 탭에서 팀원 칼럼 확인 (미배정 + 팀원1 + 팀원2 + 팀원3)

---

## 다음 단계

문제 진단 후 스크린샷이나 콘솔 로그를 공유해주시면 정확한 해결 방법을 제시하겠습니다.
