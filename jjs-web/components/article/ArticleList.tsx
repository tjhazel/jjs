"use client";

import React from "react";
import ArticleCard from "./ArticleCard";
import { Post } from "@/api/post/post";

interface ArticleListProps {
  posts: Post[]|undefined;
}

export default function ArticleList({ posts }: ArticleListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts?.map((post) => (
        <ArticleCard key={post.postId} {...post} />
      ))}
    </div>
  );
}
