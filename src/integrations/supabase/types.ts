export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          details: string | null
          id: string
          request_id: string | null
          timestamp: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          details?: string | null
          id?: string
          request_id?: string | null
          timestamp?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          details?: string | null
          id?: string
          request_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "exit_requests"
            referencedColumns: ["id"]
          }
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      exit_requests: {
        Row: {
          actual_return_date: string | null
          additional_comments: string | null
          created_at: string | null
          destination: string
          documents_verified: boolean | null
          exit_type: Database["public"]["Enums"]["exit_type"] | null
          expected_return_date: string
          has_classes: boolean | null
          hod_comment: string | null
          hod_status: Database["public"]["Enums"]["approval_status"] | null
          id: string
          id_card_url: string | null
          parent_letter_url: string | null
          qr_code: string | null
          reason: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["request_status"]
          student_id: string
          updated_at: string | null
        }
        Insert: {
          actual_return_date?: string | null
          additional_comments?: string | null
          created_at?: string | null
          destination: string
          documents_verified?: boolean | null
          exit_type?: Database["public"]["Enums"]["exit_type"] | null
          expected_return_date: string
          has_classes?: boolean | null
          hod_comment?: string | null
          hod_status?: Database["public"]["Enums"]["approval_status"] | null
          id?: string
          id_card_url?: string | null
          parent_letter_url?: string | null
          qr_code?: string | null
          reason: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          student_id: string
          updated_at?: string | null
        }
        Update: {
          actual_return_date?: string | null
          additional_comments?: string | null
          created_at?: string | null
          destination?: string
          documents_verified?: boolean | null
          exit_type?: Database["public"]["Enums"]["exit_type"] | null
          expected_return_date?: string
          has_classes?: boolean | null
          hod_comment?: string | null
          hod_status?: Database["public"]["Enums"]["approval_status"] | null
          id?: string
          id_card_url?: string | null
          parent_letter_url?: string | null
          qr_code?: string | null
          reason?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
             foreignKeyName: "exit_requests_student_id_fkey"
             columns: ["student_id"]
             isOneToOne: false
             referencedRelation: "students"
             referencedColumns: ["id"]
          }
        ]
      }
      hall_admins: {
        Row: {
          created_at: string | null
          full_name: string
          hall_admin_id: string
          hall_id: string
          id: string
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          hall_admin_id: string
          hall_id: string
          id: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          hall_admin_id?: string
          hall_id?: string
          id?: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hall_admins_hall_id_fkey"
            columns: ["hall_id"]
            isOneToOne: true
            referencedRelation: "halls"
            referencedColumns: ["id"]
          },
        ]
      }
      halls: {
        Row: {
          capacity: number | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      hods: {
        Row: {
          created_at: string | null
          department_id: string | null
          full_name: string
          id: string
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          full_name: string
          id: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          full_name?: string
          id?: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hods_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          }
        ]
      }
      security_personnel: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          phone_number: string | null
          security_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id: string
          phone_number?: string | null
          security_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          phone_number?: string | null
          security_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          created_at: string | null
          department_id: string | null
          full_name: string
          hall_id: string | null
          id: string
          phone_number: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          full_name: string
          hall_id?: string | null
          id: string
          phone_number?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          full_name?: string
          hall_id?: string | null
          id?: string
          phone_number?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_hall_id_fkey"
            columns: ["hall_id"]
            isOneToOne: false
            referencedRelation: "halls"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admins: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "hall_admin" | "security" | "super_admin" | "hod"
      approval_status: "pending" | "approved" | "rejected"
      exit_type: "day" | "overnight"
      request_status:
        | "pending"
        | "approved"
        | "declined"
        | "exited"
        | "returned"
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
      app_role: ["student", "hall_admin", "security", "super_admin", "hod"],
      approval_status: ["pending", "approved", "rejected"],
      exit_type: ["day", "overnight"],
      request_status: ["pending", "approved", "declined", "exited", "returned"],
    },
  },
} as const