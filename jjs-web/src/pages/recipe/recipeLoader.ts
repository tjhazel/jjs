import { type LoaderFunctionArgs } from 'react-router';

export const recipeLoader = async ({ params }: LoaderFunctionArgs) => {
  const idStr = params.id;
  if (!idStr) throw new Response("Missing Recipe Identifier", { status: 400 });

  const parsedId = parseInt(idStr, 10);
  if (isNaN(parsedId)) throw new Response("Invalid Identification Format", { status: 400 });

  return { id: parsedId };
};
