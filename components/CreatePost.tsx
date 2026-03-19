"use client";

import { useState, useRef } from "react";
import { db, storage, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Image, Video, Music, Type, Send, X, Loader2 } from "lucide-react";

const CATEGORIES = ["Problem", "Solution", "Discussion", "Appreciation"];

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Discussion");
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | "audio" | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) setFileType("image");
      else if (selectedFile.type.startsWith("video/")) setFileType("video");
      else if (selectedFile.type.startsWith("audio/")) setFileType("audio");
    }
  };

  const handleCreatePost = async () => {
    if (!content && !file) return;
    setIsUploading(true);

    try {
      let mediaUrl = "";
      let mediaType = "";

      if (file) {
        const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        mediaUrl = await getDownloadURL(uploadResult.ref);
        mediaType = fileType || "unknown";
      }

      const userStr = localStorage.getItem("civicbuddy_user");
      const user = userStr ? JSON.parse(userStr) : { fullName: "Anonymous" };

      await addDoc(collection(db, "posts"), {
        content,
        category,
        mediaUrl,
        mediaType,
        userName: user.fullName || "Anonymous",
        userAvatar: user.photoURL || "",
        createdAt: serverTimestamp(),
        likes: 0,
      });

      // Reset
      setContent("");
      setFile(null);
      setFileType(null);
      setIsUploading(false);
      alert("Post shared successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      setIsUploading(false);
      alert("Failed to share post. Check console.");
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#e6dac7] mb-8">
      <div className="flex items-start space-x-4 mb-4">
         <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-white font-bold">
            {localStorage.getItem("civicbuddy_user") ? JSON.parse(localStorage.getItem("civicbuddy_user")!).fullName?.[0] : "A"}
         </div>
         <textarea
          placeholder="Share something about civic sense..."
          className="flex-1 bg-gray-50 rounded-2xl p-4 outline-none resize-none h-24 focus:ring-2 focus:ring-brand-green/20 transition-all border border-transparent focus:border-brand-green/30"
          value={content}
          onChange={(e) => setContent(e.target.value)}
         />
      </div>

      {file && (
        <div className="relative mb-4 rounded-2xl overflow-hidden bg-gray-100 p-2">
            <button 
                onClick={() => {setFile(null); setFileType(null);}}
                className="absolute top-4 right-4 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors z-10"
            >
                <X size={16} />
            </button>
            {fileType === "image" && <img src={URL.createObjectURL(file)} className="max-h-64 mx-auto rounded-xl object-contain" />}
            {fileType === "video" && <video src={URL.createObjectURL(file)} className="max-h-64 mx-auto rounded-xl" controls />}
            {fileType === "audio" && (
                <div className="p-4 flex items-center space-x-3 bg-white rounded-xl">
                    <Music className="text-brand-green" />
                    <span className="text-sm font-medium">{file.name}</span>
                </div>
            )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
            <input 
                type="file" 
                hidden 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*,video/*,audio/*"
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-full hover:bg-brand-green/10 text-brand-darkbrown transition-all"
                title="Photo"
            >
                <Image size={20} />
            </button>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-full hover:bg-brand-green/10 text-brand-darkbrown transition-all"
                title="Video"
            >
                <Video size={20} />
            </button>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-full hover:bg-brand-green/10 text-brand-darkbrown transition-all"
                title="Audio"
            >
                <Music size={20} />
            </button>
        </div>

        <div className="flex items-center space-x-3">
            <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-gray-50 border border-[#e6dac7] rounded-full px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-green/20"
            >
                {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>

            <button 
                onClick={handleCreatePost}
                disabled={isUploading || (!content && !file)}
                className="bg-brand-green text-white px-6 py-2 rounded-full font-bold flex items-center space-x-2 hover:bg-brand-darkgreen transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                <span>Post</span>
            </button>
        </div>
      </div>
    </div>
  );
}
