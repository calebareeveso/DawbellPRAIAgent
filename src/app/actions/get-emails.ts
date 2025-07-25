// Execute tools: Get Emails
"use server";
// 1. Import necessary packages
import { OpenAIToolSet } from "composio-core";

// 2. Initialize the Composio toolset with your API key
const composio_toolset = new OpenAIToolSet({
  apiKey: "p2ln28xfiglj3b4wjnrof",
});

const getReportEmails = async (subject: string) => {
  console.log("Fetching emails for subject:", subject);
  const action = "GMAIL_FETCH_EMAILS";
  const params = {
    user_id: "me", // "me" refers to the authenticated user
    query: `subject:${subject} is:unread `, // Gmail search query
    max_results: 3, // Maximum number of emails to fetch
    include_payload: false,
  };

  try {
    const response = await composio_toolset.executeAction({
      action,
      params,
    });
    console.log("Fetched Emails:", response);
    return response;
  } catch (error) {
    console.error("Error fetching emails:", error);
    return null;
  }
};

export { getReportEmails };

// import { OpenAI } from "openai";
// import { OpenAIToolSet } from "composio-core";
// const openai_client = new OpenAI({apiKey:  process.env.OPENAI_API_KEY});
// const composio_toolset = new OpenAIToolSet({
//     apiKey: "p2ln28xfiglj3b4wjnrof"
// });

// const tools = await composio_toolset.getTools({
//     actions: ["GMAIL_FETCH_EMAILS"]
// });

// const instruction = "subject:New Report. max results 2 ";

// // Creating a chat completion request to the OpenAI model
// const response = await openai_client.chat.completions.create({
//     model: "gpt-4.1-mini",
//     messages: [{ role: "user", content: instruction }],
//     tools: tools,
//     tool_choice: "auto",
// });

// const tool_response = await composio_toolset.handleToolCall(response);

// console.log(tool_response);

