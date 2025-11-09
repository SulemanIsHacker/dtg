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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      comparison_features: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_enabled: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_enabled?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_enabled?: boolean | null
          name?: string
        }
        Relationships: []
      }
      financial_adjustments: {
        Row: {
          adjustment_type: string
          amount: number
          created_at: string | null
          created_by: string | null
          currency: string | null
          id: string
          reason: string
          reference_id: string | null
          reference_table: string | null
        }
        Insert: {
          adjustment_type: string
          amount: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: string
          reason: string
          reference_id?: string | null
          reference_table?: string | null
        }
        Update: {
          adjustment_type?: string
          amount?: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: string
          reason?: string
          reference_id?: string | null
          reference_table?: string | null
        }
        Relationships: []
      }
      incoming_payments: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string | null
          currency: string | null
          customer_email: string
          customer_name: string
          id: string
          payment_date: string | null
          payment_method: string | null
          payment_proof_url: string | null
          payment_status: string | null
          product_id: string | null
          subscription_id: string | null
          transaction_id: string | null
          updated_at: string | null
          user_auth_code_id: string | null
          verified_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string | null
          currency?: string | null
          customer_email: string
          customer_name: string
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_proof_url?: string | null
          payment_status?: string | null
          product_id?: string | null
          subscription_id?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_auth_code_id?: string | null
          verified_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string | null
          currency?: string | null
          customer_email?: string
          customer_name?: string
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_proof_url?: string | null
          payment_status?: string | null
          product_id?: string | null
          subscription_id?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_auth_code_id?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incoming_payments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incoming_payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incoming_payments_user_auth_code_id_fkey"
            columns: ["user_auth_code_id"]
            isOneToOne: false
            referencedRelation: "user_auth_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_plans: {
        Row: {
          created_at: string
          custom_price: string | null
          description: string | null
          duration_days: number | null
          duration_label: string | null
          id: string
          is_custom_duration: boolean | null
          is_enabled: boolean | null
          monthly_price: string | null
          plan_type: string
          price: string | null
          product_id: string
          yearly_price: string | null
        }
        Insert: {
          created_at?: string
          custom_price?: string | null
          description?: string | null
          duration_days?: number | null
          duration_label?: string | null
          id?: string
          is_custom_duration?: boolean | null
          is_enabled?: boolean | null
          monthly_price?: string | null
          plan_type: string
          price?: string | null
          product_id: string
          yearly_price?: string | null
        }
        Update: {
          created_at?: string
          custom_price?: string | null
          description?: string | null
          duration_days?: number | null
          duration_label?: string | null
          id?: string
          is_custom_duration?: boolean | null
          is_enabled?: boolean | null
          monthly_price?: string | null
          plan_type?: string
          price?: string | null
          product_id?: string
          yearly_price?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_plans_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_codes: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          code: string | null
          created_at: string | null
          currency: string | null
          expires_at: string | null
          id: string
          price: number
          product_code: string
          product_id: string | null
          rejected_at: string | null
          status: string | null
          subscription_period: string
          subscription_type: string | null
          updated_at: string | null
          user_auth_code_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          code?: string | null
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          price: number
          product_code: string
          product_id?: string | null
          rejected_at?: string | null
          status?: string | null
          subscription_period: string
          subscription_type?: string | null
          updated_at?: string | null
          user_auth_code_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          code?: string | null
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          price?: number
          product_code?: string
          product_id?: string | null
          rejected_at?: string | null
          status?: string | null
          subscription_period?: string
          subscription_type?: string | null
          updated_at?: string | null
          user_auth_code_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_codes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_codes_user_auth_code_id_fkey"
            columns: ["user_auth_code_id"]
            isOneToOne: false
            referencedRelation: "user_auth_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      product_comparison_values: {
        Row: {
          created_at: string
          feature_id: string
          id: string
          plan_type: string
          product_id: string
          value: string
        }
        Insert: {
          created_at?: string
          feature_id: string
          id?: string
          plan_type: string
          product_id: string
          value: string
        }
        Update: {
          created_at?: string
          feature_id?: string
          id?: string
          plan_type?: string
          product_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_comparison_values_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "comparison_features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_comparison_values_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          product_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          product_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_videos: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          product_id: string
          video_url: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          product_id: string
          video_url: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          product_id?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_videos_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string
          detailed_description: string | null
          features: string[] | null
          id: string
          main_image_url: string | null
          main_video_url: string | null
          name: string
          original_price: string
          price: string
          rating: number | null
          slug: string
          updated_at: string
          video_thumbnail_url: string | null
          video_url: string | null
          video_urls: string[] | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          detailed_description?: string | null
          features?: string[] | null
          id?: string
          main_image_url?: string | null
          main_video_url?: string | null
          name: string
          original_price: string
          price: string
          rating?: number | null
          slug: string
          updated_at?: string
          video_thumbnail_url?: string | null
          video_url?: string | null
          video_urls?: string[] | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          detailed_description?: string | null
          features?: string[] | null
          id?: string
          main_image_url?: string | null
          main_video_url?: string | null
          name?: string
          original_price?: string
          price?: string
          rating?: number | null
          slug?: string
          updated_at?: string
          video_thumbnail_url?: string | null
          video_url?: string | null
          video_urls?: string[] | null
        }
        Relationships: []
      }
      purchase_request_items: {
        Row: {
          created_at: string | null
          id: string
          price: number
          product_code_id: string | null
          product_id: string | null
          purchase_request_id: string | null
          subscription_period: string
          subscription_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          price: number
          product_code_id?: string | null
          product_id?: string | null
          purchase_request_id?: string | null
          subscription_period: string
          subscription_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          price?: number
          product_code_id?: string | null
          product_id?: string | null
          purchase_request_id?: string | null
          subscription_period?: string
          subscription_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_request_items_product_code_id_fkey"
            columns: ["product_code_id"]
            isOneToOne: false
            referencedRelation: "product_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_request_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_request_items_purchase_request_id_fkey"
            columns: ["purchase_request_id"]
            isOneToOne: false
            referencedRelation: "purchase_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_requests: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          currency: string | null
          id: string
          is_returning_user: boolean | null
          status: string | null
          total_amount: number
          updated_at: string | null
          user_auth_code_id: string | null
          user_email: string
          user_name: string
          whatsapp_message_sent: boolean | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_returning_user?: boolean | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
          user_auth_code_id?: string | null
          user_email: string
          user_name: string
          whatsapp_message_sent?: boolean | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_returning_user?: boolean | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          user_auth_code_id?: string | null
          user_email?: string
          user_name?: string
          whatsapp_message_sent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_requests_user_auth_code_id_fkey"
            columns: ["user_auth_code_id"]
            isOneToOne: false
            referencedRelation: "user_auth_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_analytics: {
        Row: {
          active_subscriptions: number
          created_at: string | null
          date: string
          expired_subscriptions: number
          id: string
          product_id: string | null
          refunds_count: number
          refunds_issued: number
          revenue: number
          subscription_period: string
          subscription_type: string
          subscriptions_sold: number
          updated_at: string | null
        }
        Insert: {
          active_subscriptions?: number
          created_at?: string | null
          date: string
          expired_subscriptions?: number
          id?: string
          product_id?: string | null
          refunds_count?: number
          refunds_issued?: number
          revenue?: number
          subscription_period: string
          subscription_type: string
          subscriptions_sold?: number
          updated_at?: string | null
        }
        Update: {
          active_subscriptions?: number
          created_at?: string | null
          date?: string
          expired_subscriptions?: number
          id?: string
          product_id?: string | null
          refunds_count?: number
          refunds_issued?: number
          revenue?: number
          subscription_period?: string
          subscription_type?: string
          subscriptions_sold?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      social_shares: {
        Row: {
          id: string
          ip_address: string | null
          platform: string
          product_id: string
          shared_at: string
        }
        Insert: {
          id?: string
          ip_address?: string | null
          platform: string
          product_id: string
          shared_at?: string
        }
        Update: {
          id?: string
          ip_address?: string | null
          platform?: string
          product_id?: string
          shared_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_shares_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_refund_requests: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string
          id: string
          processed_at: string | null
          reason: string
          refund_amount: number | null
          refund_method: string | null
          status: string | null
          subscription_id: string | null
          updated_at: string | null
          user_auth_code_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description: string
          id?: string
          processed_at?: string | null
          reason: string
          refund_amount?: number | null
          refund_method?: string | null
          status?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_auth_code_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string
          id?: string
          processed_at?: string | null
          reason?: string
          refund_amount?: number | null
          refund_method?: string | null
          status?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_auth_code_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_refund_requests_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_refund_requests_user_auth_code_id_fkey"
            columns: ["user_auth_code_id"]
            isOneToOne: false
            referencedRelation: "user_auth_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          company: string | null
          content: string
          created_at: string | null
          customer_photo_path: string | null
          customer_photo_url: string | null
          date: string
          id: string
          image_url: string | null
          name: string
          product_slug: string
          rating: number
          role: string
          testimonial_content_photo_path: string | null
          testimonial_content_photo_url: string | null
          type: string
          updated_at: string | null
          verified: boolean | null
          video_url: string | null
        }
        Insert: {
          company?: string | null
          content: string
          created_at?: string | null
          customer_photo_path?: string | null
          customer_photo_url?: string | null
          date: string
          id?: string
          image_url?: string | null
          name: string
          product_slug: string
          rating: number
          role: string
          testimonial_content_photo_path?: string | null
          testimonial_content_photo_url?: string | null
          type: string
          updated_at?: string | null
          verified?: boolean | null
          video_url?: string | null
        }
        Update: {
          company?: string | null
          content?: string
          created_at?: string | null
          customer_photo_path?: string | null
          customer_photo_url?: string | null
          date?: string
          id?: string
          image_url?: string | null
          name?: string
          product_slug?: string
          rating?: number
          role?: string
          testimonial_content_photo_path?: string | null
          testimonial_content_photo_url?: string | null
          type?: string
          updated_at?: string | null
          verified?: boolean | null
          video_url?: string | null
        }
        Relationships: []
      }
      user_auth_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_email: string
          user_name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_email: string
          user_name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_email?: string
          user_name?: string
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
      user_subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          currency: string | null
          custom_price: number | null
          expiry_date: string
          id: string
          notes: string | null
          password: string | null
          product_id: string | null
          start_date: string | null
          status: string | null
          subscription_period: string
          subscription_type: string | null
          updated_at: string | null
          user_auth_code_id: string | null
          username: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          currency?: string | null
          custom_price?: number | null
          expiry_date: string
          id?: string
          notes?: string | null
          password?: string | null
          product_id?: string | null
          start_date?: string | null
          status?: string | null
          subscription_period: string
          subscription_type?: string | null
          updated_at?: string | null
          user_auth_code_id?: string | null
          username?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          currency?: string | null
          custom_price?: number | null
          expiry_date?: string
          id?: string
          notes?: string | null
          password?: string | null
          product_id?: string | null
          start_date?: string | null
          status?: string | null
          subscription_period?: string
          subscription_type?: string | null
          updated_at?: string | null
          user_auth_code_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_auth_code_id_fkey"
            columns: ["user_auth_code_id"]
            isOneToOne: false
            referencedRelation: "user_auth_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_profiles: {
        Row: {
          account_details: Json | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          next_payment_date: string | null
          notes: string | null
          payment_method: string | null
          phone: string | null
          products_supplied: string[] | null
          total_due: number | null
          total_paid: number | null
          updated_at: string | null
          vendor_name: string
        }
        Insert: {
          account_details?: Json | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          next_payment_date?: string | null
          notes?: string | null
          payment_method?: string | null
          phone?: string | null
          products_supplied?: string[] | null
          total_due?: number | null
          total_paid?: number | null
          updated_at?: string | null
          vendor_name: string
        }
        Update: {
          account_details?: Json | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          next_payment_date?: string | null
          notes?: string | null
          payment_method?: string | null
          phone?: string | null
          products_supplied?: string[] | null
          total_due?: number | null
          total_paid?: number | null
          updated_at?: string | null
          vendor_name?: string
        }
        Relationships: []
      }
      vendor_transactions: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          due_date: string | null
          id: string
          payment_date: string | null
          payment_method: string | null
          payment_status: string | null
          product_id: string | null
          receipt_url: string | null
          transaction_type: string | null
          updated_at: string | null
          vendor_contact: string | null
          vendor_email: string | null
          vendor_id: string | null
          vendor_name: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          product_id?: string | null
          receipt_url?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          vendor_contact?: string | null
          vendor_email?: string | null
          vendor_id?: string | null
          vendor_name: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          product_id?: string | null
          receipt_url?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          vendor_contact?: string | null
          vendor_email?: string | null
          vendor_id?: string | null
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_transactions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_product_code_admin: {
        Args: { p_admin_notes?: string; p_product_code_id: string }
        Returns: Json
      }
      approve_simple_product_code: {
        Args: { p_admin_notes?: string; p_product_code_id: string }
        Returns: boolean
      }
      assign_admin_role: { Args: { user_email: string }; Returns: string }
      auto_fix_sales_analytics_consistency: { Args: never; Returns: string }
      backfill_sales_analytics: {
        Args: never
        Returns: {
          created_analytics_records: number
          processed_records: number
        }[]
      }
      bulk_process_purchase_request: {
        Args: {
          p_action: string
          p_admin_notes?: string
          p_purchase_request_id: string
        }
        Returns: Json
      }
      calculate_expiry_date: {
        Args: { p_start_date?: string; p_subscription_period: string }
        Returns: string
      }
      cancel_approved_subscription_admin: {
        Args: { p_admin_notes?: string; p_product_code_id: string }
        Returns: Json
      }
      check_product_code_exists: {
        Args: { p_product_code_id: string }
        Returns: Json
      }
      create_simple_purchase: {
        Args: {
          p_currency?: string
          p_products: Json
          p_user_email: string
          p_user_name: string
        }
        Returns: Json
      }
      create_subscription_refund_request: {
        Args: {
          p_description: string
          p_reason: string
          p_subscription_id: string
          p_user_auth_code_id: string
        }
        Returns: string
      }
      debug_product_codes: { Args: never; Returns: Json }
      debug_subscription_status: {
        Args: { p_user_email: string }
        Returns: Json
      }
      delete_product_code_admin: {
        Args: { p_admin_notes?: string; p_product_code_id: string }
        Returns: Json
      }
      delete_user_product_codes_admin: {
        Args: { p_admin_notes?: string; p_user_email: string }
        Returns: Json
      }
      generate_product_code: {
        Args: { p_product_name: string }
        Returns: string
      }
      generate_user_code: { Args: never; Returns: string }
      get_admin_dashboard_stats: { Args: never; Returns: Json }
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_financial_summary: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: {
          net_profit: number
          pending_payments: number
          pending_vendor_payments: number
          total_expenses: number
          total_income: number
          total_refunds: number
        }[]
      }
      get_product_sales_summary: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: {
          active_subscriptions: number
          expired_subscriptions: number
          net_revenue: number
          product_id: string
          product_name: string
          subscription_types: Json
          total_refunds: number
          total_revenue: number
          total_subscriptions: number
        }[]
      }
      get_purchase_request_summary: {
        Args: { p_purchase_request_id: string }
        Returns: Json
      }
      get_sales_analytics: {
        Args: {
          p_end_date: string
          p_group_by_period?: string
          p_start_date: string
        }
        Returns: {
          active_subscriptions: number
          expired_subscriptions: number
          period_end: string
          period_start: string
          subscription_types: Json
          total_refund_count: number
          total_refunds: number
          total_revenue: number
          total_subscriptions: number
        }[]
      }
      get_subscription_expiry_stats: {
        Args: never
        Returns: {
          active_subscriptions: number
          cancelled_subscriptions: number
          expired_subscriptions: number
          expiring_soon_subscriptions: number
          total_subscriptions: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          _action: string
          _new_values?: Json
          _old_values?: Json
          _record_id?: string
          _table_name?: string
        }
        Returns: undefined
      }
      reject_product_code_admin: {
        Args: { p_admin_notes?: string; p_product_code_id: string }
        Returns: Json
      }
      reject_simple_product_code: {
        Args: { p_admin_notes?: string; p_product_code_id: string }
        Returns: boolean
      }
      update_subscription_statuses: {
        Args: never
        Returns: {
          active_count: number
          expired_count: number
          expiring_soon_count: number
          updated_count: number
        }[]
      }
      validate_sales_analytics_consistency: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
