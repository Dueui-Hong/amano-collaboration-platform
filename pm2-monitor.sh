#!/bin/bash
# PM2 서버 모니터링 및 자동 재시작 스크립트

cd /home/user/webapp

# 포트 3000 체크
if ! lsof -i :3000 > /dev/null 2>&1; then
    echo "$(date): 포트 3000이 응답하지 않습니다. PM2 재시작..."
    pm2 restart webapp
    sleep 10
    
    # 재시작 후에도 응답 없으면 완전 재시작
    if ! lsof -i :3000 > /dev/null 2>&1; then
        echo "$(date): PM2 완전 재시작 시도..."
        pm2 delete webapp
        sleep 3
        pm2 start ecosystem.config.cjs
    fi
else
    # HTTP 응답 체크
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
    if [ "$HTTP_CODE" != "200" ]; then
        echo "$(date): HTTP 응답 오류 (코드: $HTTP_CODE). PM2 재시작..."
        pm2 restart webapp
    fi
fi

# PM2 상태 저장
pm2 save --force > /dev/null 2>&1
