// // src/pages/api/fetch_fb_comments.js

// import fetch from 'node-fetch'; // or use built-in fetch in modern Next.js

// export default async function handler(req, res) {
//   const { post_id, cursor, limit } = req.query;
//   const KEY = process.env.RAPIDAPI_KEY;
//   const HOST = process.env.RAPIDAPI_HOST || "facebook-scraper3.p.rapidapi.com";

//   if (!post_id) {
//     return res.status(400).json({ error: "post_id query parameter is required." });
//   }
//   if (!KEY) {
//     return res.status(500).json({ error: "RapidAPI key not configured." });
//   }

//   try {
//     // Build the comments endpoint URL
//     let apiUrl = `https://${HOST}/post/comments?post_id=${encodeURIComponent(post_id)}`;
//     if (limit) {
//       apiUrl += `&limit=${encodeURIComponent(limit)}`;
//     }
//     if (cursor) {
//       apiUrl += `&cursor=${encodeURIComponent(cursor)}`;
//     }

//     // Fetch comments from RapidAPI
//     const commentsRes = await fetch(apiUrl, {
//       headers: {
//         "x-rapidapi-key": KEY,
//         "x-rapidapi-host": HOST
//       }
//     });
//     const commentsJson = await commentsRes.json();

//     if (!commentsRes.ok) {
//       return res.status(commentsRes.status).json({ error: commentsJson.message || "Error fetching comments." });
//     }

//     // Return the comments array and next cursor
//     res.status(200).json({
//       post_id,
//       comments: commentsJson.results || commentsJson.comments || [],
//       cursor: commentsJson.cursor || null
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message || "Failed to fetch comments." });
//   }
// }

 
// src/pages/api/fetch_fb_comments.js (correct code)

// import fetch from 'node-fetch'; // Next.js 12 or earlier; you can drop this import on Next 13+

// export default async function handler(req, res) {
//   const { post_id, cursor, limit } = req.query;
//   const KEY = process.env.RAPIDAPI_KEY;
//   const HOST = process.env.RAPIDAPI_HOST || "facebook-scraper3.p.rapidapi.com";

//   if (!post_id) {
//     return res.status(400).json({ error: "post_id query parameter is required." });
//   }
//   if (!KEY) {
//     return res.status(500).json({ error: "RapidAPI key not configured." });
//   }

//   try {
//     let apiUrl = `https://${HOST}/post/comments?post_id=${encodeURIComponent(post_id)}`;
//     if (limit)  apiUrl += `&limit=${encodeURIComponent(limit)}`;
//     if (cursor) apiUrl += `&cursor=${encodeURIComponent(cursor)}`;

//     const commentsRes  = await fetch(apiUrl, {
//       headers: {
//         "x-rapidapi-key": KEY,
//         "x-rapidapi-host": HOST
//       }
//     });
//     const commentsJson = await commentsRes.json();

//     if (!commentsRes.ok) {
//       return res
//         .status(commentsRes.status)
//         .json({ error: commentsJson.message || "Error fetching comments." });
//     }

//     res.status(200).json({
//       post_id,
//       comments: commentsJson.results || commentsJson.comments || [],
//       cursor: commentsJson.cursor || null
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message || "Failed to fetch comments." });
//   }
// }



// // src/pages/api/fetch_fb_comments.js
// import fetch from "node-fetch";

// export default async function handler(req, res) {
//   try {
//     const { post_id, after } = req.query;
//     if (!post_id) {
//       return res
//         .status(400)
//         .json({ error: "Missing required query parameter: post_id" });
//     }

//     // Build the RapidAPI URL
//     const url = new URL(
//       "https://facebook-scraper3.p.rapidapi.com/post/comments"
//     );
//     url.searchParams.append("post_id", post_id);
//     if (after) {
//       url.searchParams.append("cursor", after);
//     }

//     // Hard‐coded RapidAPI key (as per your Python snippet)
//     const RAPIDAPI_KEY = "JCencKsLCumshFl94505UMz3fVOjp1GA57EjsnaTRyaHjVY8Z7";

//     const response = await fetch(url.toString(), {
//       method: "GET",
//       headers: {
//         "x-rapidapi-host": "facebook-scraper3.p.rapidapi.com",
//         "x-rapidapi-key": RAPIDAPI_KEY,
//       },
//     });
//     console.log("Fetching comments from:", url.toString());

//     if (!response.ok) {
//       const text = await response.text();
//       console.error("Non-OK response from RapidAPI:", text);
//       return res.status(response.status).send(text);
//     }

//     const data = await response.json();
//     return res.status(200).json(data);
//   } catch (err) {
//     console.error("Error in /api/fetch_fb_comments:", err);
//     return res.status(500).json({ error: "Internal server error." });
//   }
// }

// src/pages/api/fetch_fb_comments.js
import fetch from "node-fetch";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const { post_id, after } = req.query;
    if (!post_id) {
      return res
        .status(400)
        .json({ error: "Missing required query parameter: post_id" });
    }

    // 1) Fetch comments from RapidAPI
    const url = new URL("https://facebook-scraper3.p.rapidapi.com/post/comments");
    url.searchParams.append("post_id", post_id);
    if (after) {
      url.searchParams.append("cursor", after);
    }

    const RAPIDAPI_KEY = "JCencKsLCumshFl94505UMz3fVOjp1GA57EjsnaTRyaHjVY8Z7";
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-rapidapi-host": "facebook-scraper3.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Non-OK response from RapidAPI:", text);
      return res.status(response.status).send(text);
    }

    const data = await response.json();
    const comments = Array.isArray(data.results) ? data.results : [];

    // 2) For each comment, try to scrape the author.url → <meta property="og:image">  
    //    and attach it as author.picture. If it fails, author.picture stays null.
    const enriched = await Promise.all(
      comments.map(async (comment) => {
        const author = { ...comment.author, picture: null };

        if (author.url) {
          try {
            const profileRes = await fetch(author.url);
            if (profileRes.ok) {
              const html = await profileRes.text();
              const $ = cheerio.load(html);
              const ogImg = $('meta[property="og:image"]').attr("content");
              if (ogImg) {
                author.picture = ogImg;
              }
            }
          } catch (err) {
            console.warn(
              `Failed to scrape profile page for ${author.name}:`,
              err.message
            );
            // leave author.picture = null
          }
        }

        return {
          ...comment,
          author,
        };
      })
    );

    // 3) Return the same cursor but with each comment’s author.picture attached
    return res.status(200).json({
      results: enriched,
      cursor: data.cursor || null,
    });
  } catch (err) {
    console.error("Error in /api/fetch_fb_comments:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}
