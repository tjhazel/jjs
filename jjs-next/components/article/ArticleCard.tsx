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
      href={`/article/${postId??0}`}
      className="block bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-200"
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mb-2">
          {new Date(createdDate).toLocaleDateString()}
        </p>
        <p className="text-gray-700">{previewText}</p>
      </div>
    </Link>
  );
}
