/**
 * 헤더 컴포넌트 - 아마노코리아 브랜드 디자인
 * - 브랜드 컬러 (#0081C0) 적용
 * - Glassmorphism 스타일
 * - 향상된 시인성
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import Chip from '@mui/material/Chip';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';

interface HeaderProps {
  userName: string;
  userRole: 'admin' | 'member';
  userEmail: string;
}

export default function Header({ userName, userRole, userEmail }: HeaderProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃에 실패했습니다.');
    }
  };

  const handleSettings = () => {
    handleMenuClose();
    router.push('/settings');
  };

  const handleDashboard = () => {
    handleMenuClose();
    if (userRole === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getRoleText = (role: 'admin' | 'member') => {
    return role === 'admin' ? '관리자' : '팀원';
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #0081C0 0%, #005A8D 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 20px rgba(0, 129, 192, 0.3)',
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
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
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box 
            sx={{ 
              textAlign: 'right', 
              display: { xs: 'none', sm: 'block' },
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              px: 2,
              py: 1,
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                color: '#fff',
                fontSize: '0.95rem',
              }}
            >
              {userName}
            </Typography>
            <Chip 
              label={getRoleText(userRole)}
              size="small"
              sx={{
                height: '20px',
                fontSize: '0.7rem',
                fontWeight: 600,
                background: userRole === 'admin' 
                  ? 'rgba(255, 215, 0, 0.9)' 
                  : 'rgba(255, 255, 255, 0.9)',
                color: userRole === 'admin' ? '#8B4513' : '#0081C0',
                mt: 0.5,
              }}
            />
          </Box>

          <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{ 
              ml: 1,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar 
              sx={{ 
                width: 44, 
                height: 44, 
                bgcolor: 'rgba(255, 255, 255, 0.25)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.2rem',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              }}
            >
              {getInitials(userName)}
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 8,
            sx: {
              overflow: 'visible',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(0, 129, 192, 0.2)',
              borderRadius: '16px',
              mt: 1.5,
              minWidth: 240,
              boxShadow: '0 8px 32px rgba(0, 129, 192, 0.2)',
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box 
            sx={{ 
              px: 2.5, 
              py: 2,
              background: 'linear-gradient(135deg, #0081C0 0%, #005A8D 100%)',
              borderRadius: '12px 12px 0 0',
              mb: 1,
            }}
          >
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {userName}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.8rem',
                mb: 0.5,
              }}
            >
              {userEmail}
            </Typography>
            <Chip 
              label={getRoleText(userRole)}
              size="small"
              sx={{
                height: '22px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            />
          </Box>
          
          <MenuItem 
            onClick={handleDashboard}
            sx={{
              py: 1.5,
              px: 2.5,
              borderRadius: '8px',
              mx: 1,
              mb: 0.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'rgba(0, 129, 192, 0.1)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon>
              <DashboardIcon fontSize="small" sx={{ color: '#0081C0' }} />
            </ListItemIcon>
            <Typography sx={{ fontWeight: 600, color: '#003D5C' }}>
              대시보드
            </Typography>
          </MenuItem>
          
          <MenuItem 
            onClick={handleSettings}
            sx={{
              py: 1.5,
              px: 2.5,
              borderRadius: '8px',
              mx: 1,
              mb: 0.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'rgba(0, 129, 192, 0.1)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon>
              <SettingsIcon fontSize="small" sx={{ color: '#0081C0' }} />
            </ListItemIcon>
            <Typography sx={{ fontWeight: 600, color: '#003D5C' }}>
              계정 설정
            </Typography>
          </MenuItem>
          
          <Divider sx={{ my: 1 }} />
          
          <MenuItem 
            onClick={handleLogout} 
            sx={{ 
              py: 1.5,
              px: 2.5,
              borderRadius: '8px',
              mx: 1,
              mb: 1,
              color: 'error.main',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'rgba(211, 47, 47, 0.1)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            <Typography sx={{ fontWeight: 600 }}>
              로그아웃
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
