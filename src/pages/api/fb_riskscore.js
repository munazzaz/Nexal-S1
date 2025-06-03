// // src/pages/api/fb_riskscore.js (correct code)
// import fetch from "node-fetch";

// function simplifyData(items, type) {
//   return items.map((item) => {
//     const username =
//       item.username && item.username.trim() !== ""
//         ? item.username
//         : item.fullName && item.fullName.trim() !== ""
//         ? item.fullName
//         : `unknown_${item.id}`;

//     if (type === "post") {
//       return {
//         id: item.post_id || item.id,
//         caption: typeof item.message === "string" ? item.message.slice(0, 500) : "",
//         likeCount: item.reactions_count || item.like_count || 0,
//         username,
//         tags:
//           item.tags?.map((tag) => {
//             const tagUsername =
//               tag.username && tag.username.trim() !== ""
//                 ? tag.username
//                 : tag.fullName && tag.fullName.trim() !== ""
//                 ? tag.fullName
//                 : `unknown_${tag.id || "tag"}`;
//             return {
//               username: tagUsername,
//               fullName: tag.fullName || "",
//               profileImage: tag.profileImage || "",
//               gender: tag.gender || "",
//             };
//           }) || [],
//         taggedUsers:
//           item.tagged_users?.length > 0
//             ? item.tagged_users.map((tagged) => ({
//                 username: tagged.user.username || "",
//                 fullName: tagged.user.full_name || "",
//                 profileImage: tagged.user.profile_pic_url || "",
//               }))
//             : [],
//         imageUrl:
//           item.imageUrl ||
//           item.full_picture ||
//           (item.album_preview && item.album_preview[0]?.image_file_uri) ||
//           (item.image_versions && item.image_versions.items?.[0]?.url) ||
//           null,
//         labels: item.labels || [],        // pass along labels array from fb_posts
//         scores: item.scores || {},        // pass along Sightengine scores if any
//       };
//     } else if (type === "comment") {
//       return {
//         id: item.comment_id || item.id,
//         text: typeof item.message === "string" ? item.message.slice(0, 500) : "",
//         username,
//         likeCount: item.like_count || 0,
//         author: item.author || {},       // retain author info if needed
//       };
//     }
//     return item;
//   });
// }

// function aggregateEngagement(posts, comments) {
//   const engagement = {};
//   posts.forEach((post) => {
//     const user = post.username;
//     if (user) {
//       engagement[user] = engagement[user] || { likes: 0, comments: 0 };
//       engagement[user].likes += post.likeCount;
//     }
//     post.tags.forEach((tag) => {
//       const tagUser = tag.username;
//       if (tagUser) {
//         engagement[tagUser] = engagement[tagUser] || { likes: 0, comments: 0 };
//         // Heuristic: tagged users get half of that post’s likes
//         engagement[tagUser].likes += Math.floor(post.likeCount / 2);
//       }
//     });
//   });
//   comments.forEach((comment) => {
//     const user = comment.username;
//     if (user) {
//       engagement[user] = engagement[user] || { likes: 0, comments: 0 };
//       engagement[user].comments += 1;
//       engagement[user].likes += comment.likeCount;
//     }
//   });
//   return engagement;
// }

// function chunkArray(arr, chunkSize = 5) {
//   const chunks = [];
//   for (let i = 0; i < arr.length; i += chunkSize) {
//     chunks.push(arr.slice(i, i + chunkSize));
//   }
//   return chunks;
// }

// function isValidRiskScore(score) {
//   const num = Number(score);
//   return !isNaN(num) && num >= 0 && num <= 100;
// }

// function extractValidJSON(text) {
//   const startIndex = text.indexOf("{");
//   if (startIndex === -1) return null;
//   let openBraces = 0;
//   let endIndex = startIndex;
//   for (let i = startIndex; i < text.length; i++) {
//     if (text[i] === "{") openBraces++;
//     if (text[i] === "}") openBraces--;
//     if (openBraces === 0) {
//       endIndex = i;
//       break;
//     }
//   }
//   return text.substring(startIndex, endIndex + 1);
// }

// // ---------------------
// // OpenAI & Sightengine Helpers
// // (unchanged from before)
// // ---------------------
// async function callOpenAIModeration(text) {
//   if (!process.env.OPENAI_API_KEY) {
//     return { flagged: false, categories: {}, category_scores: {} };
//   }
//   try {
//     const resp = await fetch("https://api.openai.com/v1/moderations", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//       },
//       body: JSON.stringify({ input: text }),
//     });
//     const json = await resp.json();
//     const result = Array.isArray(json.results) ? json.results[0] : null;
//     if (!result) {
//       return { flagged: false, categories: {}, category_scores: {} };
//     }
//     return {
//       flagged: result.flagged,
//       categories: result.categories,
//       category_scores: result.category_scores,
//     };
//   } catch (err) {
//     console.error("OpenAI moderation failed:", err);
//     return { flagged: false, categories: {}, category_scores: {} };
//   }
// }

// async function analyzeImageWithSightengine(imageUrl, postId) {
//   const { SIGHTENGINE_API_USER, SIGHTENGINE_API_SECRET } = process.env;
//   if (!SIGHTENGINE_API_USER || !SIGHTENGINE_API_SECRET) {
//     return { labels: ["no_analysis"], scores: {} };
//   }
//   const params = {
//     api_user: SIGHTENGINE_API_USER,
//     api_secret: SIGHTENGINE_API_SECRET,
//     models: "nudity,wad,offensive",
//     url: imageUrl,
//   };
//   const query = new URLSearchParams(params).toString();
//   const sightUrl = `https://api.sightengine.com/1.0/check.json?${query}`;

//   try {
//     const resp = await fetch(sightUrl);
//     if (!resp.ok) {
//       console.error(`Sightengine returned ${resp.status} for post ${postId}`);
//       return { labels: ["analysis_error"], scores: {} };
//     }
//     const result = await resp.json();
//     const scores = {
//       nudity_raw: result.nudity?.raw ?? 0,
//       nudity_partial: result.nudity?.partial ?? 0,
//       nudity_safe: result.nudity?.safe ?? 0,
//       weapon: result.weapon ?? 0,
//       alcohol: result.alcohol ?? 0,
//       drugs: result.drugs ?? 0,
//       offensive_prob: result.offensive?.prob ?? 0,
//     };
//     const THRESHOLD = 0.99;
//     const labels = [];
//     if (scores.nudity_raw >= THRESHOLD) labels.push("nudity-explicit");
//     if (scores.weapon >= THRESHOLD) labels.push("weapon");
//     if (scores.alcohol >= THRESHOLD) labels.push("alcohol");
//     if (scores.drugs >= THRESHOLD) labels.push("drugs");
//     if (scores.offensive_prob >= THRESHOLD) labels.push("offensive");
//     if (labels.length === 0) labels.push("safe");
//     return { labels, scores };
//   } catch (err) {
//     console.error(`Sightengine request for post ${postId} failed:`, err);
//     return { labels: ["analysis_error"], scores: {} };
//   }
// }

// // The chunked prompt that returns one partial risk score (0–100) for a batch of items
// async function getRiskForChunk(chunk, aggregatedData, profileDetails) {
//   const jsonData = JSON.stringify({
//     data: chunk,
//     engagementMetrics: aggregatedData,
//     profileDetails,
//   });
//   const prompt =
// `You are a seasoned intelligence analyst evaluating the risk level of a social media profile.
// Based on the JSON data below, calculate a risk score between 0 (minimal risk) and 100 (very high risk).
// The instructions are:
// 1. If the profile is normal and exhibits little or no concerning activity, assign a risk score that is moderate and low. In such cases, the risk score should not exceed 20–30.
// 2. Only if the data indicates significant signs of concerning activity should the risk score be high (above 60).
// 3. Return only the risk score as a single number with no extra text.

// Data: ${jsonData}`;

//   const response = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "gpt-4o-2024-08-06",
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 20,
//       temperature: 0.2,
//     }),
//   });

//   const responseText = await response.text();
//   if (!response.ok) {
//     throw new Error(`OpenAI API error (risk chunk): ${responseText}`);
//   }
//   const dataResp = JSON.parse(responseText);
//   const score = dataResp.choices[0].message.content.trim();
//   if (!isValidRiskScore(score)) {
//     console.warn("Invalid risk score received:", score);
//   }
//   return score;
// }

// // After we have a list of partial risk scores (strings “0”–“100”), consolidate them
// async function getFinalRiskScore(partialScores) {
//   const combinedScores = partialScores.join("\n");
//   const prompt =
// `You are a seasoned intelligence analyst. Given the following partial risk scores, consolidate them into a final risk score between 0 and 100.
// Return only the final risk score with no extra text.

// Partial Risk Scores:
// ${combinedScores}`;

//   const response = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "gpt-4o-2024-08-06",
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 20,
//       temperature: 0.2,
//     }),
//   });
//   const responseText = await response.text();
//   if (!response.ok) {
//     throw new Error(`OpenAI Aggregation API error (risk): ${responseText}`);
//   }
//   const dataResp = JSON.parse(responseText);
//   const finalScore = dataResp.choices[0].message.content.trim();
//   if (!isValidRiskScore(finalScore)) {
//     console.warn("Invalid final risk score received:", finalScore);
//   }
//   return finalScore;
// }

// // Similar “chunked” pattern for interests (not strictly part of “risk score,” but included here)
// async function getInterestsForChunk(chunk, aggregatedData, profileDetails) {
//   const jsonData = JSON.stringify({
//     data: chunk,
//     engagementMetrics: aggregatedData,
//     profileDetails,
//   });
//   const prompt =
// `You are a social media analyst tasked with identifying the core interests of a user based on their activity data. For each interest, assign a weight between 1 and 10 indicating its prominence in the user's engagement. Return a valid JSON array of objects, each with the keys "interest" (a string) and "weight" (a number). Do not include any extra text.

// Data: ${jsonData}`;

//   const response = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "gpt-4o-2024-08-06",
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 80,
//       temperature: 0.2,
//     }),
//   });
//   const responseText = await response.text();
//   if (!response.ok) {
//     throw new Error(`OpenAI API error (interests chunk): ${responseText}`);
//   }
//   const dataResp = JSON.parse(responseText);
//   try {
//     let content = dataResp.choices[0].message.content.trim();
//     content = content
//       .replace(/^```(?:json\s*)?/, "")
//       .replace(/```$/, "")
//       .trim();
//     return JSON.parse(content);
//   } catch (error) {
//     console.warn("Error parsing interests:", error);
//     return [];
//   }
// }

// // “Relationship” classification (if you also want to include relationship analysis)
// async function getRelationshipsForChunk(chunk, aggregatedData, profileDetails) {
//   const jsonData = JSON.stringify({
//     data: chunk,
//     engagementMetrics: aggregatedData,
//     profileDetails,
//     note:
//       "For any user with a username starting with 'unknown_', treat the data as incomplete. Use any available metadata such as fullName or gender to classify the relationship.",
//   });

//   const prompt =
// `Analyze the target user's social media connections and classify relationships as Friend, Associate, Relative, or Girlfriend/Boyfriend based on:

// Same last name in likes or comments → Relative
// More than 2 likes/comments from the same profile with slang phrases (e.g., "bro you livin", "I see my man", "let’s go") → Friend
// Business-like or formal comments → Associate
// Multiple tags or likes from an opposite-gender profile:
//   – If the target is male and the profile is female with high tag/like frequency → Girlfriend/Wife
//   – If the target is female and the profile is male with high tag/like frequency → Boyfriend/Husband
// Multiple likes from an opposite-gender profile alone can also indicate a romantic partner

// IMPORTANT:
// • Output only a valid JSON object without any markdown or extra text.
// • Map each username to one of these exact strings: "Family", "Associate", "Friend", "Girlfriend/Wife", or "Boyfriend/Husband".
// • If no relationships can be determined, output {}.

// Data: ${jsonData}`;

//   const response = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "gpt-4o-2024-08-06",
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 200,
//       temperature: 0.2,
//     }),
//   });

