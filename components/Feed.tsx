"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, limit, deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Heart, MessageCircle, Share2, MoreHorizontal, User, Trash2 } from "lucide-react";

interface Post {
  id: string;
  content: string;
  category: string;
  mediaUrl: string;
  mediaType: string;
  userName: string;
  userAvatar: string;
  createdAt: any;
  likes: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Problem: "bg-red-50 text-red-600 border-red-100",
  Solution: "bg-green-50 text-green-600 border-green-100",
  Discussion: "bg-blue-50 text-blue-600 border-blue-100",
  Appreciation: "bg-orange-50 text-orange-600 border-orange-100",
};

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("civicbuddy_user");
    if (userStr) {
       try {
         const user = JSON.parse(userStr);
         setCurrentUser(user.fullName);
       } catch (e) {
         console.error("Error parsing user from localStorage:", e);
       }
    }

    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(20));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore subscription error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (post: Post) => {
    try {
      // 1. Delete Media from Storage if it exists
      if (post.mediaUrl) {
         try {
            // Check if URL is valid for ref()
            if (post.mediaUrl.includes("firebasestorage.googleapis.com")) {
               const storageRef = ref(storage, post.mediaUrl);
               await deleteObject(storageRef);
            }
         } catch (e) {
            console.warn("Storage deletion error (non-critical):", e);
         }
      }

      // 2. Delete Document from Firestore
      await deleteDoc(doc(db, "posts", post.id));
      setDeletingId(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Error: " + (error instanceof Error ? error.message : "Unknown error"));
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#e6dac7] animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
            <div className="aspect-video bg-gray-100 rounded-2xl mb-4" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-12">
      <h3 className="text-2xl font-serif font-bold text-brand-darkbrown mb-4">Community Feed</h3>
      
      {posts.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border border-dashed border-brand-brown/30">
          <p className="text-brand-brown font-medium">No updates yet. Be the first to share something!</p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="bg-white rounded-[2rem] shadow-sm border border-[#e6dac7] overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-white font-bold ring-2 ring-brand-green/10">
                  {post.userAvatar ? (
                    <img src={post.userAvatar} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    post.userName?.[0] || <User size={20} />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-brand-darkbrown leading-tight">{post.userName}</h4>
                  <div className="flex items-center space-x-2">
                     <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[post.category] || "bg-gray-50 text-gray-500 border-gray-100"}`}>
                        {post.category}
                     </span>
                     <span className="text-[10px] text-brand-brown/60 uppercase font-black">
                        {post.createdAt?.toDate ? new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true }).format(post.createdAt.toDate()) : "Just now"}
                     </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                 {post.userName === currentUser && (
                    <div className="flex items-center">
                       {deletingId === post.id ? (
                          <div className="flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-full animate-in fade-in slide-in-from-right-2">
                             <span className="text-[10px] font-bold text-red-600 uppercase">Confirm?</span>
                             <button 
                                onClick={() => handleDelete(post)}
                                className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold hover:bg-red-700"
                             >
                                Yes
                             </button>
                             <button 
                                onClick={() => setDeletingId(null)}
                                className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-bold hover:bg-gray-300"
                             >
                                No
                             </button>
                          </div>
                       ) : (
                          <button 
                              onClick={() => setDeletingId(post.id)}
                              className="p-2 hover:bg-red-50 rounded-full text-red-400 opacity-60 hover:opacity-100 transition-all"
                              title="Delete Post"
                          >
                              <Trash2 size={18} />
                          </button>
                       )}
                    </div>
                 )}
                 <button className="p-2 hover:bg-gray-50 rounded-full text-brand-brown/40">
                    <MoreHorizontal size={20} />
                 </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
              <p className="text-brand-darkbrown leading-relaxed">{post.content}</p>
            </div>

            {/* Media */}
            {post.mediaUrl && (
              <div className="bg-gray-50 border-y border-[#f5ead9]">
                {post.mediaType === "image" && (
                   <img src={post.mediaUrl} className="w-full max-h-[500px] object-contain mx-auto" alt="Post media" />
                )}
                {post.mediaType === "video" && (
                   <video src={post.mediaUrl} className="w-full max-h-[500px]" controls />
                )}
                {post.mediaType === "audio" && (
                   <div className="p-8 flex flex-col items-center justify-center space-x-3">
                      <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center text-brand-green mb-4">
                        <Music size={32} />
                      </div>
                      <audio src={post.mediaUrl} className="w-full max-w-sm" controls />
                   </div>
                )}
              </div>
            )}

            {/* Footer Actions */}
            <div className="p-4 flex items-center justify-between border-t border-[#f5ead9]">
               <div className="flex items-center space-x-6">
                  <button className="flex items-center space-x-2 text-brand-brown/60 hover:text-red-500 transition-colors">
                     <Heart size={22} />
                     <span className="font-bold text-sm">{post.likes || 0}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-brand-brown/60 hover:text-brand-green transition-colors">
                     <MessageCircle size={22} />
                     <span className="font-bold text-sm">Reply</span>
                  </button>
               </div>
               <button className="text-brand-brown/60 hover:text-brand-darkbrown transition-colors">
                  <Share2 size={22} />
               </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Simple Music icon used internally
function Music({ size, className }: { size?: number, className?: string }) {
    return (
        <svg 
            width={size || 24} 
            height={size || 24} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
        </svg>
    );
}
