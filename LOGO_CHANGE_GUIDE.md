# 로고 변경 가이드

## 개요
헤더 컴포넌트의 "아마노코리아" 로고를 원하는 이미지로 변경하는 방법을 안내합니다.

## 방법 1: 이미지 파일 사용 (권장)

### 1. 로고 이미지 준비
- 형식: PNG, SVG, JPG
- 권장 크기: 높이 40-50px (자동으로 비율 맞춤)
- 투명 배경 PNG 또는 SVG 권장

### 2. 이미지 파일 배치
```bash
# public 폴더에 로고 이미지 저장
cp your-logo.png /home/user/webapp/public/logo.png
```

또는 `public/static/` 폴더 사용 (더 나은 조직화):
```bash
cp your-logo.png /home/user/webapp/public/static/logo.png
```

### 3. Header 컴포넌트 수정
`src/components/Header.tsx` 파일을 다음과 같이 수정:

#### 3-1. Next.js Image 컴포넌트 import 추가 (상단)
```typescript
import Image from 'next/image';
```

#### 3-2. BusinessIcon을 Image로 교체 (91-120번 줄 근처)

**변경 전:**
```typescript
<Box
  onClick={handleDashboard}
  sx={{
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    // ... 스타일
  }}
>
  <BusinessIcon sx={{ fontSize: 28, color: '#fff' }} />
  <Box>
    <Typography variant="h6">
      아마노코리아
    </Typography>
    <Typography variant="caption">
      업무 관리 시스템
    </Typography>
  </Box>
</Box>
```

**변경 후:**
```typescript
<Box
  onClick={handleDashboard}
  sx={{
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    // ... 스타일 (동일)
  }}
>
  <Image
    src="/logo.png"
    alt="아마노코리아 로고"
    width={120}
    height={40}
    style={{ objectFit: 'contain' }}
  />
  <Box>
    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.7rem', fontWeight: 500 }}>
      업무 관리 시스템
    </Typography>
  </Box>
</Box>
```

**또는 로고만 사용 (텍스트 제거):**
```typescript
<Box
  onClick={handleDashboard}
  sx={{
    // ... 스타일 (동일)
  }}
>
  <Image
    src="/logo.png"
    alt="아마노코리아 로고"
    width={150}
    height={45}
    style={{ objectFit: 'contain' }}
  />
</Box>
```

## 방법 2: 텍스트만 변경

`src/components/Header.tsx` 파일에서 118번 줄 근처:

```typescript
<Typography variant="h6" component="div" sx={{ fontWeight: 700, color: '#fff' }}>
  아마노코리아  {/* 이 부분을 원하는 텍스트로 변경 */}
</Typography>
```

예시:
```typescript
<Typography variant="h6" component="div" sx={{ fontWeight: 700, color: '#fff' }}>
  우리회사
</Typography>
```

## 방법 3: SVG 아이콘 사용

### 1. Material-UI 아이콘 변경
현재 `BusinessIcon`을 다른 아이콘으로 변경:

```typescript
// 상단 import 부분
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
// 또는
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
// 또는
import DomainIcon from '@mui/icons-material/Domain';

// 106번 줄 근처에서 변경
<BusinessCenterIcon sx={{ fontSize: 32, color: '#fff' }} />
```

### 2. 커스텀 SVG 사용
```typescript
<Box
  component="img"
  src="/logo.svg"
  alt="로고"
  sx={{
    width: 120,
    height: 40,
    objectFit: 'contain',
  }}
/>
```

## 적용 방법

1. 위의 방법 중 하나를 선택하여 `src/components/Header.tsx` 수정
2. 서버가 실행 중이라면 자동으로 반영됨
3. 브라우저 새로고침 (Ctrl+F5 또는 Cmd+Shift+R)

## 로고 크기 조정

이미지 크기가 맞지 않는 경우:

```typescript
<Image
  src="/logo.png"
  alt="로고"
  width={200}    // 너비 조정
  height={60}    // 높이 조정
  style={{ objectFit: 'contain' }}  // 비율 유지
/>
```

## 주의사항

1. **이미지 경로**: `public/` 폴더의 파일은 `/logo.png`로 접근
2. **Image 컴포넌트**: Next.js Image는 자동 최적화 제공
3. **클릭 가능**: 로고 클릭 시 대시보드로 이동 (이미 구현됨)
4. **반응형**: 모바일에서는 로고 크기가 자동으로 축소됨

## 예제 코드 (완전한 변경 예시)

```typescript
// src/components/Header.tsx 수정

import Image from 'next/image';  // 추가

// ... 기존 코드 ...

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
    alt="아마노코리아 로고"
    width={140}
    height={45}
    style={{ objectFit: 'contain' }}
  />
  <Box>
    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.7rem', fontWeight: 500 }}>
      업무 관리 시스템
    </Typography>
  </Box>
</Box>
```

## 추가 도움

- 로고 이미지 최적화: [TinyPNG](https://tinypng.com/)
- SVG 변환: [Convertio](https://convertio.co/kr/png-svg/)
- 무료 아이콘: [Material Icons](https://mui.com/material-ui/material-icons/)

---

**마지막 업데이트**: 2026-01-27
