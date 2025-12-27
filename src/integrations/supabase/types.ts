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
      account_cancellation_requests: {
        Row: {
          email: string
          id: string
          processed: boolean | null
          processed_at: string | null
          processed_by: string | null
          reason: string
          requested_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          email: string
          id?: string
          processed?: boolean | null
          processed_at?: string | null
          processed_by?: string | null
          reason: string
          requested_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          email?: string
          id?: string
          processed?: boolean | null
          processed_at?: string | null
          processed_by?: string | null
          reason?: string
          requested_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
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
          penalty_amount: number | null
          penalty_applied: boolean | null
          penalty_applied_at: string | null
          penalty_reason: string | null
          pet_ids: string[]
          platform_fee: number
          promo_code: string | null
          promo_discount_amount: number | null
          requires_daily_reports: boolean
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
          penalty_amount?: number | null
          penalty_applied?: boolean | null
          penalty_applied_at?: string | null
          penalty_reason?: string | null
          pet_ids: string[]
          platform_fee?: number
          promo_code?: string | null
          promo_discount_amount?: number | null
          requires_daily_reports?: boolean
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
          penalty_amount?: number | null
          penalty_applied?: boolean | null
          penalty_applied_at?: string | null
          penalty_reason?: string | null
          pet_ids?: string[]
          platform_fee?: number
          promo_code?: string | null
          promo_discount_amount?: number | null
          requires_daily_reports?: boolean
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
            referencedRelation: "onboarding_funnel"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bookings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_sitters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "onboarding_funnel"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bookings_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "public_sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "public_sitters"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_reports: {
        Row: {
          booking_id: string
          created_at: string
          email_sent_at: string | null
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
          viewed_at: string | null
          viewed_by_owner: boolean | null
        }
        Insert: {
          booking_id: string
          created_at?: string
          email_sent_at?: string | null
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
          viewed_at?: string | null
          viewed_by_owner?: boolean | null
        }
        Update: {
          booking_id?: string
          created_at?: string
          email_sent_at?: string | null
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
          viewed_at?: string | null
          viewed_by_owner?: boolean | null
        }
        Relationships: []
      }
      deleted_users: {
        Row: {
          cancellation_reason: string | null
          created_at: string
          deleted_at: string
          deleted_by_admin: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          user_id: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          created_at?: string
          deleted_at?: string
          deleted_by_admin?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          user_id?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          created_at?: string
          deleted_at?: string
          deleted_by_admin?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_captures: {
        Row: {
          created_at: string
          email: string
          email_count: number | null
          id: string
          last_email_sent_at: string | null
          last_sitter_notification_at: string | null
          name: string | null
          search_location: string | null
          search_service_type: string | null
          source: string | null
          subscribed: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          email_count?: number | null
          id?: string
          last_email_sent_at?: string | null
          last_sitter_notification_at?: string | null
          name?: string | null
          search_location?: string | null
          search_service_type?: string | null
          source?: string | null
          subscribed?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          email_count?: number | null
          id?: string
          last_email_sent_at?: string | null
          last_sitter_notification_at?: string | null
          name?: string | null
          search_location?: string | null
          search_service_type?: string | null
          source?: string | null
          subscribed?: boolean | null
        }
        Relationships: []
      }
      email_subscriptions: {
        Row: {
          booking_notifications: boolean | null
          created_at: string | null
          daily_report_notifications: boolean | null
          id: string
          marketing_emails: boolean | null
          payment_notifications: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_notifications?: boolean | null
          created_at?: string | null
          daily_report_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          payment_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_notifications?: boolean | null
          created_at?: string | null
          daily_report_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          payment_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "onboarding_funnel"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "email_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_sitters"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          created_at: string | null
          description: string | null
          html_content: string
          id: string
          is_active: boolean | null
          subject: string
          template_key: string
          template_name: string
          trigger: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          html_content: string
          id?: string
          is_active?: boolean | null
          subject: string
          template_key: string
          template_name: string
          trigger?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          html_content?: string
          id?: string
          is_active?: boolean | null
          subject?: string
          template_key?: string
          template_name?: string
          trigger?: string | null
          updated_at?: string | null
          variables?: Json | null
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
            referencedRelation: "onboarding_funnel"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "favorites_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_sitters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "onboarding_funnel"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "favorites_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "public_sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "public_sitters"
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
            referencedRelation: "onboarding_funnel"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "public_sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "public_sitters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "onboarding_funnel"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_sitters"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "onboarding_funnel"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_sitters"
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
            referencedRelation: "onboarding_funnel"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "pets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_sitters"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          admin_notes: string | null
          avatar_url: string | null
          background_check_verified: boolean | null
          bio: string | null
          blue_card_document_url: string | null
          city: string | null
          created_at: string
          email: string
          email_verification_sent_at: string | null
          email_verification_token: string | null
          email_verified: boolean | null
          first_name: string
          golden_badge_approved: boolean | null
          golden_badge_approved_at: string | null
          golden_badge_approved_by: string | null
          id: string
          id_document_url: string | null
          id_document_urls: string[] | null
          is_test_account: boolean
          is_verified: boolean | null
          is_young_walker: boolean | null
          last_name: string
          last_onboarding_reminder_at: string | null
          latitude: number | null
          longitude: number | null
          onboarding_completed: boolean | null
          phone: string | null
          postal_code: string | null
          rating: number | null
          response_rate: number | null
          role: Database["public"]["Enums"]["user_role"]
          stripe_account_enabled: boolean | null
          stripe_account_id: string | null
          stripe_onboarding_completed: boolean | null
          suburb: string | null
          terms_accepted: boolean | null
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
          admin_notes?: string | null
          avatar_url?: string | null
          background_check_verified?: boolean | null
          bio?: string | null
          blue_card_document_url?: string | null
          city?: string | null
          created_at?: string
          email: string
          email_verification_sent_at?: string | null
          email_verification_token?: string | null
          email_verified?: boolean | null
          first_name: string
          golden_badge_approved?: boolean | null
          golden_badge_approved_at?: string | null
          golden_badge_approved_by?: string | null
          id?: string
          id_document_url?: string | null
          id_document_urls?: string[] | null
          is_test_account?: boolean
          is_verified?: boolean | null
          is_young_walker?: boolean | null
          last_name: string
          last_onboarding_reminder_at?: string | null
          latitude?: number | null
          longitude?: number | null
          onboarding_completed?: boolean | null
          phone?: string | null
          postal_code?: string | null
          rating?: number | null
          response_rate?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          stripe_account_enabled?: boolean | null
          stripe_account_id?: string | null
          stripe_onboarding_completed?: boolean | null
          suburb?: string | null
          terms_accepted?: boolean | null
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
          admin_notes?: string | null
          avatar_url?: string | null
          background_check_verified?: boolean | null
          bio?: string | null
          blue_card_document_url?: string | null
          city?: string | null
          created_at?: string
          email?: string
          email_verification_sent_at?: string | null
          email_verification_token?: string | null
          email_verified?: boolean | null
          first_name?: string
          golden_badge_approved?: boolean | null
          golden_badge_approved_at?: string | null
          golden_badge_approved_by?: string | null
          id?: string
          id_document_url?: string | null
          id_document_urls?: string[] | null
          is_test_account?: boolean
          is_verified?: boolean | null
          is_young_walker?: boolean | null
          last_name?: string
          last_onboarding_reminder_at?: string | null
          latitude?: number | null
          longitude?: number | null
          onboarding_completed?: boolean | null
          phone?: string | null
          postal_code?: string | null
          rating?: number | null
          response_rate?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          stripe_account_enabled?: boolean | null
          stripe_account_id?: string | null
          stripe_onboarding_completed?: boolean | null
          suburb?: string | null
          terms_accepted?: boolean | null
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
      promo_codes: {
        Row: {
          applies_to: string
          code: string
          created_at: string | null
          current_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          updated_at: string | null
          valid_from: string
          valid_until: string
        }
        Insert: {
          applies_to: string
          code: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          updated_at?: string | null
          valid_from?: string
          valid_until: string
        }
        Update: {
          applies_to?: string
          code?: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          updated_at?: string | null
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          first_booking_completed_at: string | null
          id: string
          referee_credit_amount: number | null
          referee_credited_at: string | null
          referral_code: string
          referred_email: string | null
          referred_user_id: string | null
          referrer_credit_amount: number | null
          referrer_credited_at: string | null
          referrer_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_booking_completed_at?: string | null
          id?: string
          referee_credit_amount?: number | null
          referee_credited_at?: string | null
          referral_code: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_credit_amount?: number | null
          referrer_credited_at?: string | null
          referrer_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_booking_completed_at?: string | null
          id?: string
          referee_credit_amount?: number | null
          referee_credited_at?: string | null
          referral_code?: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_credit_amount?: number | null
          referrer_credited_at?: string | null
          referrer_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "onboarding_funnel"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "public_sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "public_sitters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "onboarding_funnel"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "public_sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "public_sitters"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "onboarding_funnel"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "public_sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "public_sitters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "onboarding_funnel"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "public_sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "public_sitters"
            referencedColumns: ["id"]
          },
        ]
      }
      search_events: {
        Row: {
          city: string | null
          clicked_sitter_ids: string[] | null
          created_at: string
          id: string
          pet_size: string[] | null
          pet_species: string[] | null
          referrer: string | null
          results_count: number | null
          search_timestamp: string
          service_type: string | null
          session_id: string
          suburb: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          clicked_sitter_ids?: string[] | null
          created_at?: string
          id?: string
          pet_size?: string[] | null
          pet_species?: string[] | null
          referrer?: string | null
          results_count?: number | null
          search_timestamp?: string
          service_type?: string | null
          session_id: string
          suburb?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          clicked_sitter_ids?: string[] | null
          created_at?: string
          id?: string
          pet_size?: string[] | null
          pet_species?: string[] | null
          referrer?: string | null
          results_count?: number | null
          search_timestamp?: string
          service_type?: string | null
          session_id?: string
          suburb?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
            referencedRelation: "onboarding_funnel"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sitter_availability_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sitter_availability_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "public_sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sitter_availability_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "public_sitters"
            referencedColumns: ["id"]
          },
        ]
      }
      sitter_leads: {
        Row: {
          city: string | null
          converted_at: string | null
          converted_to_user: boolean | null
          created_at: string
          email: string
          experience_level: string | null
          id: string
          name: string
          phone: string | null
          services_interested: string[] | null
          source: string | null
          suburb: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          converted_at?: string | null
          converted_to_user?: boolean | null
          created_at?: string
          email: string
          experience_level?: string | null
          id?: string
          name: string
          phone?: string | null
          services_interested?: string[] | null
          source?: string | null
          suburb?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          converted_at?: string | null
          converted_to_user?: boolean | null
          created_at?: string
          email?: string
          experience_level?: string | null
          id?: string
          name?: string
          phone?: string | null
          services_interested?: string[] | null
          source?: string | null
          suburb?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sitter_service_areas: {
        Row: {
          city: string
          created_at: string
          id: string
          is_primary: boolean | null
          sitter_id: string
          suburb: string
        }
        Insert: {
          city?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          sitter_id: string
          suburb: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          sitter_id?: string
          suburb?: string
        }
        Relationships: [
          {
            foreignKeyName: "sitter_service_areas_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "onboarding_funnel"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sitter_service_areas_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sitter_service_areas_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "public_sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sitter_service_areas_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "public_sitters"
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
            referencedRelation: "onboarding_funnel"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sitter_services_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sitter_services_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "public_sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sitter_services_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "public_sitters"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_migration_tracking: {
        Row: {
          completed_at: string | null
          created_at: string | null
          email_sent_at: string | null
          id: string
          notes: string | null
          old_stripe_account_id: string | null
          sitter_id: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          email_sent_at?: string | null
          id?: string
          notes?: string | null
          old_stripe_account_id?: string | null
          sitter_id: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          email_sent_at?: string | null
          id?: string
          notes?: string | null
          old_stripe_account_id?: string | null
          sitter_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_migration_tracking_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: true
            referencedRelation: "onboarding_funnel"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "stripe_migration_tracking_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_migration_tracking_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: true
            referencedRelation: "public_sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_migration_tracking_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: true
            referencedRelation: "public_sitters"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          description: string
          gst_amount: number
          id: string
          metadata: Json | null
          platform_earnings: number
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          stripe_transfer_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string
          description: string
          gst_amount?: number
          id?: string
          metadata?: Json | null
          platform_earnings?: number
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          stripe_transfer_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          description?: string
          gst_amount?: number
          id?: string
          metadata?: Json | null
          platform_earnings?: number
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          stripe_transfer_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_name: string
          event_type: string
          id: string
          page_path: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_name: string
          event_type: string
          id?: string
          page_path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_name?: string
          event_type?: string
          id?: string
          page_path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "onboarding_funnel"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_sitters"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      young_walker_availability: {
        Row: {
          created_at: string
          date: string
          id: string
          is_available: boolean
          notes: string | null
          time_slot: string
          young_walker_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_available?: boolean
          notes?: string | null
          time_slot: string
          young_walker_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_available?: boolean
          notes?: string | null
          time_slot?: string
          young_walker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "young_walker_availability_young_walker_id_fkey"
            columns: ["young_walker_id"]
            isOneToOne: false
            referencedRelation: "young_walkers"
            referencedColumns: ["id"]
          },
        ]
      }
      young_walker_bookings: {
        Row: {
          booking_reference: string
          client_confirmed_dog_temperament: boolean
          client_confirmed_safety_guidelines: boolean
          client_id: string
          created_at: string
          dog_breed: string | null
          dog_name: string
          dog_photo_url: string | null
          dog_size: string
          dog_temperament: string | null
          duration_mins: number
          id: string
          paid_at: string | null
          payment_status: string | null
          pickup_address: string
          platform_fee: number
          rate: number
          status: string
          total_amount: number
          updated_at: string
          walk_area: string | null
          walk_completed_at: string | null
          walk_date: string
          walk_notes: string | null
          walk_photo_url: string | null
          walk_time: string
          young_walker_id: string
        }
        Insert: {
          booking_reference?: string
          client_confirmed_dog_temperament?: boolean
          client_confirmed_safety_guidelines?: boolean
          client_id: string
          created_at?: string
          dog_breed?: string | null
          dog_name: string
          dog_photo_url?: string | null
          dog_size: string
          dog_temperament?: string | null
          duration_mins?: number
          id?: string
          paid_at?: string | null
          payment_status?: string | null
          pickup_address: string
          platform_fee?: number
          rate: number
          status?: string
          total_amount: number
          updated_at?: string
          walk_area?: string | null
          walk_completed_at?: string | null
          walk_date: string
          walk_notes?: string | null
          walk_photo_url?: string | null
          walk_time: string
          young_walker_id: string
        }
        Update: {
          booking_reference?: string
          client_confirmed_dog_temperament?: boolean
          client_confirmed_safety_guidelines?: boolean
          client_id?: string
          created_at?: string
          dog_breed?: string | null
          dog_name?: string
          dog_photo_url?: string | null
          dog_size?: string
          dog_temperament?: string | null
          duration_mins?: number
          id?: string
          paid_at?: string | null
          payment_status?: string | null
          pickup_address?: string
          platform_fee?: number
          rate?: number
          status?: string
          total_amount?: number
          updated_at?: string
          walk_area?: string | null
          walk_completed_at?: string | null
          walk_date?: string
          walk_notes?: string | null
          walk_photo_url?: string | null
          walk_time?: string
          young_walker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "young_walker_bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "onboarding_funnel"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "young_walker_bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "young_walker_bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "young_walker_bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_sitters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "young_walker_bookings_young_walker_id_fkey"
            columns: ["young_walker_id"]
            isOneToOne: false
            referencedRelation: "young_walkers"
            referencedColumns: ["id"]
          },
        ]
      }
      young_walkers: {
        Row: {
          accepted_dog_sizes: string[]
          admin_approved_at: string | null
          admin_approved_by: string | null
          admin_notes: string | null
          available_after_school: boolean | null
          available_school_holidays: boolean | null
          available_weekends: boolean | null
          bio: string | null
          child_date_of_birth: string
          child_first_name: string
          child_last_name: string
          created_at: string
          experience_with_dogs: string | null
          home_city: string
          home_suburb: string
          id: string
          max_distance_km: number
          max_walk_duration_mins: number
          parent_checklist_completed: boolean
          parent_consent_given: boolean
          parent_consent_given_at: string | null
          parent_consent_ip: string | null
          parent_email: string
          parent_name: string
          parent_phone: string
          parent_profile_id: string
          parent_user_id: string
          profile_id: string
          rate_per_walk: number
          safety_guidelines_acknowledged: boolean
          service_radius_km: number
          status: Database["public"]["Enums"]["young_walker_status"]
          updated_at: string
        }
        Insert: {
          accepted_dog_sizes?: string[]
          admin_approved_at?: string | null
          admin_approved_by?: string | null
          admin_notes?: string | null
          available_after_school?: boolean | null
          available_school_holidays?: boolean | null
          available_weekends?: boolean | null
          bio?: string | null
          child_date_of_birth: string
          child_first_name: string
          child_last_name: string
          created_at?: string
          experience_with_dogs?: string | null
          home_city?: string
          home_suburb: string
          id?: string
          max_distance_km?: number
          max_walk_duration_mins?: number
          parent_checklist_completed?: boolean
          parent_consent_given?: boolean
          parent_consent_given_at?: string | null
          parent_consent_ip?: string | null
          parent_email: string
          parent_name: string
          parent_phone: string
          parent_profile_id: string
          parent_user_id: string
          profile_id: string
          rate_per_walk?: number
          safety_guidelines_acknowledged?: boolean
          service_radius_km?: number
          status?: Database["public"]["Enums"]["young_walker_status"]
          updated_at?: string
        }
        Update: {
          accepted_dog_sizes?: string[]
          admin_approved_at?: string | null
          admin_approved_by?: string | null
          admin_notes?: string | null
          available_after_school?: boolean | null
          available_school_holidays?: boolean | null
          available_weekends?: boolean | null
          bio?: string | null
          child_date_of_birth?: string
          child_first_name?: string
          child_last_name?: string
          created_at?: string
          experience_with_dogs?: string | null
          home_city?: string
          home_suburb?: string
          id?: string
          max_distance_km?: number
          max_walk_duration_mins?: number
          parent_checklist_completed?: boolean
          parent_consent_given?: boolean
          parent_consent_given_at?: string | null
          parent_consent_ip?: string | null
          parent_email?: string
          parent_name?: string
          parent_phone?: string
          parent_profile_id?: string
          parent_user_id?: string
          profile_id?: string
          rate_per_walk?: number
          safety_guidelines_acknowledged?: boolean
          service_radius_km?: number
          status?: Database["public"]["Enums"]["young_walker_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "young_walkers_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            isOneToOne: false
            referencedRelation: "onboarding_funnel"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "young_walkers_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "young_walkers_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            isOneToOne: false
            referencedRelation: "public_sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "young_walkers_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            isOneToOne: false
            referencedRelation: "public_sitters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "young_walkers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "onboarding_funnel"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "young_walkers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "young_walkers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "public_sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "young_walkers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "public_sitters"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      onboarding_funnel: {
        Row: {
          added_pet: boolean | null
          completed_booking: boolean | null
          email: string | null
          first_booking_at: string | null
          first_name: string | null
          first_pet_added_at: string | null
          first_search_at: string | null
          made_booking: boolean | null
          registered_at: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          searched: boolean | null
          signed_up: boolean | null
          user_id: string | null
        }
        Insert: {
          added_pet?: never
          completed_booking?: never
          email?: string | null
          first_booking_at?: never
          first_name?: string | null
          first_pet_added_at?: never
          first_search_at?: never
          made_booking?: never
          registered_at?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          searched?: never
          signed_up?: never
          user_id?: string | null
        }
        Update: {
          added_pet?: never
          completed_booking?: never
          email?: string | null
          first_booking_at?: never
          first_name?: string | null
          first_pet_added_at?: never
          first_search_at?: never
          made_booking?: never
          registered_at?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          searched?: never
          signed_up?: never
          user_id?: string | null
        }
        Relationships: []
      }
      public_sitter_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          first_name: string | null
          id: string | null
          is_verified: boolean | null
          last_name: string | null
          rating: number | null
          response_rate: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          suburb: string | null
          total_reviews: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          is_verified?: boolean | null
          last_name?: string | null
          rating?: number | null
          response_rate?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          suburb?: string | null
          total_reviews?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          is_verified?: boolean | null
          last_name?: string | null
          rating?: number | null
          response_rate?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          suburb?: string | null
          total_reviews?: number | null
        }
        Relationships: []
      }
      public_sitters: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          first_name: string | null
          golden_badge_approved: boolean | null
          id: string | null
          is_verified: boolean | null
          last_name: string | null
          onboarding_completed: boolean | null
          rating: number | null
          response_rate: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          suburb: string | null
          total_reviews: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          first_name?: string | null
          golden_badge_approved?: boolean | null
          id?: string | null
          is_verified?: boolean | null
          last_name?: string | null
          onboarding_completed?: boolean | null
          rating?: number | null
          response_rate?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          suburb?: string | null
          total_reviews?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          first_name?: string | null
          golden_badge_approved?: boolean | null
          id?: string | null
          is_verified?: boolean | null
          last_name?: string | null
          onboarding_completed?: boolean | null
          rating?: number | null
          response_rate?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          suburb?: string | null
          total_reviews?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_booking: { Args: { booking_id: string }; Returns: Json }
      auto_complete_bookings: { Args: never; Returns: undefined }
      can_access_pet_basic_info: { Args: { pet_id: string }; Returns: boolean }
      can_access_pet_sensitive_data: {
        Args: { pet_id: string }
        Returns: boolean
      }
      can_access_sitter_contact: {
        Args: { sitter_profile_id: string }
        Returns: boolean
      }
      can_sitter_view_owner_profile: {
        Args: { owner_profile_id: string }
        Returns: boolean
      }
      cleanup_stale_payments: { Args: never; Returns: undefined }
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
      get_pet_basic_info_safe: {
        Args: { pet_id: string }
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
      get_pet_emergency_contacts: {
        Args: { pet_id: string }
        Returns: {
          emergency_contact_name: string
          emergency_contact_phone: string
          id: string
        }[]
      }
      get_public_sitter_info: {
        Args: { sitter_id: string }
        Returns: {
          avatar_url: string
          bio: string
          city: string
          first_name: string
          id: string
          is_verified: boolean
          last_name: string
          rating: number
          response_rate: number
          suburb: string
          total_reviews: number
        }[]
      }
      get_public_sitters: {
        Args: never
        Returns: {
          avatar_url: string
          bio: string
          city: string
          created_at: string
          first_name: string
          golden_badge_approved: boolean
          id: string
          is_verified: boolean
          last_name: string
          onboarding_completed: boolean
          rating: number
          response_rate: number
          role: Database["public"]["Enums"]["user_role"]
          suburb: string
          total_reviews: number
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_young_walker_age: { Args: { dob: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      update_booking_status: {
        Args: {
          booking_id: string
          new_status: Database["public"]["Enums"]["booking_status"]
        }
        Returns: undefined
      }
      update_verification_status: {
        Args: {
          is_verified: boolean
          profile_id: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Returns: undefined
      }
      validate_promo_code: {
        Args: { p_code: string; p_platform_fee: number }
        Returns: Json
      }
    }
    Enums: {
      booking_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "awaiting_payment"
        | "declined"
      pet_size: "small" | "medium" | "large" | "extra_large"
      pet_species:
        | "dog"
        | "cat"
        | "bird"
        | "rabbit"
        | "reptile"
        | "fish"
        | "other"
        | "horse"
      service_type:
        | "pet_sitting_owners_home"
        | "pet_sitting_sitters_home"
        | "drop_in_visits"
      user_role: "pet_owner" | "pet_sitter" | "admin"
      verification_status: "pending" | "verified" | "rejected"
      young_walker_status:
        | "pending_approval"
        | "active"
        | "suspended"
        | "inactive"
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
        "awaiting_payment",
        "declined",
      ],
      pet_size: ["small", "medium", "large", "extra_large"],
      pet_species: [
        "dog",
        "cat",
        "bird",
        "rabbit",
        "reptile",
        "fish",
        "other",
        "horse",
      ],
      service_type: [
        "pet_sitting_owners_home",
        "pet_sitting_sitters_home",
        "drop_in_visits",
      ],
      user_role: ["pet_owner", "pet_sitter", "admin"],
      verification_status: ["pending", "verified", "rejected"],
      young_walker_status: [
        "pending_approval",
        "active",
        "suspended",
        "inactive",
      ],
    },
  },
} as const
