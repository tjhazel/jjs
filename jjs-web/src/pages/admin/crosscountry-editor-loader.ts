import type { LoaderFunctionArgs } from "react-router";

export const crossCountryEditorLoader = ({ params }: LoaderFunctionArgs) => {
   if (!params.id) throw new Response("Missing Cross Country identifier", { status: 400 });
   if (params.id === "new") return { id: null, isNew: true };
   const id = Number.parseInt(params.id, 10);
   if (Number.isNaN(id)) throw new Response("Invalid Cross Country identifier", { status: 400 });
   return { id, isNew: false };
};
