import EditPostClientView from "./EditPostClientView";

// 1. Force the compiler past the check by generating a dummy placeholder file
export async function generateStaticParams() {
   return [{ id: 'placeholder' }];
}

interface PageProps {
   params: Promise<{
      id: string;
   }>;
}

export default async function EditPostPage({ params }: PageProps) {
   const resolvedParams = await params;
   const id = resolvedParams?.id === "new" ? undefined : parseInt(resolvedParams.id, 10);
   return <EditPostClientView id={id} />;
}