//   const responseText = await response.text();
//   if (!response.ok) {
//     throw new Error(`OpenAI API error (relationships chunk): ${responseText}`);
//   }

//   const dataResp = JSON.parse(responseText);
//   let content = dataResp.choices[0].message.content.trim();
//   content = content.replace(/^```(?:json)?\n?/, "").replace(/```$/, "").trim();
//   try {
//     return JSON.parse(content);
//   } catch (error) {
//     console.warn("Error parsing relationships:", error);
//     const extracted = extractValidJSON(content);
//     if (extracted) {
//       try {
//         return JSON.parse(extracted);
//       } catch (err) {
//         console.warn("Fallback JSON parsing failed:", err);
//       }
//     }
//     return {};
//   }
// }

// // ---------------------
// // Data Fetching (Posts / Comments / ProfileDetails)
// // ---------------------

// /**
//  * 1) Fetch up to 5 pages of posts using your existing /api/fb_posts endpoint.
//  *    You must pass `username` (or `profile_id`) plus `limit=3` to get exactly 3 posts each call,
//  *    then use the returned `cursor` to fetch next page, up to `maxPages`.
//  */
// async function fetchUserData(username) {
//   let allPosts = [];
//   let allComments = [];

//   let nextCursor = null;
//   const maxPages = 5;  // up to 5 * 3 = 15 posts total, if needed

//   for (let page = 1; page <= maxPages; page++) {
//     // Build URL: /api/fb_posts?username=<username>&limit=3&cursor=<cursor>
//     const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/fb_posts`);
//     url.searchParams.set("username", username);
//     url.searchParams.set("limit", "3");
//     if (nextCursor) {
//       url.searchParams.set("cursor", nextCursor);
//     }

//     const postsRes = await fetch(url.toString());
//     if (!postsRes.ok) {
//       console.warn(`Failed to fetch fb_posts on page ${page}`);
//       break;
//     }
//     const postsJson = await postsRes.json();
//     const rawPosts = Array.isArray(postsJson.results) ? postsJson.results : [];
//     if (rawPosts.length === 0) break;

//     // Simplify each post
//     const simplifiedPosts = simplifyData(rawPosts, "post");
//     allPosts.push(...simplifiedPosts);

//     // Save cursor for next iteration; if no cursor, we’re done
//     nextCursor = postsJson.cursor || null;
//     if (!nextCursor) break;
//   }

//   // Now fetch comments for every post (in parallel)
//   const commentFetches = allPosts.map(async (post) => {
//     if (!post.id) return [];
//     // Call your existing endpoint: /api/fetch_fb_comments?post_id=<postId>
//     const cUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/fetch_fb_comments`);
//     cUrl.searchParams.set("post_id", post.id);

//     const cRes = await fetch(cUrl.toString());
//     if (!cRes.ok) {
//       console.warn(`Failed to fetch fb comments for post ${post.id}`);
//       return [];
//     }
//     const cJson = await cRes.json();
//     const rawComments = Array.isArray(cJson.results) ? cJson.results : [];
//     // Simplify each comment
//     return simplifyData(rawComments, "comment");
//   });

//   const commentsArrays = await Promise.all(commentFetches);
//   commentsArrays.forEach((arr) => {
//     allComments.push(...arr);
//   });

//   return { posts: allPosts, comments: allComments };
// }

// /**
//  * 2) Fetch “profile details” via your existing /api/facebookSearch?username=<username>
//  *    That returns JSON with keys like { name, profile_id, url, image, intro, cover_image, gender, about, about_public, … }.
//  */
// async function fetchProfileDetails(username) {
//   const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/facebookSearch`);
//   url.searchParams.set("username", username);

//   const detailsRes = await fetch(url.toString());
//   if (!detailsRes.ok) {
//     throw new Error("Failed to fetch Facebook profile details");
//   }
//   return detailsRes.json();
// }

// // ---------------------
// // Sightengine Convenience (optional final image analysis if risk is high)
// // ---------------------
// function getSightEngineLabel(analysis) {
//   const labels = [];
//   if (analysis.nudity && analysis.nudity.safe < 0.8) {
//     labels.push("adult content");
//   }
//   if (analysis.offensive && analysis.offensive.prob > 0.01) {
//     labels.push("offensive");
//   }
//   if (analysis.weapon && analysis.weapon > 0.005) {
//     labels.push("weapon");
//   }
//   if (analysis.drugs && analysis.drugs > 0.005) {
//     labels.push("drugs");
//   }
//   if (labels.length === 0) {
//     labels.push("safe");
//   }
//   return labels.join(", ");
// }

// async function analyzeImageWithSightEngine(imageUrl) {
//   const apiUser = "150452328";
//   const apiSecret = "uEzhj5Q2FVbg4jfnB4mRc84cdRqTpz4m";
//   const endpoint = "https://api.sightengine.com/1.0/check.json";
//   const params = new URLSearchParams({
//     api_user: apiUser,
//     api_secret: apiSecret,
//     models: "nudity,wad,offensive",
//     url: imageUrl,
//   });
//   const url = `${endpoint}?${params.toString()}`;

//   const response = await fetch(url);
//   const responseText = await response.text();
//   if (!response.ok) {
//     throw new Error(`Sight Engine API error for ${imageUrl}: ${responseText}`);
//   }

//   const analysis = JSON.parse(responseText);
//   const label = getSightEngineLabel(analysis);
//   return { imageUrl, analysis, label };
// }

// // ---------------------
// // Risk‐Score Calculation
// // (unchanged from before)
// // ---------------------
// function calculateRiskScore({ posts, postModerations, commentModerations }) {
//   const POSTS_COUNT = posts.length;
//   let rawScore = 0;

//   posts.forEach((post, idx) => {
//     const labels = post.labels || [];
//     const hasBadImage = labels.some(
//       (l) => l !== "safe" && l !== "no_image" && l !== "no_analysis"
//     );
//     if (hasBadImage) rawScore += 20;

//     const pm = postModerations[idx];
//     if (pm.flagged) rawScore += 10;
//   });

//   commentModerations.forEach((cm) => {
//     if (cm.flagged) rawScore += 5;
//   });

//   const maxRaw = POSTS_COUNT * 30 + commentModerations.length * 5;
//   const normalized = maxRaw > 0 ? (rawScore / maxRaw) * 100 : 0;
//   const riskScore = Math.min(100, Math.round(normalized));

//   let category = "low";
//   if (riskScore >= 60) category = "high";
//   else if (riskScore >= 30) category = "medium";

//   return { riskScore, category, rawScore, maxRaw };
// }

// // ---------------------
// // Main Handler
// // ---------------------
// export default async function handler(req, res) {
//   const { username } = req.query;
//   if (!username) {
//     return res.status(400).json({ error: "Username is required" });
//   }

//   try {
//     // 1) Fetch posts & comments from our two existing endpoints:
//     const { posts, comments } = await fetchUserData(username);

//     // 2) Fetch basic profile details (bio, name, picture, etc.)
//     const profileDetails = await fetchProfileDetails(username);

//     // 3) Build an engagement lookup
//     const engagementMetrics = aggregateEngagement(posts, comments);

//     // 4) Combine posts + comments into one big array for chunking
//     const combinedData = [...posts, ...comments];

//     // 5) Break into chunks of 5 items each
//     const chunks = chunkArray(combinedData, 5);

//     // 6) Call GPT for each chunk → partial risk scores
//     const riskPromises = chunks.map((chunk) =>
//       getRiskForChunk(chunk, engagementMetrics, profileDetails)
//     );
//     const partialRiskScores = await Promise.all(riskPromises);

//     // 7) Consolidate partial risk scores into one final risk score
//     const finalRiskScore = await getFinalRiskScore(partialRiskScores);

//     // 8) (Optional) Compute “top interests” in parallel
//     const interestsPromises = chunks.map((chunk) =>
//       getInterestsForChunk(chunk, engagementMetrics, profileDetails)
//     );
//     const partialInterestsArrays = await Promise.all(interestsPromises);

//     // Flatten interests and sum weights to compute percentages:
//     const weightedInterests = partialInterestsArrays.flat();
//     const aggregatedWeights = {};
//     weightedInterests.forEach((item) => {
//       const key = item.interest.trim().toLowerCase();
//       const weight = Number(item.weight) || 1;
//       aggregatedWeights[key] = (aggregatedWeights[key] || 0) + weight;
//     });
//     const totalWeight = Object.values(aggregatedWeights).reduce(
//       (sum, w) => sum + w,
//       0
//     );
//     const interestPercentages = Object.keys(aggregatedWeights).map(
//       (interest) => ({
//         interest,
//         percentage: ((aggregatedWeights[interest] / totalWeight) * 100).toFixed(2),
//       })
//     );
//     interestPercentages.sort((a, b) => b.percentage - a.percentage);
//     const topFiveInterestsWithPercentage = interestPercentages.slice(0, 5);

//     // 9) (Optional) Run “relationship” analysis in parallel
//     const taggedLookup = {};
//     posts.forEach((post) => {
//       post.tags.forEach((tag) => {
//         if (tag.username && tag.profileImage) {
//           taggedLookup[tag.username.trim()] = tag.profileImage;
//         }
//       });
//       post.taggedUsers.forEach((tg) => {
//         if (tg.username && tg.profileImage) {
//           taggedLookup[tg.username.trim()] = tg.profileImage;
//         }
//       });
//     });

//     const relationshipChunks = chunkArray(combinedData, 5);
//     const relationshipsPromises = relationshipChunks.map((chunk) =>
//       getRelationshipsForChunk(chunk, engagementMetrics, profileDetails)
//     );
//     const partialRelationships = await Promise.all(relationshipsPromises);

//     // Aggregate relationship “votes” weighted by engagement
//     const relationshipCounts = {};
//     partialRelationships.forEach((chunkResp) => {
//       Object.entries(chunkResp).forEach(([user, rel]) => {
//         if (!relationshipCounts[user]) {
//           relationshipCounts[user] = {
//             Family: 0,
//             "Girlfriend/Wife": 0,
//             "Boyfriend/Husband": 0,
//             Associate: 0,
//             Friend: 0,
//           };
//         }
//         const weight =
//           ((engagementMetrics[user]?.likes || 0) +
//             (engagementMetrics[user]?.comments || 0)) ||
//           1;
//         if (rel in relationshipCounts[user]) {
//           relationshipCounts[user][rel] += weight;
//         }
//       });
//     });

//     // Build final map { username → { relationship, profileImage } }
//     const defaultImage = "/no-profile-pic-img.png";
//     const finalRelationships = {};
//     Object.entries(relationshipCounts).forEach(([user, counts]) => {
//       if (user.startsWith("unknown_")) return;

//       let relationshipType = "";
//       if (counts.Family > 0) {
//         relationshipType = "Family";
//       } else if (
//         counts["Girlfriend/Wife"] > 0 ||
//         counts["Boyfriend/Husband"] > 0
//       ) {
//         relationshipType =
//           counts["Girlfriend/Wife"] >= counts["Boyfriend/Husband"]
//             ? "Girlfriend/Wife"
//             : "Boyfriend/Husband";
//       } else if (counts.Associate > counts.Friend) {
//         relationshipType = "Associate";
//       } else {
//         relationshipType = "Friend";
//       }

//       let profileImage =
//         taggedLookup[user] ||
//         posts.reduce((acc, post) => {
//           let found = post.tags.find((t) => t.username === user);
//           if (!found && post.taggedUsers) {
//             found = post.taggedUsers.find((t) => t.username === user);
//           }
//           return found && found.profileImage ? found.profileImage : acc;
//         }, "") ||
//         defaultImage;

//       finalRelationships[user] = {
//         username: user,
//         relationship: relationshipType,
//         profileImage,
//       };
//     });

