"use client";

import React, { useEffect, useState } from "react";
import { MessageControls } from "@/components/message-controls";
import { motion } from "framer-motion";
import { useToolsFunctions } from "@/hooks/use-tools";
import { tools } from "@/lib/tools";
import { BroadcastButton } from "../broadcast-button";
import useWebRTCAudioSession from "@/hooks/use-webrtc";
import { TextInput } from "../text-input";

const AiBrief: React.FC = () => {
  // State for voice selection
  const [voice, setVoice] = useState("verse");

  // WebRTC Audio Session Hook
  const {
    status,
    isSessionActive,
    registerFunction,
    handleStartStopClick,
    msgs,
    conversation,
    sendTextMessage,
  } = useWebRTCAudioSession(voice, tools);

  // Get all tools functions
  const toolsFunctions = useToolsFunctions();

  useEffect(() => {
    // Register all functions by iterating over the object
    Object.entries(toolsFunctions).forEach(([name, func]) => {
      const functionNames: Record<string, string> = {
        timeFunction: "getCurrentTime",
        backgroundFunction: "changeBackgroundColor",
        partyFunction: "partyMode",
        launchWebsite: "launchWebsite",
        copyToClipboard: "copyToClipboard",
        scrapeWebsite: "scrapeWebsite",
      };

      registerFunction(functionNames[name], func);
    });
  }, [registerFunction, toolsFunctions]);

  return (
    <main className="h-full">
      <div className="container flex flex-col items-center justify-center mx-auto max-w-3xl my-20 p-12 mt-56">
        <div className="">
          <BroadcastButton
            isSessionActive={isSessionActive}
            onClick={handleStartStopClick}
          />
        </div>

        {status && (
          <div className="w-full flex flex-col gap-0 flex-1 flex-grow">
            <MessageControls conversation={conversation} msgs={msgs} />
            {/* <TextInput
                onSubmit={sendTextMessage}
                disabled={!isSessionActive}
              /> */}
          </div>
        )}

        {status && (
          <div className="w-full flex flex-col items-center gap-4 opacity-70 mt-6">
            {status}
          </div>
        )}
      </div>
    </main>
  );
};

export default AiBrief;
