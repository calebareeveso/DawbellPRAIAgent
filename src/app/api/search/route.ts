// import { NextResponse } from "next/server";

// export async function GET(req) {
//   try {
//     const startTime = performance.now();

//     // 1. Get search query from request URL
//     const { searchParams } = new URL(req.url);
//     const userQuery = searchParams.get("q") || "fc barcelona vs real madrid";

//     // 2. First API call - Get search results from Tavily with a simple query
//     const searchOptions = {
//       method: "POST",
//       headers: {
//         Authorization: "Bearer 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",
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         query: userQuery,
//         topic: "news",
//         search_depth: "basic",
//         chunks_per_source: 3,
//         max_results: 5,
//         include_answer: true,
//         include_raw_content: true,
//       }),
//     };

//     const searchResponse = await fetch(
//       "https://api.tavily.com/search",
//       searchOptions
//     );
//     const searchData = await searchResponse.json();

//     if (!searchData.results) {
//       throw new Error("No search results returned from Tavily");
//     }

//     // 3. Process each result with the Gemini API to generate posts
//     const resultsWithPosts = await Promise.all(
//       searchData.results.map(async (result) => {
//         // Create prompt for Gemini
//         const prompt = `
// Create 3-5 authentic, diverse social media posts based on this information:

// INFORMATION:
// Title: ${result.title || ""}
// URL: ${result.url || ""}
// Content: ${result.content || ""}

// MISSION: Generate COMPLETELY DIFFERENT social media posts that reflect how real people would discuss this topic online.

// KEY REQUIREMENTS:
// - Each post must feel AUTHENTICALLY HUMAN - like actual social media posts
// - Create different writing styles, vocabularies, and tones
// - Include diverse perspectives (supportive, critical, neutral, curious)
// - Incorporate natural speech patterns and conversational elements
// - Vary post length - some concise, others more detailed
// - Use emojis sparingly and only where natural

// CRITICAL INSTRUCTIONS:
// - Output ONLY the raw posts separated by "|" with NO introductions or explanations
// - DO NOT include numbering, labels, or descriptors
// `;

//         try {
//           // Call Gemini API to generate posts
//           const geminiResponse = await fetch(
//             "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
//             {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/json",
//                 "x-goog-api-key":
//                   process.env.GOOGLE_API_KEY || "YOUR_GEMINI_API_KEY",
//               },
//               body: JSON.stringify({
//                 contents: [{ parts: [{ text: prompt }] }],
//                 generationConfig: {
//                   temperature: 0.9,
//                   maxOutputTokens: 800,
//                 },
//               }),
//             }
//           );

//           if (!geminiResponse.ok) {
//             throw new Error(`Gemini API error: ${geminiResponse.status}`);
//           }

//           const geminiData = await geminiResponse.json();
//           const generatedText =
//             geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

//           // Split and format posts
//           const posts = generatedText
//             .split("|")
//             .map((post) => post.trim())
//             .filter((post) => post.length > 0)
//             .map((post) => ({
//               post: post,
//               postAge: result.page_age || new Date().toISOString(),
//               isRead: false,
//               replies: [],
//               source: result.url,
//               sourceIcon: result.favicon || "",
//               sourceContent: result.content || result.description || "",
//               query: userQuery,
//             }));

//           return {
//             ...result,
//             posts: posts,
//           };
//         } catch (error) {
//           console.error(
//             `Error generating posts for ${result.url}: ${error.message}`
//           );
//           return {
//             ...result,
//             posts: [],
//             error: error.message,
//           };
//         }
//       })
//     );

//     const allPosts = resultsWithPosts.flatMap((result) => result.posts || []);

//     const endTime = performance.now();
//     const requestDuration = (endTime - startTime) / 1000;
//     console.log(`API request took ${requestDuration.toFixed(2)}s`);

//     return NextResponse.json({
//       query: userQuery,
//       results: allPosts,
//       processingTime: requestDuration.toFixed(2),
//     });
//   } catch (e) {
//     console.error("Error occurred: " + e.message);
//     return NextResponse.json({ error: e.message }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";

