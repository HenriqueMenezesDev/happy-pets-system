export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      atendimentos: {
        Row: {
          cliente_id: string
          created_at: string
          data: string
          funcionario_id: string
          id: string
          observacoes: string | null
          pet_id: string
          status: string
          valor_total: number
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data: string
          funcionario_id: string
          id?: string
          observacoes?: string | null
          pet_id: string
          status: string
          valor_total?: number
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data?: string
          funcionario_id?: string
          id?: string
          observacoes?: string | null
          pet_id?: string
          status?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "atendimentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atendimentos_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atendimentos_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          cpf: string
          data_cadastro: string
          email: string
          endereco: string
          id: string
          nome: string
          telefone: string
        }
        Insert: {
          cpf: string
          data_cadastro?: string
          email: string
          endereco: string
          id?: string
          nome: string
          telefone: string
        }
        Update: {
          cpf?: string
          data_cadastro?: string
          email?: string
          endereco?: string
          id?: string
          nome?: string
          telefone?: string
        }
        Relationships: []
      }
      funcionarios: {
        Row: {
          cargo: string
          data_cadastro: string
          email: string
          id: string
          nome: string
          telefone: string
        }
        Insert: {
          cargo: string
          data_cadastro?: string
          email: string
          id?: string
          nome: string
          telefone: string
        }
        Update: {
          cargo?: string
          data_cadastro?: string
          email?: string
          id?: string
          nome?: string
          telefone?: string
        }
        Relationships: []
      }
      itens_atendimento: {
        Row: {
          atendimento_id: string
          created_at: string
          id: string
          item_id: string
          quantidade: number
          tipo: string
          valor_unitario: number
        }
        Insert: {
          atendimento_id: string
          created_at?: string
          id?: string
          item_id: string
          quantidade?: number
          tipo: string
          valor_unitario: number
        }
        Update: {
          atendimento_id?: string
          created_at?: string
          id?: string
          item_id?: string
          quantidade?: number
          tipo?: string
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_atendimento_atendimento_id_fkey"
            columns: ["atendimento_id"]
            isOneToOne: false
            referencedRelation: "atendimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          cliente_id: string
          created_at: string
          data_nascimento: string
          especie: string
          id: string
          nome: string
          peso: number
          raca: string
          sexo: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_nascimento: string
          especie: string
          id?: string
          nome: string
          peso: number
          raca: string
          sexo: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_nascimento?: string
          especie?: string
          id?: string
          nome?: string
          peso?: number
          raca?: string
          sexo?: string
        }
        Relationships: [
          {
            foreignKeyName: "pets_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          categoria: string
          created_at: string
          descricao: string
          estoque: number
          id: string
          nome: string
          preco: number
        }
        Insert: {
          categoria: string
          created_at?: string
          descricao: string
          estoque?: number
          id?: string
          nome: string
          preco: number
        }
        Update: {
          categoria?: string
          created_at?: string
          descricao?: string
          estoque?: number
          id?: string
          nome?: string
          preco?: number
        }
        Relationships: []
      }
      servicos: {
        Row: {
          created_at: string
          descricao: string
          duracao: number
          id: string
          nome: string
          preco: number
        }
        Insert: {
          created_at?: string
          descricao: string
          duracao: number
          id?: string
          nome: string
          preco: number
        }
        Update: {
          created_at?: string
          descricao?: string
          duracao?: number
          id?: string
          nome?: string
          preco?: number
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
