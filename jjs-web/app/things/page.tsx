import PageContainer from '@/components/ui/pageContainer';
import Card from "@/components/ui/card";

export default function ThingsPage() {
  const placeholderCards = [
    {
      id: 1,
      title: "Original Wordle Hints",
      description: "A tool to provide hints and strategies for solving Wordle puzzles effectively.",
      link: "https://tjhazel.github.io/wordlehints/",
    },
    {
      id: 2,
      title: "Ported Wordle Hints",
      description: "ported wordle hints to be used within the jjs web app, allowing users to access the same helpful hints and strategies for solving Wordle puzzles directly from our platform.",
      link: "/things/wordlehints",
    },
    {
      id: 3,
      title: "Placeholder",
      description: "Connect with like-minded individuals and collaborate on meaningful initiatives.",
      link: "#",
    },
    {
      id: 4,
      title: "Wedding",
      description: "Our wedding website",
       link: "/wedding/arrangements/default.htm",
    },
  ];

   return (
      <PageContainer
         heading="Things"
         description="A collection of miscellaneous items and interests."
      >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {placeholderCards.map((card) => (
           <Card
               key={card.id}
               title={card.title}
               previewText={card.description}
               link={card.link}
               footerText="See more →"
           />
        ))}
      </div>
     </PageContainer>
  );
}
