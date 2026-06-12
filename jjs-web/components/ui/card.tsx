'use client';

import Link from "next/link";

interface CardProps {
   title: string;
   previewText?: string;
   previewLines?: number;
   timestamp?: Date;
   imageUrl?: string;
   alt?: string;
   link: string;
   footerText?: string;
}

export default function Card(props: CardProps) {
   const { title, previewText, previewLines, timestamp, imageUrl, alt, link, footerText } = props;

   return (
      <Link
         href={link}
         className="group flex flex-col bg-white border border-gray-200 hover:border-gray-400 transition-colors"
      >
         {imageUrl && (
            <div className="w-full aspect-video overflow-hidden bg-gray-100">
               <img
                  src={imageUrl}
                  alt={alt ?? title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
               />
            </div>
         )}
         <div className="p-4 sm:p-6 flex-1 flex flex-col">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
               {title}
            </h3>
            {timestamp &&
               <div className="text-xs sm:text-sm text-gray-600 mb-3">
                  {new Date(timestamp).toLocaleDateString()}
               </div>
            }
            <div className={`text-sm text-gray-700 flex-1 ${previewLines ? `line-clamp-${previewLines}` : ''} ${previewLines ? '' : 'overflow-auto'}`}>
               {previewText}
            </div>
            {timestamp &&
               <div className="mt-4 inline-block text-sm font-medium text-gray-900 group-hover:text-gray-700">
                  { footerText }
               </div>
            }
         </div>
      </Link>
   );
}

