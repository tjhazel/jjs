import PageContainer from '@/components/ui/pageContainer';
import Card from "@/components/ui/card";
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
      <PageContainer
         heading="Administration"
         description="Manage your site content and settings."
      >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {placeholderCards.map((card) => (
           <Card
               key={card.id}
               title={card.title}
               previewText={card.description}
               link={card.link}
               footerText="Manage more →"
           />
        ))}
      </div>
     </PageContainer>
  );
}
