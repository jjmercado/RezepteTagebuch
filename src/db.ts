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
    const dirtyRecipes = await db.recipes.filter(r => r.is_dirty === true || r.is_dirty === 1).toArray();
    
    if (dirtyRecipes.length > 0) {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dirtyRecipes),
      });

      if (response.ok) {
        const deletedIds = dirtyRecipes.filter(r => r.is_deleted).map(r => r.id);
        await db.recipes.bulkDelete(deletedIds);
        
        const remainingIds = dirtyRecipes.filter(r => !r.is_deleted).map(r => r.id);
        await db.recipes.bulkUpdate(remainingIds.map(id => ({
          key: id, changes: { is_dirty: false }
        })));
      }
    }

    const getRes = await fetch('/api/recipes');
    if (getRes.ok) {
      const recipesFromPi = await getRes.json();
      for (const recipe of recipesFromPi) {
        const local = await db.recipes.get(recipe.id);
        if (!local || !local.is_dirty) {
          await db.recipes.put({ ...recipe, is_dirty: false });
        }
      }
      console.log("Pull erfolgreich abgeschlossen.");
    }
  } catch (error) {
    console.error("Sync-Fehler:", error);
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

export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}