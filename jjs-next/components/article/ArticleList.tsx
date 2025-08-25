"use client";

import React from "react";
import ArticleCard from "./ArticleCard";
import { Post } from "@/api/post/post";

interface ArticleListProps {
  articles: Post[]|undefined;
}

export default function ArticleList({ articles }: ArticleListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles?.map((article) => (
        <ArticleCard key={article.postId} {...article} />
      ))}
    </div>
  );
}
