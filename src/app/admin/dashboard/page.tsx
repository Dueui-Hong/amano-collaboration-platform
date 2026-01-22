/**
 * 관리자 대시보드 (Material Design 완전 재작성)
 * - 오늘/이번주 업무 통계
 * - 팀원별 업무 현황 요약
 * - Drag & Drop 업무 배정
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { supabase, Task, Profile } from '@/lib/supabase';
import Header from '@/components/Header';

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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Badge from '@mui/material/Badge';
// import Fab from '@mui/material/Fab';

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
      // 사용자 인증 확인
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

      // 미배정 업무 조회
      const { data: unassigned } = await supabase
        .from('tasks')
        .select('*')
        .is('assignee_id', null)
        .order('due_date', { ascending: true });

      setUnassignedTasks(unassigned || []);

      // 팀원 목록 조회
      const { data: memberList } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'member')
        .order('name');

      setMembers(memberList || []);

      // 각 팀원의 업무 조회
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

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 통계 계산
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

    Object.values(memberTasks).forEach(tasks => {
      tasks.forEach(task => {
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate.getTime() === today.getTime()) {
          todayTasks++;
        }

        if (dueDate >= weekStart && dueDate <= weekEnd) {
          weekTasks++;
        }

        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue >= 0 && daysUntilDue <= 3 && task.status !== 'Done') {
          urgentTasks++;
        }

        if (task.status === 'Todo') totalTodo++;
        if (task.status === 'Doing') totalDoing++;
        if (task.status === 'Done') totalDone++;
      });
    });

    return { todayTasks, weekTasks, urgentTasks, totalTodo, totalDoing, totalDone };
  };

  const getMemberStatistics = (memberId: string): MemberStatistics => {
    const tasks = memberTasks[memberId] || [];
    const todo = tasks.filter(t => t.status === 'Todo').length;
    const doing = tasks.filter(t => t.status === 'Doing').length;
    const done = tasks.filter(t => t.status === 'Done').length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTasks = tasks.filter(t => {
      const dueDate = new Date(t.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime() && t.status !== 'Done';
    });

    const urgentTasks = tasks.filter(t => {
      const dueDate = new Date(t.due_date);
      const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 3 && t.status !== 'Done';
    });

    return { todo, doing, done, todayTasks, urgentTasks, total: tasks.length };
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header userName={userInfo.name} userRole={userInfo.role} userEmail={userInfo.email} />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* 헤더 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <DashboardIcon sx={{ fontSize: 40 }} />
            관리자 대시보드
          </Typography>
          <Typography variant="body1" color="text.secondary">
            기획홍보팀 업무 현황 및 배정 관리
          </Typography>
        </Box>

        {/* 탭 */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={viewMode} onChange={(e, newValue) => setViewMode(newValue)} centered>
            <Tab label="📊 업무 현황" icon={<DashboardIcon />} iconPosition="start" />
            <Tab label="📋 업무 배정" icon={<AssignmentTurnedInIcon />} iconPosition="start" />
          </Tabs>
        </Paper>

        {viewMode === 0 ? (
          /* 업무 현황 탭 */
          <>
            {/* 전체 통계 카드 */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={2}>
                <Card elevation={3}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">오늘 마감</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {stats.todayTasks}
                        </Typography>
                      </Box>
                      <TodayIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card elevation={3}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">이번주</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                          {stats.weekTasks}
                        </Typography>
                      </Box>
                      <DateRangeIcon sx={{ fontSize: 40, color: 'secondary.main', opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card elevation={3}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">긴급 (D-3)</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                          {stats.urgentTasks}
                        </Typography>
                      </Box>
                      <WarningIcon sx={{ fontSize: 40, color: 'error.main', opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card elevation={3}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">예정</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                          {stats.totalTodo}
                        </Typography>
                      </Box>
                      <AssignmentIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card elevation={3}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">진행중</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600, color: 'info.main' }}>
                          {stats.totalDoing}
                        </Typography>
                      </Box>
                      <PlayCircleIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card elevation={3}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">완료</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                          {stats.totalDone}
                        </Typography>
                      </Box>
                      <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* 팀원별 업무 현황 */}
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              팀원별 업무 현황
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {members.map(member => {
                const memberStats = getMemberStatistics(member.id);
                return (
                  <Grid item xs={12} md={4} key={member.id}>
                    <Card elevation={3}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {member.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {member.position}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h4" sx={{ fontWeight: 600 }}>
                              {memberStats.total}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              전체 업무
                            </Typography>
                          </Box>
                        </Box>

                        {/* 상태별 통계 */}
                        <Grid container spacing={1} sx={{ mb: 2 }}>
                          <Grid item xs={4}>
                            <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'warning.50' }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: 'warning.main' }}>
                                {memberStats.todo}
                              </Typography>
                              <Typography variant="caption">예정</Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={4}>
                            <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'info.50' }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.main' }}>
                                {memberStats.doing}
                              </Typography>
                              <Typography variant="caption">진행중</Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={4}>
                            <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'success.50' }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                                {memberStats.done}
                              </Typography>
                              <Typography variant="caption">완료</Typography>
                            </Paper>
                          </Grid>
                        </Grid>

                        {/* 오늘 마감 업무 */}
                        {memberStats.todayTasks.length > 0 && (
                          <Alert severity="error" sx={{ mb: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              🔥 오늘 마감 ({memberStats.todayTasks.length}개)
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              {memberStats.todayTasks.map(task => (
                                <Typography key={task.id} variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                                  • {task.title}
                                </Typography>
                              ))}
                            </Box>
                          </Alert>
                        )}

                        {/* 긴급 업무 */}
                        {memberStats.urgentTasks.length > 0 && (
                          <Alert severity="warning">
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              ⚠️ 긴급 (D-3) ({memberStats.urgentTasks.length}개)
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              {memberStats.urgentTasks.map(task => (
                                <Typography key={task.id} variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
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
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  미배정 업무 ({unassignedTasks.length}개)
                </Typography>
                <Card elevation={3} sx={{ mb: 4 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {unassignedTasks.map(task => (
                        <Paper key={task.id} variant="outlined" sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {task.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {task.category} | {task.requester_dept}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption">
                                {new Date(task.due_date).toLocaleDateString()}
                              </Typography>
                              {getUrgencyLabel(task.due_date, task.status) && (
                                <Chip
                                  label={getUrgencyLabel(task.due_date, task.status)}
                                  color={getUrgencyColor(task.due_date, task.status) as any}
                                  size="small"
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
            <Grid container spacing={2}>
              {/* 미배정 업무 */}
              <Grid item xs={12} md={3}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      미배정 업무
                      <Badge badgeContent={unassignedTasks.length} color="error" sx={{ ml: 2 }} />
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Droppable droppableId="unassigned">
                      {(provided, snapshot) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          sx={{
                            minHeight: 400,
                            bgcolor: snapshot.isDraggingOver ? 'action.hover' : 'transparent',
                            borderRadius: 1,
                            p: 1,
                          }}
                        >
                          {unassignedTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <Paper
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  elevation={snapshot.isDragging ? 6 : 1}
                                  sx={{
                                    p: 1.5,
                                    mb: 1,
                                    cursor: 'grab',
                                    '&:active': { cursor: 'grabbing' },
                                  }}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                                    {task.title}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    {task.category}
                                  </Typography>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                    <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                      {new Date(task.due_date).toLocaleDateString()}
                                    </Typography>
                                    {getUrgencyLabel(task.due_date, task.status) && (
                                      <Chip
                                        label={getUrgencyLabel(task.due_date, task.status)}
                                        color={getUrgencyColor(task.due_date, task.status) as any}
                                        size="small"
                                        sx={{ height: 18, fontSize: '0.65rem' }}
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
                  <Grid item xs={12} md={3} key={member.id}>
                    <Card elevation={3}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: '1rem' }}>
                          {member.name}
                          <Badge badgeContent={tasks.length} color="primary" sx={{ ml: 2 }} />
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                          {member.position}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                          <Chip label={`Todo: ${memberStats.todo}`} size="small" color="warning" />
                          <Chip label={`Doing: ${memberStats.doing}`} size="small" color="info" />
                          <Chip label={`Done: ${memberStats.done}`} size="small" color="success" />
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Droppable droppableId={member.id}>
                          {(provided, snapshot) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              sx={{
                                minHeight: 400,
                                bgcolor: snapshot.isDraggingOver ? 'success.50' : 'transparent',
                                borderRadius: 1,
                                p: 1,
                              }}
                            >
                              {tasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided, snapshot) => (
                                    <Paper
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      elevation={snapshot.isDragging ? 6 : 1}
                                      sx={{
                                        p: 1.5,
                                        mb: 1,
                                        cursor: 'grab',
                                        bgcolor: 
                                          task.status === 'Done' ? 'success.50' :
                                          task.status === 'Doing' ? 'info.50' : 'transparent',
                                        '&:active': { cursor: 'grabbing' },
                                      }}
                                    >
                                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                                        {task.title}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        {task.category} | {task.status}
                                      </Typography>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                          {new Date(task.due_date).toLocaleDateString()}
                                        </Typography>
                                        {getUrgencyLabel(task.due_date, task.status) && (
                                          <Chip
                                            label={getUrgencyLabel(task.due_date, task.status)}
                                            color={getUrgencyColor(task.due_date, task.status) as any}
                                            size="small"
                                            sx={{ height: 18, fontSize: '0.65rem' }}
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
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            size="large"
          >
            새로고침
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={generatingPPT ? <CircularProgress size={20} color="inherit" /> : <DescriptionIcon />}
            onClick={generatePPT}
            disabled={generatingPPT}
            size="large"
          >
            {generatingPPT ? 'PPT 생성 중...' : '주간보고서 PPT 생성'}
          </Button>
        </Box>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
