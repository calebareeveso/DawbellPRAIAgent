import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "eu-north-1",
  credentials: {
    accessKeyId: "...",
    secretAccessKey: "...",
  },
});

import puppeteer from "puppeteer";

export async function POST(request: any) {
  const { urls } = await request.json();
  //
  // const urls = [
  //   "https://www.bbc.com/news/articles/cq6mpg8e9g9o",
  //   "https://www.billboard.com/music/pop/ed-sheeran-emotional-performing-hero-james-blunt-ipswich-1236020511/",
  //   "https://www.hollywoodreporter.com/news/music-news/dolly-parton-las-vegas-shows-caesars-palace-colosseum-1236296901/",
  //   "https://au.variety.com/2025/music/news/ed-sheeran-set-to-lock-in-australia-tour-dates-25396/",
  //   "https://www.huffpost.com/entry/ed-sheeran-parenting-advice_n_687559fce4b084ccb1a9b847",
  // ];

  // Helper to upload buffer to S3
  const uploadBufferToS3 = async (buffer: any, fileName: any) => {
    try {
      const params = {
        Bucket: "very-deep-thoughts",
        Key: fileName,
        Body: buffer,
        ContentType: "image/png",
      };
      await s3Client.send(new PutObjectCommand(params));
      const url = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
      return url;
    } catch (error) {
      console.error("Error uploading to S3:", error);
      return null;
    }
  };

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const screenshotUrls = [];

  try {
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const page = await browser.newPage();

      // Disable JavaScript on the page to prevent popups and overlays
      await page.setJavaScriptEnabled(false);

      // Set viewport to 1440x1000 to capture only the top section
      await page.setViewport({ width: 1440, height: 1000 });

      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

      // Only screenshot the visible viewport (top 1440x1000), not the full page
      const buffer = await page.screenshot({ fullPage: false, type: "png" });
      console.log(`screenshot ${i} taken for ${url}`);
      await page.close();

      const fileName = `screenshot_${Date.now()}_${i}.png`;
      const s3Url = await uploadBufferToS3(buffer, fileName);
      if (s3Url) {
        screenshotUrls.push(s3Url);
      }
    }
  } catch (err: any) {
    console.error("Error taking screenshots:", err);
    await browser.close();
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  await browser.close();

  return NextResponse.json({ screenshots: screenshotUrls });
}

// {"screenshots":["https://very-deep-thoughts.s3.amazonaws.com/screenshot_1753174755438_0.png",
// "https://very-deep-thoughts.s3.amazonaws.com/screenshot_1753174758470_1.png",
// "https://very-deep-thoughts.s3.amazonaws.com/screenshot_1753174762270_2.png",
// "https://very-deep-thoughts.s3.amazonaws.com/screenshot_1753174763778_3.png",
// "https://very-deep-thoughts.s3.amazonaws.com/screenshot_1753174765925_4.png"]}
