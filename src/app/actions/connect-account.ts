"use server";

// Connect an account

import { OpenAIToolSet } from "composio-core";

// set up to get ids: https://old-app.composio.dev/app/gmail
const toolset = new OpenAIToolSet({ apiKey: "..." });

const integration = await toolset.integrations.get({
  integrationId: "...",
});

const connectGmailAccount = async () => {
  const expectedInputFields = await toolset.integrations.getRequiredParams({
    integrationId: integration.id!,
  });
  // Collect auth params from your users
  console.log(expectedInputFields);
  const connectedAccount = await toolset.connectedAccounts.initiate({
    integrationId: integration.id,
    entityId: "default",
  });

  // connected account properties:
  // connectionStatus (string), connectedAccountId (string), redirectUrl (string | null)
  console.log(connectedAccount.redirectUrl);

  return connectedAccount.redirectUrl;
};

export { connectGmailAccount };
