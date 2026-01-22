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
import AssignmentIcon from '@mui/icons-material/Assignment';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
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
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* 헤더 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            내 업무 캘린더
          </Typography>
          <Typography variant="body1" color="text.secondary">
            캘린더에서 업무를 클릭하여 상태를 변경하세요
          </Typography>
        </Box>

        {/* 통계 카드 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">예정</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {getTasksByStatus('Todo').length}
                    </Typography>
                  </Box>
                  <AssignmentIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">진행중</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 600, color: 'warning.main' }}>
                      {getTasksByStatus('Doing').length}
                    </Typography>
                  </Box>
                  <PlayCircleIcon sx={{ fontSize: 48, color: 'warning.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">완료</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 600, color: 'success.main' }}>
                      {getTasksByStatus('Done').length}
                    </Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 캘린더 */}
        <Card elevation={2} sx={{ mb: 4 }}>
          <CardContent>
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
            />
          </CardContent>
        </Card>

        {/* 업무 목록 */}
        <Grid container spacing={3}>
          {/* Todo */}
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AssignmentIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {task.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
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
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PlayCircleIcon color="warning" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {task.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
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
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {task.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
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
