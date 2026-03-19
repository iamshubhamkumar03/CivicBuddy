"use client";

import { useState } from "react";
import { Search, Gavel } from "lucide-react";

export default function CivicRulesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const rules = [
    {
      title: "Public Nuisance (Sec 268 IPC)",
      description: "Covers acts causing common injury, danger or annoyance to the public.",
    },
    {
      title: "The Motor Vehicles Act, 1988",
      description: "Mandates zebra crossing respect, signal adherence, and prohibited honking.",
    },
    {
      title: "Solid Waste Management Rules",
      description: "Legally mandates source segregation (Dry/Wet) for all households.",
    },
  ];

  const filteredRules = rules.filter(
    (rule) =>
      rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-[#8b572a] italic mb-6 md:mb-0">
          Legal Handbook
        </h1>

        <div className="relative w-full md:w-96 flex items-center bg-white rounded-full shadow-sm p-2 transition-all focus-within:ring-2 focus-within:ring-[#8b572a]">
          <input
            type="text"
            placeholder="Search any civic rule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none px-4 text-gray-700 placeholder-gray-400 text-sm"
          />
          <button className="bg-[#8b572a] hover:bg-[#6e4420] text-white p-3 rounded-full transition-colors">
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-6">
        {filteredRules.map((rule, idx) => (
          <div
            key={idx}
            className="bg-white p-6 md:p-8 rounded-[3rem] shadow-sm border border-[#e6dac7] flex items-center space-x-6 md:space-x-8 hover:shadow-md transition-shadow"
          >
            <div className="bg-[#8b572a] text-white w-20 h-20 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-inner">
              <Gavel size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-serif italic text-[#8b572a] font-bold mb-2">
                {rule.title}
              </h2>
              <p className="text-gray-600 font-medium">{rule.description}</p>
            </div>
          </div>
        ))}

        {filteredRules.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No rules found matching &quot;{searchTerm}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
