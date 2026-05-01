"use client";

import { Post } from "@/api/post/post";
import Link from "next/link";
import React from "react";

interface ArticleCardProps extends Post {}

export default function ArticleCard({
  postId,
  title,
  createdDate,
  previewText,
  href,
  imageUrl,
}: ArticleCardProps) {

  return (
    <Link
      href={`/article/post/${postId??0}`}
      className="group flex flex-col bg-white border border-gray-200 hover:border-gray-400 transition-colors"
    >
      {imageUrl && (
        <div className="w-full aspect-video overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      )}
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-3">
          {new Date(createdDate).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-700 flex-1 line-clamp-3">
          {previewText}
        </p>
        <div className="mt-4 inline-block text-sm font-medium text-gray-900 group-hover:text-gray-700">
          Read more →
        </div>
      </div>
    </Link>
  );
}
