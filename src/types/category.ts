// src/types/category.ts

export interface ICategory {
  _id: string;
  name: string;
  company_id: string;
  parent_id?: string | null;
  color: string;
  icon: string;
  stores: string[]; // Store IDs
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  updatedBy?: Array<{
    user: string;
    at: string;
    action?: string;
  }>;
  
  // Relations populées (optionnelles)
  parent?: ICategory;
  children?: ICategory[];
  storeDetails?: Array<{
    id: string;
    name: string;
    address?: string;
  }>;
  products?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

export interface ICategoryFormValues {
  name: string;
  parent_id?: string | null;
  color?: string;
  icon?: string;
  storeIds?: string[];
  storeRemove?: string[]; // Pour retirer des stores
}

export interface ICategoryCreatePayload extends ICategoryFormValues {
  company_id: string;
}

export interface ICategoryUpdatePayload {
  id: string;
  data: ICategoryFormValues;
}

export interface CategoryListResponse {
  success: boolean;
  data: ICategory[];
  meta: {
    company: string;
    totalCategories: number;
  };
}

export interface CategoryResponse {
  success: boolean;
  data: ICategory;
  message?: string;
}

export interface CategoryErrorResponse {
  success: false;
  message: string;
  error?: string;
}

// État Redux pour les catégories
export interface CategoryState {
  isLoading: boolean;
  error: string | null;
  categories: ICategory[];
  currentCategory: ICategory | null;
  filters: {
    storeId?: string;
    withProducts?: boolean;
    parentId?: string | null; // Pour filtrer par parent
  };
}

// Types pour les sélecteurs
export interface CategoryTreeNode extends ICategory {
  children: CategoryTreeNode[];
  level: number;
}

// Interface pour les filtres de table
export interface ICategoryTableFilters {
  name: string;
  status: 'all' | 'active' | 'inactive';
  parentFilter: 'all' | 'root' | 'children';
  storeId: string;
}

export type ICategoryTableFilterValue =
  | string
  | 'all' | 'active' | 'inactive' | 'root' | 'children';

// Constantes pour les icônes de catégories
export const CATEGORY_ICONS = [
  'other',
  'food',
  'clothing',
  'electronics',
  'books',
  'sports',
  'home',
  'beauty',
  'health',
  'automotive'
] as const;

export type CategoryIcon = typeof CATEGORY_ICONS[number];

// Constantes pour les couleurs
export const CATEGORY_COLORS = [
  '#4CAF50', // Vert
  '#2196F3', // Bleu
  '#FF9800', // Orange
  '#9C27B0', // Violet
  '#F44336', // Rouge
  '#00BCD4', // Cyan
  '#795548', // Marron
  '#607D8B', // Bleu gris
  '#FFC107', // Ambre
  '#E91E63'  // Rose
] as const;

export type CategoryColor = typeof CATEGORY_COLORS[number];

// Helpers pour la validation
export const isCategoryActive = (category: ICategory): boolean => category.is_active;

export const getCategoryFullName = (category: ICategory, categories: ICategory[]): string => {
  if (!category.parent_id) return category.name;
  
  const parent = categories.find(c => c._id === category.parent_id);
  if (!parent) return category.name;
  
  return `${getCategoryFullName(parent, categories)} > ${category.name}`;
};

// Helper pour construire l'arbre de catégories
export const buildCategoryTree = (categories: ICategory[]): CategoryTreeNode[] => {
  const categoryMap = new Map<string, CategoryTreeNode>();
  
  // Initialiser tous les nœuds
  categories.forEach(category => {
    categoryMap.set(category._id, {
      ...category,
      children: [],
      level: 0
    });
  });
  
  const rootNodes: CategoryTreeNode[] = [];
  
  // Construire l'arbre
  categories.forEach(category => {
    const node = categoryMap.get(category._id)!;
    
    if (category.parent_id) {
      const parent = categoryMap.get(category.parent_id);
      if (parent) {
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        // Parent non trouvé, traiter comme racine
        rootNodes.push(node);
      }
    } else {
      rootNodes.push(node);
    }
  });
  
  return rootNodes;
};

// Helper pour obtenir tous les descendants d'une catégorie
export const getCategoryDescendants = (categoryId: string, categories: ICategory[]): string[] => {
  const descendants: string[] = [];
  const children = categories.filter(c => c.parent_id === categoryId);
  
  children.forEach(child => {
    descendants.push(child._id);
    descendants.push(...getCategoryDescendants(child._id, categories));
  });
  
  return descendants;
};