export interface Ingredient {
  name: string;
  amount: number | string; // string ist gut für "1 Prise" oder "etwas"
  unit: string;
}

export interface Recipe {
  id?: number;
  title: string;
  category: string;
  rating: number;
  description: string;
  ingredients: Ingredient[]; // <-- Hier war der Fehler: Jetzt ein Objekt-Array!
  steps: string[];           // Falls wir später eine Schritt-für-Schritt-Anleitung bauen
  is_dirty: boolean;
  createdAt: number;
}