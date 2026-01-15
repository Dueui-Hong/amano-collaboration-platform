/**
 * Supabase Client Configuration
 * 서버 및 클라이언트 환경에서 Supabase 클라이언트 생성
 */

import { createClient } from '@supabase/supabase-js';

// 환경변수 안전하게 가져오기
const getEnvVar = (key: string): string => {
  if (typeof window !== 'undefined') {
    // 클라이언트 사이드
    return (window as any).__ENV__?.[key] || process.env[key] || '';
  }
  // 서버 사이드
  return process.env[key] || '';
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL') || 'https://wsredeftfoelzgkdalhx.supabase.co';
const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzcmVkZWZ0Zm9lbHpna2RhbGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MjI4NzgsImV4cCI6MjA4Mzk5ODg3OH0.NK-VW8aaV3gr_yIZaF242kvuwhX9th0RNev7DquzVaw';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

// 클라이언트 사이드용 Supabase 클라이언트
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// 서버 사이드용 Supabase 클라이언트 (Service Role Key 사용)
const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzcmVkZWZ0Zm9lbHpna2RhbGh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQyMjg3OCwiZXhwIjoyMDgzOTk4ODc4fQ.8pmmg9u_xWByOYt2UXL0kilUUCMvIYj8izPsE0kHKRM';

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// TypeScript 타입 정의
export type Profile = {
  id: string;
  name: string;
  role: 'admin' | 'member';
  position: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  title: string;
  requester_dept: string;
  requester_name: string;
  description: string | null;
  status: 'Unassigned' | 'Todo' | 'Doing' | 'Done';
  category: '기획' | '디자인' | '영상' | '3D MAX' | '맵작업' | '시설점검';
  due_date: string;
  completed_at: string | null;
  assignee_id: string | null;
  image_urls: string[];
  created_at: string;
  updated_at: string;
};
