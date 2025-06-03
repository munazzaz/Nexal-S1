// // src/pages/api/fb_posts.js (correct)

// import fetch from 'node-fetch'; // ensure fetch is available if not using Next.js built-in

// export default async function handler(req, res) {
//   const { profile_id, username, cursor, limit } = req.query;
//   const KEY = process.env.RAPIDAPI_KEY;
//   const HOST = process.env.RAPIDAPI_HOST || "facebook-scraper3.p.rapidapi.com";

//   if (!profile_id && !username) {
//     return res.status(400).json({ error: "Either profile_id or username is required." });
//   }
//   if (!KEY) {
//     return res.status(500).json({ error: "RapidAPI key not configured." });
//   }

//   async function resolveProfileId(input) {
//     // if the input is already numeric, just return it
//     if (/^[0-9]+$/.test(input)) return input;

//     const url = `https://www.facebook.com/${encodeURIComponent(input)}`;
//     const detailsRes = await fetch(
//       `https://${HOST}/profile/details_url?url=${encodeURIComponent(url)}`,
//       { headers: { "x-rapidapi-key": KEY, "x-rapidapi-host": HOST } }
//     );
//     const json = await detailsRes.json();
//     const prof = (json.profile || json).profile || json.profile;
//     if (!prof || !prof.profile_id) {
//       throw new Error("Could not extract numeric profile_id.");
//     }
//     return prof.profile_id;
//   }

//   try {
//     // figure out numeric ID from profile_id or username
//     const input = profile_id || username;
//     const numericId = await resolveProfileId(input);

//     // build the scraper URL, including optional cursor & limit params
//     let apiUrl = `https://${HOST}/profile/posts?profile_id=${encodeURIComponent(numericId)}`;
//     if (limit) {
//       apiUrl += `&limit=${encodeURIComponent(limit)}`;
//     }
//     if (cursor) {
//       apiUrl += `&cursor=${encodeURIComponent(cursor)}`;
//     }

//     // fetch posts page
//     const pageRes = await fetch(apiUrl, {
//       headers: { "x-rapidapi-key": KEY, "x-rapidapi-host": HOST }
//     });
//     const pageJson = await pageRes.json();

//     if (!pageRes.ok) {
//       return res.status(pageRes.status).json({ error: pageJson.message || "Error fetching posts." });
//     }

//     // enrich posts that lack an image by hitting the thumbnail endpoint
//     const enriched = await Promise.all(
//       (pageJson.results || []).map(async (post) => {
//         const hasImage =
//           post.full_picture ||
//           post.album_preview?.length > 0 ||
//           post.attachments?.data?.[0]?.media?.image?.src ||
//           post.picture?.data?.url ||
//           post.media?.image?.src ||
//           post.image?.source ||
//           post.video_thumbnail;

//         if (hasImage) {
//           return post;
//         }

//         try {
//           const thumbRes = await fetch(
//             `https://${HOST}/post/thumbnail_url?url=${encodeURIComponent(post.url)}`,
//             { headers: { "x-rapidapi-key": KEY, "x-rapidapi-host": HOST } }
//           );
//           const thumbJson = await thumbRes.json();
//           if (thumbJson.thumbnail) {
//             return { ...post, video_thumbnail: thumbJson.thumbnail };
//           }
//         } catch (err) {
//           // ignore thumbnail errors
//         }

//         return post;
//       })
//     );

//     res.status(200).json({ profile_id: numericId, results: enriched, cursor: pageJson.cursor || null });

//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: e.message || "Failed to fetch posts." });
//   }
// }

// // src/pages/api/fb_posts.js

// import fetch from 'node-fetch';
// import querystring from 'querystring';

// export default async function handler(req, res) {
//   const { profile_id, username, cursor, limit } = req.query;
//   const KEY = process.env.RAPIDAPI_KEY;
//   const HOST = process.env.RAPIDAPI_HOST || "facebook-scraper3.p.rapidapi.com";

