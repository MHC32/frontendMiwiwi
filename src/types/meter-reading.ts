// src/types/meter-reading.ts

export type MeterReadingStatus = 'pending' | 'verified' | 'rejected';
export type MeterReadingType = 'opening' | 'closing' | 'daily';

export interface IMeterReadingItem {
  id: string;
  reading_value: number;
  reading_type: MeterReadingType;
  photo: string;
  status: MeterReadingStatus;
  cashier: {
    _id: string;
    first_name: string;
    last_name: string;
  };
  verified_by?: {
    _id: string;
    first_name: string;
    last_name: string;
  };
  verified_at?: string; 
  created_at: string;
  notes?: string;
}

export interface IMeterReadingFilters {
  date?: string;
  type?: MeterReadingType | 'all';
  status?: MeterReadingStatus | 'all';
}

export interface IVerifyReadingPayload {
  status: MeterReadingStatus;
  notes?: string;
}

export interface IMeterReadingTableFilters {
  name: string;
  status: string;
  type: string;
  startDate: Date | null;
  endDate: Date | null;
}

export interface IMeterReadingTableFilterValue {
  name: string;
  status: string;
  type: string;
  startDate: Date | null;
  endDate: Date | null;
}

// *** TYPES MANQUANTS AJOUTÉS ***

// Interface pour la réponse de la liste des relevés
export interface MeterReadingListResponse {
  success: boolean;
  data: IMeterReadingItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Interface pour la réponse de vérification
export interface VerifyReadingResponse {
  success: boolean;
  data: {
    id: string;
    status: string;
    verified_by: {
      id: string;
      name: string;
    };
    verified_at: string;
  };
}