/**
 * 팀원 개인 캘린더 페이지 (Material Design)
 * FullCalendar로 업무 진행 상태 관리
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
// import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import Header from '@/components/Header';

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userInfo, setUserInfo] = useState<Profile | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingPPT, setGeneratingPPT] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

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

  const updateTaskStatus = async (status: 'Todo' | 'Doing' | 'Done') => {
    if (!selectedTask) return;

    try {
      const updateData: any = { status };

      // Done으로 변경 시 완료 시각 기록
      if (status === 'Done') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', selectedTask.id);

      if (error) throw error;

      showSnackbar(`상태가 '${status}'로 변경되었습니다!`, 'success');
      fetchUserAndTasks();
      setShowModal(false);
    } catch (error) {
      console.error('상태 변경 실패:', error);
      showSnackbar('상태 변경에 실패했습니다.', 'error');
    }
  };

  const uploadResultImage = async (file: File) => {
    if (!selectedTask) return;

    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `results/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('task-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('task-images').getPublicUrl(filePath);

      // 기존 이미지 URL에 추가
      const newImageUrls = [...(selectedTask.image_urls || []), data.publicUrl];

      const { error: updateError } = await supabase
        .from('tasks')
        .update({ image_urls: newImageUrls })
        .eq('id', selectedTask.id);

      if (updateError) throw updateError;

      showSnackbar('결과물 이미지가 업로드되었습니다!', 'success');
      fetchUserAndTasks();
      setShowModal(false);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      showSnackbar('이미지 업로드에 실패했습니다.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const generateWeeklyReport = async () => {
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
      const blob = new Blob([byteArray], { 
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.data.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showSnackbar(`주간보고서 PPT가 생성되었습니다! (${data.data.taskCount}개 업무 포함)`, 'success');
    } catch (error: any) {
      showSnackbar(error.message, 'error');
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

  // 새 업무 생성
  const createNewTask = async () => {
    if (!userInfo) return;

    // 필수 입력 검증
    if (!newTask.title || !newTask.category || !newTask.due_date) {
      showSnackbar('제목, 카테고리, 마감일은 필수 입력입니다.', 'error');
      return;
    }

    setCreatingTask(true);

    try {
      const { error } = await supabase.from('tasks').insert({
        title: newTask.title,
        category: newTask.category,
        requester_dept: newTask.requester_dept || userInfo.department || '기획홍보팀',
        requester_name: newTask.requester_name || userInfo.name,
        description: newTask.description,
        due_date: newTask.due_date,
        status: 'Todo',
        assignee_id: userInfo.id, // 본인에게 자동 배정
        image_urls: [],
      });

      if (error) throw error;

      showSnackbar('새 업무가 등록되었습니다!', 'success');
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
    } catch (error) {
      console.error('업무 생성 실패:', error);
      showSnackbar('업무 생성에 실패했습니다.', 'error');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleNewTaskChange = (field: string, value: string) => {
    setNewTask({ ...newTask, [field]: value });
  };

  // FullCalendar 이벤트 데이터 변환
  const calendarEvents = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    start: task.due_date,
    backgroundColor:
      task.status === 'Done'
        ? '#4caf50'
        : task.status === 'Doing'
        ? '#ff9800'
        : '#2196f3',
    borderColor:
      task.status === 'Done'
        ? '#388e3c'
        : task.status === 'Doing'
        ? '#f57c00'
        : '#1976d2',
  }));

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
      
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
        {/* 헤더 */}
        <Box sx={{ mb: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' } }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
              내 업무 캘린더
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
              캘린더에서 업무를 클릭하여 상태를 변경하세요
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                  boxShadow: '0 6px 16px rgba(0, 129, 192, 0.4)',
                }
              }}
            >
              새 업무 등록
            </Button>
            <Button
              variant="outlined"
              startIcon={<DescriptionIcon />}
              onClick={() => router.push('/board')}
              sx={{
                borderColor: '#14B8A6',
                color: '#14B8A6',
                fontWeight: 600,
                px: { xs: 2, md: 3 },
                py: { xs: 1, md: 1.5 },
                fontSize: { xs: '0.875rem', md: '1rem' },
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#0F766E',
                  bgcolor: 'rgba(20, 184, 166, 0.05)',
                }
              }}
            >
              자료 게시판
            </Button>
          </Box>
        </Box>

        {/* 통계 카드 */}
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 4 } }}>
          <Grid item xs={4} sm={4}>
            <Card elevation={2}>
              <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>예정</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 600, color: 'primary.main', fontSize: { xs: '1.75rem', md: '3rem' } }}>
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
                    <Typography variant="h3" sx={{ fontWeight: 600, color: 'warning.main', fontSize: { xs: '1.75rem', md: '3rem' } }}>
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
                    <Typography variant="h3" sx={{ fontWeight: 600, color: 'success.main', fontSize: { xs: '1.75rem', md: '3rem' } }}>
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
              height="auto"
              contentHeight={450}
            />
          </CardContent>
        </Card>

        {/* 업무 목록 */}
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Todo */}
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AssignmentIcon color="primary" sx={{ fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                    예정
                  </Typography>
                  <Badge badgeContent={getTasksByStatus('Todo').length} color="primary" sx={{ ml: 'auto' }} />
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {getTasksByStatus('Todo').map((task) => (
                    <Card
                      key={task.id}
                      variant="outlined"
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                      onClick={() => router.push(`/tasks/${task.id}`)}
                    >
                      <CardContent sx={{ py: { xs: 1, md: 1.5 }, '&:last-child': { pb: { xs: 1, md: 1.5 } } }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: { xs: '0.875rem', md: '0.875rem' } }}>
                          {task.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.75rem' } }}>
                          {task.category} • {new Date(task.due_date).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                  {getTasksByStatus('Todo').length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      예정된 업무가 없습니다
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Doing */}
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PlayCircleIcon color="warning" sx={{ fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                    진행중
                  </Typography>
                  <Badge badgeContent={getTasksByStatus('Doing').length} color="warning" sx={{ ml: 'auto' }} />
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {getTasksByStatus('Doing').map((task) => (
                    <Card
                      key={task.id}
                      variant="outlined"
                      sx={{ cursor: 'pointer', bgcolor: 'warning.50', '&:hover': { bgcolor: 'warning.100' } }}
                      onClick={() => router.push(`/tasks/${task.id}`)}
                    >
                      <CardContent sx={{ py: { xs: 1, md: 1.5 }, '&:last-child': { pb: { xs: 1, md: 1.5 } } }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: { xs: '0.875rem', md: '0.875rem' } }}>
                          {task.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.75rem' } }}>
                          {task.category} • {new Date(task.due_date).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                  {getTasksByStatus('Doing').length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      진행중인 업무가 없습니다
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Done */}
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CheckCircleIcon color="success" sx={{ fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                    완료
                  </Typography>
                  <Badge badgeContent={getTasksByStatus('Done').length} color="success" sx={{ ml: 'auto' }} />
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {getTasksByStatus('Done').map((task) => (
                    <Card
                      key={task.id}
                      variant="outlined"
                      sx={{ cursor: 'pointer', bgcolor: 'success.50', '&:hover': { bgcolor: 'success.100' } }}
                      onClick={() => router.push(`/tasks/${task.id}`)}
                    >
                      <CardContent sx={{ py: { xs: 1, md: 1.5 }, '&:last-child': { pb: { xs: 1, md: 1.5 } } }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: { xs: '0.875rem', md: '0.875rem' } }}>
                          {task.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.75rem' } }}>
                          {task.category} • {new Date(task.due_date).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                  {getTasksByStatus('Done').length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      완료된 업무가 없습니다
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* 주간보고서 작성 FAB */}
      <Fab
        color="primary"
        aria-label="주간보고서 작성"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
        onClick={generateWeeklyReport}
        disabled={generatingPPT}
      >
        {generatingPPT ? <CircularProgress size={24} color="inherit" /> : <DescriptionIcon />}
      </Fab>

      {/* 새 업무 등록 모달 */}
      <Dialog open={showNewTaskModal} onClose={() => setShowNewTaskModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            새 업무 등록
          </Typography>
          <Typography variant="caption" color="text.secondary">
            본인에게 배정되는 업무를 등록합니다
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField
              label="업무 제목"
              required
              fullWidth
              value={newTask.title}
              onChange={(e) => handleNewTaskChange('title', e.target.value)}
              placeholder="예: 홈페이지 배너 디자인"
            />
            
            <TextField
              label="카테고리"
              required
              select
              fullWidth
              value={newTask.category}
              onChange={(e) => handleNewTaskChange('category', e.target.value)}
            >
              <MenuItem value="디자인">디자인</MenuItem>
              <MenuItem value="기획">기획</MenuItem>
              <MenuItem value="홍보">홍보</MenuItem>
              <MenuItem value="콘텐츠">콘텐츠</MenuItem>
              <MenuItem value="영상">영상</MenuItem>
              <MenuItem value="행사">행사</MenuItem>
              <MenuItem value="기타">기타</MenuItem>
            </TextField>

            <TextField
              label="요청 부서"
              fullWidth
              value={newTask.requester_dept}
              onChange={(e) => handleNewTaskChange('requester_dept', e.target.value)}
              placeholder={`기본값: ${userInfo?.department || '기획홍보팀'}`}
              helperText="비워두면 본인 부서가 자동으로 입력됩니다"
            />

            <TextField
              label="담당자 이름"
              fullWidth
              value={newTask.requester_name}
              onChange={(e) => handleNewTaskChange('requester_name', e.target.value)}
              placeholder={`기본값: ${userInfo?.name}`}
              helperText="비워두면 본인 이름이 자동으로 입력됩니다"
            />

            <TextField
              label="마감일"
              required
              type="date"
              fullWidth
              value={newTask.due_date}
              onChange={(e) => handleNewTaskChange('due_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="업무 상세 내용"
              multiline
              rows={4}
              fullWidth
              value={newTask.description}
              onChange={(e) => handleNewTaskChange('description', e.target.value)}
              placeholder="업무에 대한 자세한 설명을 입력하세요"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => {
              setShowNewTaskModal(false);
              setNewTask({
                title: '',
                category: '',
                requester_dept: '',
                requester_name: '',
                description: '',
                due_date: '',
              });
            }}
            disabled={creatingTask}
          >
            취소
          </Button>
          <Button
            variant="contained"
            onClick={createNewTask}
            disabled={creatingTask}
            sx={{
              background: 'linear-gradient(135deg, #0081C0 0%, #005A8D 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #005A8D 0%, #004A70 100%)',
              }
            }}
          >
            {creatingTask ? <CircularProgress size={24} color="inherit" /> : '등록'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 업무 상세 모달 */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
        {selectedTask && (
          <>
            <DialogTitle>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {selectedTask.title}
              </Typography>
              <Chip
                label={selectedTask.status}
                color={getStatusColor(selectedTask.status) as any}
                size="small"
                sx={{ mt: 1 }}
              />
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">카테고리</Typography>
                  <Typography variant="body1">{selectedTask.category}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">요청 부서</Typography>
                  <Typography variant="body1">{selectedTask.requester_dept}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">담당자</Typography>
                  <Typography variant="body1">{selectedTask.requester_name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">마감일</Typography>
                  <Typography variant="body1">
                    {new Date(selectedTask.due_date).toLocaleDateString()}
                  </Typography>
                </Box>
                {selectedTask.description && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">상세내용</Typography>
                    <Typography variant="body1">{selectedTask.description}</Typography>
                  </Box>
                )}
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    상태 변경
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant={selectedTask.status === 'Todo' ? 'contained' : 'outlined'}
                      color="primary"
                      size="small"
                      onClick={() => updateTaskStatus('Todo')}
                    >
                      예정
                    </Button>
                    <Button
                      variant={selectedTask.status === 'Doing' ? 'contained' : 'outlined'}
                      color="warning"
                      size="small"
                      onClick={() => updateTaskStatus('Doing')}
                    >
                      진행중
                    </Button>
                    <Button
                      variant={selectedTask.status === 'Done' ? 'contained' : 'outlined'}
                      color="success"
                      size="small"
                      onClick={() => updateTaskStatus('Done')}
                    >
                      완료
                    </Button>
                  </Box>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    결과물 이미지 업로드
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadFileIcon />}
                    disabled={uploadingImage}
                    fullWidth
                  >
                    {uploadingImage ? '업로드 중...' : '파일 선택'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          uploadResultImage(e.target.files[0]);
                        }
                      }}
                    />
                  </Button>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowModal(false)}>닫기</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

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