//   // Sightengine credentials (make sure these are set in your .env at the project root)
//   const SIGHTENGINE_USER = process.env.SIGHTENGINE_API_USER;
//   const SIGHTENGINE_SECRET = process.env.SIGHTENGINE_API_SECRET;
//   if (!SIGHTENGINE_USER || !SIGHTENGINE_SECRET) {
//     console.warn("⚠️ Sightengine credentials missing—images will be returned without labels.");
//   } else {
//     console.log("🔑 Sightengine credentials found, ready to scan images.");
//   }

//   if (!profile_id && !username) {
//     return res.status(400).json({ error: "Either profile_id or username is required." });
//   }
//   if (!KEY) {
//     return res.status(500).json({ error: "RapidAPI key not configured." });
//   }

//   // Helper: resolve a Facebook username to numeric profile_id
//   async function resolveProfileId(input) {
//     if (/^[0-9]+$/.test(input)) {
//       console.log(`ℹ️ Input "${input}" is already numeric, using as profile_id.`);
//       return input;
//     }
//     console.log(`🔍 Resolving username "${input}" to numeric profile_id…`);
//     const url = `https://www.facebook.com/${encodeURIComponent(input)}`;
//     const detailsRes = await fetch(
//       `https://${HOST}/profile/details_url?url=${encodeURIComponent(url)}`,
//       { headers: { "x-rapidapi-key": KEY, "x-rapidapi-host": HOST } }
//     );
//     const json = await detailsRes.json();
//     const prof = (json.profile || json).profile || json.profile;
//     if (!prof || !prof.profile_id) {
//       console.error("❌ Could not extract numeric profile_id from Facebook response.");
//       throw new Error("Could not extract numeric profile_id.");
//     }
//     console.log(`✅ Resolved "${input}" to profile_id ${prof.profile_id}.`);
//     return prof.profile_id;
//   }

//   // Helper: Given an image URL, call Sightengine’s “check.json” endpoint and return an array of labels
//   async function analyzeImageWithSightengine(imageUrl, postId) {
//     if (!SIGHTENGINE_USER || !SIGHTENGINE_SECRET) {
//       console.log(`ℹ️ [Post ${postId}] Skipping Sightengine (no credentials).`);
//       return ["no_analysis"];
//     }

//     console.log(`➡️ [Post ${postId}] Sending to Sightengine for analysis: ${imageUrl}`);
//     const params = {
//       api_user: SIGHTENGINE_USER,
//       api_secret: SIGHTENGINE_SECRET,
//       models: "nudity,wad,offensive",
//       url: imageUrl,
//     };
//     const query = querystring.stringify(params);
//     const sightUrl = `https://api.sightengine.com/1.0/check.json?${query}`;

//     try {
//       const resp = await fetch(sightUrl);
//       if (!resp.ok) {
//         console.error(`❌ [Post ${postId}] Sightengine returned ${resp.status}:`, await resp.text());
//         return ["analysis_error"];
//       }
//       const result = await resp.json();
//       console.log(`⬅️ [Post ${postId}] Sightengine response:`, JSON.stringify(result));

//       const labels = [];

//       // 1) Nudity model
//       if (result.nudity) {
//         const { raw, partial, safe } = result.nudity;
//         if (raw > 0.5) {
//           labels.push("nudity-explicit");
//         } else if (partial > 0.5) {
//           labels.push("nudity-partial");
//         } else {
//           // you could push “no_nudity” if you want an explicit “safe” tag
//           // labels.push("no_nudity");
//         }
//       }

//       // 2) WAD (weapons, alcohol, drugs)
//       if (result.weapon && result.weapon > 0.5) {
//         labels.push("weapon");
//       }
//       if (result.alcohol && result.alcohol > 0.5) {
//         labels.push("alcohol");
//       }
//       if (result.drugs && result.drugs > 0.5) {
//         labels.push("drugs");
//       }

