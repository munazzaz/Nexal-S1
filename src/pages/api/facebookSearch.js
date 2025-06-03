// // src/pages/api/facebookSearch.js
// // Next.js API route to search and fetch Facebook profile details via RapidAPI

// export default async function handler(req, res) {
//   const { username, details_url } = req.query;
//   const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
//   const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'facebook-scraper3.p.rapidapi.com';

//   if (!RAPIDAPI_KEY) {
//     return res.status(500).json({ error: 'RapidAPI key not configured.' });
//   }

//   // If a details_url is provided, fetch the full profile
//   if (details_url) {
//     try {
//       const url = `https://${RAPIDAPI_HOST}/profile/details_url?url=${encodeURIComponent(details_url)}`;
//       const response = await fetch(url, {
//         headers: {
//           'x-rapidapi-key': RAPIDAPI_KEY,
//           'x-rapidapi-host': RAPIDAPI_HOST
//         }
//       });
//       const data = await response.json();
//       if (!response.ok) {
//         return res.status(response.status).json({ error: data });
//       }
//       return res.status(200).json({ profile: data });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Error fetching profile details.' });
//     }
//   }

//   // Otherwise, perform a search by username
//   if (!username) {
//     return res.status(400).json({ error: 'Please provide a `username` query parameter.' });
//   }

//   try {
//     const url = `https://${RAPIDAPI_HOST}/search?query=${encodeURIComponent(username)}`;
//     const response = await fetch(url, {
//       headers: {
//         'x-rapidapi-key': RAPIDAPI_KEY,
//         'x-rapidapi-host': RAPIDAPI_HOST
//       }
//     });
//     const data = await response.json();
//     if (!response.ok) {
//       return res.status(response.status).json({ error: data });
//     }
//     // data.results contains list of profiles with `name`, `url`, `details_url`, etc.
//     return res.status(200).json({ results: data.results });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Error searching profiles.' });
//   }
// }

// src/pages/api/facebookSearch.js
// Next.js API route to fetch Facebook profile details via RapidAPI by username

// src/pages/api/facebookSearch.js
// Next.js API route to fetch Facebook profile details via RapidAPI by username

// export default async function handler(req, res) {
//   const { username } = req.query;
//   const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
//   const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'facebook-scraper3.p.rapidapi.com';

//   if (!username) {
//     return res.status(400).json({ error: 'Username is required' });
//   }
//   if (!RAPIDAPI_KEY) {
//     return res.status(500).json({ error: 'RapidAPI key not configured.' });
//   }

//   // Build the Facebook profile URL
//   const profileUrl = `https://www.facebook.com/${encodeURIComponent(username)}`;
//   const endpoint = `https://${RAPIDAPI_HOST}/profile/details_url?url=${encodeURIComponent(profileUrl)}`;

//   try {
//     const apiRes = await fetch(endpoint, {
//       method: 'GET',
//       headers: {
//         'x-rapidapi-key': RAPIDAPI_KEY,
//         'x-rapidapi-host': RAPIDAPI_HOST,
//       },
//     });

//     const rawData = await apiRes.json();
//     if (!apiRes.ok) {
//       console.error('RapidAPI error:', rawData);
//       return res.status(apiRes.status).json({ error: 'Error fetching profile details' });
//     }

//     // The RapidAPI may return nested objects under 'profile'
//     const profileContainer = rawData.profile || rawData;
//     const profile = profileContainer.profile || profileContainer;

//     // Filter and shape response similar to your Instagram example
//     const filteredData = {
//       name: profile.name,
//       profile_id: profile.profile_id,
//       url: profile.url,
//       image: profile.image,
//       intro: profile.intro,
//       cover_image: profile.cover_image,
//       gender: profile.gender,
//       about_public: profile.about_public,
//     };

//     return res.status(200).json(filteredData);
//   } catch (error) {
//     console.error('Fetch error:', error);
//     return res.status(500).json({ error: 'Failed to fetch profile' });
//   }
// }


// Correc Code

// export default async function handler(req, res) {
//   const { username } = req.query;
//   const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
//   const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'facebook-scraper3.p.rapidapi.com';

//   if (!username) {
//     return res.status(400).json({ error: 'Username is required' });
//   }
//   if (!RAPIDAPI_KEY) {
//     return res.status(500).json({ error: 'RapidAPI key not configured.' });
//   }

//   // Build the Facebook profile URL
//   const profileUrl = `https://www.facebook.com/${encodeURIComponent(username)}`;
//   const endpoint = `https://${RAPIDAPI_HOST}/profile/details_url?url=${encodeURIComponent(profileUrl)}`;

//   try {
//     console.log('Requesting RapidAPI endpoint:', endpoint);
//     const apiRes = await fetch(endpoint, {
//       method: 'GET',
//       headers: {
//         'x-rapidapi-key': RAPIDAPI_KEY,
//         'x-rapidapi-host': RAPIDAPI_HOST,
//       },
//     });

//     const rawData = await apiRes.json();
//     console.log('Raw data from RapidAPI:', JSON.stringify(rawData, null, 2));

