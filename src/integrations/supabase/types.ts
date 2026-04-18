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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          id: string
          key: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          replay_id: string
          user_id: string
          username: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          replay_id: string
          user_id: string
          username: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          replay_id?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_replay_id_fkey"
            columns: ["replay_id"]
            isOneToOne: false
            referencedRelation: "replays"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_claims: {
        Row: {
          claimed_at: string
          gift_id: string
          id: string
          user_id: string
        }
        Insert: {
          claimed_at?: string
          gift_id: string
          id?: string
          user_id: string
        }
        Update: {
          claimed_at?: string
          gift_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_claims_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "gifts"
            referencedColumns: ["id"]
          },
        ]
      }
      gifts: {
        Row: {
          claimed_count: number
          created_at: string
          created_by: string
          id: string
          max_winners: number
          replay_id: string
          token: string
        }
        Insert: {
          claimed_count?: number
          created_at?: string
          created_by: string
          id?: string
          max_winners?: number
          replay_id: string
          token?: string
        }
        Update: {
          claimed_count?: number
          created_at?: string
          created_by?: string
          id?: string
          max_winners?: number
          replay_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "gifts_replay_id_fkey"
            columns: ["replay_id"]
            isOneToOne: false
            referencedRelation: "replays"
            referencedColumns: ["id"]
          },
        ]
      }
      lottery_results: {
        Row: {
          claimed: boolean
          created_at: string
          id: string
          prize_key: string
          prize_name: string
          user_id: string
        }
        Insert: {
          claimed?: boolean
          created_at?: string
          id?: string
          prize_key: string
          prize_name: string
          user_id: string
        }
        Update: {
          claimed?: boolean
          created_at?: string
          id?: string
          prize_key?: string
          prize_name?: string
          user_id?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          created_at: string
          created_by: string
          duration: string
          expires_at: string | null
          id: string
          is_used: boolean
          token: string
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          created_by: string
          duration: string
          expires_at?: string | null
          id?: string
          is_used?: boolean
          token: string
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          created_by?: string
          duration?: string
          expires_at?: string | null
          id?: string
          is_used?: boolean
          token?: string
        }
        Relationships: []
      }
      playlist_items: {
        Row: {
          added_at: string
          id: string
          playlist_id: string
          replay_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          playlist_id: string
          replay_id: string
        }
        Update: {
          added_at?: string
          id?: string
          playlist_id?: string
          replay_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_items_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_items_replay_id_fkey"
            columns: ["replay_id"]
            isOneToOne: false
            referencedRelation: "replays"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          token?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          created_at: string
          id: string
          rating: number
          replay_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          replay_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          replay_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_replay_id_fkey"
            columns: ["replay_id"]
            isOneToOne: false
            referencedRelation: "replays"
            referencedColumns: ["id"]
          },
        ]
      }
      replay_lineups: {
        Row: {
          banner: string | null
          created_at: string
          id: string
          members: Json
          poster: string | null
          replay_id: string
          show_date: string | null
          show_external_id: string | null
          show_team: string | null
          show_title: string
          updated_at: string
        }
        Insert: {
          banner?: string | null
          created_at?: string
          id?: string
          members?: Json
          poster?: string | null
          replay_id: string
          show_date?: string | null
          show_external_id?: string | null
          show_team?: string | null
          show_title: string
          updated_at?: string
        }
        Update: {
          banner?: string | null
          created_at?: string
          id?: string
          members?: Json
          poster?: string | null
          replay_id?: string
          show_date?: string | null
          show_external_id?: string | null
          show_team?: string | null
          show_title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "replay_lineups_replay_id_fkey"
            columns: ["replay_id"]
            isOneToOne: true
            referencedRelation: "replays"
            referencedColumns: ["id"]
          },
        ]
      }
      replay_unlock_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_used: boolean
          replay_id: string
          token: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          replay_id: string
          token?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          replay_id?: string
          token?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "replay_unlock_tokens_replay_id_fkey"
            columns: ["replay_id"]
            isOneToOne: false
            referencedRelation: "replays"
            referencedColumns: ["id"]
          },
        ]
      }
      replay_unlocks: {
        Row: {
          id: string
          replay_id: string
          token_id: string | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          id?: string
          replay_id: string
          token_id?: string | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          id?: string
          replay_id?: string
          token_id?: string | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "replay_unlocks_replay_id_fkey"
            columns: ["replay_id"]
            isOneToOne: false
            referencedRelation: "replays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replay_unlocks_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "replay_unlock_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      replay_views: {
        Row: {
          replay_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          replay_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          replay_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "replay_views_replay_id_fkey"
            columns: ["replay_id"]
            isOneToOne: false
            referencedRelation: "replays"
            referencedColumns: ["id"]
          },
        ]
      }
      replays: {
        Row: {
          created_at: string
          id: string
          is_free: boolean
          show_time: string
          title: string
          type: string
          updated_at: string
          youtube_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_free?: boolean
          show_time?: string
          title: string
          type?: string
          updated_at?: string
          youtube_url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_free?: boolean
          show_time?: string
          title?: string
          type?: string
          updated_at?: string
          youtube_url?: string
        }
        Relationships: []
      }
      role_invitations: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          created_at: string
          created_by: string
          id: string
          is_used: boolean
          target_role: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          created_by: string
          id?: string
          is_used?: boolean
          target_role: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_used?: boolean
          target_role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Relationships: []
      }
      user_coins: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_playlists: {
        Row: {
          added_at: string
          custom_name: string | null
          id: string
          playlist_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          custom_name?: string | null
          id?: string
          playlist_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          custom_name?: string | null
          id?: string
          playlist_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_playlists_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      add_coins: {
        Args: { _amount: number; _user_id: string }
        Returns: undefined
      }
      claim_gift: {
        Args: { _gift_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_at_least_admin: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      spend_coins: {
        Args: { _amount: number; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "super_admin"
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
      app_role: ["admin", "user", "super_admin"],
    },
  },
} as const