//       // 3) Offensive content
//       if (result.offensive && result.offensive.prob > 0.5) {
//         labels.push("offensive");
//       }

//       if (labels.length === 0) {
//         labels.push("safe");
//       }

//       console.log(`✅ [Post ${postId}] Labels determined:`, labels);
//       return labels;
//     } catch (err) {
//       console.error(`❌ [Post ${postId}] Sightengine request failed:`, err);
//       return ["analysis_error"];
//     }
//   }

//   try {
//     // 1) figure out numeric ID from profile_id or username
//     const input = profile_id || username;
//     const numericId = await resolveProfileId(input);

//     // 2) build the scraper URL
//     let apiUrl = `https://${HOST}/profile/posts?profile_id=${encodeURIComponent(numericId)}`;
//     if (limit) {
//       apiUrl += `&limit=${encodeURIComponent(limit)}`;
//     }
//     if (cursor) {
//       apiUrl += `&cursor=${encodeURIComponent(cursor)}`;
//     }
//     console.log(`🔍 Fetching posts page for profile_id ${numericId}, cursor="${cursor || ""}", limit=${limit || "default"}.`);

//     // 3) fetch a page of posts
//     const pageRes = await fetch(apiUrl, {
//       headers: { "x-rapidapi-key": KEY, "x-rapidapi-host": HOST }
//     });
//     const pageJson = await pageRes.json();
//     if (!pageRes.ok) {
//       console.error(`❌ Error fetching posts: ${pageRes.status} - ${pageJson.message || "unknown"}`);
//       return res.status(pageRes.status).json({ error: pageJson.message || "Error fetching posts." });
//     }
//     console.log(`✅ Fetched ${ (pageJson.results || []).length } posts (cursor="${pageJson.cursor || ""}").`);

//     // 4) enrich posts that lack an image by hitting the thumbnail endpoint
//     const enriched = await Promise.all(
//       (pageJson.results || []).map(async (post) => {
//         const postId = post.post_id;
//         // determine if we already have an image
//         const hasImage =
//           post.full_picture ||
//           post.album_preview?.length > 0 ||
//           post.attachments?.data?.[0]?.media?.image?.src ||
//           post.picture?.data?.url ||
//           post.media?.image?.src ||
//           post.image?.source ||
//           post.video_thumbnail;

//         if (hasImage) {
//           console.log(`ℹ️ [Post ${postId}] Already has image, skipping thumbnail fetch.`);
//           return post;
//         }

//         // otherwise try to fetch a thumbnail
//         try {
//           console.log(`ℹ️ [Post ${postId}] No image in primary fields—fetching thumbnail via API.`);
//           const thumbRes = await fetch(
//             `https://${HOST}/post/thumbnail_url?url=${encodeURIComponent(post.url)}`,
//             { headers: { "x-rapidapi-key": KEY, "x-rapidapi-host": HOST } }
//           );
//           const thumbJson = await thumbRes.json();
//           if (thumbJson.thumbnail) {
//             console.log(`✅ [Post ${postId}] Got thumbnail: ${thumbJson.thumbnail}`);
//             return { ...post, video_thumbnail: thumbJson.thumbnail };
//           } else {
//             console.log(`⚠️ [Post ${postId}] Thumbnail API returned no thumbnail.`);
//           }
//         } catch (err) {
//           console.error(`❌ [Post ${postId}] Error fetching thumbnail:`, err);
//         }

//         return post;
//       })
//     );

//     // 5) Now that we have `enriched`, run Sightengine on every post that has an image
//     const analyzed = await Promise.all(
//       enriched.map(async (post) => {
//         const postId = post.post_id;
//         // Figure out the “best” image URL for this post:
//         let imageUrl = null;
//         if (post.full_picture) {
//           imageUrl = post.full_picture;
//         } else if (post.album_preview?.length > 0) {
//           imageUrl = post.album_preview[0].image_file_uri;
//         } else if (post.attachments?.data?.[0]?.media?.image?.src) {
//           imageUrl = post.attachments.data[0].media.image.src;
//         } else if (post.picture?.data?.url) {
//           imageUrl = post.picture.data.url;
//         } else if (post.media?.image?.src) {
//           imageUrl = post.media.image.src;
//         } else if (post.image?.source) {
//           imageUrl = post.image.source;
//         } else if (post.video_thumbnail) {
//           imageUrl = post.video_thumbnail;
//         }

