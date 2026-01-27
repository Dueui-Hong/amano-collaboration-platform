/**
 * 헤더 컴포넌트 - 로고 변경 예제
 * 
 * 이 파일은 로고를 이미지로 변경하는 예제입니다.
 * 실제 적용하려면 src/components/Header.tsx 파일을 수정하세요.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';  // 👈 이 줄 추가!
import { supabase } from '@/lib/supabase';
// ... 기타 import ...

export default function Header({ userName, userRole, userEmail }: HeaderProps) {
  const router = useRouter();
  // ... 기존 코드 ...

  return (
    <AppBar>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          
          {/* ========================================
              방법 1: 로고만 표시 (가장 심플)
              ======================================== */}
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
              src="/logo.png"          // 👈 로고 파일 경로
              alt="회사 로고"
              width={150}               // 👈 가로 크기 조정
              height={50}               // 👈 세로 크기 조정
              priority
              style={{ objectFit: 'contain' }}
            />
          </Box>

          {/* ========================================
              방법 2: 로고 + "업무 관리 시스템" 텍스트
              ======================================== */}
          {/* 
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
          */}

          {/* ========================================
              방법 3: 텍스트 회사명만 변경
              ======================================== */}
          {/* 
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
                우리회사          👈 여기만 변경하세요!
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
          */}

        </Box>

        {/* 나머지 코드는 동일 */}
      </Toolbar>
    </AppBar>
  );
}
