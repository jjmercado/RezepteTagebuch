<script setup lang="ts">
import type { Recipe } from '../types/Recipe';

const props = defineProps<{ 
  recipe: Recipe 
}>();

const emit = defineEmits(['close', 'delete']);

const confirmDelete = () => {
  if (confirm(`Möchtest du "${props.recipe.title}" wirklich unwiderruflich löschen?`)) {
    emit('delete', props.recipe.id);
  }
};
</script>

<template>
  <div class="fixed inset-0 z-50 bg-slate-50 overflow-y-auto pb-10">
    <div class="h-40 bg-orange-500 relative flex items-end p-6">
      <button @click="$emit('close')" 
              class="absolute top-4 left-4 bg-white/20 backdrop-blur-md w-10 h-10 rounded-full text-white flex items-center justify-center text-2xl shadow-lg">
        ←
      </button>
      <h1 class="text-3xl font-black text-white drop-shadow-md">{{ recipe.title }}</h1>
    </div>

    <div class="p-6 max-w-lg mx-auto space-y-8">
      <div class="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
        <span class="text-xs font-bold text-orange-500 uppercase px-3 py-1 bg-orange-50 rounded-full">
          {{ recipe.category }}
        </span>
        <div class="text-yellow-400">
          {{ '⭐'.repeat(recipe.rating) }}
        </div>
      </div>

      <section>
        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Zutaten</h3>
        <div class="space-y-3">
          <label v-for="(ing, i) in recipe.ingredients" :key="i" 
                 class="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 cursor-pointer active:bg-slate-50 transition-colors">
            <input type="checkbox" class="w-5 h-5 rounded-full border-slate-300 text-orange-500 focus:ring-orange-500" />
            <div class="flex flex-1 justify-between">
              <span class="text-slate-700 font-medium">{{ ing.name }}</span>
              <span class="text-slate-400 text-sm font-bold">{{ ing.amount }} {{ ing.unit }}</span>
            </div>
          </label>
        </div>
      </section>

      <section>
        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Zubereitung</h3>
        <div class="space-y-6">
          <div v-for="(step, i) in recipe.steps" :key="i" class="flex gap-4">
            <div class="flex-none w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-black text-sm">
              {{ i + 1 }}
            </div>
            <p class="flex-1 text-slate-700 leading-relaxed pt-1">
              {{ step }}
            </p>
          </div>
        </div>
      </section>

      <section v-if="recipe.description" class="pt-6 border-t border-slate-200">
        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 text-center italic">Notizen</h3>
        <p class="text-slate-500 text-sm italic text-center">{{ recipe.description }}</p>
      </section>
    </div>

    <div class="pt-10 pb-10 flex justify-center">
        <button 
            @click="confirmDelete"
            class="flex items-center gap-2 text-red-500 font-bold border-2 border-red-100 px-6 py-3 rounded-2xl hover:bg-red-50 active:scale-95 transition-all text-sm uppercase tracking-widest">
            
            <span>🗑️</span>
            Rezept löschen
        </button>
    </div>
  </div>
</template>