//         if (imageUrl) {
//           // Log before sending
//           console.log(`🔔 [Post ${postId}] Found image URL: ${imageUrl}`);
//           const labels = await analyzeImageWithSightengine(imageUrl, postId);
//           return { ...post, labels };
//         } else {
//           console.log(`ℹ️ [Post ${postId}] No image URL found—marking as "no_image".`);
//           return { ...post, labels: ["no_image"] };
//         }
//       })
//     );

//     // 6) Return the fully annotated results and the next cursor
//     console.log(`📤 Returning ${analyzed.length} posts back to client.`);
//     res.status(200).json({
//       profile_id: numericId,
//       results: analyzed,
//       cursor: pageJson.cursor || null
//     });
//   } catch (e) {
//     console.error("❌ Handler error:", e);
//     res.status(500).json({ error: e.message || "Failed to fetch posts." });
//   }
// }


// Correct cide
// import fetch from 'node-fetch';
// import querystring from 'querystring';

// export default async function handler(req, res) {
//   const { profile_id, username, cursor, limit } = req.query;
//   const KEY = process.env.RAPIDAPI_KEY;
//   const HOST = process.env.RAPIDAPI_HOST || "facebook-scraper3.p.rapidapi.com";

//   const SIGHTENGINE_USER = process.env.SIGHTENGINE_API_USER;
//   const SIGHTENGINE_SECRET = process.env.SIGHTENGINE_API_SECRET;
//   if (!SIGHTENGINE_USER || !SIGHTENGINE_SECRET) {
//     console.warn("⚠️ Sightengine credentials missing—images will be returned without labels.");
//   } else {
//     // console.log("🔑 Sightengine credentials found, ready to scan images.");
//   }

//   if (!profile_id && !username) {
//     return res.status(400).json({ error: "Either profile_id or username is required." });
//   }
//   if (!KEY) {
//     return res.status(500).json({ error: "RapidAPI key not configured." });
//   }

//   // ─── Resolve a Facebook username to numeric profile_id ─────────────────────────
//   async function resolveProfileId(input) {
//     if (/^[0-9]+$/.test(input)) {
//       console.log(`ℹ️ Input "${input}" is already numeric, using as profile_id.`);
//       return input;
//     }
//     // console.log(`🔍 Resolving username "${input}" to numeric profile_id…`);
//     const url = `https://www.facebook.com/${encodeURIComponent(input)}`;
//     const detailsRes = await fetch(
//       `https://${HOST}/profile/details_url?url=${encodeURIComponent(url)}`,
//       { headers: { "x-rapidapi-key": KEY, "x-rapidapi-host": HOST } }
//     );
//     const json = await detailsRes.json();
//     const prof = (json.profile || json).profile || json.profile;
//     if (!prof || !prof.profile_id) {
//       console.error("❌ Could not extract numeric profile_id from Facebook response.");
//       throw new Error("Could not extract numeric profile_id.");
//     }
//     // console.log(`✅ Resolved "${input}" to profile_id ${prof.profile_id}.`);
//     return prof.profile_id;
//   }

//   // ─── Given an image URL, call Sightengine’s “check.json” endpoint ─────────────────
//   //    We only emit a label if its probability ≥ THRESHOLD. Otherwise ignore.
//   //    We also build a raw `scores` object containing all relevant probabilities.
//   //    If no category passes threshold, we return label "safe" + scores.
//   async function analyzeImageWithSightengine(imageUrl, postId) {
//     if (!SIGHTENGINE_USER || !SIGHTENGINE_SECRET) {
//       // console.log(`ℹ️ [Post ${postId}] Skipping Sightengine (no credentials).`);
//       return {
//         labels: ["no_analysis"],
//         scores: {},
//       };
//     }

