<script setup lang="ts">
import type { Recipe } from '../types/Recipe';
defineProps<{ recipes: Recipe[] }>();
defineEmits(['close']);

const print = () => window.print();
</script>

<template>
  <div class="fixed inset-0 z-[60] bg-white overflow-y-auto p-6 print:p-0">
    <div class="flex justify-between items-center mb-6 print:hidden">
      <h2 class="text-2xl font-black">Einkaufsliste</h2>
      <div class="flex gap-4">
        <button @click="print" class="text-blue-500 font-bold text-sm">Drucken 🖨️</button>
        <button @click="$emit('close')" class="text-slate-400 font-bold text-sm">Schließen</button>
      </div>
    </div>

    <div class="space-y-6">
      <div v-for="r in recipes" :key="r.id" class="border-b pb-4">
        <h3 class="font-bold text-orange-600 mb-2 uppercase text-xs">{{ r.title }}</h3>
        <ul class="space-y-1">
          <li v-for="(ing, i) in r.ingredients" :key="i" class="flex gap-2 items-center">
            <input type="checkbox" class="print:hidden h-4 w-4 rounded border-slate-300">
            <span class="text-slate-700">{{ ing.amount }} {{ ing.unit }} {{ ing.name }}</span>
          </li>
        </ul>
      </div>
    </div>
    
    <p class="hidden print:block mt-8 text-[10px] text-slate-400">Generiert mit meiner Rezept-App</p>
  </div>
</template>