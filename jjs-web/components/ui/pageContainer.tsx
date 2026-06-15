'use client';

interface PageContainerProps {
   heading?: string;
   description?: string;
   children: React.ReactNode;
}

export default function PageContainer({ heading, description, children }: PageContainerProps) {
 
  return (
     <div className="space-y-12">
        {(heading || description) && (
           <div className="space-y-3">
              {heading && (
                 <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900">
                    {heading}
                 </h1>
              )}
              {description && (
                 <p className="text-gray-600 text-base sm:text-lg max-w-2xl">
                    {description}
                 </p>
              )}
           </div>
        )}

        <div className="space-y-6">
           {children }
        </div>
     </div>
  );
}

