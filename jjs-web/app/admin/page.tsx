import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";

   
export default function AdminPage() {
   const placeholderCards = [
      {
         id: 1,
         title: "Posts",
         description: "Edit all posts",
         link: "/admin/post",
      }
   ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">Administration</h1>
        <p className="text-gray-600">Manage your site content and settings.</p>
      </div>
      <div className="border border-gray-200 p-6 sm:p-8 text-gray-600">
           {placeholderCards.map((card) => (
              <Card key={card.id}>
                 <CardHeader>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <CardDescription className="text-gray-600">
                       {card.description}
                    </CardDescription>
                 </CardContent>
                 <CardFooter className="pt-0">
                    <Link
                       href={card.link}
                       className="text-sm font-medium text-gray-900 hover:text-gray-700"
                    >
                       Learn more →
                    </Link>
                 </CardFooter>
              </Card>
           ))}
      </div>
    </div>
  );
}
