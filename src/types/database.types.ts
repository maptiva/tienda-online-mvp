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
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          billing_info: Json | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          status: string | null
        }
        Insert: {
          billing_info?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          status?: string | null
        }
        Update: {
          billing_info?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          status?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          allow_backorder: boolean | null
          created_at: string | null
          id: number
          min_stock_alert: number | null
          product_id: number
          quantity: number
          reserved_quantity: number
          track_stock: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allow_backorder?: boolean | null
          created_at?: string | null
          id?: number
          min_stock_alert?: number | null
          product_id: number
          quantity?: number
          reserved_quantity?: number
          track_stock?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allow_backorder?: boolean | null
          created_at?: string | null
          id?: number
          min_stock_alert?: number | null
          product_id?: number
          quantity?: number
          reserved_quantity?: number
          track_stock?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_logs: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: number
          movement_type: string
          new_quantity: number | null
          order_id: number | null
          previous_quantity: number | null
          product_id: number
          quantity_change: number
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          movement_type: string
          new_quantity?: number | null
          order_id?: number | null
          previous_quantity?: number | null
          product_id: number
          quantity_change: number
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          movement_type?: string
          new_quantity?: number | null
          order_id?: number | null
          previous_quantity?: number | null
          product_id?: number
          quantity_change?: number
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_logs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          business_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          next_follow_up: string | null
          notes: string | null
          phone: string | null
          source: string | null
          status: string | null
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
        }
        Update: {
          business_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string | null
          customer_info: Json
          discount_applied: number | null
          id: string
          items: Json
          payment_method: string | null
          status: string | null
          store_id: number | null
          total: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_info: Json
          discount_applied?: number | null
          id?: string
          items: Json
          payment_method?: string | null
          status?: string | null
          store_id?: number | null
          total: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_info?: Json
          discount_applied?: number | null
          id?: string
          items?: Json
          payment_method?: string | null
          status?: string | null
          store_id?: number | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          id: string
          notes: string | null
          payment_method: string | null
          receipt_url: string | null
          status: string | null
          subscription_id: string | null
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          status?: string | null
          subscription_id?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          status?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          backup_price: number | null
          category_id: number | null
          compare_at_price: number | null
          created_at: string | null
          description: string | null
          display_id: number | null
          gallery_images: string[] | null
          id: number
          image_url: string | null
          name: string
          price: number
          price_on_request: boolean | null
          sku: string | null
          stock: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          backup_price?: number | null
          category_id?: number | null
          compare_at_price?: number | null
          created_at?: string | null
          description?: string | null
          display_id?: number | null
          gallery_images?: string[] | null
          id?: number
          image_url?: string | null
          name: string
          price: number
          price_on_request?: boolean | null
          sku?: string | null
          stock?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          backup_price?: number | null
          category_id?: number | null
          compare_at_price?: number | null
          created_at?: string | null
          description?: string | null
          display_id?: number | null
          gallery_images?: string[] | null
          id?: number
          image_url?: string | null
          name?: string
          price?: number
          price_on_request?: boolean | null
          sku?: string | null
          stock?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_categories: {
        Row: {
          created_at: string | null
          icon_name: string | null
          id: string
          label: string
          marker_color: string | null
        }
        Insert: {
          created_at?: string | null
          icon_name?: string | null
          id: string
          label: string
          marker_color?: string | null
        }
        Update: {
          created_at?: string | null
          icon_name?: string | null
          id?: string
          label?: string
          marker_color?: string | null
        }
        Relationships: []
      }
      shop_stats: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          store_id: number | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          store_id?: number | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          store_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_stats_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          about_text: string | null
          address: string | null
          business_hours: string | null
          category: string | null
          city: string | null
          client_id: string | null
          coming_soon: boolean | null
          contact_phone: string | null
          created_at: string | null
          discount_settings: Json | null
          enable_stock: boolean | null
          facebook_url: string | null
          id: number
          instagram_url: string | null
          is_active: boolean | null
          is_demo: boolean | null
          is_open: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          payment_exempt: boolean | null
          short_description: string | null
          show_map: boolean | null
          store_name: string
          store_slug: string | null
          tiktok_url: string | null
          updated_at: string | null
          user_id: string
          whatsapp_message: string | null
          whatsapp_number: string | null
        }
        Insert: {
          about_text?: string | null
          address?: string | null
          business_hours?: string | null
          category?: string | null
          city?: string | null
          client_id?: string | null
          coming_soon?: boolean | null
          contact_phone?: string | null
          created_at?: string | null
          discount_settings?: Json | null
          enable_stock?: boolean | null
          facebook_url?: string | null
          id?: number
          instagram_url?: string | null
          is_active?: boolean | null
          is_demo?: boolean | null
          is_open?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          payment_exempt?: boolean | null
          short_description?: string | null
          show_map?: boolean | null
          store_name: string
          store_slug?: string | null
          tiktok_url?: string | null
          updated_at?: string | null
          user_id: string
          whatsapp_message?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          about_text?: string | null
          address?: string | null
          business_hours?: string | null
          category?: string | null
          city?: string | null
          client_id?: string | null
          coming_soon?: boolean | null
          contact_phone?: string | null
          created_at?: string | null
          discount_settings?: Json | null
          enable_stock?: boolean | null
          facebook_url?: string | null
          id?: number
          instagram_url?: string | null
          is_active?: boolean | null
          is_demo?: boolean | null
          is_open?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          payment_exempt?: boolean | null
          short_description?: string | null
          show_map?: boolean | null
          store_name?: string
          store_slug?: string | null
          tiktok_url?: string | null
          updated_at?: string | null
          user_id?: string
          whatsapp_message?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          billing_day: number | null
          created_at: string
          currency: string | null
          id: string
          last_payment_date: string | null
          plan_type: string | null
          status: string | null
          store_id: number
        }
        Insert: {
          amount?: number
          billing_day?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          last_payment_date?: string | null
          plan_type?: string | null
          status?: string | null
          store_id: number
        }
        Update: {
          amount?: number
          billing_day?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          last_payment_date?: string | null
          plan_type?: string | null
          status?: string | null
          store_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_inventory_stock: {
        Args: {
          p_created_by?: string
          p_product_id: number
          p_quantity_change: number
          p_reason?: string
          p_user_id: string
        }
        Returns: Json
      }
      create_public_order: {
        Args: {
          p_client_total: number
          p_customer_info: Json
          p_discount_applied?: number
          p_items: Json
          p_payment_method: string
          p_store_slug: string
        }
        Returns: Json
      }
      get_low_stock_items: {
        Args: { p_user_id: string }
        Returns: {
          id: number
          min_stock_alert: number
          product_id: number
          product_name: string
          quantity: number
          shortage: number
        }[]
      }
      get_product_inventory_logs: {
        Args: { p_limit?: number; p_product_id: number; p_user_id: string }
        Returns: {
          created_at: string
          created_by: string
          id: number
          movement_type: string
          new_quantity: number
          previous_quantity: number
          quantity_change: number
          reason: string
        }[]
      }
      get_public_inventory: {
        Args: { p_product_id: number; p_store_slug: string }
        Returns: {
          allow_backorder: boolean
          is_low_stock: boolean
          min_stock_alert: number
          product_id: number
          quantity: number
          reserved_quantity: number
          track_stock: boolean
        }[]
      }
      get_rls_status: {
        Args: never
        Returns: {
          policy_count: number
          rls_enabled: boolean
          table_name: string
        }[]
      }
      get_user_inventory_with_products: {
        Args: { p_user_id: string }
        Returns: {
          allow_backorder: boolean
          created_at: string
          id: number
          is_low_stock: boolean
          min_stock_alert: number
          product_id: number
          product_name: string
          quantity: number
          reserved_quantity: number
          track_stock: boolean
          updated_at: string
        }[]
      }
      process_cart_items_sale: {
        Args: { p_items: Json; p_order_reference?: string; p_user_id: string }
        Returns: Json
      }
      process_public_cart_sale: {
        Args: {
          p_items: Json
          p_order_reference?: string
          p_store_slug: string
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
    Enums: {},
  },
} as const
