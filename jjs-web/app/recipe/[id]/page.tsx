"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useApiContext } from "@/components/context/ApiContext";
import { useSingleRecipe } from "@/api/recipe/recipe-fetcher";
import { formatDate } from "@/lib/time.functions";

interface RecipeDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const recipeId = parseInt(resolvedParams.id, 10);

  const { httpGet } = useApiContext();
  const { data: recipe, isLoading } = useSingleRecipe(httpGet, recipeId);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 text-center py-8">
        <div className="inline-block">
          <p className="text-gray-700">Loading recipe details...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container mx-auto p-4 text-center py-8">
        <p className="text-gray-700">Recipe not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          ← Back
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Print
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold">{recipe.name}</h1>
        </div>
        
        {recipe.description && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{recipe.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Recipe Details</h3>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Source:</strong> {recipe.recipeSource || "N/A"}
              </p>
              <p>
                <strong>Course:</strong> {recipe.course}
              </p>
              <p>
                <strong>Dish Type:</strong> {recipe.dishType}
              </p>
              <p>
                <strong>Number Served:</strong> {recipe.numberServed}
              </p>
              <p>
                <strong>Prep Time:</strong> {recipe.prepTime || "N/A"}
              </p>
              <p>
                <strong>Cook Time:</strong> {recipe.cookTime || "N/A"}
              </p>
              <p>
                <strong>Estimated Cost:</strong> ${recipe.estimatedCost.toFixed(2)}
              </p>
              <p>
                <strong>Calories:</strong> {recipe.calories || "N/A"}
              </p>
              <p>
                <strong>Fat:</strong> {recipe.fat || "N/A"}g
              </p>
              <p>
                <strong>Created:</strong> {formatDate(recipe.createdDate)}
              </p>
              <p>
                <strong>Modified:</strong> {formatDate(recipe.modifiedDate)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.recipeCategories && recipe.recipeCategories.length > 0 ? (
                recipe.recipeCategories.map((category, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                  >
                    {category}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No categories</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Ingredients</h3>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              <table className="w-full border-collapse border border-gray-300">
                <tbody>
                  {recipe.ingredients.map((ingredient, index) => (
                    <tr key={index} className="border-b border-gray-300">
                      <td className="py-2 px-4 border-r border-gray-300 font-medium">
                        {ingredient.amount} {ingredient.unitOfMeasure} {ingredient.ingredient} - {ingredient.description}</td>
                   </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No ingredients available</p>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Instructions</h3>
            {recipe.instructions && recipe.instructions.length > 0 ? (
              <table className="w-full border-collapse border border-gray-300">
                <tbody>
                  {recipe.instructions.map((instruction, index) => (
                    <React.Fragment key ={index}>
                      <tr className="border-b border-gray-300">
                        <td className="py-2 px-4 border-r border-gray-300 font-medium">
                          Step {index+1}. {instruction.name}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-2 px-4 border-r border-gray-300 font-medium">
                          {instruction.instruction}
                        </td>
                    </tr>
                   </React.Fragment>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No Instructions available</p>
            )}
          </div>
        </div>
        <div className="mt-8 text-center">
          <img
            src="http://johnandjeri.com/Images/recipeFooter.jpg"
            alt="Recipe Footer"
            className="mx-auto"
          />
        </div>
      </div>
    </div>
  );
}