//     // Override with official profileImage from fetchProfileDetails if available
//     const relationshipUsernames = Object.keys(finalRelationships);
//     const profileDetailsArr = await Promise.all(
//       relationshipUsernames.map((un) =>
//         fetchProfileDetails(un).catch(() => ({}))
//       )
//     );
//     relationshipUsernames.forEach((un, idx) => {
//       const details = profileDetailsArr[idx] || {};
//       if (details.profileImage) {
//         finalRelationships[un].profileImage = details.profileImage;
//       }
//     });
//     const relationshipsOutput =
//       Object.keys(finalRelationships).length > 0
//         ? finalRelationships
//         : "No relationships found";

//     // 10) Main user profile image from profileDetails
//     const mainUserProfileImage =
//       profileDetails.profileImage || defaultImage;

//     // 11) If finalRiskScore > 60, optionally run Sightengine on every post’s image
//     let imageAnalysisResults = [];
//     if (Number(finalRiskScore) > 60) {
//       const imagesToAnalyze = posts
//         .map((p) => p.imageUrl)
//         .filter((url) => url);
//       imageAnalysisResults = await Promise.all(
//         imagesToAnalyze.map((url) => analyzeImageWithSightEngine(url))
//       );
//     }

//     // 12) Return consolidated JSON
//     return res.status(200).json({
//       finalAnalysis: finalRiskScore,
//       topInterests: topFiveInterestsWithPercentage,
//       relationships: relationshipsOutput,
//       mainUserProfileImage,
//       imageAnalysis: imageAnalysisResults,
//     });
//   } catch (error) {
//     console.error("Error in riskScore handler:", error);
//     return res
//       .status(500)
//       .json({ error: error.message || "Internal server error." });
//   }
// }



// // src/pages/api/fb_riskscore.js
// import fetch from "node-fetch";

// // ---------------------
// // Data Simplification & Aggregation
// // ---------------------
// function simplifyData(items, type) {
//   return items.map((item) => {
//     const username =
//       item.username && item.username.trim() !== ""
//         ? item.username
//         : item.fullName && item.fullName.trim() !== ""
//         ? item.fullName
//         : `unknown_${item.id}`;

//     if (type === "post") {
//       return {
//         id: item.post_id || item.id,
//         caption: typeof item.message === "string" ? item.message.slice(0, 500) : "",
//         likeCount: item.reactions_count || item.like_count || 0,
//         username,
//         tags:
//           item.tags?.map((tag) => {
//             const tagUsername =
//               tag.username && tag.username.trim() !== ""
//                 ? tag.username
//                 : tag.fullName && tag.fullName.trim() !== ""
//                 ? tag.fullName
//                 : `unknown_${tag.id || "tag"}`;
//             return {
//               username: tagUsername,
//               fullName: tag.fullName || "",
//               profileImage: tag.profileImage || "",
//               gender: tag.gender || "",
//             };
//           }) || [],
//         taggedUsers:
//           item.tagged_users?.length > 0
//             ? item.tagged_users.map((tagged) => ({
//                 username: tagged.user.username || "",
//                 fullName: tagged.user.full_name || "",
//                 profileImage: tagged.user.profile_pic_url || "",
//               }))
//             : [],
//         imageUrl:
//           item.imageUrl ||
//           item.full_picture ||
//           (item.album_preview && item.album_preview[0]?.image_file_uri) ||
//           (item.image_versions && item.image_versions.items?.[0]?.url) ||
//           null,
//         labels: item.labels || [],        // pass along labels array from fb_posts
//         scores: item.scores || {},        // pass along Sightengine scores if any
//       };
//     } else if (type === "comment") {
//       return {
//         id: item.comment_id || item.id,
//         text: typeof item.message === "string" ? item.message.slice(0, 500) : "",
//         username,
//         likeCount: item.like_count || 0,
//         author: item.author || {},       // retain author info if needed
//       };
//     }
//     return item;
//   });
// }

// function aggregateEngagement(posts, comments) {
//   const engagement = {};
//   posts.forEach((post) => {
//     const user = post.username;
//     if (user) {
//       engagement[user] = engagement[user] || { likes: 0, comments: 0 };
//       engagement[user].likes += post.likeCount;
//     }
//     post.tags.forEach((tag) => {
//       const tagUser = tag.username;
//       if (tagUser) {
//         engagement[tagUser] = engagement[tagUser] || { likes: 0, comments: 0 };
//         // Heuristic: tagged users get half of that post’s likes
//         engagement[tagUser].likes += Math.floor(post.likeCount / 2);
//       }
//     });
//   });
//   comments.forEach((comment) => {
//     const user = comment.username;
//     if (user) {
//       engagement[user] = engagement[user] || { likes: 0, comments: 0 };
//       engagement[user].comments += 1;
//       engagement[user].likes += comment.likeCount;
//     }
//   });
//   return engagement;
// }

// function chunkArray(arr, chunkSize = 5) {
//   const chunks = [];
//   for (let i = 0; i < arr.length; i += chunkSize) {
//     chunks.push(arr.slice(i, i + chunkSize));
//   }
//   return chunks;
// }

// function isValidRiskScore(score) {
//   const num = Number(score);
//   return !isNaN(num) && num >= 0 && num <= 100;
// }

// function extractValidJSON(text) {
//   const startIndex = text.indexOf("{");
//   if (startIndex === -1) return null;
//   let openBraces = 0;
//   let endIndex = startIndex;
//   for (let i = startIndex; i < text.length; i++) {
//     if (text[i] === "{") openBraces++;
//     if (text[i] === "}") openBraces--;
//     if (openBraces === 0) {
//       endIndex = i;
//       break;
//     }
//   }
//   return text.substring(startIndex, endIndex + 1);
// }

// // ---------------------
// // OpenAI & Sightengine Helpers
// // (unchanged from before)
// // ---------------------
// async function callOpenAIModeration(text) {
//   if (!process.env.OPENAI_API_KEY) {
//     return { flagged: false, categories: {}, category_scores: {} };
//   }
//   try {
//     const resp = await fetch("https://api.openai.com/v1/moderations", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//       },
//       body: JSON.stringify({ input: text }),
//     });
//     const json = await resp.json();
//     const result = Array.isArray(json.results) ? json.results[0] : null;
//     if (!result) {
//       return { flagged: false, categories: {}, category_scores: {} };
//     }
//     return {
//       flagged: result.flagged,
//       categories: result.categories,
//       category_scores: result.category_scores,
//     };
//   } catch (err) {
//     console.error("OpenAI moderation failed:", err);
//     return { flagged: false, categories: {}, category_scores: {} };
//   }
// }

// async function analyzeImageWithSightengine(imageUrl, postId) {
//   const { SIGHTENGINE_API_USER, SIGHTENGINE_API_SECRET } = process.env;
//   if (!SIGHTENGINE_API_USER || !SIGHTENGINE_API_SECRET) {
//     return { labels: ["no_analysis"], scores: {} };
//   }
//   const params = {
//     api_user: SIGHTENGINE_API_USER,
//     api_secret: SIGHTENGINE_API_SECRET,
//     models: "nudity,wad,offensive",
//     url: imageUrl,
//   };
//   const query = new URLSearchParams(params).toString();
//   const sightUrl = `https://api.sightengine.com/1.0/check.json?${query}`;

//   try {
//     const resp = await fetch(sightUrl);
//     if (!resp.ok) {
//       console.error(`Sightengine returned ${resp.status} for post ${postId}`);
//       return { labels: ["analysis_error"], scores: {} };
//     }
//     const result = await resp.json();
//     const scores = {
//       nudity_raw: result.nudity?.raw ?? 0,
//       nudity_partial: result.nudity?.partial ?? 0,
//       nudity_safe: result.nudity?.safe ?? 0,
//       weapon: result.weapon ?? 0,
//       alcohol: result.alcohol ?? 0,
//       drugs: result.drugs ?? 0,
//       offensive_prob: result.offensive?.prob ?? 0,
//     };
//     const THRESHOLD = 0.99;
//     const labels = [];
//     if (scores.nudity_raw >= THRESHOLD) labels.push("nudity-explicit");
//     if (scores.weapon >= THRESHOLD) labels.push("weapon");
//     if (scores.alcohol >= THRESHOLD) labels.push("alcohol");
//     if (scores.drugs >= THRESHOLD) labels.push("drugs");
//     if (scores.offensive_prob >= THRESHOLD) labels.push("offensive");
//     if (labels.length === 0) labels.push("safe");
//     return { labels, scores };
//   } catch (err) {
//     console.error(`Sightengine request for post ${postId} failed:`, err);
//     return { labels: ["analysis_error"], scores: {} };
//   }
// }

// // The chunked prompt that returns one partial risk score (0–100) for a batch of items
// async function getRiskForChunk(chunk, aggregatedData, profileDetails) {
//   const jsonData = JSON.stringify({
//     data: chunk,
//     engagementMetrics: aggregatedData,
//     profileDetails,
//   });
//   const prompt =
// `You are a seasoned intelligence analyst evaluating the risk level of a social media profile.
// Based on the JSON data below, calculate a risk score between 0 (minimal risk) and 100 (very high risk).
// The instructions are:
// 1. If the profile is normal and exhibits little or no concerning activity, assign a risk score that is moderate and low. In such cases, the risk score should not exceed 20–30.
// 2. Only if the data indicates significant signs of concerning activity should the risk score be high (above 60).
// 3. Return only the risk score as a single number with no extra text.

// Data: ${jsonData}`;

//   const response = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "gpt-4o-2024-08-06",
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 20,
//       temperature: 0.2,
//     }),
//   });

//   const responseText = await response.text();
//   if (!response.ok) {
//     throw new Error(`OpenAI API error (risk chunk): ${responseText}`);
//   }
//   const dataResp = JSON.parse(responseText);
//   const score = dataResp.choices[0].message.content.trim();
//   if (!isValidRiskScore(score)) {
//     console.warn("Invalid risk score received:", score);
//   }
//   return score;
// }

// // After we have a list of partial risk scores (strings “0”–“100”), consolidate them
// async function getFinalRiskScore(partialScores) {
//   const combinedScores = partialScores.join("\n");
//   const prompt =
// `You are a seasoned intelligence analyst. Given the following partial risk scores, consolidate them into a final risk score between 0 and 100.
// Return only the final risk score with no extra text.

// Partial Risk Scores:
// ${combinedScores}`;

//   const response = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "gpt-4o-2024-08-06",
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 20,
//       temperature: 0.2,
//     }),
//   });
//   const responseText = await response.text();
//   if (!response.ok) {
//     throw new Error(`OpenAI Aggregation API error (risk): ${responseText}`);
//   }
//   const dataResp = JSON.parse(responseText);
//   const finalScore = dataResp.choices[0].message.content.trim();
//   if (!isValidRiskScore(finalScore)) {
//     console.warn("Invalid final risk score received:", finalScore);
//   }
//   return finalScore;
// }

// // Similar “chunked” pattern for interests (not strictly part of “risk score,” but included here)
// async function getInterestsForChunk(chunk, aggregatedData, profileDetails) {
//   const jsonData = JSON.stringify({
//     data: chunk,
//     engagementMetrics: aggregatedData,
//     profileDetails,
//   });
//   const prompt =
// `You are a social media analyst tasked with identifying the core interests of a user based on their activity data. For each interest, assign a weight between 1 and 10 indicating its prominence in the user's engagement. Return a valid JSON array of objects, each with the keys "interest" (a string) and "weight" (a number). Do not include any extra text.

// Data: ${jsonData}`;

//   const response = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "gpt-4o-2024-08-06",
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 80,
//       temperature: 0.2,
//     }),
//   });
//   const responseText = await response.text();
//   if (!response.ok) {
//     throw new Error(`OpenAI API error (interests chunk): ${responseText}`);
//   }
//   const dataResp = JSON.parse(responseText);
//   try {
//     let content = dataResp.choices[0].message.content.trim();
//     content = content
//       .replace(/^```(?:json\s*)?/, "")
//       .replace(/```$/, "")
//       .trim();
//     return JSON.parse(content);
//   } catch (error) {
//     console.warn("Error parsing interests:", error);
//     return [];
//   }
// }

