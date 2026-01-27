/**
 * 관리자 대시보드 - 개선된 레이아웃
 * - 좌측 사이드바 (호버 시 확장)
 * - 크게 개선된 카드 크기
 * - 업무 현황 / 업무 배정 탭
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { supabase, Task, Profile } from '@/lib/supabase';
import Header from '@/components/Header';
import { exportTasksToCSV } from '@/lib/csvExport';

// Material-UI Imports
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Badge from '@mui/material/Badge';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';

// Icons
import TodayIcon from '@mui/icons-material/Today';
import DateRangeIcon from '@mui/icons-material/DateRange';
import WarningIcon from '@mui/icons-material/Warning';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import DescriptionIcon from '@mui/icons-material/Description';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import DownloadIcon from '@mui/icons-material/Download';

interface Statistics {
  todayTasks: number;
  weekTasks: number;
  urgentTasks: number;
  totalTodo: number;
  totalDoing: number;
  totalDone: number;
}

interface MemberStatistics {
  todo: number;
  doing: number;
  done: number;
  todayTasks: Task[];
  urgentTasks: Task[];
  total: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [unassignedTasks, setUnassignedTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [memberTasks, setMemberTasks] = useState<{ [key: string]: Task[] }>({});
  const [loading, setLoading] = useState(true);
  const [generatingPPT, setGeneratingPPT] = useState(false);
  const [viewMode, setViewMode] = useState<number>(0); // 0: 업무 현황, 1: 업무 배정
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<Profile | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
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
        setUserInfo(profile);
      }

      const { data: unassigned } = await supabase
        .from('tasks')
        .select('*')
        .is('assignee_id', null)
        .order('due_date', { ascending: true });

      setUnassignedTasks(unassigned || []);

      const { data: memberList } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'member')
        .order('name');

      setMembers(memberList || []);

      if (memberList) {
        const tasksMap: { [key: string]: Task[] } = {};

        for (const member of memberList) {
          const { data: tasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('assignee_id', member.id)
            .order('due_date', { ascending: true });

          tasksMap[member.id] = tasks || [];
        }

        setMemberTasks(tasksMap);
      }
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      showSnackbar('데이터 조회에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    try {
      const taskId = draggableId;
      const newAssigneeId = destination.droppableId === 'unassigned' ? null : destination.droppableId;

      const { error } = await supabase
        .from('tasks')
        .update({
          assignee_id: newAssigneeId,
          status: newAssigneeId ? 'Todo' : 'Unassigned',
        })
        .eq('id', taskId);

      if (error) throw error;

      showSnackbar('업무가 배정되었습니다!', 'success');
      fetchData();
    } catch (error) {
      console.error('업무 배정 실패:', error);
      showSnackbar('업무 배정에 실패했습니다.', 'error');
    }
  };

  const generatePPT = async () => {
    setGeneratingPPT(true);
    try {
      const response = await fetch('/api/pptx/generate');
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'PPT 생성에 실패했습니다.');
      }

      const byteCharacters = atob(data.data.content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.data.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showSnackbar(`PPT가 생성되었습니다! (${data.data.taskCount}개 업무 포함)`, 'success');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      showSnackbar(errorMessage, 'error');
    } finally {
      setGeneratingPPT(false);
    }
  };

  const handleExportCSV = () => {
    const allTasks = [
      ...unassignedTasks,
      ...Object.values(memberTasks).flat(),
    ];
    exportTasksToCSV(allTasks, members);
    showSnackbar('CSV 파일이 다운로드되었습니다!', 'success');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTaskClick = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  const getStatistics = (): Statistics => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    let todayTasks = 0;
    let weekTasks = 0;
    let urgentTasks = 0;
    let totalTodo = 0;
    let totalDoing = 0;
    let totalDone = 0;

    const allTasks = [
      ...unassignedTasks,
      ...Object.values(memberTasks).flat(),
    ];

    allTasks.forEach(task => {
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate.getTime() === today.getTime()) {
        todayTasks++;
      }

      if (dueDate >= weekStart && dueDate <= weekEnd) {
        weekTasks++;
      }

      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff <= 3 && task.status !== 'Done') {
        urgentTasks++;
      }

      if (task.status === 'Todo' || task.status === 'Unassigned') totalTodo++;
      if (task.status === 'Doing') totalDoing++;
      if (task.status === 'Done') totalDone++;
    });

    return {
      todayTasks,
      weekTasks,
      urgentTasks,
      totalTodo,
      totalDoing,
      totalDone,
    };
  };

  const getMemberStatistics = (memberId: string): MemberStatistics => {
    const tasks = memberTasks[memberId] || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats: MemberStatistics = {
      todo: 0,
      doing: 0,
      done: 0,
      todayTasks: [],
      urgentTasks: [],
      total: tasks.length,
    };

    tasks.forEach(task => {
      if (task.status === 'Todo') stats.todo++;
      if (task.status === 'Doing') stats.doing++;
      if (task.status === 'Done') stats.done++;

      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate.getTime() === today.getTime() && task.status !== 'Done') {
        stats.todayTasks.push(task);
      }

      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 0 && daysDiff <= 3 && task.status !== 'Done') {
        stats.urgentTasks.push(task);
      }
    });

    return stats;
  };

  const getDaysUntilDue = (dueDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getUrgencyColor = (dueDate: string, status: string): string => {
    if (status === 'Done') return 'success';
    
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return 'error';
    if (days === 0) return 'error';
    if (days <= 3) return 'warning';
    
    if (status === 'Doing') return 'info';
    return 'default';
  };

  const getUrgencyLabel = (dueDate: string, status: string): string => {
    if (status === 'Done') return '완료';
    
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return '지연';
    if (days === 0) return '오늘';
    if (days === 1) return '내일';
    if (days <= 3) return `D-${days}`;
    return '';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!userInfo) {
    return null;
  }

  const stats = getStatistics();

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8f0f7 50%, #d5e5f2 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header userName={userInfo.name} userRole={userInfo.role} userEmail={userInfo.email} />
      
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* 좌측 사이드바 */}
        <Box
          onMouseEnter={() => setSidebarOpen(true)}
          onMouseLeave={() => setSidebarOpen(false)}
          sx={{
            width: sidebarOpen ? 240 : 80,
            transition: 'width 0.3s ease',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRight: '2px solid rgba(0, 129, 192, 0.15)',
            boxShadow: '4px 0 20px rgba(0, 129, 192, 0.1)',
            position: 'sticky',
            top: 64,
            height: 'calc(100vh - 64px)',
            overflow: 'hidden',
            zIndex: 10,
          }}
        >
          <List sx={{ pt: 3, px: 1 }}>
            <ListItem disablePadding>
              <ListItemButton
                selected={viewMode === 0}
                onClick={() => setViewMode(0)}
                sx={{
                  minHeight: 80,
                  px: 2.5,
                  py: 2.5,
                  justifyContent: sidebarOpen ? 'initial' : 'center',
                  borderRadius: 3,
                  mb: 2,
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #0081C0 0%, #005A8D 100%)',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(0, 129, 192, 0.3)',
                    '& .MuiListItemIcon-root': {
                      color: '#fff',
                    },
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0081C0 0%, #005A8D 100%)',
                    },
                  },
                  '&:hover': {
                    background: 'rgba(0, 129, 192, 0.1)',
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Tooltip title={!sidebarOpen ? "업무 현황" : ""} placement="right">
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: sidebarOpen ? 3 : 'auto',
                      justifyContent: 'center',
                      color: viewMode === 0 ? '#fff' : '#0081C0',
                    }}
                  >
                    <DashboardIcon sx={{ fontSize: 36 }} />
                  </ListItemIcon>
                </Tooltip>
                <ListItemText 
                  primary="업무 현황" 
                  primaryTypographyProps={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                  }}
                  sx={{ 
                    opacity: sidebarOpen ? 1 : 0,
                  }} 
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={viewMode === 1}
                onClick={() => setViewMode(1)}
                sx={{
                  minHeight: 80,
                  px: 2.5,
                  py: 2.5,
                  justifyContent: sidebarOpen ? 'initial' : 'center',
                  borderRadius: 3,
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #0081C0 0%, #005A8D 100%)',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(0, 129, 192, 0.3)',
                    '& .MuiListItemIcon-root': {
                      color: '#fff',
                    },
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0081C0 0%, #005A8D 100%)',
                    },
                  },
                  '&:hover': {
                    background: 'rgba(0, 129, 192, 0.1)',
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Tooltip title={!sidebarOpen ? "업무 배정" : ""} placement="right">
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: sidebarOpen ? 3 : 'auto',
                      justifyContent: 'center',
                      color: viewMode === 1 ? '#fff' : '#0081C0',
                    }}
                  >
                    <AssignmentTurnedInIcon sx={{ fontSize: 36 }} />
                  </ListItemIcon>
                </Tooltip>
                <ListItemText 
                  primary="업무 배정" 
                  primaryTypographyProps={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                  }}
                  sx={{ 
                    opacity: sidebarOpen ? 1 : 0,
                  }} 
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>

        {/* 메인 콘텐츠 */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* 헤더 */}
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5, color: '#003D5C' }}>
                {viewMode === 0 ? <DashboardIcon sx={{ fontSize: 32 }} /> : <AssignmentTurnedInIcon sx={{ fontSize: 32 }} />}
                {viewMode === 0 ? '업무 현황' : '업무 배정'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.95rem', ml: 6 }}>
                {viewMode === 0 ? '기획홍보팀 전체 업무 통계 및 팀원별 현황' : '드래그 앤 드롭으로 업무를 팀원에게 배정하세요'}
              </Typography>
            </Box>

            {viewMode === 0 ? (
              /* 업무 현황 탭 */
              <>
                {/* 전체 통계 카드 */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                  <Grid item xs={12} sm={6} md={2}>
                    <Card elevation={5} sx={{ height: '100%', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-8px)', boxShadow: 10 } }}>
                      <CardContent sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>오늘 마감</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                              {stats.todayTasks}
                            </Typography>
                          </Box>
                          <TodayIcon sx={{ fontSize: 50, color: 'primary.main', opacity: 0.3 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Card elevation={5} sx={{ height: '100%', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-8px)', boxShadow: 10 } }}>
                      <CardContent sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>이번주</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                              {stats.weekTasks}
                            </Typography>
                          </Box>
                          <DateRangeIcon sx={{ fontSize: 50, color: 'secondary.main', opacity: 0.3 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Card elevation={5} sx={{ height: '100%', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-8px)', boxShadow: 10 } }}>
                      <CardContent sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>긴급 (D-3)</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 700, color: 'error.main' }}>
                              {stats.urgentTasks}
                            </Typography>
                          </Box>
                          <WarningIcon sx={{ fontSize: 50, color: 'error.main', opacity: 0.3 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Card elevation={5} sx={{ height: '100%', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-8px)', boxShadow: 10 } }}>
                      <CardContent sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>예정</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                              {stats.totalTodo}
                            </Typography>
                          </Box>
                          <AssignmentIcon sx={{ fontSize: 50, color: 'warning.main', opacity: 0.3 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Card elevation={5} sx={{ height: '100%', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-8px)', boxShadow: 10 } }}>
                      <CardContent sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>진행중</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 700, color: 'info.main' }}>
                              {stats.totalDoing}
                            </Typography>
                          </Box>
                          <PlayCircleIcon sx={{ fontSize: 50, color: 'info.main', opacity: 0.3 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Card elevation={5} sx={{ height: '100%', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-8px)', boxShadow: 10 } }}>
                      <CardContent sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>완료</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                              {stats.totalDone}
                            </Typography>
                          </Box>
                          <CheckCircleIcon sx={{ fontSize: 50, color: 'success.main', opacity: 0.3 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* 팀원별 업무 현황 */}
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 4, color: '#003D5C', fontSize: '2rem' }}>
                  👥 팀원별 업무 현황
                </Typography>
                <Grid container spacing={4} sx={{ mb: 6 }}>
                  {members.map(member => {
                    const memberStats = getMemberStatistics(member.id);
                    return (
                      <Grid item xs={12} md={6} key={member.id}>
                        <Card elevation={5} sx={{ height: '100%', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-6px)', boxShadow: 12 } }}>
                          <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                              <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#0081C0' }}>
                                  {member.name}
                                </Typography>
                                <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                                  {member.position}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="h2" sx={{ fontWeight: 700, color: '#003D5C' }}>
                                  {memberStats.total}
                                </Typography>
                                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                                  전체 업무
                                </Typography>
                              </Box>
                            </Box>

                            {/* 상태별 통계 */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                              <Grid item xs={4}>
                                <Paper elevation={3} sx={{ p: 2.5, textAlign: 'center', bgcolor: 'warning.50', transition: 'all 0.2s ease', '&:hover': { transform: 'scale(1.08)', bgcolor: 'warning.100', boxShadow: 6 } }}>
                                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                                    {memberStats.todo}
                                  </Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 1 }}>예정</Typography>
                                </Paper>
                              </Grid>
                              <Grid item xs={4}>
                                <Paper elevation={3} sx={{ p: 2.5, textAlign: 'center', bgcolor: 'info.50', transition: 'all 0.2s ease', '&:hover': { transform: 'scale(1.08)', bgcolor: 'info.100', boxShadow: 6 } }}>
                                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'info.main' }}>
                                    {memberStats.doing}
                                  </Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 1 }}>진행중</Typography>
                                </Paper>
                              </Grid>
                              <Grid item xs={4}>
                                <Paper elevation={3} sx={{ p: 2.5, textAlign: 'center', bgcolor: 'success.50', transition: 'all 0.2s ease', '&:hover': { transform: 'scale(1.08)', bgcolor: 'success.100', boxShadow: 6 } }}>
                                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                                    {memberStats.done}
                                  </Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 1 }}>완료</Typography>
                                </Paper>
                              </Grid>
                            </Grid>

                            {/* 오늘 마감 업무 */}
                            {memberStats.todayTasks.length > 0 && (
                              <Alert severity="error" sx={{ mb: 2, py: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                                  🔥 오늘 마감 ({memberStats.todayTasks.length}개)
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                  {memberStats.todayTasks.map(task => (
                                    <Typography 
                                      key={task.id} 
                                      variant="body1" 
                                      display="block" 
                                      sx={{ 
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        py: 0.8,
                                        borderRadius: 1,
                                        px: 1,
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.05)', textDecoration: 'underline', fontWeight: 600 }
                                      }}
                                      onClick={() => handleTaskClick(task.id)}
                                    >
                                      • {task.title}
                                    </Typography>
                                  ))}
                                </Box>
                              </Alert>
                            )}

                            {/* 긴급 업무 */}
                            {memberStats.urgentTasks.length > 0 && (
                              <Alert severity="warning" sx={{ py: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                                  ⚠️ 긴급 (D-3) ({memberStats.urgentTasks.length}개)
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                  {memberStats.urgentTasks.map(task => (
                                    <Typography 
                                      key={task.id} 
                                      variant="body1" 
                                      display="block" 
                                      sx={{ 
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        py: 0.8,
                                        borderRadius: 1,
                                        px: 1,
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.05)', textDecoration: 'underline', fontWeight: 600 }
                                      }}
                                      onClick={() => handleTaskClick(task.id)}
                                    >
                                      • {task.title}
                                    </Typography>
                                  ))}
                                </Box>
                              </Alert>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                {/* 미배정 업무 */}
                {unassignedTasks.length > 0 && (
                  <>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 4, color: '#003D5C', fontSize: '2rem' }}>
                      📋 미배정 업무 ({unassignedTasks.length}개)
                    </Typography>
                    <Card elevation={5} sx={{ mb: 6 }}>
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {unassignedTasks.map(task => (
                            <Paper 
                              key={task.id} 
                              elevation={2} 
                              sx={{ 
                                p: 3,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': { bgcolor: 'action.hover', transform: 'translateX(8px)', boxShadow: 6 }
                              }}
                              onClick={() => handleTaskClick(task.id)}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                    {task.title}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip label={task.category} size="medium" color="primary" />
                                    <Chip label={task.requester_dept} size="medium" variant="outlined" />
                                    <Chip label={new Date(task.due_date).toLocaleDateString()} size="medium" />
                                  </Box>
                                </Box>
                                <Box>
                                  {getUrgencyLabel(task.due_date, task.status) && (
                                    <Chip
                                      label={getUrgencyLabel(task.due_date, task.status)}
                                      color={getUrgencyColor(task.due_date, task.status) as any}
                                      sx={{ height: 36, fontSize: '1rem', fontWeight: 700 }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            </Paper>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </>
                )}
              </>
            ) : (
              /* 업무 배정 탭 (Drag & Drop) */
              <DragDropContext onDragEnd={onDragEnd}>
                <Grid container spacing={3}>
                  {/* 미배정 업무 */}
                  <Grid item xs={12} md={4}>
                    <Card elevation={5} sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#0081C0', mb: 3 }}>
                          📥 미배정 업무
                          <Badge badgeContent={unassignedTasks.length} color="error" sx={{ ml: 2 }} />
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Droppable droppableId="unassigned">
                          {(provided, snapshot) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              sx={{
                                minHeight: 600,
                                bgcolor: snapshot.isDraggingOver ? 'action.hover' : 'transparent',
                                borderRadius: 2,
                                p: 1.5,
                              }}
                            >
                              {unassignedTasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided, snapshot) => (
                                    <Paper
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      elevation={snapshot.isDragging ? 10 : 3}
                                      sx={{
                                        p: 2.5,
                                        mb: 2,
                                        cursor: 'grab',
                                        transition: 'all 0.2s ease',
                                        '&:hover': { boxShadow: 6, transform: 'translateX(6px)' },
                                        '&:active': { cursor: 'grabbing' },
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTaskClick(task.id);
                                      }}
                                    >
                                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                        {task.title}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                                        {task.category}
                                      </Typography>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                                          {new Date(task.due_date).toLocaleDateString()}
                                        </Typography>
                                        {getUrgencyLabel(task.due_date, task.status) && (
                                          <Chip
                                            label={getUrgencyLabel(task.due_date, task.status)}
                                            color={getUrgencyColor(task.due_date, task.status) as any}
                                            size="small"
                                            sx={{ height: 24, fontSize: '0.8rem', fontWeight: 600 }}
                                          />
                                        )}
                                      </Box>
                                    </Paper>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </Box>
                          )}
                        </Droppable>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* 팀원별 업무 */}
                  {members.map(member => {
                    const tasks = memberTasks[member.id] || [];
                    const memberStats = getMemberStatistics(member.id);
                    
                    return (
                      <Grid item xs={12} md={4} key={member.id}>
                        <Card elevation={5} sx={{ height: '100%' }}>
                          <CardContent sx={{ p: 3 }}>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#0081C0' }}>
                              {member.name}
                              <Badge badgeContent={tasks.length} color="primary" sx={{ ml: 2 }} />
                            </Typography>
                            <Typography variant="body1" color="text.secondary" display="block" sx={{ mb: 2 }}>
                              {member.position}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                              <Chip label={`Todo: ${memberStats.todo}`} size="medium" color="warning" sx={{ fontWeight: 600, fontSize: '0.9rem' }} />
                              <Chip label={`Doing: ${memberStats.doing}`} size="medium" color="info" sx={{ fontWeight: 600, fontSize: '0.9rem' }} />
                              <Chip label={`Done: ${memberStats.done}`} size="medium" color="success" sx={{ fontWeight: 600, fontSize: '0.9rem' }} />
                            </Box>
                            <Divider sx={{ mb: 3 }} />
                            <Droppable droppableId={member.id}>
                              {(provided, snapshot) => (
                                <Box
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  sx={{
                                    minHeight: 600,
                                    bgcolor: snapshot.isDraggingOver ? 'success.50' : 'transparent',
                                    borderRadius: 2,
                                    p: 1.5,
                                  }}
                                >
                                  {tasks.map((task, index) => (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                      {(provided, snapshot) => (
                                        <Paper
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          elevation={snapshot.isDragging ? 10 : 3}
                                          sx={{
                                            p: 2.5,
                                            mb: 2,
                                            cursor: 'grab',
                                            bgcolor: 
                                              task.status === 'Done' ? 'success.50' :
                                              task.status === 'Doing' ? 'info.50' : 'transparent',
                                            transition: 'all 0.2s ease',
                                            '&:hover': { boxShadow: 6, transform: 'translateX(6px)' },
                                            '&:active': { cursor: 'grabbing' },
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleTaskClick(task.id);
                                          }}
                                        >
                                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                            {task.title}
                                          </Typography>
                                          <Typography variant="body2" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                                            {task.category} | {task.status}
                                          </Typography>
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                                              {new Date(task.due_date).toLocaleDateString()}
                                            </Typography>
                                            {getUrgencyLabel(task.due_date, task.status) && (
                                              <Chip
                                                label={getUrgencyLabel(task.due_date, task.status)}
                                                color={getUrgencyColor(task.due_date, task.status) as any}
                                                size="small"
                                                sx={{ height: 24, fontSize: '0.8rem', fontWeight: 600 }}
                                              />
                                            )}
                                          </Box>
                                        </Paper>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </Box>
                              )}
                            </Droppable>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </DragDropContext>
            )}

            {/* 하단 버튼 */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 6, pb: 4 }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={fetchData}
                size="large"
                sx={{ 
                  px: 5, 
                  py: 2, 
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #0081C0 0%, #005A8D 100%)',
                  boxShadow: '0 4px 12px rgba(0, 129, 192, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #005A8D 0%, #003D5C 100%)',
                    transform: 'translateY(-4px)',
                    boxShadow: 8,
                  },
                }}
              >
                새로고침
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={generatingPPT ? <CircularProgress size={24} color="inherit" /> : <DescriptionIcon />}
                onClick={generatePPT}
                disabled={generatingPPT}
                size="large"
                sx={{ 
                  px: 5, 
                  py: 2, 
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 8,
                  },
                }}
              >
                {generatingPPT ? 'PPT 생성 중...' : '주간보고서 PPT 생성'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportCSV}
                size="large"
                sx={{ 
                  px: 5, 
                  py: 2, 
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderColor: '#10B981',
                  color: '#10B981',
                  '&:hover': {
                    borderColor: '#059669',
                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                CSV 내보내기
              </Button>
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', fontSize: '1rem' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
