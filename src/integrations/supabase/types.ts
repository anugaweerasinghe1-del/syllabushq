export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assignment_submissions: {
        Row: {
          assignment_id: string
          detail: Json
          id: string
          marks_awarded: number
          student_id: string
          submitted_at: string
          total_marks: number
        }
        Insert: {
          assignment_id: string
          detail?: Json
          id?: string
          marks_awarded?: number
          student_id: string
          submitted_at?: string
          total_marks?: number
        }
        Update: {
          assignment_id?: string
          detail?: Json
          id?: string
          marks_awarded?: number
          student_id?: string
          submitted_at?: string
          total_marks?: number
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          class_id: string
          created_at: string
          created_by: string
          due_at: string | null
          id: string
          mode: string
          question_count: number
          subject: string
          timer_minutes: number | null
          title: string
          topics: string[]
        }
        Insert: {
          class_id: string
          created_at?: string
          created_by: string
          due_at?: string | null
          id?: string
          mode?: string
          question_count?: number
          subject: string
          timer_minutes?: number | null
          title: string
          topics?: string[]
        }
        Update: {
          class_id?: string
          created_at?: string
          created_by?: string
          due_at?: string | null
          id?: string
          mode?: string
          question_count?: number
          subject?: string
          timer_minutes?: number | null
          title?: string
          topics?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      attempts: {
        Row: {
          created_at: string
          id: string
          marks_awarded: number
          mode: string
          question_hash: string | null
          subject: string
          topic: string | null
          total_marks: number
          user_id: string | null
          visitor_token: string
        }
        Insert: {
          created_at?: string
          id?: string
          marks_awarded?: number
          mode: string
          question_hash?: string | null
          subject: string
          topic?: string | null
          total_marks?: number
          user_id?: string | null
          visitor_token: string
        }
        Update: {
          created_at?: string
          id?: string
          marks_awarded?: number
          mode?: string
          question_hash?: string | null
          subject?: string
          topic?: string | null
          total_marks?: number
          user_id?: string | null
          visitor_token?: string
        }
        Relationships: []
      }
      class_members: {
        Row: {
          class_id: string
          id: string
          joined_at: string
          student_id: string
        }
        Insert: {
          class_id: string
          id?: string
          joined_at?: string
          student_id: string
        }
        Update: {
          class_id?: string
          id?: string
          joined_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_members_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          id: string
          join_code: string
          name: string
          subject: string | null
          teacher_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          join_code: string
          name: string
          subject?: string | null
          teacher_id: string
        }
        Update: {
          created_at?: string
          id?: string
          join_code?: string
          name?: string
          subject?: string | null
          teacher_id?: string
        }
        Relationships: []
      }
      generated_questions: {
        Row: {
          created_at: string
          difficulty: string
          hash: string
          mode: string
          payload: Json
          subject: string
          topic: string | null
        }
        Insert: {
          created_at?: string
          difficulty: string
          hash: string
          mode: string
          payload: Json
          subject: string
          topic?: string | null
        }
        Update: {
          created_at?: string
          difficulty?: string
          hash?: string
          mode?: string
          payload?: Json
          subject?: string
          topic?: string | null
        }
        Relationships: []
      }
      mastery: {
        Row: {
          attempts_count: number
          correct_count: number
          id: string
          subject: string
          tier: string
          topic: string
          updated_at: string
          user_id: string | null
          visitor_token: string
        }
        Insert: {
          attempts_count?: number
          correct_count?: number
          id?: string
          subject: string
          tier?: string
          topic: string
          updated_at?: string
          user_id?: string | null
          visitor_token: string
        }
        Update: {
          attempts_count?: number
          correct_count?: number
          id?: string
          subject?: string
          tier?: string
          topic?: string
          updated_at?: string
          user_id?: string | null
          visitor_token?: string
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          created_at: string
          detail: Json
          id: string
          marks_awarded: number
          mode: string
          subject: string
          topic: string | null
          total_marks: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          detail?: Json
          id?: string
          marks_awarded?: number
          mode: string
          subject: string
          topic?: string | null
          total_marks?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          detail?: Json
          id?: string
          marks_awarded?: number
          mode?: string
          subject?: string
          topic?: string | null
          total_marks?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          grade: string | null
          id: string
          school: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          grade?: string | null
          id: string
          school?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          grade?: string | null
          id?: string
          school?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string
          created_at: string
          id: string
          name: string
          rating: number
          visitor_token: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          name: string
          rating: number
          visitor_token: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          name?: string
          rating?: number
          visitor_token?: string
        }
        Relationships: []
      }
      suggestions: {
        Row: {
          created_at: string
          id: string
          idea: string
          name: string
          visitor_token: string
        }
        Insert: {
          created_at?: string
          id?: string
          idea: string
          name: string
          visitor_token: string
        }
        Update: {
          created_at?: string
          id?: string
          idea?: string
          name?: string
          visitor_token?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assignment_class: { Args: { _assignment_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_class_member: {
        Args: { _class_id: string; _user_id: string }
        Returns: boolean
      }
      is_class_teacher: {
        Args: { _class_id: string; _user_id: string }
        Returns: boolean
      }
      shares_class: { Args: { _a: string; _b: string }; Returns: boolean }
    }
    Enums: {
      app_role: "teacher" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["teacher", "student"],
    },
  },
} as const