// // “Relationship” classification (if you also want to include relationship analysis)
// async function getRelationshipsForChunk(chunk, aggregatedData, profileDetails) {
//   const jsonData = JSON.stringify({
//     data: chunk,
//     engagementMetrics: aggregatedData,
//     profileDetails,
//     note:
//       "For any user with a username starting with 'unknown_', treat the data as incomplete. Use any available metadata such as fullName or gender to classify the relationship.",
//   });

//   const prompt =
// `Analyze the target user's social media connections and classify relationships as Friend, Associate, Relative, or Girlfriend/Boyfriend based on:

// Same last name in likes or comments → Relative
// More than 2 likes/comments from the same profile with slang phrases (e.g., "bro you livin", "I see my man", "let’s go") → Friend
// Business-like or formal comments → Associate
// Multiple tags or likes from an opposite-gender profile:
//   – If the target is male and the profile is female with high tag/like frequency → Girlfriend/Wife
//   – If the target is female and the profile is male with high tag/like frequency → Boyfriend/Husband
// Multiple likes from an opposite-gender profile alone can also indicate a romantic partner

// IMPORTANT:
// • Output only a valid JSON object without any markdown or extra text.
// • Map each username to one of these exact strings: "Family", "Associate", "Friend", "Girlfriend/Wife", or "Boyfriend/Husband".
// • If no relationships can be determined, output {}.

// Data: ${jsonData}`;

//   const response = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "gpt-4o-2024-08-06",
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 200,
//       temperature: 0.2,
//     }),
//   });

//   const responseText = await response.text();
//   if (!response.ok) {
//     throw new Error(`OpenAI API error (relationships chunk): ${responseText}`);
//   }

//   const dataResp = JSON.parse(responseText);
//   let content = dataResp.choices[0].message.content.trim();
//   content = content.replace(/^```(?:json)?\n?/, "").replace(/```$/, "").trim();
//   try {
//     return JSON.parse(content);
//   } catch (error) {
//     console.warn("Error parsing relationships:", error);
//     const extracted = extractValidJSON(content);
//     if (extracted) {
//       try {
//         return JSON.parse(extracted);
//       } catch (err) {
//         console.warn("Fallback JSON parsing failed:", err);
//       }
//     }
//     return {};
//   }
// }

// // ---------------------
// // Data Fetching (Posts / Comments / ProfileDetails)
// // ---------------------

// /**
//  * 1) Fetch up to 5 pages of posts using your existing /api/fb_posts endpoint.
//  *    You must pass `username` (or `profile_id`) plus `limit=3` to get exactly 3 posts each call,
//  *    then use the returned `cursor` to fetch next page, up to `maxPages`.
//  */
// async function fetchUserData(username) {
//   let allPosts = [];
//   let allComments = [];

//   let nextCursor = null;
//   const maxPages = 5;  // up to 5 * 3 = 15 posts total, if needed

//   for (let page = 1; page <= maxPages; page++) {
//     // Build URL: /api/fb_posts?username=<username>&limit=3&cursor=<cursor>
//     const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/fb_posts`);
//     url.searchParams.set("username", username);
//     url.searchParams.set("limit", "3");
//     if (nextCursor) {
//       url.searchParams.set("cursor", nextCursor);
//     }

//     const postsRes = await fetch(url.toString());
//     if (!postsRes.ok) {
//       console.warn(`Failed to fetch fb_posts on page ${page}`);
//       break;
//     }
//     const postsJson = await postsRes.json();
//     const rawPosts = Array.isArray(postsJson.results) ? postsJson.results : [];
//     if (rawPosts.length === 0) break;

//     // Simplify each post
//     const simplifiedPosts = simplifyData(rawPosts, "post");
//     allPosts.push(...simplifiedPosts);

//     // Save cursor for next iteration; if no cursor, we’re done
//     nextCursor = postsJson.cursor || null;
//     if (!nextCursor) break;
//   }

//   // Log the total number of posts fetched:
//   console.log("Total posts fetched:", allPosts.length);

//   // Now fetch comments for every post (in parallel)
//   const commentFetches = allPosts.map(async (post) => {
//     if (!post.id) return [];
//     // Call your existing endpoint: /api/fetch_fb_comments?post_id=<postId>
//     const cUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/fetch_fb_comments`);
//     cUrl.searchParams.set("post_id", post.id);

//     const cRes = await fetch(cUrl.toString());
//     if (!cRes.ok) {
//       console.warn(`Failed to fetch fb comments for post ${post.id}`);
//       return [];
//     }
//     const cJson = await cRes.json();
//     const rawComments = Array.isArray(cJson.results) ? cJson.results : [];
//     // Simplify each comment
//     return simplifyData(rawComments, "comment");
//   });

//   const commentsArrays = await Promise.all(commentFetches);
//   commentsArrays.forEach((arr) => {
//     allComments.push(...arr);
//   });

//   return { posts: allPosts, comments: allComments };
// }

// /**
//  * 2) Fetch “profile details” via your existing /api/facebookSearch?username=<username>
//  *    That returns JSON with keys like { name, profile_id, url, image, intro, cover_image, gender, about, about_public, … }.
//  */
// async function fetchProfileDetails(username) {
//   const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/facebookSearch`);
//   url.searchParams.set("username", username);

//   const detailsRes = await fetch(url.toString());
//   if (!detailsRes.ok) {
//     throw new Error("Failed to fetch Facebook profile details");
//   }
//   return detailsRes.json();
// }

// // ---------------------
// // Sightengine Convenience (optional final image analysis if risk is high)
// // ---------------------
// function getSightEngineLabel(analysis) {
//   const labels = [];
//   if (analysis.nudity && analysis.nudity.safe < 0.8) {
//     labels.push("adult content");
//   }
//   if (analysis.offensive && analysis.offensive.prob > 0.01) {
//     labels.push("offensive");
//   }
//   if (analysis.weapon && analysis.weapon > 0.005) {
//     labels.push("weapon");
//   }
//   if (analysis.drugs && analysis.drugs > 0.005) {
//     labels.push("drugs");
//   }
//   if (labels.length === 0) {
//     labels.push("safe");
//   }
//   return labels.join(", ");
// }

// async function analyzeImageWithSightEngine(imageUrl) {
//   const apiUser = "150452328";
//   const apiSecret = "uEzhj5Q2FVbg4jfnB4mRc84cdRqTpz4m";
//   const endpoint = "https://api.sightengine.com/1.0/check.json";
//   const params = new URLSearchParams({
//     api_user: apiUser,
//     api_secret: apiSecret,
//     models: "nudity,wad,offensive",
//     url: imageUrl,
//   });
//   const url = `${endpoint}?${params.toString()}`;

//   const response = await fetch(url);
//   const responseText = await response.text();
//   if (!response.ok) {
//     throw new Error(`Sight Engine API error for ${imageUrl}: ${responseText}`);
//   }

//   const analysis = JSON.parse(responseText);
//   const label = getSightEngineLabel(analysis);
//   return { imageUrl, analysis, label };
// }

// // ---------------------
// // Risk‐Score Calculation
// // (unchanged from before)
// // ---------------------
// function calculateRiskScore({ posts, postModerations, commentModerations }) {
//   const POSTS_COUNT = posts.length;
//   let rawScore = 0;

//   posts.forEach((post, idx) => {
//     const labels = post.labels || [];
//     const hasBadImage = labels.some(
//       (l) => l !== "safe" && l !== "no_image" && l !== "no_analysis"
//     );
//     if (hasBadImage) rawScore += 20;

//     const pm = postModerations[idx];
//     if (pm.flagged) rawScore += 10;
//   });

//   commentModerations.forEach((cm) => {
//     if (cm.flagged) rawScore += 5;
//   });

//   const maxRaw = POSTS_COUNT * 30 + commentModerations.length * 5;
//   const normalized = maxRaw > 0 ? (rawScore / maxRaw) * 100 : 0;
//   const riskScore = Math.min(100, Math.round(normalized));

//   let category = "low";
//   if (riskScore >= 60) category = "high";
//   else if (riskScore >= 30) category = "medium";

//   return { riskScore, category, rawScore, maxRaw };
// }

// // ---------------------
// // Main Handler
// // ---------------------
// export default async function handler(req, res) {
//   const { username } = req.query;
//   if (!username) {
//     return res.status(400).json({ error: "Username is required" });
//   }

//   try {
//     // 1) Fetch posts & comments from our two existing endpoints:
//     const { posts, comments } = await fetchUserData(username);

//     // 2) Fetch basic profile details (bio, name, picture, etc.)
//     const profileDetails = await fetchProfileDetails(username);

//     // 3) Build an engagement lookup
//     const engagementMetrics = aggregateEngagement(posts, comments);

//     // 4) Combine posts + comments into one big array for chunking
//     const combinedData = [...posts, ...comments];

//     // 5) Break into chunks of 5 items each
//     const chunks = chunkArray(combinedData, 5);

//     // 6) Call GPT for each chunk → partial risk scores
//     const riskPromises = chunks.map((chunk) =>
//       getRiskForChunk(chunk, engagementMetrics, profileDetails)
//     );
//     const partialRiskScores = await Promise.all(riskPromises);

//     // 7) Consolidate partial risk scores into one final risk score
//     const finalRiskScore = await getFinalRiskScore(partialRiskScores);

//     // 8) (Optional) Compute “top interests” in parallel
//     const interestsPromises = chunks.map((chunk) =>
//       getInterestsForChunk(chunk, engagementMetrics, profileDetails)
//     );
//     const partialInterestsArrays = await Promise.all(interestsPromises);

//     // Flatten interests and sum weights to compute percentages:
//     const weightedInterests = partialInterestsArrays.flat();
//     const aggregatedWeights = {};
//     weightedInterests.forEach((item) => {
//       const key = item.interest.trim().toLowerCase();
//       const weight = Number(item.weight) || 1;
//       aggregatedWeights[key] = (aggregatedWeights[key] || 0) + weight;
//     });
//     const totalWeight = Object.values(aggregatedWeights).reduce(
//       (sum, w) => sum + w,
//       0
//     );
//     const interestPercentages = Object.keys(aggregatedWeights).map(
//       (interest) => ({
//         interest,
//         percentage: ((aggregatedWeights[interest] / totalWeight) * 100).toFixed(2),
//       })
//     );
//     interestPercentages.sort((a, b) => b.percentage - a.percentage);
//     const topFiveInterestsWithPercentage = interestPercentages.slice(0, 5);

//     // 9) (Optional) Run “relationship” analysis in parallel
//     const taggedLookup = {};
//     posts.forEach((post) => {
//       post.tags.forEach((tag) => {
//         if (tag.username && tag.profileImage) {
//           taggedLookup[tag.username.trim()] = tag.profileImage;
//         }
//       });
//       post.taggedUsers.forEach((tg) => {
//         if (tg.username && tg.profileImage) {
//           taggedLookup[tg.username.trim()] = tg.profileImage;
//         }
//       });
//     });

//     const relationshipChunks = chunkArray(combinedData, 5);
//     const relationshipsPromises = relationshipChunks.map((chunk) =>
//       getRelationshipsForChunk(chunk, engagementMetrics, profileDetails)
//     );
//     const partialRelationships = await Promise.all(relationshipsPromises);

//     // Aggregate relationship “votes” weighted by engagement
//     const relationshipCounts = {};
//     partialRelationships.forEach((chunkResp) => {
//       Object.entries(chunkResp).forEach(([user, rel]) => {
//         if (!relationshipCounts[user]) {
//           relationshipCounts[user] = {
//             Family: 0,
//             "Girlfriend/Wife": 0,
//             "Boyfriend/Husband": 0,
//             Associate: 0,
//             Friend: 0,
//           };
//         }
//         const weight =
//           ((engagementMetrics[user]?.likes || 0) +
//             (engagementMetrics[user]?.comments || 0)) ||
//           1;
//         if (rel in relationshipCounts[user]) {
//           relationshipCounts[user][rel] += weight;
//         }
//       });
//     });

