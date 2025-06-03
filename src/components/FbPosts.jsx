// // src/components/FbPosts.jsx (code which is correct and showing 3 posts correctly)
// "use client";

// import React, { useState, useEffect } from "react";

// export default function FbPosts({ profileId }) {
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch posts from your API
//   useEffect(() => {
//     if (!profileId) return;

//     const fetchPosts = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const res = await fetch(`/api/fb_posts?profile_id=${encodeURIComponent(profileId)}`);
//         if (!res.ok) {
//           throw new Error(`Error fetching posts: ${res.statusText}`);
//         }
//         const data = await res.json();
//         setPosts(data.results || []);
//       } catch (err) {
//         console.error(err);
//         setError(err.message || "Unknown error");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPosts();
//   }, [profileId]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center py-8">
//         <span className="text-gray-400">Loading posts...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="py-8 px-4 bg-red-900 rounded-md">
//         <p className="text-red-200">Failed to load posts: {error}</p>
//       </div>
//     );
//   }

//   if (posts.length === 0) {
//     return (
//       <div className="py-8 px-4">
//         <p className="text-gray-400">No posts to display.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="overflow-x-auto">
//       <table className="table-auto w-full bg-gray-800 rounded-md overflow-hidden">
//         <thead className="bg-gray-700">
//           <tr>
//             <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Image</th>
//             <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Post / Title</th>
//             <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Timestamp</th>
//             <th className="px-4 py-2 text-center text-sm font-medium text-gray-200">Comments</th>
//             <th className="px-4 py-2 text-center text-sm font-medium text-gray-200">Reactions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {posts.map((post) => {
//             // Convert Unix timestamp → local string
//             const date = new Date(post.timestamp * 1000);
//             const formattedDate = date.toLocaleString();

//             // Decide which image to show:
//             // 1) post.image (if scraper put it here)
//             // 2) attached_post.photo_url (if this post is resharing a photo)
//             // 3) post.video_thumbnail (if it’s a video)
//             // 4) fallback to author’s avatar
//             const imageUrl =
//               post.image ||
//               post.attached_post?.photo_url ||
//               post.video_thumbnail ||
//               post.author?.profile_picture_url ||
//               null;

//             return (
//               <tr key={post.post_id} className="border-b border-gray-700">
//                 {/* 1. IMAGE CELL */}
//                 <td className="px-4 py-2">
//                   {imageUrl ? (
//                     <img
//                       src={imageUrl}
//                       alt="post image"
//                       className="h-12 w-12 object-cover rounded-md"
//                     />
//                   ) : (
//                     <div className="h-12 w-12 bg-gray-600 flex items-center justify-center rounded-md">
//                       <span className="text-gray-400 text-xs">No Image</span>
//                     </div>
//                   )}
//                 </td>

//                 {/* 2. MESSAGE / TITLE CELL */}
//                 <td className="px-4 py-2">
//                   <p className="text-gray-100 text-sm whitespace-pre-wrap">
//                     {post.message || "(No message)"}
//                   </p>
//                 </td>

//                 {/* 3. TIMESTAMP CELL */}
//                 <td className="px-4 py-2">
//                   <p className="text-gray-300 text-sm">{formattedDate}</p>
//                 </td>

//                 {/* 4. COMMENTS COUNT CELL */}
//                 <td className="px-4 py-2 text-center">
//                   <span className="text-gray-200 text-sm">{post.comments_count}</span>
//                 </td>

//                 {/* 5. REACTIONS COUNT CELL */}
//                 <td className="px-4 py-2 text-center">
//                   <span className="text-gray-200 text-sm">{post.reactions_count}</span>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// }


// // src/components/FbPosts.jsx
// "use client";

// import React, { useState, useEffect } from "react";

// export default function FbPosts({ profileId }) {
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch (and auto‐paginate) until we have ≥ 5 posts or no more pages
//   useEffect(() => {
//     if (!profileId) return;

//     const fetchAtLeastFive = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         let accumulated = [];
//         let nextCursor = null;
//         let loopCount = 0;

//         do {
//           // Build URL for current “page”
//           let url = `/api/fb_posts?profile_id=${encodeURIComponent(profileId)}`;
//           if (nextCursor) {
//             url += `&cursor=${encodeURIComponent(nextCursor)}`;
//           }

//           const res = await fetch(url);
//           if (!res.ok) {
//             throw new Error(`Error fetching posts: ${res.statusText}`);
//           }

//           const data = await res.json();
//           const results = data.results || [];
//           accumulated = accumulated.concat(results);
//           nextCursor = data.cursor || null;

//           loopCount++;
//           // Just in case, prevent an infinite loop—stop after 5 pages:
//           if (loopCount >= 5) break;
//         } while (accumulated.length < 5 && nextCursor);

//         // Keep only the first 5
//         setPosts(accumulated.slice(0, 5));
//       } catch (err) {
//         console.error(err);
//         setError(err.message || "Unknown error");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAtLeastFive();
//   }, [profileId]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center py-8">
//         <span className="text-gray-400">Loading posts...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="py-8 px-4 bg-red-900 rounded-md">
//         <p className="text-red-200">Failed to load posts: {error}</p>
//       </div>
//     );
//   }

//   if (posts.length === 0) {
//     return (
//       <div className="py-8 px-4">
//         <p className="text-gray-400">No posts to display.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="overflow-x-auto">
//       <table className="table-auto w-full bg-gray-800 rounded-md overflow-hidden">
//         <thead className="bg-gray-700">
//           <tr>
//             <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Image</th>
//             <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Post / Title</th>
//             <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Timestamp</th>
//             <th className="px-4 py-2 text-center text-sm font-medium text-gray-200">Comments</th>
//             <th className="px-4 py-2 text-center text-sm font-medium text-gray-200">Reactions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {posts.map((post) => {
//             const date = new Date(post.timestamp * 1000);
//             const formattedDate = date.toLocaleString();

//             // Pick any available thumbnail (post.image, attached_post.photo_url, video_thumbnail, or author avatar)
//             const imageUrl =
//               post.image ||
//               post.attached_post?.photo_url ||
//               post.video_thumbnail ||
//               post.author?.profile_picture_url ||
//               null;

//             return (
//               <tr key={post.post_id} className="border-b border-gray-700">
//                 <td className="px-4 py-2">
//                   {imageUrl ? (
//                     <img
//                       src={imageUrl}
//                       alt="post image"
//                       className="h-12 w-12 object-cover rounded-md"
//                     />
//                   ) : (
//                     <div className="h-12 w-12 bg-gray-600 flex items-center justify-center rounded-md">
//                       <span className="text-gray-400 text-xs">No Image</span>
//                     </div>
//                   )}
//                 </td>
//                 <td className="px-4 py-2">
//                   <p className="text-gray-100 text-sm whitespace-pre-wrap">
//                     {post.message || "(No message)"}
//                   </p>
//                 </td>
//                 <td className="px-4 py-2">
//                   <p className="text-gray-300 text-sm">{formattedDate}</p>
//                 </td>
//                 <td className="px-4 py-2 text-center">
//                   <span className="text-gray-200 text-sm">{post.comments_count}</span>
//                 </td>
//                 <td className="px-4 py-2 text-center">
//                   <span className="text-gray-200 text-sm">{post.reactions_count}</span>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// }


// src/components/FbPosts.jsx (correct code of pagination but taking time to response)
// "use client";

// import React, { useState, useEffect } from "react";

// export default function FbPosts({ profileId }) {
//   const POSTS_PER_PAGE = 5;

//   const [allPosts, setAllPosts] = useState([]);    // ⟵ “All” results from API
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [currentPage, setCurrentPage] = useState(1);

//   // 1) Fetch _all_ posts ONCE (using all=true)
//   useEffect(() => {
//     if (!profileId) return;

//     const fetchAllPosts = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         // We pass all=true so that our API endpoint will paginate
//         // internally until it has every post it can find.
//         const url = `/api/fb_posts?profile_id=${encodeURIComponent(profileId)}&all=true`;
//         const res = await fetch(url);
//         if (!res.ok) {
//           throw new Error(`Error fetching all posts: ${res.statusText}`);
//         }

//         const data = await res.json();
//         // data.results is an array of ALL posts. We store it.
//         setAllPosts(data.results || []);
//       } catch (err) {
//         console.error(err);
//         setError(err.message || "Unknown error");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllPosts();
//   }, [profileId]);

//   // 2) Compute derived values
//   const totalPosts = allPosts.length;
//   const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

//   // 3) Determine which 5 posts to show right now
//   const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
//   const currentPosts = allPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

//   // 4) Render
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center py-8">
//         <span className="text-gray-400">Loading posts...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="py-8 px-4 bg-red-900 rounded-md">
//         <p className="text-red-200">Failed to load posts: {error}</p>
//       </div>
//     );
//   }

//   if (totalPosts === 0) {
//     return (
//       <div className="py-8 px-4">
//         <p className="text-gray-400">No posts to display.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {/* ——— TABLE OF “currentPosts” ——— */}
//       <div className="overflow-x-auto">
//         <table className="table-auto w-full bg-gray-800 rounded-md overflow-hidden">
//           <thead className="bg-gray-700">
//             <tr>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Image</th>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Post / Title</th>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Timestamp</th>
//               <th className="px-4 py-2 text-center text-sm font-medium text-gray-200">Comments</th>
//               <th className="px-4 py-2 text-center text-sm font-medium text-gray-200">Reactions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentPosts.map((post) => {
//               const date = new Date(post.timestamp * 1000);
//               const formattedDate = date.toLocaleString();

//               // Pick any available thumbnail
//               const imageUrl =
//                 post.image ||
//                 post.attached_post?.photo_url ||
//                 post.video_thumbnail ||
//                 post.author?.profile_picture_url ||
//                 null;

//               return (
//                 <tr key={post.post_id} className="border-b border-gray-700">
//                   <td className="px-4 py-2">
//                     {imageUrl ? (
//                       <img
//                         src={imageUrl}
//                         alt="post image"
//                         className="h-12 w-12 object-cover rounded-md"
//                       />
//                     ) : (
//                       <div className="h-12 w-12 bg-gray-600 flex items-center justify-center rounded-md">
//                         <span className="text-gray-400 text-xs">No Image</span>
//                       </div>
//                     )}
//                   </td>
//                   <td className="px-4 py-2">
//                     <p className="text-gray-100 text-sm whitespace-pre-wrap">
//                       {post.message || "(No message)"}
//                     </p>
//                   </td>
//                   <td className="px-4 py-2">
//                     <p className="text-gray-300 text-sm">{formattedDate}</p>
//                   </td>
//                   <td className="px-4 py-2 text-center">
//                     <span className="text-gray-200 text-sm">{post.comments_count}</span>
//                   </td>
//                   <td className="px-4 py-2 text-center">
//                     <span className="text-gray-200 text-sm">{post.reactions_count}</span>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {/* ——— PAGINATION CONTROLS ——— */}
//       <div className="flex justify-center space-x-2">
//         {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
//           <button
//             key={pageNum}
//             onClick={() => setCurrentPage(pageNum)}
//             className={`
//               px-3 py-1 rounded-md text-sm
//               ${pageNum === currentPage
//                 ? "bg-indigo-600 text-white"
//                 : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
//               }
//             `}
//           >
//             {pageNum}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }


// src/components/FbPosts.jsx (almost correct)
// "use client";

// import React, { useState, useEffect } from "react";

// export default function FbPosts({ profileId }) {
//   const POSTS_PER_PAGE = 5;

//   // ─── STATE ─────────────────────────────────────────────────────────────
//   // pageCursors[n] is the cursor needed to fetch page n.
//   // - pageCursors[1] = null              (means “fetch the very first page with no cursor”)
//   // - pageCursors[2] = "<cursor-from-page-1>"
//   // - pageCursors[3] = "<cursor-from-page-2>"  etc.
//   const [pageCursors, setPageCursors] = useState({ 1: null });

//   // pageData[n] is an array of up to 5 posts for that page.
//   const [pageData, setPageData] = useState({});

//   // The highest page‐number we’ve discovered so far.
//   // Starts at 1. Once page 1 returns a cursor, we bump this to 2, etc.
//   const [maxPageReached, setMaxPageReached] = useState(1);

//   // Which page is currently selected?
//   const [currentPage, setCurrentPage] = useState(1);

//   // If we’re in the middle of fetching page N, loadingPage = N.
//   // Otherwise loadingPage = null.
//   const [loadingPage, setLoadingPage] = useState(null);

//   // Any fetch‐error message
//   const [error, setError] = useState(null);

//   // ─── Whenever profileId changes, reset everything and load page 1 ────────
//   useEffect(() => {
//     if (!profileId) return;

//     // Reset all pagination state:
//     setPageCursors({ 1: null });
//     setPageData({});
//     setMaxPageReached(1);
//     setCurrentPage(1);
//     setError(null);

//     // Fetch page 1 right away:
//     fetchPage(1);
//   }, [profileId]);

//   // ─── fetchPage(n): fetch exactly 5 posts for page n ─────────────────────
//   async function fetchPage(pageNum) {
//     // If we already have data for this page, or are already loading it, do nothing:
//     if (pageData[pageNum] || loadingPage === pageNum) {
//       return;
//     }

//     const cursor = pageCursors[pageNum]; // could be null (for page 1) or a string

//     setLoadingPage(pageNum);
//     setError(null);

//     try {
//       // Build the URL. Omit &cursor= when cursor is null (i.e. page 1).
//       let url = `/api/fb_posts?profile_id=${encodeURIComponent(profileId)}`;
//       if (cursor) {
//         url += `&cursor=${encodeURIComponent(cursor)}`;
//       }

//       const res = await fetch(url);
//       if (!res.ok) {
//         throw new Error(`Failed to fetch page ${pageNum}: ${res.status} ${res.statusText}`);
//       }

//       const data = await res.json();
//       const posts = data.results || [];
//       const nextCursor = data.cursor || null; // null if this was the last page

//       // 1) Cache the posts for pageNum
//       setPageData((prev) => ({
//         ...prev,
//         [pageNum]: posts,
//       }));

//       // 2) If there’s a nextCursor, that means page (pageNum+1) exists
//       if (nextCursor) {
//         setPageCursors((prev) => ({
//           ...prev,
//           [pageNum + 1]: nextCursor,
//         }));
//         setMaxPageReached((prev) => Math.max(prev, pageNum + 1));
//       } else {
//         // No nextCursor → pageNum was the final page
//         setMaxPageReached((prev) => Math.max(prev, pageNum));
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Unknown error");
//     } finally {
//       setLoadingPage(null);
//     }
//   }

//   // ─── RENDERING ─────────────────────────────────────────────────────────

//   // While loading the “currentPage,” show a spinner message instead of the table:
//   if (loadingPage === currentPage) {
//     return (
//       <div className="flex justify-center items-center py-8">
//         <span className="text-gray-400">Loading page {currentPage}…</span>
//       </div>
//     );
//   }

//   // If an error occurred fetching the currentPage, show it:
//   if (error) {
//     return (
//       <div className="py-8 px-4 bg-red-900 rounded-md">
//         <p className="text-red-200">Error: {error}</p>
//       </div>
//     );
//   }

//   // Once loadingPage is null, we expect pageData[currentPage] to exist (or be an empty array if no posts).
//   const postsForCurrentPage = pageData[currentPage] || [];

//   // If page 1 has zero posts, show “No posts to display.”
//   if (currentPage === 1 && postsForCurrentPage.length === 0) {
//     return (
//       <div className="py-8 px-4">
//         <p className="text-gray-400">No posts to display.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {/* ——— TABLE FOR currentPage POSTS ——————————————————————————————— */}
//       <div className="overflow-x-auto">
//         <table className="table-auto w-full bg-gray-800 rounded-md overflow-hidden">
//           <thead className="bg-gray-700">
//             <tr>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Image</th>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Post / Title</th>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Timestamp</th>
//               <th className="px-4 py-2 text-center text-sm font-medium text-gray-200">Comments</th>
//               <th className="px-4 py-2 text-center text-sm font-medium text-gray-200">Reactions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {postsForCurrentPage.map((post) => {
//               const date = new Date(post.timestamp * 1000);
//               const formattedDate = date.toLocaleString();

//               // Pick any available thumbnail:
//               const imageUrl =
//                 post.image ||
//                 post.attached_post?.photo_url ||
//                 post.video_thumbnail ||
//                 post.author?.profile_picture_url ||
//                 null;

//               return (
//                 <tr key={post.post_id} className="border-b border-gray-700">
//                   {/* IMAGE CELL */}
//                   <td className="px-4 py-2">
//                     {imageUrl ? (
//                       <img
//                         src={imageUrl}
//                         alt="post image"
//                         className="h-12 w-12 object-cover rounded-md"
//                       />
//                     ) : (
//                       <div className="h-12 w-12 bg-gray-600 flex items-center justify-center rounded-md">
//                         <span className="text-gray-400 text-xs">No Image</span>
//                       </div>
//                     )}
//                   </td>
//                   {/* MESSAGE/TITLE CELL */}
//                   <td className="px-4 py-2">
//                     <p className="text-gray-100 text-sm whitespace-pre-wrap">
//                       {post.message || "(No message)"}
//                     </p>
//                   </td>
//                   {/* TIMESTAMP CELL */}
//                   <td className="px-4 py-2">
//                     <p className="text-gray-300 text-sm">{formattedDate}</p>
//                   </td>
//                   {/* COMMENTS COUNT CELL */}
//                   <td className="px-4 py-2 text-center">
//                     <span className="text-gray-200 text-sm">{post.comments_count}</span>
//                   </td>
//                   {/* REACTIONS COUNT CELL */}
//                   <td className="px-4 py-2 text-center">
//                     <span className="text-gray-200 text-sm">{post.reactions_count}</span>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {/* ——— PAGINATION CONTROLS ———————————————————————————————————— */}
//       <div className="flex justify-center space-x-2">
//         {Array.from({ length: maxPageReached }, (_, i) => i + 1).map((pageNum) => {
//           const isCurrent = pageNum === currentPage;
//           // We disable the button if we haven’t yet fetched that page AND there is no cursor set.
//           // Once fetchPage(pageNum – 1) returned a cursor, pageCursors[pageNum] exists.
//           const hasCursorOrData = pageCursors[pageNum] !== undefined;

//           return (
//             <button
//               key={pageNum}
//               onClick={() => {
//                 setCurrentPage(pageNum);
//                 // If we don’t have data yet, trigger the fetch.
//                 if (!pageData[pageNum]) {
//                   fetchPage(pageNum);
//                 }
//               }}
//               disabled={!hasCursorOrData}
//               className={`
//                 px-3 py-1 rounded-md text-sm
//                 ${isCurrent
//                   ? "bg-indigo-600 text-white"
//                   : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
//                 }
//                 ${!hasCursorOrData ? "opacity-50 cursor-not-allowed" : ""}
//               `}
//             >
//               {pageNum}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }



// // src/components/FbPosts.jsx
// "use client";

// import React, { useState, useEffect } from "react";

// export default function FbPosts({ profileId }) {
//   const POSTS_PER_PAGE = 5;

//   // ─── STATE ─────────────────────────────────────────────────────────────
//   // pageCursors[n] is the cursor needed to fetch page n.
//   const [pageCursors, setPageCursors] = useState({ 1: null });

//   // pageData[n] is an array of up to 5 posts for that page.
//   const [pageData, setPageData] = useState({});

//   // Which page is currently selected?
//   const [currentPage, setCurrentPage] = useState(1);

//   // If we’re fetching page N, loadingPage = N; otherwise null.
//   const [loadingPage, setLoadingPage] = useState(null);

//   // Any fetch‐error message
//   const [error, setError] = useState(null);

//   // ─── Whenever profileId changes, reset everything and load page 1 ────────
//   useEffect(() => {
//     if (!profileId) return;

//     setPageCursors({ 1: null });
//     setPageData({});
//     setCurrentPage(1);
//     setError(null);

//     fetchPage(1);
//   }, [profileId]);

//   // ─── fetchPage(n): fetch exactly 5 posts for page n (deduped) ─────────────────────
//   async function fetchPage(pageNum) {
//     // If we already have data or are loading that page, do nothing:
//     if (pageData[pageNum] || loadingPage === pageNum) {
//       return;
//     }

//     const cursor = pageCursors[pageNum]; // null for page 1, or a string
//     setLoadingPage(pageNum);
//     setError(null);

//     try {
//       let url = `/api/fb_posts?profile_id=${encodeURIComponent(profileId)}`;
//       if (cursor) {
//         url += `&cursor=${encodeURIComponent(cursor)}`;
//       }

//       const res = await fetch(url);
//       if (!res.ok) {
//         throw new Error(`Failed to fetch page ${pageNum}: ${res.status} ${res.statusText}`);
//       }

//       const data = await res.json();
//       const posts = data.results || [];
//       const nextCursor = data.cursor || null; // null if this was the last page

//       // ─── DEDUPE STEP ─────────────────────────────────────────────────
//       // Build a set of all post_ids we've already stored:
//       const alreadyFetchedIds = new Set(
//         Object.values(pageData)
//           .flat()
//           .map((p) => p.post_id)
//       );

//       // Filter out any post whose post_id is in `alreadyFetchedIds`
//       const uniquePosts = posts.filter((p) => !alreadyFetchedIds.has(p.post_id));

//       // 1) Cache only the unique, never‐seen posts for pageNum:
//       setPageData((prev) => ({
//         ...prev,
//         [pageNum]: uniquePosts,
//       }));

//       // 2) If there’s a nextCursor, that means page (pageNum+1) exists
//       if (nextCursor) {
//         setPageCursors((prev) => ({
//           ...prev,
//           [pageNum + 1]: nextCursor,
//         }));
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Unknown error");
//     } finally {
//       setLoadingPage(null);
//     }
//   }

//   // ─── RENDERING ─────────────────────────────────────────────────────────

//   // If we’re loading the current page, show a spinner
//   if (loadingPage === currentPage) {
//     return (
//       <div className="flex justify-center items-center py-8">
//         <span className="text-gray-400">Loading page {currentPage}…</span>
//       </div>
//     );
//   }

//   // If an error occurred, show it
//   if (error) {
//     return (
//       <div className="py-8 px-4 bg-red-900 rounded-md">
//         <p className="text-red-200">Error: {error}</p>
//       </div>
//     );
//   }

//   // Get the (deduped) posts for the current page (could be empty array)
//   const postsForCurrentPage = pageData[currentPage] || [];

