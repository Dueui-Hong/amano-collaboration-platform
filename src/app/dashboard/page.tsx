/**
 * 팀원 개인 캘린더 페이지
 * FullCalendar로 업무 진행 상태 관리
 */

'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase, Task } from '@/lib/supabase';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    fetchUserAndTasks();
  }, []);

  const fetchUserAndTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      // 내 업무만 조회
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('assignee_id', user.id)
        .order('due_date', { ascending: true });

      setTasks(data || []);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
    }
  };

  const handleEventClick = (info: any) => {
    const task = tasks.find((t) => t.id === info.event.id);
    if (task) {
      setSelectedTask(task);
      setShowModal(true);
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

      alert('상태가 변경되었습니다!');
      fetchUserAndTasks();
      setShowModal(false);
    } catch (error) {
      console.error('상태 변경 실패:', error);
      alert('상태 변경에 실패했습니다.');
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

      alert('결과물 이미지가 업로드되었습니다!');
      fetchUserAndTasks();
      setShowModal(false);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploadingImage(false);
    }
  };

  // FullCalendar 이벤트 데이터 변환
  const calendarEvents = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    start: task.due_date,
    backgroundColor:
      task.status === 'Done'
        ? '#10b981'
        : task.status === 'Doing'
        ? '#f59e0b'
        : '#3b82f6',
    borderColor:
      task.status === 'Done'
        ? '#059669'
        : task.status === 'Doing'
        ? '#d97706'
        : '#2563eb',
  }));

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">내 업무 캘린더</h1>
        <p className="mt-2 text-gray-600">클릭하여 업무 상태를 변경하세요</p>
      </div>

      {/* 캘린더 */}
      <div className="bg-white rounded-lg shadow p-6">
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
      </div>

      {/* 업무 목록 */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Todo */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            📋 Todo ({tasks.filter((t) => t.status === 'Todo').length})
          </h2>
          {tasks
            .filter((t) => t.status === 'Todo')
            .map((task) => (
              <div key={task.id} className="p-3 mb-2 bg-blue-50 rounded border border-blue-200">
                <p className="font-medium text-sm text-gray-800">{task.title}</p>
                <p className="text-xs text-gray-500 mt-1">{task.category}</p>
              </div>
            ))}
        </div>

        {/* Doing */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            ⚡ Doing ({tasks.filter((t) => t.status === 'Doing').length})
          </h2>
          {tasks
            .filter((t) => t.status === 'Doing')
            .map((task) => (
              <div key={task.id} className="p-3 mb-2 bg-yellow-50 rounded border border-yellow-200">
                <p className="font-medium text-sm text-gray-800">{task.title}</p>
                <p className="text-xs text-gray-500 mt-1">{task.category}</p>
              </div>
            ))}
        </div>

        {/* Done */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            ✅ Done ({tasks.filter((t) => t.status === 'Done').length})
          </h2>
          {tasks
            .filter((t) => t.status === 'Done')
            .map((task) => (
              <div key={task.id} className="p-3 mb-2 bg-green-50 rounded border border-green-200">
                <p className="font-medium text-sm text-gray-800">{task.title}</p>
                <p className="text-xs text-gray-500 mt-1">{task.category}</p>
              </div>
            ))}
        </div>
      </div>

      {/* 상세 모달 */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedTask.title}</h2>

            <div className="space-y-3 mb-6">
              <p><span className="font-semibold">카테고리:</span> {selectedTask.category}</p>
              <p><span className="font-semibold">요청 부서:</span> {selectedTask.requester_dept}</p>
              <p><span className="font-semibold">담당자:</span> {selectedTask.requester_name}</p>
              <p><span className="font-semibold">마감일:</span> {new Date(selectedTask.due_date).toLocaleDateString()}</p>
              <p><span className="font-semibold">현재 상태:</span> {selectedTask.status}</p>
              {selectedTask.description && (
                <p><span className="font-semibold">상세내용:</span><br />{selectedTask.description}</p>
              )}
            </div>

            {/* 상태 변경 버튼 */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => updateTaskStatus('Todo')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Todo로 변경
              </button>
              <button
                onClick={() => updateTaskStatus('Doing')}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Doing으로 변경
              </button>
              <button
                onClick={() => updateTaskStatus('Done')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Done으로 변경
              </button>
            </div>

            {/* 결과물 이미지 업로드 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                결과물 이미지 업로드
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    uploadResultImage(e.target.files[0]);
                  }
                }}
                disabled={uploadingImage}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
