# 서버 자동 재시작 시스템

## 🎯 목적

샌드박스 환경에서 Next.js 개발 서버가 메모리 부족이나 다른 이유로 자동 종료되는 문제를 해결하기 위한 **자동 모니터링 및 재시작 시스템**입니다.

---

## 🔧 해결한 문제

### **기존 문제**
```
Closed Port Error
The sandbox is running but there's no service running on port 3000.
Connection refused on port 3000
```

### **원인**
1. Next.js 개발 서버가 메모리 부족으로 자동 종료
2. 샌드박스 환경의 리소스 제한
3. Hot Reload로 인한 메모리 누수
4. 수동 재시작 필요

### **해결 방법**
- **자동 모니터링**: 30초마다 포트 3000 상태 확인
- **자동 재시작**: 서버 다운 감지 시 즉시 재시작
- **무한 재시도**: 서버가 죽으면 계속 재시작 시도
- **로그 기록**: 모든 이벤트를 로그 파일에 기록

---

## 📁 구성 파일

### **`start-server.sh`**
- 위치: `/home/user/webapp/start-server.sh`
- 역할: 서버 모니터링 및 자동 재시작
- 실행 권한: `chmod +x start-server.sh`

---

## 🚀 사용 방법

### **1. 서버 시작 (자동 모니터링 포함)**

```bash
cd /home/user/webapp
nohup ./start-server.sh > /tmp/monitor.log 2>&1 &
echo $! > /tmp/monitor.pid
```

### **2. 서버 상태 확인**

```bash
# 포트 3000 리스닝 확인
netstat -tulpn | grep 3000

# 모니터링 로그 확인
tail -30 /tmp/server-monitor.log

# Next.js 서버 로그 확인
tail -30 /tmp/nextjs-dev.log

# 모니터링 프로세스 확인
ps aux | grep start-server | grep -v grep
```

### **3. 서버 수동 재시작 (필요 시)**

```bash
# 모니터링 스크립트 종료
cat /tmp/monitor.pid | xargs kill 2>/dev/null

# 모든 Node 프로세스 종료
pkill -9 node

# 포트 정리
fuser -k 3000/tcp

# 재시작
cd /home/user/webapp
nohup ./start-server.sh > /tmp/monitor.log 2>&1 &
echo $! > /tmp/monitor.pid
```

### **4. 서버 완전 종료**

```bash
# 모니터링 스크립트 종료
cat /tmp/monitor.pid | xargs kill 2>/dev/null

# 모든 Node 프로세스 종료
pkill -9 node

# 포트 정리
fuser -k 3000/tcp
```

---

## 📊 모니터링 로그

### **로그 파일 위치**
- **모니터링 로그**: `/tmp/server-monitor.log`
- **Next.js 서버 로그**: `/tmp/nextjs-dev.log`
- **모니터 실행 로그**: `/tmp/monitor.log`
- **PID 파일**: `/tmp/monitor.pid`, `/tmp/nextjs.pid`

### **로그 메시지 예시**

```bash
=== 서버 모니터링 시작 ===
Thu Jan 22 06:36:08 UTC 2026: 서버 시작 준비
Thu Jan 22 06:36:08 UTC 2026: 기존 프로세스 정리 중...
Thu Jan 22 06:36:11 UTC 2026: 서버 시작 시도 #1
Thu Jan 22 06:36:11 UTC 2026: 서버 PID: 25566
Thu Jan 22 06:36:26 UTC 2026: ✅ 서버 시작 성공 (포트 3000)

# 서버 다운 시
Thu Jan 22 07:00:00 UTC 2026: ⚠️ 서버 다운 감지 - 재시작 필요
Thu Jan 22 07:00:03 UTC 2026: 서버 시작 시도 #2
Thu Jan 22 07:00:18 UTC 2026: ✅ 서버 시작 성공 (포트 3000)
```

---

## 🔍 스크립트 동작 원리

### **1. 초기 시작**
```
1. 기존 Node 프로세스 정리
2. 포트 3000 정리
3. Next.js 개발 서버 시작 (npm run dev)
4. 15초 대기 (서버 시작 시간)
5. 포트 리스닝 확인
```

### **2. 모니터링 루프**
```
while true; do
  1. 30초 대기
  2. 포트 3000 리스닝 확인
  3. 서버 다운 감지 시:
     - 기존 프로세스 정리
     - 포트 정리
     - 3초 대기
     - 재시작 시도
  4. 반복
done
```

