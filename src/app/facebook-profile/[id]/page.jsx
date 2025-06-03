// import Navbar from '@/components/Navbar';

// export default function ProfilePage() {

//   return (
//   <div className="bg-[#111827] min-h-screen">
//       <div className="max-w-screen-2xl mx-auto px-5">
//         <Navbar />
//         <div className="pt-44">
//           <h1 className="text-2xl font-bold mb-4 text-white">Profile Posts</h1>
//         </div>
//       </div>
//     </div>
//   )
// }

// // src/app/facebook-profile/[id]/page.jsx (correct)
// import Navbar from "@/components/Navbar";
// import FbPosts from "@/components/FbPosts";
// import UserDetailFB from "@/components/UserDetailFB";


// export default async function ProfilePage({ params }) {
//   const { id } = params; // this is the Facebook profile_id from the route

//   return (
//     <div className="bg-[#111827] min-h-screen">
//       <div className="max-w-screen-2xl mx-auto px-5">
//         <Navbar />

        
//         {/* ─── USER DETAILS CARD ───────────────────────────────────────────── */}
//         <div className="pt-44 pb-8">
//           <UserDetailFB profileId={id} />
//         </div>

//         <div className="pt-44 pb-20 px-5 pr-5">
//           <h1 className="text-2xl font-bold mb-4 text-white">Profile Posts</h1>
//           {/* Pass the `id` from the dynamic route as `profileId` */}
//           <FbPosts profileId={id} />
//         </div>
//       </div>
//     </div>
//   );
// }


// src/app/facebook-profile/[id]/page.jsx
import Navbar from "@/components/Navbar";
import FbPosts from "@/components/FbPosts";
import UserDetailFB from "@/components/UserDetailFB";
import Image from "next/image";
import RiskScoreCard from "@/components/RiskScoreCard";
import FbRelationCard from "@/components/fb_Relation_Card";   
import Fb_InterestsCard from "@/components/Fb_InterestsCard";



import { 
  GlobeAltIcon, 
  PhoneIcon 
} from "@heroicons/react/24/outline";

// A helper that runs on the server to fetch Facebook profile details for “location”
async function fetchFacebookProfile(profileId) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/facebookSearch?username=${profileId}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    console.error("Failed to fetch fb profile for location:", await res.text());
    return null;
  }
  return res.json();
}

export default async function ProfilePage({ params }) {
  const { id } = params; // numeric Facebook profile_id

  // 1) Fetch profile details server‐side so we can extract “location”
  let locationText = "Unknown";
  try {
    const profileData = await fetchFacebookProfile(id);
    const aboutPublic = profileData?.about_public || [];
    // Find first `item.text` that looks like “City, State…”
    const found = aboutPublic.find((item) => /,/.test(item.text));
    if (found) {
      locationText = found.text;
    }
  } catch (e) {
    console.error(e);
    locationText = "Unknown";
  }

    // Determine if we have a “real” location or must fall back:
  const hasRealLocation = locationText && locationText !== "Unknown";


  return (
    <div className="bg-[#111827] min-h-screen">
      <div className="max-w-screen-2xl mx-auto px-5">
        {/* ─── NAVBAR ───────── */}
        <Navbar />

        {/* ─── USER DETAILS CARD (profile picture, name, bio) ───────────────────── */}
        <div className="pt-44 pb-8">
          <UserDetailFB profileId={id} />
        </div>

        {/* ─── STATS CARDS ─────────────────────────────────────────────────────── */}
        <div className="px-5 md:px-0 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-7 mx-6 mt-6">
            {/* ── Card #1: Risk Score (dummy) ────────────────────────────────────── */}
                     <RiskScoreCard username={id} />

            <div className="bg-[#1F2937] px-4 py-2 pt-4 shadow-md flex items-center space-x-4 hover:scale-105 transition-transform duration-300">
              <Image 
                src="/card2.png" 
                alt="Latest Post" 
                width={48} 
                height={48} 
                className="flex-shrink-0" 
              />
              <div>
                <p className="text-[#E9ECEF] font-bold text-[16px] mb-[4px]">
                  Latest Post
                </p>
                <p className="text-[22px] text-white mb-[4px]">
                  a month ago
                </p>
                <p className="mt-1 mb-[4px] text-[14px] text-[#28A745]">
                  09/12/2023
                </p>
              </div>
            </div>

            {/* ── Card #3: Location (dynamic) ─────────────── */}
            <div className="bg-[#1F2937] px-4 py-2 pt-4 shadow-md flex items-center space-x-4 hover:scale-105 transition-transform duration-300">
              <GlobeAltIcon className="h-12 w-12 text-blue-300 flex-shrink-0" />
              <div>
                <p className="text-[#E9ECEF] font-bold text-[16px] mb-[4px]">
                  Location
                </p>
                <p className="text-[18px] text-white mb-[4px]">
                  {hasRealLocation ? locationText : "United States"}
                </p>
                {/* <p className="mt-1 mb-[4px] text-[14px] text-[#28A745]">
                  New York, NY
                </p> */}
              </div>
            </div>

            {/* ── Card #4: Contact Info (dummy) ───────────────────────────────────── */}
            <div className="bg-[#1F2937] px-4 py-2 pt-4 shadow-md flex items-center space-x-4 hover:scale-105 transition-transform duration-300">
              <PhoneIcon className="h-12 w-12 text-blue-300 flex-shrink-0" />
              <div>
                <p className="text-[#E9ECEF] font-bold text-[16px] mb-[4px]">
                  Contact info
                </p>
                <p className="text-[18px] text-white mb-[4px]">
                  +1 (555) 123-4567
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Relationship List */}
        <div className="pt-[44px] pb-[44px]">
        <FbRelationCard username={id} />
        </div>

       {/* Interests Section */}
        <div className="pt-[44px] pb-[44px]">
      <Fb_InterestsCard username={id} />
      </div>


        {/* ─── PROFILE POSTS ───────────────── */}
        <div className="px-7 pb-20">
          <h1 className="text-2xl font-bold mb-4 text-white">Profile Posts</h1>
          <FbPosts profileId={id} />
        </div>
      </div>
    </div>
  );
}
