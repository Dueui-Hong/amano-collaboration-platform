/**
 * 업무 상세 페이지 (Material Design)
 * - 업무 모든 정보 표시
 * - 상태 변경 (관리자/배정된 팀원만)
 * - 이미지 업로드 (배정된 팀원만)
 * - 이미지 갤러리 표시
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase, Task, Profile } from '@/lib/supabase';
import Header from '@/components/Header';

// Material-UI Imports
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import CategoryIcon from '@mui/icons-material/Category';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params?.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [assignee, setAssignee] = useState<Profile | null>(null);
  const [userInfo, setUserInfo] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (taskId) {
      fetchTaskDetail();
    }
  }, [taskId]);

  const fetchTaskDetail = async () => {
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

      // 업무 조회
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError;
      if (!taskData) throw new Error('업무를 찾을 수 없습니다.');

      setTask(taskData);

      // 배정된 팀원 정보 조회
      if (taskData.assignee_id) {
        const { data: assigneeData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', taskData.assignee_id)
          .single();

        if (assigneeData) {
          setAssignee(assigneeData);
        }
      }
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      showSnackbar('업무 정보를 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (status: 'Todo' | 'Doing' | 'Done') => {
    if (!task || !userInfo) return;

    // 권한 확인: 관리자 또는 배정된 팀원만 변경 가능
    if (userInfo.role !== 'admin' && task.assignee_id !== userInfo.id) {
      showSnackbar('권한이 없습니다.', 'error');
      return;
    }

    try {
      const updateData: Partial<Task> = { status };

      // Done으로 변경 시 완료 시각 기록
      if (status === 'Done') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', task.id);

      if (error) throw error;

      showSnackbar(`상태가 '${status}'로 변경되었습니다!`, 'success');
      fetchTaskDetail();
    } catch (error) {
      console.error('상태 변경 실패:', error);
      showSnackbar('상태 변경에 실패했습니다.', 'error');
    }
  };

  const uploadResultImage = async (file: File) => {
    if (!task || !userInfo) return;

    // 권한 확인: 배정된 팀원만 업로드 가능
    if (task.assignee_id !== userInfo.id) {
      showSnackbar('배정된 팀원만 결과물을 업로드할 수 있습니다.', 'error');
      return;
    }

    setUploading(true);

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
      const newImageUrls = [...(task.image_urls || []), data.publicUrl];

      const { error: updateError } = await supabase
        .from('tasks')
        .update({ image_urls: newImageUrls })
        .eq('id', task.id);

      if (updateError) throw updateError;

      showSnackbar('결과물 이미지가 업로드되었습니다!', 'success');
      fetchTaskDetail();
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      showSnackbar('이미지 업로드에 실패했습니다.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      uploadResultImage(e.target.files[0]);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleBack = () => {
    if (userInfo?.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const getStatusColor = (status: string): 'default' | 'warning' | 'info' | 'success' => {
    switch (status) {
      case 'Todo': return 'warning';
      case 'Doing': return 'info';
      case 'Done': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Todo': return <AssignmentIcon />;
      case 'Doing': return <PlayCircleIcon />;
      case 'Done': return <CheckCircleIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const getDaysUntilDue = (dueDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getUrgencyAlert = (dueDate: string, status: string) => {
    if (status === 'Done') return null;

    const days = getDaysUntilDue(dueDate);
    if (days < 0) {
      return <Alert severity="error">⚠️ 마감일이 지났습니다! ({Math.abs(days)}일 지연)</Alert>;
    }
    if (days === 0) {
      return <Alert severity="error">🔥 오늘이 마감일입니다!</Alert>;
    }
    if (days === 1) {
      return <Alert severity="warning">⚠️ 내일이 마감일입니다!</Alert>;
    }
    if (days <= 3) {
      return <Alert severity="warning">⏰ 마감일까지 {days}일 남았습니다 (D-{days})</Alert>;
    }
    return null;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!task || !userInfo) {
    return null;
  }

  const canEdit = userInfo.role === 'admin' || task.assignee_id === userInfo.id;
  const canUpload = task.assignee_id === userInfo.id;

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8f0f7 50%, #d5e5f2 100%)',
      }}
    >
      <Header userName={userInfo.name} userRole={userInfo.role} userEmail={userInfo.email} />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 뒤로가기 버튼 */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 3 }}
        >
          돌아가기
        </Button>

        {/* 업무 제목 & 상태 */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {task.title}
            </Typography>
            <Chip
              icon={getStatusIcon(task.status)}
              label={task.status}
              color={getStatusColor(task.status)}
              size="medium"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            업무 ID: {task.id}
          </Typography>
        </Box>

        {/* 긴급도 알림 */}
        {getUrgencyAlert(task.due_date, task.status)}

        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* 왼쪽: 업무 정보 */}
          <Grid item xs={12} md={8}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon /> 업무 정보
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* 카테고리 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CategoryIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">카테고리</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{task.category}</Typography>
                    </Box>
                  </Box>

                  {/* 요청 부서 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <BusinessIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">요청 부서</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{task.requester_dept}</Typography>
                    </Box>
                  </Box>

                  {/* 담당자 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PersonIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">담당자</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{task.requester_name}</Typography>
                    </Box>
                  </Box>

                  {/* 마감일 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EventIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">마감일</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date(task.due_date).toLocaleDateString('ko-KR', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          weekday: 'short'
                        })}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 배정된 팀원 */}
                  {assignee && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PersonIcon color="primary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">배정된 팀원</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {assignee.name} ({assignee.position})
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* 완료 시각 */}
                  {task.completed_at && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <AccessTimeIcon color="success" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">완료 시각</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {new Date(task.completed_at).toLocaleString('ko-KR')}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* 상세내용 */}
                  {task.description && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                          상세내용
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {task.description}
                          </Typography>
                        </Paper>
                      </Box>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* 이미지 갤러리 */}
            {task.image_urls && task.image_urls.length > 0 && (
              <Card elevation={3} sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ImageIcon /> 첨부 이미지 ({task.image_urls.length}개)
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <ImageList cols={3} gap={8}>
                    {task.image_urls.map((url, index) => (
                      <ImageListItem key={index} sx={{ cursor: 'pointer' }} onClick={() => setSelectedImage(url)}>
                        <img
                          src={url}
                          alt={`업무 이미지 ${index + 1}`}
                          loading="lazy"
                          style={{ borderRadius: 8, objectFit: 'cover', height: 200 }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* 오른쪽: 액션 */}
          <Grid item xs={12} md={4}>
            {/* 상태 변경 */}
            {canEdit && (
              <Card elevation={3} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EditIcon /> 상태 변경
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant={task.status === 'Todo' ? 'contained' : 'outlined'}
                      color="warning"
                      startIcon={<AssignmentIcon />}
                      onClick={() => updateTaskStatus('Todo')}
                      fullWidth
                    >
                      예정 (Todo)
                    </Button>
                    <Button
                      variant={task.status === 'Doing' ? 'contained' : 'outlined'}
                      color="info"
                      startIcon={<PlayCircleIcon />}
                      onClick={() => updateTaskStatus('Doing')}
                      fullWidth
                    >
                      진행중 (Doing)
                    </Button>
                    <Button
                      variant={task.status === 'Done' ? 'contained' : 'outlined'}
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => updateTaskStatus('Done')}
                      fullWidth
                    >
                      완료 (Done)
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* 이미지 업로드 */}
            {canUpload && (
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <UploadFileIcon /> 결과물 업로드
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadFileIcon />}
                    disabled={uploading}
                    fullWidth
                  >
                    {uploading ? '업로드 중...' : '이미지 선택'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleFileChange}
                    />
                  </Button>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                    JPG, PNG, GIF 등 이미지 파일
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* 권한 안내 */}
            {!canEdit && (
              <Alert severity="info" sx={{ mb: 3 }}>
                이 업무는 조회만 가능합니다.
              </Alert>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* 이미지 확대 보기 Dialog */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="확대 이미지"
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedImage(null)}>닫기</Button>
        </DialogActions>
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
