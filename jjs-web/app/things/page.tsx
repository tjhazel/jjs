import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";

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
      title: "Community Hub",
      description: "Connect with like-minded individuals and collaborate on meaningful initiatives.",
      link: "#",
    },
    {
      id: 4,
      title: "Latest Updates",
      description: "Stay informed about recent developments and exciting announcements in the community.",
      link: "#",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">Things</h1>
        <p className="text-gray-600">A collection of miscellaneous items and interests.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
