"use client" 

import { useRecipe } from '@/api/recipe/recipe-fetcher';
import { useApiContext } from '@/components/context/ApiContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';


export default function RecipePage() {
    const { httpGet } = useApiContext();
    const {data: recipes} = useRecipe(httpGet);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Recipes</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Course</th>
              <th className="py-2 px-4 border-b">Dish Type</th>
              <th className="py-2 px-4 border-b">Created Date</th>
            </tr>
          </thead>
          <tbody>
            {recipes?.map((recipe, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{recipe.name}</td>
                <td className="py-2 px-4 border-b">{recipe.course}</td>
                <td className="py-2 px-4 border-b">{recipe.dishType}</td>
                <td className="py-2 px-4 border-b">{recipe.createdDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-center">
        <span className="mr-2">1</span>
        <span className="mr-2">2</span>
        <span>3</span>
      </div>
      <div className="mt-4 text-center">
        <img src="http://johnandjeri.com/Images/recipeFooter.jpg" alt="Recipe Footer" className="mx-auto" />
      </div>
    </div>
  );
}
