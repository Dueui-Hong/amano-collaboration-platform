/**
 * 팀원 대시보드 - 사이드바 방식
 * - 업무 일정 (캘린더)
 * - 자료 게시판
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase, Task, Profile } from '@/lib/supabase';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Badge from '@mui/material/Badge';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';

// Icons
import AssignmentIcon from '@mui/icons-material/Assignment';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArticleIcon from '@mui/icons-material/Article';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import Header from '@/components/Header';

const drawerWidth = 240;

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userInfo, setUserInfo] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // 사이드바 및 뷰 상태
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' && window.innerWidth >= 768);
  const [currentView, setCurrentView] = useState<'calendar' | 'board'>('calendar');

  // 새 업무 등록 모달 상태
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    category: '',
    requester_dept: '',
    requester_name: '',
    description: '',
    due_date: '',
  });
  const [creatingTask, setCreatingTask] = useState(false);

  useEffect(() => {
    fetchUserAndTasks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserAndTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // 프로필 조회
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserInfo(profile);
      }

      // 내 업무만 조회
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('assignee_id', user.id)
        .order('due_date', { ascending: true });

      setTasks(data || []);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      showSnackbar('데이터 조회에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (info: any) => {
    const taskId = info.event.id;
    if (taskId) {
      router.push(`/tasks/${taskId}`);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.category || !newTask.due_date || !userInfo) {
      showSnackbar('필수 항목을 모두 입력해주세요.', 'error');
      return;
    }

    setCreatingTask(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('사용자 인증 실패');

      const { error } = await supabase.from('tasks').insert([
        {
          ...newTask,
          assignee_id: user.id,
          status: 'Todo',
        },
      ]);

      if (error) throw error;

      showSnackbar('업무가 등록되었습니다!', 'success');
      setShowNewTaskModal(false);
      setNewTask({
        title: '',
        category: '',
        requester_dept: '',
        requester_name: '',
        description: '',
        due_date: '',
      });
      fetchUserAndTasks();
    } catch (error: any) {
      console.error('업무 등록 실패:', error);
      showSnackbar(`업무 등록에 실패했습니다: ${error.message}`, 'error');
    } finally {
      setCreatingTask(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'success';
      case 'Doing': return 'warning';
      case 'Todo': return 'primary';
      default: return 'default';
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((t) => t.status === status);
  };

  const calendarEvents = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    start: task.due_date,
    backgroundColor: task.status === 'Done' ? '#4caf50' : task.status === 'Doing' ? '#ff9800' : '#2196f3',
    borderColor: task.status === 'Done' ? '#4caf50' : task.status === 'Doing' ? '#ff9800' : '#2196f3',
  }));

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

      <Box sx={{ display: 'flex', pt: { xs: 10, sm: 8, md: 0 } }}>
        {/* 사이드바 */}
        <Drawer
          variant="permanent"
          open={sidebarOpen}
          sx={{
            width: sidebarOpen ? drawerWidth : 60,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: sidebarOpen ? drawerWidth : 60,
              boxSizing: 'border-box',
              transition: 'width 0.3s ease',
              top: { xs: 56, md: 64 },
              height: { xs: 'calc(100% - 56px)', md: 'calc(100% - 64px)' },
              overflowX: 'hidden',
              background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
              borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
          </Box>
          <Divider />
          
          <List sx={{ pt: 2, px: 1 }}>
            {/* 업무 일정 */}
            <ListItem disablePadding>
              <ListItemButton
                selected={currentView === 'calendar'}
                onClick={() => setCurrentView('calendar')}
                sx={{
                  minHeight: 48,
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  mb: 1,
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #0081C0 0%, #005A8D 100%)',
                    color: '#fff',
                    '& .MuiListItemIcon-root': { color: '#fff' },
                  },
                }}
              >
                <Tooltip title={!sidebarOpen ? "업무 일정" : ""} placement="right">
                  <ListItemIcon sx={{ minWidth: 0, mr: sidebarOpen ? 2 : 'auto' }}>
                    <CalendarTodayIcon />
                  </ListItemIcon>
                </Tooltip>
                <ListItemText 
                  primary="업무 일정" 
                  sx={{ opacity: sidebarOpen ? 1 : 0, display: sidebarOpen ? 'block' : 'none' }}
                />
              </ListItemButton>
            </ListItem>

            {/* 자료 게시판 */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => router.push('/board')}
                sx={{
                  minHeight: 48,
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  '&:hover': {
                    background: 'rgba(0, 129, 192, 0.1)',
                  },
                }}
              >
                <Tooltip title={!sidebarOpen ? "자료 게시판" : ""} placement="right">
                  <ListItemIcon sx={{ minWidth: 0, mr: sidebarOpen ? 2 : 'auto' }}>
                    <ArticleIcon />
                  </ListItemIcon>
                </Tooltip>
                <ListItemText 
                  primary="자료 게시판" 
                  sx={{ opacity: sidebarOpen ? 1 : 0, display: sidebarOpen ? 'block' : 'none' }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>

        {/* 메인 컨텐츠 */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 3 },
            ml: sidebarOpen ? 0 : { xs: 0, md: `-${drawerWidth - 60}px` },
            transition: 'margin 0.3s ease',
          }}
        >
          <Container maxWidth="xl">
            {/* 헤더 */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                  내 업무 캘린더
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
                  캘린더에서 업무를 클릭하여 상세 정보를 확인하세요
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowNewTaskModal(true)}
                sx={{
                  background: 'linear-gradient(135deg, #0081C0 0%, #005A8D 100%)',
                  color: 'white',
                  fontWeight: 600,
                  px: { xs: 2, md: 3 },
                  py: { xs: 1, md: 1.5 },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0, 129, 192, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #005A8D 0%, #004A70 100%)',
                    boxShadow: '0 6px 16px rgba(0, 129, 192, #4)',
                  }
                }}
              >
                새 업무 등록
              </Button>
            </Box>

            {/* 통계 카드 */}
            <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 4 } }}>
              <Grid item xs={4} sm={4}>
                <Card elevation={2}>
                  <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>예정</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main', fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                          {getTasksByStatus('Todo').length}
                        </Typography>
                      </Box>
                      <AssignmentIcon sx={{ fontSize: { xs: 32, md: 48 }, color: 'primary.main', opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4} sm={4}>
                <Card elevation={2}>
                  <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>진행중</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main', fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                          {getTasksByStatus('Doing').length}
                        </Typography>
                      </Box>
                      <PlayCircleIcon sx={{ fontSize: { xs: 32, md: 48 }, color: 'warning.main', opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4} sm={4}>
                <Card elevation={2}>
                  <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>완료</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main', fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                          {getTasksByStatus('Done').length}
                        </Typography>
                      </Box>
                      <CheckCircleIcon sx={{ fontSize: { xs: 32, md: 48 }, color: 'success.main', opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* 캘린더 */}
            <Card elevation={2} sx={{ mb: { xs: 2, md: 4 } }}>
              <CardContent sx={{ p: { xs: 1, md: 2 } }}>
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  events={calendarEvents}
                  eventClick={handleEventClick}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,dayGridWeek',
                  }}
                  locale="ko"
                  height={{ xs: 400, sm: 450, md: 500 } as any}
                  contentHeight={{ xs: 350, sm: 400, md: 450 } as any}
                  buttonText={{
                    today: '오늘',
                    month: '월',
                    week: '주',
                  }}
                />
              </CardContent>
            </Card>

            {/* 업무 목록 */}
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* 예정 */}
              <Grid item xs={12} md={4}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', md: '1.25rem' } }}>예정</Typography>
                      <Badge badgeContent={getTasksByStatus('Todo').length} color="primary" />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {getTasksByStatus('Todo').map((task) => (
                        <Card 
                          key={task.id} 
                          variant="outlined" 
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { boxShadow: 2 },
                          }}
                          onClick={() => router.push(`/tasks/${task.id}`)}
                        >
                          <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                              {task.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                              {task.due_date}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* 진행중 */}
              <Grid item xs={12} md={4}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', md: '1.25rem' } }}>진행중</Typography>
                      <Badge badgeContent={getTasksByStatus('Doing').length} color="warning" />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {getTasksByStatus('Doing').map((task) => (
                        <Card 
                          key={task.id} 
                          variant="outlined" 
                          sx={{ 
                            cursor: 'pointer',
                            borderColor: 'warning.main',
                            '&:hover': { boxShadow: 2 },
                          }}
                          onClick={() => router.push(`/tasks/${task.id}`)}
                        >
                          <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                              {task.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                              {task.due_date}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* 완료 */}
              <Grid item xs={12} md={4}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', md: '1.25rem' } }}>완료</Typography>
                      <Badge badgeContent={getTasksByStatus('Done').length} color="success" />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {getTasksByStatus('Done').map((task) => (
                        <Card 
                          key={task.id} 
                          variant="outlined" 
                          sx={{ 
                            cursor: 'pointer',
                            borderColor: 'success.main',
                            '&:hover': { boxShadow: 2 },
                          }}
                          onClick={() => router.push(`/tasks/${task.id}`)}
                        >
                          <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                              {task.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                              {task.due_date}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>

      {/* 새 업무 등록 모달 */}
      <Dialog open={showNewTaskModal} onClose={() => setShowNewTaskModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>새 업무 등록</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="업무 제목"
              fullWidth
              required
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <TextField
              label="카테고리"
              select
              fullWidth
              required
              value={newTask.category}
              onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
            >
              <MenuItem value="기획">기획</MenuItem>
              <MenuItem value="디자인">디자인</MenuItem>
              <MenuItem value="영상">영상</MenuItem>
              <MenuItem value="3D MAX">3D MAX</MenuItem>
              <MenuItem value="맵작업">맵작업</MenuItem>
              <MenuItem value="시설점검">시설점검</MenuItem>
            </TextField>
            <TextField
              label="요청 부서"
              fullWidth
              value={newTask.requester_dept}
              onChange={(e) => setNewTask({ ...newTask, requester_dept: e.target.value })}
            />
            <TextField
              label="요청자"
              fullWidth
              value={newTask.requester_name}
              onChange={(e) => setNewTask({ ...newTask, requester_name: e.target.value })}
            />
            <TextField
              label="설명"
              fullWidth
              multiline
              rows={3}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <TextField
              label="마감일"
              type="date"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={newTask.due_date}
              onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewTaskModal(false)}>취소</Button>
          <Button 
            onClick={handleCreateTask} 
            variant="contained" 
            disabled={creatingTask}
            sx={{
              background: 'linear-gradient(135deg, #0081C0 0%, #005A8D 100%)',
            }}
          >
            {creatingTask ? '등록 중...' : '등록'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
