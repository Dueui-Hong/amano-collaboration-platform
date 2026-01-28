/**
 * 관리자 대시보드 - Fluent Design 2.0
 * - Neumorphism Level 4 (강한 입체감)
 * - Glassmorphism Level 2 (미세한 투명도)
 * - Animation Level 3 (적당한 애니메이션)
 * - Blue color scheme (시인성 최적화)
 * - 완벽한 반응형 디자인
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { supabase, Task, Profile } from '@/lib/supabase';
import Header from '@/components/Header';
import FluentSidebar from '@/components/FluentSidebar';
import { exportTasksToCSV } from '@/lib/csvExport';
import { fluentColors, fluentShadows, fluentRadius } from '@/styles/fluent';

// Material-UI
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// Icons
import TodayIcon from '@mui/icons-material/Today';
import DateRangeIcon from '@mui/icons-material/DateRange';
import WarningIcon from '@mui/icons-material/Warning';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import DescriptionIcon from '@mui/icons-material/Description';
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

export default function FluentAdminDashboard() {
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

  const getUrgencyColor = (dueDate: string, status: string): 'success' | 'error' | 'warning' | 'default' => {
    if (status === 'Done') return 'success';
    
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return 'error';
    if (days === 0) return 'error';
    if (days <= 3) return 'warning';
    
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
        <CircularProgress />
      </Box>
    );
  }

  if (!userInfo) {
    return null;
  }

  const stats = getStatistics();

  return (
    <div style={styles.container}>
      <Header userName={userInfo.name} userRole={userInfo.role} userEmail={userInfo.email} />
      
      <div style={styles.mainLayout}>
        {/* Fluent Sidebar */}
        <FluentSidebar 
          userRole="admin" 
          currentView={viewMode}
          onViewChange={setViewMode}
        />

        {/* Main Content */}
        <div style={styles.content}>
          {/* Page Header */}
          <div style={styles.pageHeader}>
            <div style={styles.headerLeft}>
              <h1 style={styles.pageTitle}>
                {viewMode === 0 ? '📊 업무 현황' : '📋 업무 배정'}
              </h1>
              <p style={styles.pageSubtitle}>
                {viewMode === 0 ? '기획홍보팀 전체 업무 통계 및 팀원별 현황' : '드래그 앤 드롭으로 업무를 팀원에게 배정하세요'}
              </p>
            </div>
          </div>

          {viewMode === 0 ? (
            /* 업무 현황 View */
            <>
              {/* Statistics Cards */}
              <div style={styles.statsGrid}>
                <div style={{...styles.statCard, borderLeft: `4px solid ${fluentColors.primary[500]}`}}>
                  <div style={styles.statIcon}>
                    <TodayIcon style={{fontSize: 40, color: fluentColors.primary[500]}} />
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statLabel}>오늘 마감</div>
                    <div style={styles.statValue}>{stats.todayTasks}</div>
                  </div>
                </div>

                <div style={{...styles.statCard, borderLeft: `4px solid ${fluentColors.accent[600]}`}}>
                  <div style={styles.statIcon}>
                    <DateRangeIcon style={{fontSize: 40, color: fluentColors.accent[600]}} />
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statLabel}>이번주</div>
                    <div style={styles.statValue}>{stats.weekTasks}</div>
                  </div>
                </div>

                <div style={{...styles.statCard, borderLeft: `4px solid ${fluentColors.error.main}`}}>
                  <div style={styles.statIcon}>
                    <WarningIcon style={{fontSize: 40, color: fluentColors.error.main}} />
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statLabel}>긴급 (D-3)</div>
                    <div style={styles.statValue}>{stats.urgentTasks}</div>
                  </div>
                </div>

                <div style={{...styles.statCard, borderLeft: `4px solid ${fluentColors.warning.main}`}}>
                  <div style={styles.statIcon}>
                    <AssignmentIcon style={{fontSize: 40, color: fluentColors.warning.main}} />
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statLabel}>예정</div>
                    <div style={styles.statValue}>{stats.totalTodo}</div>
                  </div>
                </div>

                <div style={{...styles.statCard, borderLeft: `4px solid ${fluentColors.info.main}`}}>
                  <div style={styles.statIcon}>
                    <PlayCircleIcon style={{fontSize: 40, color: fluentColors.info.main}} />
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statLabel}>진행중</div>
                    <div style={styles.statValue}>{stats.totalDoing}</div>
                  </div>
                </div>

                <div style={{...styles.statCard, borderLeft: `4px solid ${fluentColors.success.main}`}}>
                  <div style={styles.statIcon}>
                    <CheckCircleIcon style={{fontSize: 40, color: fluentColors.success.main}} />
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statLabel}>완료</div>
                    <div style={styles.statValue}>{stats.totalDone}</div>
                  </div>
                </div>
              </div>

              {/* Members Section */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>👥 팀원별 업무 현황</h2>
                <div style={styles.membersGrid}>
                  {members.map(member => {
                    const memberStats = getMemberStatistics(member.id);
                    return (
                      <div key={member.id} style={styles.memberCard}>
                        <div style={styles.memberHeader}>
                          <div>
                            <div style={styles.memberName}>{member.name}</div>
                            <div style={styles.memberPosition}>{member.position}</div>
                          </div>
                          <div style={styles.memberTotal}>
                            <div style={styles.memberTotalValue}>{memberStats.total}</div>
                            <div style={styles.memberTotalLabel}>전체 업무</div>
                          </div>
                        </div>

                        <div style={styles.memberStats}>
                          <div style={{...styles.memberStatItem, background: `linear-gradient(135deg, ${fluentColors.warning.light}, ${fluentColors.warning.main})`}}>
                            <div style={styles.memberStatValue}>{memberStats.todo}</div>
                            <div style={styles.memberStatLabel}>예정</div>
                          </div>
                          <div style={{...styles.memberStatItem, background: `linear-gradient(135deg, ${fluentColors.info.light}, ${fluentColors.info.main})`}}>
                            <div style={styles.memberStatValue}>{memberStats.doing}</div>
                            <div style={styles.memberStatLabel}>진행중</div>
                          </div>
                          <div style={{...styles.memberStatItem, background: `linear-gradient(135deg, ${fluentColors.success.light}, ${fluentColors.success.main})`}}>
                            <div style={styles.memberStatValue}>{memberStats.done}</div>
                            <div style={styles.memberStatLabel}>완료</div>
                          </div>
                        </div>

                        {memberStats.todayTasks.length > 0 && (
                          <div style={{...styles.alert, ...styles.alertError}}>
                            <div style={styles.alertTitle}>🔥 오늘 마감 ({memberStats.todayTasks.length}개)</div>
                            {memberStats.todayTasks.map(task => (
                              <div
                                key={task.id}
                                style={styles.alertItem}
                                onClick={() => handleTaskClick(task.id)}
                              >
                                • {task.title}
                              </div>
                            ))}
                          </div>
                        )}

                        {memberStats.urgentTasks.length > 0 && (
                          <div style={{...styles.alert, ...styles.alertWarning}}>
                            <div style={styles.alertTitle}>⚠️ 긴급 (D-3) ({memberStats.urgentTasks.length}개)</div>
                            {memberStats.urgentTasks.map(task => (
                              <div
                                key={task.id}
                                style={styles.alertItem}
                                onClick={() => handleTaskClick(task.id)}
                              >
                                • {task.title}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Unassigned Tasks */}
              {unassignedTasks.length > 0 && (
                <div style={styles.section}>
                  <h2 style={styles.sectionTitle}>📋 미배정 업무 ({unassignedTasks.length}개)</h2>
                  <div style={styles.unassignedList}>
                    {unassignedTasks.map(task => (
                      <div
                        key={task.id}
                        style={styles.unassignedTask}
                        onClick={() => handleTaskClick(task.id)}
                      >
                        <div style={styles.unassignedTaskContent}>
                          <div style={styles.unassignedTaskTitle}>{task.title}</div>
                          <div style={styles.unassignedTaskMeta}>
                            <span style={styles.badge}>{task.category}</span>
                            <span style={styles.badge}>{task.requester_dept}</span>
                            <span style={styles.badge}>{new Date(task.due_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {getUrgencyLabel(task.due_date, task.status) && (
                          <span style={{...styles.urgencyBadge, ...styles[`urgencyBadge${getUrgencyColor(task.due_date, task.status).charAt(0).toUpperCase() + getUrgencyColor(task.due_date, task.status).slice(1)}` as keyof typeof styles]}}>
                            {getUrgencyLabel(task.due_date, task.status)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* 업무 배정 View */
            <DragDropContext onDragEnd={onDragEnd}>
              <div style={styles.assignGrid}>
                {/* Unassigned Column */}
                <div style={styles.assignColumn}>
                  <div style={{...styles.assignHeader, background: `linear-gradient(135deg, ${fluentColors.error.light}, ${fluentColors.error.main})`}}>
                    <span style={styles.assignHeaderTitle}>📥 미배정 업무</span>
                    <span style={styles.assignHeaderBadge}>{unassignedTasks.length}</span>
                  </div>
                  <Droppable droppableId="unassigned">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          ...styles.assignDropzone,
                          background: snapshot.isDraggingOver ? fluentColors.neutral[20] : 'transparent',
                        }}
                      >
                        {unassignedTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...styles.taskDragCard,
                                  ...provided.draggableProps.style,
                                  boxShadow: snapshot.isDragging ? fluentShadows.neumorph4 : fluentShadows.neumorph2,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTaskClick(task.id);
                                }}
                              >
                                <div style={styles.taskDragTitle}>{task.title}</div>
                                <div style={styles.taskDragCategory}>{task.category}</div>
                                <div style={styles.taskDragFooter}>
                                  <span style={styles.taskDragDate}>{new Date(task.due_date).toLocaleDateString()}</span>
                                  {getUrgencyLabel(task.due_date, task.status) && (
                                    <span style={{...styles.taskDragBadge, ...styles[`urgencyBadge${getUrgencyColor(task.due_date, task.status).charAt(0).toUpperCase() + getUrgencyColor(task.due_date, task.status).slice(1)}` as keyof typeof styles]}}>
                                      {getUrgencyLabel(task.due_date, task.status)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>

                {/* Member Columns */}
                {members.map(member => {
                  const tasks = memberTasks[member.id] || [];
                  const memberStats = getMemberStatistics(member.id);
                  
                  return (
                    <div key={member.id} style={styles.assignColumn}>
                      <div style={{...styles.assignHeader, background: `linear-gradient(135deg, ${fluentColors.primary[400]}, ${fluentColors.primary[600]})`}}>
                        <div>
                          <div style={styles.assignHeaderTitle}>{member.name}</div>
                          <div style={styles.assignHeaderSubtitle}>{member.position}</div>
                        </div>
                        <span style={styles.assignHeaderBadge}>{tasks.length}</span>
                      </div>
                      <div style={styles.assignMemberStats}>
                        <span style={{...styles.assignStatBadge, background: fluentColors.warning.main}}>Todo: {memberStats.todo}</span>
                        <span style={{...styles.assignStatBadge, background: fluentColors.info.main}}>Doing: {memberStats.doing}</span>
                        <span style={{...styles.assignStatBadge, background: fluentColors.success.main}}>Done: {memberStats.done}</span>
                      </div>
                      <Droppable droppableId={member.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{
                              ...styles.assignDropzone,
                              background: snapshot.isDraggingOver ? fluentColors.success[50] : 'transparent',
                            }}
                          >
                            {tasks.map((task, index) => (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...styles.taskDragCard,
                                      ...provided.draggableProps.style,
                                      boxShadow: snapshot.isDragging ? fluentShadows.neumorph4 : fluentShadows.neumorph2,
                                      background: 
                                        task.status === 'Done' ? fluentColors.success[50] :
                                        task.status === 'Doing' ? fluentColors.info[50] : fluentColors.neutral[0],
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTaskClick(task.id);
                                    }}
                                  >
                                    <div style={styles.taskDragTitle}>{task.title}</div>
                                    <div style={styles.taskDragCategory}>{task.category} | {task.status}</div>
                                    <div style={styles.taskDragFooter}>
                                      <span style={styles.taskDragDate}>{new Date(task.due_date).toLocaleDateString()}</span>
                                      {getUrgencyLabel(task.due_date, task.status) && (
                                        <span style={{...styles.taskDragBadge, ...styles[`urgencyBadge${getUrgencyColor(task.due_date, task.status).charAt(0).toUpperCase() + getUrgencyColor(task.due_date, task.status).slice(1)}` as keyof typeof styles]}}>
                                          {getUrgencyLabel(task.due_date, task.status)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          )}

          {/* Action Buttons */}
          <div style={styles.actionButtons}>
            <button onClick={fetchData} style={styles.primaryButton}>
              <RefreshIcon style={styles.buttonIcon} />
              <span>새로고침</span>
            </button>
            <button
              onClick={generatePPT}
              disabled={generatingPPT}
              style={{...styles.successButton, ...(generatingPPT ? {opacity: 0.6, cursor: 'not-allowed'} : {})}}
            >
              {generatingPPT ? (
                <>
                  <CircularProgress size={20} style={{color: '#FFFFFF', marginRight: '8px'}} />
                  <span>PPT 생성 중...</span>
                </>
              ) : (
                <>
                  <DescriptionIcon style={styles.buttonIcon} />
                  <span>주간보고서 PPT 생성</span>
                </>
              )}
            </button>
            <button onClick={handleExportCSV} style={styles.secondaryButton}>
              <DownloadIcon style={styles.buttonIcon} />
              <span>CSV 내보내기</span>
            </button>
          </div>
        </div>
      </div>

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
        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          .assign-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .members-grid {
            grid-template-columns: 1fr !important;
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
  },

  content: {
    flex: 1,
    padding: '32px',
    maxWidth: '1600px',
    margin: '0 auto',
  },

  pageHeader: {
    marginBottom: '32px',
  },

  headerLeft: {},

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

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '20px',
    marginBottom: '40px',
  },

  statCard: {
    background: fluentColors.neutral[0],
    borderRadius: fluentRadius.xl,
    padding: '20px',
    boxShadow: fluentShadows.neumorph3,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },

  statIcon: {
    width: '60px',
    height: '60px',
    borderRadius: fluentRadius.lg,
    background: `linear-gradient(135deg, ${fluentColors.neutral[10]}, ${fluentColors.neutral[20]})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: fluentShadows.neumorph1,
  },

  statContent: {},

  statLabel: {
    fontSize: '13px',
    color: fluentColors.neutral[60],
    marginBottom: '4px',
    fontWeight: 600,
  },

  statValue: {
    fontSize: '32px',
    fontWeight: 700,
    color: fluentColors.neutral[100],
    lineHeight: 1,
  },

  section: {
    marginBottom: '40px',
  },

  sectionTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: fluentColors.neutral[100],
    marginBottom: '20px',
  },

  membersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
  },

  memberCard: {
    background: fluentColors.neutral[0],
    borderRadius: fluentRadius.xl,
    padding: '24px',
    boxShadow: fluentShadows.neumorph3,
    transition: 'all 0.3s ease',
  },

  memberHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },

  memberName: {
    fontSize: '20px',
    fontWeight: 700,
    color: fluentColors.primary[600],
    marginBottom: '4px',
  },

  memberPosition: {
    fontSize: '14px',
    color: fluentColors.neutral[60],
  },

  memberTotal: {
    textAlign: 'right',
  },

  memberTotalValue: {
    fontSize: '36px',
    fontWeight: 700,
    color: fluentColors.neutral[100],
    lineHeight: 1,
  },

  memberTotalLabel: {
    fontSize: '12px',
    color: fluentColors.neutral[60],
    fontWeight: 600,
  },

  memberStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '16px',
  },

  memberStatItem: {
    padding: '16px',
    borderRadius: fluentRadius.md,
    textAlign: 'center',
    color: '#FFFFFF',
    boxShadow: fluentShadows.neumorph2,
  },

  memberStatValue: {
    fontSize: '24px',
    fontWeight: 700,
    marginBottom: '4px',
  },

  memberStatLabel: {
    fontSize: '12px',
    fontWeight: 600,
  },

  alert: {
    padding: '16px',
    borderRadius: fluentRadius.md,
    marginTop: '12px',
  },

  alertError: {
    background: 'rgba(211, 47, 47, 0.1)',
    border: `1px solid ${fluentColors.error.light}`,
  },

  alertWarning: {
    background: 'rgba(255, 152, 0, 0.1)',
    border: `1px solid ${fluentColors.warning.light}`,
  },

  alertTitle: {
    fontSize: '14px',
    fontWeight: 700,
    marginBottom: '8px',
    color: fluentColors.neutral[100],
  },

  alertItem: {
    fontSize: '13px',
    padding: '6px 8px',
    cursor: 'pointer',
    borderRadius: fluentRadius.sm,
    transition: 'all 0.2s ease',
    color: fluentColors.neutral[80],
  },

  unassignedList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  unassignedTask: {
    background: fluentColors.neutral[0],
    borderRadius: fluentRadius.lg,
    padding: '20px',
    boxShadow: fluentShadows.neumorph2,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  unassignedTaskContent: {
    flex: 1,
  },

  unassignedTaskTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: fluentColors.neutral[100],
    marginBottom: '8px',
  },

  unassignedTaskMeta: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },

  badge: {
    padding: '4px 12px',
    background: fluentColors.neutral[20],
    borderRadius: fluentRadius.sm,
    fontSize: '12px',
    fontWeight: 600,
    color: fluentColors.neutral[80],
  },

  urgencyBadge: {
    padding: '6px 16px',
    borderRadius: fluentRadius.sm,
    fontSize: '14px',
    fontWeight: 700,
    color: '#FFFFFF',
  },

  urgencyBadgeSuccess: {
    background: fluentColors.success.main,
  },

  urgencyBadgeError: {
    background: fluentColors.error.main,
  },

  urgencyBadgeWarning: {
    background: fluentColors.warning.main,
  },

  urgencyBadgeDefault: {
    background: fluentColors.neutral[60],
  },

  assignGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },

  assignColumn: {
    background: fluentColors.neutral[0],
    borderRadius: fluentRadius.xl,
    padding: '20px',
    boxShadow: fluentShadows.neumorph3,
  },

  assignHeader: {
    padding: '16px',
    borderRadius: fluentRadius.lg,
    marginBottom: '16px',
    color: '#FFFFFF',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  assignHeaderTitle: {
    fontSize: '16px',
    fontWeight: 700,
  },

  assignHeaderSubtitle: {
    fontSize: '12px',
    opacity: 0.9,
  },

  assignHeaderBadge: {
    padding: '4px 12px',
    background: 'rgba(255, 255, 255, 0.25)',
    borderRadius: fluentRadius.sm,
    fontSize: '14px',
    fontWeight: 600,
  },

  assignMemberStats: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },

  assignStatBadge: {
    padding: '6px 12px',
    borderRadius: fluentRadius.sm,
    fontSize: '11px',
    fontWeight: 600,
    color: '#FFFFFF',
  },

  assignDropzone: {
    minHeight: '500px',
    borderRadius: fluentRadius.lg,
    padding: '8px',
    transition: 'all 0.3s ease',
  },

  taskDragCard: {
    background: fluentColors.neutral[0],
    borderRadius: fluentRadius.md,
    padding: '16px',
    marginBottom: '12px',
    cursor: 'grab',
    transition: 'all 0.3s ease',
  },

  taskDragTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: fluentColors.neutral[100],
    marginBottom: '6px',
  },

  taskDragCategory: {
    fontSize: '12px',
    color: fluentColors.neutral[60],
    marginBottom: '12px',
  },

  taskDragFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  taskDragDate: {
    fontSize: '12px',
    color: fluentColors.neutral[70],
  },

  taskDragBadge: {
    padding: '4px 8px',
    borderRadius: fluentRadius.sm,
    fontSize: '11px',
    fontWeight: 600,
    color: '#FFFFFF',
  },

  actionButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '40px',
    paddingBottom: '40px',
    flexWrap: 'wrap',
  },

  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
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

  successButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    background: `linear-gradient(135deg, ${fluentColors.success.light}, ${fluentColors.success.main})`,
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
    padding: '14px 28px',
    background: fluentColors.neutral[0],
    color: fluentColors.success.main,
    border: `2px solid ${fluentColors.success.main}`,
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
};
