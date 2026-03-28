'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import Image from 'next/image';
import { useApiContext } from '@/components/context/ApiContext';
import { useAlbumByPath } from '@/api/album/album-fetcher';
import { IMAGE_PREFIX } from '@/api/album/album-models';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';


export default function AlbumPage() {
   const { httpGet } = useApiContext();
   const searchParams = useSearchParams();
   const path = searchParams.get('path') || undefined;
   const logicalPath = path?.replace(new RegExp('^' + IMAGE_PREFIX), '') || undefined;

   const { filteredData, isLoading, error } = useAlbumByPath(httpGet, path);

console.log('path:', path, filteredData);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Album Page {path && `- ${path}`}</CardTitle>
        <CardDescription>
          {isLoading && 'Loading album...'}
          {!isLoading && `Album ${path ? `at ${path}` : 'root'}.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2 text-sm">
          <Link href="/album" className="text-blue-600 hover:text-blue-800">
            Album
          </Link>
          {logicalPath && <>
              {logicalPath?.split('/').map((segment, index, segments) => {
                const breadcrumbPath = segments.slice(0, index + 1).join('/');
                const isLast = index === segments.length - 1;
                return (
                  <div key={index} className="flex items-center gap-2">
                    {index > 0 && (
                      <span className="text-gray-400">/</span>
                    )}
                    {isLast ? (
                      <span className="text-gray-700 font-medium">{segment}</span>
                    ) : (
                      <Link
                        href={`/album?path=${encodeURIComponent(IMAGE_PREFIX + breadcrumbPath)}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {segment}
                      </Link>
                    )}
                  </div>
                );
              })}
            </>          
          }
        </div>
        <div>{filteredData?.name}</div>

        {filteredData && filteredData?.folders?.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Folders</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {filteredData.folders.map((folder, index) => (
                <Link
                  key={index}
                  href={`/album?path=${encodeURIComponent(folder.relativePath)}`}
                  className="block p-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors text-center"
                >
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {folder.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredData && filteredData?.files?.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={file.httpPath}
                  alt={file.title || file.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
              <div className="mt-2">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {file.title || file.name}
                </h3>
                {file.comment && (
                  <p className="text-xs text-gray-500 truncate">{file.comment}</p>
                )}
              </div>
            </div>
          ))}
        </div>
{/* 
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
        
            <Image
                src='http://johnandjeri.com/images/slides/bristol.jpg'
                alt='Bristol'
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>

            <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
        
            <Image
                src='http://johnandjeri.com/Albums/image.ashx?imagewidth=500&path=Climbing%2fOuray%2f1253031JohnLead03.jpg%2f'
                alt='Climbing'
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>

            <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
        
            <Image
                src='https://localhost:7275/Image/Climbing/rmnp/526571JohnBelaying.jpg'
                alt='526571JohnBelaying'
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>

             <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
        
            <Image
                src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjZqXdBaIFjv8YHqKSdL4slrPTX2IT-StllQ&sg'
                alt='google image'
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>

            <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">

          <img
                src="https://localhost:7275/Image/Climbing/rmnp/526571JohnBelaying.jpg"
                alt="From img tag"
              />
                        </div>

          </div>
           */}
      </CardContent>
    </Card>
  );
}