//     // Build final map { username → { relationship, profileImage } }
//     const defaultImage = "/no-profile-pic-img.png";
//     const finalRelationships = {};
//     Object.entries(relationshipCounts).forEach(([user, counts]) => {
//       if (user.startsWith("unknown_")) return;

//       let relationshipType = "";
//       if (counts.Family > 0) {
//         relationshipType = "Family";
//       } else if (
//         counts["Girlfriend/Wife"] > 0 ||
//         counts["Boyfriend/Husband"] > 0
//       ) {
//         relationshipType =
//           counts["Girlfriend/Wife"] >= counts["Boyfriend/Husband"]
//             ? "Girlfriend/Wife"
//             : "Boyfriend/Husband";
//       } else if (counts.Associate > counts.Friend) {
//         relationshipType = "Associate";
//       } else {
//         relationshipType = "Friend";
//       }

//       let profileImage =
//         taggedLookup[user] ||
//         posts.reduce((acc, post) => {
//           let found = post.tags.find((t) => t.username === user);
//           if (!found && post.taggedUsers) {
//             found = post.taggedUsers.find((t) => t.username === user);
//           }
//           return found && found.profileImage ? found.profileImage : acc;
//         }, "") ||
//         defaultImage;

//       finalRelationships[user] = {
//         username: user,
//         relationship: relationshipType,
//         profileImage,
//       };
//     });

//     // Override with official profileImage from fetchProfileDetails if available
//     const relationshipUsernames = Object.keys(finalRelationships);
//     const profileDetailsArr = await Promise.all(
//       relationshipUsernames.map((un) =>
//         fetchProfileDetails(un).catch(() => ({}))
//       )
//     );
//     relationshipUsernames.forEach((un, idx) => {
//       const details = profileDetailsArr[idx] || {};
//       if (details.profileImage) {
//         finalRelationships[un].profileImage = details.profileImage;
//       }
//     });
//     const relationshipsOutput =
//       Object.keys(finalRelationships).length > 0
//         ? finalRelationships
//         : "No relationships found";

//     // 10) Main user profile image from profileDetails
//     const mainUserProfileImage =
//       profileDetails.profileImage || defaultImage;

//     // 11) If finalRiskScore > 60, optionally run Sightengine on every post’s image
//     let imageAnalysisResults = [];
//     if (Number(finalRiskScore) > 60) {
//       const imagesToAnalyze = posts
//         .map((p) => p.imageUrl)
//         .filter((url) => url);
//       imageAnalysisResults = await Promise.all(
//         imagesToAnalyze.map((url) => analyzeImageWithSightEngine(url))
//       );
//     }

//     // 12) Return consolidated JSON, including postCount:
//     return res.status(200).json({
//       finalAnalysis: finalRiskScore,
//       postCount: posts.length,                     // <--- how many posts we fetched
//       topInterests: topFiveInterestsWithPercentage,
//       relationships: relationshipsOutput,
//       mainUserProfileImage,
//       imageAnalysis: imageAnalysisResults,
//     });
//   } catch (error) {
//     console.error("Error in riskScore handler:", error);
//     return res
//       .status(500)
//       .json({ error: error.message || "Internal server error." });
//   }
// }


// // src/pages/api/fb_riskscore.js (almost correct code)
// import fetch from "node-fetch";

// // ---------------------
// // Data Simplification & Aggregation
// // ---------------------
// function simplifyData(items, type) {
//   return items.map((item) => {
//     const username =
//       item.username && item.username.trim() !== ""
//         ? item.username
//         : item.fullName && item.fullName.trim() !== ""
//         ? item.fullName
//         : `unknown_${item.id}`;

//     if (type === "post") {
//       return {
//         // Facebook‐posts use either post_id or id
//         id: item.post_id || item.id,
//         caption: typeof item.message === "string" ? item.message.slice(0, 500) : "",
//         likeCount: item.reactions_count || item.like_count || 0,
//         username,
//         tags:
//           item.tags?.map((tag) => {
//             const tagUsername =
//               tag.username && tag.username.trim() !== ""
//                 ? tag.username
//                 : tag.fullName && tag.fullName.trim() !== ""
//                 ? tag.fullName
//                 : `unknown_${tag.id || "tag"}`;
//             return {
//               username: tagUsername,
//               fullName: tag.fullName || "",
//               profileImage: tag.profileImage || "",
//               gender: tag.gender || "",
//             };
//           }) || [],
//         taggedUsers:
//           item.tagged_users?.length > 0
//             ? item.tagged_users.map((tagged) => ({
//                 username: tagged.user.username || "",
//                 fullName: tagged.user.full_name || "",
//                 profileImage: tagged.user.profile_pic_url || "",
//               }))
//             : [],
//         imageUrl:
//           item.imageUrl ||
//           item.full_picture ||
//           (item.album_preview && item.album_preview[0]?.image_file_uri) ||
//           (item.image_versions && item.image_versions.items?.[0]?.url) ||
//           null,
//         labels: item.labels || [],   // from /api/fb_posts (Sightengine labels)
//         scores: item.scores || {},   // Sightengine raw scores if any
//       };
//     } else if (type === "comment") {
//       return {
//         id: item.comment_id || item.id,
//         text: typeof item.message === "string" ? item.message.slice(0, 500) : "",
//         username,
//         likeCount: item.like_count || 0,
//         author: item.author || {}, // Facebook‐comment author info (including .url)
//       };
//     }
//     return item;
//   });
// }

// function aggregateEngagement(posts, comments) {
//   const engagement = {};

//   posts.forEach((post) => {
//     const user = post.username;
//     if (user) {
//       engagement[user] = engagement[user] || { likes: 0, comments: 0 };
//       engagement[user].likes += post.likeCount;
//     }
//     post.tags.forEach((tag) => {
//       const tagUser = tag.username;
//       if (tagUser) {
//         engagement[tagUser] = engagement[tagUser] || { likes: 0, comments: 0 };
//         // Heuristic: tagged users get half of that post’s likes
//         engagement[tagUser].likes += Math.floor(post.likeCount / 2);
//       }
//     });
//   });

//   comments.forEach((comment) => {
//     const user = comment.username;
//     if (user) {
//       engagement[user] = engagement[user] || { likes: 0, comments: 0 };
//       engagement[user].comments += 1;
//       engagement[user].likes += comment.likeCount;
//     }
//   });

//   return engagement;
// }

// function chunkArray(arr, chunkSize = 5) {
//   const chunks = [];
//   for (let i = 0; i < arr.length; i += chunkSize) {
//     chunks.push(arr.slice(i, i + chunkSize));
//   }
//   return chunks;
// }

// function isValidRiskScore(score) {
//   const num = Number(score);
//   return !isNaN(num) && num >= 0 && num <= 100;
// }

// function extractValidJSON(text) {
//   const startIndex = text.indexOf("{");
//   if (startIndex === -1) return null;
//   let openBraces = 0;
//   let endIndex = startIndex;
//   for (let i = startIndex; i < text.length; i++) {
//     if (text[i] === "{") openBraces++;
//     if (text[i] === "}") openBraces--;
//     if (openBraces === 0) {
//       endIndex = i;
//       break;
//     }
//   }
//   return text.substring(startIndex, endIndex + 1);
// }

// // ---------------------
// // OpenAI & Sightengine Helpers
// // ---------------------
// async function callOpenAIModeration(text) {
//   if (!process.env.OPENAI_API_KEY) {
//     return { flagged: false, categories: {}, category_scores: {} };
//   }
//   try {
//     const resp = await fetch("https://api.openai.com/v1/moderations", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//       },
//       body: JSON.stringify({ input: text }),
//     });
//     const json = await resp.json();
//     const result = Array.isArray(json.results) ? json.results[0] : null;
//     if (!result) {
//       return { flagged: false, categories: {}, category_scores: {} };
//     }
//     return {
//       flagged: result.flagged,
//       categories: result.categories,
//       category_scores: result.category_scores,
//     };
//   } catch (err) {
//     console.error("OpenAI moderation failed:", err);
//     return { flagged: false, categories: {}, category_scores: {} };
//   }
// }

// async function analyzeImageWithSightengine(imageUrl, postId) {
//   const { SIGHTENGINE_API_USER, SIGHTENGINE_API_SECRET } = process.env;
//   if (!SIGHTENGINE_API_USER || !SIGHTENGINE_API_SECRET) {
//     return { labels: ["no_analysis"], scores: {} };
//   }
//   const params = {
//     api_user: SIGHTENGINE_API_USER,
//     api_secret: SIGHTENGINE_API_SECRET,
//     models: "nudity,wad,offensive",
//     url: imageUrl,
//   };
//   const query = new URLSearchParams(params).toString();
//   const sightUrl = `https://api.sightengine.com/1.0/check.json?${query}`;

//   try {
//     const resp = await fetch(sightUrl);
//     if (!resp.ok) {
//       console.error(`Sightengine returned ${resp.status} for post ${postId}`);
//       return { labels: ["analysis_error"], scores: {} };
//     }
//     const result = await resp.json();
//     const scores = {
//       nudity_raw: result.nudity?.raw ?? 0,
//       nudity_partial: result.nudity?.partial ?? 0,
//       nudity_safe: result.nudity?.safe ?? 0,
//       weapon: result.weapon ?? 0,
//       alcohol: result.alcohol ?? 0,
//       drugs: result.drugs ?? 0,
//       offensive_prob: result.offensive?.prob ?? 0,
//     };
//     const THRESHOLD = 0.99;
//     const labels = [];
//     if (scores.nudity_raw >= THRESHOLD) labels.push("nudity-explicit");
//     if (scores.weapon >= THRESHOLD) labels.push("weapon");
//     if (scores.alcohol >= THRESHOLD) labels.push("alcohol");
//     if (scores.drugs >= THRESHOLD) labels.push("drugs");
//     if (scores.offensive_prob >= THRESHOLD) labels.push("offensive");
//     if (labels.length === 0) labels.push("safe");
//     return { labels, scores };
//   } catch (err) {
//     console.error(`Sightengine request for post ${postId} failed:`, err);
//     return { labels: ["analysis_error"], scores: {} };
//   }
// }

// async function getRiskForChunk(chunk, aggregatedData, profileDetails) {
//   const jsonData = JSON.stringify({
//     data: chunk,
//     engagementMetrics: aggregatedData,
//     profileDetails,
//   });
//   const prompt = 
// `You are a seasoned intelligence analyst evaluating the risk level of a social media profile.
// Based on the JSON data below, calculate a risk score between 0 (minimal risk) and 100 (very high risk).
// The instructions are:
// 1. If the profile is normal and exhibits little or no concerning activity, assign a risk score that is moderate and low. In such cases, the risk score should not exceed 20–30.
// 2. Only if the data indicates significant signs of concerning activity should the risk score be high (above 60).
// 3. Return only the risk score as a single number with no extra text.

// Data: ${jsonData}`;

//   const response = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "gpt-4o-2024-08-06",
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 20,
//       temperature: 0.2,
//     }),
//   });

//   const responseText = await response.text();
//   if (!response.ok) {
//     throw new Error(`OpenAI API error (risk chunk): ${responseText}`);
//   }
//   const dataResp = JSON.parse(responseText);
//   const score = dataResp.choices[0].message.content.trim();
//   if (!isValidRiskScore(score)) {
//     console.warn("Invalid risk score received:", score);
//   }
//   return score;
// }

// async function getFinalRiskScore(partialScores) {
//   const combinedScores = partialScores.join("\n");
//   const prompt = 
// `You are a seasoned intelligence analyst. Given the following partial risk scores, consolidate them into a final risk score between 0 and 100.
// Return only the final risk score with no extra text.

// Partial Risk Scores:
// ${combinedScores}`;

//   const response = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "gpt-4o-2024-08-06",
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 20,
//       temperature: 0.2,
//     }),
//   });
//   const responseText = await response.text();
//   if (!response.ok) {
//     throw new Error(`OpenAI Aggregation API error (risk): ${responseText}`);
//   }
//   const dataResp = JSON.parse(responseText);
//   const finalScore = dataResp.choices[0].message.content.trim();
//   if (!isValidRiskScore(finalScore)) {
//     console.warn("Invalid final risk score received:", finalScore);
//   }
//   return finalScore;
// }