//     if (!apiRes.ok) {
//       console.error('RapidAPI error:', rawData);
//       return res.status(apiRes.status).json({ error: 'Error fetching profile details' });
//     }

//     // Unwrap nested 'profile' keys if present
//     const profileContainer = rawData.profile || rawData;
//     console.log('Profile container:', JSON.stringify(profileContainer, null, 2));
//     const profile = profileContainer.profile || profileContainer;
//     console.log('Flattened profile object:', JSON.stringify(profile, null, 2));

//     // Filter and shape response similar to your Instagram example
//     const filteredData = {
//       name: profile.name,
//       profile_id: profile.profile_id,
//       url: profile.url,
//       image: profile.image,
//       intro: profile.intro,
//       cover_image: profile.cover_image,
//       gender: profile.gender,
//       about_public: profile.about_public,
//     };

//     console.log('Filtered data to return:', JSON.stringify(filteredData, null, 2));
//     return res.status(200).json(filteredData);
//   } catch (error) {
//     console.error('Fetch error:', error);
//     return res.status(500).json({ error: 'Failed to fetch profile' });
//   }
// }



// // src/pages/api/facebookSearch.js
// export default async function handler(req, res) {
//   const { username } = req.query;
//   const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
//   const RAPIDAPI_HOST =
//     process.env.RAPIDAPI_HOST || "facebook-scraper3.p.rapidapi.com";

//   if (!username) {
//     return res.status(400).json({ error: "Username is required." });
//   }
//   if (!RAPIDAPI_KEY) {
//     return res
//       .status(500)
//       .json({ error: "RapidAPI key not configured in .env.local." });
//   }

//   const profileUrl = `https://www.facebook.com/${encodeURIComponent(
//     username
//   )}`;
//   const endpoint = `https://${RAPIDAPI_HOST}/profile/details_url?url=${encodeURIComponent(
//     profileUrl
//   )}`;

//   try {
//     const apiRes = await fetch(endpoint, {
//       headers: {
//         "x-rapidapi-key": RAPIDAPI_KEY,
//         "x-rapidapi-host": RAPIDAPI_HOST,
//       },
//     });
//     const raw = await apiRes.json();
//     if (!apiRes.ok) {
//       return res
//         .status(apiRes.status)
//         .json({ error: raw.message || "Error fetching Facebook profile." });
//     }

//     // unwrap nested `profile.profile`
//     let prof = raw.profile || raw;
//     prof = prof.profile || prof;

//     // Shape data to match SearchBar expectations:
//     return res.status(200).json({
//       name: prof.name,
//       username,                // so SearchBar can link correctly
//       profile_id: prof.profile_id,
//       url: prof.url,
//       image: prof.image,       // will become profile_pic_url in SearchBar
//       intro: prof.intro,
//       cover_image: prof.cover_image,
//       gender: prof.gender,
//       about_public: prof.about_public,
//     });
//   } catch (e) {
//     console.error("Facebook API fetch error:", e);
//     return res.status(500).json({ error: "Failed to fetch profile." });
//   }
// }

// src/pages/api/facebookSearch.js
export default async function handler(req, res) {
  const { username } = req.query;
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
  const RAPIDAPI_HOST =
    process.env.RAPIDAPI_HOST || "facebook-scraper3.p.rapidapi.com";

  if (!username) {
    return res.status(400).json({ error: "Username is required." });
  }
  if (!RAPIDAPI_KEY) {
    return res
      .status(500)
      .json({ error: "RapidAPI key not configured in .env.local." });
  }

  const profileUrl = `https://www.facebook.com/${encodeURIComponent(
    username
  )}`;
  const endpoint = `https://${RAPIDAPI_HOST}/profile/details_url?url=${encodeURIComponent(
    profileUrl
  )}`;

  try {
    const apiRes = await fetch(endpoint, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
    });
    const raw = await apiRes.json();

    // Log the entire response so you can inspect every field:
    // console.log("📦 Raw API response:", raw);

    if (!apiRes.ok) {
      console.error("Facebook API returned error:", raw);
      return res
        .status(apiRes.status)
        .json({ error: raw.message || "Error fetching Facebook profile." });
    }

    // “Unwrap” nested profile.profile if necessary:
    let prof = raw.profile || raw;
    prof = prof.profile || prof;
    // console.log("🔍 Unwrapped `prof` object:", prof);

    // Build a response object with ALL keys under `prof`, plus `username`:
    const output = {
      username,                             // echo back the username you searched for
      name: prof.name || null,
      profile_id: prof.profile_id || null,
      url: prof.url || null,
      image: prof.image || null,
      intro: prof.intro || null,
      cover_image: prof.cover_image || null,
      gender: prof.gender || null,
      about: prof.about || {},             // could be an object (empty or with fields)
      about_public: prof.about_public || [], // array of { icon, text }
 
    };

    return res.status(200).json(output);
  } catch (e) {
    console.error("Facebook API fetch error:", e);
    return res.status(500).json({ error: "Failed to fetch profile." });
  }
}