//     // console.log(`➡️ [Post ${postId}] Sending to Sightengine for analysis: ${imageUrl}`);
//     const params = {
//       api_user: SIGHTENGINE_USER,
//       api_secret: SIGHTENGINE_SECRET,
//       models: "nudity,wad,offensive",
//       url: imageUrl,
//     };
//     const query = querystring.stringify(params);
//     const sightUrl = `https://api.sightengine.com/1.0/check.json?${query}`;

//     try {
//       const resp = await fetch(sightUrl);
//       if (!resp.ok) {
//         // console.error(`❌ [Post ${postId}] Sightengine returned ${resp.status}:`, await resp.text());
//         return {
//           labels: ["analysis_error"],
//           scores: {},
//         };
//       }
//       const result = await resp.json();
//       // console.log(`⬅️ [Post ${postId}] Sightengine response:`, JSON.stringify(result));

//       // ─── Build a `scores` object with the raw probabilities we care about ─────────
//       const scores = {
//         nudity_raw: result.nudity?.raw ?? 0,
//         nudity_partial: result.nudity?.partial ?? 0,
//         nudity_safe: result.nudity?.safe ?? 0,
//         weapon: result.weapon ?? 0,
//         alcohol: result.alcohol ?? 0,
//         drugs: result.drugs ?? 0,
//         offensive_prob: result.offensive?.prob ?? 0,
//       };

//       // ─── Decide threshold (e.g. 0.85 means “only if ≥ 85% confidence”) ─────────────
//       const THRESHOLD = 0.99;

//       const labels = [];

//       // 1) Nudity: if raw≥THRESHOLD ⇒ "nudity-explicit"
//       // if (scores.nudity_raw >= THRESHOLD) {
//       //   labels.push("nudity-explicit");
//       // } else if (scores.nudity_partial >= THRESHOLD) {
//       //   // 2) Nudity partial (e.g. some skin but < explicit)
//       //   labels.push("nudity-partial");
//       // }
//       if (scores.nudity_raw >= THRESHOLD) {
//         labels.push("nudity-explicit");
//    }
//       // 3) Weapons (wad)
//       if (scores.weapon >= THRESHOLD) {
//         labels.push("weapon");
//       }
//       // 4) Alcohol
//       if (scores.alcohol >= THRESHOLD) {
//         labels.push("alcohol");
//       }
//       // 5) Recreational drugs
//       if (scores.drugs >= THRESHOLD) {
//         labels.push("drugs");
//       }
//       // 6) Offensive content (hate/abuse) if prob≥THRESHOLD
//       if (scores.offensive_prob >= THRESHOLD) {
//         labels.push("offensive");
//       }

//       // If we found nothing above threshold, mark "safe"
//       if (labels.length === 0) {
//         labels.push("safe");
//       }

//       // console.log(`✅ [Post ${postId}] Labels determined:`, labels);
//       return { labels, scores };
//     } catch (err) {
//       console.error(`❌ [Post ${postId}] Sightengine request failed:`, err);
//       return {
//         labels: ["analysis_error"],
//         scores: {},
//       };
//     }
//   }

//   try {
//     // 1) figure out numeric ID from profile_id or username
//     const input = profile_id || username;
//     const numericId = await resolveProfileId(input);

//     // 2) build the scraper URL
//     let apiUrl = `https://${HOST}/profile/posts?profile_id=${encodeURIComponent(numericId)}`;
//     if (limit) {
//       apiUrl += `&limit=${encodeURIComponent(limit)}`;
//     }
//     if (cursor) {
//       apiUrl += `&cursor=${encodeURIComponent(cursor)}`;
//     }
//     // console.log(`🔍 Fetching posts page for profile_id ${numericId}, cursor="${cursor || ""}", limit=${limit || "default"}.`);