// async function getInterestsForChunk(chunk, aggregatedData, profileDetails) {
//   const jsonData = JSON.stringify({
//     data: chunk,
//     engagementMetrics: aggregatedData,
//     profileDetails,
//   });
//   const prompt =
// `You are a social media analyst tasked with identifying the core interests of a user based on their activity data. For each interest, assign a weight between 1 and 10 indicating its prominence in the user's engagement. Return a valid JSON array of objects, each with the keys "interest" (a string) and "weight" (a number). Do not include any extra text.

// Data: ${jsonData}`;

//   const response = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "gpt-4o-2024-08-06",
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 80,
//       temperature: 0.2,
//     }),
//   });
//   const responseText = await response.text();
//   if (!response.ok) {
//     throw new Error(`OpenAI API error (interests chunk): ${responseText}`);
//   }
//   const dataResp = JSON.parse(responseText);
//   try {
//     let content = dataResp.choices[0].message.content.trim();
//     content = content.replace(/^```(?:json\s*)?/, "").replace(/```$/, "").trim();
//     return JSON.parse(content);
//   } catch (error) {
//     console.warn("Error parsing interests:", error);
//     return [];
//   }
// }

// async function getRelationshipsForChunk(chunk, aggregatedData, profileDetails) {
//   const jsonData = JSON.stringify({
//     data: chunk,
//     engagementMetrics: aggregatedData,
//     profileDetails,
//     note:
//       "For any user with a username starting with 'unknown_', treat the data as incomplete. Use any available metadata such as fullName or gender to classify the relationship.",
//   });

//   const prompt =
// `Analyze the target user's social media connections and classify relationships as Friend, Associate, Relative, or Girlfriend/Boyfriend based on:

// Same last name in likes or comments → Relative
// More than 2 likes/comments from the same profile with slang phrases (e.g., "bro you livin", "I see my man", "let’s go") → Friend
// Business-like or formal comments → Associate
// Multiple tags or likes from an opposite-gender profile:
//   – If the target is male and the profile is female with high tag/like frequency → Girlfriend/Wife
//   – If the target is female and the profile is male with high tag/like frequency → Boyfriend/Husband
// Multiple likes from an opposite-gender profile alone can also indicate a romantic partner

// IMPORTANT:
// • Output only a valid JSON object without any markdown or extra text.
// • Map each username to one of these exact strings: "Family", "Associate", "Friend", "Girlfriend/Wife", or "Boyfriend/Husband".
// • If no relationships can be determined, output {}.

// Data: ${jsonData}`;

//   const response = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "gpt-4o-2024-08-06",
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 200,
//       temperature: 0.2,
//     }),
//   });

//   const responseText = await response.text();
//   if (!response.ok) {
//     throw new Error(`OpenAI API error (relationships chunk): ${responseText}`);
//   }

//   const dataResp = JSON.parse(responseText);
//   let content = dataResp.choices[0].message.content.trim();
//   content = content.replace(/^```(?:json)?\n?/, "").replace(/```$/, "").trim();
//   try {
//     return JSON.parse(content);
//   } catch (error) {
//     console.warn("Error parsing relationships:", error);
//     const extracted = extractValidJSON(content);
//     if (extracted) {
//       try {
//         return JSON.parse(extracted);
//       } catch (err) {
//         console.warn("Fallback JSON parsing failed:", err);
//       }
//     }
//     return {};
//   }
// }

// // ---------------------
// // Data Fetching (Posts / Comments / ProfileDetails)
// // ---------------------
// async function fetchUserData(username) {
//   let allPosts = [];
//   let allComments = [];
//   let nextCursor = null;
//   const maxPages = 5; // up to 5 pages of 3 posts each (15 posts total)

//   for (let page = 1; page <= maxPages; page++) {
//     const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/fb_posts`);
//     url.searchParams.set("username", username);
//     url.searchParams.set("limit", "3");
//     if (nextCursor) {
//       url.searchParams.set("cursor", nextCursor);
//     }

//     const postsRes = await fetch(url.toString());
//     if (!postsRes.ok) {
//       console.warn(`Failed to fetch fb_posts on page ${page}`);
//       break;
//     }
//     const postsJson = await postsRes.json();
//     const rawPosts = Array.isArray(postsJson.results) ? postsJson.results : [];
//     if (rawPosts.length === 0) break;

//     const simplifiedPosts = simplifyData(rawPosts, "post");
//     allPosts.push(...simplifiedPosts);

//     nextCursor = postsJson.cursor || null;
//     if (!nextCursor) break;
//   }

//   console.log("Total posts fetched:", allPosts.length);

//   // Fetch comments for each post
//   const commentFetches = allPosts.map(async (post) => {
//     if (!post.id) return [];
//     const cUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/fetch_fb_comments`);
//     cUrl.searchParams.set("post_id", post.id);

//     const cRes = await fetch(cUrl.toString());
//     if (!cRes.ok) {
//       console.warn(`Failed to fetch fb comments for post ${post.id}`);
//       return [];
//     }
//     const cJson = await cRes.json();
//     const rawComments = Array.isArray(cJson.results) ? cJson.results : [];
//     return simplifyData(rawComments, "comment");
//   });

//   const commentsArrays = await Promise.all(commentFetches);
//   commentsArrays.forEach((arr) => allComments.push(...arr));

//   return { posts: allPosts, comments: allComments };
// }

// async function fetchProfileDetails(username) {
//   const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/facebookSearch`);
//   url.searchParams.set("username", username);

//   const detailsRes = await fetch(url.toString());
//   if (!detailsRes.ok) {
//     throw new Error("Failed to fetch Facebook profile details");
//   }
//   return detailsRes.json();
// }

// // ---------------------
// // Sightengine Convenience for high‐risk image analysis
// // ---------------------
// function getSightEngineLabel(analysis) {
//   const labels = [];
//   if (analysis.nudity && analysis.nudity.safe < 0.8) {
//     labels.push("adult content");
//   }
//   if (analysis.offensive && analysis.offensive.prob > 0.01) {
//     labels.push("offensive");
//   }
//   if (analysis.weapon && analysis.weapon > 0.005) {
//     labels.push("weapon");
//   }
//   if (analysis.drugs && analysis.drugs > 0.005) {
//     labels.push("drugs");
//   }
//   if (labels.length === 0) {
//     labels.push("safe");
//   }
//   return labels.join(", ");
// }

// async function analyzeImageWithSightEngine(imageUrl) {
//   const apiUser = "150452328";
//   const apiSecret = "uEzhj5Q2FVbg4jfnB4mRc84cdRqTpz4m";
//   const endpoint = "https://api.sightengine.com/1.0/check.json";
//   const params = new URLSearchParams({
//     api_user: apiUser,
//     api_secret: apiSecret,
//     models: "nudity,wad,offensive",
//     url: imageUrl,
//   });
//   const url = `${endpoint}?${params.toString()}`;

//   const response = await fetch(url);
//   const responseText = await response.text();
//   if (!response.ok) {
//     throw new Error(`Sight Engine API error for ${imageUrl}: ${responseText}`);
//   }

//   const analysis = JSON.parse(responseText);
//   const label = getSightEngineLabel(analysis);
//   return { imageUrl, analysis, label };
// }

// // ---------------------
// // Risk‐Score Calculation (unchanged from before)
// // ---------------------
// function calculateRiskScore({ posts, postModerations, commentModerations }) {
//   const POSTS_COUNT = posts.length;
//   let rawScore = 0;

//   posts.forEach((post, idx) => {
//     const labels = post.labels || [];
//     const hasBadImage = labels.some(
//       (l) => l !== "safe" && l !== "no_image" && l !== "no_analysis"
//     );
//     if (hasBadImage) rawScore += 20;

//     const pm = postModerations[idx];
//     if (pm.flagged) rawScore += 10;
//   });

//   commentModerations.forEach((cm) => {
//     if (cm.flagged) rawScore += 5;
//   });

//   const maxRaw = POSTS_COUNT * 30 + commentModerations.length * 5;
//   const normalized = maxRaw > 0 ? (rawScore / maxRaw) * 100 : 0;
//   const riskScore = Math.min(100, Math.round(normalized));

//   let category = "low";
//   if (riskScore >= 60) category = "high";
//   else if (riskScore >= 30) category = "medium";

//   return { riskScore, category, rawScore, maxRaw };
// }

// // ---------------------
// // Main Handler
// // ---------------------
// export default async function handler(req, res) {
//   const { username } = req.query;
//   if (!username) {
//     return res.status(400).json({ error: "Username is required" });
//   }

//   try {
//     // 1) Fetch posts & comments
//     const { posts, comments } = await fetchUserData(username);

//     // 2) Fetch profile details (includes `image` URL)
//     const profileDetails = await fetchProfileDetails(username);

//     // 3) Build engagement metrics
//     const engagementMetrics = aggregateEngagement(posts, comments);

//     // 4) Combine posts + comments for chunking
//     const combinedData = [...posts, ...comments];

//     // 5) Break into chunks of 5 items
//     const chunks = chunkArray(combinedData, 5);

//     // 6) GPT partial risk scores
//     const riskPromises = chunks.map((chunk) =>
//       getRiskForChunk(chunk, engagementMetrics, profileDetails)
//     );
//     const partialRiskScores = await Promise.all(riskPromises);

//     // 7) Final risk score
//     const finalRiskScore = await getFinalRiskScore(partialRiskScores);

//     // 8) GPT “interests” (optional)
//     const interestsPromises = chunks.map((chunk) =>
//       getInterestsForChunk(chunk, engagementMetrics, profileDetails)
//     );
//     const partialInterestsArrays = await Promise.all(interestsPromises);

//     const weightedInterests = partialInterestsArrays.flat();
//     const aggregatedWeights = {};
//     weightedInterests.forEach((item) => {
//       const key = item.interest.trim().toLowerCase();
//       const weight = Number(item.weight) || 1;
//       aggregatedWeights[key] = (aggregatedWeights[key] || 0) + weight;
//     });
//     const totalWeight = Object.values(aggregatedWeights).reduce(
//       (sum, w) => sum + w,
//       0
//     );
//     const interestPercentages = Object.keys(aggregatedWeights).map(
//       (interest) => ({
//         interest,
//         percentage: ((aggregatedWeights[interest] / totalWeight) * 100).toFixed(2),
//       })
//     );
//     interestPercentages.sort((a, b) => b.percentage - a.percentage);
//     const topFiveInterestsWithPercentage = interestPercentages.slice(0, 5);

//     // 9) GPT “relationships”
//     const taggedLookup = {};
//     posts.forEach((post) => {
//       post.tags.forEach((tag) => {
//         if (tag.username && tag.profileImage) {
//           taggedLookup[tag.username.trim()] = tag.profileImage;
//         }
//       });
//       post.taggedUsers.forEach((tg) => {
//         if (tg.username && tg.profileImage) {
//           taggedLookup[tg.username.trim()] = tg.profileImage;
//         }
//       });
//     });

//     const relationshipChunks = chunkArray(combinedData, 5);
//     const relationshipsPromises = relationshipChunks.map((chunk) =>
//       getRelationshipsForChunk(chunk, engagementMetrics, profileDetails)
//     );
//     const partialRelationships = await Promise.all(relationshipsPromises);

//     // Aggregate relationship “votes” weighted by engagement
//     const relationshipCounts = {};
//     partialRelationships.forEach((chunkResp) => {
//       Object.entries(chunkResp).forEach(([user, rel]) => {
//         if (!relationshipCounts[user]) {
//           relationshipCounts[user] = {
//             Family: 0,
//             "Girlfriend/Wife": 0,
//             "Boyfriend/Husband": 0,
//             Associate: 0,
//             Friend: 0,
//           };
//         }
//         const weight =
//           ((engagementMetrics[user]?.likes || 0) +
//             (engagementMetrics[user]?.comments || 0)) ||
//           1;
//         if (rel in relationshipCounts[user]) {
//           relationshipCounts[user][rel] += weight;
//         }
//       });
//     });

