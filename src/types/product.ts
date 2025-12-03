export interface IProductItem {
  _id: string;
  id: string; // Alias pour _id
  company: string;
  store_id: {
    _id: string;
    name: string;
  };
  category_id: {
    _id: string;
    name: string;
    id: string;
  };
  name: string;
  barcode: string;
  type: 'weight' | 'fuel' | 'quantity' | 'volume';
  unit: string;
  variants: any[];
  inventory: {
    current: number;
    min_stock: number;
    alert_enabled: boolean;
  };
  pricing: {
    mode: 'fixed' | 'fuel' | 'dynamic' | 'perUnit';
    base_price: number;
    buy_price?: number;
    fuel_config?: {
      price_per_unit: number;
      display_unit: string;
    };
    variable_price_rules: any[];
    promotions: any[];
  };
  images: Array<{
    url: string;
    is_main: boolean;
    _id: string;
    id: string;
    uploaded_at: string;
  }>;
  is_active: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  main_image: string | null;
}

export interface IProductTableFilters {
  name: string;
  store_id: string[];
  category_id: string[];
  type: string;
  status: string;
}

export type IProductTableFilterValue = string | string[];

export interface ProductListResponse {
  success: boolean;
  data: IProductItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductFormValues {
  name: string;
  barcode?: string;
  type: 'weight' | 'fuel' | 'quantity' | 'volume'; // ✅ Correspond à IProductItem
  unit: string;
  store_id: string;
  category_id?: string;
  inventory: {
    current: number;
    min_stock: number;
    alert_enabled: boolean;
  };
  pricing: {
    mode: 'fixed' | 'fuel' | 'dynamic' | 'perUnit'; // ✅ Correspond à IProductItem
    base_price: number;
    buy_price?: number;
    fuel_config?: {
      price_per_unit: number;
      display_unit: string;
    };
  };
  images?: File[];
}

