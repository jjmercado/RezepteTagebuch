import Dexie, { type Table } from 'dexie';
import type { Recipe } from './types/Recipe';

export class MyDatabase extends Dexie {
  recipes!: Table<Recipe>; 

  constructor() {
    super('RezepteDB');
    this.version(3).stores({
      recipes: 'id, title, category, is_dirty'  
    });
  }
}

export const db = new MyDatabase();

export async function saveNewRecipe(recipeData: Omit<Recipe, 'id'>) {
  const newRecipe: Recipe = {
    ...recipeData,
    id: crypto.randomUUID(),
    is_dirty: true,
    createdAt: Date.now()
  };
  
  await db.recipes.add(newRecipe);
  return newRecipe;
}

export async function autoSyncOnStart() {
  try {
    const dirtyRecipes = await db.recipes.where('is_dirty').equals(1).toArray();

    if (dirtyRecipes.length === 0) return;

    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dirtyRecipes),
    });

    if (response.ok) {
      const updates = dirtyRecipes.map(recipe => ({
        key: recipe.id, 
        changes: { is_dirty: false }
      }));

      await db.recipes.bulkUpdate(updates);
      
      console.log("Sync erfolgreich!");
    }
  } catch (error) {
    console.error("Sync fehlgeschlagen (Pi offline?)", error);
  }
}

export async function migrateToUUIDs() {
  const allRecipes = await db.recipes.toArray();
  
  for (const recipe of allRecipes) {
    const needsMigration = typeof recipe.id === 'number' || 
                           (typeof recipe.id === 'string' && !recipe.id.includes('-'));

    if (needsMigration) {
      const oldId = recipe.id;
      const newId = crypto.randomUUID();

      const updatedRecipe = { 
        ...recipe, 
        id: newId, 
        is_dirty: true
      };

      await db.transaction('rw', db.recipes, async () => {
        await db.recipes.delete(oldId!);
        await db.recipes.add(updatedRecipe);
      });

      console.log(`Migriert: ID ${oldId} -> ${newId}`);
    }
  }
}