/**
 * 전역 모바일 반응형 스타일
 * 모든 페이지에 공통 적용되는 모바일 최적화 CSS
 */

export const globalMobileStyles = `
  /* 작은 모바일 (360-480px) */
  @media (max-width: 480px) {
    /* 전체 컨테이너 */
    * {
      box-sizing: border-box;
    }
    
    body {
      font-size: 14px !important;
      line-height: 1.5 !important;
    }
    
    /* 제목 크기 */
    h1 {
      font-size: 20px !important;
      line-height: 1.3 !important;
      margin-bottom: 8px !important;
    }
    
    h2 {
      font-size: 18px !important;
      line-height: 1.3 !important;
    }
    
    h3 {
      font-size: 16px !important;
      line-height: 1.3 !important;
    }
    
    /* 패딩 및 마진 줄이기 */
    div[style*="padding: 32px"] {
      padding: 12px !important;
    }
    
    div[style*="padding: 24px"] {
      padding: 12px !important;
    }
    
    div[style*="padding: 20px"] {
      padding: 10px !important;
    }
    
    div[style*="padding: 16px"] {
      padding: 8px !important;
    }
    
    /* 버튼 크기 조정 */
    button {
      font-size: 13px !important;
      padding: 10px 16px !important;
      min-height: 44px !important; /* 터치 최소 크기 */
    }
    
    /* 입력 필드 */
    input, textarea, select {
      font-size: 16px !important; /* iOS 줌 방지 */
      padding: 10px !important;
    }
    
    /* 카드 간격 */
    div[style*="gap: 24px"] {
      gap: 12px !important;
    }
    
    div[style*="gap: 20px"] {
      gap: 10px !important;
    }
    
    /* 그리드 1열로 */
    div[style*="grid-template-columns"] {
      grid-template-columns: 1fr !important;
    }
    
    /* 플렉스 세로 정렬 */
    div[style*="display: flex"][style*="flex-direction: row"] {
      flex-direction: column !important;
    }
  }
  
  /* 모바일 (481-768px) */
  @media (min-width: 481px) and (max-width: 768px) {
    h1 {
      font-size: 24px !important;
    }
    
    h2 {
      font-size: 20px !important;
    }
    
    div[style*="padding: 32px"] {
      padding: 16px !important;
    }
    
    button {
      font-size: 14px !important;
      padding: 12px 20px !important;
    }
  }
  
  /* 태블릿 (769-1024px) */
  @media (min-width: 769px) and (max-width: 1024px) {
    div[style*="padding: 32px"] {
      padding: 24px !important;
    }
  }
  
  /* 세로 모드 전용 스타일 */
  @media (orientation: portrait) and (max-width: 768px) {
    /* 모든 그리드를 1열로 */
    .stats-grid,
    .members-grid,
    .posts-grid,
    .kanban-grid,
    .tasks-grid {
      grid-template-columns: 1fr !important;
    }
    
    /* 사이드바가 있는 레이아웃 */
    div[style*="display: flex"] > div:first-child[style*="width: 240px"] {
      width: 100% !important;
    }
  }
  
  /* 가로 모드 태블릿 */
  @media (orientation: landscape) and (min-width: 768px) and (max-width: 1024px) {
    .stats-grid {
      grid-template-columns: repeat(3, 1fr) !important;
    }
    
    .posts-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
`;

export default globalMobileStyles;
