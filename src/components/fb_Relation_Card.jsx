// src/components/fb_Relation_Card.jsx
"use client";

import React from "react";
import Image from "next/image";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

// Helper to choose a text color based on the relationship type
const getRelationshipColor = (type) => {
  switch (type) {
    case "Family":
      return "text-blue-500";
    case "Girlfriend/Wife":
      return "text-pink-500";
    case "Boyfriend/Husband":
      return "text-yellow-500";
    case "Associate":
      return "text-green-500";
    case "Friend":
      return "text-purple-500";
    default:
      return "text-gray-500";
  }
};

export default function FbRelationCard({ username }) {
  const { data, error } = useSWR(
    username ? `/api/fb_riskscore?username=${username}` : null,
    fetcher
  );

  if (error) {
    return (
      <div className="mt-5 mx-12 bg-[#1F2937] shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Relationships</h2>
        <p className="text-red-500">Error loading relationships.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mt-5 mx-12 bg-[#1F2937] shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Relationships</h2>
        <p className="text-white">Loading relationships…</p>
      </div>
    );
  }

  const { relationships } = data;

  // If the API returned a string (e.g. "No relationships found")
  if (typeof relationships === "string") {
    return (
      <div className="mt-5 mx-12 bg-[#1F2937] shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Relationships</h2>
        <p className="text-[#F0FFFF]">{relationships}</p>
      </div>
    );
  }

  return (
    <div className="mt-5  bg-[#1F2937] border border-[#6c757d] shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Relationships</h2>
      <ul className="grid grid-cols-5 gap-4">
        {Object.entries(relationships).map(([userKey, relData]) => (
          <li
            key={userKey}
            className="border border-[#6c757d] rounded-md p-5 shadow-md flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 cursor-pointer"
            onClick={() => {
              // Open the Facebook profile in a new tab
              window.open(
                `https://www.facebook.com/${encodeURIComponent(
                  relData.username
                )}`,
                "_blank"
              );
            }}
          >
            <Image
              src={relData.profileImage || "/no-profile-pic-img.png"}
              alt={`Profile of ${relData.username}`}
              width={80}
              height={80}
              className="w-16 h-16 rounded-full mb-2 object-cover"
              onError={(e) => {
                e.currentTarget.src = "/no-profile-pic-img.png";
              }}
            />
            <span className="font-medium text-[#F0FFFF] text-[16px] truncate">
              {relData.username}
            </span>
            <span
              className={`text-sm font-semibold ${getRelationshipColor(
                relData.relationship
              )}`}
            >
              {relData.relationship}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
