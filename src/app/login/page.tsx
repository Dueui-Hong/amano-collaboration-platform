/**
 * 로그인 페이지 (Material Design)
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import LoginIcon from '@mui/icons-material/Login';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={8}>
          <CardContent sx={{ p: 4 }}>
            {/* 로고 및 제목 */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <BusinessIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                아마노코리아
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                업무 관리 시스템
              </Typography>
              <Typography variant="body2" color="text.secondary">
                기획홍보팀 PPT 자동화 시스템
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* 로그인 폼 */}
            <form onSubmit={handleLogin}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {error && (
                  <Alert severity="error" onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}

                <TextField
                  label="이메일"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  autoComplete="email"
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />

                <TextField
                  label="비밀번호"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  autoComplete="current-password"
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  fullWidth
                  startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                  sx={{ py: 1.5, mt: 1 }}
                >
                  {loading ? '로그인 중...' : '로그인'}
                </Button>
              </Box>
            </form>

            <Divider sx={{ my: 3 }} />

            {/* 테스트 계정 안내 */}
            <Paper elevation={0} sx={{ bgcolor: 'grey.100', p: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom sx={{ fontWeight: 600 }}>
                💡 테스트 계정 안내
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                <Box>
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                    팀장 (관리자)
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                    • 김민석: minseok_kim1@amano.co.kr / 1111
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    팀원
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                    • 홍세영 (계장): seyoung_hong@amano.co.kr / 1111
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                    • 최예지 (사원): yeji_choi@amano.co.kr / 1111
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                    • 홍두의 (사원): dueui_hong@amano.co.kr / 1111
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* 링크 */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="text"
                size="small"
                onClick={() => router.push('/request')}
              >
                업무 요청 페이지로 이동 →
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* 하단 안내 */}
        <Typography variant="body2" color="white" sx={{ textAlign: 'center', mt: 3, opacity: 0.8 }}>
          © 2026 아마노코리아. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
