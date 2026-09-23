import { type LoaderFunctionArgs } from 'react-router';

export const postLoader = async ({ params }: LoaderFunctionArgs) => {
  const idStr = params.id; // Matches the ":id" segment in your route path

  if (!idStr) {
    throw new Response("Missing Post Identifier", { status: 400 });
  }

  const parsedId = parseInt(idStr, 10);
  if (isNaN(parsedId)) {
    throw new Response("Invalid Identification Format", { status: 400 });
  }

  return { id: parsedId };
};
