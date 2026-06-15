"use client"

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useApiContext } from "@/components/context/ApiContext";
import { useSingleRecipe } from "@/api/recipe/recipe-fetcher";
import { formatDate } from "@/lib/time.functions";

interface Props {
   id: number;
}

export default function RecipeClientView({ id }: Props) {
  const router = useRouter();

  const { httpGet } = useApiContext();
  const { data: recipe, isLoading } = useSingleRecipe(httpGet, id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 sm:py-24">
        <div className="text-center">
          <p className="text-gray-600">Loading recipe details...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-6">
        <p className="text-gray-600 text-lg">Recipe not found.</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const recipePicture = recipe.picture?.contentBase64 ? `data:image/jpeg;base64,${recipe.picture?.contentBase64}` : undefined;

  return (
    <div className="space-y-8">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pb-6 border-b border-gray-200">
        <button
          onClick={() => router.back()}
          className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-300 text-gray-900 text-sm font-medium hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
        >
          Print
        </button>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">{recipe.name}</h1>
        {recipe.recipeSource && (
          <p className="text-sm text-gray-600"><span className="font-medium">Source:</span> {recipe.recipeSource}</p>
        )}
      </div>

      {/* Image */}
      {recipePicture && (
        <div className="aspect-video sm:aspect-[2/1] relative overflow-hidden bg-gray-100">
          <Image
            src={recipePicture}
            alt={recipe.picture?.name || recipe.picture?.fileName || "Recipe Image"}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 800px"
          />
        </div>
      )}

      {/* Description */}
      {recipe.description && (
        <div className="space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Description</h2>
          <p className="text-gray-700 leading-relaxed">{recipe.description}</p>
        </div>
      )}

      {/* Recipe metadata grid - mobile first */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Left column - Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Recipe Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Course:</span>
                <span className="text-gray-700">{recipe.course}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Dish Type:</span>
                <span className="text-gray-700">{recipe.dishType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Servings:</span>
                <span className="text-gray-700">{recipe.numberServed}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Prep Time:</span>
                <span className="text-gray-700">{recipe.prepTime || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Cook Time:</span>
                <span className="text-gray-700">{recipe.cookTime || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Cost:</span>
                <span className="text-gray-700">${recipe.estimatedCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Calories:</span>
                <span className="text-gray-700">{recipe.calories || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Fat:</span>
                <span className="text-gray-700">{recipe.fat || "N/A"}g</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3">
                <span className="font-medium text-gray-900">Created:</span>
                <span className="text-gray-700">{formatDate(recipe.createdDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Modified:</span>
                <span className="text-gray-700">{formatDate(recipe.modifiedDate)}</span>
              </div>
            </div>
          </div>

          {/* Right column - Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
            {recipe.recipeCategories && recipe.recipeCategories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {recipe.recipeCategories.map((category, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-900 px-3 py-1.5 text-xs font-medium border border-gray-200"
                  >
                    {category}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No categories</p>
            )}
          </div>
        </div>

        {/* Ingredients and Instructions - mobile first */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Ingredients */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Ingredients</h3>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex gap-3 border-b border-gray-200 pb-2 last:border-0">
                    <span className="font-medium text-gray-900 min-w-24">
                      {ingredient.amount} {ingredient.unitOfMeasure}
                    </span>
                    <div className="flex-1 text-gray-700">
                      <span className="font-medium">{ingredient.ingredient}</span>
                      {ingredient.description && (
                        <span className="block text-gray-600 text-xs mt-1">{ingredient.description}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No ingredients available</p>
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Instructions</h3>
            {recipe.instructions && recipe.instructions.length > 0 ? (
              <ol className="space-y-3 text-sm">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="font-semibold text-gray-900 min-w-6">{index + 1}.</span>
                    <div className="flex-1 text-gray-700">
                      <span className="font-medium block mb-1">{instruction.name}</span>
                      <p className="text-gray-600">{instruction.instruction}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-500 text-sm">No instructions available</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer image */}
      <div className="mt-12 pt-8 border-t border-gray-200 text-center">
        <img
          src="http://johnandjeri.com/Images/recipeFooter.jpg"
          alt="Recipe Footer"
          className="mx-auto max-w-full"
        />
      </div>
    </div>
  );
}