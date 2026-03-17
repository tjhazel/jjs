"use client" 

import { useRecipe } from '@/api/recipe/recipe-fetcher';
import { useApiContext } from '@/components/context/ApiContext';
import RecipeTable from '@/components/recipe/RecipeTable';

export default function RecipePage() {
    const { httpGet } = useApiContext();
    const {data: recipes, isLoading} = useRecipe(httpGet);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Recipes</h1>
      <RecipeTable recipes={recipes} isLoading={isLoading} />
      <div className="mt-8 text-center">
        <img src="http://johnandjeri.com/Images/recipeFooter.jpg" alt="Recipe Footer" className="mx-auto" />
      </div>
    </div>
  );
}
