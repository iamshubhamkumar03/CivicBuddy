"use client";

import { useState } from "react";
import { Mail, Instagram, Linkedin, Facebook, Building2, Trash2, ShieldAlert, Scale, ExternalLink, Twitter, Smartphone, Send } from "lucide-react";

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState<"authorities" | "person">("person");
  const [violationText, setViolationText] = useState("");
  const [targetHandle, setTargetHandle] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("Twitter");
  const [selectedAuthority, setSelectedAuthority] = useState<string>("https://pgportal.gov.in/");

  const personPlatforms = [
    { name: "Twitter", icon: Twitter, color: "text-blue-400", bg: "bg-blue-50" },
    { name: "Gmail", icon: Mail, color: "text-red-500", bg: "bg-red-50" },
    { name: "Instagram", icon: Instagram, color: "text-pink-500", bg: "bg-pink-50" },
    { name: "LinkedIn", icon: Linkedin, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Facebook", icon: Facebook, color: "text-blue-500", bg: "bg-blue-50" },
  ];

  const authoritiesPortals = [
    { id: "cpgrams", name: "CPGRAMS", desc: "National Public Grievance", link: "https://pgportal.gov.in/", icon: Building2, color: "text-brand-brown", bg: "bg-[#f0e8dc]" },
    { id: "swachh", name: "Swachhata App", desc: "Cleanliness & Civic Issues", link: "https://swachh.city/", icon: Trash2, color: "text-brand-green", bg: "bg-green-50" },
    { id: "publicapp", name: "Public App", desc: "Hyperlocal Video Reporting", link: "https://publicapp.co.in/", icon: Smartphone, color: "text-blue-600", bg: "bg-blue-50" },
    { id: "cyber", name: "Cyber Crime", desc: "Report Digital Offenses", link: "https://cybercrime.gov.in/", icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50" },
    { id: "consumer", name: "NCH", desc: "Consumer Rights & Fraud", link: "https://consumerhelpline.gov.in/", icon: Scale, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  const handleAuthoritiesSubmit = () => {
    window.open(selectedAuthority, "_blank");
  };

  const handlePersonSubmit = () => {
    if (!targetHandle.trim() || !violationText.trim()) {
      alert("Please provide both a target username/email and a message.");
      return;
    }
    
    let url = "";

    if (selectedPlatform === "Twitter") {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`@${targetHandle} ${violationText}`)}`;
    } else if (selectedPlatform === "Gmail") {
      url = `mailto:${targetHandle}?subject=Civic Grievance Report&body=${encodeURIComponent(violationText)}`;
    } else {
      // For platforms that intensely restrict URI deep-linking like Instagram/FB/LinkedIn
      alert(`${selectedPlatform} does not allow direct messaging via web intents. We've copied your message to the clipboard! We will now redirect you to their profile.`);
      navigator.clipboard.writeText(violationText);
      
      const cleanHandle = targetHandle.replace("@", "");
      if (selectedPlatform === "Instagram") url = `https://instagram.com/${cleanHandle}`;
      else if (selectedPlatform === "LinkedIn") url = `https://linkedin.com/in/${cleanHandle}`;
      else if (selectedPlatform === "Facebook") url = `https://facebook.com/${cleanHandle}`;
    }

    if (url) window.open(url, "_blank");
  };

  return (
    <div className="max-w-3xl mx-auto py-10 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="bg-[#fcfaf7] w-full rounded-[3rem] p-10 shadow-lg border border-[#f0e8dc]">
        
        <h1 className="text-4xl font-serif font-bold text-[#8b2b2b] italic text-center mb-10">
          Report Violation
        </h1>

        {/* Custom Tabs */}
        <div className="flex bg-white rounded-2xl mb-8 p-1 shadow-sm border border-gray-100 relative">
          <button
            onClick={() => setActiveTab("authorities")}
            className={`flex-1 py-4 px-6 rounded-xl font-bold text-sm tracking-widest uppercase transition-all z-10 ${
              activeTab === "authorities"
                ? "bg-[#9e2a2b] text-white shadow-md relative overflow-hidden"
                : "text-[#6b829e] hover:bg-gray-50"
            }`}
          >
            Report Authorities
          </button>
          
          <button
            onClick={() => setActiveTab("person")}
            className={`flex-1 py-4 px-6 rounded-xl font-bold text-sm tracking-widest uppercase transition-all z-10 ${
              activeTab === "person"
                ? "bg-[#9e2a2b] text-white shadow-md"
                : "text-[#6b829e] hover:bg-gray-50"
            }`}
          >
            Report Person/Institute
          </button>
        </div>

        {/* =========================================
            AUTHORITIES TAB
            ========================================= */}
        {activeTab === "authorities" && (
          <div className="mb-8 space-y-4">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2 px-2">Official Indian Government Portals</p>
            {authoritiesPortals.map((portal) => {
              const Icon = portal.icon;
              const isSelected = selectedAuthority === portal.link;
              
              return (
                <div
                  key={portal.id}
                  onClick={() => setSelectedAuthority(portal.link)}
                  className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                    isSelected ? "border-[#9e2a2b] bg-white shadow-md" : "border-transparent bg-white/50 hover:bg-white"
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-5 ${portal.bg}`}>
                    <Icon size={28} className={portal.color} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${isSelected ? "text-brand-darkgray" : "text-gray-700"}`}>
                      {portal.name}
                    </h3>
                    <p className="text-sm text-gray-400 font-medium">
                      {portal.desc}
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? "border-[#9e2a2b] bg-[#9e2a2b]" : "border-gray-300"
                  }`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                </div>
              );
            })}
            
            <button
              onClick={handleAuthoritiesSubmit}
              className="w-full mt-4 bg-[#9e2a2b] flex items-center justify-center space-x-2 hover:bg-[#802222] text-white py-5 rounded-2xl font-bold text-lg tracking-widest uppercase transition-colors shadow-lg group"
            >
              <span>Proceed to Official Portal</span>
              <ExternalLink size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* =========================================
            PERSON / INSTITUTE TAB
            ========================================= */}
        {activeTab === "person" && (
          <div>
            <div className="grid grid-cols-5 gap-3 mb-6">
              {personPlatforms.map((platform) => {
                const Icon = platform.icon;
                const isSelected = selectedPlatform === platform.name;
                return (
                  <button
                    key={platform.name}
                    onClick={() => setSelectedPlatform(platform.name)}
                    className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl transition-all ${
                      isSelected
                        ? "bg-white shadow-md border-2 border-gray-100 scale-105"
                        : "bg-white/50 border-2 border-transparent hover:bg-white"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${isSelected ? platform.bg : "bg-gray-50"}`}>
                      <Icon size={20} className={platform.color} />
                    </div>
                    <span className={`text-[9px] uppercase tracking-widest font-black ${isSelected ? "text-gray-500" : "text-gray-400"}`}>
                      {platform.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">
                  Complaint Against {selectedPlatform === "Gmail" ? "(Email Address)" : "(Username / Handle)"}
                </label>
                <input
                  type="text"
                  value={targetHandle}
                  onChange={(e) => setTargetHandle(e.target.value)}
                  placeholder={selectedPlatform === "Gmail" ? "example@email.com" : "@username"}
                  className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#9e2a2b]/30 focus:border-[#9e2a2b] transition-all text-gray-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">
                  Message / Complaint Details
                </label>
                <textarea
                  value={violationText}
                  onChange={(e) => setViolationText(e.target.value)}
                  placeholder={`Draft your message to ${targetHandle || 'the user'} here...`}
                  className="w-full bg-white border border-gray-200 rounded-3xl p-6 h-32 resize-none outline-none focus:ring-2 focus:ring-[#9e2a2b]/30 focus:border-[#9e2a2b] transition-all scrollbar-hide text-gray-700"
                ></textarea>
              </div>
            </div>

            <button
              onClick={handlePersonSubmit}
              className="w-full bg-[#9e2a2b] flex items-center justify-center space-x-2 hover:bg-[#802222] text-white py-5 rounded-2xl font-bold text-lg tracking-widest uppercase transition-colors shadow-lg group"
            >
              <span>{selectedPlatform === "Twitter" ? "Tag on Twitter" : selectedPlatform === "Gmail" ? "Draft Email" : `Message on ${selectedPlatform}`}</span>
              <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform ml-2" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
