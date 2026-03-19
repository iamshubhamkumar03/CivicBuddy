"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    profession: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save minimal user data
    localStorage.setItem("civicbuddy_user", JSON.stringify(formData));
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-brand-beige">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-lg max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-serif text-brand-brown font-bold mb-2">Welcome</h1>
          <p className="text-brand-darkgray text-sm">Let's set up your profile to personalize your journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-brand-darkbrown mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="e.g. Rahul Sharma"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-brand-darkbrown mb-1">Age</label>
              <input
                type="number"
                name="age"
                required
                placeholder="e.g. 24"
                value={formData.age}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-darkbrown mb-1">Gender</label>
              <select
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green bg-white"
              >
                <option value="" disabled>Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-darkbrown mb-1">Profession / Grade</label>
            <input
              type="text"
              name="profession"
              required
              placeholder="e.g. Software Engineer or 8th Grade"
              value={formData.profession}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-green hover:bg-brand-lightgreen text-white py-3 rounded-full font-bold text-lg mt-6 transition-colors shadow-md"
          >
            Start My Journey
          </button>
        </form>
      </div>
    </div>
  );
}
