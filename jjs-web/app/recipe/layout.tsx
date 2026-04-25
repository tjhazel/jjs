import { User } from "lucide-react";

import { Analytics } from "@vercel/analytics/react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    //  <main className="flex min-h-screen w-full flex-col bg-muted/40">
    //     <div>some sort of nav</div>
    //     <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
    //       <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
    //         <User />
    //       </header>
    //       <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40">
    //         {children}
    //       </main>
    //     </div>
    //     <Analytics />
    //   </main>

     <main className="flex min-h-screen w-full flex-col bg-muted/40">
        <div>
        {/* <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14"> */}
          {/* <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"> */}
              <header className="w-full h-[250px] bg-cover bg-center" style={{ backgroundImage: "url('/images/recipeHeader.jpg')" }}>

          </header>
          <main className="">
            {children}
          </main>
        </div>
      </main>
  );
}