//     // Build finalRelationships { username → { relationship, profileImage } }
//     const defaultImage = "/no-profile-pic-img.png";
//     const finalRelationships = {};
//     Object.entries(relationshipCounts).forEach(([user, counts]) => {
//       if (user.startsWith("unknown_")) return;

//       let relationshipType = "";
//       if (counts.Family > 0) {
//         relationshipType = "Family";
//       } else if (
//         counts["Girlfriend/Wife"] > 0 ||
//         counts["Boyfriend/Husband"] > 0
//       ) {
//         relationshipType =
//           counts["Girlfriend/Wife"] >= counts["Boyfriend/Husband"]
//             ? "Girlfriend/Wife"
//             : "Boyfriend/Husband";
//       } else if (counts.Associate > counts.Friend) {
//         relationshipType = "Associate";
//       } else {
//         relationshipType = "Friend";
//       }

//       let profileImage =
//         taggedLookup[user] ||
//         posts.reduce((acc, post) => {
//           let found = post.tags.find((t) => t.username === user);
//           if (!found && post.taggedUsers) {
//             found = post.taggedUsers.find((t) => t.username === user);
//           }
//           return found && found.profileImage ? found.profileImage : acc;
//         }, "") ||
//         defaultImage;

//       finalRelationships[user] = {
//         username: user,
//         relationship: relationshipType,
//         profileImage,
//       };
//     });

//     // Override with “official” image from profileDetails (key is `image`)
//     const relationshipUsernames = Object.keys(finalRelationships);
//     const profileDetailsArr = await Promise.all(
//       relationshipUsernames.map((un) =>
//         fetchProfileDetails(un).catch(() => ({}))
//       )
//     );
//     relationshipUsernames.forEach((un, idx) => {
//       const details = profileDetailsArr[idx] || {};
//       if (details.image) {
//         finalRelationships[un].profileImage = details.image;
//       }
//     });
//     const relationshipsOutput =
//       Object.keys(finalRelationships).length > 0
//         ? finalRelationships
//         : "No relationships found";

//     // 10) Main user profile image (key is `image`, not `profileImage`)
//     const mainUserProfileImage = profileDetails.image || defaultImage;

//     // 11) If finalRiskScore > 60, optionally run Sightengine on every post’s image
//     let imageAnalysisResults = [];
//     if (Number(finalRiskScore) > 60) {
//       const imagesToAnalyze = posts.map((p) => p.imageUrl).filter((url) => url);
//       imageAnalysisResults = await Promise.all(
//         imagesToAnalyze.map((url) => analyzeImageWithSightEngine(url))
//       );
//     }

//     // 12) Return JSON (including postCount)
//     return res.status(200).json({
//       finalAnalysis: finalRiskScore,
//       postCount: posts.length,
//       topInterests: topFiveInterestsWithPercentage,
//       relationships: relationshipsOutput,
//       mainUserProfileImage,
//       imageAnalysis: imageAnalysisResults,
//     });
//   } catch (error) {
//     console.error("Error in riskScore handler:", error);
//     return res
//       .status(500)
//       .json({ error: error.message || "Internal server error." });
//   }
// }



// src/pages/api/fb_riskscore.js
import fetch from "node-fetch";

// ---------------------
// Data Simplification & Aggregation
// ---------------------
function simplifyData(items, type) {
  return items.map((item) => {
    const username =
      item.username && item.username.trim() !== ""
        ? item.username
        : item.fullName && item.fullName.trim() !== ""
        ? item.fullName
        : `unknown_${item.id}`;

    if (type === "post") {
      return {
        // Facebook‐posts use either post_id or id
        id: item.post_id || item.id,
        caption: typeof item.message === "string" ? item.message.slice(0, 500) : "",
        likeCount: item.reactions_count || item.like_count || 0,
        username,
        tags:
          item.tags?.map((tag) => {
            const tagUsername =
              tag.username && tag.username.trim() !== ""
                ? tag.username
                : tag.fullName && tag.fullName.trim() !== ""
                ? tag.fullName
                : `unknown_${tag.id || "tag"}`;
            return {
              username: tagUsername,
              fullName: tag.fullName || "",
              profileImage: tag.profileImage || "",
              gender: tag.gender || "",
            };
          }) || [],
        taggedUsers:
          item.tagged_users?.length > 0
            ? item.tagged_users.map((tagged) => ({
                username: tagged.user.username || "",
                fullName: tagged.user.full_name || "",
                profileImage: tagged.user.profile_pic_url || "",
              }))
            : [],
        imageUrl:
          item.imageUrl ||
          item.full_picture ||
          (item.album_preview && item.album_preview[0]?.image_file_uri) ||
          (item.image_versions && item.image_versions.items?.[0]?.url) ||
          null,
        labels: item.labels || [],   // from /api/fb_posts (Sightengine labels)
        scores: item.scores || {},   // Sightengine raw scores if any
      };
    } else if (type === "comment") {
      return {
        id: item.comment_id || item.id,
        text: typeof item.message === "string" ? item.message.slice(0, 500) : "",
        username,
        likeCount: item.like_count || 0,
        author: item.author || {}, // Facebook‐comment author info
      };
    }
    return item;
  });
}

function aggregateEngagement(posts, comments) {
  const engagement = {};

  posts.forEach((post) => {
    const user = post.username;
    if (user) {
      engagement[user] = engagement[user] || { likes: 0, comments: 0 };
      engagement[user].likes += post.likeCount;
    }
    post.tags.forEach((tag) => {
      const tagUser = tag.username;
      if (tagUser) {
        engagement[tagUser] = engagement[tagUser] || { likes: 0, comments: 0 };
        // Heuristic: tagged users get half of that post’s likes
        engagement[tagUser].likes += Math.floor(post.likeCount / 2);
      }
    });
  });

  comments.forEach((comment) => {
    const user = comment.username;
    if (user) {
      engagement[user] = engagement[user] || { likes: 0, comments: 0 };
      engagement[user].comments += 1;
      engagement[user].likes += comment.likeCount;
    }
  });

  return engagement;
}

function chunkArray(arr, chunkSize = 5) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
}

function isValidRiskScore(score) {
  const num = Number(score);
  return !isNaN(num) && num >= 0 && num <= 100;
}

function extractValidJSON(text) {
  const startIndex = text.indexOf("{");
  if (startIndex === -1) return null;
  let openBraces = 0;
  let endIndex = startIndex;
  for (let i = startIndex; i < text.length; i++) {
    if (text[i] === "{") openBraces++;
    if (text[i] === "}") openBraces--;
    if (openBraces === 0) {
      endIndex = i;
      break;
    }
  }
  return text.substring(startIndex, endIndex + 1);
}

// ---------------------
// OpenAI & Sightengine Helpers
// ---------------------
async function callOpenAIModeration(text) {
  if (!process.env.OPENAI_API_KEY) {
    return { flagged: false, categories: {}, category_scores: {} };
  }
  try {
    const resp = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ input: text }),
    });
    const json = await resp.json();
    const result = Array.isArray(json.results) ? json.results[0] : null;
    if (!result) {
      return { flagged: false, categories: {}, category_scores: {} };
    }
    return {
      flagged: result.flagged,
      categories: result.categories,
      category_scores: result.category_scores,
    };
  } catch (err) {
    console.error("OpenAI moderation failed:", err);
    return { flagged: false, categories: {}, category_scores: {} };
  }
}

async function analyzeImageWithSightengine(imageUrl, postId) {
  const { SIGHTENGINE_API_USER, SIGHTENGINE_API_SECRET } = process.env;
  if (!SIGHTENGINE_API_USER || !SIGHTENGINE_API_SECRET) {
    return { labels: ["no_analysis"], scores: {} };
  }
  const params = {
    api_user: SIGHTENGINE_API_USER,
    api_secret: SIGHTENGINE_API_SECRET,
    models: "nudity,wad,offensive",
    url: imageUrl,
  };
  const query = new URLSearchParams(params).toString();
  const sightUrl = `https://api.sightengine.com/1.0/check.json?${query}`;

  try {
    const resp = await fetch(sightUrl);
    if (!resp.ok) {
      console.error(`Sightengine returned ${resp.status} for post ${postId}`);
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

async function getRiskForChunk(chunk, aggregatedData, profileDetails) {
  const jsonData = JSON.stringify({
    data: chunk,
    engagementMetrics: aggregatedData,
    profileDetails,
  });
  const prompt = 
`You are a seasoned intelligence analyst evaluating the risk level of a social media profile.
Based on the JSON data below, calculate a risk score between 0 (minimal risk) and 100 (very high risk).
The instructions are:
1. If the profile is normal and exhibits little or no concerning activity, assign a risk score that is moderate and low. In such cases, the risk score should not exceed 20–30.
2. Only if the data indicates significant signs of concerning activity should the risk score be high (above 60).
3. Return only the risk score as a single number with no extra text.

Data: ${jsonData}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-2024-08-06",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 20,
      temperature: 0.2,
    }),
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`OpenAI API error (risk chunk): ${responseText}`);
  }
  const dataResp = JSON.parse(responseText);
  const score = dataResp.choices[0].message.content.trim();
  if (!isValidRiskScore(score)) {
    console.warn("Invalid risk score received:", score);
  }
  return score;
}

async function getFinalRiskScore(partialScores) {
  const combinedScores = partialScores.join("\n");
  const prompt = 
`You are a seasoned intelligence analyst. Given the following partial risk scores, consolidate them into a final risk score between 0 and 100.
Return only the final risk score with no extra text.

Partial Risk Scores:
${combinedScores}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-2024-08-06",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 20,
      temperature: 0.2,
    }),
  });
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`OpenAI Aggregation API error (risk): ${responseText}`);
  }
  const dataResp = JSON.parse(responseText);
  const finalScore = dataResp.choices[0].message.content.trim();
  if (!isValidRiskScore(finalScore)) {
    console.warn("Invalid final risk score received:", finalScore);
  }
  return finalScore;
}

