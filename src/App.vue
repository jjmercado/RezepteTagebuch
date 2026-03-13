<script setup lang="ts">
import { ref, computed } from 'vue';
import { db, autoSyncOnStart, migrateToUUIDs } from './db';
import { liveQuery } from 'dexie';
import { useObservable } from '@vueuse/rxjs';
import { from } from 'rxjs';
import AddRecipeModal from './components/AddRecipeModal.vue';
import RecipeDetail from './components/RecipeDetail.vue';
import ShoppingList from './components/ShoppingList.vue';
import type { Recipe } from './types/Recipe';
import { onMounted } from 'vue';

const isAdding = ref(false);
const showShoppingList = ref(false);
const categories = ['Alle', 'Frühstück', 'Mittagessen', 'Abendessen', 'Snack'];
const activeCategory = ref('Alle');
const selectedRecipe = ref<Recipe | null>(null);
const selectedIds = ref<string[]>([]);
const isSelectionMode = ref(false);

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

const deleteRecipe = async (id?: string) => {
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

// Ändere den Typ von 'number' auf 'string' (oder 'string | number', falls du mischst)
const toggleSelection = (id: string) => {
  const index = selectedIds.value.indexOf(id);
  
  if (index > -1) {
    selectedIds.value.splice(index, 1);
  } else {
    selectedIds.value.push(id);
  }
  
  if (selectedIds.value.length === 0) {
    isSelectionMode.value = false;
  }
};

const selectedRecipes = computed(() => {
  if (!recipes.value) return [];
  
  return recipes.value.filter(r => 
    r.id !== undefined && selectedIds.value.includes(String(r.id))
  );
});

const aggregatedIngredients = computed(() => {
  return selectedRecipes.value.flatMap(r => r.ingredients);
});

onMounted(async () => {
  await migrateToUUIDs();
  await autoSyncOnStart();
});
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
      @click="isSelectionMode ? toggleSelection(String(recipe.id)) : openRecipe(recipe)"
      @contextmenu.prevent="isSelectionMode = true; toggleSelection(String(recipe.id))" 
      class="relative p-5 rounded-2xl border-2 transition-all cursor-pointer mb-4"
      :class="[
        selectedIds.includes(String(recipe.id)) 
          ? 'border-orange-500 bg-orange-50 shadow-md' 
          : 'border-transparent bg-white shadow-sm border-slate-100'
      ]"
    >
      <div v-if="isSelectionMode || selectedIds.includes(String(recipe.id))" 
          class="absolute -top-2 -right-2 w-7 h-7 rounded-full border-2 flex items-center justify-center z-10"
          :class="selectedIds.includes(String(recipe.id)) ? 'bg-orange-500 border-white shadow-lg' : 'border-slate-300 bg-white'">
        <span v-if="selectedIds.includes(String(recipe.id))" class="text-white text-xs font-bold">✓</span>
      </div>

      <div class="flex justify-between items-start">
        <div class="flex-1">
          <span class="text-[10px] font-black text-orange-500 uppercase tracking-widest px-2 py-0.5 bg-orange-100 rounded-md">
            {{ recipe.category }}
          </span>
          <h2 class="mt-2 font-bold text-slate-800 text-lg leading-tight">{{ recipe.title }}</h2>
        </div>

        <div class="flex text-yellow-400 text-xs ml-2 mt-1">
          <span v-for="n in 5" :key="n">
            {{ n <= recipe.rating ? '★' : '☆' }}
          </span>
        </div>
      </div>

      <div class="mt-3 flex items-center gap-3 text-slate-400 text-xs font-medium">
        <span class="flex items-center gap-1">🛒 {{ recipe.ingredients.length }} Zutaten</span>
        <span class="flex items-center gap-1">⏱️ {{ recipe.steps.length }} Schritte</span>
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

    <div v-if="selectedIds.length > 0" 
        class="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-40">
      <span class="text-sm font-bold">{{ selectedIds.length }} gewählt</span>
      <button @click="showShoppingList = true" class="bg-orange-500 px-4 py-1 rounded-full text-sm font-bold">
        🛒 Liste zeigen
      </button>
      <button @click="selectedIds = []; isSelectionMode = false" class="text-slate-400 text-xs">Abbrechen</button>
    </div>

    <ShoppingList 
      v-if="showShoppingList" 
      :recipes="selectedRecipes" 
      @close="showShoppingList = false" 
    />
  </div>
</template>

<style>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>