//     // 3) fetch a page of posts
//     const pageRes = await fetch(apiUrl, {
//       headers: { "x-rapidapi-key": KEY, "x-rapidapi-host": HOST }
//     });
//     const pageJson = await pageRes.json();
//     if (!pageRes.ok) {
//       console.error(`❌ Error fetching posts: ${pageRes.status} - ${pageJson.message || "unknown"}`);
//       return res.status(pageRes.status).json({ error: pageJson.message || "Error fetching posts." });
//     }
//     // console.log(`✅ Fetched ${ (pageJson.results || []).length } posts (cursor="${pageJson.cursor || ""}").`);

    
//     // 4) enrich posts that lack an image by hitting the thumbnail endpoint
//     const enriched = await Promise.all(
//       (pageJson.results || []).map(async (post) => {
//         const postId = post.post_id;
//         const hasImage =
//           post.full_picture ||
//           post.album_preview?.length > 0 ||
//           post.attachments?.data?.[0]?.media?.image?.src ||
//           post.picture?.data?.url ||
//           post.media?.image?.src ||
//           post.image?.source ||
//           post.video_thumbnail;

//         if (hasImage) {
//           // console.log(`ℹ️ [Post ${postId}] Already has image, skipping thumbnail fetch.`);
//           return post;
//         }

//         // otherwise try to fetch a thumbnail
//         try {
//           // console.log(`ℹ️ [Post ${postId}] No image in primary fields—fetching thumbnail via API.`);
//           const thumbRes = await fetch(
//             `https://${HOST}/post/thumbnail_url?url=${encodeURIComponent(post.url)}`,
//             { headers: { "x-rapidapi-key": KEY, "x-rapidapi-host": HOST } }
//           );
//           const thumbJson = await thumbRes.json();
//           if (thumbJson.thumbnail) {
//             // console.log(`✅ [Post ${postId}] Got thumbnail: ${thumbJson.thumbnail}`);
//             return { ...post, video_thumbnail: thumbJson.thumbnail };
//           } else {
//             // console.log(`⚠️ [Post ${postId}] Thumbnail API returned no thumbnail.`);
//           }
//         } catch (err) {
//           // console.error(`❌ [Post ${postId}] Error fetching thumbnail:`, err);
//         }

//         return post;
//       })
//     );

//     // 5) Now that we have `enriched`, run Sightengine on every post that has an image
//     const analyzed = await Promise.all(
//       enriched.map(async (post) => {
//         const postId = post.post_id;
//         // Figure out the “best” image URL for this post:
//         let imageUrl = null;
//         if (post.full_picture) {
//           imageUrl = post.full_picture;
//         } else if (post.album_preview?.length > 0) {
//           imageUrl = post.album_preview[0].image_file_uri;
//         } else if (post.attachments?.data?.[0]?.media?.image?.src) {
//           imageUrl = post.attachments.data[0].media.image.src;
//         } else if (post.picture?.data?.url) {
//           imageUrl = post.picture.data.url;
//         } else if (post.media?.image?.src) {
//           imageUrl = post.media.image.src;
//         } else if (post.image?.source) {
//           imageUrl = post.image.source;
//         } else if (post.video_thumbnail) {
//           imageUrl = post.video_thumbnail;
//         }

//         if (imageUrl) {
//           // console.log(`🔔 [Post ${postId}] Found image URL: ${imageUrl}`);
//           const { labels, scores } = await analyzeImageWithSightengine(imageUrl, postId);
//           // Attach both labels and raw scores:
//           return { ...post, labels, scores };
//         } else {
//           console.log(`ℹ️ [Post ${postId}] No image URL found—marking as "no_image".`);
//           return {
//             ...post,
//             labels: ["no_image"],
//             scores: {},
//           };
//         }
//       })
//     );

