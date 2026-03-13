<script setup lang="ts">
import { ref } from 'vue';
import { db } from '../db';
import type { Recipe } from '../types/Recipe';

const emit = defineEmits(['close']);

const categories = ['Frühstück', 'Mittagessen', 'Abendessen', 'Snack', 'Dessert'];

const props = defineProps<{
  recipeToEdit?: Recipe | null
}>();

const newRecipe = ref<Recipe>(
  props.recipeToEdit 
    ? JSON.parse(JSON.stringify(props.recipeToEdit))
    : {
        title: '',
        category: 'Mittagessen',
        rating: 3,
        description: '',
        ingredients: [],
        steps: [],
        is_dirty: true,
        createdAt: Date.now()
      }
);

const saveRecipe = async () => {
  if (!newRecipe.value.title) return alert("Titel fehlt!");

  const data = JSON.parse(JSON.stringify(newRecipe.value));
  
  data.is_dirty = true;

  if (data.id) {
    await db.recipes.update(data.id, data);
    console.log("Rezept aktualisiert:", data.id);
  } else {
    data.id = crypto.randomUUID();
    data.createdAt = Date.now();
    
    await db.recipes.add(data);
    console.log("Neues Rezept gespeichert mit UUID:", data.id);
  }

  emit('close');
};

const newIngredient = ref({ name: '', amount: '', unit: 'g' });

const addIngredient = () => {
  if (!newIngredient.value.name) return;
  
  newRecipe.value.ingredients.push({ ...newIngredient.value });
  
  newIngredient.value = { name: '', amount: '', unit: 'g' };
};

const removeIngredient = (index: number) => {
  newRecipe.value.ingredients.splice(index, 1);
};

const newStep = ref('');

const addStep = () => {
  if (!newStep.value.trim()) return;
  
  newRecipe.value.steps.push(newStep.value.trim());
  
  newStep.value = '';
};

const removeStep = (index: number) => {
  newRecipe.value.steps.splice(index, 1);
};
</script>

<template>
  <div class="fixed inset-0 z-50 bg-white overflow-y-auto p-6">
    <div class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-black text-slate-800">Neues Rezept</h2>
        <button @click="$emit('close')" class="text-slate-400 font-bold uppercase text-xs tracking-widest">
            Abbrechen
        </button>
        </div>

        <div class="space-y-6 max-w-lg mx-auto">
        <div>
            <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Name</label>
            <input v-model="newRecipe.title" type="text" class="w-full bg-slate-100 rounded-xl p-4 outline-none" />
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div>
            <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Kategorie</label>
            <select v-model="newRecipe.category" class="w-full bg-slate-100 rounded-xl p-4 outline-none">
                <option v-for="cat in categories" :key="cat">{{ cat }}</option>
            </select>
            </div>
            <div>
            <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Sterne</label>
            <input v-model.number="newRecipe.rating" type="number" min="1" max="5" class="w-full bg-slate-100 rounded-xl p-4 outline-none" />
            </div>
        </div>

        <div class="space-y-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest">Zutaten</h3>
    
        <div class="space-y-2">
            <div v-for="(ing, i) in newRecipe.ingredients" :key="i" 
                class="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div class="flex gap-2">
                <span class="font-bold text-orange-600">{{ ing.amount }}{{ ing.unit }}</span>
                <span class="text-slate-700">{{ ing.name }}</span>
            </div>
            <button @click="removeIngredient(i)" class="text-red-400 p-1 hover:bg-red-50 rounded-lg transition-colors">
                ✕
            </button>
            </div>
        </div>

        <div class="flex flex-col gap-2 p-3 bg-slate-100 rounded-xl">
            <div class="flex gap-2">
                <input 
                    v-model="newIngredient.amount" 
                    type="text" 
                    placeholder="Menge" 
                    class="w-1/4 p-2 rounded-lg border-none outline-none text-sm shadow-sm"
                />
                <select 
                    v-model="newIngredient.unit" 
                    class="w-1/4 p-2 rounded-lg border-none outline-none text-sm shadow-sm bg-white">
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="L">L</option>
                    <option value="Stk">Stk</option>
                    <option value="Prise">Prise</option>
                    <option value="EL">EL</option>
                    <option value="TL">TL</option>
                </select>
                <input 
                    v-model="newIngredient.name" 
                    type="text" 
                    placeholder="Zutat" 
                    class="flex-1 p-2 rounded-lg border-none outline-none text-sm shadow-sm"
                    @keyup.enter="addIngredient"
                />
            </div>
            
            <button 
            @click="addIngredient" 
            class="w-full bg-slate-800 text-white py-2 rounded-lg font-bold text-sm hover:bg-slate-700 transition-colors">
                Zutat hinzufügen
            </button>
        </div>
    </div>

    <div class="mt-8 space-y-4">
    <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest">Zubereitungsschritte</label>
    
    <div class="space-y-3">
        <div v-for="(step, index) in newRecipe.steps" :key="index" 
            class="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 relative group">
        <span class="font-bold text-orange-500">{{ index + 1 }}.</span>
        <span class="flex-1 text-sm text-slate-700">{{ step }}</span>
        <button @click="removeStep(index)" class="text-red-400 text-xs">Entfernen</button>
        </div>
    </div>

    <div class="flex gap-2 mt-2">
        <textarea 
        v-model="newStep" 
        placeholder="Schritt beschreiben..." 
        class="flex-1 p-3 rounded-xl border-none bg-slate-100 focus:ring-2 focus:ring-orange-500 outline-none text-sm resize-none"
        rows="2"
        @keyup.enter.ctrl="addStep"></textarea>
        <button 
        @click="addStep" 
        class="bg-slate-800 text-white px-4 rounded-xl font-bold text-xl"
            >+
        </button>
    </div>
        <p class="text-[10px] text-slate-400 italic">Tipp: Strg + Enter zum schnellen Hinzufügen</p>
    </div>

      <button @click="saveRecipe" class="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200">
        Speichern
      </button>
    </div>
  </div>
</template>