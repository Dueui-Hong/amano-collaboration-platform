/**
 * 업무 상세 페이지 - Fluent Design 2.0
 * - 업무 모든 정보 표시
 * - 상태 변경 (관리자/배정된 팀원만)
 * - 이미지 업로드 (배정된 팀원만)
 * - 이미지 갤러리 표시
 * - Neumorphism Level 4, Glassmorphism Level 2
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase, Task, Profile } from '@/lib/supabase';
import Header from '@/components/Header';
import { fluentColors, fluentShadows, fluentRadius } from '@/styles/fluent';

// Material-UI Components (최소한만 사용)
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import FireIcon from '@mui/icons-material/LocalFireDepartment';

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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchTaskDetail();
    }
  }, [taskId]);

  const fetchTaskDetail = async () => {
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

      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError;
      if (!taskData) throw new Error('업무를 찾을 수 없습니다.');

      setTask(taskData);

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

    if (userInfo.role !== 'admin' && task.assignee_id !== userInfo.id) {
      showSnackbar('권한이 없습니다.', 'error');
      return;
    }

    try {
      const updateData: Partial<Task> = { status };

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

  const deleteTask = async () => {
    if (!task || !userInfo) return;

    if (userInfo.role !== 'admin') {
      showSnackbar('관리자만 업무를 삭제할 수 있습니다.', 'error');
      return;
    }

    setDeleting(true);

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      showSnackbar('업무가 삭제되었습니다.', 'success');
      
      setTimeout(() => {
        router.push(userInfo.role === 'admin' ? '/admin/dashboard' : '/dashboard');
      }, 1000);
    } catch (error) {
      console.error('업무 삭제 실패:', error);
      showSnackbar('업무 삭제에 실패했습니다.', 'error');
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
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
      return (
        <div style={{...styles.alert, ...styles.alertError}}>
          <WarningIcon style={{fontSize: 24}} />
          <span>⚠️ 마감일이 지났습니다! ({Math.abs(days)}일 지연)</span>
        </div>
      );
    }
    if (days === 0) {
      return (
        <div style={{...styles.alert, ...styles.alertError}}>
          <FireIcon style={{fontSize: 24}} />
          <span>🔥 오늘이 마감일입니다!</span>
        </div>
      );
    }
    if (days === 1) {
      return (
        <div style={{...styles.alert, ...styles.alertWarning}}>
          <WarningIcon style={{fontSize: 24}} />
          <span>⚠️ 내일이 마감일입니다!</span>
        </div>
      );
    }
    if (days <= 3) {
      return (
        <div style={{...styles.alert, ...styles.alertWarning}}>
          <AccessTimeIcon style={{fontSize: 24}} />
          <span>⏰ 마감일까지 {days}일 남았습니다 (D-{days})</span>
        </div>
      );
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Todo':
        return { background: `linear-gradient(135deg, ${fluentColors.primary[400]}, ${fluentColors.primary[600]})`, color: '#FFFFFF' };
      case 'Doing':
        return { background: `linear-gradient(135deg, ${fluentColors.warning.light}, ${fluentColors.warning.main})`, color: '#FFFFFF' };
      case 'Done':
        return { background: `linear-gradient(135deg, ${fluentColors.success.light}, ${fluentColors.success.main})`, color: '#FFFFFF' };
      default:
        return { background: fluentColors.neutral[30], color: fluentColors.neutral[80] };
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

  return (
    <div style={styles.container}>
      <Header userName={userInfo.name} userRole={userInfo.role} userEmail={userInfo.email} />
      
      <div style={styles.content}>
        {/* 상단 버튼 */}
        <div style={styles.topBar}>
          <button onClick={handleBack} style={styles.backButton}>
            <ArrowBackIcon style={styles.buttonIcon} />
            <span>돌아가기</span>
          </button>
          
          {userInfo.role === 'admin' && (
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              style={styles.deleteButton}
            >
              <DeleteIcon style={styles.buttonIcon} />
              <span>업무 삭제</span>
            </button>
          )}
        </div>

        {/* 업무 제목 & 상태 */}
        <div style={styles.titleSection}>
          <div style={styles.titleRow}>
            <h1 style={styles.title}>{task.title}</h1>
            <div style={{...styles.statusBadge, ...getStatusStyle(task.status)}}>
              {getStatusIcon(task.status)}
              <span style={styles.statusText}>{task.status}</span>
            </div>
          </div>
          <p style={styles.taskId}>업무 ID: {task.id}</p>
        </div>

        {/* 긴급도 알림 */}
        {getUrgencyAlert(task.due_date, task.status)}

        <div style={styles.mainGrid}>
          {/* 왼쪽: 업무 정보 */}
          <div style={styles.leftColumn}>
            {/* 업무 정보 카드 */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <DescriptionIcon style={styles.cardHeaderIcon} />
                <h2 style={styles.cardTitle}>업무 정보</h2>
              </div>
              <div style={styles.divider} />

              <div style={styles.infoGrid}>
                {/* 카테고리 */}
                <div style={styles.infoRow}>
                  <CategoryIcon style={styles.infoIcon} />
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>카테고리</span>
                    <span style={styles.infoValue}>{task.category}</span>
                  </div>
                </div>

                {/* 요청 부서 */}
                <div style={styles.infoRow}>
                  <BusinessIcon style={styles.infoIcon} />
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>요청 부서</span>
                    <span style={styles.infoValue}>{task.requester_dept}</span>
                  </div>
                </div>

                {/* 담당자 */}
                <div style={styles.infoRow}>
                  <PersonIcon style={styles.infoIcon} />
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>담당자</span>
                    <span style={styles.infoValue}>{task.requester_name}</span>
                  </div>
                </div>

                {/* 마감일 */}
                <div style={styles.infoRow}>
                  <EventIcon style={styles.infoIcon} />
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>마감일</span>
                    <span style={styles.infoValue}>
                      {new Date(task.due_date).toLocaleDateString('ko-KR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </span>
                  </div>
                </div>

                {/* 배정된 팀원 */}
                {assignee && (
                  <div style={styles.infoRow}>
                    <PersonIcon style={{...styles.infoIcon, color: fluentColors.primary[500]}} />
                    <div style={styles.infoContent}>
                      <span style={styles.infoLabel}>배정된 팀원</span>
                      <span style={styles.infoValue}>
                        {assignee.name} ({assignee.position})
                      </span>
                    </div>
                  </div>
                )}

                {/* 완료 시각 */}
                {task.completed_at && (
                  <div style={styles.infoRow}>
                    <AccessTimeIcon style={{...styles.infoIcon, color: fluentColors.success.main}} />
                    <div style={styles.infoContent}>
                      <span style={styles.infoLabel}>완료 시각</span>
                      <span style={styles.infoValue}>
                        {new Date(task.completed_at).toLocaleString('ko-KR')}
                      </span>
                    </div>
                  </div>
                )}

                {/* 상세내용 */}
                {task.description && (
                  <>
                    <div style={styles.divider} />
                    <div style={styles.descriptionSection}>
                      <span style={styles.infoLabel}>상세내용</span>
                      <div style={styles.descriptionBox}>
                        {task.description}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 이미지 갤러리 */}
            {task.image_urls && task.image_urls.length > 0 && (
              <div style={{...styles.card, marginTop: '24px'}}>
                <div style={styles.cardHeader}>
                  <ImageIcon style={styles.cardHeaderIcon} />
                  <h2 style={styles.cardTitle}>첨부 이미지 ({task.image_urls.length}개)</h2>
                </div>
                <div style={styles.divider} />
                <div style={styles.imageGrid}>
                  {task.image_urls.map((url, index) => (
                    <div
                      key={index}
                      style={styles.imageItem}
                      onClick={() => setSelectedImage(url)}
                    >
                      <img
                        src={url}
                        alt={`업무 이미지 ${index + 1}`}
                        style={styles.thumbnailImage}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽: 액션 */}
          <div style={styles.rightColumn}>
            {/* 상태 변경 */}
            {canEdit && (
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <CheckCircleIcon style={styles.cardHeaderIcon} />
                  <h2 style={styles.cardTitle}>상태 변경</h2>
                </div>
                <div style={styles.divider} />
                <div style={styles.statusButtonGroup}>
                  <button
                    onClick={() => updateTaskStatus('Todo')}
                    style={{
                      ...styles.statusButton,
                      ...(task.status === 'Todo' ? styles.statusButtonActive : {}),
                      background: task.status === 'Todo'
                        ? `linear-gradient(135deg, ${fluentColors.primary[400]}, ${fluentColors.primary[600]})`
                        : fluentColors.neutral[0],
                      color: task.status === 'Todo' ? '#FFFFFF' : fluentColors.neutral[80],
                    }}
                  >
                    <AssignmentIcon style={styles.statusButtonIcon} />
                    <span>예정 (Todo)</span>
                  </button>
                  <button
                    onClick={() => updateTaskStatus('Doing')}
                    style={{
                      ...styles.statusButton,
                      ...(task.status === 'Doing' ? styles.statusButtonActive : {}),
                      background: task.status === 'Doing'
                        ? `linear-gradient(135deg, ${fluentColors.warning.light}, ${fluentColors.warning.main})`
                        : fluentColors.neutral[0],
                      color: task.status === 'Doing' ? '#FFFFFF' : fluentColors.neutral[80],
                    }}
                  >
                    <PlayCircleIcon style={styles.statusButtonIcon} />
                    <span>진행중 (Doing)</span>
                  </button>
                  <button
                    onClick={() => updateTaskStatus('Done')}
                    style={{
                      ...styles.statusButton,
                      ...(task.status === 'Done' ? styles.statusButtonActive : {}),
                      background: task.status === 'Done'
                        ? `linear-gradient(135deg, ${fluentColors.success.light}, ${fluentColors.success.main})`
                        : fluentColors.neutral[0],
                      color: task.status === 'Done' ? '#FFFFFF' : fluentColors.neutral[80],
                    }}
                  >
                    <CheckCircleIcon style={styles.statusButtonIcon} />
                    <span>완료 (Done)</span>
                  </button>
                </div>
              </div>
            )}

            {/* 이미지 업로드 */}
            {canUpload && (
              <div style={{...styles.card, marginTop: canEdit ? '24px' : '0'}}>
                <div style={styles.cardHeader}>
                  <UploadFileIcon style={styles.cardHeaderIcon} />
                  <h2 style={styles.cardTitle}>결과물 업로드</h2>
                </div>
                <div style={styles.divider} />
                <label style={styles.uploadButton}>
                  {uploading ? (
                    <>
                      <CircularProgress size={20} style={{color: '#FFFFFF'}} />
                      <span>업로드 중...</span>
                    </>
                  ) : (
                    <>
                      <UploadFileIcon style={styles.uploadIcon} />
                      <span>이미지 선택</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    style={{display: 'none'}}
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                </label>
                <p style={styles.uploadHint}>JPG, PNG, GIF 등 이미지 파일</p>
              </div>
            )}

            {/* 권한 안내 */}
            {!canEdit && (
              <div style={styles.infoAlert}>
                <span>ℹ️ 이 업무는 조회만 가능합니다.</span>
              </div>
            )}
          </div>
        </div>
      </div>

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
          <button onClick={() => setSelectedImage(null)} style={styles.dialogButton}>
            닫기
          </button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => !deleting && setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <div style={styles.deleteDialogContent}>
            <DeleteIcon style={styles.deleteDialogIcon} />
            <h3 style={styles.deleteDialogTitle}>업무를 삭제하시겠습니까?</h3>
            <p style={styles.deleteDialogText}>삭제된 업무는 복구할 수 없습니다.</p>
          </div>
        </DialogContent>
        <DialogActions style={{padding: '0 24px 24px 24px'}}>
          <button 
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={deleting}
            style={styles.dialogButton}
          >
            취소
          </button>
          <button
            onClick={deleteTask}
            disabled={deleting}
            style={{...styles.dialogButton, ...styles.deleteConfirmButton}}
          >
            {deleting ? <CircularProgress size={20} style={{color: '#FFFFFF'}} /> : '삭제'}
          </button>
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
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${fluentColors.neutral[10]} 0%, ${fluentColors.neutral[20]} 100%)`,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },

  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px 24px',
  },

  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },

  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: fluentColors.neutral[0],
    border: `2px solid ${fluentColors.neutral[30]}`,
    borderRadius: fluentRadius.md,
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 600,
    color: fluentColors.neutral[80],
    boxShadow: fluentShadows.neumorph2,
    transition: 'all 0.3s ease',
  },

  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: `linear-gradient(135deg, #f44336, #d32f2f)`,
    border: 'none',
    borderRadius: fluentRadius.md,
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 600,
    color: '#FFFFFF',
    boxShadow: fluentShadows.neumorph3,
    transition: 'all 0.3s ease',
  },

  buttonIcon: {
    fontSize: '20px',
  },

  titleSection: {
    marginBottom: '24px',
  },

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '8px',
    flexWrap: 'wrap',
  },

  title: {
    fontSize: '32px',
    fontWeight: 700,
    color: fluentColors.neutral[100],
    margin: 0,
  },

  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: fluentRadius.full,
    boxShadow: fluentShadows.neumorph2,
  },

  statusText: {
    fontSize: '15px',
    fontWeight: 600,
  },

  taskId: {
    fontSize: '14px',
    color: fluentColors.neutral[60],
    margin: 0,
  },

  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    borderRadius: fluentRadius.lg,
    marginBottom: '24px',
    fontSize: '15px',
    fontWeight: 600,
    boxShadow: fluentShadows.neumorph2,
  },

  alertError: {
    background: `linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(211, 47, 47, 0.15))`,
    color: '#d32f2f',
    border: `2px solid rgba(211, 47, 47, 0.3)`,
  },

  alertWarning: {
    background: `linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(245, 124, 0, 0.15))`,
    color: '#f57c00',
    border: `2px solid rgba(245, 124, 0, 0.3)`,
  },

  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '24px',
  },

  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
  },

  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
  },

  card: {
    background: fluentColors.neutral[0],
    borderRadius: fluentRadius.xl,
    padding: '24px',
    boxShadow: fluentShadows.neumorph4,
    border: `1px solid ${fluentColors.neutral[20]}`,
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },

  cardHeaderIcon: {
    fontSize: '28px',
    color: fluentColors.primary[500],
  },

  cardTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: fluentColors.neutral[100],
    margin: 0,
  },

  divider: {
    height: '1px',
    background: fluentColors.neutral[30],
    marginBottom: '20px',
  },

  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  infoRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  },

  infoIcon: {
    fontSize: '24px',
    color: fluentColors.neutral[60],
    marginTop: '4px',
  },

  infoContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },

  infoLabel: {
    fontSize: '13px',
    color: fluentColors.neutral[60],
    fontWeight: 600,
  },

  infoValue: {
    fontSize: '16px',
    color: fluentColors.neutral[100],
    fontWeight: 500,
  },

  descriptionSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  descriptionBox: {
    padding: '16px',
    background: fluentColors.neutral[10],
    borderRadius: fluentRadius.md,
    border: `1px solid ${fluentColors.neutral[30]}`,
    fontSize: '14px',
    color: fluentColors.neutral[80],
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },

  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },

  imageItem: {
    borderRadius: fluentRadius.md,
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow: fluentShadows.neumorph2,
    transition: 'all 0.3s ease',
  },

  thumbnailImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    display: 'block',
  },

  statusButtonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  statusButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    borderRadius: fluentRadius.lg,
    border: `2px solid ${fluentColors.neutral[30]}`,
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 600,
    boxShadow: fluentShadows.neumorph2,
    transition: 'all 0.3s ease',
    width: '100%',
  },

  statusButtonActive: {
    boxShadow: fluentShadows.neumorph3,
    transform: 'scale(1.02)',
  },

  statusButtonIcon: {
    fontSize: '24px',
  },

  uploadButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px 24px',
    background: `linear-gradient(135deg, ${fluentColors.primary[500]}, ${fluentColors.primary[700]})`,
    borderRadius: fluentRadius.lg,
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 600,
    color: '#FFFFFF',
    boxShadow: fluentShadows.neumorph3,
    transition: 'all 0.3s ease',
    border: 'none',
    width: '100%',
  },

  uploadIcon: {
    fontSize: '24px',
  },

  uploadHint: {
    marginTop: '12px',
    fontSize: '13px',
    color: fluentColors.neutral[60],
    textAlign: 'center',
  },

  infoAlert: {
    padding: '16px 20px',
    background: `linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(25, 118, 210, 0.15))`,
    borderRadius: fluentRadius.lg,
    border: `2px solid rgba(33, 150, 243, 0.3)`,
    color: fluentColors.primary[700],
    fontSize: '14px',
    fontWeight: 600,
    textAlign: 'center',
  },

  dialogButton: {
    padding: '10px 24px',
    borderRadius: fluentRadius.md,
    border: `2px solid ${fluentColors.neutral[30]}`,
    background: fluentColors.neutral[0],
    color: fluentColors.neutral[80],
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  deleteDialogContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px',
    textAlign: 'center',
  },

  deleteDialogIcon: {
    fontSize: '64px',
    color: '#d32f2f',
    marginBottom: '16px',
  },

  deleteDialogTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: fluentColors.neutral[100],
    marginBottom: '8px',
  },

  deleteDialogText: {
    fontSize: '14px',
    color: fluentColors.neutral[60],
  },

  deleteConfirmButton: {
    background: `linear-gradient(135deg, #f44336, #d32f2f)`,
    color: '#FFFFFF',
    border: 'none',
  },
};
