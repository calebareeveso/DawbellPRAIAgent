"use server";
import { OpenAI } from "openai";
import { OpenAIToolSet } from "composio-core";
const openai_client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const composio_toolset = new OpenAIToolSet({
  apiKey: "p2ln28xfiglj3b4wjnrof",
});

const tools = await composio_toolset.getTools({
  actions: ["GMAIL_REPLY_TO_THREAD"],
});

const replyPRAgentEmail = async (email: string, threadId: string) => {
  const action = "GMAIL_REPLY_TO_THREAD";
  const params = {
    user_id: "me", // "me" refers to the authenticated user
    recipient_email: email,
    message_body: `<!DOCTYPE html>
<html>

  <head>
    <meta charset="UTF-8">
    <title>Media Coverage Report</title>
  </head>

  <body>
 <div>
  Generated media coverage... here it is: <a href='https://localhost:3000/demo'>https://localhost:3000/demo</a>
 </div>
  </body>
</html>`,
    thread_id: threadId,
    is_html: true,
  };

  try {
    const response = await composio_toolset.executeAction({
      action,
      params,
    });
    console.log("sent email: ", response);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
};

export { replyPRAgentEmail };