//     // 6) Return the fully annotated results and the next cursor
//     // console.log(`📤 Returning ${analyzed.length} posts back to client.`);
//     res.status(200).json({
//       profile_id: numericId,
//       results: analyzed,
//       cursor: pageJson.cursor || null
//     });
//   } catch (e) {
//     console.error("❌ Handler error:", e);
//     res.status(500).json({ error: e.message || "Failed to fetch posts." });
//   }
// }



// pages/api/fb_posts.js (The code tries to attempt 3 posts per page)
import fetch from "node-fetch";
import querystring from "querystring";

export default async function handler(req, res) {
  const { profile_id, username, cursor, limit } = req.query;
  const KEY = process.env.RAPIDAPI_KEY;
  const HOST = process.env.RAPIDAPI_HOST || "facebook-scraper3.p.rapidapi.com";

  // Sightengine credentials—same as before
  const SIGHTENGINE_USER = process.env.SIGHTENGINE_API_USER;
  const SIGHTENGINE_SECRET = process.env.SIGHTENGINE_API_SECRET;
  if (!SIGHTENGINE_USER || !SIGHTENGINE_SECRET) {
    console.warn("⚠️ Sightengine credentials missing—images will be returned without labels.");
  }

  if (!profile_id && !username) {
    return res.status(400).json({ error: "Either profile_id or username is required." });
  }
  if (!KEY) {
    return res.status(500).json({ error: "RapidAPI key not configured." });
  }

  // ─── Resolve a Facebook username to numeric profile_id ─────────────────────────
  async function resolveProfileId(input) {
    if (/^[0-9]+$/.test(input)) {
      return input;
    }
    const url = `https://www.facebook.com/${encodeURIComponent(input)}`;
    const detailsRes = await fetch(
      `https://${HOST}/profile/details_url?url=${encodeURIComponent(url)}`,
      { headers: { "x-rapidapi-key": KEY, "x-rapidapi-host": HOST } }
    );
    const json = await detailsRes.json();
    const prof = (json.profile || json).profile || json.profile;
    if (!prof || !prof.profile_id) {
      throw new Error("Could not extract numeric profile_id.");
    }
    return prof.profile_id;
  }

  // ─── Given an image URL, call Sightengine’s “check.json” endpoint ─────────────────
  async function analyzeImageWithSightengine(imageUrl, postId) {
    if (!SIGHTENGINE_USER || !SIGHTENGINE_SECRET) {
      return { labels: ["no_analysis"], scores: {} };
    }

    const params = {
      api_user: SIGHTENGINE_USER,
      api_secret: SIGHTENGINE_SECRET,
      models: "nudity,wad,offensive",
      url: imageUrl,
    };
    const query = querystring.stringify(params);
    const sightUrl = `https://api.sightengine.com/1.0/check.json?${query}`;

    try {
      const resp = await fetch(sightUrl);
      if (!resp.ok) {
        return { labels: ["analysis_error"], scores: {} };
      }
      const result = await resp.json();
      const scores = {
        nudity_raw: result.nudity?.raw ?? 0,
        nudity_partial: result.nudity?.partial ?? 0,
        nudity_safe: result.nudity?.safe ?? 0,
        weapon: result.weapon ?? 0,
        alcohol: result.alcohol ?? 0,
        drugs: result.drugs ?? 0,
        offensive_prob: result.offensive?.prob ?? 0,
      };

      const THRESHOLD = 0.99;
      const labels = [];
      if (scores.nudity_raw >= THRESHOLD) labels.push("nudity-explicit");
      if (scores.weapon >= THRESHOLD) labels.push("weapon");
      if (scores.alcohol >= THRESHOLD) labels.push("alcohol");
      if (scores.drugs >= THRESHOLD) labels.push("drugs");
      if (scores.offensive_prob >= THRESHOLD) labels.push("offensive");
      if (labels.length === 0) labels.push("safe");

      return { labels, scores };
    } catch (err) {
      console.error(`Sightengine request for post ${postId} failed:`, err);
      return { labels: ["analysis_error"], scores: {} };
    }
  }

  try {
    // 1) Figure out numeric ID from profile_id or username
    const input = profile_id || username;
    const numericId = await resolveProfileId(input);

    // 2) Build the scraper URL
    let apiUrl = `https://${HOST}/profile/posts?profile_id=${encodeURIComponent(numericId)}`;
    if (limit) {
      apiUrl += `&limit=${encodeURIComponent(limit)}`; // e.g. “3”
    }
    if (cursor) {
      apiUrl += `&cursor=${encodeURIComponent(cursor)}`;
    }

    // 3) Fetch a page of posts
    const pageRes = await fetch(apiUrl, {
      headers: { "x-rapidapi-key": KEY, "x-rapidapi-host": HOST },
    });
    const pageJson = await pageRes.json();
    if (!pageRes.ok) {
      return res
        .status(pageRes.status)
        .json({ error: pageJson.message || "Error fetching posts." });
    }

    // ────────────────────────────────────────────────────────────────────────────────
    // HERE is the key change: only process exactly “limit” posts (default 3).
    const rawPosts = (pageJson.results || []).slice(0, Number(limit) || 3);
    // ────────────────────────────────────────────────────────────────────────────────

    // 4) Enrich posts that lack an image by hitting the thumbnail endpoint
    const enriched = await Promise.all(
      rawPosts.map(async (post) => {
        const postId = post.post_id;
        const hasImage =
          post.full_picture ||
          post.album_preview?.length > 0 ||
          post.attachments?.data?.[0]?.media?.image?.src ||
          post.picture?.data?.url ||
          post.media?.image?.src ||
          post.image?.source ||
          post.video_thumbnail;

        if (hasImage) {
          return post;
        }

        // otherwise try to fetch a thumbnail
        try {
          const thumbRes = await fetch(
            `https://${HOST}/post/thumbnail_url?url=${encodeURIComponent(post.url)}`,
            { headers: { "x-rapidapi-key": KEY, "x-rapidapi-host": HOST } }
          );
          const thumbJson = await thumbRes.json();
          if (thumbJson.thumbnail) {
            return { ...post, video_thumbnail: thumbJson.thumbnail };
          }
        } catch (err) {
          console.error(`Error fetching thumbnail for post ${postId}:`, err);
        }
        return post;
      })
    );

    // 5) Run Sightengine on each enriched post that has an image
    const analyzed = await Promise.all(
      enriched.map(async (post) => {
        const postId = post.post_id;
        // Determine the “best” image URL for this post:
        let imageUrl = null;
        if (post.full_picture) {
          imageUrl = post.full_picture;
        } else if (post.album_preview?.length > 0) {
          imageUrl = post.album_preview[0].image_file_uri;
        } else if (post.attachments?.data?.[0]?.media?.image?.src) {
          imageUrl = post.attachments.data[0].media.image.src;
        } else if (post.picture?.data?.url) {
          imageUrl = post.picture.data.url;
        } else if (post.media?.image?.src) {
          imageUrl = post.media.image.src;
        } else if (post.image?.source) {
          imageUrl = post.image.source;
        } else if (post.video_thumbnail) {
          imageUrl = post.video_thumbnail;
        }

        if (imageUrl) {
          const { labels, scores } = await analyzeImageWithSightengine(imageUrl, postId);
          return { ...post, labels, scores };
        } else {
          return { ...post, labels: ["no_image"], scores: {} };
        }
      })
    );

    // 6) Return exactly those 3 “analyzed” posts + next cursor
    return res.status(200).json({
      profile_id: numericId,
      results: analyzed,
      cursor: pageJson.cursor || null,
    });
  } catch (e) {
    console.error("Handler error:", e);
    return res.status(500).json({ error: e.message || "Failed to fetch posts." });
  }
}
