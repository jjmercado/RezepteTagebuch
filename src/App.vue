<script setup lang="ts">
import { ref, computed } from 'vue';
import { db } from './db';
import { liveQuery } from 'dexie';
import { useObservable } from '@vueuse/rxjs';
import { from } from 'rxjs';
import AddRecipeModal from './components/AddRecipeModal.vue';
import RecipeDetail from './components/RecipeDetail.vue';
import type { Recipe } from './types/Recipe';

const isAdding = ref(false);
const categories = ['Alle', 'Frühstück', 'Mittagessen', 'Abendessen', 'Snack'];
const activeCategory = ref('Alle');
const selectedRecipe = ref<Recipe | null>(null);

const recipes = useObservable(
  from(liveQuery(() => db.recipes.toArray()))
);

const filteredRecipes = computed(() => {
  const allRecipes = recipes.value || [];
  
  if (activeCategory.value === 'Alle') {
    return allRecipes;
  }
  
  return allRecipes.filter(r => r.category === activeCategory.value);
})

const openRecipe = (recipe: Recipe) => {
  selectedRecipe.value = recipe;
};

const closeRecipe = () => {
  selectedRecipe.value = null;
};

const deleteRecipe = async (id?: number) => {
  if (!id) return;
  
  await db.recipes.delete(id);
  
  selectedRecipe.value = null; 
};

const recipeToEdit = ref<Recipe | null>(null);

const startEdit = (recipe: Recipe) => {
  selectedRecipe.value = null;
  recipeToEdit.value = recipe;
  isAdding.value = true;
};

const handleModalClose = () => {
  isAdding.value = false;
  recipeToEdit.value = null;
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <header class="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4">
      <h1 class="text-xl font-bold text-slate-800 mb-3 text-center uppercase tracking-wider">
        Mein Rezeptbuch
      </h1>
      
      <div class="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        <button 
          v-for="cat in categories" :key="cat"
          @click="activeCategory = cat"
          :class="[
            'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300',
            activeCategory === cat 
              ? 'bg-orange-500 text-white shadow-md shadow-orange-200 scale-105' 
              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
          ]"
        >
          {{ cat }}
        </button>
      </div>
    </header>

    <main class="p-4 max-w-lg mx-auto space-y-4">
      
      <div 
        v-for="recipe in filteredRecipes" 
        :key="recipe.id" 
        @click="openRecipe(recipe)" 
        class="cursor-pointer bg-white p-5 rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-transform"
      >
        <div class="flex justify-between items-start">
          <div>
            <span class="text-[10px] font-bold text-orange-500 uppercase tracking-widest px-2 py-0.5 bg-orange-50 rounded">
              {{ recipe.category }}
            </span>
            <h2 class="mt-2 font-bold text-slate-800 text-lg leading-tight">{{ recipe.title }}</h2>
          </div>
          <div class="text-yellow-400 text-sm">
            {{ '⭐'.repeat(recipe.rating) }}
          </div>
        </div>
      </div>

      <div v-if="filteredRecipes.length === 0" class="text-center py-20 text-slate-400 italic">
        Noch keine Rezepte gefunden...
      </div>
    </main>

    <button @click="isAdding = true" class="fixed bottom-8 right-6 w-16 h-16 bg-orange-500 text-white rounded-full shadow-2xl shadow-orange-300 flex items-center justify-center text-4xl hover:bg-orange-600 active:scale-90 transition-all z-40 border-4 border-white">
      +
    </button>

    <AddRecipeModal 
      v-if="isAdding" 
      :recipeToEdit="recipeToEdit" 
      @close="handleModalClose" 
    />

    <RecipeDetail 
      v-if="selectedRecipe" 
      :recipe="selectedRecipe" 
      @close="closeRecipe" 
      @delete="deleteRecipe"
      @edit="startEdit" 
    />
  </div>
</template>

<style>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>