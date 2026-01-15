/**
 * 관리자 대시보드 - 업무 배분
 * Drag & Drop으로 팀원에게 업무 배정
 */

'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { supabase, Task, Profile } from '@/lib/supabase';

export default function AdminDashboardPage() {
  const [unassignedTasks, setUnassignedTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [memberTasks, setMemberTasks] = useState<{ [key: string]: Task[] }>({});
  const [loading, setLoading] = useState(true);
  const [generatingPPT, setGeneratingPPT] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 미배정 업무 조회
      const { data: unassigned } = await supabase
        .from('tasks')
        .select('*')
        .is('assignee_id', null)
        .order('created_at', { ascending: false });

      setUnassignedTasks(unassigned || []);

      // 팀원 목록 조회
      const { data: memberList } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'member');

      setMembers(memberList || []);

      // 각 팀원의 업무 조회
      if (memberList) {
        const tasksMap: { [key: string]: Task[] } = {};

        for (const member of memberList) {
          const { data: tasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('assignee_id', member.id)
            .order('created_at', { ascending: false });

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

    // 같은 위치로 드롭된 경우
    if (source.droppableId === destination.droppableId) return;

    try {
      const taskId = draggableId;
      const newAssigneeId = destination.droppableId === 'unassigned' ? null : destination.droppableId;

      // Supabase 업데이트
      const { error } = await supabase
        .from('tasks')
        .update({
          assignee_id: newAssigneeId,
          status: newAssigneeId ? 'Todo' : 'Unassigned',
        })
        .eq('id', taskId);

      if (error) throw error;

      // UI 업데이트
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

      // Base64를 Blob으로 변환
      const byteCharacters = atob(data.data.content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });

      // 다운로드
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="mt-2 text-gray-600">Drag & Drop으로 업무를 팀원에게 배정하세요</p>
      </div>

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
                          className={`p-3 mb-2 bg-gray-50 rounded border border-gray-200 ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <p className="font-medium text-sm text-gray-800">{task.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {task.category} | {task.requester_dept}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            마감: {new Date(task.due_date).toLocaleDateString()}
                          </p>
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
          {members.map((member) => (
            <div key={member.id} className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {member.name} ({member.position})
                <span className="ml-2 text-sm text-gray-500">
                  ({memberTasks[member.id]?.length || 0}건)
                </span>
              </h2>
              <Droppable droppableId={member.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[400px] ${snapshot.isDraggingOver ? 'bg-green-50' : ''}`}
                  >
                    {memberTasks[member.id]?.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 mb-2 rounded border ${
                              task.status === 'Done'
                                ? 'bg-green-50 border-green-200'
                                : task.status === 'Doing'
                                ? 'bg-yellow-50 border-yellow-200'
                                : 'bg-blue-50 border-blue-200'
                            } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                          >
                            <p className="font-medium text-sm text-gray-800">{task.title}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {task.category} | {task.status}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              마감: {new Date(task.due_date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* 새로고침 및 PPT 생성 버튼 */}
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={fetchData}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          새로고침
        </button>
        <button
          onClick={generatePPT}
          disabled={generatingPPT}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {generatingPPT ? 'PPT 생성 중...' : '📊 주간보고서 PPT 생성'}
        </button>
      </div>
    </div>
  );
}