/*

{"data":{"messages":[{"attachmentList":[],"labelIds":["CATEGORY_UPDATES","INBOX"],"messageId":"197907f2877173aa","messageText":"[image: Google]\r\nComposio was granted access to your Google account\r\n\r\n\r\ncalebgoddey@gmail.com\r\n\r\nIf you did not grant access, you should check this activity and secure your\r\naccount.\r\nCheck activity\r\n<https://accounts.google.com/AccountChooser?Email=calebgoddey@gmail.com&continue=https://myaccount.google.com/alert/nt/1750475941000?rfn%3D127%26rfnc%3D1%26eid%3D-4835561042797316746%26et%3D0>\r\nYou can also see security activity at\r\nhttps://myaccount.google.com/notifications\r\nYou received this email to let you know about important changes to your\r\nGoogle Account and services.\r\n© 2025 Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA\r\n","messageTimestamp":"2025-06-21T03:19:01Z","payload":{"body":{"size":0},"filename":"","headers":[{"name":"Delivered-To","value":"calebgoddey@gmail.com"},{"name":"Received","value":"by 2002:a05:6f02:8588:b0:8b:1af2:e9fb with SMTP id f8csp1346544rch;        Fri, 20 Jun 2025 20:19:02 -0700 (PDT)"},{"name":"X-Received","value":"by 2002:a05:690c:610f:b0:70e:1aa1:63b4 with SMTP id 00721157ae682-712c65125d6mr74031627b3.38.1750475942222;        Fri, 20 Jun 2025 20:19:02 -0700 (PDT)"},{"name":"ARC-Seal","value":"i=1; a=rsa-sha256; t=1750475942; cv=none;        d=google.com; s=arc-20240605;        b=P5tIC91zhBGDcmgbUTNfQyvHvH6EBKbF4smH2VXZmApCyNAM04gy/UmDDDYRvs1VDG         +CI1tZEqhi0Cpkbvm+boSi5OppMJklML4j+txJEvVVYb1YQAF56eQRrGXGJgeB9Prj6x         Qn2n+5vkWuOpr8n0iOk3ujR0zkedlIPypWv8JeVVG0STaRX4JVZkWdvn4zMzuLffWyJH         dRA4CEr2KEt9JmAYcvGhGE3rfn/X11QsJGZHAWX7A9NHuz2SPjLL63ZNOaAmTu24XwDi         EQHuziT5q2DFtQh+E6WUlJg2ddVXoNXscd/H3k7PdpmQRlmrir7njo98DDLrMPjqm89N         LdnQ=="},{"name":"ARC-Message-Signature","value":"i=1; a=rsa-sha256; c=relaxed/relaxed; d=google.com; s=arc-20240605;        h=to:from:subject:message-id:feedback-id:date:mime-version         :dkim-signature;        bh=CgfG5lMrnWkJWI0Y6pJBhDJTHWJyQ2DfzsweRCjumhQ=;        fh=2PD8JhVZDF2n4wpfCxBo4lx3ROajLM+dTl3rThI1AA0=;        b=WXwWu2RQsIztfMMeiYKaZwa2svN0ef16lkXc4AE8AXGooRWFpXCICftGqwWTo29H7T         6G58oLLy5v6VtLzHMQQRWtmLcALlo8rUPGkrBUV1yxOs66O/TAxb+mD+WJH6SbMoJ50e         JemCx/srD+YVc00zj0tZBmBu3RkXMAF2DjmLHSnXN0yqxXfAYHTBhKaHL0gcVWfRb2z8         zW4sPc3Ts1JXZg0+YErUV1D6qRFAksXjibeBuBvmG0LbdBzZsqdOQcUnBglHd4GehsLl         BcnB2mFdy5H0z+l4CrA5INagBe2iTYJLM2oTF/FirWJ6fumUIqZYiivZBfJ3AgBlHst5         TzGg==;        dara=google.com"},{"name":"ARC-Authentication-Results","value":"i=1; mx.google.com;       dkim=pass header.i=@accounts.google.com header.s=20230601 header.b=c1TrZ5Wd;       spf=pass (google.com: domain of 3psrwaagtc5a78-by95iuww8e7dc.08805y.w86wu5yv08xxyi06u25.w86@gaia.bounces.google.com designates 209.85.220.73 as permitted sender) smtp.mailfrom=3pSRWaAgTC5A78-By95Iuww8E7DC.08805y.w86wu5yv08xxyI06u25.w86@gaia.bounces.google.com;       dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=accounts.google.com;       dara=pass header.i=@gmail.com"},{"name":"Return-Path","value":"<3pSRWaAgTC5A78-By95Iuww8E7DC.08805y.w86wu5yv08xxyI06u25.w86@gaia.bounces.google.com>"},{"name":"Received","value":"from mail-sor-f73.google.com (mail-sor-f73.google.com. [209.85.220.73])        by mx.google.com with SMTPS id 00721157ae682-712c486f4d4sor20170097b3.0.2025.06.20.20.19.02        for <calebgoddey@gmail.com>        (Google Transport Security);        Fri, 20 Jun 2025 20:19:02 -0700 (PDT)"},{"name":"Received-SPF","value":"pass (google.com: domain of 3psrwaagtc5a78-by95iuww8e7dc.08805y.w86wu5yv08xxyi06u25.w86@gaia.bounces.google.com designates 209.85.220.73 as permitted sender) client-ip=209.85.220.73;"},{"name":"Authentication-Results","value":"mx.google.com;       dkim=pass header.i=@accounts.google.com header.s=20230601 header.b=c1TrZ5Wd;       spf=pass (google.com: domain of 3psrwaagtc5a78-by95iuww8e7dc.08805y.w86wu5yv08xxyi06u25.w86@gaia.bounces.google.com designates 209.85.220.73 as permitted sender) smtp.mailfrom=3pSRWaAgTC5A78-By95Iuww8E7DC.08805y.w86wu5yv08xxyI06u25.w86@gaia.bounces.google.com;       dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=accounts.google.com;       dara=pass header.i=@gmail.com"},{"name":"DKIM-Signature","value":"v=1; a=rsa-sha256; c=relaxed/relaxed;        d=accounts.google.com; s=20230601; t=1750475941; x=1751080741; dara=google.com;        h=to:from:subject:message-id:feedback-id:date:mime-version:from:to:cc         :subject:date:message-id:reply-to;        bh=CgfG5lMrnWkJWI0Y6pJBhDJTHWJyQ2DfzsweRCjumhQ=;        b=c1TrZ5WdK0vxQgD+DkVAuKSmGKvW9LYLsncjZv/FaevcSwwW6/GHAWOApCGI+n5YCg         7aLtbwABlGHXQb87n3lwUuFqH4URemgqZUsN3dK4ZbXGZkw+KtDTDK1dDN/wDVle9nLS         3oCCmhweZ7nfE7Xki811sh3VmPrnyyBP0dj9URpwCt/MYE1h38Q/Z4yjDrnbX73M4e/o         dVLbudTMGUOOlXoOYa6kLMpFAykNpSF5p7UcqV5fTeQ/PfHdL+MTAm+xslQl3dedNELE         txMGTi6+HbI72x4UQ1Qd7WNT8xf0giJZVcfQeQgLbwoYX48yNXPXQtc+t0fU0KW00thK         YIJw=="},{"name":"X-Google-DKIM-Signature","value":"v=1; a=rsa-sha256; c=relaxed/relaxed;        d=1e100.net; s=20230601; t=1750475941; x=1751080741;        h=to:from:subject:message-id:feedback-id:date:mime-version         :x-gm-message-state:from:to:cc:subject:date:message-id:reply-to;        bh=CgfG5lMrnWkJWI0Y6pJBhDJTHWJyQ2DfzsweRCjumhQ=;        b=YA/4sdIXvV1X3N3nLYwslkrk1zF6mGIb89c1AUkYOVHp24yj6qKZxZJDHpWInwFZLi         7NvJaSrdfsQhmC1KadzyHtbpmTEyHUAkQysxkBrPYMq4vrgFsZxq04jGS4x5KPFgeq65         sK1lDGooTmf71K7vOz6uQNvzcY3ax446SRHAdl83gYoWoDvjCCGD4lPYlHmBh874oDJs         wTinGidiRjdA6+S4bTyfzmqIqW3I6jzTsT5h/6TEec8R0cb918mPsr+7PQKO35GInBuk         JI7awarCc7zoPFJjrWFyvtuf2t8nAig7UvSDzvxRBo1alzaXE6c1v+RDm430OQ0b1F8B         BU9A=="},{"name":"X-Gm-Message-State","value":"AOJu0Yx26besQ6Z6dUVRXncm6+ppF5rzjNRwXuXUlo+J7Ps8vCCOQsks D09dkJkGgIK8MlglW7ZUSOIKRFjrUbMauvmuYGWLXPfqc0bedMS6E1dLT1iPkYIh1KNlCy1cFBv ZhNzCZmi+Iyae2HwLUXRnl6763GHX7I+I6p8T/dU="},{"name":"X-Google-Smtp-Source","value":"AGHT+IFyA2jT1PJvQ+qTXjBotm1DsCFfG8SeQ1GBE2br8p5PFSHY7e9XTY65vnACg57fCzT9C7kvN/FqUmpV5dkZfGSKJw=="},{"name":"MIME-Version","value":"1.0"},{"name":"X-Received","value":"by 2002:a05:690c:67c7:b0:70e:1ef7:6eff with SMTP id 00721157ae682-712c6312706mr78687627b3.3.1750475941821; Fri, 20 Jun 2025 20:19:01 -0700 (PDT)"},{"name":"Date","value":"Sat, 21 Jun 2025 03:19:01 GMT"},{"name":"X-Account-Notification-Type","value":"127"},{"name":"Feedback-ID","value":"127:account-notifier"},{"name":"X-Notifications","value":"e5ea35f761ea0000"},{"name":"X-Notifications-Bounce-Info","value":"AWo...","size":4703},"filename":"","headers":[{"name":"Content-Type","value":"text/html; charset=\"UTF-8\""},{"name":"Content-Transfer-Encoding","value":"quoted-printable"}],"mimeType":"text/html","partId":"1"}]},"preview":{"body":"Composio was granted access to your Google account calebgoddey@gmail.com If you did not grant access, you should check this activity and secure your account. Check activity You can also see security","subject":"Security alert"},"sender":"Google <no-reply@accounts.google.com>","subject":"Security alert","threadId":"197907f2877173aa","to":"calebgoddey@gmail.com"}],"nextPageToken":"13984323335870973192","resultSizeEstimate":201},"successful":true,"error":null,"log_id":"log_-qQbt_heS4B2"}

*/
