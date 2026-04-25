"use client";

import React from "react";
import { Recipe } from "@/api/recipe/recipe";
import { formatDate } from "@/lib/time.functions";
import { useApiContext } from "../context/ApiContext";
import { useSingleRecipe } from "@/api/recipe/recipe-fetcher";

interface RecipeDetailProps {
  recipeId: number;
  onClose: () => void;
}


export default function RecipeDetail({ recipeId, onClose }: RecipeDetailProps) {

  const { httpGet } = useApiContext();
  const { data: recipe, isLoading: isDetailLoading } = useSingleRecipe(httpGet, recipeId);
  console.log('RecipeDetail', recipe, isDetailLoading);
  if (isDetailLoading || !recipe) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-700">Loading recipe details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{recipe.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Recipe Details</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Source:</strong> {recipe.recipeSource || 'N/A'}</p>
                <p><strong>Course:</strong> {recipe.course}</p>
                <p><strong>Dish Type:</strong> {recipe.dishType}</p>
                <p><strong>Number Served:</strong> {recipe.numberServed}</p>
                <p><strong>Prep Time:</strong> {recipe.prepTime || 'N/A'}</p>
                <p><strong>Cook Time:</strong> {recipe.cookTime || 'N/A'}</p>
                <p><strong>Estimated Cost:</strong> ${recipe.estimatedCost.toFixed(2)}</p>
                <p><strong>Calories:</strong> {recipe.calories || 'N/A'}</p>
                <p><strong>Fat:</strong> {recipe.fat || 'N/A'}g</p>
                <p><strong>Created:</strong> {formatDate(recipe.createdDate)}</p>
                <p><strong>Modified:</strong> {formatDate(recipe.modifiedDate)}</p>
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

          {recipe.description && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{recipe.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Ingredients</h3>
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                <table className="w-full border-collapse border border-gray-300">
                  <tbody>
                    {recipe.ingredients.map((ingredient, index) => (
                      <tr key={index} className="border-b border-gray-300">
                        <td className="py-2 px-4 border-r border-gray-300 font-medium">
                          {ingredient.amount}
                        </td>
                        <td className="py-2 px-4">
                          {ingredient.ingredient}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">No ingredients available</p>
              )}
            </div>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Ingredients</h3>
                {recipe.instructions && recipe.instructions.length > 0 ? (
                  <table className="w-full border-collapse border border-gray-300">
                    <tbody>
                      {recipe.instructions.map((instruction, index) => (
                        <tr key={index} className="border-b border-gray-300">
                          <td className="py-2 px-4 border-r border-gray-300 font-medium">
                            {index + 1}
                          </td>
                          <td className="py-2 px-4">
                            {instruction.name && <p className="font-semibold">{instruction.name}</p>}
                            {instruction.instruction}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">No instructions available</p>
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
    </div>
  );
}