"use client";

import CreatePost from "@/components/CreatePost";
import Feed from "@/components/Feed";

export default function CommunityFeedPage() {
  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="mb-10 mt-4">
        <h1 className="text-4xl font-serif text-brand-brown font-bold mb-2">Community Feed</h1>
        <p className="text-brand-darkgray">See what others are sharing about civic sense and daily life.</p>
      </div>

      <div className="space-y-8">
        <CreatePost />
        <Feed />
      </div>
    </div>
  );
}
