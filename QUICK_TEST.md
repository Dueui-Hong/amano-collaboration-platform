# 🚀 빠른 테스트 가이드

## 1️⃣ 로그인 테스트

### 웹 브라우저에서:
1. https://amano-collaboration-platform.vercel.app/login 접속
2. **사원번호**: `EMP001`
3. **비밀번호**: `password123`
4. "로그인" 버튼 클릭

### 예상 결과:
✅ **성공 시**:
- 자동으로 `/dashboard`로 리다이렉트
- 사용자 정보 카드 표시:
  - 이름: 김부장
  - 사원번호: EMP001
  - 소속: 부서장
  - 역할: 부서장
- 통계 카드 4개 표시
- 최근 활동 및 다가오는 일정 표시

❌ **실패 시**:
- 빨간색 에러 메시지 표시
- "사원번호 또는 비밀번호가 일치하지 않습니다."

---

## 2️⃣ 다른 계정 테스트

### 팀장 계정 (기획홍보팀):
- **사원번호**: `EMP002`
- **비밀번호**: `password123`
- **이름**: 박팀장

### 팀원 계정 (기획홍보팀):
- **사원번호**: `EMP003`
- **비밀번호**: `password123`
- **이름**: 최대리

### 팀장 계정 (통합수주관리팀):
- **사원번호**: `EMP006`
- **비밀번호**: `password123`
- **이름**: 정팀장

---

## 3️⃣ 권한 체크 테스트

### 미들웨어 테스트:
1. **로그아웃 상태에서** `/dashboard` 직접 접속 시도
   - ✅ 예상: `/login?redirect=%2Fdashboard`로 리다이렉트
2. **로그인 상태에서** `/login` 접속 시도
   - ✅ 예상: `/dashboard`로 리다이렉트

---

## 4️⃣ API 직접 테스트 (선택사항)

### cURL로 로그인:
```bash
curl -X POST https://amano-collaboration-platform.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"employee_id":"EMP001","password":"password123"}'
```

**예상 응답**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "employee_id": "EMP001",
      "email": "director@amano.kr",
      "name": "김부장",
      "role": "DEPARTMENT_HEAD",
      "team": "부서장"
    },
    "isFirstLogin": true
  }
}
```

---

## 5️⃣ 브라우저 개발자 도구로 확인

### 쿠키 확인:
1. F12 눌러서 개발자 도구 열기
2. Application 탭 → Cookies 클릭
3. https://amano-collaboration-platform.vercel.app 선택
4. ✅ 확인할 쿠키:
   - `user_id`: HTTP-only (값 보이지 않음)
   - `user_session`: JSON 문자열 (값 확인 가능)

### 네트워크 확인:
1. Network 탭 열기
2. 로그인 버튼 클릭
3. ✅ 확인할 요청:
   - `POST /api/auth/login`: Status 200
   - `GET /api/auth/me`: Status 200

---

## 🐛 문제 해결

### 문제 1: "사원번호 또는 비밀번호가 일치하지 않습니다"
- ✅ 해결: Supabase SQL Editor에서 비밀번호 해시 업데이트:
```sql
UPDATE public.users 
SET password_hash = '$2b$10$sLDqmsWJNSdX0YjPtJXCBuQh.4kew9IJpU7rvysEunrokOyMk4CJ.'
WHERE employee_id IN ('EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007');
```

### 문제 2: 대시보드가 무한 로딩
- ✅ 해결됨: `/api/auth/me`를 쿠키 세션 방식으로 변경
- 강제 새로고침: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

### 문제 3: 404 Not Found
- ✅ Vercel 배포 완료 대기 (1-2분)
- Vercel 대시보드에서 배포 상태 확인

---

## ✅ 체크리스트

- [ ] 로그인 페이지 접속 성공
- [ ] EMP001로 로그인 성공
- [ ] 대시보드 정상 표시 (무한 로딩 없음)
- [ ] 사용자 정보 카드 정상 표시
- [ ] 통계 카드 4개 정상 표시
- [ ] 쿠키 2개 설정 확인
- [ ] 로그아웃 상태에서 `/dashboard` 접근 시 로그인 페이지로 리다이렉트
- [ ] 로그인 상태에서 `/login` 접근 시 대시보드로 리다이렉트

**모두 체크되면 배포 성공!** 🎉

---

© 2026 아마노코리아. All rights reserved.