//   // If page 1 has zero posts, show “No posts to display.”
//   if (currentPage === 1 && postsForCurrentPage.length === 0) {
//     return (
//       <div className="py-8 px-4">
//         <p className="text-gray-400">No posts to display.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {/* ——— Display the 5 (deduped) posts of currentPage in a table ————————————————————————— */}
//       <div className="overflow-x-auto">
//         <table className="table-auto w-full bg-gray-800 rounded-md overflow-hidden">
//           <thead className="bg-gray-700">
//             <tr>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Image</th>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Post / Title</th>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Timestamp</th>
//               <th className="px-4 py-2 text-center text-sm font-medium text-gray-200">Comments</th>
//               <th className="px-4 py-2 text-center text-sm font-medium text-gray-200">Reactions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {postsForCurrentPage.map((post) => {
//               const date = new Date(post.timestamp * 1000);
//               const formattedDate = date.toLocaleString();

//               // Pick any available thumbnail
//               const imageUrl =
//                 post.image ||
//                 post.attached_post?.photo_url ||
//                 post.video_thumbnail ||
//                 post.author?.profile_picture_url ||
//                 null;

//               return (
//                 <tr key={post.post_id} className="border-b border-gray-700">
//                   <td className="px-4 py-2">
//                     {imageUrl ? (
//                       <img
//                         src={imageUrl}
//                         alt="post image"
//                         className="h-12 w-12 object-cover rounded-md"
//                       />
//                     ) : (
//                       <div className="h-12 w-12 bg-gray-600 flex items-center justify-center rounded-md">
//                         <span className="text-gray-400 text-xs">No Image</span>
//                       </div>
//                     )}
//                   </td>
//                   <td className="px-4 py-2">
//                     <p className="text-gray-100 text-sm whitespace-pre-wrap">
//                       {post.message || "(No message)"}
//                     </p>
//                   </td>
//                   <td className="px-4 py-2">
//                     <p className="text-gray-300 text-sm">{formattedDate}</p>
//                   </td>
//                   <td className="px-4 py-2 text-center">
//                     <span className="text-gray-200 text-sm">{post.comments_count}</span>
//                   </td>
//                   <td className="px-4 py-2 text-center">
//                     <span className="text-gray-200 text-sm">{post.reactions_count}</span>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {/* ——— PAGINATION CONTROLS ———————————————————————————————————— */}
//       <div className="flex justify-center space-x-2">
//         {Object.keys(pageCursors).map((numStr) => {
//           const pageNum = parseInt(numStr, 10);
//           const isCurrent = pageNum === currentPage;

//           return (
//             <button
//               key={pageNum}
//               onClick={() => {
//                 setCurrentPage(pageNum);
//                 if (!pageData[pageNum]) {
//                   fetchPage(pageNum);
//                 }
//               }}
//               className={`
//                 px-3 py-1 rounded-md text-sm
//                 ${isCurrent
//                   ? "bg-indigo-600 text-white"
//                   : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
//                 }
//               `}
//             >
//               {pageNum}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }



// src/components/FbPosts.jsx (correct 5 posts each page)
// "use client";

// import React, { useState, useEffect } from "react";

// export default function FbPosts({ profileId }) {
//   const POSTS_PER_PAGE = 5;

//   // ─── STATE ─────────────────────────────────────────────────────────────
//   // pageCursors[n] = the cursor to use when fetching page n
//   const [pageCursors, setPageCursors] = useState({ 1: null });

//   // pageData[n] = array of up to 5 unique posts for page n
//   const [pageData, setPageData] = useState({});

//   // Which page is currently displayed?
//   const [currentPage, setCurrentPage] = useState(1);

//   // If we’re actively fetching page N, loadingPage = N; otherwise null
//   const [loadingPage, setLoadingPage] = useState(null);

//   // Any fetch‐error message
//   const [error, setError] = useState(null);

//   // ─── Whenever profileId changes, reset and load page 1 ─────────────────
//   useEffect(() => {
//     if (!profileId) return;

//     setPageCursors({ 1: null });
//     setPageData({});
//     setCurrentPage(1);
//     setError(null);

//     fetchPage(1);
//   }, [profileId]);

//   // ─── fetchPage(n): fetch until we have POSTS_PER_PAGE unique posts ─────────
//   async function fetchPage(pageNum) {
//     // If we already have data for this page, or we're loading it, do nothing:
//     if (pageData[pageNum] || loadingPage === pageNum) {
//       return;
//     }

//     setLoadingPage(pageNum);
//     setError(null);

//     try {
//       // Gather all post_ids we’ve already fetched on earlier pages:
//       const alreadyFetchedIds = new Set(
//         Object.values(pageData)
//           .flat()
//           .map((p) => p.post_id)
//       );

//       // We'll accumulate up to POSTS_PER_PAGE unique posts here:
//       const accumulated = [];

//       // Start with the cursor for this page
//       let cursor = pageCursors[pageNum] || null;
//       let loopCount = 0;

//       // Keep fetching until we have enough or run out of cursor
//       while (accumulated.length < POSTS_PER_PAGE) {
//         let url = `/api/fb_posts?profile_id=${encodeURIComponent(profileId)}`;
//         if (cursor) {
//           url += `&cursor=${encodeURIComponent(cursor)}`;
//         }

//         const res = await fetch(url);
//         if (!res.ok) {
//           throw new Error(`Failed to fetch page ${pageNum}: ${res.statusText}`);
//         }

//         const data = await res.json();
//         const posts = data.results || [];
//         const nextCursor = data.cursor || null;

//         // Filter only the posts we haven't seen yet:
//         for (const p of posts) {
//           if (!alreadyFetchedIds.has(p.post_id) && accumulated.length < POSTS_PER_PAGE) {
//             accumulated.push(p);
//             alreadyFetchedIds.add(p.post_id);
//           }
//         }

//         // If we have enough, break out and remember this nextCursor for pageNum+1
//         if (accumulated.length >= POSTS_PER_PAGE) {
//           cursor = nextCursor;
//           break;
//         }

//         // Otherwise, move to the next cursor (if any)
//         if (!nextCursor) {
//           // No more pages at all—stop
//           cursor = null;
//           break;
//         }
//         cursor = nextCursor;

//         loopCount++;
//         if (loopCount >= 20) {
//           // Safety bail out after 20 internal loops
//           break;
//         }
//       }

//       // 1) Cache exactly the accumulated posts (might be fewer than POSTS_PER_PAGE
//       //    if we ran out of data).
//       setPageData((prev) => ({
//         ...prev,
//         [pageNum]: accumulated,
//       }));

//       // 2) If we ended with a cursor (and it’s non-null), that means “pageNum+1 exists”
//       if (cursor) {
//         setPageCursors((prev) => ({
//           ...prev,
//           [pageNum + 1]: cursor,
//         }));
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Unknown error");
//     } finally {
//       setLoadingPage(null);
//     }
//   }

//   // ─── RENDERING ─────────────────────────────────────────────────────────

//   // If loading the current page, show a spinner
//   if (loadingPage === currentPage) {
//     return (
//       <div className="flex justify-center items-center py-8">
//         <span className="text-gray-400">Loading page {currentPage}…</span>
//       </div>
//     );
//   }

//   // If an error occurred, show it
//   if (error) {
//     return (
//       <div className="py-8 px-4 bg-red-900 rounded-md">
//         <p className="text-red-200">Error: {error}</p>
//       </div>
//     );
//   }

//   // Grab the (deduped) posts for the current page (could be [])
//   const postsForCurrentPage = pageData[currentPage] || [];

//   // If page 1 has zero posts, show “No posts to display.”
//   if (currentPage === 1 && postsForCurrentPage.length === 0) {
//     return (
//       <div className="py-8 px-4">
//         <p className="text-gray-400">No posts to display.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {/* ——— Display up to 5 unique posts for currentPage ————————————————————————— */}
//       <div className="overflow-x-auto">
//         <table className="table-auto w-full bg-gray-800 rounded-md overflow-hidden">
//           <thead className="bg-gray-700">
//             <tr>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Image</th>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Post / Title</th>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Timestamp</th>
//               <th className="px-4 py-2 text-center text-sm font-medium text-gray-200">Comments</th>
//               <th className="px-4 py-2 text-center text-sm font-medium text-gray-200">Reactions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {postsForCurrentPage.map((post) => {
//               const date = new Date(post.timestamp * 1000);
//               const formattedDate = date.toLocaleString();

//               // Pick any available thumbnail
//               const imageUrl =
//                 post.image ||
//                 post.attached_post?.photo_url ||
//                 post.video_thumbnail ||
//                 post.author?.profile_picture_url ||
//                 null;

//               return (
//                 <tr key={post.post_id} className="border-b border-gray-700">
//                   <td className="px-4 py-2">
//                     {imageUrl ? (
//                       <img
//                         src={imageUrl}
//                         alt="post image"
//                         className="h-12 w-12 object-cover rounded-md"
//                       />
//                     ) : (
//                       <div className="h-12 w-12 bg-gray-600 flex items-center justify-center rounded-md">
//                         <span className="text-gray-400 text-xs">No Image</span>
//                       </div>
//                     )}
//                   </td>
//                   <td className="px-4 py-2">
//                     <p className="text-gray-100 text-sm whitespace-pre-wrap">
//                       {post.message || "(No message)"}
//                     </p>
//                   </td>
//                   <td className="px-4 py-2">
//                     <p className="text-gray-300 text-sm">{formattedDate}</p>
//                   </td>
//                   <td className="px-4 py-2 text-center">
//                     <span className="text-gray-200 text-sm">{post.comments_count}</span>
//                   </td>
//                   <td className="px-4 py-2 text-center">
//                     <span className="text-gray-200 text-sm">{post.reactions_count}</span>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {/* ——— PAGINATION CONTROLS ———————————————————————————————————— */}
//       <div className="flex justify-center space-x-2">
//         {Object.keys(pageCursors).map((numStr) => {
//           const pageNum = parseInt(numStr, 10);
//           const isCurrent = pageNum === currentPage;

//           return (
//             <button
//               key={pageNum}
//               onClick={() => {
//                 setCurrentPage(pageNum);
//                 if (!pageData[pageNum]) {
//                   fetchPage(pageNum);
//                 }
//               }}
//               className={`
//                 px-3 py-1 rounded-md text-sm
//                 ${isCurrent
//                   ? "bg-indigo-600 text-white"
//                   : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
//                 }
//               `}
//             >
//               {pageNum}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }



// // src/components/FbPosts.jsx
// "use client";

// import React, { useState, useEffect } from "react";

// export default function FbPosts({ profileId }) {
//     const POSTS_PER_PAGE = 5;

//     // ─── STATE ─────────────────────────────────────────────────────────────
//     // pageCursors[n] = the cursor to use when fetching page n
//     const [pageCursors, setPageCursors] = useState({ 1: null });

//     // pageData[n] = array of up to 5 unique posts for page n
//     const [pageData, setPageData] = useState({});

//     // Which page is currently displayed?
//     const [currentPage, setCurrentPage] = useState(1);

//     // If we’re actively fetching page N, loadingPage = N; otherwise null
//     const [loadingPage, setLoadingPage] = useState(null);

//     // Any fetch‐error message
//     const [error, setError] = useState(null);

//     // ─── Whenever profileId changes, reset and load page 1 ─────────────────
//     useEffect(() => {
//         if (!profileId) return;

//         setPageCursors({ 1: null });
//         setPageData({});
//         setCurrentPage(1);
//         setError(null);

//         fetchPage(1);
//     }, [profileId]);

//     // ─── fetchPage(n): fetch until we have POSTS_PER_PAGE unique posts ─────────
//     async function fetchPage(pageNum) {
//         // If we already have data for this page, or we're loading it, do nothing:
//         if (pageData[pageNum] || loadingPage === pageNum) {
//             return;
//         }

//         setLoadingPage(pageNum);
//         setError(null);

//         try {
//             // Gather all post_ids we’ve already fetched on earlier pages:
//             const alreadyFetchedIds = new Set(
//                 Object.values(pageData)
//                     .flat()
//                     .map((p) => p.post_id)
//             );

//             // We'll accumulate up to POSTS_PER_PAGE unique posts here:
//             const accumulated = [];

//             // Start with the cursor for this page
//             let cursor = pageCursors[pageNum] || null;
//             let loopCount = 0;

//             // Keep fetching until we have enough or run out of cursor
//             while (accumulated.length < POSTS_PER_PAGE) {
//                 let url = `/api/fb_posts?profile_id=${encodeURIComponent(profileId)}`;
//                 if (cursor) {
//                     url += `&cursor=${encodeURIComponent(cursor)}`;
//                 }

//                 const res = await fetch(url);
//                 if (!res.ok) {
//                     throw new Error(`Failed to fetch page ${pageNum}: ${res.statusText}`);
//                 }

//                 const data = await res.json();
//                 const posts = data.results || [];
//                 const nextCursor = data.cursor || null;

//                 // Filter only the posts we haven't seen yet:
//                 for (const p of posts) {
//                     if (!alreadyFetchedIds.has(p.post_id) && accumulated.length < POSTS_PER_PAGE) {
//                         accumulated.push(p);
//                         alreadyFetchedIds.add(p.post_id);
//                     }
//                 }

//                 // If we have enough, break out and remember this nextCursor for pageNum+1
//                 if (accumulated.length >= POSTS_PER_PAGE) {
//                     cursor = nextCursor;
//                     break;
//                 }

//                 // Otherwise, move to the next cursor (if any)
//                 if (!nextCursor) {
//                     // No more pages at all—stop
//                     cursor = null;
//                     break;
//                 }
//                 cursor = nextCursor;

//                 loopCount++;
//                 if (loopCount >= 20) {
//                     // Safety bail out after 20 internal loops
//                     break;
//                 }
//             }

//             // 1) Cache exactly the accumulated posts (might be fewer than POSTS_PER_PAGE
//             //    if we ran out of data).
//             setPageData((prev) => ({
//                 ...prev,
//                 [pageNum]: accumulated,
//             }));

//             // 2) If we ended with a cursor (and it’s non-null), that means “pageNum+1 exists”
//             if (cursor) {
//                 setPageCursors((prev) => ({
//                     ...prev,
//                     [pageNum + 1]: cursor,
//                 }));
//             }
//         } catch (err) {
//             console.error(err);
//             setError(err.message || "Unknown error");
//         } finally {
//             setLoadingPage(null);
//         }
//     }

//     // ─── RENDERING ─────────────────────────────────────────────────────────

//     // If loading the current page, show a spinner
//     if (loadingPage === currentPage) {
//         return (
//             <div className="flex justify-center items-center py-8">
//                 <span className="text-gray-400">Loading page {currentPage}…</span>
//             </div>
//         );
//     }

//     // If an error occurred, show it
//     if (error) {
//         return (
//             <div className="py-8 px-4 bg-red-900 rounded-md">
//                 <p className="text-red-200">Error: {error}</p>
//             </div>
//         );
//     }

//     // Grab the (deduped) posts for the current page (could be [])
//     const postsForCurrentPage = pageData[currentPage] || [];

//     // If page 1 has zero posts, show “No posts to display.”
//     if (currentPage === 1 && postsForCurrentPage.length === 0) {
//         return (
//             <div className="py-8 px-4">
//                 <p className="text-gray-400">No posts to display.</p>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-4">
//             {/* ——— Display up to 5 unique posts for currentPage ————————————————————————— */}
//             <div className="overflow-x-auto">
//                 <table className="table-auto w-full bg-gray-800 rounded-md overflow-hidden">
//                     <thead className="bg-gray-700">
//                         <tr>
//                             <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Image</th>
//                             <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Post / Title</th>
//                             <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Timestamp</th>
//                             <th className="px-4 py-2 text-center text-sm font-medium text-gray-200">Comments</th>
//                             <th className="px-4 py-2 text-center text-sm font-medium text-gray-200">Reactions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {postsForCurrentPage.map((post) => {
//                             const date = new Date(post.timestamp * 1000);
//                             const formattedDate = date.toLocaleString();

//                             const imageUrl =
//                                 post.image?.uri ||
//                                 post.attached_post?.photo_url ||
//                                 post.video_thumbnail ||
//                                 null;

//                             return (
//                                 <tr key={post.post_id} className="border-b border-gray-700">
//                                     <td className="px-4 py-2">
//                                         {imageUrl ? (
//                                             <img
//                                                 src={imageUrl}
//                                                 alt="post image"
//                                                 className="h-12 w-12 object-cover rounded-md"
//                                             />
//                                         ) : (
//                                             <div className="h-12 w-12 bg-gray-600 flex items-center justify-center rounded-md">
//                                                 <span className="text-gray-400 text-xs">No Image</span>
//                                             </div>
//                                         )}
//                                     </td>
//                                     <td className="px-4 py-2">
//                                         <p className="text-gray-100 text-sm whitespace-pre-wrap">
//                                             {post.message || "(No message)"}
//                                         </p>
//                                     </td>
//                                     <td className="px-4 py-2">
//                                         <p className="text-gray-300 text-sm">{formattedDate}</p>
//                                     </td>
//                                     <td className="px-4 py-2 text-center">
//                                         <span className="text-gray-200 text-sm">{post.comments_count}</span>
//                                     </td>
//                                     <td className="px-4 py-2 text-center">
//                                         <span className="text-gray-200 text-sm">{post.reactions_count}</span>
//                                     </td>
//                                 </tr>
//                             );
//                         })}
//                     </tbody>
//                 </table>
//             </div>

//             {/* ——— PAGINATION CONTROLS ———————————————————————————————————— */}
//             <div className="flex justify-center space-x-2">
//                 {Object.keys(pageCursors).map((numStr) => {
//                     const pageNum = parseInt(numStr, 10);
//                     const isCurrent = pageNum === currentPage;

//                     return (
//                         <button
//                             key={pageNum}
//                             onClick={() => {
//                                 setCurrentPage(pageNum);
//                                 if (!pageData[pageNum]) {
//                                     fetchPage(pageNum);
//                                 }
//                             }}
//                             className={`
//                 px-3 py-1 rounded-md text-sm
//                 ${isCurrent
//                                     ? "bg-indigo-600 text-white"
//                                     : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
//                                 }
//               `}
//                         >
//                             {pageNum}
//                         </button>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// }

// // src/components/FbPosts.jsx
// "use client";

// import React, { useState, useEffect } from "react";

// export default function FbPosts({ profileId }) {
//   const POSTS_PER_PAGE = 5;

//   // ─── STATE ─────────────────────────────────────────────────────────────
//   // pageCursors[n] = the cursor to use when fetching page n
//   const [pageCursors, setPageCursors] = useState({ 1: null });

//   // pageData[n] = array of up to POSTS_PER_PAGE unique posts for page n
//   const [pageData, setPageData] = useState({});

//   // Which page is currently displayed?
//   const [currentPage, setCurrentPage] = useState(1);

//   // If we’re actively fetching page N, loadingPage = N; otherwise null
//   const [loadingPage, setLoadingPage] = useState(null);

//   // Any fetch‐error message
//   const [error, setError] = useState(null);

//   // ─── Whenever profileId changes, reset and load page 1 ─────────────────
//   useEffect(() => {
//     if (!profileId) return;

//     setPageCursors({ 1: null });
//     setPageData({});
//     setCurrentPage(1);
//     setError(null);

//     fetchPage(1);
//   }, [profileId]);

//   // ─── fetchPage(n): fetch until we have POSTS_PER_PAGE unique posts ─────────
//   async function fetchPage(pageNum) {
//     // If we already have data for this page, or we're loading it, do nothing:
//     if (pageData[pageNum] || loadingPage === pageNum) {
//       return;
//     }

//     setLoadingPage(pageNum);
//     setError(null);

//     try {
//       // Gather all post_ids we’ve already fetched on earlier pages:
//       const alreadyFetchedIds = new Set(
//         Object.values(pageData)
//           .flat()
//           .map((p) => p.post_id)
//       );

//       // We'll accumulate up to POSTS_PER_PAGE unique posts here:
//       const accumulated = [];

//       // Start with the cursor for this page
//       let cursor = pageCursors[pageNum] || null;
//       let loopCount = 0;

//       // Keep fetching until we have enough or run out of cursor
//       while (accumulated.length < POSTS_PER_PAGE) {
//         let url = `/api/fb_posts?profile_id=${encodeURIComponent(profileId)}`;
//         if (cursor) {
//           url += `&cursor=${encodeURIComponent(cursor)}`;
//         }

//         const res = await fetch(url);
//         if (!res.ok) {
//           throw new Error(`Failed to fetch page ${pageNum}: ${res.statusText}`);
//         }

//         const data = await res.json();
//         const posts = data.results || [];
//         const nextCursor = data.cursor || null;

//         // Filter only the posts we haven't seen yet:
//         for (const p of posts) {
//           if (
//             !alreadyFetchedIds.has(p.post_id) &&
//             accumulated.length < POSTS_PER_PAGE
//           ) {
//             accumulated.push(p);
//             alreadyFetchedIds.add(p.post_id);
//           }
//         }

//         // If we have enough, break out and remember this nextCursor for pageNum+1
//         if (accumulated.length >= POSTS_PER_PAGE) {
//           cursor = nextCursor;
//           break;
//         }

//         // Otherwise, move to the next cursor (if any)
//         if (!nextCursor) {
//           // No more pages at all—stop
//           cursor = null;
//           break;
//         }
//         cursor = nextCursor;

//         loopCount++;
//         if (loopCount >= 20) {
//           // Safety bail out after 20 internal loops
//           break;
//         }
//       }

//       // 1) Cache exactly the accumulated posts (might be fewer than POSTS_PER_PAGE
//       //    if we ran out of data).
//       setPageData((prev) => ({
//         ...prev,
//         [pageNum]: accumulated,
//       }));

//       // 2) If we ended with a cursor (and it’s non-null), that means “pageNum+1 exists”
//       if (cursor) {
//         setPageCursors((prev) => ({
//           ...prev,
//           [pageNum + 1]: cursor,
//         }));
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Unknown error");
//     } finally {
//       setLoadingPage(null);
//     }
//   }

//   // ─── RENDERING ─────────────────────────────────────────────────────────

//   // If loading the current page, show a spinner
//   if (loadingPage === currentPage) {
//     return (
//       <div className="flex justify-center items-center py-8">
//         <span className="text-gray-400">Loading page {currentPage}…</span>
//       </div>
//     );
//   }

//   // If an error occurred, show it
//   if (error) {
//     return (
//       <div className="py-8 px-4 bg-red-900 rounded-md">
//         <p className="text-red-200">Error: {error}</p>
//       </div>
//     );
//   }

//   // Grab the (deduped) posts for the current page (could be [])
//   const postsForCurrentPage = pageData[currentPage] || [];

