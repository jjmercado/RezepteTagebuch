<script setup lang="ts">
import { ref } from 'vue';
import type { Recipe } from '../types/Recipe';

const props = defineProps<{ recipes: Recipe[] }>();
defineEmits(['close']);

// Liste für extra Dinge (z.B. Klopapier, Milch etc.)
const extraItems = ref<string[]>([]);
const newItemName = ref('');

const addExtraItem = () => {
  if (!newItemName.value.trim()) return;
  extraItems.value.push(newItemName.value.trim());
  newItemName.value = ''; // Eingabefeld leeren
};

const removeExtraItem = (index: number) => {
  extraItems.value.splice(index, 1);
};

const printPage = () => window.print();
</script>

<template>
  <div class="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md flex items-start justify-center overflow-y-auto p-4 sm:p-8 print:relative print:bg-white print:p-0 print:block">
    
    <div class="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-10 print:shadow-none print:p-0 print:max-w-full">
      
      <div class="flex flex-wrap justify-between items-center gap-4 mb-8 pb-6 border-b border-slate-100 print:mb-4 print:border-slate-800">
        <div class="flex-1 min-w-[200px]">
          <h2 class="text-2xl sm:text-3xl font-black text-slate-800">Einkaufsliste</h2>
          <p class="text-slate-400 text-sm italic">{{ recipes.length }} Rezepte</p>
        </div>
        
        <div class="flex items-center gap-2 print:hidden">
          <button @click="printPage" class="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-orange-100 active:scale-95 transition-all">
            Drucken
          </button>
          <button @click="$emit('close')" class="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-200 active:scale-95 transition-all">
            Schließen
          </button>
        </div>
      </div>

      <div class="space-y-8">
        <div v-for="r in recipes" :key="r.id" class="break-inside-avoid print:mb-6">
          <h3 class="text-xs font-black text-orange-500 uppercase tracking-widest mb-3 px-2 border-l-4 border-orange-500">
            {{ r.title }}
          </h3>
          
          <ul class="space-y-2">
            <li v-for="(ing, i) in r.ingredients" :key="i" 
                class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl print:bg-transparent print:p-1">
              <div class="w-5 h-5 border-2 border-slate-300 rounded print:border-slate-800 flex-none"></div>
              <div class="flex-1 flex justify-between border-b border-slate-100 pb-1">
                <span class="text-slate-700 font-medium">{{ ing.name }}</span>
                <span class="text-slate-400 font-bold text-sm">{{ ing.amount }} {{ ing.unit }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <section class="mt-8 pt-6 border-t-2 border-slate-100 print:border-slate-800">
        <h3 class="text-xs font-black text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span class="w-2 h-2 bg-orange-500 rounded-full"></span>
          Zusätzliche Besorgungen
        </h3>

        <div class="flex gap-2 mb-4 print:hidden">
          <input 
            v-model="newItemName" 
            type="text" 
            placeholder="z.B. Toilettenpapier..." 
            class="flex-1 p-3 bg-slate-100 rounded-xl outline-none text-sm focus:ring-2 focus:ring-orange-400"
            @keyup.enter="addExtraItem"
          />
          <button @click="addExtraItem" class="bg-orange-500 text-white px-4 rounded-xl font-bold">+</button>
        </div>

        <ul class="space-y-2">
          <li v-for="(item, index) in extraItems" :key="index" 
              class="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl print:bg-transparent print:p-1">
            
            <div class="w-5 h-5 border-2 border-blue-300 rounded print:border-slate-800 flex-none flex items-center justify-center">
              <button @click="removeExtraItem(index)" class="text-[10px] text-blue-400 print:hidden">✕</button>
            </div>

            <div class="flex-1 border-b border-blue-100 border-dashed pb-1 print:border-slate-300">
              <span class="text-slate-700 font-medium print:text-black">{{ item }}</span>
            </div>
          </li>
        </ul>
        
        <div class="hidden print:block mt-4 space-y-4">
          <div v-for="n in 3" :key="n" class="flex items-center gap-3">
            <div class="w-5 h-5 border-2 border-slate-800 rounded flex-none"></div>
            <div class="flex-1 border-b border-slate-300 h-6"></div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
@media print {
  :deep(#app > *:not(.fixed)) {
    display: none !important;
  }

  :deep(body), :deep(html) {
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .fixed {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: auto !important;
    display: block !important;
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
    backdrop-filter: none !important;
  }

  .bg-white {
    box-shadow: none !important;
    max-width: 100% !important;
    padding: 0 !important;
  }

  .break-inside-avoid {
    break-inside: avoid;
    page-break-inside: avoid;
    display: block;
    margin-bottom: 2rem;
  }
}
</style>