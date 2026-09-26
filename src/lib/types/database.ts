// Minimal Database type for Supabase client typing.
// In production, generate this with: npx supabase gen types typescript

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          type: "LAW_FIRM" | "IN_HOUSE" | "COURT";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type?: "LAW_FIRM" | "IN_HOUSE" | "COURT";
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
      };
      org_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          email: string;
          role: "OWNER" | "ADMIN" | "ATTORNEY" | "PARALEGAL" | "VIEWER";
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          email: string;
          role?: "OWNER" | "ADMIN" | "ATTORNEY" | "PARALEGAL" | "VIEWER";
        };
        Update: Partial<Database["public"]["Tables"]["org_members"]["Insert"]>;
      };
      cases: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          court_type: "STATE" | "FEDERAL";
          jurisdiction: string;
          case_number: string | null;
          court_name: string | null;
          plaintiff: string | null;
          defendant: string | null;
          opposing_party: string | null;
          status: "SETUP" | "FACTS" | "ANALYSIS" | "DRAFTING" | "REVIEW" | "FILED";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          court_type?: "STATE" | "FEDERAL";
          jurisdiction: string;
          case_number?: string;
          court_name?: string;
          plaintiff?: string;
          defendant?: string;
          opposing_party?: string;
          status?: "SETUP" | "FACTS" | "ANALYSIS" | "DRAFTING" | "REVIEW" | "FILED";
        };
        Update: Partial<Database["public"]["Tables"]["cases"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      org_type: "LAW_FIRM" | "IN_HOUSE" | "COURT";
      org_role: "OWNER" | "ADMIN" | "ATTORNEY" | "PARALEGAL" | "VIEWER";
      court_type: "STATE" | "FEDERAL";
      case_status: "SETUP" | "FACTS" | "ANALYSIS" | "DRAFTING" | "REVIEW" | "FILED";
    };
  };
}
