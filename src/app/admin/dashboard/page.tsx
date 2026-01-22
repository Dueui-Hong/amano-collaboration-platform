/**
 * 개선된 관리자 대시보드
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [unassignedTasks, setUnassignedTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [memberTasks, setMemberTasks] = useState<{ [key: string]: Task[] }>({});
  const [loading, setLoading] = useState(true);
  const [generatingPPT, setGeneratingPPT] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'overview'>('overview');
  const [userInfo, setUserInfo] = useState<Profile | null>(null);

  useEffect(() => {
    fetchData();
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

      fetchData();
    } catch (error) {
      console.error('업무 배정 실패:', error);
      alert('업무 배정에 실패했습니다.');
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

      alert(`PPT가 생성되었습니다! (${data.data.taskCount}개 업무 포함)`);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setGeneratingPPT(false);
    }
  };

  // 통계 계산
  const getStatistics = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // 이번주 일요일
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // 이번주 토요일

    let todayTasks = 0;
    let weekTasks = 0;
    let urgentTasks = 0; // D-3 이하
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

  const getMemberStatistics = (memberId: string) => {
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

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getUrgencyColor = (dueDate: string, status: string) => {
    if (status === 'Done') return 'bg-green-50 border-green-200';
    
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return 'bg-red-50 border-red-400'; // 지난 업무
    if (days === 0) return 'bg-red-50 border-red-300'; // 오늘 마감
    if (days <= 3) return 'bg-yellow-50 border-yellow-300'; // 3일 이내
    
    if (status === 'Doing') return 'bg-blue-50 border-blue-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getUrgencyBadge = (dueDate: string, status: string): JSX.Element | null => {
    if (status === 'Done') return null;
    
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return <span className="text-xs font-bold text-red-600">지연</span>;
    if (days === 0) return <span className="text-xs font-bold text-red-600">오늘 마감</span>;
    if (days === 1) return <span className="text-xs font-bold text-orange-600">내일 마감</span>;
    if (days <= 3) return <span className="text-xs font-bold text-yellow-600">D-{days}</span>;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return null;
  }

  const stats = getStatistics();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header userName={userInfo.name} userRole={userInfo.role} userEmail={userInfo.email} />
      
      <div className="p-6">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
              <p className="mt-1 text-gray-600">기획홍보팀 업무 현황</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('overview')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'overview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
              📊 업무 현황
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              📋 업무 배정
            </button>
          </div>
        </div>
      </div>
      </div>

      {viewMode === 'overview' ? (
        <>
          {/* 전체 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">오늘 마감</p>
              <p className="text-3xl font-bold text-blue-600">{stats.todayTasks}</p>
              <p className="text-xs text-gray-500 mt-1">개</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">이번주</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.weekTasks}</p>
              <p className="text-xs text-gray-500 mt-1">개</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">긴급 (D-3)</p>
              <p className="text-3xl font-bold text-red-600">{stats.urgentTasks}</p>
              <p className="text-xs text-gray-500 mt-1">개</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">예정</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.totalTodo}</p>
              <p className="text-xs text-gray-500 mt-1">개</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">진행중</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalDoing}</p>
              <p className="text-xs text-gray-500 mt-1">개</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">완료</p>
              <p className="text-3xl font-bold text-green-600">{stats.totalDone}</p>
              <p className="text-xs text-gray-500 mt-1">개</p>
            </div>
          </div>

          {/* 팀원별 현황 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">팀원별 업무 현황</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {members.map(member => {
                const memberStats = getMemberStatistics(member.id);
                return (
                  <div key={member.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.position}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{memberStats.total}</p>
                        <p className="text-xs text-gray-500">전체 업무</p>
                      </div>
                    </div>

                    {/* 상태별 통계 */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 bg-yellow-50 rounded">
                        <p className="text-lg font-bold text-yellow-700">{memberStats.todo}</p>
                        <p className="text-xs text-gray-600">예정</p>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="text-lg font-bold text-blue-700">{memberStats.doing}</p>
                        <p className="text-xs text-gray-600">진행중</p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="text-lg font-bold text-green-700">{memberStats.done}</p>
                        <p className="text-xs text-gray-600">완료</p>
                      </div>
                    </div>

                    {/* 오늘 마감 업무 */}
                    {memberStats.todayTasks.length > 0 && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm font-semibold text-red-700 mb-2">
                          🔥 오늘 마감 ({memberStats.todayTasks.length}개)
                        </p>
                        <ul className="space-y-1">
                          {memberStats.todayTasks.map(task => (
                            <li key={task.id} className="text-xs text-red-600 truncate">
                              • {task.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 긴급 업무 */}
                    {memberStats.urgentTasks.length > 0 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm font-semibold text-yellow-700 mb-2">
                          ⚠️ 긴급 (D-3) ({memberStats.urgentTasks.length}개)
                        </p>
                        <ul className="space-y-1">
                          {memberStats.urgentTasks.map(task => (
                            <li key={task.id} className="text-xs text-yellow-700 truncate">
                              • {task.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 미배정 업무 */}
          {unassignedTasks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                미배정 업무 ({unassignedTasks.length}개)
              </h2>
              <div className="bg-white rounded-lg shadow p-6">
                <ul className="space-y-2">
                  {unassignedTasks.map(task => (
                    <li key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-600">{task.category} | {task.requester_dept}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">
                          마감: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                        {getUrgencyBadge(task.due_date, task.status)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      ) : (
        /* 칸반 보드 */
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 미배정 업무 */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                미배정 업무 ({unassignedTasks.length})
              </h2>
              <Droppable droppableId="unassigned">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[400px] ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                  >
                    {unassignedTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 mb-2 rounded border ${getUrgencyColor(task.due_date, task.status)} ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            }`}
                          >
                            <p className="font-medium text-sm text-gray-800">{task.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{task.category} | {task.requester_dept}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-gray-400">
                                {new Date(task.due_date).toLocaleDateString()}
                              </p>
                              {getUrgencyBadge(task.due_date, task.status)}
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

            {/* 팀원별 업무 */}
            {members.map(member => {
              const tasks = memberTasks[member.id] || [];
              const memberStats = getMemberStatistics(member.id);
              
              return (
                <div key={member.id} className="bg-white rounded-lg shadow p-4">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {member.name} ({member.position})
                    </h2>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                        Todo: {memberStats.todo}
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        Doing: {memberStats.doing}
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                        Done: {memberStats.done}
                      </span>
                    </div>
                  </div>
                  <Droppable droppableId={member.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[400px] ${snapshot.isDraggingOver ? 'bg-green-50' : ''}`}
                      >
                        {tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-3 mb-2 rounded border ${getUrgencyColor(task.due_date, task.status)} ${
                                  snapshot.isDragging ? 'shadow-lg' : ''
                                }`}
                              >
                                <p className="font-medium text-sm text-gray-800">{task.title}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {task.category} | {task.status}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <p className="text-xs text-gray-400">
                                    {new Date(task.due_date).toLocaleDateString()}
                                  </p>
                                  {getUrgencyBadge(task.due_date, task.status)}
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

      {/* 하단 버튼 */}
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={fetchData}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          🔄 새로고침
        </button>
        <button
          onClick={generatePPT}
          disabled={generatingPPT}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {generatingPPT ? '⏳ PPT 생성 중...' : '📊 주간보고서 PPT 생성'}
        </button>
      </div>
      </div>
      </div>
    </div>
  );
}