//   // If page 1 has zero posts, show “No posts to display.”
//   if (currentPage === 1 && postsForCurrentPage.length === 0) {
//     return (
//       <div className="py-8 px-4">
//         <p className="text-gray-400">No posts to display.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {/* ——— Display up to 5 unique posts for currentPage ————————————————————————— */}
//       <div className="overflow-x-auto">
//         <table className="table-auto w-full bg-gray-800 rounded-md overflow-hidden">
//           <thead className="bg-gray-700">
//             <tr>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">
//                 Image
//               </th>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">
//                 Post / Title
//               </th>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">
//                 Timestamp
//               </th>
//               <th className="px-4 py-2 text-center text-sm font-medium text-gray-200">
//                 Comments
//               </th>
//               <th className="px-4 py-2 text-center text-sm font-medium text-gray-200">
//                 Reactions
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {postsForCurrentPage.map((post) => {
//               const date = new Date(post.timestamp * 1000);
//               const formattedDate = date.toLocaleString();

//               // ■■■ Pick any available media:
//               const imageUrl =
//                 post.image?.uri ||
//                 post.album_preview?.[0]?.image_file_uri ||
//                 post.video_thumbnail ||
//                 post.attached_post?.photo_url ||
//                 null;

//               return (
//                 <tr key={post.post_id} className="border-b border-gray-700">
//                   <td className="px-4 py-2">
//                     {imageUrl ? (
//                       <img
//                         src={imageUrl}
//                         alt="post image"
//                         className="h-12 w-12 object-cover rounded-md"
//                       />
//                     ) : (
//                       <div className="h-12 w-12 bg-gray-600 flex items-center justify-center rounded-md">
//                         <span className="text-gray-400 text-xs">No Image</span>
//                       </div>
//                     )}
//                   </td>
//                   <td className="px-4 py-2">
//                     <p className="text-gray-100 text-sm whitespace-pre-wrap">
//                       {post.message || "(No message)"}
//                     </p>
//                   </td>
//                   <td className="px-4 py-2">
//                     <p className="text-gray-300 text-sm">{formattedDate}</p>
//                   </td>
//                   <td className="px-4 py-2 text-center">
//                     <span className="text-gray-200 text-sm">
//                       {post.comments_count}
//                     </span>
//                   </td>
//                   <td className="px-4 py-2 text-center">
//                     <span className="text-gray-200 text-sm">
//                       {post.reactions_count}
//                     </span>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {/* ——— PAGINATION CONTROLS ———————————————————————————————————— */}
//       <div className="flex justify-center space-x-2">
//         {Object.keys(pageCursors).map((numStr) => {
//           const pageNum = parseInt(numStr, 10);
//           const isCurrent = pageNum === currentPage;

//           return (
//             <button
//               key={pageNum}
//               onClick={() => {
//                 setCurrentPage(pageNum);
//                 if (!pageData[pageNum]) {
//                   fetchPage(pageNum);
//                 }
//               }}
//               className={`
//                 px-3 py-1 rounded-md text-sm
//                 ${
//                   isCurrent
//                     ? "bg-indigo-600 text-white"
//                     : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
//                 }
//               `}
//             >
//               {pageNum}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }


// // src/components/FbPosts.jsx
// "use client";

// import React, { useState, useEffect } from "react";
// import { getPostImageUrl } from "../lib/getPostImage";

// export default function FbPosts({ profileId }) {
//   const POSTS_PER_PAGE = 5;
//   const [pageCursors, setPageCursors] = useState({ 1: null });
//   const [pageData, setPageData] = useState({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loadingPage, setLoadingPage] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!profileId) return;
//     setPageCursors({ 1: null });
//     setPageData({});
//     setCurrentPage(1);
//     setError(null);
//     fetchPage(1);
//   }, [profileId]);

//   async function fetchPage(pageNum) {
//     if (pageData[pageNum] || loadingPage === pageNum) return;
//     setLoadingPage(pageNum);
//     setError(null);

//     try {
//       const alreadyFetchedIds = new Set(
//         Object.values(pageData).flat().map((p) => p.post_id)
//       );
//       const accumulated = [];
//       let cursor = pageCursors[pageNum] || null;
//       let loopCount = 0;

//       while (accumulated.length < POSTS_PER_PAGE) {
//         let url = `/api/fb_posts?profile_id=${encodeURIComponent(profileId)}`;
//         if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;

//         const res = await fetch(url);
//         if (!res.ok) throw new Error(`Failed to fetch page ${pageNum}: ${res.statusText}`);

//         const data = await res.json();
//         const posts = data.results || [];
//         const nextCursor = data.cursor || null;

//         for (const p of posts) {
//           if (!alreadyFetchedIds.has(p.post_id) && accumulated.length < POSTS_PER_PAGE) {
//             accumulated.push(p);
//             alreadyFetchedIds.add(p.post_id);
//           }
//         }

//         if (accumulated.length >= POSTS_PER_PAGE) {
//           cursor = nextCursor;
//           break;
//         }
//         if (!nextCursor) {
//           cursor = null;
//           break;
//         }
//         cursor = nextCursor;
//         loopCount++;
//         if (loopCount >= 20) break;
//       }

//       setPageData((prev) => ({ ...prev, [pageNum]: accumulated }));

//       if (cursor) {
//         setPageCursors((prev) => ({ ...prev, [pageNum + 1]: cursor }));
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Unknown error");
//     } finally {
//       setLoadingPage(null);
//     }
//   }

//   if (loadingPage === currentPage) {
//     return (
//       <div className="flex justify-center items-center py-8">
//         <span className="text-gray-400">Loading page {currentPage}…</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="py-8 px-4 bg-red-900 rounded-md">
//         <p className="text-red-200">Error: {error}</p>
//       </div>
//     );
//   }

//   const postsForCurrentPage = pageData[currentPage] || [];

//   if (currentPage === 1 && postsForCurrentPage.length === 0) {
//     return (
//       <div className="py-8 px-4">
//         <p className="text-gray-400">No posts to display.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       <div className="overflow-x-auto">
//         <table className="table-auto w-full bg-gray-800 rounded-md overflow-hidden">
//           <thead className="bg-gray-700">
//             <tr>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Image</th>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Post / Title</th>
//               <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Timestamp</th>
//               <th className="px-4 py-2 text-center text-sm font-medium text-gray-200">Comments</th>
//               <th className="px-4 py-2 text-center text-sm font-medium text-gray-200">Reactions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {postsForCurrentPage.map((post) => {
//               const date = new Date(post.timestamp * 1000);
//               const formattedDate = date.toLocaleString();
//               const imageUrl = getPostImageUrl(post);

//               return (
//                 <tr key={post.post_id} className="border-b border-gray-700">
//                   <td className="px-4 py-2">
//                     {imageUrl ? (
//                       <img src={imageUrl} alt="post image" className="h-12 w-12 object-cover rounded-md" />
//                     ) : (
//                       <div className="h-12 w-12 bg-gray-600 flex items-center justify-center rounded-md">
//                         <span className="text-gray-400 text-xs">No Image</span>
//                       </div>
//                     )}
//                   </td>
//                   <td className="px-4 py-2">
//                     <p className="text-gray-100 text-sm whitespace-pre-wrap">
//                       {post.message || "(No message)"}
//                     </p>
//                   </td>
//                   <td className="px-4 py-2">
//                     <p className="text-gray-300 text-sm">{formattedDate}</p>
//                   </td>
//                   <td className="px-4 py-2 text-center">
//                     <span className="text-gray-200 text-sm">{post.comments_count}</span>
//                   </td>
//                   <td className="px-4 py-2 text-center">
//                     <span className="text-gray-200 text-sm">{post.reactions_count}</span>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       <div className="flex justify-center space-x-2">
//         {Object.keys(pageCursors).map((numStr) => {
//           const pageNum = parseInt(numStr, 10);
//           const isCurrent = pageNum === currentPage;

//           return (
//             <button
//               key={pageNum}
//               onClick={() => {
//                 setCurrentPage(pageNum);
//                 if (!pageData[pageNum]) fetchPage(pageNum);
//               }}
//               className={`
//                 px-3 py-1 rounded-md text-sm
//                 ${isCurrent
//                   ? "bg-indigo-600 text-white"
//                   : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"}
//               `}
//             >
//               {pageNum}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }




// // src/components/FbPosts.jsx
// "use client";

// import React, { useState, useEffect } from "react";
// import { getPostImageUrl } from "../lib/getPostImage";

// export default function FbPosts({ profileId }) {
//   const POSTS_PER_PAGE = 5;
//   const [pageCursors, setPageCursors] = useState({ 1: null });
//   const [pageData, setPageData] = useState({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loadingPage, setLoadingPage] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!profileId) return;
//     setPageCursors({ 1: null });
//     setPageData({});
//     setCurrentPage(1);
//     setError(null);
//     fetchPage(1);
//   }, [profileId]);

//   async function fetchPage(pageNum) {
//     if (pageData[pageNum] || loadingPage === pageNum) return;
//     setLoadingPage(pageNum);
//     setError(null);

//     try {
//       const alreadyFetched = new Set(
//         Object.values(pageData).flat().map((p) => p.post_id)
//       );

//       // Single fetch: get one page of posts and slice
//       let url = `/api/fb_posts?profile_id=${encodeURIComponent(profileId)}`;
//       const cursor = pageCursors[pageNum];
//       if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;

//       const res = await fetch(url);
//       if (!res.ok) throw new Error(`Failed to fetch page ${pageNum}: ${res.statusText}`);
//       const data = await res.json();
//       const posts = data.results || [];
//       const nextCursor = data.cursor || null;

//       // Filter and take up to POSTS_PER_PAGE unique
//       const pagePosts = [];
//       for (const p of posts) {
//         if (!alreadyFetched.has(p.post_id)) {
//           pagePosts.push(p);
//           alreadyFetched.add(p.post_id);
//           if (pagePosts.length >= POSTS_PER_PAGE) break;
//         }
//       }

//       // Save and set cursor for next page
//       setPageData((prev) => ({ ...prev, [pageNum]: pagePosts }));
//       if (nextCursor) {
//         setPageCursors((prev) => ({ ...prev, [pageNum + 1]: nextCursor }));
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Unknown error");
//     } finally {
//       setLoadingPage(null);
//     }
//   }

//   if (loadingPage === currentPage) {
//     return (
//       <div className="flex justify-center items-center py-8">
//         <span className="text-gray-400">Loading page {currentPage}…</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="py-8 px-4 bg-red-900 rounded-md">
//         <p className="text-red-200">Error: {error}</p>
//       </div>
//     );
//   }

//   const postsForCurrent = pageData[currentPage] || [];
//   if (currentPage === 1 && postsForCurrent.length === 0) {
//     return (
//       <div className="py-8 px-4">
//         <p className="text-gray-400">No posts to display.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       <div className="overflow-x-auto">
//         <table className="table-auto w-full bg-gray-800 rounded-md overflow-hidden">
//           <thead className="bg-gray-700">
//             <tr>
//               {['Image','Post / Title','Timestamp','Comments','Reactions'].map((h) => (
//                 <th key={h} className="px-4 py-2 text-left text-sm font-medium text-gray-200">
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {postsForCurrent.map((post) => {
//               const date = new Date(post.timestamp * 1000).toLocaleString();
//               const src = getPostImageUrl(post);
//               return (
//                 <tr key={post.post_id} className="border-b border-gray-700">
//                   <td className="px-4 py-2">
//                     {src ? (
//                       <img src={src} alt="post" className="h-12 w-12 object-cover rounded-md" />
//                     ) : (
//                       <div className="h-12 w-12 bg-gray-600 flex items-center justify-center rounded-md">
//                         <span className="text-gray-400 text-xs">No Image</span>
//                       </div>
//                     )}
//                   </td>
//                   <td className="px-4 py-2 text-gray-100 text-sm whitespace-pre-wrap">{post.message || '(No message)'}</td>
//                   <td className="px-4 py-2 text-gray-300 text-sm">{date}</td>
//                   <td className="px-4 py-2 text-center text-gray-200 text-sm">{post.comments_count}</td>
//                   <td className="px-4 py-2 text-center text-gray-200 text-sm">{post.reactions_count}</td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       <div className="flex justify-center space-x-2">
//         {Object.keys(pageCursors).map((num) => {
//           const n = +num;
//           const current = n === currentPage;
//           return (
//             <button
//               key={n}
//               onClick={() => { setCurrentPage(n); if (!pageData[n]) fetchPage(n); }}
//               className={`px-3 py-1 rounded-md text-sm ${current ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}`}>
//               {n}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }


// // src/components/FbPosts.jsx
// "use client";

// import React, { useState, useEffect } from "react";
// import { getPostImageUrl } from "../lib/getPostImage";

// export default function FbPosts({ profileId, totalPages = 12 }) {
//   const POSTS_PER_PAGE = 5;
//   const [pageCursors, setPageCursors] = useState({ 1: null });
//   const [pageData, setPageData] = useState({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loadingPage, setLoadingPage] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!profileId) return;
//     setPageCursors({ 1: null });
//     setPageData({});
//     setCurrentPage(1);
//     setError(null);
//     fetchPage(1);
//   }, [profileId]);

//   async function fetchPage(pageNum) {
//     if (pageData[pageNum] || loadingPage === pageNum) return;
//     setLoadingPage(pageNum);
//     setError(null);

//     try {
//       const alreadyFetched = new Set(
//         Object.values(pageData).flat().map((p) => p.post_id)
//       );
//       let cursor = pageCursors[pageNum] || null;
//       const combined = [];
//       let loops = 0;

//       // Fetch up to POSTS_PER_PAGE by paging at most twice for speed
//       while (combined.length < POSTS_PER_PAGE && loops < 2) {
//         let url = `/api/fb_posts?profile_id=${encodeURIComponent(profileId)}`;
//         if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;

//         const res = await fetch(url);
//         if (!res.ok) throw new Error(`Failed to fetch page ${pageNum}: ${res.statusText}`);
//         const { results = [], cursor: nextCursor = null } = await res.json();

//         for (const p of results) {
//           if (!alreadyFetched.has(p.post_id) && combined.length < POSTS_PER_PAGE) {
//             combined.push(p);
//             alreadyFetched.add(p.post_id);
//           }
//         }

//         cursor = nextCursor;
//         loops++;
//         if (!cursor) break;
//       }

//       setPageData((prev) => ({ ...prev, [pageNum]: combined }));
//       if (cursor) {
//         setPageCursors((prev) => ({ ...prev, [pageNum + 1]: cursor }));
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Unknown error");
//     } finally {
//       setLoadingPage(null);
//     }
//   }

//   const posts = pageData[currentPage] || [];
//   const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

//   return (
//     <div className="space-y-4">
//       {loadingPage === currentPage ? (
//         <div className="flex justify-center items-center py-8">
//           <span className="text-gray-400">Loading page {currentPage}…</span>
//         </div>
//       ) : error ? (
//         <div className="py-8 px-4 bg-red-900 rounded-md">
//           <p className="text-red-200">Error: {error}</p>
//         </div>
//       ) : (
//         <>  {/* Posts table */}
//           {currentPage === 1 && posts.length === 0 ? (
//             <div className="py-8 px-4">
//               <p className="text-gray-400">No posts to display.</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="table-auto w-full bg-gray-800 rounded-md overflow-hidden">
//                 <thead className="bg-gray-700">
//                   <tr>
//                     {['Image','Post / Title','Timestamp','Comments','Reactions'].map((h) => (
//                       <th key={h} className="px-4 py-2 text-left text-sm font-medium text-gray-200">{h}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {posts.map((post) => {
//                     const date = new Date(post.timestamp * 1000).toLocaleString();
//                     const src = getPostImageUrl(post);
//                     return (
//                       <tr key={post.post_id} className="border-b border-gray-700">
//                         <td className="px-4 py-2">
//                           {src ? (
//                             <img src={src} alt="post" className="h-12 w-12 object-cover rounded-md" />
//                           ) : (
//                             <div className="h-12 w-12 bg-gray-600 flex items-center justify-center rounded-md">
//                               <span className="text-gray-400 text-xs">No Image</span>
//                             </div>
//                           )}
//                         </td>
//                         <td className="px-4 py-2 text-gray-100 text-sm whitespace-pre-wrap">{post.message || '(No message)'}</td>
//                         <td className="px-4 py-2 text-gray-300 text-sm">{date}</td>
//                         <td className="px-4 py-2 text-center text-gray-200 text-sm">{post.comments_count}</td>
//                         <td className="px-4 py-2 text-center text-gray-200 text-sm">{post.reactions_count}</td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {/* Static pagination controls */}
//           <div className="flex justify-center space-x-2">
//             {pages.map((n) => (
//               <button
//                 key={n}
//                 onClick={() => { setCurrentPage(n); if (!pageData[n]) fetchPage(n); }}
//                 className={`px-3 py-1 rounded-md text-sm ${n === currentPage ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}`}
//               >
//                 {n}
//               </button>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }


// // src/components/FbPosts.jsx (absolutely correct code)
// "use client";

// import React, { useState, useEffect } from "react";
// import { getPostImageUrl } from "../lib/getPostImage";

// export default function FbPosts({ profileId, totalPages = 12 }) {
//   const POSTS_PER_PAGE = 5;
//   const [pageCursors, setPageCursors] = useState({ 1: null });
//   const [pageData, setPageData] = useState({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loadingPage, setLoadingPage] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!profileId) return;
//     setPageCursors({ 1: null });
//     setPageData({});
//     setCurrentPage(1);
//     setError(null);
//     fetchPage(1);
//   }, [profileId]);

//   async function fetchPage(pageNum) {
//     if (pageData[pageNum] || loadingPage === pageNum) return;
//     setLoadingPage(pageNum);
//     setError(null);

//     try {
//       const alreadyFetched = new Set(
//         Object.values(pageData).flat().map((p) => p.post_id)
//       );
//       let cursor = pageCursors[pageNum] || null;
//       const combined = [];
//       let loops = 0;

//       while (combined.length < POSTS_PER_PAGE && loops < 2) {
//         let url = `/api/fb_posts?profile_id=${encodeURIComponent(profileId)}`;
//         if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;

//         const res = await fetch(url);
//         if (!res.ok) throw new Error(`Failed to fetch page ${pageNum}: ${res.statusText}`);
//         const { results = [], cursor: nextCursor = null } = await res.json();

//         for (const p of results) {
//           if (!alreadyFetched.has(p.post_id) && combined.length < POSTS_PER_PAGE) {
//             combined.push(p);
//             alreadyFetched.add(p.post_id);
//           }
//         }

//         cursor = nextCursor;
//         loops++;
//         if (!cursor) break;
//       }

//       setPageData((prev) => ({ ...prev, [pageNum]: combined }));
//       if (cursor) {
//         setPageCursors((prev) => ({ ...prev, [pageNum + 1]: cursor }));
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Unknown error");
//     } finally {
//       setLoadingPage(null);
//     }
//   }

//   const posts = pageData[currentPage] || [];
//   const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
//   const block = 5;
//   const firstBlock = pages.slice(0, block);
//   const lastPage = pages[pages.length - 1];

//   return (
//     <div className="space-y-4">
//       {loadingPage === currentPage ? (
//         <div className="flex justify-center items-center py-8">
//           <span className="text-gray-400">Loading page {currentPage}…</span>
//         </div>
//       ) : error ? (
//         <div className="py-8 px-4 bg-red-900 rounded-md">
//           <p className="text-red-200">Error: {error}</p>
//         </div>
//       ) : (
//         <>  {/* Posts */}
//           <div className="overflow-x-auto">
//             <table className="table-auto w-full bg-gray-800 rounded-md overflow-hidden">
//               <thead className="bg-gray-700">
//                 <tr>
//                   {['Image','Post / Title','Timestamp','Comments','Reactions'].map((h) => (
//                     <th key={h} className="px-4 py-2 text-left text-sm font-medium text-gray-200">{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {posts.map((post) => {
//                   const date = new Date(post.timestamp * 1000).toLocaleString();
//                   const src = getPostImageUrl(post);
//                   return (
//                     <tr key={post.post_id} className="border-b border-gray-700">
//                       <td className="px-4 py-2">
//                         {src ? (
//                           <img src={src} alt="post" className="h-12 w-12 object-cover rounded-md" />
//                         ) : (
//                           <div className="h-12 w-12 bg-gray-600 flex items-center justify-center rounded-md">
//                             <span className="text-gray-400 text-xs">No Image</span>
//                           </div>
//                         )}
//                       </td>
//                       <td className="px-4 py-2 text-gray-100 text-sm whitespace-nowrap overflow-hidden truncate max-w-xs">
//                         {post.message || '(No message)'}
//                       </td>
//                       <td className="px-4 py-2 text-gray-300 text-sm">{date}</td>
//                       <td className="px-4 py-2 text-center text-gray-200 text-sm">{post.comments_count}</td>
//                       <td className="px-4 py-2 text-center text-gray-200 text-sm">{post.reactions_count}</td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination controls */}
//           <div className="flex justify-center items-center space-x-1">
//             {/* Prev */}
//             <button
//               onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//               className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
//             >&lt;</button>

//             {/* First block */}
//             {firstBlock.map((n) => (
//               <button
//                 key={n}
//                 onClick={() => { setCurrentPage(n); if (!pageData[n]) fetchPage(n); }}
//                 className={`w-8 h-8 flex items-center justify-center border ${n === currentPage ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-600 text-gray-200 hover:bg-gray-700'}`}
//               >{n}</button>
//             ))}

//             {/* Ellipsis + last */}
//             <span className="px-1 text-gray-200">…</span>
//             <button
//               onClick={() => { setCurrentPage(lastPage); if (!pageData[lastPage]) fetchPage(lastPage); }}
//               className={`w-8 h-8 flex items-center justify-center border ${lastPage === currentPage ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-600 text-gray-200 hover:bg-gray-700'}`}
//             >{lastPage}</button>

//             {/* Next */}
//             <button
//               onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
//               className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
//             >&gt;</button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
// ==================================================== absolutly correct code ==============================



// // src/components/FbPosts.jsx
// "use client";

// import React, { useState, useEffect } from "react";
// import { getPostImageUrl } from "../lib/getPostImage";

// export default function FbPosts({ profileId, totalPages = 12 }) {
//   const POSTS_PER_PAGE = 5;
//   const [pageCursors, setPageCursors] = useState({ 1: null });
//   const [pageData, setPageData] = useState({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loadingPage, setLoadingPage] = useState(null);
//   const [error, setError] = useState(null);

//   // Modal state
//   const [showModal, setShowModal] = useState(false);
//   const [selectedPost, setSelectedPost] = useState(null);

//   useEffect(() => {
//     if (!profileId) return;
//     setPageCursors({ 1: null });
//     setPageData({});
//     setCurrentPage(1);
//     setError(null);
//     fetchPage(1);
//   }, [profileId]);

//   async function fetchPage(pageNum) {
//     if (pageData[pageNum] || loadingPage === pageNum) return;
//     setLoadingPage(pageNum);
//     setError(null);

//     try {
//       const alreadyFetched = new Set(
//         Object.values(pageData).flat().map((p) => p.post_id)
//       );
//       let cursor = pageCursors[pageNum] || null;
//       const combined = [];
//       let loops = 0;

//       while (combined.length < POSTS_PER_PAGE && loops < 2) {
//         let url = `/api/fb_posts?profile_id=${encodeURIComponent(profileId)}`;
//         if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;

//         const res = await fetch(url);
//         if (!res.ok) throw new Error(`Failed to fetch page ${pageNum}: ${res.statusText}`);
//         const { results = [], cursor: nextCursor = null } = await res.json();

//         for (const p of results) {
//           if (!alreadyFetched.has(p.post_id) && combined.length < POSTS_PER_PAGE) {
//             combined.push(p);
//             alreadyFetched.add(p.post_id);
//           }
//         }

//         cursor = nextCursor;
//         loops++;
//         if (!cursor) break;
//       }

//       setPageData((prev) => ({ ...prev, [pageNum]: combined }));
//       if (cursor) {
//         setPageCursors((prev) => ({ ...prev, [pageNum + 1]: cursor }));
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Unknown error");
//     } finally {
//       setLoadingPage(null);
//     }
//   }

//   const posts = pageData[currentPage] || [];
//   const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
//   const block = 5;
//   const firstBlock = pages.slice(0, block);
//   const lastPage = pages[pages.length - 1];

//   function openModal(post) {
//     setSelectedPost(post);
//     setShowModal(true);
//   }
//   function closeModal() {
//     setShowModal(false);
//     setSelectedPost(null);
//   }

//   return (
//     <div className="space-y-4">
//       {/* Loading / Error */}
//       {loadingPage === currentPage && (
//         <div className="flex justify-center items-center py-8">
//           <span className="text-gray-400">Loading page {currentPage}…</span>
//         </div>
//       )}
//       {error && (
//         <div className="py-8 px-4 bg-red-900 rounded-md">
//           <p className="text-red-200">Error: {error}</p>
//         </div>
//       )}

//       {/* Posts Table */}
//       {!loadingPage && !error && (
//         <div className="overflow-x-auto">
//           <table className="table-auto w-full bg-gray-800 rounded-md overflow-hidden">
//             <thead className="bg-gray-700">
//               <tr>
//                 {['Image', 'Post / Title', 'Timestamp', 'Comments', 'Reactions', 'View Details'].map((h) => (
//                   <th key={h} className="px-4 py-2 text-left text-sm font-medium text-gray-200">
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {posts.map((post) => {
//                 const date = new Date(post.timestamp * 1000).toLocaleString();
//                 const src = getPostImageUrl(post);
//                 return (
//                   <tr key={post.post_id} className="border-b border-gray-700">
//                     <td className="px-4 py-2">
//                       {src ? (
//                         <img src={src} alt="post" className="h-12 w-12 object-cover rounded-md" />
//                       ) : (
//                         <div className="h-12 w-12 bg-gray-600 flex items-center justify-center rounded-md">
//                           <span className="text-gray-400 text-xs">No Image</span>
//                         </div>
//                       )}
//                     </td>
//                     <td className="px-4 py-2 text-gray-100 text-sm whitespace-nowrap overflow-hidden truncate max-w-xs">
//                       {post.message || '(No message)'}
//                     </td>
//                     <td className="px-4 py-2 text-gray-300 text-sm">{date}</td>
//                     <td className="px-4 py-2 text-center text-gray-200 text-sm">{post.comments_count}</td>
//                     <td className="px-4 py-2 text-center text-gray-200 text-sm">{post.reactions_count}</td>
//                     <td className="px-4 py-2 text-center">
//                       <button onClick={() => openModal(post)}>
//                         <img src="/eye.png" alt="View" className="h-6 w-6" />
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Pagination controls */}
//       <div className="flex justify-center items-center space-x-1">
//         <button
//           onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//           className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
//         >&lt;</button>
//         {firstBlock.map((n) => (
//           <button
//             key={n}
//             onClick={() => { setCurrentPage(n); if (!pageData[n]) fetchPage(n); }}
//             className={`w-8 h-8 flex items-center justify-center border ${n === currentPage ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-600 text-gray-200 hover:bg-gray-700'}`}
//           >{n}</button>
//         ))}
//         <span className="px-1 text-gray-200">…</span>
//         <button
//           onClick={() => { setCurrentPage(lastPage); if (!pageData[lastPage]) fetchPage(lastPage); }}
//           className={`w-8 h-8 flex items-center justify-center border ${lastPage === currentPage ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-600 text-gray-200 hover:bg-gray-700'}`}
//         >{lastPage}</button>
//         <button
//           onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
//           className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
//         >&gt;</button>
//       </div>

//       {/* Modal */}
//       {showModal && selectedPost && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
//             <h2 className="text-white text-xl mb-4">Post Details</h2>
//             <p className="text-gray-200 mb-4 whitespace-pre-wrap">{selectedPost.message || '(No message)'}</p>
//             <button
//               onClick={closeModal}
//               className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
//             >Close</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// // src/components/FbPosts.jsx
// "use client";

// import React, { useState, useEffect } from "react";
// import { getPostImageUrl } from "../lib/getPostImage";

// export default function FbPosts({ profileId, totalPages = 12 }) {
//   const POSTS_PER_PAGE = 5;
//   const [pageCursors, setPageCursors] = useState({ 1: null });
//   const [pageData, setPageData] = useState({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loadingPage, setLoadingPage] = useState(null);
//   const [error, setError] = useState(null);

//   // Modal state
//   const [showModal, setShowModal] = useState(false);
//   const [selectedPost, setSelectedPost] = useState(null);

//   useEffect(() => {
//     if (!profileId) return;
//     setPageCursors({ 1: null });
//     setPageData({});
//     setCurrentPage(1);
//     setError(null);
//     fetchPage(1);
//   }, [profileId]);

//   async function fetchPage(pageNum) {
//     if (pageData[pageNum] || loadingPage === pageNum) return;
//     setLoadingPage(pageNum);
//     setError(null);

//     try {
//       const alreadyFetched = new Set(
//         Object.values(pageData).flat().map((p) => p.post_id)
//       );
//       let cursor = pageCursors[pageNum] || null;
//       const combined = [];
//       let loops = 0;

//       while (combined.length < POSTS_PER_PAGE && loops < 2) {
//         let url = `/api/fb_posts?profile_id=${encodeURIComponent(profileId)}`;
//         if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;

//         const res = await fetch(url);
//         if (!res.ok) throw new Error(`Failed to fetch page ${pageNum}: ${res.statusText}`);
//         const { results = [], cursor: nextCursor = null } = await res.json();

//         for (const p of results) {
//           if (!alreadyFetched.has(p.post_id) && combined.length < POSTS_PER_PAGE) {
//             combined.push(p);
//             alreadyFetched.add(p.post_id);
//           }
//         }

//         cursor = nextCursor;
//         loops++;
//         if (!cursor) break;
//       }

//       setPageData((prev) => ({ ...prev, [pageNum]: combined }));
//       if (cursor) {
//         setPageCursors((prev) => ({ ...prev, [pageNum + 1]: cursor }));
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Unknown error");
//     } finally {
//       setLoadingPage(null);
//     }
//   }

//   const posts = pageData[currentPage] || [];
//   const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
//   const block = 5;
//   const firstBlock = pages.slice(0, block);
//   const lastPage = pages[pages.length - 1];

//   function openModal(post) {
//     setSelectedPost(post);
//     setShowModal(true);
//   }
//   function closeModal() {
//     setShowModal(false);
//     setSelectedPost(null);
//   }

//   return (
//     <div className="space-y-4">
//       {/* Loading / Error */}
//       {loadingPage === currentPage && (
//         <div className="flex justify-center items-center py-8">
//           <span className="text-gray-400">Loading page {currentPage}…</span>
//         </div>
//       )}
//       {error && (
//         <div className="py-8 px-4 bg-red-900 rounded-md">
//           <p className="text-red-200">Error: {error}</p>
//         </div>
//       )}

//       {/* Posts Table */}
//       {!loadingPage && !error && (
//         <div className="overflow-x-auto">
//           <table className="table-auto w-full bg-gray-800 rounded-md overflow-hidden">
//             <thead className="bg-gray-700">
//               <tr>
//                 {['Image', 'Post / Title', 'Timestamp', 'Comments', 'Reactions', 'View Details'].map((h) => (
//                   <th key={h} className="px-4 py-2 text-left text-sm font-medium text-gray-200">
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {posts.map((post) => {
//                 const date = new Date(post.timestamp * 1000).toLocaleString();
//                 const src = getPostImageUrl(post);
//                 return (
//                   <tr key={post.post_id} className="border-b border-gray-700">
//                     <td className="px-4 py-2">
//                       {src ? (
//                         <img src={src} alt="post" className="h-12 w-12 object-cover rounded-md" />
//                       ) : (
//                         <div className="h-12 w-12 bg-gray-600 flex items-center justify-center rounded-md">
//                           <span className="text-gray-400 text-xs">No Image</span>
//                         </div>
//                       )}
//                     </td>
//                     <td className="px-4 py-2 text-gray-100 text-sm whitespace-nowrap overflow-hidden truncate max-w-xs">
//                       {post.message || '(No message)'}
//                     </td>
//                     <td className="px-4 py-2 text-gray-300 text-sm">{date}</td>
//                     <td className="px-4 py-2 text-center text-gray-200 text-sm">{post.comments_count}</td>
//                     <td className="px-4 py-2 text-center text-gray-200 text-sm">{post.reactions_count}</td>
//                     <td className="px-4 py-2 text-center">
//                       <button onClick={() => openModal(post)}>
//                         <img src="/eye.png" alt="View" className="h-6 w-6" />
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Pagination controls */}
//       <div className="flex justify-center items-center space-x-1">
//         <button
//           onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//           className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
//         >&lt;</button>
//         {firstBlock.map((n) => (
//           <button
//             key={n}
//             onClick={() => { setCurrentPage(n); if (!pageData[n]) fetchPage(n); }}
//             className={`w-8 h-8 flex items-center justify-center border ${n === currentPage ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-600 text-gray-200 hover:bg-gray-700'}`}
//           >{n}</button>
//         ))}
//         <span className="px-1 text-gray-200">…</span>
//         <button
//           onClick={() => { setCurrentPage(lastPage); if (!pageData[lastPage]) fetchPage(lastPage); }}
//           className={`w-8 h-8 flex items-center justify-center border ${lastPage === currentPage ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-600 text-gray-200 hover:bg-gray-700'}`}
//         >{lastPage}</button>
//         <button
//           onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
//           className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
//         >&gt;</button>
//       </div>

//       {/* Modal */}
//       {showModal && selectedPost && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
//             {/* Timestamp */}
//             <p className="text-gray-400 text-sm mb-2">
//               {new Date(selectedPost.timestamp * 1000).toLocaleString()}
//             </p>
//             {/* Media */}
//             <div className="w-full h-64 mb-4 flex items-center justify-center">
//               {selectedPost.video ? (
//                 <video
//                   src={selectedPost.video}
//                   controls
//                   className="h-full w-full object-contain rounded-md"
//                 />
//               ) : (
//                 <img
//                   src={getPostImageUrl(selectedPost)}
//                   alt="Post media"
//                   className="h-full w-full object-contain rounded-md"
//                 />
//               )}
//             </div>
//             {/* Full message */}
//             <p className="text-gray-200 whitespace-pre-wrap mb-4">
//               {selectedPost.message || '(No message)'}
//             </p>
//             <button
//               onClick={closeModal}
//               className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// // src/components/FbPosts.jsx (correctly model is displayed)
// "use client";

// import React, { useState, useEffect } from "react";
// import { getPostImageUrl } from "../lib/getPostImage";

// export default function FbPosts({ profileId, totalPages = 12 }) {
//   const POSTS_PER_PAGE = 5;
//   const [pageCursors, setPageCursors] = useState({ 1: null });
//   const [pageData, setPageData] = useState({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loadingPage, setLoadingPage] = useState(null);
//   const [error, setError] = useState(null);

//   // Modal state
//   const [showModal, setShowModal] = useState(false);
//   const [selectedPost, setSelectedPost] = useState(null);

//   useEffect(() => {
//     if (!profileId) return;
//     setPageCursors({ 1: null });
//     setPageData({});
//     setCurrentPage(1);
//     setError(null);
//     fetchPage(1);
//   }, [profileId]);

//   async function fetchPage(pageNum) {
//     if (pageData[pageNum] || loadingPage === pageNum) return;
//     setLoadingPage(pageNum);
//     setError(null);

//     try {
//       const alreadyFetched = new Set(
//         Object.values(pageData).flat().map((p) => p.post_id)
//       );
//       let cursor = pageCursors[pageNum] || null;
//       const combined = [];
//       let loops = 0;

//       while (combined.length < POSTS_PER_PAGE && loops < 2) {
//         let url = `/api/fb_posts?profile_id=${encodeURIComponent(profileId)}`;
//         if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;

//         const res = await fetch(url);
//         if (!res.ok) throw new Error(`Failed to fetch page ${pageNum}: ${res.statusText}`);
//         const { results = [], cursor: nextCursor = null } = await res.json();

//         for (const p of results) {
//           if (!alreadyFetched.has(p.post_id) && combined.length < POSTS_PER_PAGE) {
//             combined.push(p);
//             alreadyFetched.add(p.post_id);
//           }
//         }

//         cursor = nextCursor;
//         loops++;
//         if (!cursor) break;
//       }

//       setPageData((prev) => ({ ...prev, [pageNum]: combined }));
//       if (cursor) {
//         setPageCursors((prev) => ({ ...prev, [pageNum + 1]: cursor }));
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Unknown error");
//     } finally {
//       setLoadingPage(null);
//     }
//   }

//   const posts = pageData[currentPage] || [];
//   const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
//   const block = 5;
//   const firstBlock = pages.slice(0, block);
//   const lastPage = pages[pages.length - 1];

//   function openModal(post) {
//     setSelectedPost(post);
//     setShowModal(true);
//   }
//   function closeModal() {
//     setShowModal(false);
//     setSelectedPost(null);
//   }

//   return (
//     <div className="space-y-4">
//       {/* Loading / Error */}
//       {loadingPage === currentPage && (
//         <div className="flex justify-center items-center py-8">
//           <span className="text-gray-400">Loading page {currentPage}…</span>
//         </div>
//       )}
//       {error && (
//         <div className="py-8 px-4 bg-red-900 rounded-md">
//           <p className="text-red-200">Error: {error}</p>
//         </div>
//       )}

//       {/* Posts Table */}
//       {!loadingPage && !error && (
//         <div className="overflow-x-auto">
//           <table className="table-auto w-full bg-gray-800 rounded-md overflow-hidden">
//             <thead className="bg-gray-700">
//               <tr>
//                 {['Image', 'Post / Title', 'Timestamp', 'Comments', 'Reactions', 'View Details'].map((h) => (
//                   <th key={h} className="px-4 py-2 text-left text-sm font-medium text-gray-200">
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {posts.map((post) => {
//                 const date = new Date(post.timestamp * 1000).toLocaleString();
//                 const src = getPostImageUrl(post);
//                 return (
//                   <tr key={post.post_id} className="border-b border-gray-700">
//                     <td className="px-4 py-2">
//                       {src ? (
//                         <img src={src} alt="post" className="h-12 w-12 object-cover rounded-md" />
//                       ) : (
//                         <div className="h-12 w-12 bg-gray-600 flex items-center justify-center rounded-md">
//                           <span className="text-gray-400 text-xs">No Image</span>
//                         </div>
//                       )}
//                     </td>
//                     <td className="px-4 py-2 text-gray-100 text-sm whitespace-nowrap overflow-hidden truncate max-w-xs">
//                       {post.message || '(No message)'}
//                     </td>
//                     <td className="px-4 py-2 text-gray-300 text-sm">{date}</td>
//                     <td className="px-4 py-2 text-center text-gray-200 text-sm">{post.comments_count}</td>
//                     <td className="px-4 py-2 text-center text-gray-200 text-sm">{post.reactions_count}</td>
//                     <td className="px-4 py-2 text-center">
//                       <button onClick={() => openModal(post)}>
//                         <img src="/eye.png" alt="View" className="h-6 w-6" />
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Pagination controls */}
//       <div className="flex justify-center items-center space-x-1">
//         <button
//           onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//           className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
//         >&lt;</button>
//         {firstBlock.map((n) => (
//           <button
//             key={n}
//             onClick={() => { setCurrentPage(n); if (!pageData[n]) fetchPage(n); }}
//             className={`w-8 h-8 flex items-center justify-center border ${n === currentPage ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-600 text-gray-200 hover:bg-gray-700'}`}
//           >{n}</button>
//         ))}
//         <span className="px-1 text-gray-200">…</span>
//         <button
//           onClick={() => { setCurrentPage(lastPage); if (!pageData[lastPage]) fetchPage(lastPage); }}
//           className={`w-8 h-8 flex items-center justify-center border ${lastPage === currentPage ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-600 text-gray-200 hover:bg-gray-700'}`}
//         >{lastPage}</button>
//         <button
//           onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
//           className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
//         >&gt;</button>
//       </div>

//       {/* Modal */}
//       {showModal && selectedPost && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
//             {/* Timestamp */}
//             <p className="text-gray-400 text-sm mb-2">
//               {new Date(selectedPost.timestamp * 1000).toLocaleString()}
//             </p>
//             {/* Media */}
//             <div className="w-full h-64 mb-4 flex items-center justify-center">
//               {selectedPost.video_files?.video_hd_file || selectedPost.video_files?.video_sd_file ? (
//                 <video
//                   src={
//                     selectedPost.video_files.video_hd_file ||
//                     selectedPost.video_files.video_sd_file
//                   }
//                   controls
//                   className="h-full w-full object-contain rounded-md"
//                 />
//               ) : (
//                 <img
//                   src={getPostImageUrl(selectedPost)}
//                   alt="Post media"
//                   className="h-full w-full object-contain rounded-md"
//                 />
//               )}
//             </div>
//             {/* Full message */}
//             <div className="text-gray-200 whitespace-pre-line">
//               {selectedPost.message || '(No message)'}
//             </div>
//             <button
//               onClick={closeModal}
//               className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
//             >
//               Close
//              </button>
//            </div>
//          </div>
//        )}
//      </div>
//   );
//  }



// // src/components/FbPosts.jsx
// "use client";

// import React, { useState, useEffect } from "react";
// import { getPostImageUrl } from "../lib/getPostImage";

// export default function FbPosts({ profileId, totalPages = 12 }) {
//     const POSTS_PER_PAGE = 5;
//     const [pageCursors, setPageCursors] = useState({ 1: null });
//     const [pageData, setPageData] = useState({});
//     const [currentPage, setCurrentPage] = useState(1);
//     const [loadingPage, setLoadingPage] = useState(null);
//     const [error, setError] = useState(null);

//     // Modal state
//     const [showModal, setShowModal] = useState(false);
//     const [selectedPost, setSelectedPost] = useState(null);
//     const [showChildren, setShowChildren] = useState(false);

//     useEffect(() => {
//         if (!profileId) return;
//         setPageCursors({ 1: null });
//         setPageData({});
//         setCurrentPage(1);
//         setError(null);
//         fetchPage(1);
//     }, [profileId]);

//     async function fetchPage(pageNum) {
//         if (pageData[pageNum] || loadingPage === pageNum) return;
//         setLoadingPage(pageNum);
//         setError(null);

//         try {
//             //   const alreadyFetched = new Set(
//             //     Object.values(pageData).flat().map((p) => p.post_id)
//             //   );
//             //   let cursor = pageCursors[pageNum] || null;
//             //   const combined = [];
//             //   let loops = 0;

//             //   while (combined.length < POSTS_PER_PAGE && loops < 2) {
//             //     let url = `/api/fb_posts?profile_id=${encodeURIComponent(profileId)}`;
//             //     if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;

//             //     const res = await fetch(url);
//             //     if (!res.ok) throw new Error(`Failed to fetch page ${pageNum}: ${res.statusText}`);
//             //     const { results = [], cursor: nextCursor = null } = await res.json();

//             //     for (const p of results) {
//             //       if (!alreadyFetched.has(p.post_id) && combined.length < POSTS_PER_PAGE) {
//             //         combined.push(p);
//             //         alreadyFetched.add(p.post_id);
//             //       }
//             //     }

//             //     cursor = nextCursor;
//             //     loops++;
//             //     if (!cursor) break;
//             //   }

//             //   setPageData((prev) => ({ ...prev, [pageNum]: combined }));
//             //   if (cursor) {
//             //     setPageCursors((prev) => ({ ...prev, [pageNum + 1]: cursor }));
//             //   }

//             // Simplified: trust the cursor to yield distinct pages,
//             // and just grab the first POSTS_PER_PAGE items.
//             const cursor = pageCursors[pageNum] || null;
//             let url = `/api/fb_posts?profile_id=${encodeURIComponent(profileId)}`;
//             if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;

//             const res = await fetch(url);
//             if (!res.ok) throw new Error(`Failed to fetch page ${pageNum}: ${res.statusText}`);
//             const { results = [], cursor: nextCursor = null } = await res.json();

//             // Take exactly POSTS_PER_PAGE posts, in order.
//             const pagePosts = results.slice(0, POSTS_PER_PAGE);

//             setPageData((prev) => ({ ...prev, [pageNum]: pagePosts }));
//             if (nextCursor) {
//                 setPageCursors((prev) => ({ ...prev, [pageNum + 1]: nextCursor }));
//             }
//         } catch (err) {
//             console.error(err);
//             setError(err.message || "Unknown error");
//         } finally {
//             setLoadingPage(null);
//         }
//     }

//     function openModal(post) {
//         setSelectedPost(post);
//         setShowChildren(false);
//         setShowModal(true);
//     }
//     function closeModal() {
//         setShowModal(false);
//         setSelectedPost(null);
//     }

//     const posts = pageData[currentPage] || [];
//     const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
//     const block = 5;
//     const firstBlock = pages.slice(0, block);
//     const lastPage = pages[pages.length - 1];

//     return (
//         <div className="space-y-4">
//             {/* Loading / Error */}
//             {loadingPage === currentPage && (
//                 <div className="flex justify-center items-center py-8">
//                     <span className="text-gray-400">Loading page {currentPage}…</span>
//                 </div>
//             )}
//             {error && (
//                 <div className="py-8 px-4 bg-red-900 rounded-md">
//                     <p className="text-red-200">Error: {error}</p>
//                 </div>
//             )}

//             {/* Posts Table */}
//             {!loadingPage && !error && (
//                 <div className="overflow-x-auto">
//                     <table className="table-auto w-full bg-gray-800 rounded-md overflow-hidden">
//                         <thead className="bg-gray-700">
//                             <tr>
//                                 {['Image', 'Post / Title', 'Timestamp', 'Comments', 'Reactions', 'View Details'].map((h) => (
//                                     <th key={h} className="px-4 py-2 text-left text-sm font-medium text-gray-200">
//                                         {h}
//                                     </th>
//                                 ))}
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {posts.map((post) => {
//                                 // const date = new Date(post.timestamp * 1000).toLocaleString();
//                                 // const src = getPostImageUrl(post);
//                                 // 🔥 DEBUG: log the raw post object
//                                 console.debug("[FbPosts] raw post:", post);
//                                 const date = new Date(post.timestamp * 1000).toLocaleString();
//                                 const src = getPostImageUrl(post);
//                                 // 🔥 DEBUG: log which URL (if any) we got back
//                                 console.debug("[FbPosts] getPostImageUrl →", src);
//                                 return (
//                                     <tr key={post.post_id} className="border-b border-gray-700">
//                                         <td className="px-4 py-2">
//                                             {src ? (
//                                                 <img src={src} alt="post" className="h-12 w-12 object-cover rounded-md" />
//                                             ) : (
//                                                 <div className="h-12 w-12 bg-gray-600 flex items-center justify-center rounded-md">
//                                                     <span className="text-gray-400 text-xs">No Image</span>
//                                                 </div>
//                                             )}
//                                         </td>
//                                         <td className="px-4 py-2 text-gray-100 text-sm whitespace-nowrap overflow-hidden truncate max-w-xs">
//                                             {post.message || '(No message)'}
//                                         </td>
//                                         <td className="px-4 py-2 text-gray-300 text-sm">{date}</td>
//                                         <td className="px-4 py-2 text-center text-gray-200 text-sm">{post.comments_count}</td>
//                                         <td className="px-4 py-2 text-center text-gray-200 text-sm">{post.reactions_count}</td>
//                                         <td className="px-4 py-2 text-center">
//                                             <button onClick={() => openModal(post)}>
//                                                 <img src="/eye.png" alt="View" className="h-6 w-6" />
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 );
//                             })}
//                         </tbody>
//                     </table>
//                 </div>
//             )}

//             {/* Pagination controls */}
//             <div className="flex justify-center items-center space-x-1">
//                 <button
//                     onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                     className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
//                 >&lt;</button>
//                 {firstBlock.map((n) => (
//                     <button
//                         key={n}
//                         onClick={() => { setCurrentPage(n); if (!pageData[n]) fetchPage(n); }}
//                         className={`w-8 h-8 flex items-center justify-center border ${n === currentPage ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-600 text-gray-200 hover:bg-gray-700'}`}
//                     >{n}</button>
//                 ))}
//                 <span className="px-1 text-gray-200">…</span>
//                 <button
//                     onClick={() => { setCurrentPage(lastPage); if (!pageData[lastPage]) fetchPage(lastPage); }}
//                     className={`w-8 h-8 flex items-center justify-center border ${lastPage === currentPage ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-600 text-gray-200 hover:bg-gray-700'}`}
//                 >{lastPage}</button>
//                 <button
//                     onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
//                     className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
//                 >&gt;</button>
//             </div>

//             {/* Modal */}
//             {showModal && selectedPost && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-[#1f2937] text-white p-4 md:p-6 rounded-md relative w-[90%] max-w-[500px] max-h-[80vh] overflow-y-auto">
//                         {/* Timestamp */}  <div className="flex justify-between items-center">

//                             <p className="text-gray-400 text-sm mb-2">
//                                 {new Date(selectedPost.timestamp * 1000).toLocaleString()}
//                             </p>
//                             <button
//                                 onClick={closeModal}
//                                 className="text-[16px] px-2 py-1 bg-[#000000] font-bold"
//                             >
//                                 X
//                             </button>
//                         </div>
//                         {/* Media */}
//                         <div className="w-full h-64 mb-4 flex items-center justify-center">
//                             {selectedPost.video_files?.video_hd_file || selectedPost.video_files?.video_sd_file ? (
//                                 <video
//                                     src={
//                                         selectedPost.video_files.video_hd_file ||
//                                         selectedPost.video_files.video_sd_file
//                                     }
//                                     controls
//                                     className="h-full w-full object-contain rounded-md"
//                                 />
//                             ) : (
//                                 <img
//                                     src={getPostImageUrl(selectedPost)}
//                                     alt="Post media"
//                                     className="h-full w-full object-contain rounded-md"
//                                 />
//                             )}
//                         </div>
//                         {/* Full message */}
//                         <div className="text-gray-200 whitespace-pre-line mb-4">
//                             {selectedPost.message || '(No message)'}
//                         </div>
//                         {/* View child posts button */}
//                         {selectedPost.album_preview?.length > 1 && (
//                             <button
//                                 onClick={() => setShowChildren((c) => !c)}
//                                 className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500"
//                             >
//                                 {showChildren ? 'Hide Child Posts' : 'View Child Posts'}
//                             </button>
//                         )}
//                         {/* Child posts carousel */}
//                         {showChildren && selectedPost.album_preview && (
//                             <div className="flex space-x-2 overflow-x-auto mb-4">
//                                 {selectedPost.album_preview.map((item, idx) => (
//                                     <img
//                                         key={idx}
//                                         src={item.image_file_uri}
//                                         alt={`Child ${idx + 1}`}
//                                         className="flex-shrink-0 w-[90px] h-[90px] object-cover rounded-md"
//                                     />
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// // Correctly added child posts to just verify them and in this add comments chekc api response code come faster or the images and add sight engine analysis


// src/components/FbPosts.jsx (correct)
// "use client";

// import React, { useState, useEffect } from "react";
// import { getPostImageUrl } from "../lib/getPostImage";

// export default function FbPosts({ profileId, totalPages = 12 }) {
//   const POSTS_PER_PAGE = 5;
//   const [pageCursors, setPageCursors] = useState({ 1: null });
//   const [pageData, setPageData] = useState({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loadingPage, setLoadingPage] = useState(null);
//   const [error, setError] = useState(null);

//   // Modal state
//   const [showModal, setShowModal] = useState(false);
//   const [selectedPost, setSelectedPost] = useState(null);
//   const [showChildren, setShowChildren] = useState(false);

//   // Reset and fetch first page on profile change
//   useEffect(() => {
//     if (!profileId) return;
//     setPageCursors({ 1: null });
//     setPageData({});
//     setCurrentPage(1);
//     setError(null);
//   }, [profileId]);

//   // Fetch whenever currentPage changes
//   useEffect(() => {
//     if (!pageData[currentPage] && loadingPage !== currentPage) {
//       fetchPage(currentPage);
//     }
//   }, [currentPage, pageData, loadingPage]);

//   async function fetchPage(pageNum) {
//     if (pageData[pageNum] || loadingPage === pageNum) return;
//     setLoadingPage(pageNum);
//     setError(null);

//     try {
//       const cursor = pageCursors[pageNum] || null;
//       const url = new URL(`/api/fb_posts`, window.location.origin);
//       url.searchParams.set("profile_id", profileId);
//       if (cursor) url.searchParams.set("cursor", cursor);
//        // tell the API how many posts to return (matches your POSTS_PER_PAGE)
//       url.searchParams.set("limit", POSTS_PER_PAGE);
//       const res = await fetch(url);
//       if (!res.ok) throw new Error(`Failed to fetch page ${pageNum}: ${res.statusText}`);
//       const { results: pagePosts = [], cursor: nextCursor = null } = await res.json();

//       // Store whatever number of posts returned
//       setPageData((prev) => ({ ...prev, [pageNum]: pagePosts }));
//       if (nextCursor) {
//         setPageCursors((prev) => ({ ...prev, [pageNum + 1]: nextCursor }));
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Unknown error");
//     } finally {
//       setLoadingPage(null);
//     }
//   }

//   function openModal(post) {
//     setSelectedPost(post);
//     setShowChildren(false);
//     setShowModal(true);
//   }
//   function closeModal() {
//     setShowModal(false);
//     setSelectedPost(null);
//   }

//   const posts = pageData[currentPage] || [];
//   const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
//   const block = 5;
//   const firstBlock = pages.slice(0, block);
//   const lastPage = pages[pages.length - 1];

//   return (
//     <div className="space-y-4">
//       {/* Loading / Error */}
//       {loadingPage === currentPage && (
//         <div className="flex justify-center items-center py-8">
//           <span className="text-gray-400">Loading page {currentPage}…</span>
//         </div>
//       )}
//       {error && (
//         <div className="py-8 px-4 bg-red-900 rounded-md">
//           <p className="text-red-200">Error: {error}</p>
//         </div>
//       )}

//       {/* Posts Table */}
//       {!loadingPage && !error && (
//         <div className="overflow-x-auto">
//           <table className="table-auto w-full bg-gray-800 rounded-md overflow-hidden">
//             <thead className="bg-gray-700">
//               <tr>
//                 {['Image', 'Post / Title', 'Timestamp', 'Comments', 'Reactions', 'View Details'].map((h) => (
//                   <th key={h} className="px-4 py-2 text-left text-sm font-medium text-gray-200">
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {posts.map((post) => {
//                 const date = new Date(post.timestamp * 1000).toLocaleString();
//                 const src = getPostImageUrl(post);
//                 return (
//                   <tr key={post.post_id} className="border-b border-gray-700">
//                     <td className="px-4 py-2">
//                       {src ? (
//                         <img src={src} alt="post" className="h-12 w-12 object-cover rounded-md" />
//                       ) : (
//                         <div className="h-12 w-12 bg-gray-600 flex items-center justify-center rounded-md">
//                           <span className="text-gray-400 text-xs">No Image</span>
//                         </div>
//                       )}
//                     </td>
//                     <td className="px-4 py-2 text-gray-100 text-sm whitespace-nowrap overflow-hidden truncate max-w-xs">
//                       {post.message || '(No message)'}
//                     </td>
//                     <td className="px-4 py-2 text-gray-300 text-sm">{date}</td>
//                     <td className="px-4 py-2 text-center text-gray-200 text-sm">{post.comments_count}</td>
//                     <td className="px-4 py-2 text-center text-gray-200 text-sm">{post.reactions_count}</td>
//                     <td className="px-4 py-2 text-center">
//                       <button onClick={() => openModal(post)}>
//                         <img src="/eye.png" alt="View" className="h-6 w-6" />
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Pagination Controls */}
//       <div className="flex justify-center items-center space-x-1">
//         <button
//           onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//           className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
//         >&lt;</button>
//         {firstBlock.map((n) => (
//           <button
//             key={n}
//             onClick={() => setCurrentPage(n)}
//             className={`w-8 h-8 flex items-center justify-center border ${n === currentPage ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-600 text-gray-200 hover:bg-gray-700'}`}
//           >{n}</button>
//         ))}
//         <span className="px-1 text-gray-200">…</span>
//         <button
//           onClick={() => setCurrentPage(lastPage)}
//           className={`w-8 h-8 flex items-center justify-center border ${lastPage === currentPage ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-600 text-gray-200 hover:bg-gray-700'}`}
//         >{lastPage}</button>
//         <button
//           onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
//           className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
//         >&gt;</button>
//       </div>

//       {/* Modal */}
//       {showModal && selectedPost && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-[#1f2937] text-white p-4 md:p-6 rounded-md relative w-[90%] max-w-[500px] max-h-[80vh] overflow-y-auto">
//             <div className="flex justify-between items-center">
//               <p className="text-gray-400 text-sm mb-2">
//                 {new Date(selectedPost.timestamp * 1000).toLocaleString()}
//               </p>
//               <button onClick={closeModal} className="text-[16px] px-2 py-1 bg-[#000000] font-bold">X</button>
//             </div>
//             <div className="w-full h-[250px] mb-4 flex items-center justify-center">
//               {selectedPost.video_files?.video_hd_file || selectedPost.video_files?.video_sd_file ? (
//                 <video
//                   src={selectedPost.video_files.video_hd_file || selectedPost.video_files.video_sd_file}
//                   controls className="h-full w-full object-contain rounded-md" />
//               ) : (
//                 <img src={getPostImageUrl(selectedPost)} alt="Post media" className="h-full w-full object-contain rounded-md" />
//               )}
//             </div>
//             <div className="text-[14px] mt-4 mb-2 text-gray-200">{selectedPost.message || '(No message)'}</div>
//             {selectedPost.album_preview?.length > 1 && (
//               <button onClick={() => setShowChildren((c) => !c)} className="mb-4 px-4 py-2 bg-[#14B8A6] text-white rounded-md ">
//                 {showChildren ? 'Hide Child Posts' : 'View Child Posts'}
//               </button>
//             )}
//             {showChildren && selectedPost.album_preview && (
//               <div className="flex space-x-2 overflow-x-auto mb-4">
//                 {selectedPost.album_preview.map((item, idx) => (
//                   <img key={idx} src={item.image_file_uri} alt={`Child ${idx+1}`} className="flex-shrink-0 w-[90px] h-[90px] object-cover rounded-md" />
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // src/components/FbPosts.jsx
// "use client";

// import React, { useState, useEffect } from "react";
// import { getPostImageUrl } from "../lib/getPostImage";

// export default function FbPosts({ profileId, totalPages = 12 }) {
//   const POSTS_PER_PAGE = 5;

//   // Posts pagination
//   const [pageCursors, setPageCursors]   = useState({ 1: null });
//   const [pageData, setPageData]         = useState({});
//   const [currentPage, setCurrentPage]   = useState(1);
//   const [loadingPage, setLoadingPage]   = useState(null);
//   const [error, setError]               = useState(null);

//   // Modal state
//   const [showModal, setShowModal]       = useState(false);
//   const [selectedPost, setSelectedPost] = useState(null);

//   // Comments state
//   const [comments, setComments]             = useState([]);
//   const [commentsCursor, setCommentsCursor] = useState(null);
//   const [commentsLoading, setCommentsLoading] = useState(false);
//   const [commentsError, setCommentsError]     = useState(null);

//   // Reset when profile changes
//   useEffect(() => {
//     if (!profileId) return;
//     setPageCursors({ 1: null });
//     setPageData({});
//     setCurrentPage(1);
//     setError(null);
//   }, [profileId]);

//   // Fetch posts when page changes
//   useEffect(() => {
//     if (!pageData[currentPage] && loadingPage !== currentPage) {
//       fetchPage(currentPage);
//     }
//   }, [currentPage, pageData, loadingPage]);

//   async function fetchPage(pageNum) {
//     if (pageData[pageNum] || loadingPage === pageNum) return;
//     setLoadingPage(pageNum);
//     setError(null);

//     try {
//       const cursor = pageCursors[pageNum] || null;
//       const url = new URL("/api/fb_posts", window.location.origin);
//       url.searchParams.set("profile_id", profileId);
//       if (cursor) url.searchParams.set("cursor", cursor);
//       url.searchParams.set("limit", POSTS_PER_PAGE);

//       const res = await fetch(url);
//       if (!res.ok) throw new Error(`Failed to fetch page ${pageNum}: ${res.statusText}`);
//       const { results: pagePosts = [], cursor: nextCursor = null } = await res.json();

//       setPageData(prev => ({ ...prev, [pageNum]: pagePosts }));
//       if (nextCursor) setPageCursors(prev => ({ ...prev, [pageNum + 1]: nextCursor }));
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Unknown error");
//     } finally {
//       setLoadingPage(null);
//     }
//   }

//   // openModal: show post + load comments
//   async function openModal(post) {
//     setSelectedPost(post);
//     setShowModal(true);

//     // reset comments
//     setComments([]);
//     setCommentsCursor(null);
//     setCommentsLoading(true);
//     setCommentsError(null);

//     try {
//       const url = new URL("/api/fetch_fb_comments", window.location.origin);
//       url.searchParams.set("post_id", post.post_id);
//       url.searchParams.set("limit", 20);

//       const res = await fetch(url);
//       if (!res.ok) throw new Error(res.statusText);
//       const { comments: fetched, cursor } = await res.json();
//       setComments(fetched);
//       setCommentsCursor(cursor);
//     } catch (err) {
//       console.error(err);
//       setCommentsError(err.message || "Failed to load comments");
//     } finally {
//       setCommentsLoading(false);
//     }
//   }

//   function closeModal() {
//     setShowModal(false);
//     setSelectedPost(null);
//   }

//   // render
//   const posts = pageData[currentPage] || [];
//   const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
//   const lastPage = pages[pages.length - 1];

//   return (
//     <div className="space-y-4">
//       {loadingPage === currentPage && (
//         <div className="py-8 text-center text-gray-400">Loading page…</div>
//       )}
//       {error && <div className="p-4 bg-red-900 text-red-200 rounded">Error: {error}</div>}

//       {/* Posts Table */}
//       {!loadingPage && !error && (
//         <table className="table-auto w-full bg-gray-800 rounded overflow-hidden">
//           <thead className="bg-gray-700 text-gray-200 text-sm">
//             <tr>
//               {['Image','Post','Time','Comments','Reacts','View'].map(h => (
//                 <th key={h} className="px-4 py-2 text-left">{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {posts.map(post => {
//               const date = new Date(post.timestamp * 1000).toLocaleString();
//               const src  = getPostImageUrl(post);
//               return (
//                 <tr key={post.post_id} className="border-b border-gray-700">
//                   <td className="px-4 py-2">
//                     {src
//                       ? <img src={src} alt="" className="h-12 w-12 object-cover rounded" />
//                       : <div className="h-12 w-12 bg-gray-600 rounded flex items-center justify-center">
//                           <span className="text-xs text-gray-400">No Image</span>
//                         </div>
//                     }
//                   </td>
//                   <td className="px-4 py-2 text-gray-100 text-sm truncate max-w-xs">
//                     {post.message || '(No message)'}
//                   </td>
//                   <td className="px-4 py-2 text-gray-300 text-sm">{date}</td>
//                   <td className="px-4 py-2 text-center text-gray-200 text-sm">{post.comments_count}</td>
//                   <td className="px-4 py-2 text-center text-gray-200 text-sm">{post.reactions_count}</td>
//                   <td className="px-4 py-2 text-center">
//                     <button onClick={() => openModal(post)}>
//                       <img src="/eye.png" alt="View" className="h-6 w-6" />
//                     </button>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       )}

//       {/* Pagination */}
//       <div className="flex justify-center space-x-2">
//         <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} className="px-2 py-1 bg-gray-700 rounded">&lt;</button>
//         {pages.slice(0,5).map(n => (
//           <button key={n} onClick={() => setCurrentPage(n)}
//             className={`px-2 py-1 rounded ${n===currentPage ? 'bg-teal-500' : 'bg-gray-700'}`}> {n} </button>
//         ))}
//         <span className="px-1 text-gray-200">…</span>
//         <button onClick={() => setCurrentPage(lastPage)}
//           className={`px-2 py-1 rounded ${lastPage===currentPage ? 'bg-teal-500':'bg-gray-700'}`}> {lastPage} </button>
//         <button onClick={() => setCurrentPage(p => Math.min(lastPage, p+1))} className="px-2 py-1 bg-gray-700 rounded">&gt;</button>
//       </div>

//       {/* Modal */}
//       {showModal && selectedPost && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-gray-900 text-white rounded p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold">Post Comments</h2>
//               <button onClick={closeModal} className="text-xl">×</button>
//             </div>

//             {/* Post content */}
//             <p className="mb-4 text-sm text-gray-300">{selectedPost.message || '(No message)'}</p>

//             {/* Comments */}
//             <div>
//               <h3 className="font-medium mb-2">Comments</h3>
//               {commentsLoading && <p className="text-gray-400">Loading…</p>}
//               {commentsError   && <p className="text-red-400">{commentsError}</p>}
//               {!commentsLoading && comments.length === 0 && <p className="text-gray-500">No comments yet.</p>}
//               {comments.map(c => (
//                 <div key={c.comment_id || c.id} className="mb-2 p-2 bg-gray-800 rounded">
//                   <p className="text-sm text-gray-100">{c.text || c.message}</p>
//                   <p className="text-xs text-gray-400">by {c.author?.name || c.from_name} • {new Date(c.timestamp * 1000).toLocaleString()}</p>
//                 </div>
//               ))}

//               {/* Load more */}
//               {commentsCursor && !commentsLoading && (
//                 <button
//                   onClick={async () => {
//                     setCommentsLoading(true);
//                     try {
//                       const u = new URL("/api/fetch_fb_comments", window.location.origin);
//                       u.searchParams.set("post_id", selectedPost.post_id);
//                       u.searchParams.set("cursor", commentsCursor);
//                       u.searchParams.set("limit", 20);
//                       const res = await fetch(u);
//                       const { comments: more, cursor: next } = await res.json();
//                       setComments(prev => [...prev, ...more]);
//                       setCommentsCursor(next);
//                     } catch (err) {
//                       setCommentsError(err.message);
//                     } finally {
//                       setCommentsLoading(false);
//                     }
//                   }}
//                   className="mt-2 px-4 py-2 bg-blue-600 rounded text-white"
//                 >Load more</button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// // // src/components/FbPosts.jsx Correct code with comments and 3 posts per page
// "use client";

// import React, { useState, useEffect } from "react";
// import { getPostImageUrl } from "../lib/getPostImage";

// export default function FbPosts({ profileId, totalPages = 12 }) {
//   const POSTS_PER_PAGE = 5;

//   // Posts pagination
//   const [pageCursors, setPageCursors]   = useState({ 1: null });
//   const [pageData, setPageData]         = useState({});
//   const [currentPage, setCurrentPage]   = useState(1);
//   const [loadingPage, setLoadingPage]   = useState(null);
//   const [error, setError]               = useState(null);

//   // Modal state
//   const [showModal, setShowModal]       = useState(false);
//   const [selectedPost, setSelectedPost] = useState(null);
//   const [showChildren, setShowChildren] = useState(false);

//   // Comments state
//   const [comments, setComments]             = useState([]);
//   const [commentsCursor, setCommentsCursor] = useState(null);
//   const [commentsLoading, setCommentsLoading] = useState(false);
//   const [commentsError, setCommentsError]     = useState(null);

//   // Reset when profile changes
//   useEffect(() => {
//     if (!profileId) return;
//     setPageCursors({ 1: null });
//     setPageData({});
//     setCurrentPage(1);
//     setError(null);
//   }, [profileId]);

//   // Fetch posts when page changes
//   useEffect(() => {
//     if (!pageData[currentPage] && loadingPage !== currentPage) {
//       fetchPage(currentPage);
//     }
//   }, [currentPage, pageData, loadingPage]);

//   async function fetchPage(pageNum) {
//     if (pageData[pageNum] || loadingPage === pageNum) return;
//     setLoadingPage(pageNum);
//     setError(null);

//     try {
//       const cursor = pageCursors[pageNum] || null;
//       const url = new URL("/api/fb_posts", window.location.origin);
//       url.searchParams.set("profile_id", profileId);
//       if (cursor) url.searchParams.set("cursor", cursor);
//       url.searchParams.set("limit", POSTS_PER_PAGE);

//       const res = await fetch(url);
//       if (!res.ok) throw new Error(`Failed to fetch page ${pageNum}: ${res.statusText}`);
//       const { results: pagePosts = [], cursor: nextCursor = null } = await res.json();

//       setPageData(prev => ({ ...prev, [pageNum]: pagePosts }));
//       if (nextCursor) setPageCursors(prev => ({ ...prev, [pageNum + 1]: nextCursor }));
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Unknown error");
//     } finally {
//       setLoadingPage(null);
//     }
//   }

//   // openModal: show post + load comments
//   async function openModal(post) {
//     setSelectedPost(post);
//     setShowChildren(false);
//     setShowModal(true);

//     // reset comments
//     setComments([]);
//     setCommentsCursor(null);
//     setCommentsLoading(true);
//     setCommentsError(null);

//     try {
//       const url = new URL("/api/fetch_fb_comments", window.location.origin);
//       url.searchParams.set("post_id", post.post_id);
//       url.searchParams.set("limit", 20);

//       const res = await fetch(url);
//       if (!res.ok) throw new Error(res.statusText);
//       const { comments: fetched, cursor } = await res.json();
//       setComments(fetched);
//       setCommentsCursor(cursor);
//     } catch (err) {
//       console.error(err);
//       setCommentsError(err.message || "Failed to load comments");
//     } finally {
//       setCommentsLoading(false);
//     }
//   }

//   function closeModal() {
//     setShowModal(false);
//     setSelectedPost(null);
//   }

//   // render
//   const posts = pageData[currentPage] || [];
//   const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
//   const block = 5;
//   const firstBlock = pages.slice(0, block);
//   const lastPage = pages[pages.length - 1];

//   return (
//     <div className="space-y-4">
//       {/* Loading / Error */}
//       {loadingPage === currentPage && (
//         <div className="flex justify-center items-center py-8">
//           <span className="text-gray-400">Loading page {currentPage}…</span>
//         </div>
//       )}
//       {error && (
//         <div className="py-8 px-4 bg-red-900 rounded-md">
//           <p className="text-red-200">Error: {error}</p>
//         </div>
//       )}

//       {/* Posts Table */}
//       {!loadingPage && !error && (
//         <div className="overflow-x-auto">
//           <table className="table-auto w-full bg-gray-800 rounded-md overflow-hidden">
//             <thead className="bg-gray-700">
//               <tr>
//                 {['Image', 'Post / Title', 'Timestamp', 'Comments', 'Reactions', 'View Details'].map(h => (
//                   <th key={h} className="px-4 py-2 text-left text-sm font-medium text-gray-200">{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {posts.map(post => {
//                 const date = new Date(post.timestamp * 1000).toLocaleString();
//                 const src  = getPostImageUrl(post);
//                 return (
//                   <tr key={post.post_id} className="border-b border-gray-700">
//                     <td className="px-4 py-2">
//                       {src
//                         ? <img src={src} alt="post" className="h-12 w-12 object-cover rounded-md" />
//                         : <div className="h-12 w-12 bg-gray-600 flex items-center justify-center rounded-md">
//                             <span className="text-gray-400 text-xs">No Image</span>
//                           </div>
//                       }
//                     </td>
//                     <td className="px-4 py-2 text-gray-100 text-sm whitespace-nowrap overflow-hidden truncate max-w-xs">
//                       {post.message || '(No message)'}
//                     </td>
//                     <td className="px-4 py-2 text-gray-300 text-sm">{date}</td>
//                     <td className="px-4 py-2 text-center text-gray-200 text-sm">{post.comments_count}</td>
//                     <td className="px-4 py-2 text-center text-gray-200 text-sm">{post.reactions_count}</td>
//                     <td className="px-4 py-2 text-center">
//                       <button onClick={() => openModal(post)}>
//                         <img src="/eye.png" alt="View" className="h-6 w-6" />
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Pagination Controls */}
//       <div className="flex justify-center items-center space-x-1">
//         <button
//           onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//           className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
//         >&lt;</button>
//         {firstBlock.map(n => (
//           <button
//             key={n}
//             onClick={() => setCurrentPage(n)}
//             className={`w-8 h-8 flex items-center justify-center border ${n === currentPage ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-600 text-gray-200 hover:bg-gray-700'}`}
//           >{n}</button>
//         ))}
//         <span className="px-1 text-gray-200">…</span>
//         <button
//           onClick={() => setCurrentPage(lastPage)}
//           className={`w-8 h-8 flex items-center justify-center border ${lastPage === currentPage ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-600 text-gray-200 hover:bg-gray-700'}`}
//         >{lastPage}</button>
//         <button
//           onClick={() => setCurrentPage(p => Math.min(lastPage, p + 1))}
//           className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
//         >&gt;</button>
//       </div>

//       {/* Modal */}
//       {showModal && selectedPost && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-[#1f2937] text-white p-4 md:p-6 rounded-md relative w-[90%] max-w-[500px] max-h-[80vh] overflow-y-auto">
//             <div className="flex justify-between items-center">
//               <p className="text-gray-400 text-sm mb-2">{new Date(selectedPost.timestamp * 1000).toLocaleString()}</p>
//               <button onClick={closeModal} className="text-[16px] px-2 py-1 bg-[#000000] font-bold">X</button>
//             </div>
//             <div className="w-full h-[250px] mb-4 flex items-center justify-center">
//               {selectedPost.video_files?.video_hd_file || selectedPost.video_files?.video_sd_file ? (
//                 <video
//                   src={selectedPost.video_files.video_hd_file || selectedPost.video_files.video_sd_file}
//                   controls className="h-full w-full object-contain rounded-md" />
//               ) : (
//                 <img src={getPostImageUrl(selectedPost)} alt="Post media" className="h-full w-full object-contain rounded-md" />
//               )}
//             </div>
//             <div className="text-[14px] mt-4 mb-2 text-gray-200">{selectedPost.message || '(No message)'}</div>
//             {selectedPost.album_preview?.length > 1 && (
//               <button onClick={() => setShowChildren(c => !c)} className="mb-4 px-4 py-2 bg-[#14B8A6] text-white rounded-md">
//                 {showChildren ? 'Hide Child Posts' : 'View Child Posts'}
//               </button>
//             )}
//             {showChildren && selectedPost.album_preview && (
//               <div className="flex space-x-2 overflow-x-auto mb-4">
//                 {selectedPost.album_preview.map((item, idx) => (
//                   <img key={idx} src={item.image_file_uri} alt={`Child ${idx+1}`} className="flex-shrink-0 w-[90px] h-[90px] object-cover rounded-md" />
//                 ))}
//               </div>
//             )}

//             {/* Comments Section Unconditional load more with out user's image and date posted */} 
//             {/* <div>
//               <h3 className="font-medium mb-2">Comments</h3>
//               {commentsLoading && <p className="text-gray-400">Loading comments…</p>}
//               {commentsError && <p className="text-red-400">{commentsError}</p>}
//               {!commentsLoading && comments.length === 0 && <p className="text-gray-500">No comments yet.</p>}
//               {comments.map(c => (
//                 <div key={c.comment_id || c.id} className="mb-2 p-2 bg-gray-800 rounded">
//                   <p className="text-sm text-gray-100">{c.text || c.message}</p>
//                   <p className="text-xs text-gray-400">by {c.author?.name || c.from_name} • {new Date(c.timestamp * 1000).toLocaleString()}</p>
//                 </div>
//               ))}
//               {commentsCursor && !commentsLoading && (
//                 <button onClick={async () => {
//                   setCommentsLoading(true);
//                   try {
//                     const u = new URL("/api/fetch_fb_comments", window.location.origin);
//                     u.searchParams.set("post_id", selectedPost.post_id);
//                     u.searchParams.set("cursor", commentsCursor);
//                     u.searchParams.set("limit", 20);
//                     const res = await fetch(u);
//                     const { comments: more, cursor: next } = await res.json();
//                     setComments(prev => [...prev, ...more]);
//                     setCommentsCursor(next);
//                   } catch (err) {
//                     setCommentsError(err.message);
//                   } finally {
//                     setCommentsLoading(false);
//                   }
//                 }} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">Load more comments</button>
//               )}
//             </div> */}

//             {/* Comments Section */}
// <div>
//   <h3 className="font-medium mb-2">Comments</h3>

//   {commentsLoading && <p className="text-gray-400">Loading comments…</p>}
//   {commentsError   && <p className="text-red-400">{commentsError}</p>}
//   {!commentsLoading && comments.length === 0 && (
//     <p className="text-gray-500">No comments yet.</p>
//   )}

//   {comments.map(c => (
//     <div key={c.comment_id} className="flex mb-3 p-2 bg-gray-800 rounded">
//  {/* avatar */}
//     <img
//       src={
//         // 1) If we got a full profile URL, use it…
//         c.author?.url
//           ? `${c.author.url.replace(/\/$/, "")}/picture?type=small`
//           // 2) Otherwise build one from the author ID
//           : c.author?.id
//             ? `https://graph.facebook.com/${encodeURIComponent(c.author.id)}/picture?type=small`
//             // 3) Fallback
//             : "/no-profile-pic-img.png"
//       }
//       alt={c.author?.name || "User"}
//       className="w-8 h-8 rounded-full mr-3 object-cover flex-shrink-0"
//       onError={e => {
//         // if that 404s or is blocked, show default
//         e.currentTarget.onerror = null;
//         e.currentTarget.src = "/no-profile-pic-img.png";
//       }}
//     />


//       <div className="flex-1">
//         {/* name + date */}
//         <p className="text-sm text-gray-100">
//           <span className="font-semibold">{c.author?.name || "Unknown"}</span>
//           <span className="text-xs text-gray-400 ml-2">
//             {new Date(c.created_time * 1000).toLocaleDateString()}
//           </span>
//         </p>

//         {/* message */}
//         <p className="text-sm text-gray-200 mt-1">{c.message}</p>
//       </div>
//     </div>
//   ))}

//   {commentsCursor && !commentsLoading && (
//     <button
//       onClick={async () => {
//         setCommentsLoading(true);
//         try {
//           const u = new URL("/api/fetch_fb_comments", window.location.origin);
//           u.searchParams.set("post_id", selectedPost.post_id);
//           u.searchParams.set("cursor", commentsCursor);
//           u.searchParams.set("limit", 20);

//           const res = await fetch(u);
//           const { comments: more } = await res.json();

//           setComments(prev => [...prev, ...more]);
//           // only show once
//           setCommentsCursor(null);
//         } catch (err) {
//           setCommentsError(err.message);
//         } finally {
//           setCommentsLoading(false);
//         }
//       }}
//       className="mt-2 px-4 py-2 bg-[#14B8A6] text-white rounded-md "
//     >
//       Load more comments
//     </button>
//   )}
// </div>

//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // src/components/FbPosts.jsx it works for comments
// "use client";

// import React, { useState, useEffect } from "react";
// import { getPostImageUrl } from "../lib/getPostImage";

// // ─── Helper Component: Renders a Facebook user’s avatar ───────────────────────
// function CommentAvatar({ author }) {
//   // If author.url exists, strip any trailing slash, then append "/picture?type=small"
//   // Otherwise fall back to Graph endpoint using author.id
//   const baseUrl = author.url
//     ? author.url.replace(/\/$/, "")
//     : `https://www.facebook.com/${author.id}`;

//   const avatarUrl = `${baseUrl}/picture?type=small`;

//   return (
//     <img
//       src={avatarUrl}
//       alt={`${author.name}'s profile picture`}
//       className="w-8 h-8 rounded-full object-cover flex-shrink-0 mr-3"
//       onError={(e) => {
//         e.currentTarget.onerror = null;
//         e.currentTarget.src = "/no-profile-pic-img.png";
//       }}
//     />
//   );
// }

// // ─── Main Component: Displays a paginated list of posts and a comments modal ─
// export default function FbPosts({ profileId, totalPages = 12 }) {
//   const POSTS_PER_PAGE = 5;

//   // ─── POSTS PAGINATION STATE ─────────────────────────────────────────────────
//   const [pageCursors, setPageCursors] = useState({ 1: null });
//   const [pageData, setPageData] = useState({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loadingPage, setLoadingPage] = useState(null);
//   const [error, setError] = useState(null);

//   // ─── MODAL STATE ────────────────────────────────────────────────────────────
//   const [showModal, setShowModal] = useState(false);
//   const [selectedPost, setSelectedPost] = useState(null);
//   const [showChildren, setShowChildren] = useState(false);

//   // ─── COMMENTS STATE ─────────────────────────────────────────────────────────
//   const [comments, setComments] = useState([]);
//   const [commentsCursor, setCommentsCursor] = useState(null);
//   const [commentsLoading, setCommentsLoading] = useState(false);
//   const [commentsError, setCommentsError] = useState(null);

//   // ─── RESET WHEN PROFILEID CHANGES ───────────────────────────────────────────
//   useEffect(() => {
//     if (!profileId) return;
//     setPageCursors({ 1: null });
//     setPageData({});
//     setCurrentPage(1);
//     setError(null);
//   }, [profileId]);

//   // ─── FETCH A PAGE OF POSTS ──────────────────────────────────────────────────
//   useEffect(() => {
//     if (!pageData[currentPage] && loadingPage !== currentPage) {
//       fetchPage(currentPage);
//     }
//   }, [currentPage, pageData, loadingPage]);

//   async function fetchPage(pageNum) {
//     if (pageData[pageNum] || loadingPage === pageNum) return;
//     setLoadingPage(pageNum);
//     setError(null);

//     try {
//       const cursor = pageCursors[pageNum] || null;
//       const url = new URL("/api/fb_posts", window.location.origin);
//       url.searchParams.set("profile_id", profileId);
//       if (cursor) url.searchParams.set("cursor", cursor);
//       url.searchParams.set("limit", POSTS_PER_PAGE);

//       const res = await fetch(url);
//       if (!res.ok) throw new Error(`Failed to fetch page ${pageNum}: ${res.statusText}`);
//       const { results: pagePosts = [], cursor: nextCursor = null } = await res.json();

//       setPageData((prev) => ({ ...prev, [pageNum]: pagePosts }));
//       if (nextCursor) {
//         setPageCursors((prev) => ({ ...prev, [pageNum + 1]: nextCursor }));
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Unknown error");
//     } finally {
//       setLoadingPage(null);
//     }
//   }

//   // ─── OPEN MODAL & LOAD COMMENTS FOR A POST ──────────────────────────────────
//   async function openModal(post) {
//     setSelectedPost(post);
//     setShowChildren(false);
//     setShowModal(true);

//     // RESET COMMENTS STATE
//     setComments([]);
//     setCommentsCursor(null);
//     setCommentsLoading(true);
//     setCommentsError(null);

//     try {
//       const url = new URL("/api/fetch_fb_comments", window.location.origin);
//       url.searchParams.set("post_id", post.post_id);

//       const res = await fetch(url);
//       if (!res.ok) throw new Error(res.statusText);

//       // Our API returns { results: [...], cursor: "…" }
//       const data = await res.json();
//       setComments(data.results || []);
//       setCommentsCursor(data.cursor || null);
//     } catch (err) {
//       console.error(err);
//       setCommentsError(err.message || "Failed to load comments");
//     } finally {
//       setCommentsLoading(false);
//     }
//   }

//   function closeModal() {
//     setShowModal(false);
//     setSelectedPost(null);
//   }

//   // ─── RENDER ─────────────────────────────────────────────────────────────────
//   const posts = pageData[currentPage] || [];
//   const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
//   const block = 5;
//   const firstBlock = pages.slice(0, block);
//   const lastPage = pages[pages.length - 1];

//   // Helper: format a UNIX timestamp (in seconds) to "M/D/YYYY"
//   const formatShortDate = (unixSeconds) => {
//     const d = new Date(unixSeconds * 1000);
//     return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
//   };

//   return (
//     <div className="space-y-4">
//       {/* ─── LOADING / ERROR MESSAGE FOR POSTS ─────────────────────────────── */}
//       {loadingPage === currentPage && (
//         <div className="flex justify-center items-center py-8">
//           <span className="text-gray-400">Loading page {currentPage}…</span>
//         </div>
//       )}
//       {error && (
//         <div className="py-8 px-4 bg-red-900 rounded-md">
//           <p className="text-red-200">Error: {error}</p>
//         </div>
//       )}

//       {/* ─── POSTS TABLE ────────────────────────────────────────────────────── */}
//       {!loadingPage && !error && (
//         <div className="overflow-x-auto">
//           <table className="table-auto w-full bg-gray-800 rounded-md overflow-hidden">
//             <thead className="bg-gray-700">
//               <tr>
//                 {["Image", "Post / Title", "Timestamp", "Comments", "Reactions", "View Details"].map(
//                   (h) => (
//                     <th key={h} className="px-4 py-2 text-left text-sm font-medium text-gray-200">
//                       {h}
//                     </th>
//                   )
//                 )}
//               </tr>
//             </thead>
//             <tbody>
//               {posts.map((post) => {
//                 const date = new Date(post.timestamp * 1000).toLocaleString();
//                 const src = getPostImageUrl(post);
//                 return (
//                   <tr key={post.post_id} className="border-b border-gray-700">
                    
//                     <td className="px-4 py-2">
//                       {src ? (
//                         <img src={src} alt="post" className="h-12 w-12 object-cover rounded-md" />
//                       ) : (
//                         <div className="h-12 w-12 bg-gray-600 flex items-center justify-center rounded-md">
//                           <span className="text-gray-400 text-xs">No Image</span>
//                         </div>
//                       )}
//                     </td>
//                     <td className="px-4 py-2 text-gray-100 text-sm whitespace-nowrap overflow-hidden truncate max-w-xs">
//                       {post.message || "(No message)"}
//                     </td>
//                     <td className="px-4 py-2 text-gray-300 text-sm">{date}</td>
//                     <td className="px-4 py-2 text-center text-gray-200 text-sm">
//                       {post.comments_count}
//                     </td>
//                     <td className="px-4 py-2 text-center text-gray-200 text-sm">
//                       {post.reactions_count}
//                     </td>
//                     <td className="px-4 py-2 text-center">
//                       <button onClick={() => openModal(post)}>
//                         <img src="/eye.png" alt="View" className="h-6 w-6" />
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* ─── PAGINATION CONTROLS ─────────────────────────────────────────────── */}
//       <div className="flex justify-center items-center space-x-1">
//         <button
//           onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//           className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
//         >
//           &lt;
//         </button>
//         {firstBlock.map((n) => (
//           <button
//             key={n}
//             onClick={() => setCurrentPage(n)}
//             className={`w-8 h-8 flex items-center justify-center border ${
//               n === currentPage
//                 ? "bg-teal-500 border-teal-500 text-white"
//                 : "border-gray-600 text-gray-200 hover:bg-gray-700"
//             }`}
//           >
//             {n}
//           </button>
//         ))}
//         <span className="px-1 text-gray-200">…</span>
//         <button
//           onClick={() => setCurrentPage(lastPage)}
//           className={`w-8 h-8 flex items-center justify-center border ${
//             lastPage === currentPage
//               ? "bg-teal-500 border-teal-500 text-white"
//               : "border-gray-600 text-gray-200 hover:bg-gray-700"
//           }`}
//         >
//           {lastPage}
//         </button>
//         <button
//           onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
//           className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
//         >
//           &gt;
//         </button>
//       </div>

//       {/* ─── MODAL ────────────────────────────────────────────────────────────── */}
//       {showModal && selectedPost && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-[#1f2937] text-white p-4 md:p-6 rounded-md relative w-[90%] max-w-[500px] max-h-[80vh] overflow-y-auto">
//             <div className="flex justify-between items-center">
//               <p className="text-gray-400 text-sm mb-2">
//                 {new Date(selectedPost.timestamp * 1000).toLocaleString()}
//               </p>
//               <button onClick={closeModal} className="text-[16px] px-2 py-1 bg-[#000000] font-bold">
//                 X
//               </button>
//             </div>

//             {/* ─── POST MEDIA ────────────────────────────────────────────────── */}
//             <div className="w-full h-[250px] mb-4 flex items-center justify-center">
//               {selectedPost.video_files?.video_hd_file ||
//               selectedPost.video_files?.video_sd_file ? (
//                 <video
//                   src={selectedPost.video_files.video_hd_file || selectedPost.video_files.video_sd_file}
//                   controls
//                   className="h-full w-full object-contain rounded-md"
//                 />
//               ) : (
//                 <img
//                   src={getPostImageUrl(selectedPost)}
//                   alt="Post media"
//                   className="h-full w-full object-contain rounded-md"
//                 />
//               )}
//             </div>

//             <div className="text-[14px] mt-4 mb-2 text-gray-200">
//               {selectedPost.message || "(No message)"}
//             </div>

//             {/* ─── CHILD POSTS (IF ANY) ─────────────────────────────────────── */}
//             {selectedPost.album_preview?.length > 1 && (
//               <button
//                 onClick={() => setShowChildren((c) => !c)}
//                 className="mb-4 px-4 py-2 bg-[#14B8A6] text-white rounded-md"
//               >
//                 {showChildren ? "Hide Child Posts" : "View Child Posts"}
//               </button>
//             )}
//             {showChildren && selectedPost.album_preview && (
//               <div className="flex space-x-2 overflow-x-auto mb-4">
//                 {selectedPost.album_preview.map((item, idx) => (
//                   <img
//                     key={idx}
//                     src={item.image_file_uri}
//                     alt={`Child ${idx + 1}`}
//                     className="flex-shrink-0 w-[90px] h-[90px] object-cover rounded-md"
//                   />
//                 ))}
//               </div>
//             )}

//             {/* ─── COMMENTS SECTION ──────────────────────────────────────────── */}
//             <div>
//               <h3 className="font-medium mb-2">Comments</h3>

//               {commentsLoading && <p className="text-gray-400">Loading comments…</p>}
//               {commentsError && <p className="text-red-400">{commentsError}</p>}
//               {!commentsLoading && comments.length === 0 && (
//                 <p className="text-gray-500">No comments yet.</p>
//               )}

//               {comments.map((c) => (
//                 <div key={c.comment_id} className="flex mb-3 p-2 bg-gray-800 rounded">
//                   {/* ─── AVATAR ───────────────────────────────────────────── */}
//                   <CommentAvatar author={c.author} />

//                   {/* ─── NAME, DATE, & MESSAGE ───────────────────────────── */}
//                   <div className="flex-1">
//                     <p className="text-sm text-gray-100">
//                       <span className="font-semibold">{c.author.name}</span>{" "}
//                       <span className="text-xs text-gray-400">
//                         ({formatShortDate(c.created_time)}):
//                       </span>
//                     </p>
//                     <p className="text-sm text-gray-200 mt-1">{c.message}</p>
//                   </div>
//                 </div>
//               ))}

//               {commentsCursor && !commentsLoading && (
//                 <button
//                   onClick={async () => {
//                     setCommentsLoading(true);
//                     try {
//                       const u = new URL("/api/fetch_fb_comments", window.location.origin);
//                       u.searchParams.set("post_id", selectedPost.post_id);
//                       u.searchParams.set("after", commentsCursor);

//                       const res = await fetch(u);
//                       const data = await res.json();
//                       const more = data.results || [];
//                       const nextCursor = data.cursor || null;

//                       setComments((prev) => [...prev, ...more]);
//                       setCommentsCursor(nextCursor);
//                     } catch (err) {
//                       console.error(err);
//                       setCommentsError(err.message);
//                     } finally {
//                       setCommentsLoading(false);
//                     }
//                   }}
//                   className="mt-2 px-4 py-2 bg-[#14B8A6] text-white rounded-md hover:bg-[#0e7663]"
//                 >
//                   Load more comments
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }






// // src/components/FbPosts.jsx
// "use client";

// import React, { useState, useEffect } from "react";
// import { getPostImageUrl } from "../lib/getPostImage";

// // ─── Helper Component: Renders a Facebook user’s avatar ───────────────────────
// function CommentAvatar({ author }) {
//   const baseUrl = author.url
//     ? author.url.replace(/\/$/, "")
//     : `https://www.facebook.com/${author.id}`;
//   const avatarUrl = `${baseUrl}/picture?type=small`;
//   return (
//     <img
//       src={avatarUrl}
//       alt={`${author.name}'s profile picture`}
//       className="w-8 h-8 rounded-full object-cover flex-shrink-0 mr-3"
//       onError={(e) => {
//         e.currentTarget.onerror = null;
//         e.currentTarget.src = "/no-profile-pic-img.png";
//       }}
//     />
//   );
// }

// // ─── Main Component: Displays a paginated list of posts and a comments modal ─
// export default function FbPosts({ profileId, totalPages = 12 }) {
//   const POSTS_PER_PAGE = 5;

//   // ─── POSTS PAGINATION STATE ─────────────────────────────────────────────────
//   const [pageCursors, setPageCursors] = useState({ 1: null });
//   const [pageData, setPageData] = useState({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loadingPage, setLoadingPage] = useState(null);
//   const [error, setError] = useState(null);

//   // ─── MODAL STATE ────────────────────────────────────────────────────────────
//   const [showModal, setShowModal] = useState(false);
//   const [selectedPost, setSelectedPost] = useState(null);
//   const [showChildren, setShowChildren] = useState(false);

//   // ─── COMMENTS STATE ─────────────────────────────────────────────────────────
//   const [comments, setComments] = useState([]);
//   const [commentsCursor, setCommentsCursor] = useState(null);
//   const [commentsLoading, setCommentsLoading] = useState(false);
//   const [commentsError, setCommentsError] = useState(null);

//   // ─── RESET WHEN PROFILEID CHANGES ───────────────────────────────────────────
//   useEffect(() => {
//     if (!profileId) return;
//     setPageCursors({ 1: null });
//     setPageData({});
//     setCurrentPage(1);
//     setError(null);
//   }, [profileId]);

//   // ─── FETCH A PAGE OF POSTS ──────────────────────────────────────────────────
//   useEffect(() => {
//     if (!pageData[currentPage] && loadingPage !== currentPage) {
//       fetchPage(currentPage);
//     }
//   }, [currentPage, pageData, loadingPage]);

//   async function fetchPage(pageNum) {
//     if (pageData[pageNum] || loadingPage === pageNum) return;
//     setLoadingPage(pageNum);
//     setError(null);

//     try {
//       const cursor = pageCursors[pageNum] || null;
//       const url = new URL("/api/fb_posts", window.location.origin);
//       url.searchParams.set("profile_id", profileId);
//       if (cursor) url.searchParams.set("cursor", cursor);
//       url.searchParams.set("limit", POSTS_PER_PAGE);

//       const res = await fetch(url);
//       if (!res.ok) throw new Error(`Failed to fetch page ${pageNum}: ${res.statusText}`);
//       const { results: pagePosts = [], cursor: nextCursor = null } = await res.json();

//       setPageData((prev) => ({ ...prev, [pageNum]: pagePosts }));
//       if (nextCursor) {
//         setPageCursors((prev) => ({ ...prev, [pageNum + 1]: nextCursor }));
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Unknown error");
//     } finally {
//       setLoadingPage(null);
//     }
//   }

//   // ─── OPEN MODAL & LOAD COMMENTS FOR A POST ──────────────────────────────────
//   async function openModal(post) {
//     setSelectedPost(post);
//     setShowChildren(false);
//     setShowModal(true);

//     // RESET COMMENTS STATE
//     setComments([]);
//     setCommentsCursor(null);
//     setCommentsLoading(true);
//     setCommentsError(null);

//     try {
//       const url = new URL("/api/fetch_fb_comments", window.location.origin);
//       url.searchParams.set("post_id", post.post_id);

//       const res = await fetch(url);
//       if (!res.ok) throw new Error(res.statusText);

//       const data = await res.json();
//       setComments(data.results || []);
//       setCommentsCursor(data.cursor || null);
//     } catch (err) {
//       console.error(err);
//       setCommentsError(err.message || "Failed to load comments");
//     } finally {
//       setCommentsLoading(false);
//     }
//   }

//   function closeModal() {
//     setShowModal(false);
//     setSelectedPost(null);
//   }

//   // ─── RENDER ─────────────────────────────────────────────────────────────────
//   const posts = pageData[currentPage] || [];
//   const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
//   const block = 5;
//   const firstBlock = pages.slice(0, block);
//   const lastPage = pages[pages.length - 1];

//   // Helper: format a UNIX timestamp (in seconds) to "M/D/YYYY"
//   const formatShortDate = (unixSeconds) => {
//     const d = new Date(unixSeconds * 1000);
//     return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
//   };

//   return (
//     <div className="space-y-4">
//       {/* ─── LOADING / ERROR MESSAGE FOR POSTS ─────────────────────────────── */}
//       {loadingPage === currentPage && (
//         <div className="flex justify-center items-center py-8">
//           <span className="text-gray-400">Loading page {currentPage}…</span>
//         </div>
//       )}
//       {error && (
//         <div className="py-8 px-4 bg-red-900 rounded-md">
//           <p className="text-red-200">Error: {error}</p>
//         </div>
//       )}

//       {/* ─── POSTS TABLE ────────────────────────────────────────────────────── */}
//       {!loadingPage && !error && (
//         <div className="overflow-x-auto">
//           <table className="table-auto w-full bg-gray-800 rounded-md overflow-hidden">
//             <thead className="bg-gray-700">
//               <tr>
//                 {["Image", "Post / Title", "Labels (%)", "Timestamp", "Comments", "Reactions", "View Details"].map(
//                   (h) => (
//                     <th key={h} className="px-4 py-2 text-left text-sm font-medium text-gray-200">
//                       {h}
//                     </th>
//                   )
//                 )}
//               </tr>
//             </thead>
//             <tbody>
//               {posts.map((post) => {
//                 const date = new Date(post.timestamp * 1000).toLocaleString();
//                 const src = getPostImageUrl(post);

//                 return (
//                   <tr key={post.post_id} className="border-b border-gray-700">
//                     {/* ─── IMAGE CELL ─────────────────────────────────────────── */}
//                     <td className="px-4 py-2">
//                       {src ? (
//                         <img src={src} alt="post" className="h-12 w-12 object-cover rounded-md" />
//                       ) : (
//                         <div className="h-12 w-12 bg-gray-600 flex items-center justify-center rounded-md">
//                           <span className="text-gray-400 text-xs">No Image</span>
//                         </div>
//                       )}
//                     </td>

//                     {/* ─── MESSAGE / TITLE CELL ───────────────────────────────────── */}
//                     <td className="px-4 py-2 text-gray-100 text-sm whitespace-nowrap overflow-hidden truncate max-w-xs">
//                       {post.message || "(No message)"}
//                     </td>

//                     {/* ─── LABELS (%) CELL ──────────────────────────────────── */}
//                     <td className="px-4 py-2 space-x-1">
//                       {/*
//                         post.labels is an array like ["nudity-explicit", "weapon"] or ["safe"].
//                         post.scores has numeric values between 0 and 1.
//                         We'll render each label with its percentage.
//                       */}
//                       {post.labels?.map((label) => {
//                         let displayText = label;
//                         let bgColor = "bg-red-600"; // default “alert” color
//                         let pct = 0;

//                         if (label === "safe") {
//                           // show safe as 100% if it truly was labeled “safe”
//                           displayText = "Safe";
//                           bgColor = "bg-green-600";
//                           pct = 100;
//                         } else if (label === "no_image") {
//                           displayText = "No Image";
//                           bgColor = "bg-gray-500";
//                           pct = 0;
//                         } else if (label === "analysis_error") {
//                           displayText = "Error";
//                           bgColor = "bg-yellow-500";
//                           pct = 0;
//                         } else {
//                           // for any other label (e.g. “nudity-explicit”), find its raw score:
//                           //    “nudity-explicit” → scores.nudity_raw
//                           //    “nudity-partial” → scores.nudity_partial
//                           //    “weapon” → scores.weapon
//                           //    “alcohol” → scores.alcohol
//                           //    “drugs” → scores.drugs
//                           //    “offensive” → scores.offensive_prob
//                           switch (label) {
//                             case "nudity-explicit":
//                               pct = Math.round((post.scores?.nudity_raw ?? 0) * 100);
//                               break;
//                             case "nudity-partial":
//                               pct = Math.round((post.scores?.nudity_partial ?? 0) * 100);
//                               break;
//                             case "weapon":
//                               pct = Math.round((post.scores?.weapon ?? 0) * 100);
//                               break;
//                             case "alcohol":
//                               pct = Math.round((post.scores?.alcohol ?? 0) * 100);
//                               break;
//                             case "drugs":
//                               pct = Math.round((post.scores?.drugs ?? 0) * 100);
//                               break;
//                             case "offensive":
//                               pct = Math.round((post.scores?.offensive_prob ?? 0) * 100);
//                               break;
//                             default:
//                               pct = 0;
//                           }
//                           displayText = `${label.replace("-", " ")} (${pct}%)`;
//                           // you can choose colors per label if you want; for simplicity:
//                           bgColor = label === "offensive" ? "bg-yellow-500" : "bg-red-600";
//                         }

//                         return (
//                           <span
//                             key={label}
//                             className={`${bgColor} text-white text-xs font-semibold px-2 py-1 rounded-full`}
//                           >
//                             {displayText}
//                           </span>
//                         );
//                       })}
//                     </td>

//                     {/* ─── TIMESTAMP CELL ─────────────────────────────────────── */}
//                     <td className="px-4 py-2 text-gray-300 text-sm">{date}</td>

//                     {/* ─── COMMENTS COUNT CELL ───────────────────────────────── */}
//                     <td className="px-4 py-2 text-center text-gray-200 text-sm">
//                       {post.comments_count}
//                     </td>

//                     {/* ─── REACTIONS COUNT CELL ───────────────────────────────── */}
//                     <td className="px-4 py-2 text-center text-gray-200 text-sm">
//                       {post.reactions_count}
//                     </td>

//                     {/* ─── VIEW DETAILS BUTTON CELL ───────────────────────────── */}
//                     <td className="px-4 py-2 text-center">
//                       <button onClick={() => openModal(post)}>
//                         <img src="/eye.png" alt="View" className="h-6 w-6" />
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* ─── PAGINATION CONTROLS ─────────────────────────────────────────────── */}
//       <div className="flex justify-center items-center space-x-1">
//         <button
//           onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//           className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
//         >
//           &lt;
//         </button>
//         {firstBlock.map((n) => (
//           <button
//             key={n}
//             onClick={() => setCurrentPage(n)}
//             className={`w-8 h-8 flex items-center justify-center border ${
//               n === currentPage
//                 ? "bg-teal-500 border-teal-500 text-white"
//                 : "border-gray-600 text-gray-200 hover:bg-gray-700"
//             }`}
//           >
//             {n}
//           </button>
//         ))}
//         <span className="px-1 text-gray-200">…</span>
//         <button
//           onClick={() => setCurrentPage(lastPage)}
//           className={`w-8 h-8 flex items-center justify-center border ${
//             lastPage === currentPage
//               ? "bg-teal-500 border-teal-500 text-white"
//               : "border-gray-600 text-gray-200 hover:bg-gray-700"
//           }`}
//         >
//           {lastPage}
//         </button>
//         <button
//           onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
//           className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
//         >
//           &gt;
//         </button>
//       </div>

//       {/* ─── MODAL ────────────────────────────────────────────────────────────── */}
//       {showModal && selectedPost && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-[#1f2937] text-white p-4 md:p-6 rounded-md relative w-[90%] max-w-[500px] max-h-[80vh] overflow-y-auto">
//             <div className="flex justify-between items-center">
//               <p className="text-gray-400 text-sm mb-2">
//                 {new Date(selectedPost.timestamp * 1000).toLocaleString()}
//               </p>
//               <button onClick={closeModal} className="text-[16px] px-2 py-1 bg-[#000000] font-bold">
//                 X
//               </button>
//             </div>

//             {/* ─── POST MEDIA ────────────────────────────────────────────────── */}
//             <div className="w-full h-[250px] mb-4 flex items-center justify-center">
//               {selectedPost.video_files?.video_hd_file ||
//               selectedPost.video_files?.video_sd_file ? (
//                 <video
//                   src={selectedPost.video_files.video_hd_file || selectedPost.video_files.video_sd_file}
//                   controls
//                   className="h-full w-full object-contain rounded-md"
//                 />
//               ) : (
//                 <img
//                   src={getPostImageUrl(selectedPost)}
//                   alt="Post media"
//                   className="h-full w-full object-contain rounded-md"
//                 />
//               )}
//             </div>

//             {/* ─── LABELS (%) IN MODAL ───────────────────────────────────────────── */}
//             <div className="mb-4">
//               <h4 className="text-gray-300 text-sm mb-1">Detected Labels (%)</h4>
//               <div className="flex flex-wrap gap-2">
//                 {selectedPost.labels?.map((label) => {
//                   let displayText = label;
//                   let bgColor = "bg-red-600";
//                   let pct = 0;

//                   if (label === "safe") {
//                     displayText = "Safe";
//                     bgColor = "bg-green-600";
//                     pct = 100;
//                   } else if (label === "no_image") {
//                     displayText = "No Image";
//                     bgColor = "bg-gray-500";
//                     pct = 0;
//                   } else if (label === "analysis_error") {
//                     displayText = "Error";
//                     bgColor = "bg-yellow-500";
//                     pct = 0;
//                   } else {
//                     switch (label) {
//                       case "nudity-explicit":
//                         pct = Math.round((selectedPost.scores?.nudity_raw ?? 0) * 100);
//                         break;
//                       case "nudity-partial":
//                         pct = Math.round((selectedPost.scores?.nudity_partial ?? 0) * 100);
//                         break;
//                       case "weapon":
//                         pct = Math.round((selectedPost.scores?.weapon ?? 0) * 100);
//                         break;
//                       case "alcohol":
//                         pct = Math.round((selectedPost.scores?.alcohol ?? 0) * 100);
//                         break;
//                       case "drugs":
//                         pct = Math.round((selectedPost.scores?.drugs ?? 0) * 100);
//                         break;
//                       case "offensive":
//                         pct = Math.round((selectedPost.scores?.offensive_prob ?? 0) * 100);
//                         break;
//                       default:
//                         pct = 0;
//                     }
//                     displayText = `${label.replace("-", " ")} (${pct}%)`;
//                     bgColor = label === "offensive" ? "bg-yellow-500" : "bg-red-600";
//                   }

//                   return (
//                     <span
//                       key={label}
//                       className={`${bgColor} text-white text-xs font-semibold px-2 py-1 rounded-full`}
//                     >
//                       {displayText}
//                     </span>
//                   );
//                 })}
//               </div>
//             </div>

//             <div className="text-[14px] mt-4 mb-2 text-gray-200">
//               {selectedPost.message || "(No message)"}
//             </div>

//             {/* ─── CHILD POSTS (IF ANY) ─────────────────────────────────────── */}
//             {selectedPost.album_preview?.length > 1 && (
//               <button
//                 onClick={() => setShowChildren((c) => !c)}
//                 className="mb-4 px-4 py-2 bg-[#14B8A6] text-white rounded-md"
//               >
//                 {showChildren ? "Hide Child Posts" : "View Child Posts"}
//               </button>
//             )}
//             {showChildren && selectedPost.album_preview && (
//               <div className="flex space-x-2 overflow-x-auto mb-4">
//                 {selectedPost.album_preview.map((item, idx) => (
//                   <img
//                     key={idx}
//                     src={item.image_file_uri}
//                     alt={`Child ${idx + 1}`}
//                     className="flex-shrink-0 w-[90px] h-[90px] object-cover rounded-md"
//                   />
//                 ))}
//               </div>
//             )}

//             {/* ─── COMMENTS SECTION ──────────────────────────────────────────── */}
//             <div>
//               <h3 className="font-medium mb-2">Comments</h3>

//               {commentsLoading && <p className="text-gray-400">Loading comments…</p>}
//               {commentsError && <p className="text-red-400">{commentsError}</p>}
//               {!commentsLoading && comments.length === 0 && (
//                 <p className="text-gray-500">No comments yet.</p>
//               )}

//               {comments.map((c) => (
//                 <div key={c.comment_id} className="flex mb-3 p-2 bg-gray-800 rounded">
//                   <CommentAvatar author={c.author} />
//                   <div className="flex-1">
//                     <p className="text-sm text-gray-100">
//                       <span className="font-semibold">{c.author.name}</span>{" "}
//                       <span className="text-xs text-gray-400">
//                         ({formatShortDate(c.created_time)}):
//                       </span>
//                     </p>
//                     <p className="text-sm text-gray-200 mt-1">{c.message}</p>
//                   </div>
//                 </div>
//               ))}

//               {commentsCursor && !commentsLoading && (
//                 <button
//                   onClick={async () => {
//                     setCommentsLoading(true);
//                     try {
//                       const u = new URL("/api/fetch_fb_comments", window.location.origin);
//                       u.searchParams.set("post_id", selectedPost.post_id);
//                       u.searchParams.set("after", commentsCursor);

//                       const res = await fetch(u);
//                       const data = await res.json();
//                       const more = data.results || [];
//                       const nextCursor = data.cursor || null;

//                       setComments((prev) => [...prev, ...more]);
//                       setCommentsCursor(nextCursor);
//                     } catch (err) {
//                       console.error(err);
//                       setCommentsError(err.message);
//                     } finally {
//                       setCommentsLoading(false);
//                     }
//                   }}
//                   className="mt-2 px-4 py-2 bg-[#14B8A6] text-white rounded-md hover:bg-[#0e7663]"
//                 >
//                   Load more comments
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// // src/components/FbPosts.jsx (coorec code with siht engine ananlysis)
// "use client";

// import React, { useState, useEffect } from "react";
// import { getPostImageUrl } from "../lib/getPostImage";


// // function CommentAvatar({ author }) {
// //   // If author.url exists, strip any trailing slash and append "/picture?type=small"
// //   // Otherwise show a default placeholder image.
// //   let avatarUrl = "/no-profile-pic-img.png"; // your placeholder

// //   if (author.url) {
// //     // e.g. "https://www.facebook.com/Some.User123"
// //     const cleanUrl = author.url.replace(/\/$/, "");
// //     avatarUrl = `${cleanUrl}/picture?type=small`;
// //   }

// //   return (
// //     <img
// //       src={avatarUrl}
// //       alt={`${author.name}'s profile picture`}
// //       className="w-8 h-8 rounded-full object-cover flex-shrink-0 mr-3"
// //       onError={(e) => {
// //         // If the Facebook URL failed (404 or whatever), fall back to placeholder
// //         e.currentTarget.onerror = null;
// //         e.currentTarget.src = "/no-profile-pic-img.png";
// //       }}
// //     />
// //   );
// // }


// function CommentAvatar({ author }) {
//   // Default placeholder if nothing else works
//   let avatarUrl = "/no-profile-pic-img.png";

//   if (author.id) {
//     // Use the Graph‐API endpoint (more reliable than scraping “author.url” directly)
//     avatarUrl = `https://graph.facebook.com/${author.id}/picture?type=small`;
//   } else if (author.url) {
//     // Fallback: try building from their profile‐page URL
//     const cleanUrl = author.url.replace(/\/$/, "");
//     avatarUrl = `${cleanUrl}/picture?type=small`;
//   }

//   return (
//     <img
//       src={avatarUrl}
//       alt={`${author.name || "User"}’s profile picture`}
//       className="w-8 h-8 rounded-full object-cover flex-shrink-0 mr-3"
//       onError={(e) => {
//         // If that fails, fall back to the local placeholder
//         e.currentTarget.onerror = null;
//         e.currentTarget.src = "/no-profile-pic-img.png";
//       }}
//     />
//   );
// }

// // ─── Main Component: Displays a paginated list of posts and a comments modal ─
// export default function FbPosts({ profileId, totalPages = 12 }) {
//   const POSTS_PER_PAGE = 5;

//   // ─── POSTS PAGINATION STATE ─────────────────────────────────────────────────
//   const [pageCursors, setPageCursors] = useState({ 1: null });
//   const [pageData, setPageData] = useState({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loadingPage, setLoadingPage] = useState(null);
//   const [error, setError] = useState(null);

//   // ─── MODAL STATE ────────────────────────────────────────────────────────────
//   const [showModal, setShowModal] = useState(false);
//   const [selectedPost, setSelectedPost] = useState(null);
//   const [showChildren, setShowChildren] = useState(false);

//   // ─── COMMENTS STATE ─────────────────────────────────────────────────────────
//   const [comments, setComments] = useState([]);
//   const [commentsCursor, setCommentsCursor] = useState(null);
//   const [commentsLoading, setCommentsLoading] = useState(false);
//   const [commentsError, setCommentsError] = useState(null);

//   // ─── RESET WHEN PROFILEID CHANGES ───────────────────────────────────────────
//   useEffect(() => {
//     if (!profileId) return;
//     setPageCursors({ 1: null });
//     setPageData({});
//     setCurrentPage(1);
//     setError(null);
//   }, [profileId]);

//   // ─── FETCH A PAGE OF POSTS ──────────────────────────────────────────────────
//   useEffect(() => {
//     if (!pageData[currentPage] && loadingPage !== currentPage) {
//       fetchPage(currentPage);
//     }
//   }, [currentPage, pageData, loadingPage]);

//   async function fetchPage(pageNum) {
//     if (pageData[pageNum] || loadingPage === pageNum) return;
//     setLoadingPage(pageNum);
//     setError(null);

//     try {
//       const cursor = pageCursors[pageNum] || null;
//       const url = new URL("/api/fb_posts", window.location.origin);
//       url.searchParams.set("profile_id", profileId);
//       if (cursor) url.searchParams.set("cursor", cursor);
//       url.searchParams.set("limit", POSTS_PER_PAGE);

//       const res = await fetch(url);
//       if (!res.ok) throw new Error(`Failed to fetch page ${pageNum}: ${res.statusText}`);
//       const { results: pagePosts = [], cursor: nextCursor = null } = await res.json();

//       setPageData((prev) => ({ ...prev, [pageNum]: pagePosts }));
//       if (nextCursor) {
//         setPageCursors((prev) => ({ ...prev, [pageNum + 1]: nextCursor }));
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Unknown error");
//     } finally {
//       setLoadingPage(null);
//     }
//   }

//   // ─── OPEN MODAL & LOAD COMMENTS FOR A POST ──────────────────────────────────
//   async function openModal(post) {
//     setSelectedPost(post);
//     setShowChildren(false);
//     setShowModal(true);

//     // RESET COMMENTS STATE
//     setComments([]);
//     setCommentsCursor(null);
//     setCommentsLoading(true);
//     setCommentsError(null);

//     try {
//       const url = new URL("/api/fetch_fb_comments", window.location.origin);
//       url.searchParams.set("post_id", post.post_id);

//       const res = await fetch(url);
//       if (!res.ok) throw new Error(res.statusText);

//       const data = await res.json();
//       setComments(data.results || []);
//       setCommentsCursor(data.cursor || null);
//     } catch (err) {
//       console.error(err);
//       setCommentsError(err.message || "Failed to load comments");
//     } finally {
//       setCommentsLoading(false);
//     }
//   }

//   function closeModal() {
//     setShowModal(false);
//     setSelectedPost(null);
//   }

//   // ─── HELPER: Pick the first “bad” label (ignore “safe”, “no_image”, “analysis_error”) ─
//   function firstBadLabel(labels = []) {
//     return labels.find(
//       (l) => l !== "safe" && l !== "no_image" && l !== "analysis_error"
//     );
//   }

//   // ─── RENDER ─────────────────────────────────────────────────────────────────
//   const posts = pageData[currentPage] || [];
//   const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
//   const block = 5;
//   const firstBlock = pages.slice(0, block);
//   const lastPage = pages[pages.length - 1];

//   // Helper: format a UNIX timestamp (in seconds) to "M/D/YYYY"
//   const formatShortDate = (unixSeconds) => {
//     const d = new Date(unixSeconds * 1000);
//     return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
//   };

//   return (
//     <div className="space-y-4">
//       {/* ─── LOADING / ERROR MESSAGE FOR POSTS ─────────────────────────────── */}
//       {loadingPage === currentPage && (
//         <div className="flex justify-center items-center py-8">
//           <span className="text-gray-400">Loading page {currentPage}…</span>
//         </div>
//       )}
//       {error && (
//         <div className="py-8 px-4 bg-red-900 rounded-md">
//           <p className="text-red-200">Error: {error}</p>
//         </div>
//       )}

//       {/* ─── POSTS TABLE ────────────────────────────────────────────────────── */}
//       {!loadingPage && !error && (
//         <div className="overflow-x-auto">
//           <table className="table-auto w-full bg-gray-800 rounded-md overflow-hidden">
//             <thead className="bg-gray-700">
//               <tr>
//                 {["Image", "Post / Title", "Timestamp", "Comments", "Reactions", "View Details"].map(
//                   (h) => (
//                     <th key={h} className="px-4 py-2 text-left text-sm font-medium text-gray-200">
//                       {h}
//                     </th>
//                   )
//                 )}
//               </tr>
//             </thead>
//             <tbody>
//               {posts.map((post) => {
//                 const date = new Date(post.timestamp * 1000).toLocaleString();
//                 const src = getPostImageUrl(post);
//                 const badLabel = firstBadLabel(post.labels);

//                 return (
//                   <tr key={post.post_id} className="border-b border-gray-700">
//                     {/* ─── IMAGE CELL ─────────────────────────────────────────── */}
//                     <td className="px-4 py-2">
//                       <div className="relative inline-block">
//                         {src ? (
//                           <img
//                             src={src}
//                             alt="post"
//                             className="h-12 w-12 object-cover rounded-md"
//                           />
//                         ) : (
//                           <div className="h-12 w-12 bg-gray-600 flex items-center justify-center rounded-md">
//                             <span className="text-gray-400 text-xs">No Image</span>
//                           </div>
//                         )}

//                         {badLabel && (
//                           <span className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-1 py-[2px] rounded-br-md">
//                             {badLabel.replace("-", " ")}
//                           </span>
//                         )}
//                       </div>
//                     </td>

//                     {/* ─── MESSAGE / TITLE CELL ───────────────────────────────────── */}
//                     <td className="px-4 py-2 text-gray-100 text-sm whitespace-nowrap overflow-hidden truncate max-w-xs">
//                       {post.message || "(No message)"}
//                     </td>

//                     {/* ─── TIMESTAMP CELL ─────────────────────────────────────── */}
//                     <td className="px-4 py-2 text-gray-300 text-sm">{date}</td>

//                     {/* ─── COMMENTS COUNT CELL ───────────────────────────────── */}
//                     <td className="px-4 py-2 text-center text-gray-200 text-sm">
//                       {post.comments_count}
//                     </td>

//                     {/* ─── REACTIONS COUNT CELL ───────────────────────────────── */}
//                     <td className="px-4 py-2 text-center text-gray-200 text-sm">
//                       {post.reactions_count}
//                     </td>

//                     {/* ─── VIEW DETAILS BUTTON CELL ───────────────────────────── */}
//                     <td className="px-4 py-2 text-center">
//                       <button onClick={() => openModal(post)}>
//                         <img src="/eye.png" alt="View" className="h-6 w-6" />
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* ─── PAGINATION CONTROLS ─────────────────────────────────────────────── */}
//       <div className="flex justify-center items-center space-x-1">
//         <button
//           onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//           className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
//         >
//           &lt;
//         </button>
//         {firstBlock.map((n) => (
//           <button
//             key={n}
//             onClick={() => setCurrentPage(n)}
//             className={`w-8 h-8 flex items-center justify-center border ${
//               n === currentPage
//                 ? "bg-teal-500 border-teal-500 text-white"
//                 : "border-gray-600 text-gray-200 hover:bg-gray-700"
//             }`}
//           >
//             {n}
//           </button>
//         ))}
//         <span className="px-1 text-gray-200">…</span>
//         <button
//           onClick={() => setCurrentPage(lastPage)}
//           className={`w-8 h-8 flex items-center justify-center border ${
//             lastPage === currentPage
//               ? "bg-teal-500 border-teal-500 text-white"
//               : "border-gray-600 text-gray-200 hover:bg-gray-700"
//           }`}
//         >
//           {lastPage}
//         </button>
//         <button
//           onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
//           className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
//         >
//           &gt;
//         </button>
//       </div>

//       {/* ─── MODAL ────────────────────────────────────────────────────────────── */}
//       {showModal && selectedPost && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-[#1f2937] text-white p-4 md:p-6 rounded-md relative w-[90%] max-w-[500px] max-h-[80vh] overflow-y-auto">
//             <div className="flex justify-between items-center">
//               <p className="text-gray-400 text-sm mb-2">
//                 {new Date(selectedPost.timestamp * 1000).toLocaleString()}
//               </p>
//               <button onClick={closeModal} className="text-[16px] px-2 py-1 bg-[#000000] font-bold">
//                 X
//               </button>
//             </div>

//             {/* ─── POST MEDIA ────────────────────────────────────────────────── */}
//             <div className="w-full h-[250px] mb-4 flex items-center justify-center relative">
//               {selectedPost.video_files?.video_hd_file ||
//               selectedPost.video_files?.video_sd_file ? (
//                 <video
//                   src={selectedPost.video_files.video_hd_file || selectedPost.video_files.video_sd_file}
//                   controls
//                   className="h-full w-full object-contain rounded-md"
//                 />
//               ) : (
//                 <img
//                   src={getPostImageUrl(selectedPost)}
//                   alt="Post media"
//                   className="h-full w-full object-contain rounded-md"
//                 />
//               )}
//               {/* If there is a “bad” label, show it on top of modal image too */}
//               {firstBadLabel(selectedPost.labels) && (
//                 <span className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-1 py-[2px] rounded-br-md">
//                   {firstBadLabel(selectedPost.labels).replace("-", " ")}
//                 </span>
//               )}
//             </div>

//             <div className="text-[14px] mt-4 mb-2 text-gray-200">
//               {selectedPost.message || "(No message)"}
//             </div>

//             {/* ─── CHILD POSTS (IF ANY) ─────────────────────────────────────── */}
//             {selectedPost.album_preview?.length > 1 && (
//               <button
//                 onClick={() => setShowChildren((c) => !c)}
//                 className="mb-4 px-4 py-2 bg-[#14B8A6] text-white rounded-md"
//               >
//                 {showChildren ? "Hide Child Posts" : "View Child Posts"}
//               </button>
//             )}
//             {showChildren && selectedPost.album_preview && (
//               <div className="flex space-x-2 overflow-x-auto mb-4">
//                 {selectedPost.album_preview.map((item, idx) => (
//                   <img
//                     key={idx}
//                     src={item.image_file_uri}
//                     alt={`Child ${idx + 1}`}
//                     className="flex-shrink-0 w-[90px] h-[90px] object-cover rounded-md"
//                   />
//                 ))}
//               </div>
//             )}

//             {/* ─── COMMENTS SECTION ──────────────────────────────────────────── */}
//             <div>
//               <h3 className="font-medium mb-2">Comments</h3>

//               {commentsLoading && <p className="text-gray-400">Loading comments…</p>}
//               {commentsError && <p className="text-red-400">{commentsError}</p>}
//               {!commentsLoading && comments.length === 0 && (
//                 <p className="text-gray-500">No comments yet.</p>
//               )}

//               {comments.map((c) => (
//                 <div key={c.comment_id} className="flex mb-3 p-2 bg-gray-800 rounded">
//                   <CommentAvatar author={c.author} />
//                   <div className="flex-1">
//                     <p className="text-sm text-gray-100">
//                       <span className="font-semibold">{c.author.name}</span>{" "}
//                       <span className="text-xs text-gray-400">
//                         ({formatShortDate(c.created_time)}):
//                       </span>
//                     </p>
//                     <p className="text-sm text-gray-200 mt-1">{c.message}</p>
//                   </div>
//                 </div>
//               ))}

//               {commentsCursor && !commentsLoading && (
//                 <button
//                   onClick={async () => {
//                     setCommentsLoading(true);
//                     try {
//                       const u = new URL("/api/fetch_fb_comments", window.location.origin);
//                       u.searchParams.set("post_id", selectedPost.post_id);
//                       u.searchParams.set("after", commentsCursor);

//                       const res = await fetch(u);
//                       const data = await res.json();
//                       const more = data.results || [];
//                       const nextCursor = data.cursor || null;

//                       setComments((prev) => [...prev, ...more]);
//                       setCommentsCursor(nextCursor);
//                     } catch (err) {
//                       console.error(err);
//                       setCommentsError(err.message);
//                     } finally {
//                       setCommentsLoading(false);
//                     }
//                   }}
//                   className="mt-2 px-4 py-2 bg-[#14B8A6] text-white rounded-md hover:bg-[#0e7663]"
//                 >
//                   Load more comments
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// src/components/FbPosts.jsx
"use client";

import React, { useState, useEffect } from "react";
import { getPostImageUrl } from "../lib/getPostImage";


function formatCount(value) {
  // Ensure we’re working with a number
  const num = Number(value);
  if (isNaN(num)) return value;

  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return String(num);
}

function CommentAvatar({ author }) {
   if (!author.picture) {
    console.warn(
      `CommentAvatar: no profile‐pic URL for author “${author.name || "Unknown"}” (ID: ${author.id ||
        "n/a"}, URL: ${author.url || "n/a"})`
    );
  }
  const avatarUrl = author.picture || "/no-profile-pic-img.png";

  return (
    <img
      src={avatarUrl}
      alt={`${author.name || "User"}’s profile picture`}
      className="w-8 h-8 rounded-full object-cover flex-shrink-0 mr-3"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = "/no-profile-pic-img.png";
      }}
    />
  );
}

export default function FbPosts({ profileId, totalPages = 12 }) {
  const POSTS_PER_PAGE = 3;

  const [pageCursors, setPageCursors] = useState({ 1: null });
  const [pageData, setPageData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingPage, setLoadingPage] = useState(null);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showChildren, setShowChildren] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentsCursor, setCommentsCursor] = useState(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);

  useEffect(() => {
    if (!profileId) return;
    setPageCursors({ 1: null });
    setPageData({});
    setCurrentPage(1);
    setError(null);
  }, [profileId]);

  useEffect(() => {
    if (!pageData[currentPage] && loadingPage !== currentPage) {
      fetchPage(currentPage);
    }
  }, [currentPage, pageData, loadingPage]);

  async function fetchPage(pageNum) {
    if (pageData[pageNum] || loadingPage === pageNum) return;
    setLoadingPage(pageNum);
    setError(null);

    try {
      const cursor = pageCursors[pageNum] || null;
      const url = new URL("/api/fb_posts", window.location.origin);
      url.searchParams.set("profile_id", profileId);
      if (cursor) url.searchParams.set("cursor", cursor);
      url.searchParams.set("limit", POSTS_PER_PAGE);

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch page ${pageNum}: ${res.statusText}`);
      const { results: pagePosts = [], cursor: nextCursor = null } = await res.json();

      setPageData((prev) => ({ ...prev, [pageNum]: pagePosts }));
      if (nextCursor) {
        setPageCursors((prev) => ({ ...prev, [pageNum + 1]: nextCursor }));
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setLoadingPage(null);
    }
  }

  async function openModal(post) {
    setSelectedPost(post);
    setShowChildren(false);
    setShowModal(true);

    setComments([]);
    setCommentsCursor(null);
    setCommentsLoading(true);
    setCommentsError(null);

    try {
      const url = new URL("/api/fetch_fb_comments", window.location.origin);
      url.searchParams.set("post_id", post.post_id);

      const res = await fetch(url);
      if (!res.ok) throw new Error(res.statusText);

      const data = await res.json();
      setComments(data.results || []);
      setCommentsCursor(data.cursor || null);
    } catch (err) {
      console.error(err);
      setCommentsError(err.message || "Failed to load comments");
    } finally {
      setCommentsLoading(false);
    }
  }

  function closeModal() {
    setShowModal(false);
    setSelectedPost(null);
  }

  function firstBadLabel(labels = []) {
    return labels.find(
      (l) => l !== "safe" && l !== "no_image" && l !== "analysis_error"
    );
  }

  const posts = pageData[currentPage] || [];
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const block = 5;
  const firstBlock = pages.slice(0, block);
  const lastPage = pages[pages.length - 1];

  const formatShortDate = (unixSeconds) => {
    const d = new Date(unixSeconds * 1000);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  return (
    <div className="space-y-4">
      {/* ─── LOADING / ERROR MESSAGE FOR POSTS ─────────────────────────────── */}
      {loadingPage === currentPage && (
        <div className="flex justify-center items-center py-8">
          <span className="text-gray-400">Loading page {currentPage}…</span>
        </div>
      )}
      {error && (
        <div className="py-8 px-4 bg-red-900 rounded-md">
          <p className="text-red-200">Error: {error}</p>
        </div>
      )}

      {/* ─── POSTS TABLE ────────────────────────────────────────────────────── */}
      {!loadingPage && !error && (
        <div className="overflow-x-auto">
          <table className="table-auto w-full bg-gray-800 rounded-md overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                {[
                  "Image",
                  "Post / Title",
                  "Timestamp",
                  "Comments",
                  "Reactions",
                  "View Details",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-sm font-medium text-gray-200"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const date = new Date(post.timestamp * 1000).toLocaleString();
                const src = getPostImageUrl(post);
                const badLabel = firstBadLabel(post.labels);

                return (
                  <tr key={post.post_id} className="border-b border-gray-700">
                    {/* ─── IMAGE CELL ─────────────────────────────────────────── */}
                    <td className="px-4 py-2">
                      <div className="relative inline-block">
                        {src ? (
                          <img
                            src={src}
                            alt="post"
                            className="h-12 w-12 object-cover rounded-md"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-600 flex items-center justify-center rounded-md">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}

                        {badLabel && (
                          <span className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-1 py-[2px] rounded-br-md">
                            {badLabel.replace("-", " ")}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* ─── MESSAGE / TITLE CELL ───────────────────────────────────── */}
                    <td className="px-4 py-2 text-gray-100 text-sm whitespace-nowrap overflow-hidden truncate max-w-xs">
                      {post.message || "(No message)"}
                    </td>

                    {/* ─── TIMESTAMP CELL ─────────────────────────────────────── */}
                    <td className="px-4 py-2 text-gray-300 text-sm">{date}</td>

                    {/* ─── COMMENTS COUNT CELL ───────────────────────────────── */}
                    <td className="px-4 py-2 text-center text-gray-200 text-sm">
                      {formatCount(post.comments_count)}
                    </td>

                    {/* ─── REACTIONS COUNT CELL ───────────────────────────────── */}
                    <td className="px-4 py-2 text-center text-gray-200 text-sm">
                      {formatCount(post.reactions_count)}
                    </td>

                    {/* ─── VIEW DETAILS BUTTON CELL ───────────────────────────── */}
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => openModal(post)}>
                        <img src="/eye.png" alt="View" className="h-6 w-6" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── PAGINATION CONTROLS ─────────────────────────────────────────────── */}
      <div className="flex justify-center items-center space-x-1">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
        >
          &lt;
        </button>
        {firstBlock.map((n) => (
          <button
            key={n}
            onClick={() => setCurrentPage(n)}
            className={`w-8 h-8 flex items-center justify-center border ${
              n === currentPage
                ? "bg-teal-500 border-teal-500 text-white"
                : "border-gray-600 text-gray-200 hover:bg-gray-700"
            }`}
          >
            {n}
          </button>
        ))}
        <span className="px-1 text-gray-200">…</span>
        <button
          onClick={() => setCurrentPage(lastPage)}
          className={`w-8 h-8 flex items-center justify-center border ${
            lastPage === currentPage
              ? "bg-teal-500 border-teal-500 text-white"
              : "border-gray-600 text-gray-200 hover:bg-gray-700"
          }`}
        >
          {lastPage}
        </button>
        <button
          onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
          className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
        >
          &gt;
        </button>
      </div>

      {/* ─── MODAL ────────────────────────────────────────────────────────────── */}
      {showModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1f2937] text-white p-4 md:p-6 rounded-md relative w-[90%] max-w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <p className="text-gray-400 text-sm mb-2">
                {new Date(selectedPost.timestamp * 1000).toLocaleString()}
              </p>
              <button
                onClick={closeModal}
                className="text-[16px] px-2 py-1 bg-[#000000] font-bold"
              >
                X
              </button>
            </div>

            {/* ─── POST MEDIA ────────────────────────────────────────────────── */}
            <div className="w-full h-[250px] mb-4 flex items-center justify-center relative">
              {selectedPost.video_files?.video_hd_file ||
              selectedPost.video_files?.video_sd_file ? (
                <video
                  src={
                    selectedPost.video_files.video_hd_file ||
                    selectedPost.video_files.video_sd_file
                  }
                  controls
                  className="h-full w-full object-contain rounded-md"
                />
              ) : (
                <img
                  src={getPostImageUrl(selectedPost)}
                  alt="Post media"
                  className="h-full w-full object-contain rounded-md"
                />
              )}
              {firstBadLabel(selectedPost.labels) && (
                <span className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-1 py-[2px] rounded-br-md">
                  {firstBadLabel(selectedPost.labels).replace("-", " ")}
                </span>
              )}
            </div>

            <div className="text-[14px] mt-4 mb-2 text-gray-200">
              {selectedPost.message || "(No message)"}
            </div>

            {/* ─── CHILD POSTS (IF ANY) ─────────────────────────────────────── */}
            {selectedPost.album_preview?.length > 1 && (
              <button
                onClick={() => setShowChildren((c) => !c)}
                className="mb-4 px-4 py-2 bg-[#14B8A6] text-white rounded-md"
              >
                {showChildren ? "Hide Child Posts" : "View Child Posts"}
              </button>
            )}
            {showChildren && selectedPost.album_preview && (
              <div className="flex space-x-2 overflow-x-auto mb-4">
                {selectedPost.album_preview.map((item, idx) => (
                  <img
                    key={idx}
                    src={item.image_file_uri}
                    alt={`Child ${idx + 1}`}
                    className="flex-shrink-0 w-[90px] h-[90px] object-cover rounded-md"
                  />
                ))}
              </div>
            )}

            {/* ─── COMMENTS SECTION ──────────────────────────────────────────── */}
            <div>
              <h3 className="font-medium mb-2">Comments</h3>

              {commentsLoading && <p className="text-gray-400">Loading comments…</p>}
              {commentsError && <p className="text-red-400">{commentsError}</p>}
              {!commentsLoading && comments.length === 0 && (
                <p className="text-gray-500">No comments yet.</p>
              )}

              {comments.map((c) => (
                <div key={c.comment_id} className="flex mb-3 p-2 bg-gray-800 rounded">
                  {/* Now CommentAvatar uses c.author.picture or placeholder */}
                  <CommentAvatar author={c.author} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-100">
                      <span className="font-semibold">{c.author.name}</span>{" "}
                      <span className="text-xs text-gray-400">
                        ({formatShortDate(c.created_time)}):
                      </span>
                    </p>
                    <p className="text-sm text-gray-200 mt-1">{c.message}</p>
                  </div>
                </div>
              ))}

              {commentsCursor && !commentsLoading && (
                <button
                  onClick={async () => {
                    setCommentsLoading(true);
                    try {
                      const u = new URL("/api/fetch_fb_comments", window.location.origin);
                      u.searchParams.set("post_id", selectedPost.post_id);
                      u.searchParams.set("after", commentsCursor);

                      const res = await fetch(u);
                      const data = await res.json();
                      const more = data.results || [];
                      const nextCursor = data.cursor || null;

                      setComments((prev) => [...prev, ...more]);
                      setCommentsCursor(nextCursor);
                    } catch (err) {
                      console.error(err);
                      setCommentsError(err.message);
                    } finally {
                      setCommentsLoading(false);
                    }
                  }}
                  className="mt-2 px-4 py-2 bg-[#14B8A6] text-white rounded-md hover:bg-[#0e7663]"
                >
                  Load more comments
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
