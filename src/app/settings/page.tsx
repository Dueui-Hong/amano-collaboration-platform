'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Header from '@/components/Header';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    name: string;
    email: string;
    role: 'admin' | 'member';
    position: string;
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserInfo({
          name: profile.name,
          email: profile.email,
          role: profile.role,
          position: profile.position,
        });
      }
    } catch (error) {
      console.error('인증 확인 실패:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // 입력 검증
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: '모든 필드를 입력해주세요.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }

    if (newPassword.length < 4) {
      setMessage({ type: 'error', text: '새 비밀번호는 최소 4자 이상이어야 합니다.' });
      return;
    }

    setSaving(true);

    try {
      // 현재 비밀번호로 재인증
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }

      // 현재 비밀번호 확인
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setMessage({ type: 'error', text: '현재 비밀번호가 올바르지 않습니다.' });
        setSaving(false);
        return;
      }

      // 비밀번호 업데이트
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setMessage({ type: 'success', text: '✅ 비밀번호가 성공적으로 변경되었습니다!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // 3초 후 대시보드로 이동
      setTimeout(() => {
        if (userInfo?.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 2000);
    } catch (error: any) {
      console.error('비밀번호 변경 실패:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || '비밀번호 변경에 실패했습니다.' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (userInfo?.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!userInfo) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8f0f7 50%, #d5e5f2 100%)',
      }}
    >
      <Header userName={userInfo.name} userRole={userInfo.role} userEmail={userInfo.email} />
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 3 }}
        >
          돌아가기
        </Button>

        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          계정 설정
        </Typography>

        {/* 사용자 정보 카드 */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              👤 사용자 정보
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">이름</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{userInfo.name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">이메일</Typography>
                <Typography variant="body1">{userInfo.email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">직책</Typography>
                <Typography variant="body1">{userInfo.position}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">권한</Typography>
                <Typography variant="body1" color="primary.main" sx={{ fontWeight: 500 }}>
                  {userInfo.role === 'admin' ? '관리자' : '팀원'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* 비밀번호 변경 폼 */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <LockIcon /> 비밀번호 변경
          </Typography>

          {message && (
            <Alert severity={message.type} sx={{ mb: 3 }}>
              {message.text}
            </Alert>
          )}

          <form onSubmit={handlePasswordChange}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="현재 비밀번호"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                fullWidth
                required
                variant="outlined"
              />

              <TextField
                label="새 비밀번호"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                required
                variant="outlined"
                helperText="최소 4자 이상"
              />

              <TextField
                label="새 비밀번호 확인"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                required
                variant="outlined"
                error={confirmPassword.length > 0 && newPassword !== confirmPassword}
                helperText={
                  confirmPassword.length > 0 && newPassword !== confirmPassword
                    ? '비밀번호가 일치하지 않습니다'
                    : ''
                }
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={saving}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <LockIcon />}
                >
                  {saving ? '변경 중...' : '비밀번호 변경'}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>

        {/* 안내 메시지 */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>💡 참고사항</strong>
          </Typography>
          <Typography variant="body2">
            • 비밀번호는 최소 4자 이상이어야 합니다.<br />
            • 비밀번호 변경 후 자동으로 대시보드로 이동합니다.<br />
            • 보안을 위해 주기적으로 비밀번호를 변경해주세요.
          </Typography>
        </Alert>
      </Container>
    </Box>
  );
}
