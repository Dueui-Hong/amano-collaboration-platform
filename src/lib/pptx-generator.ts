/**
 * PPTX 자동 생성 모듈
 * PptxGenJS를 사용하여 아마노코리아 주간보고서 PPT 생성
 * 
 * 레이아웃:
 * - Type A: 리스트형 (기획/시설점검 또는 이미지 없음)
 * - Type B: 이미지 중심 (디자인/3D/맵작업 + 이미지 있음)
 */

import PptxGenJS from 'pptxgenjs';
import { Task } from './supabase';

// PPT 마스터 슬라이드 설정
const MASTER_CONFIG = {
  // 헤더 텍스트
  headerLeft: {
    text: 'Total Parking Management System',
    fontSize: 10,
    color: '808080', // 회색
    x: 0.5,
    y: 0.3,
  },
  headerRight: {
    text: 'Worldwide Parking NO.1 | A AMANO',
    fontSize: 10,
    color: '000000',
    x: 8,
    y: 0.3,
  },
  // 배경 색상
  background: { color: 'FFFFFF' },
};

/**
 * 날짜 포맷 함수
 * @param date - ISO 날짜 문자열
 * @returns 'YYYY년 MM월 DD일' 형식
 */
function formatDate(date: string): string {
  const d = new Date(date);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/**
 * 주간 날짜 범위 계산
 * 지난주 금요일 00:00 ~ 이번주 목요일 23:59
 * @returns { start: Date, end: Date }
 */
export function getWeeklyDateRange(): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0(일) ~ 6(토)
  
  // 이번주 목요일 23:59:59
  const endDate = new Date(now);
  const daysUntilThursday = dayOfWeek <= 4 ? 4 - dayOfWeek : 4 - dayOfWeek + 7;
  endDate.setDate(now.getDate() + daysUntilThursday);
  endDate.setHours(23, 59, 59, 999);
  
  // 지난주 금요일 00:00:00
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);
  
  return { start: startDate, end: endDate };
}

/**
 * Type A 슬라이드 생성 (리스트형)
 * 기획/시설점검 또는 이미지가 없는 업무
 */
function createTypeASlide(pptx: PptxGenJS, tasks: Task[]) {
  const slide = pptx.addSlide();
  
  // 배경 설정
  slide.background = MASTER_CONFIG.background;
  
  // 헤더
  slide.addText(MASTER_CONFIG.headerLeft.text, {
    x: MASTER_CONFIG.headerLeft.x,
    y: MASTER_CONFIG.headerLeft.y,
    fontSize: MASTER_CONFIG.headerLeft.fontSize,
    color: MASTER_CONFIG.headerLeft.color,
  });
  
  slide.addText(MASTER_CONFIG.headerRight.text, {
    x: MASTER_CONFIG.headerRight.x,
    y: MASTER_CONFIG.headerRight.y,
    fontSize: MASTER_CONFIG.headerRight.fontSize,
    color: MASTER_CONFIG.headerRight.color,
  });
  
  // 타이틀 (날짜 + 카테고리)
  const title = `${formatDate(tasks[0].completed_at!)} - ${tasks[0].category}`;
  slide.addText(title, {
    x: 0.5,
    y: 1,
    w: 9,
    h: 0.5,
    fontSize: 18,
    bold: true,
    color: '000000',
  });
  
  // 업무 테이블
  const tableData = [
    [
      { text: '현장명/프로젝트명', options: { bold: true, fill: 'F0F0F0' } },
      { text: '담당자', options: { bold: true, fill: 'F0F0F0' } },
      { text: '상세 스펙', options: { bold: true, fill: 'F0F0F0' } },
    ],
    ...tasks.map((task) => [
      task.title,
      task.requester_name,
      task.description || '-',
    ]),
  ];
  
  slide.addTable(tableData, {
    x: 0.5,
    y: 1.8,
    w: 9,
    fontSize: 12,
    border: { type: 'solid', pt: 1, color: 'CCCCCC' },
    rowH: 0.6,
  });
}

/**
 * Type B 슬라이드 생성 (이미지 중심)
 * 디자인/3D/맵작업 + 이미지 있음
 */
