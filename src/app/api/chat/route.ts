import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { NextResponse } from "next/server";

const REPORT_CONTEXT = `
HuffPost
Ed Sheeran Shares The Parenting Advice He’d Give To First-Time Dads
Ed Sheeran offers tips for new fathers, emphasizing the importance of morning moments with calm and happy children while allowing partners to rest.

Billboard
Ed Sheeran Challenges Chris Hemsworth to Play Drums in Front of 70K People in ‘Limitless’ Trailer
A trailer for the new season of _Limitless_ shows Chris Hemsworth's efforts to learn drums, with Ed Sheeran challenging him to perform on his stadium tour.

Variety
Ed Sheeran Set to Lock in Australia Tour Dates
Ed Sheeran is reportedly finalizing his tour schedule for upcoming dates in Australia.

HuffPost
The Steve Miller Band Cancels Tour Over Extreme Weather, Climate Change
The Steve Miller Band has canceled its U.S. tour due to extreme weather conditions and concerns about climate change.

People.com
Megan Thee Stallion and Klay Thompson Make Red Carpet Debut: 'He's the Nicest Person I've Ever Met' (Exclusive)
Megan Thee Stallion and Klay Thompson made their red carpet debut together.`;

export async function POST(request: any) {
  try {
    const { messages, context } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    const response = await streamText({
      model: google("gemini-2.0-flash-001"),
      messages,
      system: `You are a PR report assistant specializing in answering questions about a celebrity based strictly on the provided PR report context. Do not make up information or speculate—only use the information found in the report context below.

Report Context:
${context}

Instructions:
- Only answer questions that are related to the celebrity and the PR report context provided above.
- Do not provide information or opinions that are not explicitly supported by the report context.
- If a question asks for information not found in the report, politely explain that you can only answer based on the provided report.
- Offer clear, concise, and professional responses grounded in the report context.
- Do not invent details or speculate beyond the given information.`,
      temperature: 0.7,
      maxTokens: 1000,
    });

    return response.toTextStreamResponse();
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
