# 로고 변경하는 방법 (초보자용 상세 가이드)

## 🎯 목표
헤더의 "아마노코리아" 텍스트와 아이콘을 회사 로고 이미지로 바꾸기

---

## 📋 준비물
- 회사 로고 이미지 파일 (PNG, JPG, SVG)
- 권장 크기: 가로 120~200px, 세로 40~60px
- 배경이 투명한 PNG 파일 권장

---

## 🔧 단계별 진행

### 1단계: 로고 이미지 파일 준비 및 업로드

#### 방법 A: 로컬에서 작업하는 경우
```bash
# 로고 파일을 public 폴더에 복사
cp /경로/내로고.png /home/user/webapp/public/logo.png
```

#### 방법 B: 서버에서 작업하는 경우
1. 로고 파일을 다음 위치에 업로드:
   ```
   /home/user/webapp/public/logo.png
   ```

2. 또는 명령어로:
   ```bash
   cd /home/user/webapp/public
   # 여기에 logo.png 파일을 넣으세요
   ```

---

### 2단계: Header 컴포넌트 수정

파일 위치: `/home/user/webapp/src/components/Header.tsx`

#### 2-1. 상단에 Image import 추가

**파일의 맨 위 부분에서 찾기:**
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
```

**바로 아래에 이 줄 추가:**
```typescript
import Image from 'next/image';
```

**결과:**
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';  // 👈 이 줄 추가
import { supabase } from '@/lib/supabase';
```

#### 2-2. 로고 부분 교체

**찾을 코드 (106-131번 줄 근처):**
```typescript
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              px: 2,
              py: 1,
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <BusinessIcon sx={{ fontSize: 28, color: '#fff' }} />
            <Box>
              <Typography 
                variant="h6" 
                component="div"
                sx={{
                  fontWeight: 700,
                  color: '#fff',
                  fontSize: '1.1rem',
                  lineHeight: 1.2,
                }}
              >
                아마노코리아
              </Typography>
              <Typography 
                variant="caption" 
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                }}
              >
                업무 관리 시스템
              </Typography>
            </Box>
          </Box>
```

**교체할 코드:**

**옵션 1: 로고만 표시 (가장 깔끔)**
```typescript
          <Box
            onClick={handleDashboard}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              px: 2,
              py: 1,
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.25)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              },
            }}
          >
            <Image
              src="/logo.png"
              alt="회사 로고"
              width={150}
              height={50}
              priority
              style={{ objectFit: 'contain' }}
            />
          </Box>
```

**옵션 2: 로고 + "업무 관리 시스템" 텍스트**
```typescript
          <Box
            onClick={handleDashboard}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              px: 2,
              py: 1,
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.25)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              },
            }}
          >
            <Image
              src="/logo.png"
              alt="회사 로고"
              width={120}
              height={40}
              priority
              style={{ objectFit: 'contain' }}
            />
            <Box>
              <Typography 
                variant="caption" 
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                }}
              >
                업무 관리 시스템
              </Typography>
            </Box>
          </Box>
```

---

### 3단계: 저장 및 확인

1. 파일 저장 (`Ctrl+S` 또는 `Cmd+S`)
2. 브라우저 새로고침 (`F5` 또는 `Ctrl+R`)
3. 로고가 보이는지 확인

---

## 🎨 로고 크기 조정하기

로고가 너무 크거나 작으면 `width`와 `height` 값을 조정:

```typescript
<Image
  src="/logo.png"
  alt="회사 로고"
  width={200}    // 👈 이 숫자를 변경 (가로)
  height={60}    // 👈 이 숫자를 변경 (세로)
  priority
  style={{ objectFit: 'contain' }}
/>
```

**권장 크기:**
- 작게: width={100}, height={35}
- 중간: width={150}, height={50}
- 크게: width={200}, height={65}

---

## ❓ 자주 묻는 질문

### Q1: 로고 이미지가 안 보여요
**A:** 파일 경로 확인:
```bash
ls -la /home/user/webapp/public/logo.png
```
파일이 존재하는지 확인하세요.

### Q2: 로고가 찌그러져 보여요
**A:** `objectFit: 'contain'`이 들어가 있는지 확인하세요:
```typescript
style={{ objectFit: 'contain' }}
```

### Q3: 원래대로 돌리고 싶어요
**A:** Git으로 복구:
```bash
cd /home/user/webapp
git checkout src/components/Header.tsx
```

### Q4: 다른 이미지 형식도 되나요?
**A:** 네, PNG, JPG, SVG 모두 가능합니다:
```typescript
<Image src="/logo.svg" ... />   // SVG
<Image src="/logo.jpg" ... />   // JPG
<Image src="/logo.png" ... />   // PNG
```

---

## 💡 팁

### 1. 투명 배경 사용
- PNG 형식의 투명 배경 로고를 사용하면 더 깔끔합니다

### 2. 로고 최적화
- 파일 크기를 줄이면 로딩 속도가 빨라집니다
- 추천 사이트: https://tinypng.com/

### 3. 여러 개 테스트
- `public/logo1.png`, `public/logo2.png` 등으로 저장
- `src="/logo1.png"` 또는 `src="/logo2.png"`로 변경하며 테스트

---

## 📞 도움이 필요하면

변경 후 문제가 생기면:

1. **파일 위치 확인:**
   ```bash
   ls -la /home/user/webapp/public/logo.png
   ls -la /home/user/webapp/src/components/Header.tsx
   ```

2. **서버 재시작:**
   ```bash
   cd /home/user/webapp
   pkill -9 node
   npm run dev
   ```

3. **원래대로 복구:**
   ```bash
   cd /home/user/webapp
   git checkout src/components/Header.tsx
   ```

---

**마지막 업데이트:** 2026-01-27
**작성자:** AI Assistant
