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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_reference: string | null
          created_at: string
          daily_reports_completed: number | null
          daily_reports_required: number | null
          end_date: string
          end_time: string | null
          id: string
          owner_id: string
          owner_notes: string | null
          payment_status: string | null
          pet_ids: string[]
          platform_fee: number
          service_type: Database["public"]["Enums"]["service_type"]
          sitter_id: string
          sitter_notes: string | null
          special_instructions: string | null
          start_date: string
          start_time: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          booking_reference?: string | null
          created_at?: string
          daily_reports_completed?: number | null
          daily_reports_required?: number | null
          end_date: string
          end_time?: string | null
          id?: string
          owner_id: string
          owner_notes?: string | null
          payment_status?: string | null
          pet_ids: string[]
          platform_fee?: number
          service_type: Database["public"]["Enums"]["service_type"]
          sitter_id: string
          sitter_notes?: string | null
          special_instructions?: string | null
          start_date: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          booking_reference?: string | null
          created_at?: string
          daily_reports_completed?: number | null
          daily_reports_required?: number | null
          end_date?: string
          end_time?: string | null
          id?: string
          owner_id?: string
          owner_notes?: string | null
          payment_status?: string | null
          pet_ids?: string[]
          platform_fee?: number
          service_type?: Database["public"]["Enums"]["service_type"]
          sitter_id?: string
          sitter_notes?: string | null
          special_instructions?: string | null
          start_date?: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_reports: {
        Row: {
          booking_id: string
          created_at: string
          exercise_duration: number | null
          exercise_notes: string | null
          food_consumption: string | null
          food_notes: string | null
          general_notes: string
          id: string
          medication_given: boolean | null
          medication_notes: string | null
          mood: string | null
          photo_urls: string[]
          report_date: string
          sitter_id: string
          sleep_notes: string | null
          sleep_quality: string | null
          submitted_at: string
          time_alone_hours: number | null
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          exercise_duration?: number | null
          exercise_notes?: string | null
          food_consumption?: string | null
          food_notes?: string | null
          general_notes: string
          id?: string
          medication_given?: boolean | null
          medication_notes?: string | null
          mood?: string | null
          photo_urls?: string[]
          report_date: string
          sitter_id: string
          sleep_notes?: string | null
          sleep_quality?: string | null
          submitted_at?: string
          time_alone_hours?: number | null
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          exercise_duration?: number | null
          exercise_notes?: string | null
          food_consumption?: string | null
          food_notes?: string | null
          general_notes?: string
          id?: string
          medication_given?: boolean | null
          medication_notes?: string | null
          mood?: string | null
          photo_urls?: string[]
          report_date?: string
          sitter_id?: string
          sleep_notes?: string | null
          sleep_quality?: string | null
          submitted_at?: string
          time_alone_hours?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          sitter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          sitter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          sitter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          booking_id: string | null
          content: string
          created_at: string
          id: string
          image_urls: string[] | null
          is_read: boolean | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          booking_id?: string | null
          content: string
          created_at?: string
          id?: string
          image_urls?: string[] | null
          is_read?: boolean | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          booking_id?: string | null
          content?: string
          created_at?: string
          id?: string
          image_urls?: string[] | null
          is_read?: boolean | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          age: number | null
          breed: string | null
          created_at: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          exercise_needs: string | null
          feeding_instructions: string | null
          gender: string | null
          id: string
          is_neutered: boolean | null
          medical_conditions: string[] | null
          medications: string[] | null
          name: string
          owner_id: string
          personality_traits: string[] | null
          photo_urls: string[] | null
          size: Database["public"]["Enums"]["pet_size"] | null
          special_care_notes: string | null
          species: Database["public"]["Enums"]["pet_species"]
          updated_at: string
          vaccination_status: boolean | null
          weight: number | null
        }
        Insert: {
          age?: number | null
          breed?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          exercise_needs?: string | null
          feeding_instructions?: string | null
          gender?: string | null
          id?: string
          is_neutered?: boolean | null
          medical_conditions?: string[] | null
          medications?: string[] | null
          name: string
          owner_id: string
          personality_traits?: string[] | null
          photo_urls?: string[] | null
          size?: Database["public"]["Enums"]["pet_size"] | null
          special_care_notes?: string | null
          species: Database["public"]["Enums"]["pet_species"]
          updated_at?: string
          vaccination_status?: boolean | null
          weight?: number | null
        }
        Update: {
          age?: number | null
          breed?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          exercise_needs?: string | null
          feeding_instructions?: string | null
          gender?: string | null
          id?: string
          is_neutered?: boolean | null
          medical_conditions?: string[] | null
          medications?: string[] | null
          name?: string
          owner_id?: string
          personality_traits?: string[] | null
          photo_urls?: string[] | null
          size?: Database["public"]["Enums"]["pet_size"] | null
          special_care_notes?: string | null
          species?: Database["public"]["Enums"]["pet_species"]
          updated_at?: string
          vaccination_status?: boolean | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          background_check_verified: boolean | null
          bio: string | null
          blue_card_document_url: string | null
          city: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          id_document_url: string | null
          is_verified: boolean | null
          last_name: string
          latitude: number | null
          longitude: number | null
          onboarding_completed: boolean | null
          phone: string | null
          postal_code: string | null
          rating: number | null
          response_rate: number | null
          role: Database["public"]["Enums"]["user_role"]
          suburb: string | null
          total_reviews: number | null
          updated_at: string
          user_id: string
          verification_documents_uploaded_at: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          background_check_verified?: boolean | null
          bio?: string | null
          blue_card_document_url?: string | null
          city?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          id_document_url?: string | null
          is_verified?: boolean | null
          last_name: string
          latitude?: number | null
          longitude?: number | null
          onboarding_completed?: boolean | null
          phone?: string | null
          postal_code?: string | null
          rating?: number | null
          response_rate?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          suburb?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          verification_documents_uploaded_at?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          background_check_verified?: boolean | null
          bio?: string | null
          blue_card_document_url?: string | null
          city?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          id_document_url?: string | null
          is_verified?: boolean | null
          last_name?: string
          latitude?: number | null
          longitude?: number | null
          onboarding_completed?: boolean | null
          phone?: string | null
          postal_code?: string | null
          rating?: number | null
          response_rate?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          suburb?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
          verification_documents_uploaded_at?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          is_for_sitter: boolean
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          is_for_sitter: boolean
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          is_for_sitter?: boolean
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sitter_availability: {
        Row: {
          created_at: string
          date: string
          id: string
          is_available: boolean | null
          notes: string | null
          sitter_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_available?: boolean | null
          notes?: string | null
          sitter_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_available?: boolean | null
          notes?: string | null
          sitter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sitter_availability_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sitter_services: {
        Row: {
          accepted_pet_sizes: Database["public"]["Enums"]["pet_size"][] | null
          accepted_pet_species:
            | Database["public"]["Enums"]["pet_species"][]
            | null
          allows_puppies: boolean | null
          allows_senior_pets: boolean | null
          created_at: string
          daily_rate: number | null
          description: string | null
          experience_years: number | null
          has_fenced_yard: boolean | null
          hourly_rate: number | null
          id: string
          is_offered: boolean | null
          max_pets: number | null
          overnight_rate: number | null
          service_type: Database["public"]["Enums"]["service_type"]
          sitter_id: string
          updated_at: string
        }
        Insert: {
          accepted_pet_sizes?: Database["public"]["Enums"]["pet_size"][] | null
          accepted_pet_species?:
            | Database["public"]["Enums"]["pet_species"][]
            | null
          allows_puppies?: boolean | null
          allows_senior_pets?: boolean | null
          created_at?: string
          daily_rate?: number | null
          description?: string | null
          experience_years?: number | null
          has_fenced_yard?: boolean | null
          hourly_rate?: number | null
          id?: string
          is_offered?: boolean | null
          max_pets?: number | null
          overnight_rate?: number | null
          service_type: Database["public"]["Enums"]["service_type"]
          sitter_id: string
          updated_at?: string
        }
        Update: {
          accepted_pet_sizes?: Database["public"]["Enums"]["pet_size"][] | null
          accepted_pet_species?:
            | Database["public"]["Enums"]["pet_species"][]
            | null
          allows_puppies?: boolean | null
          allows_senior_pets?: boolean | null
          created_at?: string
          daily_rate?: number | null
          description?: string | null
          experience_years?: number | null
          has_fenced_yard?: boolean | null
          hourly_rate?: number | null
          id?: string
          is_offered?: boolean | null
          max_pets?: number | null
          overnight_rate?: number | null
          service_type?: Database["public"]["Enums"]["service_type"]
          sitter_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sitter_services_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_pet_basic_info: {
        Args: { pet_id: string }
        Returns: boolean
      }
      can_access_pet_sensitive_data: {
        Args: { pet_id: string }
        Returns: boolean
      }
      can_access_sitter_contact: {
        Args: { sitter_profile_id: string }
        Returns: boolean
      }
      get_pet_basic_info_for_booking: {
        Args: { booking_id: string }
        Returns: {
          age: number
          breed: string
          exercise_needs: string
          feeding_instructions: string
          gender: string
          id: string
          name: string
          personality_traits: string[]
          photo_urls: string[]
          size: Database["public"]["Enums"]["pet_size"]
          special_care_notes: string
          species: Database["public"]["Enums"]["pet_species"]
          weight: number
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_verification_status: {
        Args: {
          is_verified: boolean
          profile_id: string
          verification_status: string
        }
        Returns: undefined
      }
    }
    Enums: {
      booking_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
      pet_size: "small" | "medium" | "large" | "extra_large"
      pet_species:
        | "dog"
        | "cat"
        | "bird"
        | "rabbit"
        | "reptile"
        | "fish"
        | "other"
      service_type:
        | "overnight_boarding"
        | "daycare"
        | "dog_walking"
        | "drop_in_visits"
        | "grooming"
        | "medication_admin"
        | "pet_sitting_owners_home"
        | "pet_sitting_sitters_home"
      user_role: "pet_owner" | "pet_sitter" | "admin"
      verification_status: "pending" | "verified" | "rejected"
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
      booking_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      pet_size: ["small", "medium", "large", "extra_large"],
      pet_species: ["dog", "cat", "bird", "rabbit", "reptile", "fish", "other"],
      service_type: [
        "overnight_boarding",
        "daycare",
        "dog_walking",
        "drop_in_visits",
        "grooming",
        "medication_admin",
        "pet_sitting_owners_home",
        "pet_sitting_sitters_home",
      ],
      user_role: ["pet_owner", "pet_sitter", "admin"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