export async function POST(request: any) {
  try {
    const { query } = await request.json();

    const startTime = performance.now();
    // const query = `Ed sheeran in uk news DO NOT MENTION Australia & New Zealand`;
    const requestBody = {
      query: query,
      topic: "news",
      search_depth: "basic",
      chunks_per_source: 3,
      max_results: 5,
      time_range: null,
      days: 30,
      // include_answer: "advanced",
      include_raw_content: false,
      include_images: false,
      include_image_descriptions: false,
      include_domains: [],
      exclude_domains: ["www.aol.com"],
      country: "united kingdom",
    };

    const options = {
      method: "POST",
      headers: {
        Authorization: "Bearer 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",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    };

    const response = await fetch("https://api.tavily.com/search", options);
    const data = await response.json();

    const prompt = `
    Generate a PR coverage report from the following JSON data.
    Each item in the data contains fields like 'url', 'title', 'published_date', and a 'content' field.
    
    **IMPORTANT INSTRUCTIONS:**
    
    1.  **DO NOT** wrap the entire output in markdown code blocks (e.g., \`\`\`html).
    2.  **DO NOT** use Unicode escape sequences (e.g., \\u003C) for HTML tags. Output raw HTML tags directly (e.g., <div>, <h3>).
    3.  Each individual coverage item **MUST** be wrapped in an **HTML <div> tag**.
    4.  Inside each **<div>**:
        * The 'title' field should be used to derive the source and headline.
            * The **source** (e.g., "HuffPost", "Billboard") should be extracted from the end of the 'title' field (after the last ' - ') and wrapped in an **HTML <h3> tag**.
            * The **headline** (the main part of the 'title' before the source) should be wrapped in an **HTML <h4> tag**.
            * **IMPORTANT:** Inside each <h4>, the headline text MUST be wrapped in an anchor tag (<a>) whose href is the "url" field for that item.
              For example: <h4><a href="https://www.bbc.com/news/articles/cq6mpg8e9g9o">Ed Sheeran Shares The Parenting Advice He'd Give To First-Time Dads</a></h4>
        * For the **description**:
            * **Analyze and synthesize** the content to create a well-written, coherent summary.
            * Focus on the key points and newsworthy elements.
            * Maintain journalistic style and tone.
            * Keep descriptions concise but informative (2-3 sentences).
            * Avoid direct copying - instead, compose a fresh summary that captures the essence.
            * The summary **MUST** be wrapped in an **HTML <p> tag**.
    
    Here is the JSON data to process:
    ${JSON.stringify(data)}
    
    Expected Output Format (NO MARKDOWN WRAPPING, RAW HTML TAGS ONLY):
    
    <h2>Artist Name's Media Coverage Report</h2>

    <div>
        <h3>DERIVED_SOURCE_HERE</h3>
        <h4><a href="URL_HERE">DERIVED_HEADLINE_HERE</a></h4>
        <p>COMPOSED_SUMMARY_OF_KEY_POINTS_AND_CONTEXT</p>
    </div>
    
    Sample Output based on ideal composition:
    
      <h2>Ed Sheeran's Media Coverage Report</h2>

    <div>
        <h3>HuffPost</h3>
        <h4><a href="https://www.bbc.com/news/articles/cq6mpg8e9g9o">Ed Sheeran Shares The Parenting Advice He'd Give To First-Time Dads</a></h4>
        <p>The global superstar opened up about his experiences as a father, sharing candid insights for new dads. Sheeran emphasized the importance of taking early morning shifts with children, noting these moments often provide special bonding opportunities while allowing partners much-needed rest.</p>
    </div>
    
    <div>
        <h3>Billboard</h3>
        <h4><a href="https://www.billboard.com/articles/news/ed-sheeran-tour">Ed Sheeran Set to Lock in Australia Tour Dates</a></h4>
        <p>In an ambitious crossover between music and cinema, Ed Sheeran has taken on the role of drum teacher to actor Chris Hemsworth. The challenge, documented in the new season of 'Limitless', culminates in Hemsworth potentially performing for a massive stadium crowd during Sheeran's tour.</p>
    </div>
    `;
    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GOOGLE_API_KEY ?? "",
        }),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const generatedText =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log(generatedText);

    const endTime = performance.now();
    const requestDuration = (endTime - startTime) / 1000;
    console.log(`API request took ${requestDuration.toFixed(2)}s`);

    return NextResponse.json({
      searchResults: data,
      generatedReport: generatedText,
    });
  } catch (e: any) {
    console.error("Error occurred: " + e.message);
    return NextResponse.json({ error: e.message });
  }
}
