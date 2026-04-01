export interface Lead {
  id: string;
  name: string;
  category: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  ai_analysis: string | null;
  created_at: string;
}
