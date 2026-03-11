import Dexie, { type Table } from 'dexie';
import type { Recipe } from './types/Recipe';

export class MyDatabase extends Dexie {
  recipes!: Table<Recipe>; 

  constructor() {
    super('RezepteDB');
    this.version(2).stores({
      recipes: '++id, title, category, is_dirty'  
    });
  }
}

export const db = new MyDatabase();