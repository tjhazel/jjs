"use client" 

import { useRecipe } from '@/api/recipe/recipe-fetcher';
import { useApiContext } from '@/components/context/ApiContext';
import RecipeTable from '@/components/recipe/RecipeTable';

export default function RecipePage() {
    const { httpGet } = useApiContext();
    const {data: recipes, isLoading} = useRecipe(httpGet);
  
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">Recipes</h1>
        <p className="text-gray-600 text-sm">Browse and explore our collection of recipes</p>
      </div>
      <RecipeTable recipes={recipes} isLoading={isLoading} />
      <div className="mt-12 pt-8 border-t border-gray-200 text-center">
        <img src="http://johnandjeri.com/Images/recipeFooter.jpg" alt="Recipe Footer" className="mx-auto max-w-full" />
      </div>
    </div>
  );
}
