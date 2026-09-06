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
      consent_forms: {
        Row: {
          accept_allergen_environment: boolean
          accept_handmade_variation: boolean
          accept_no_allergen_free_guarantee: boolean
          acknowledged: boolean
          advance_paid: number
          allergies: string
          approve_design: boolean
          bakery_notes: string
          balance_due: number
          customer_name: string
          customer_signature: string
          customer_signed_name: string
          delivery_datetime: string
          design_theme: string
          email: string
          flavour: string
          fulfilment: string
          id: string
          informed_allergies: boolean
          invoice_no: string
          marketing_consent: boolean
          order_date: string
          order_id: string
          payment_status: string
          phone: string
          product_name: string
          rep_name: string
          rep_signature: string
          signed_at: string
          special_instructions: string
          total_amount: number
          weight: string
        }
        Insert: {
          accept_allergen_environment?: boolean
          accept_handmade_variation?: boolean
          accept_no_allergen_free_guarantee?: boolean
          acknowledged?: boolean
          advance_paid?: number
          allergies?: string
          approve_design?: boolean
          bakery_notes?: string
          balance_due?: number
          customer_name?: string
          customer_signature?: string
          customer_signed_name?: string
          delivery_datetime?: string
          design_theme?: string
          email?: string
          flavour?: string
          fulfilment?: string
          id?: string
          informed_allergies?: boolean
          invoice_no?: string
          marketing_consent?: boolean
          order_date?: string
          order_id: string
          payment_status?: string
          phone?: string
          product_name?: string
          rep_name?: string
          rep_signature?: string
          signed_at?: string
          special_instructions?: string
          total_amount?: number
          weight?: string
        }
        Update: {
          accept_allergen_environment?: boolean
          accept_handmade_variation?: boolean
          accept_no_allergen_free_guarantee?: boolean
          acknowledged?: boolean
          advance_paid?: number
          allergies?: string
          approve_design?: boolean
          bakery_notes?: string
          balance_due?: number
          customer_name?: string
          customer_signature?: string
          customer_signed_name?: string
          delivery_datetime?: string
          design_theme?: string
          email?: string
          flavour?: string
          fulfilment?: string
          id?: string
          informed_allergies?: boolean
          invoice_no?: string
          marketing_consent?: boolean
          order_date?: string
          order_id?: string
          payment_status?: string
          phone?: string
          product_name?: string
          rep_name?: string
          rep_signature?: string
          signed_at?: string
          special_instructions?: string
          total_amount?: number
          weight?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_forms_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      deliveries: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_sharing: boolean
          last_lat: number | null
          last_lng: number | null
          last_seen_at: string | null
          order_id: string
          rider_id: string | null
          rider_name: string
          rider_phone: string
          started_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_sharing?: boolean
          last_lat?: number | null
          last_lng?: number | null
          last_seen_at?: string | null
          order_id: string
          rider_id?: string | null
          rider_name?: string
          rider_phone?: string
          started_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_sharing?: boolean
          last_lat?: number | null
          last_lng?: number | null
          last_seen_at?: string | null
          order_id?: string
          rider_id?: string | null
          rider_name?: string
          rider_phone?: string
          started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_locations: {
        Row: {
          accuracy: number | null
          delivery_id: string
          id: number
          lat: number
          lng: number
          recorded_at: string
        }
        Insert: {
          accuracy?: number | null
          delivery_id: string
          id?: number
          lat: number
          lng: number
          recorded_at?: string
        }
        Update: {
          accuracy?: number | null
          delivery_id?: string
          id?: number
          lat?: number
          lng?: number
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_locations_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          design_notes: string
          flavour: string
          id: string
          name: string
          order_id: string
          product_id: string | null
          quantity: number
          unit_price: number
          weight: string
        }
        Insert: {
          design_notes?: string
          flavour?: string
          id?: string
          name: string
          order_id: string
          product_id?: string | null
          quantity?: number
          unit_price: number
          weight?: string
        }
        Update: {
          design_notes?: string
          flavour?: string
          id?: string
          name?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
          weight?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          advance_paid: number
          created_at: string
          customer_name: string
          dest_lat: number | null
          dest_lng: number | null
          email: string
          fulfilment: string
          id: string
          notes: string
          phone: string
          rider_id: string | null
          slot: string
          status: Database["public"]["Enums"]["order_status"]
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string
          advance_paid?: number
          created_at?: string
          customer_name?: string
          dest_lat?: number | null
          dest_lng?: number | null
          email?: string
          fulfilment?: string
          id?: string
          notes?: string
          phone?: string
          rider_id?: string | null
          slot?: string
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          advance_paid?: number
          created_at?: string
          customer_name?: string
          dest_lat?: number | null
          dest_lng?: number | null
          email?: string
          fulfilment?: string
          id?: string
          notes?: string
          phone?: string
          rider_id?: string | null
          slot?: string
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          allergens: string
          badge: string | null
          category: string
          created_at: string
          description: string
          id: string
          image_key: string
          is_active: boolean
          long_description: string
          name: string
          price: number
          slug: string
          sort_order: number
        }
        Insert: {
          allergens?: string
          badge?: string | null
          category: string
          created_at?: string
          description?: string
          id?: string
          image_key: string
          is_active?: boolean
          long_description?: string
          name: string
          price: number
          slug: string
          sort_order?: number
        }
        Update: {
          allergens?: string
          badge?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_key?: string
          is_active?: boolean
          long_description?: string
          name?: string
          price?: number
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
        }
        Insert: {
          address?: string
          created_at?: string
          email?: string
          full_name?: string
          id: string
          phone?: string
        }
        Update: {
          address?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
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
      app_role: "admin" | "rider" | "customer"
      order_status:
        | "placed"
        | "preparing"
        | "ready"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "rider", "customer"],
      order_status: [
        "placed",
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
