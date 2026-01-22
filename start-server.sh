#!/bin/bash

# 아마노코리아 PPT 자동화 시스템 서버 시작 스크립트
# 서버가 죽으면 자동으로 재시작

LOG_FILE="/tmp/server-monitor.log"
SERVER_LOG="/tmp/nextjs-dev.log"
PID_FILE="/tmp/nextjs.pid"
PORT=3000
MAX_RETRIES=999999

echo "=== 서버 모니터링 시작 ===" | tee -a "$LOG_FILE"
echo "$(date): 서버 시작 준비" | tee -a "$LOG_FILE"

# 기존 프로세스 정리
echo "$(date): 기존 프로세스 정리 중..." | tee -a "$LOG_FILE"
pkill -9 node 2>/dev/null || true
fuser -k ${PORT}/tcp 2>/dev/null || true
sleep 3

retry_count=0

while [ $retry_count -lt $MAX_RETRIES ]; do
    echo "$(date): 서버 시작 시도 #$((retry_count + 1))" | tee -a "$LOG_FILE"
    
    # Next.js 개발 서버 시작
    cd /home/user/webapp
    nohup npm run dev > "$SERVER_LOG" 2>&1 &
    echo $! > "$PID_FILE"
    
    echo "$(date): 서버 PID: $(cat $PID_FILE)" | tee -a "$LOG_FILE"
    
    # 서버 시작 대기 (15초)
    sleep 15
    
    # 서버가 정상적으로 시작되었는지 확인
    if netstat -tulpn 2>/dev/null | grep -q ":${PORT}.*LISTEN"; then
        echo "$(date): ✅ 서버 시작 성공 (포트 ${PORT})" | tee -a "$LOG_FILE"
        
        # 서버 모니터링 루프
        while true; do
            sleep 30
            
            # 포트 확인
            if ! netstat -tulpn 2>/dev/null | grep -q ":${PORT}.*LISTEN"; then
                echo "$(date): ⚠️ 서버 다운 감지 - 재시작 필요" | tee -a "$LOG_FILE"
                
                # 기존 프로세스 정리
                if [ -f "$PID_FILE" ]; then
                    old_pid=$(cat "$PID_FILE")
                    kill -9 "$old_pid" 2>/dev/null || true
                fi
                pkill -9 node 2>/dev/null || true
                fuser -k ${PORT}/tcp 2>/dev/null || true
                sleep 3
                
                break  # 재시작을 위해 while 루프 종료
            fi
        done
    else
        echo "$(date): ❌ 서버 시작 실패" | tee -a "$LOG_FILE"
        tail -20 "$SERVER_LOG" | tee -a "$LOG_FILE"
    fi
    
    retry_count=$((retry_count + 1))
    echo "$(date): 3초 후 재시작..." | tee -a "$LOG_FILE"
    sleep 3
done

echo "$(date): 최대 재시도 횟수 도달" | tee -a "$LOG_FILE"
