/**
 * CSV 내보내기 유틸리티
 */

import { Task, Profile } from '@/lib/supabase';

export interface TaskWithAssignee extends Task {
  assignee_name?: string;
}

export const exportTasksToCSV = (tasks: TaskWithAssignee[], members: Profile[]) => {
  // CSV 헤더
  const headers = [
    '업무 ID',
    '업무 제목',
    '요청 부서',
    '요청자',
    '담당자',
    '상태',
    '카테고리',
    '마감일',
    '완료일',
    '설명',
  ];

  // CSV 데이터 생성
  const rows = tasks.map(task => {
    const assignee = members.find(m => m.id === task.assignee_id);
    return [
      task.id,
      task.title,
      task.requester_dept || '',
      task.requester_name || '',
      assignee?.name || '미배정',
      task.status === 'Todo' ? '예정' : task.status === 'Doing' ? '진행중' : task.status === 'Done' ? '완료' : '미배정',
      task.category || '',
      task.due_date || '',
      task.completed_at || '',
      `"${task.description?.replace(/"/g, '""') || ''}"`, // 설명에 쉼표가 있을 수 있으므로 따옴표로 감싸기
    ];
  });

  // CSV 문자열 생성
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  // BOM 추가 (엑셀에서 한글 깨짐 방지)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // 파일 다운로드
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  
  const today = new Date();
  const fileName = `업무목록_${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}.csv`;
  
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
