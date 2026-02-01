/**
 * 팀원 대시보드 - Microsoft Fluent Design 2.0
 * - Neumorphism Level 4 (강한 입체감)
 * - Glassmorphism Level 2 (미세한 투명도)
 * - Animation Level 3 (적당한 애니메이션)
 * - Blue color scheme (시인성 최적화)
 * - 완벽한 반응형 디자인
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase, Task, Profile } from '@/lib/supabase';
import { fluentColors, fluentShadows, fluentRadius } from '@/styles/fluent';
import Header from '@/components/Header';
import FluentSidebar from '@/components/FluentSidebar';

// Icons
import AssignmentIcon from '@mui/icons-material/Assignment';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import ArticleIcon from '@mui/icons-material/Article';
import DescriptionIcon from '@mui/icons-material/Description';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Fab from '@mui/material/Fab';

export default function FluentDashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userInfo, setUserInfo] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [generatingPPT, setGeneratingPPT] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    category: '',
    requester_dept: '',
    requester_name: '',
    description: '',
    due_date: '',
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchUserAndTasks();
  }, []);

  const fetchUserAndTasks = async () => {
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

  const createNewTask = async () => {
    if (!userInfo) return;

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
        assignee_id: userInfo.id,
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

  const handleEventClick = (info: any) => {
    const taskId = info.event.id;
    if (taskId) {
      router.push(`/tasks/${taskId}`);
    }
  };

  const handleNewTaskChange = (field: string, value: string) => {
    setNewTask({ ...newTask, [field]: value });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((t) => t.status === status);
  };

  const calendarEvents = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    start: task.due_date,
    backgroundColor:
      task.status === 'Done'
        ? fluentColors.success.main
        : task.status === 'Doing'
        ? fluentColors.warning.main
        : fluentColors.primary[500],
    borderColor:
      task.status === 'Done'
        ? fluentColors.success.dark
        : task.status === 'Doing'
        ? fluentColors.warning.dark
        : fluentColors.primary[700],
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
    <div style={styles.container}>
      <Header userName={userInfo.name} userRole={userInfo.role} userEmail={userInfo.email} />
      
      <div style={styles.mainLayout}>
        <FluentSidebar userRole="member" />
        
        <div style={styles.content}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <div style={styles.headerLeft}>
            <h1 style={styles.pageTitle}>내 업무 대시보드</h1>
            <p style={styles.pageSubtitle}>업무를 효율적으로 관리하세요</p>
          </div>
          <div style={styles.headerActions}>
            <button
              onClick={() => setShowNewTaskModal(true)}
              style={styles.primaryButton}
            >
              <AddIcon style={styles.buttonIcon} />
              <span>새 업무 등록</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid" style={styles.statsGrid}>
          <div className="stat-card" style={{...styles.statCard, ...styles.statCardTodo}}>
            <div className="stat-icon" style={styles.statIcon}>
              <AssignmentIcon style={{fontSize: 40, color: fluentColors.primary[500]}} />
            </div>
            <div style={styles.statContent}>
              <div className="stat-label" style={styles.statLabel}>예정</div>
              <div style={styles.statValue}>{getTasksByStatus('Todo').length}</div>
            </div>
            <div style={styles.statBadge}>
              <span style={styles.statBadgeText}>Todo</span>
            </div>
          </div>

          <div className="stat-card" style={{...styles.statCard, ...styles.statCardDoing}}>
            <div className="stat-icon" style={styles.statIcon}>
              <PlayCircleIcon style={{fontSize: 40, color: fluentColors.warning.main}} />
            </div>
            <div style={styles.statContent}>
              <div className="stat-label" style={styles.statLabel}>진행중</div>
              <div style={styles.statValue}>{getTasksByStatus('Doing').length}</div>
            </div>
            <div style={styles.statBadge}>
              <span style={styles.statBadgeText}>In Progress</span>
            </div>
          </div>

          <div className="stat-card" style={{...styles.statCard, ...styles.statCardDone}}>
            <div className="stat-icon" style={styles.statIcon}>
              <CheckCircleIcon style={{fontSize: 40, color: fluentColors.success.main}} />
            </div>
            <div style={styles.statContent}>
              <div className="stat-label" style={styles.statLabel}>완료</div>
              <div style={styles.statValue}>{getTasksByStatus('Done').length}</div>
            </div>
            <div style={styles.statBadge}>
              <span style={styles.statBadgeText}>Done</span>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>📅 월간 캘린더</h2>
            <p style={styles.sectionSubtitle}>클릭하여 업무 상세를 확인하세요</p>
          </div>
          <div style={styles.calendarCard}>
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
              contentHeight={500}
            />
          </div>
        </div>

        {/* Tasks Grid */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>📋 업무 현황</h2>
            <p style={styles.sectionSubtitle}>상태별로 정리된 업무 목록</p>
          </div>
          <div style={styles.tasksGrid}>
            {/* Todo Column */}
            <div style={styles.taskColumn}>
              <div style={{...styles.columnHeader, background: `linear-gradient(135deg, ${fluentColors.primary[400]}, ${fluentColors.primary[600]})`}}>
                <AssignmentIcon style={styles.columnIcon} />
                <span style={styles.columnTitle}>예정</span>
                <span style={styles.columnBadge}>{getTasksByStatus('Todo').length}</span>
              </div>
              <div style={styles.taskList}>
                {getTasksByStatus('Todo').map((task) => (
                  <div
                    key={task.id}
                    style={styles.taskCard}
                    onClick={() => router.push(`/tasks/${task.id}`)}
                  >
                    <div style={styles.taskTitle}>{task.title}</div>
                    <div style={styles.taskMeta}>
                      <span style={styles.taskCategory}>{task.category}</span>
                      <span style={styles.taskDate}>
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {getTasksByStatus('Todo').length === 0 && (
                  <div style={styles.emptyState}>예정된 업무가 없습니다</div>
                )}
              </div>
            </div>

            {/* Doing Column */}
            <div style={styles.taskColumn}>
              <div style={{...styles.columnHeader, background: `linear-gradient(135deg, ${fluentColors.warning.light}, ${fluentColors.warning.main})`}}>
                <PlayCircleIcon style={styles.columnIcon} />
                <span style={styles.columnTitle}>진행중</span>
                <span style={styles.columnBadge}>{getTasksByStatus('Doing').length}</span>
              </div>
              <div style={styles.taskList}>
                {getTasksByStatus('Doing').map((task) => (
                  <div
                    key={task.id}
                    style={{...styles.taskCard, borderLeft: `4px solid ${fluentColors.warning.main}`}}
                    onClick={() => router.push(`/tasks/${task.id}`)}
                  >
                    <div style={styles.taskTitle}>{task.title}</div>
                    <div style={styles.taskMeta}>
                      <span style={styles.taskCategory}>{task.category}</span>
                      <span style={styles.taskDate}>
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {getTasksByStatus('Doing').length === 0 && (
                  <div style={styles.emptyState}>진행중인 업무가 없습니다</div>
                )}
              </div>
            </div>

            {/* Done Column */}
            <div style={styles.taskColumn}>
              <div style={{...styles.columnHeader, background: `linear-gradient(135deg, ${fluentColors.success.light}, ${fluentColors.success.main})`}}>
                <CheckCircleIcon style={styles.columnIcon} />
                <span style={styles.columnTitle}>완료</span>
                <span style={styles.columnBadge}>{getTasksByStatus('Done').length}</span>
              </div>
              <div style={styles.taskList}>
                {getTasksByStatus('Done').map((task) => (
                  <div
                    key={task.id}
                    style={{...styles.taskCard, borderLeft: `4px solid ${fluentColors.success.main}`, opacity: 0.8}}
                    onClick={() => router.push(`/tasks/${task.id}`)}
                  >
                    <div style={styles.taskTitle}>{task.title}</div>
                    <div style={styles.taskMeta}>
                      <span style={styles.taskCategory}>{task.category}</span>
                      <span style={styles.taskDate}>
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {getTasksByStatus('Done').length === 0 && (
                  <div style={styles.emptyState}>완료된 업무가 없습니다</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Floating Action Button */}
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

      {/* New Task Modal */}
      <Dialog open={showNewTaskModal} onClose={() => setShowNewTaskModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <div style={styles.modalTitle}>새 업무 등록</div>
          <div style={styles.modalSubtitle}>본인에게 배정되는 업무를 등록합니다</div>
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
          >
            {creatingTask ? <CircularProgress size={24} color="inherit" /> : '등록'}
          </Button>
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

      <style>{`
        /* ============================================ */
        /* 반응형 CSS - 자연스러운 적응형 레이아웃 */
        /* ============================================ */
        
        /* 작은 모바일 (< 600px) */
        @media (max-width: 600px) {
          /* 컨테이너 패딩 조정 */
          div[style*="padding: 32px 24px"] {
            padding: 16px !important;
          }
          div[style*="padding: 24px"] {
            padding: 12px !important;
          }
          div[style*="padding: 20px"] {
            padding: 12px !important;
          }
          
          /* 폰트 크기 자동 조정 */
          h1 {
            font-size: 22px !important;
            line-height: 1.3 !important;
          }
          h2 {
            font-size: 18px !important;
            line-height: 1.3 !important;
          }
          h3 {
            font-size: 15px !important;
          }
          p {
            font-size: 14px !important;
          }
          
          /* 통계 카드 */
          div[style*="fontSize: '40px'"] {
            font-size: 28px !important;
          }
          
          /* 버튼 터치 영역 확보 */
          button {
            padding: 12px 20px !important;
            font-size: 14px !important;
            min-height: 48px !important;
          }
          
          /* 헤더 액션 세로 배치 */
          .header-actions {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .header-actions button {
            width: 100% !important;
          }
        }
        
        /* 중간 모바일 (601-768px) */
        @media (min-width: 601px) and (max-width: 768px) {
          h1 {
            font-size: 26px !important;
          }
          h2 {
            font-size: 20px !important;
          }
          
          div[style*="fontSize: '40px'"] {
            font-size: 32px !important;
          }
        }
        
        /* 태블릿 (769-1024px) */
        @media (min-width: 769px) and (max-width: 1024px) {
          div[style*="padding: 32px 24px"] {
            padding: 24px 20px !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${fluentColors.neutral[10]} 0%, ${fluentColors.neutral[20]} 100%)`,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },

  mainLayout: {
    display: 'flex',
    minHeight: 'calc(100vh - 64px)',
    overflow: 'hidden',
  },

  content: {
    flex: 1,
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px 24px',
    overflowY: 'auto',
    overflowX: 'hidden',
    height: 'calc(100vh - 64px)',
    boxSizing: 'border-box',
  },

  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
  },

  headerLeft: {
    flex: '1 1 auto',
  },

  pageTitle: {
    fontSize: '32px',
    fontWeight: 700,
    color: fluentColors.neutral[100],
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  },

  pageSubtitle: {
    fontSize: '16px',
    color: fluentColors.neutral[60],
  },

  headerActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },

  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: `linear-gradient(135deg, ${fluentColors.primary[500]}, ${fluentColors.primary[700]})`,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: fluentRadius.md,
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: fluentShadows.neumorph2,
    transition: 'all 0.3s ease',
  },

  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: fluentColors.neutral[0],
    color: fluentColors.primary[600],
    border: `2px solid ${fluentColors.primary[500]}`,
    borderRadius: fluentRadius.md,
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: fluentShadows.neumorph1,
    transition: 'all 0.3s ease',
  },

  buttonIcon: {
    fontSize: '20px',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },

  statCard: {
    background: fluentColors.neutral[0],
    borderRadius: fluentRadius.xl,
    padding: '24px',
    boxShadow: fluentShadows.neumorph3,
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },

  statCardTodo: {
    borderLeft: `4px solid ${fluentColors.primary[500]}`,
  },

  statCardDoing: {
    borderLeft: `4px solid ${fluentColors.warning.main}`,
  },

  statCardDone: {
    borderLeft: `4px solid ${fluentColors.success.main}`,
  },

  statIcon: {
    width: '64px',
    height: '64px',
    borderRadius: fluentRadius.lg,
    background: `linear-gradient(135deg, ${fluentColors.neutral[10]}, ${fluentColors.neutral[20]})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: fluentShadows.neumorph1,
  },

  statContent: {
    flex: 1,
  },

  statLabel: {
    fontSize: '14px',
    color: fluentColors.neutral[60],
    marginBottom: '4px',
    fontWeight: 500,
  },

  statValue: {
    fontSize: '36px',
    fontWeight: 700,
    color: fluentColors.neutral[100],
    lineHeight: 1,
  },

  statBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    padding: '4px 12px',
    background: 'rgba(33, 150, 243, 0.1)',
    borderRadius: fluentRadius.sm,
  },

  statBadgeText: {
    fontSize: '11px',
    fontWeight: 600,
    color: fluentColors.primary[600],
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  section: {
    marginBottom: '32px',
  },

  sectionHeader: {
    marginBottom: '20px',
  },

  sectionTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: fluentColors.neutral[100],
    marginBottom: '4px',
  },

  sectionSubtitle: {
    fontSize: '14px',
    color: fluentColors.neutral[60],
  },

  calendarCard: {
    background: fluentColors.neutral[0],
    borderRadius: fluentRadius.xl,
    padding: '24px',
    boxShadow: fluentShadows.neumorph3,
  },

  tasksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },

  taskColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  columnHeader: {
    padding: '16px 20px',
    borderRadius: fluentRadius.lg,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#FFFFFF',
    boxShadow: fluentShadows.neumorph2,
  },

  columnIcon: {
    fontSize: '24px',
  },

  columnTitle: {
    fontSize: '16px',
    fontWeight: 700,
    flex: 1,
  },

  columnBadge: {
    background: 'rgba(255, 255, 255, 0.25)',
    padding: '4px 12px',
    borderRadius: fluentRadius.sm,
    fontSize: '14px',
    fontWeight: 600,
  },

  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  taskCard: {
    background: fluentColors.neutral[0],
    borderRadius: fluentRadius.md,
    padding: '16px',
    boxShadow: fluentShadows.neumorph2,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    borderLeft: `4px solid ${fluentColors.primary[500]}`,
  },

  taskTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: fluentColors.neutral[100],
    marginBottom: '8px',
  },

  taskMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: fluentColors.neutral[60],
  },

  taskCategory: {
    background: fluentColors.neutral[20],
    padding: '4px 8px',
    borderRadius: fluentRadius.sm,
    fontWeight: 600,
  },

  taskDate: {
    fontWeight: 500,
  },

  emptyState: {
    textAlign: 'center',
    padding: '32px 16px',
    color: fluentColors.neutral[60],
    fontSize: '14px',
  },

  modalTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: fluentColors.neutral[100],
  },

  modalSubtitle: {
    fontSize: '13px',
    color: fluentColors.neutral[60],
    marginTop: '4px',
  },
};
