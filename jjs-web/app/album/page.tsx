'use client';

import Image from 'next/image';
import { useApiContext } from '@/components/context/ApiContext';
import { useAlbumByPath } from '@/api/album/album-fetcher';
import { IMAGE_PREFIX } from '@/api/album/album-models';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

export default function AlbumPage() {
   return (
      <Suspense fallback={<div>Loading albums...</div>}>
         <AlbumContent />
      </Suspense>
   );
}

function AlbumContent() {
   const { httpGet } = useApiContext();
   const searchParams = useSearchParams();
   const path = searchParams.get('path') || undefined;
   const logicalPath = path?.replace(new RegExp('^' + IMAGE_PREFIX), '') || undefined;

   const { filteredData, isLoading, error } = useAlbumByPath(httpGet, path);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
          {isLoading ? 'Loading...' : (path ? 'Album' : 'Photos')}
        </h1>
        
        {/* Breadcrumb */}
        {!isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-600 overflow-x-auto pb-2">
            <Link href="/album" className="font-medium text-gray-900 hover:text-gray-700 whitespace-nowrap">
              Photos
            </Link>
            {logicalPath && 
              logicalPath.split('/').map((segment, index, segments) => {
                const breadcrumbPath = segments.slice(0, index + 1).join('/');
                const isLast = index === segments.length - 1;
                return (
                  <div key={index} className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-gray-400">/</span>
                    {isLast ? (
                      <span className="font-medium text-gray-900">{segment}</span>
                    ) : (
                      <Link
                        href={`/album?path=${encodeURIComponent(IMAGE_PREFIX + breadcrumbPath)}`}
                        className="text-gray-900 hover:text-gray-700"
                      >
                        {segment}
                      </Link>
                    )}
                  </div>
                );
              })
            }
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-600">Loading album...</div>
      ) : (
        <>
          {/* Folders */}
          {filteredData && filteredData.folders && filteredData.folders.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Folders</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredData.folders.map((folder, index) => (
                  <Link
                    key={index}
                    href={`/album?path=${encodeURIComponent(folder.relativePath)}`}
                    className="group block p-4 border border-gray-200 text-center hover:border-gray-400 transition-colors"
                  >
                    <div className="text-2xl mb-2">📁</div>
                    <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-gray-700">
                      {folder.name}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Images */}
          {filteredData && filteredData.files && filteredData.files.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Photos {filteredData.files.length && `(${filteredData.files.length})`}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredData.files.map((file, index) => (
                  <div key={index} className="group">
                    <div className="aspect-square relative overflow-hidden bg-gray-100 border border-gray-200 group-hover:border-gray-400 transition-colors">
                      <Image
                        src={file.httpPath}
                        alt={file.title || file.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                    <div className="mt-2 space-y-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {file.title || file.name}
                      </h3>
                      {file.comment && (
                        <p className="text-xs text-gray-600 line-clamp-2">{file.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!filteredData || (filteredData.files?.length === 0 && filteredData.folders?.length === 0) && (
            <div className="text-center py-12 text-gray-600">
              No albums or photos found.
            </div>
          )}
        </>
      )}
    </div>
  );
}
