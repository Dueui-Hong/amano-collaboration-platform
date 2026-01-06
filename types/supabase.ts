// ============================================
// Supabase Database Types
// Supabase CLI로 생성: npx supabase gen types typescript --project-id [PROJECT_ID]
// ============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          employee_id: string
          email: string
          name: string
          password_hash: string
          role: 'DEPARTMENT_HEAD' | 'TEAM_LEADER' | 'TEAM_MEMBER'
          team: '기획홍보팀' | '통합수주관리팀' | '부서장'
          position: string | null
          profile_image_url: string | null
          is_first_login: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          email: string
          name: string
          password_hash: string
          role: 'DEPARTMENT_HEAD' | 'TEAM_LEADER' | 'TEAM_MEMBER'
          team: '기획홍보팀' | '통합수주관리팀' | '부서장'
          position?: string | null
          profile_image_url?: string | null
          is_first_login?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          email?: string
          name?: string
          password_hash?: string
          role?: 'DEPARTMENT_HEAD' | 'TEAM_LEADER' | 'TEAM_MEMBER'
          team?: '기획홍보팀' | '통합수주관리팀' | '부서장'
          position?: string | null
          profile_image_url?: string | null
          is_first_login?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      schedules: {
        Row: {
          id: string
          title: string
          description: string | null
          start_date: string
          end_date: string
          type: 'PUBLIC' | 'PRIVATE'
          color: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          start_date: string
          end_date: string
          type: 'PUBLIC' | 'PRIVATE'
          color?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_date?: string
          end_date?: string
          type?: 'PUBLIC' | 'PRIVATE'
          color?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      weekly_reports: {
        Row: {
          id: string
          author_id: string
          week_start_date: string
          week_end_date: string
          this_week_work: string
          next_week_plan: string
          issues: string | null
          status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
          reviewer_id: string | null
          reviewer_comment: string | null
          reviewed_at: string | null
          submitted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          week_start_date: string
          week_end_date: string
          this_week_work: string
          next_week_plan: string
          issues?: string | null
          status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
          reviewer_id?: string | null
          reviewer_comment?: string | null
          reviewed_at?: string | null
          submitted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          week_start_date?: string
          week_end_date?: string
          this_week_work?: string
          next_week_plan?: string
          issues?: string | null
          status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
          reviewer_id?: string | null
          reviewer_comment?: string | null
          reviewed_at?: string | null
          submitted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          content: string
          category: string | null
          author_id: string
          is_public: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category?: string | null
          author_id: string
          is_public?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: string | null
          author_id?: string
          is_public?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      post_permissions: {
        Row: {
          id: string
          post_id: string
          user_id: string
          granted_by: string
          granted_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          granted_by: string
          granted_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          granted_by?: string
          granted_at?: string
        }
      }
      system_config: {
        Row: {
          id: string
          config_key: string
          config_value: string
          description: string | null
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          config_key: string
          config_value: string
          description?: string | null
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          config_key?: string
          config_value?: string
          description?: string | null
          updated_by?: string | null
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          target_type: string | null
          target_id: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          target_type?: string | null
          target_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          target_type?: string | null
          target_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
