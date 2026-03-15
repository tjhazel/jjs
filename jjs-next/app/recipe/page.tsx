import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

interface Recipe {
  name: string;
  course: string;
  dishType: string;
  createdDate: string;
}

const recipes: Recipe[] = [
  { name: 'Caribbean Snowball', course: 'Any', dishType: 'Drink', createdDate: '2/11/2017' },
  { name: 'Salted Caramels', course: 'Dessert', dishType: 'Dessert', createdDate: '12/15/2010' },
  { name: 'Black Beans with Cheese', course: 'Side dish', dishType: 'Side', createdDate: '10/2/2010' },
  { name: 'Slow-Roasted Pulled Pork', course: 'Dinner', dishType: 'Entree', createdDate: '9/17/2010' },
  { name: 'Cherry Crumble', course: 'Dessert', dishType: 'Crumble', createdDate: '9/17/2010' },
  { name: 'Shrimp Etouffee', course: 'Entree', dishType: 'Entree', createdDate: '9/17/2010' },
  { name: 'Apple Pie Filling', course: 'Dessert', dishType: 'Pie', createdDate: '9/17/2010' },
  { name: 'Pizza Crust', course: 'Entree', dishType: 'dinner', createdDate: '9/17/2010' },
  { name: 'Three Citrus Marinade', course: 'Dinner', dishType: 'Entree', createdDate: '9/15/2010' },
  { name: 'Whole Wheat Tagliolini', course: 'Dinner', dishType: 'Pasta', createdDate: '11/30/2009' },
];

export default function RecipePage() {
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
            {recipes.map((recipe, index) => (
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
