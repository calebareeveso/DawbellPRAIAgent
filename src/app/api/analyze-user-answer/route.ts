import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { NextResponse } from "next/server";

export async function POST(request: any) {
  try {
    const { question, answer } = await request.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Question and answer are required" },
        { status: 400 }
      );
    }

    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `The user is answering an interview question in real-time.

Question: "${question}"

User's current answer: "${answer}"

Analyze if the user has provided a reasonable response to this question. Be lenient and understanding.

If the answer shows any genuine attempt to address the question and provides some relevant information, respond with only the word "Answered"

Only provide feedback if the answer is completely off-topic, extremely brief (less than a few words), or doesn't make any attempt to address the question. Be encouraging and supportive in your feedback.

Remember: We want to be helpful, not overly critical.`,
      temperature: 0.3,
      maxTokens: 200,
    });

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Error in analyze-user-answer API:", error);
    return NextResponse.json(
      { error: "An error occurred while analyzing the answer" },
      { status: 500 }
    );
  }
}