### **3. 자동 재시작**
- 최대 재시도 횟수: 999,999회 (사실상 무한)
- 재시도 간격: 3초
- 각 시도마다 로그 기록

---

## ⚙️ 설정

### **주요 변수 (start-server.sh)**

```bash
PORT=3000              # 모니터링할 포트 번호
MAX_RETRIES=999999     # 최대 재시도 횟수 (사실상 무한)
LOG_FILE="/tmp/server-monitor.log"
SERVER_LOG="/tmp/nextjs-dev.log"
PID_FILE="/tmp/nextjs.pid"
```

### **모니터링 주기**
- 포트 확인 주기: **30초**
- 서버 시작 대기 시간: **15초**
- 재시작 대기 시간: **3초**

---

## 🛠️ 트러블슈팅

### **문제: 서버가 계속 재시작됨**

**원인**: 포트 3000이 다른 프로세스에 의해 사용 중

**해결**:
```bash
# 포트 사용 프로세스 확인
lsof -i :3000

# 모든 Node 프로세스 종료
pkill -9 node

# 포트 강제 정리
fuser -k 3000/tcp

# 재시작
cd /home/user/webapp
nohup ./start-server.sh > /tmp/monitor.log 2>&1 &
```

---

### **문제: 서버 시작 실패**

**원인**: npm 패키지 문제 또는 코드 오류

**해결**:
```bash
# 로그 확인
tail -50 /tmp/nextjs-dev.log

# 의존성 재설치 (필요 시)
cd /home/user/webapp
npm install

# 수동으로 서버 시작해서 에러 확인
cd /home/user/webapp
npm run dev
```

---

### **문제: 모니터링 스크립트가 실행 안 됨**

**원인**: 실행 권한 없음

**해결**:
```bash
cd /home/user/webapp
chmod +x start-server.sh

# 재시작
nohup ./start-server.sh > /tmp/monitor.log 2>&1 &
echo $! > /tmp/monitor.pid
```

---

## 📝 일반 사용 가이드

### **샌드박스 시작 시**

```bash
# 1. 프로젝트 디렉토리로 이동
cd /home/user/webapp

# 2. 자동 재시작 스크립트 실행
nohup ./start-server.sh > /tmp/monitor.log 2>&1 &
echo $! > /tmp/monitor.pid

# 3. 10초 대기
sleep 10

# 4. 서버 상태 확인
netstat -tulpn | grep 3000
tail -20 /tmp/server-monitor.log
```

### **서버 상태 모니터링**

```bash
# 실시간 로그 확인
tail -f /tmp/server-monitor.log

# 포트 상태 확인
watch -n 5 'netstat -tulpn | grep 3000'

# 프로세스 상태 확인
watch -n 5 'ps aux | grep next-server | grep -v grep'
```

---

## 🎯 핵심 장점

### **1. 자동화**
- ✅ 수동 재시작 불필요
- ✅ 24/7 무중단 서비스
- ✅ 개발 중 서버 다운 걱정 없음

### **2. 안정성**
- ✅ 30초마다 자동 모니터링
- ✅ 서버 다운 즉시 감지 및 재시작
- ✅ 무한 재시도 (999,999회)

### **3. 가시성**
- ✅ 모든 이벤트 로그 기록
- ✅ 타임스탬프 포함
- ✅ 성공/실패 상태 명확히 표시

### **4. 간편함**
- ✅ 단일 명령으로 실행
- ✅ 백그라운드 실행
- ✅ 로그 파일로 상태 확인

---

## 🔄 업데이트 히스토리

### **v1.0 (2026-01-22)**
- 초기 버전 배포
- 자동 모니터링 및 재시작 기능
- 로그 기록 기능
- 포트 3000 모니터링

---

## 📞 문의

서버 자동 재시작 관련 문제가 발생하면:

1. 로그 파일 확인: `/tmp/server-monitor.log`
2. Next.js 로그 확인: `/tmp/nextjs-dev.log`
3. 수동 재시작 시도
4. 문제 지속 시 담당자에게 문의

---

## 🎉 결론

이제 **"Closed Port Error"** 문제가 발생해도 **자동으로 재시작**되므로, 더 이상 수동으로 서버를 재시작할 필요가 없습니다!

**서버가 죽으면 → 30초 내 자동 감지 → 3초 후 재시작 → 정상 운영 재개**

개발에만 집중하세요! 🚀