function createTypeBSlide(pptx: PptxGenJS, task: Task) {
  const slide = pptx.addSlide();
  
  // 배경 설정
  slide.background = MASTER_CONFIG.background;
  
  // 헤더
  slide.addText(MASTER_CONFIG.headerLeft.text, {
    x: MASTER_CONFIG.headerLeft.x,
    y: MASTER_CONFIG.headerLeft.y,
    fontSize: MASTER_CONFIG.headerLeft.fontSize,
    color: MASTER_CONFIG.headerLeft.color,
  });
  
  slide.addText(MASTER_CONFIG.headerRight.text, {
    x: MASTER_CONFIG.headerRight.x,
    y: MASTER_CONFIG.headerRight.y,
    fontSize: MASTER_CONFIG.headerRight.fontSize,
    color: MASTER_CONFIG.headerRight.color,
  });
  
  // 좌상단 정보 박스
  const infoText = [
    `날짜: ${formatDate(task.completed_at!)}`,
    `카테고리: ${task.category}`,
    `프로젝트명: ${task.title}`,
    `담당자: ${task.requester_name}`,
  ].join('\n');
  
  slide.addText(infoText, {
    x: 0.5,
    y: 1,
    w: 3,
    h: 1.5,
    fontSize: 11,
    color: '333333',
    valign: 'top',
  });
  
  // 메인 이미지 영역 (80% 차지)
  if (task.image_urls && task.image_urls.length > 0) {
    const imageCount = task.image_urls.length;
    
    if (imageCount === 1) {
      // 단일 이미지 - 중앙 크게 배치
      slide.addImage({
        path: task.image_urls[0],
        x: 1.5,
        y: 1.5,
        w: 7.5,
        h: 4.5,
        sizing: { type: 'contain', w: 7.5, h: 4.5 },
      });
    } else if (imageCount === 2) {
      // 2개 이미지 - 좌우 배치
      slide.addImage({
        path: task.image_urls[0],
        x: 1,
        y: 1.5,
        w: 4,
        h: 4.5,
        sizing: { type: 'contain', w: 4, h: 4.5 },
      });
      slide.addImage({
        path: task.image_urls[1],
        x: 5.5,
        y: 1.5,
        w: 4,
        h: 4.5,
        sizing: { type: 'contain', w: 4, h: 4.5 },
      });
    } else {
      // 3개 이상 - 그리드 배치
      const cols = 2;
      const rows = Math.ceil(imageCount / cols);
      const imgW = 4;
      const imgH = 3;
      
      task.image_urls.slice(0, 4).forEach((url, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        
        slide.addImage({
          path: url,
          x: 1 + col * 4.5,
          y: 1.5 + row * 3.2,
          w: imgW,
          h: imgH,
          sizing: { type: 'contain', w: imgW, h: imgH },
        });
      });
    }
  }
}

/**
 * PPT 생성 메인 함수
 * @param tasks - 완료된 업무 목록
 * @returns PptxGenJS 인스턴스
 */
export async function generateWeeklyPPT(tasks: Task[]): Promise<PptxGenJS> {
  const pptx = new PptxGenJS();
  
  // PPT 메타데이터
  const { start, end } = getWeeklyDateRange();
  pptx.author = '아마노코리아 기획홍보팀';
  pptx.company = '아마노코리아';
  pptx.title = `주간보고서 ${formatDate(start.toISOString())} ~ ${formatDate(end.toISOString())}`;
  
  // 업무를 카테고리별로 분류
  const typeATasks: { [key: string]: Task[] } = {};
  const typeBTasks: Task[] = [];
  
  tasks.forEach((task) => {
    const hasImages = task.image_urls && task.image_urls.length > 0;
    const isImageCategory = ['디자인', '3D MAX', '맵작업'].includes(task.category);
    
    if (isImageCategory && hasImages) {
      // Type B: 이미지 중심
      typeBTasks.push(task);
    } else {
      // Type A: 리스트형
      if (!typeATasks[task.category]) {
        typeATasks[task.category] = [];
      }
      typeATasks[task.category].push(task);
    }
  });
  
  // Type A 슬라이드 생성 (카테고리별 그룹화)
  Object.entries(typeATasks).forEach(([category, categoryTasks]) => {
    createTypeASlide(pptx, categoryTasks);
  });
  
  // Type B 슬라이드 생성 (업무별 개별)
  typeBTasks.forEach((task) => {
    createTypeBSlide(pptx, task);
  });
  
  return pptx;
}

/**
 * PPT 파일 다운로드
 * @param pptx - PptxGenJS 인스턴스
 * @param filename - 저장할 파일명
 */
export async function downloadPPT(pptx: PptxGenJS, filename: string) {
  await pptx.writeFile({ fileName: filename });
}
