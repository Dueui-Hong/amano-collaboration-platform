/**
 * 로그인 페이지 - Modern Glassmorphism Design 2025
 * - Glassmorphism (유리 질감)
 * - Animated Gradient Background
 * - Floating Elements
 * - Smooth Transitions
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Fade from '@mui/material/Fade';
import Zoom from '@mui/material/Zoom';

// Icons
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import BusinessIcon from '@mui/icons-material/Business';
import SparklesIcon from '@mui/icons-material/AutoAwesome';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Supabase 로그인
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('사용자 정보를 찾을 수 없습니다.');

      // 2. 프로필 조회
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('사용자 프로필을 찾을 수 없습니다.');
      }

      // 3. 역할에 따라 리다이렉트
      if (profile.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('로그인 실패:', error);
      setError(error.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email: string, pwd: string) => {
    setEmail(email);
    setPassword(pwd);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        // Animated Gradient Background - 아마노코리아 브랜드 컬러 기반
        background: `
          linear-gradient(135deg, 
            #0081C0 0%, 
            #005A8D 25%,
            #0095D9 50%,
            #00ADD8 75%,
            #0081C0 100%
          )
        `,
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        '@keyframes gradientShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      }}
    >
      {/* Floating Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        {[...Array(6)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              animation: `float${i} ${15 + i * 2}s ease-in-out infinite`,
              [`@keyframes float${i}`]: {
                '0%, 100%': {
                  transform: `translate(${i * 20}vw, ${i * 10}vh) scale(1)`,
                },
                '50%': {
                  transform: `translate(${(i + 1) * 25}vw, ${(i + 1) * 15}vh) scale(1.2)`,
                },
              },
              ...(i % 2 === 0 ? {
                width: `${100 + i * 50}px`,
                height: `${100 + i * 50}px`,
                left: `${i * 15}%`,
                top: `${i * 10}%`,
              } : {
                width: `${150 + i * 40}px`,
                height: `${150 + i * 40}px`,
                right: `${i * 10}%`,
                bottom: `${i * 15}%`,
              }),
            }}
          />
        ))}
      </Box>

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Zoom in timeout={800}>
          <Box
            sx={{
              // Glassmorphism Card - 시인성 대폭 개선
              background: 'rgba(255, 255, 255, 0.35)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '32px',
              boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.3),
                0 2px 8px rgba(0, 0, 0, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.6)
              `,
              p: 5,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: `
                  0 16px 48px rgba(0, 0, 0, 0.35),
                  0 4px 16px rgba(0, 0, 0, 0.18),
                  inset 0 1px 0 rgba(255, 255, 255, 0.7)
                `,
              },
            }}
          >
            {/* Sparkle Effect */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 150,
                height: 150,
                background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: 'pulse 3s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
                  '50%': { opacity: 0.8, transform: 'scale(1.1)' },
                },
              }}
            />

            {/* Header */}
            <Fade in timeout={1000}>
              <Box sx={{ textAlign: 'center', mb: 5 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    p: 2,
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    mb: 2,
                  }}
                >
                  <BusinessIcon sx={{ fontSize: 56, color: '#fff' }} />
                </Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: '#fff',
                    mb: 1,
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    letterSpacing: '-0.5px',
                  }}
                >
                  아마노코리아
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                  <SparklesIcon sx={{ fontSize: 20, color: 'rgba(255,255,255,0.9)' }} />
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'rgba(255,255,255,0.95)',
                      fontWeight: 600,
                    }}
                  >
                    업무 관리 시스템
                  </Typography>
                  <SparklesIcon sx={{ fontSize: 20, color: 'rgba(255,255,255,0.9)' }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: '0.95rem',
                  }}
                >
                  기획홍보팀 PPT 자동화 플랫폼
                </Typography>
              </Box>
            </Fade>

            {/* Login Form */}
            <Fade in timeout={1200}>
              <Box component="form" onSubmit={handleLogin}>
                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      mb: 3,
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.4)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 0, 0, 0.3)',
                      color: '#8B0000',
                      fontWeight: 700,
                      '& .MuiAlert-icon': { color: '#D32F2F' },
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  label="이메일"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.35)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      color: '#003D5C',
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.6)',
                        borderWidth: '2px',
                      },
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.45)',
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.8)' },
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 0.5)',
                        '& fieldset': { borderColor: '#0081C0', borderWidth: '2px' },
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#003D5C',
                      fontWeight: 600,
                      '&.Mui-focused': { color: '#0081C0' },
                    },
                    '& .MuiInputAdornment-root': { color: '#0081C0' },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="비밀번호"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.35)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      color: '#003D5C',
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.6)',
                        borderWidth: '2px',
                      },
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.45)',
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.8)' },
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 0.5)',
                        '& fieldset': { borderColor: '#0081C0', borderWidth: '2px' },
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#003D5C',
                      fontWeight: 600,
                      '&.Mui-focused': { color: '#0081C0' },
                    },
                    '& .MuiInputAdornment-root': { color: '#0081C0' },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#0081C0' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                  sx={{
                    py: 1.8,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #0081C0 0%, #005A8D 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    boxShadow: '0 8px 24px rgba(0, 129, 192, 0.3)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0095D9 0%, #0081C0 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(0, 129, 192, 0.4)',
                    },
                    '&:active': {
                      transform: 'translateY(0px)',
                    },
                    '&.Mui-disabled': {
                      background: 'rgba(255, 255, 255, 0.3)',
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                  }}
                >
                  {loading ? '로그인 중...' : '로그인'}
                </Button>
              </Box>
            </Fade>

            {/* Quick Login */}
            <Fade in timeout={1400}>
              <Box sx={{ mt: 4 }}>
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.8)',
                    mb: 2,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  ⚡ 빠른 로그인
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() => quickLogin('minseok_kim1@amano.co.kr', '1111')}
                    sx={{
                      py: 1,
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.4)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 255, 255, 0.6)',
                      color: '#003D5C',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      textTransform: 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.5)',
                        border: '2px solid rgba(255, 255, 255, 0.8)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    👔 팀장
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() => quickLogin('dueui_hong@amano.co.kr', '1111')}
                    sx={{
                      py: 1,
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.4)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 255, 255, 0.6)',
                      color: '#003D5C',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      textTransform: 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.5)',
                        border: '2px solid rgba(255, 255, 255, 0.8)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    💼 팀원
                  </Button>
                </Box>
              </Box>
            </Fade>

            {/* 업무 요청 버튼 */}
            <Fade in timeout={1500}>
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.8)',
                    mb: 1.5,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  로그인 없이 업무 요청하기
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => router.push('/request')}
                  sx={{
                    py: 1.5,
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    color: '#003D5C',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.35)',
                      border: '2px solid rgba(255, 255, 255, 0.6)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  📝 업무 요청 페이지로 이동
                </Button>
              </Box>
            </Fade>

            {/* Footer */}
            <Fade in timeout={1600}>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.7)',
                  mt: 4,
                  fontSize: '0.8rem',
                }}
              >
                © 2026 아마노코리아. All rights reserved.
              </Typography>
            </Fade>
          </Box>
        </Zoom>
      </Container>
    </Box>
  );
}
