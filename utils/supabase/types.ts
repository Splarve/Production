export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string | null
          description: string | null
          handle: string
          id: string
          logo_url: string | null
          name: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          handle: string
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          handle?: string
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      company_invitations: {
        Row: {
          company_id: string
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string
          message: string | null
          role: string
          status: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by: string
          message?: string | null
          role: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string
          message?: string | null
          role?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_members: {
        Row: {
          company_id: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          role: string
          role_id: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          role: string
          role_id?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          role?: string
          role_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "company_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_role_permissions: {
        Row: {
          created_at: string | null
          enabled: boolean
          id: number
          permission: string
          role_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean
          id?: number
          permission: string
          role_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean
          id?: number
          permission?: string
          role_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "company_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_roles: {
        Row: {
          color: string | null
          company_id: string
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          position: number
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          position?: number
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          position?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      job_posts: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string
          description: string
          experience_level: string | null
          id: string
          job_type: string | null
          location: string | null
          published: boolean | null
          published_at: string | null
          salary_range: string | null
          skills: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          created_by: string
          description: string
          experience_level?: string | null
          id?: string
          job_type?: string | null
          location?: string | null
          published?: boolean | null
          published_at?: string | null
          salary_range?: string | null
          skills?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string
          description?: string
          experience_level?: string | null
          id?: string
          job_type?: string | null
          location?: string | null
          published?: boolean | null
          published_at?: string | null
          salary_range?: string | null
          skills?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: number
          permission: string
          role: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          permission: string
          role: string
        }
        Update: {
          created_at?: string | null
          id?: number
          permission?: string
          role?: string
        }
        Relationships: []
      }
      system_permissions: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: number
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: number
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      user_types: {
        Row: {
          created_at: string | null
          id: string
          user_type: string
        }
        Insert: {
          created_at?: string | null
          id: string
          user_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_types_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          id: string | null
        }
        Insert: {
          avatar_url?: never
          email?: string | null
          full_name?: never
          id?: string | null
        }
        Update: {
          avatar_url?: never
          email?: string | null
          full_name?: never
          id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_company_invitation: {
        Args: {
          invitation_id: string
        }
        Returns: Json
      }
      accept_invitation_secure: {
        Args: {
          p_invitation_id: string
        }
        Returns: Json
      }
      change_user_role_secure: {
        Args: {
          target_user_id: string
          company_id: string
          new_role: string
        }
        Returns: Json
      }
      create_company_invitation: {
        Args: {
          p_company_id: string
          p_email: string
          p_role: string
          p_message?: string
        }
        Returns: string
      }
      create_company_role: {
        Args: {
          p_company_id: string
          p_name: string
          p_color?: string
          p_position?: number
          p_permissions?: Json
        }
        Returns: string
      }
      create_job_post: {
        Args: {
          p_company_id: string
          p_title: string
          p_description: string
          p_location: string
          p_salary_range: string
          p_job_type: string
          p_experience_level: string
          p_skills: string[]
          p_published?: boolean
        }
        Returns: string
      }
      delete_company_role: {
        Args: {
          p_role_id: string
          p_transfer_to_role_id: string
        }
        Returns: Json
      }
      delete_invitation: {
        Args: {
          p_invitation_id: string
        }
        Returns: Json
      }
      delete_job_post: {
        Args: {
          p_job_post_id: string
        }
        Returns: Json
      }
      get_company_invites: {
        Args: {
          p_company_id: string
        }
        Returns: {
          id: string
          company_id: string
          invited_by: string
          email: string
          role: string
          status: string
          message: string
          created_at: string
          updated_at: string
          expires_at: string
        }[]
      }
      get_company_job_posts: {
        Args: {
          p_company_id: string
          p_published?: boolean
        }
        Returns: {
          company_id: string
          created_at: string | null
          created_by: string
          description: string
          experience_level: string | null
          id: string
          job_type: string | null
          location: string | null
          published: boolean | null
          published_at: string | null
          salary_range: string | null
          skills: string[] | null
          title: string
          updated_at: string | null
        }[]
      }
      get_company_members: {
        Args: {
          p_company_id: string
        }
        Returns: {
          user_id: string
          role: string
          username: string
          full_name: string
          avatar_url: string
          last_active: string
        }[]
      }
      get_user_invitations: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          company_id: string
          invited_by: string
          email: string
          role: string
          status: string
          message: string
          created_at: string
          updated_at: string
          expires_at: string
          company_name: string
          company_handle: string
          company_logo_url: string
          inviter_name: string
        }[]
      }
      get_user_permissions: {
        Args: {
          user_id: string
          company_id: string
        }
        Returns: {
          permission: string
          enabled: boolean
        }[]
      }
      get_user_type: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      initialize_default_company_roles: {
        Args: {
          company_id: string
        }
        Returns: undefined
      }
      migrate_existing_company_roles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reject_company_invitation: {
        Args: {
          invitation_id: string
        }
        Returns: Json
      }
      reject_invitation_secure: {
        Args: {
          p_invitation_id: string
        }
        Returns: Json
      }
      set_user_type: {
        Args: {
          user_id: string
          account_type: string
        }
        Returns: undefined
      }
      update_company_role: {
        Args: {
          p_role_id: string
          p_name?: string
          p_color?: string
          p_position?: number
          p_permissions?: Json
        }
        Returns: Json
      }
      update_job_post: {
        Args: {
          p_job_post_id: string
          p_title?: string
          p_description?: string
          p_location?: string
          p_salary_range?: string
          p_job_type?: string
          p_experience_level?: string
          p_skills?: string[]
          p_published?: boolean
        }
        Returns: Json
      }
      user_has_permission: {
        Args: {
          user_id: string
          company_id: string
          required_permission: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export type Company = Database['public']['Tables']['companies']['Row']
export type CompanyMember = Database['public']['Tables']['company_members']['Row']
export type CompanyInvitation = Database['public']['Tables']['company_invitations']['Row']