/**
 * Supabase Client Configuration
 * 서버 및 클라이언트 환경에서 Supabase 클라이언트 생성
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// 클라이언트 사이드용 Supabase 클라이언트
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 서버 사이드용 Supabase 클라이언트 (Service Role Key 사용)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
