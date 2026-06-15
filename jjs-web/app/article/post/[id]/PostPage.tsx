import PostClientView from "./PostClientView";


// 1. Force the compiler past the check by generating a dummy placeholder file
export async function generateStaticParams() {
   return [{ id: 'placeholder' }];
}

interface PageProps {
   params: Promise<{
      id: string;
   }>;
}

export default async function PostPage({ params }: PageProps) {
   const resolvedParams = await params;
   const id = parseInt(resolvedParams.id, 10);

   return <PostClientView id={id} />;
}