async function getInterestsForChunk(chunk, aggregatedData, profileDetails) {
  const jsonData = JSON.stringify({
    data: chunk,
    engagementMetrics: aggregatedData,
    profileDetails,
  });
  const prompt =
`You are a social media analyst tasked with identifying the core interests of a user based on their activity data. For each interest, assign a weight between 1 and 10 indicating its prominence in the user's engagement. Return a valid JSON array of objects, each with the keys "interest" (a string) and "weight" (a number). Do not include any extra text.

Data: ${jsonData}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-2024-08-06",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 80,
      temperature: 0.2,
    }),
  });
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`OpenAI API error (interests chunk): ${responseText}`);
  }
  const dataResp = JSON.parse(responseText);
  try {
    let content = dataResp.choices[0].message.content.trim();
    content = content.replace(/^```(?:json\s*)?/, "").replace(/```$/, "").trim();
    return JSON.parse(content);
  } catch (error) {
    console.warn("Error parsing interests:", error);
    return [];
  }
}

async function getRelationshipsForChunk(chunk, aggregatedData, profileDetails) {
  const jsonData = JSON.stringify({
    data: chunk,
    engagementMetrics: aggregatedData,
    profileDetails,
    note:
      "For any user with a username starting with 'unknown_', treat the data as incomplete. Use any available metadata such as fullName or gender to classify the relationship.",
  });

  const prompt =
`Analyze the target user's social media connections and classify relationships as Friend, Associate, Relative, or Girlfriend/Boyfriend based on:

Same last name in likes or comments → Relative
More than 2 likes/comments from the same profile with slang phrases (e.g., "bro you livin", "I see my man", "let’s go") → Friend
Business-like or formal comments → Associate
Multiple tags or likes from an opposite-gender profile:
  – If the target is male and the profile is female with high tag/like frequency → Girlfriend/Wife
  – If the target is female and the profile is male with high tag/like frequency → Boyfriend/Husband
Multiple likes from an opposite-gender profile alone can also indicate a romantic partner

IMPORTANT:
• Output only a valid JSON object without any markdown or extra text.
• Map each username to one of these exact strings: "Family", "Associate", "Friend", "Girlfriend/Wife", or "Boyfriend/Husband".
• If no relationships can be determined, output {}.

Data: ${jsonData}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-2024-08-06",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.2,
    }),
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`OpenAI API error (relationships chunk): ${responseText}`);
  }

  const dataResp = JSON.parse(responseText);
  let content = dataResp.choices[0].message.content.trim();
  content = content.replace(/^```(?:json)?\n?/, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(content);
  } catch (error) {
    console.warn("Error parsing relationships:", error);
    const extracted = extractValidJSON(content);
    if (extracted) {
      try {
        return JSON.parse(extracted);
      } catch (err) {
        console.warn("Fallback JSON parsing failed:", err);
      }
    }
    return {};
  }
}

// ---------------------
// Data Fetching (Posts / Comments / ProfileDetails)
// ---------------------
async function fetchUserData(username) {
  let allPosts = [];
  let allComments = [];
  let nextCursor = null;

  // We only want up to ~40 posts, not “all” of them:
  const MAX_POSTS = 40;

  while (allPosts.length < MAX_POSTS) {
    const url = new URL(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/fb_posts`
    );
    url.searchParams.set("username", username);

    // If we have a cursor from the previous page, pass it along:
    if (nextCursor) {
      url.searchParams.set("cursor", nextCursor);
    }

    // (Optional) You can request more posts per page, e.g. &limit=10,
    // but fb_posts defaults to 3 if you don’t pass a limit.
    // url.searchParams.set("limit", "10");

    const postsRes = await fetch(url.toString());
    if (!postsRes.ok) {
      console.warn("Failed to fetch fb_posts:", await postsRes.text());
      break;
    }

    const postsJson = await postsRes.json();
    const rawPosts = Array.isArray(postsJson.results) ? postsJson.results : [];
    if (rawPosts.length === 0) {
      break;
    }

    // Simplify and append, but *cap* at MAX_POSTS:
    const simplifiedPosts = simplifyData(rawPosts, "post");
    for (let p of simplifiedPosts) {
      if (allPosts.length >= MAX_POSTS) break;
      allPosts.push(p);
    }

    nextCursor = postsJson.cursor || null;
    if (!nextCursor) {
      // no more pages
      break;
    }
  }

  console.log("Total posts fetched (capped at 40):", allPosts.length);

  // Fetch comments for each post (in parallel)
  const commentFetches = allPosts.map(async (post) => {
    if (!post.id) return [];
    const cUrl = new URL(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/fetch_fb_comments`
    );
    cUrl.searchParams.set("post_id", post.id);

    const cRes = await fetch(cUrl.toString());
    if (!cRes.ok) {
      console.warn(`Failed to fetch fb comments for post ${post.id}`);
      return [];
    }
    const cJson = await cRes.json();
    const rawComments = Array.isArray(cJson.results) ? cJson.results : [];
    return simplifyData(rawComments, "comment");
  });

  const commentsArrays = await Promise.all(commentFetches);
  commentsArrays.forEach((arr) => allComments.push(...arr));

  return { posts: allPosts, comments: allComments };
}

async function fetchProfileDetails(username) {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/facebookSearch`
  );
  url.searchParams.set("username", username);

  const detailsRes = await fetch(url.toString());
  if (!detailsRes.ok) {
    throw new Error("Failed to fetch Facebook profile details");
  }
  return detailsRes.json();
}

// ---------------------
// Sightengine Convenience for high‐risk image analysis
// ---------------------
function getSightEngineLabel(analysis) {
  const labels = [];
  if (analysis.nudity && analysis.nudity.safe < 0.8) {
    labels.push("adult content");
  }
  if (analysis.offensive && analysis.offensive.prob > 0.01) {
    labels.push("offensive");
  }
  if (analysis.weapon && analysis.weapon > 0.005) {
    labels.push("weapon");
  }
  if (analysis.drugs && analysis.drugs > 0.005) {
    labels.push("drugs");
  }
  if (labels.length === 0) {
    labels.push("safe");
  }
  return labels.join(", ");
}

async function analyzeImageWithSightEngine(imageUrl) {
  const apiUser = "150452328";
  const apiSecret = "uEzhj5Q2FVbg4jfnB4mRc84cdRqTpz4m";
  const endpoint = "https://api.sightengine.com/1.0/check.json";
  const params = new URLSearchParams({
    api_user: apiUser,
    api_secret: apiSecret,
    models: "nudity,wad,offensive",
    url: imageUrl,
  });
  const url = `${endpoint}?${params.toString()}`;

  const response = await fetch(url);
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Sight Engine API error for ${imageUrl}: ${responseText}`);
  }

  const analysis = JSON.parse(responseText);
  const label = getSightEngineLabel(analysis);
  return { imageUrl, analysis, label };
}

// ---------------------
// Risk‐Score Calculation (unchanged)
// ---------------------
function calculateRiskScore({ posts, postModerations, commentModerations }) {
  const POSTS_COUNT = posts.length;
  let rawScore = 0;

  posts.forEach((post, idx) => {
    const labels = post.labels || [];
    const hasBadImage = labels.some(
      (l) => l !== "safe" && l !== "no_image" && l !== "no_analysis"
    );
    if (hasBadImage) rawScore += 20;

    const pm = postModerations[idx];
    if (pm.flagged) rawScore += 10;
  });

  commentModerations.forEach((cm) => {
    if (cm.flagged) rawScore += 5;
  });

  const maxRaw = POSTS_COUNT * 30 + commentModerations.length * 5;
  const normalized = maxRaw > 0 ? (rawScore / maxRaw) * 100 : 0;
  const riskScore = Math.min(100, Math.round(normalized));

  let category = "low";
  if (riskScore >= 60) category = "high";
  else if (riskScore >= 30) category = "medium";

  return { riskScore, category, rawScore, maxRaw };
}

// ---------------------
// Main Handler
// ---------------------
export default async function handler(req, res) {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    // 1) Fetch ~40 posts & their comments
    const { posts, comments } = await fetchUserData(username);

    // 2) Fetch profile details (includes `image` URL)
    const profileDetails = await fetchProfileDetails(username);

    // 3) Build engagement metrics
    const engagementMetrics = aggregateEngagement(posts, comments);

    // 4) Combine posts + comments for chunking
    const combinedData = [...posts, ...comments];

    // 5) Break into chunks of 5 items
    const chunks = chunkArray(combinedData, 5);

    // 6) GPT partial risk scores
    const riskPromises = chunks.map((chunk) =>
      getRiskForChunk(chunk, engagementMetrics, profileDetails)
    );
    const partialRiskScores = await Promise.all(riskPromises);

    // 7) Final risk score
    const finalRiskScore = await getFinalRiskScore(partialRiskScores);

    // 8) GPT “interests” (optional)
    const interestsPromises = chunks.map((chunk) =>
      getInterestsForChunk(chunk, engagementMetrics, profileDetails)
    );
    const partialInterestsArrays = await Promise.all(interestsPromises);

    const weightedInterests = partialInterestsArrays.flat();
    const aggregatedWeights = {};
    weightedInterests.forEach((item) => {
      const key = item.interest.trim().toLowerCase();
      const weight = Number(item.weight) || 1;
      aggregatedWeights[key] = (aggregatedWeights[key] || 0) + weight;
    });
    const totalWeight = Object.values(aggregatedWeights).reduce(
      (sum, w) => sum + w,
      0
    );
    const interestPercentages = Object.keys(aggregatedWeights).map(
      (interest) => ({
        interest,
        percentage: ((aggregatedWeights[interest] / totalWeight) * 100).toFixed(2),
      })
    );
    interestPercentages.sort((a, b) => b.percentage - a.percentage);
    const topFiveInterestsWithPercentage = interestPercentages.slice(0, 5);

    // 9) GPT “relationships”
    const taggedLookup = {};
    posts.forEach((post) => {
      post.tags.forEach((tag) => {
        if (tag.username && tag.profileImage) {
          taggedLookup[tag.username.trim()] = tag.profileImage;
        }
      });
      post.taggedUsers.forEach((tg) => {
        if (tg.username && tg.profileImage) {
          taggedLookup[tg.username.trim()] = tg.profileImage;
        }
      });
    });

    const relationshipChunks = chunkArray(combinedData, 5);
    const relationshipsPromises = relationshipChunks.map((chunk) =>
      getRelationshipsForChunk(chunk, engagementMetrics, profileDetails)
    );
    const partialRelationships = await Promise.all(relationshipsPromises);

    // Aggregate relationship “votes” weighted by engagement
    const relationshipCounts = {};
    partialRelationships.forEach((chunkResp) => {
      Object.entries(chunkResp).forEach(([user, rel]) => {
        if (!relationshipCounts[user]) {
          relationshipCounts[user] = {
            Family: 0,
            "Girlfriend/Wife": 0,
            "Boyfriend/Husband": 0,
            Associate: 0,
            Friend: 0,
          };
        }
        const weight =
          ((engagementMetrics[user]?.likes || 0) +
            (engagementMetrics[user]?.comments || 0)) ||
          1;
        if (rel in relationshipCounts[user]) {
          relationshipCounts[user][rel] += weight;
        }
      });
    });

    // Build finalRelationships { username → { relationship, profileImage } }
    const defaultImage = "/no-profile-pic-img.png";
    const finalRelationships = {};
    Object.entries(relationshipCounts).forEach(([user, counts]) => {
      if (user.startsWith("unknown_")) return;

      let relationshipType = "";
      if (counts.Family > 0) {
        relationshipType = "Family";
      } else if (
        counts["Girlfriend/Wife"] > 0 ||
        counts["Boyfriend/Husband"] > 0
      ) {
        relationshipType =
          counts["Girlfriend/Wife"] >= counts["Boyfriend/Husband"]
            ? "Girlfriend/Wife"
            : "Boyfriend/Husband";
      } else if (counts.Associate > counts.Friend) {
        relationshipType = "Associate";
      } else {
        relationshipType = "Friend";
      }

      let profileImage =
        taggedLookup[user] ||
        posts.reduce((acc, post) => {
          let found = post.tags.find((t) => t.username === user);
          if (!found && post.taggedUsers) {
            found = post.taggedUsers.find((t) => t.username === user);
          }
          return found && found.profileImage ? found.profileImage : acc;
        }, "") ||
        defaultImage;

      finalRelationships[user] = {
        username: user,
        relationship: relationshipType,
        profileImage,
      };
    });

    // Override with “official” image from profileDetails (key is `image`)
    const relationshipUsernames = Object.keys(finalRelationships);
    const profileDetailsArr = await Promise.all(
      relationshipUsernames.map((un) =>
        fetchProfileDetails(un).catch(() => ({}))
      )
    );
    relationshipUsernames.forEach((un, idx) => {
      const details = profileDetailsArr[idx] || {};
      if (details.image) {
        finalRelationships[un].profileImage = details.image;
      }
    });
    const relationshipsOutput =
      Object.keys(finalRelationships).length > 0
        ? finalRelationships
        : "No relationships found";

    // 10) Main user profile image (key is `image`, not `profileImage`)
    const mainUserProfileImage = profileDetails.image || defaultImage;

    // 11) If finalRiskScore > 60, optionally run Sightengine on every post’s image
    let imageAnalysisResults = [];
    if (Number(finalRiskScore) > 60) {
      const imagesToAnalyze = posts.map((p) => p.imageUrl).filter((url) => url);
      imageAnalysisResults = await Promise.all(
        imagesToAnalyze.map((url) => analyzeImageWithSightEngine(url))
      );
    }

    // 12) Return JSON (including postCount)
    return res.status(200).json({
      finalAnalysis: finalRiskScore,
      postCount: posts.length,
      topInterests: topFiveInterestsWithPercentage,
      relationships: relationshipsOutput,
      mainUserProfileImage,
      imageAnalysis: imageAnalysisResults,
    });
  } catch (error) {
    console.error("Error in riskScore handler:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal server error." });
  }
}

