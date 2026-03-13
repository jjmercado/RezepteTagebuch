export interface Ingredient {
  name: string;
  amount: number | string;
  unit: string;
}

export interface Recipe {
  id?: string;
  title: string;
  category: string;
  rating: number;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  is_dirty: boolean | number;
  is_deleted?: boolean | number;
  createdAt: number;
}