"use client";

import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useRef,
  useState,
} from "react";
import { replyPRAgentEmail } from "../actions/reply-email";
import { connectGmailAccount } from "../actions/connect-account";
import { getReportEmails } from "../actions/get-emails";
// import { analyzeReportDetails } from "../actions/analyze-report-details";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Share, XCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Options, usePDF } from "react-to-pdf";

//
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TextShimmer } from "@/components/loader/text-shimmer";
import ChatInterface from "@/components/case/chat-Interface";
import AiBrief from "@/components/brief";

interface EmailMessage {
  messageId: string;
  messageTimestamp: string;
  preview: {
    body: string;
    subject: string;
  };
  sender: string;
  threadId: string;
}

export default function Home() {
  const { toPDF, targetRef } = usePDF({
    filename: `pr report.pdf`,
    page: { margin: 0, orientation: "portrait", format: [120, 200] },
  });

  const [activeTab, setActiveTab] = useState("agent");
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isReplying, setIsReplying] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const [caseResolved, setCaseResolved] = useState(false);

  // New state for action flow
  const [currentAction, setCurrentAction] = useState(0);
  const [isActionRunning, setIsActionRunning] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [ReportData, setReportData] = useState<any>(null);
  const [reportText, setReportText] = useState(`<div class="space-y-1">
    <p class="text-gray-700 animate-pulse">AI agent preparing coverage analysis...</p>
  </div>`);

  const [aiReport, setAiReport] = useState("");

  const [analyticsData, setAnalyticsData] = useState<any>(null);

  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [screenshotsImages, setScreenshotsImages] = useState<any[]>([]);

  const [actions, setActions] = useState([
    {
      id: "find-report-request",
      title: "Find Report Request",
      status: "Not Started",
      statusColor: "bg-orange-100 text-orange-800",
      content: null,
    },
    {
      id: "respond-to-request",
      title: "Respond to Request",
      status: "Not Started",
      statusColor: "bg-orange-100 text-orange-800",
      content: null,
    },
    {
      id: "search-media-sources",
      title: "Search for Media Sources",
      status: "Not Started",
      statusColor: "bg-orange-100 text-orange-800",
      content: null,
    },
    {
      id: "generate-report",
      title: "Generate Report",
      status: "Not Started",
      statusColor: "bg-orange-100 text-orange-800",
      content: null,
    },
    {
      id: "take-screenshots",
      title: "Take Screenshots",
      status: "Not Started",
      statusColor: "bg-orange-100 text-orange-800",
      content: null,
    },
    {
      id: "get-analytics",
      title: "Get Analytics",
      status: "Not Started",
      statusColor: "bg-orange-100 text-orange-800",
      content: null,
    },
  ]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const redirectUrl = await connectGmailAccount();
      if (redirectUrl) {
        window.open(redirectUrl, "_blank");
      }
    } catch (error) {
      console.error("Error connecting account:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Action 1: Find Report Request
  const action1 = async () => {
    setLoadingMessage("Reading email…");
    setIsActionRunning(true);

    // Update action to in-progress
    setActions((prev) =>
      prev.map((action: any, index) =>
        index === 0
          ? {
              ...action,
              status: "In Progress",
              statusColor: "bg-blue-100 text-blue-800",
            }
          : action
      )
    );

    const response = await getReportEmails("Media Coverage Report Request");
    console.log("Response:", response);

    // Transform the response to the expected report data structure
    let reportData = null;
    if (
      response &&
      response.data &&
      Array.isArray(response.data.messages) &&
      response.data.messages.length > 0
    ) {
      // Use the first message as the report request
      const msg = response.data.messages[0];
      reportData = {
        attachmentList: msg.attachmentList || [],
        labelIds: msg.labelIds || [],
        messageId: msg.messageId,
        messageText: msg.messageText,
        messageTimestamp: msg.messageTimestamp,
        payload: msg.payload || null,
        preview: {
          body: msg.preview?.body || "",
          subject: msg.preview?.subject || msg.subject || "",
        },
        sender: msg.sender,
        subject: msg.subject,
        threadId: msg.threadId,
        to: msg.to,
      };
    } else {
      // fallback to mock data if response is not as expected
      reportData = {
        attachmentList: [],
        labelIds: ["UNREAD", "IMPORTANT", "CATEGORY_PERSONAL", "INBOX"],
        messageId: "---",
        messageText: "---",
        messageTimestamp: "2025-06-22T09:58:14Z",
        payload: null,
        preview: {
          body: "---",
          subject: "---",
        },
        sender: "---",
        subject: "---",
        threadId: "---",
        to: "---",
      };
    }

    setReportData(reportData);

    // Update action status and content
    setActions((prev) =>
      prev.map((action: any, index) =>
        index === 0
          ? {
              ...action,
              status: "Done",
              statusColor: "bg-green-100 text-green-800",
              content: "request-card",
            }
          : action
      )
    );

    setIsActionRunning(false);
    setLoadingMessage("");
  };

  // Action 2: Respond to Request
  const action2 = async () => {
    setLoadingMessage("Responding to request…");
    setIsActionRunning(true);
    setActions((prev) =>
      prev.map((action: any, index) =>
        index === 1
          ? {
              ...action,
              status: "In Progress",
              statusColor: "bg-blue-100 text-blue-800",
            }
          : action
      )
    );

    // Extract email from "Caleb Areeveso <caleb@rulebase.co>"
    let emailTo = ReportData.to;
    let extractedEmail = emailTo;
    const emailMatch = emailTo && emailTo.match(/<([^>]+)>/);
    if (emailMatch) {
      extractedEmail = emailMatch[1];
    }
    console.log("Extracted email:", extractedEmail);
    const response = await replyPRAgentEmail(
      extractedEmail,
      ReportData.threadId
    );
    console.log("Reply to PR Agent:", response);

    setActions((prev) =>
      prev.map((action: any, index) =>
        index === 1
          ? {
              ...action,
              status: "Done",
              statusColor: "bg-green-100 text-green-800",
              content: "response-email",
            }
          : action
      )
    );
    setIsActionRunning(false);
    setLoadingMessage("");
  };

  const getScreenshotUrls = async (results: any[]) => {
    const screenshotUrls = results.map((result: any) => result.url);
    return screenshotUrls;
  };

  // Action 3: Search for Media Sources
  const action3 = async () => {
    setLoadingMessage("Searching media sources…");
    setIsActionRunning(true);

    setActions((prev) =>
      prev.map((action: any, index) =>
        index === 2
          ? {
              ...action,
              status: "In Progress",
              statusColor: "bg-blue-100 text-blue-800",
            }
          : action
      )
    );

    const response = await fetch("/api/search", {
      method: "POST",
      body: JSON.stringify({ query: ReportData.messageText }),
    });
    const data = await response.json();
    console.log("Search results:", data);

    setSearchResults(data.searchResults.results);
    setAiReport(data.generatedReport);

    if (data.searchResults) {
      const screenshotUrls = await getScreenshotUrls(
        data.searchResults.results
      );
      console.log("screenshotUrls:", screenshotUrls);
      setScreenshots(screenshotUrls);

      setLoadingMessage("Categorizing sources…");

      setActions((prev) =>
        prev.map((action: any, index) =>
          index === 2
            ? {
                ...action,
                status: "Done",
                statusColor: "bg-green-100 text-green-800",
                content: "media-sources-table",
              }
            : action
        )
      );
      setIsActionRunning(false);
      setLoadingMessage("");
    }
  };

  // Action 4: Generate Report
  const action4 = async () => {
    setLoadingMessage("Generating coverage report…");

    setIsActionRunning(true);
    setActions((prev) =>
      prev.map((action: any, index) =>
        index === 3
          ? {
              ...action,
              status: "In Progress",
              statusColor: "bg-blue-100 text-blue-800",
            }
          : action
      )
    );

    if (aiReport) {
      setLoadingMessage("Writing detailed coverage report…");
      setReportText("");
      await streamReportText(`
  
      <div class=\"space-y-4 flex flex-col justify-center items-center text-center report-coverage\">
        ${aiReport}

      </div>
    `);
      setActions((prev) =>
        prev.map((action: any, index) =>
          index === 3
            ? {
                ...action,
                status: "Done",
                statusColor: "bg-green-100 text-green-800",
                content: "scraped-data",
              }
            : action
        )
      );
      setIsActionRunning(false);
      setLoadingMessage("");
    }
  };

  // Action 5: Take Screenshots
  const action5 = async () => {
    setLoadingMessage("Taking screenshots…");
    setIsActionRunning(true);

    // Update action to in-progress
    setActions((prev) =>
      prev.map((action: any, index) =>
        index === 4
          ? {
              ...action,
              status: "In Progress",
              statusColor: "bg-blue-100 text-blue-800",
            }
          : action
      )
    );

    const response = await fetch("/api/screenshots", {
      method: "POST",
      body: JSON.stringify({ urls: screenshots }),
    });
    const data = await response.json();
    const screenshotsData = data.screenshots;
    console.log("Screenshots:", screenshotsData);
    setScreenshotsImages(screenshotsData);
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    // Stream screenshots to the main report

    const screenshotsHtml = searchResults
      .map((result: any, idx: number) => {
        // Defensive: only render if both screenshot and result exist
        if (!screenshotsData[idx] || !result) return "";
        return `
          <div class="space-y-2">
            <img src="${screenshotsData[idx]}" class="w-full rounded border" />
            <p class="text-xs text-gray-600">${result.url.split("/")[2]}</p>
          </div>
        `;
      })
      .join("");

    await streamReportText(`
      <h3 class="font-semibold text-gray-800 mb-3 mt-4">Coverage Screenshots</h3>
      <div class="grid grid-cols-1 gap-4 mb-4">
        ${screenshotsHtml}
      </div>
    `);

    setActions((prev) =>
      prev.map((action: any, index) =>
        index === 4
          ? {
              ...action,
              status: "Done",
              statusColor: "bg-green-100 text-green-800",
              content: "screenshots-grid",
            }
          : action
      )
    );

    setIsActionRunning(false);
    setLoadingMessage("");
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  const transformRawData = (raw: any) => {
    // Get the latest month for visits
    const monthlyVisitsArr = Object.entries(raw.EstimatedMonthlyVisits || {});
    const latestMonth = monthlyVisitsArr.sort((a, b) =>
      b[0].localeCompare(a[0])
    )[0];
    const monthlyVisits = latestMonth ? latestMonth[1] : null;

    return {
      siteName: raw.SiteName,
      globalRank: raw.GlobalRank?.Rank ?? null,
      engagements: {
        bounceRate: Number(raw.Engagments?.BounceRate).toFixed(2),
        monthlyVisits: monthlyVisits
          ? formatNumber(Number(monthlyVisits))
          : null,
        timeOnSite: raw.Engagments?.TimeOnSite
          ? Math.round(Number(raw.Engagments.TimeOnSite)) + "s"
          : null,
        pagePerVisit: Number(raw.Engagments?.PagePerVisit).toFixed(1),
      },
      trafficSources: {
        social: Number(raw.TrafficSources?.Social ?? 0),
        search: Number(raw.TrafficSources?.Search ?? 0),
        direct: Number(raw.TrafficSources?.Direct ?? 0),
      },
    };
  };

  // Action 6: Get Analytics
  const action6 = async () => {
    setLoadingMessage("Gathering analytics data…");
    setIsActionRunning(true);

    // Update action to in-progress
    setActions((prev) =>
      prev.map((action: any, index) =>
        index === 5
          ? {
              ...action,
              status: "In Progress",
              statusColor: "bg-blue-100 text-blue-800",
            }
          : action
      )
    );

    // Use query parameter instead of body for GET request
    for (const result of searchResults) {
      const domain = result.url.split("/")[2];
      const response = await fetch(
        `/api/analytics?domain=${encodeURIComponent(domain)}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      const transformedData = transformRawData(data);
      console.log("Transformed data:", transformedData);
      setAnalyticsData((prev: any) =>
        Array.isArray(prev) ? [...prev, transformedData] : [transformedData]
      );
    }

    setActions((prev) =>
      prev.map((action: any, index) =>
        index === 5
          ? {
              ...action,
              status: "Done",
              statusColor: "bg-green-100 text-green-800",
              content: "analytics-table",
            }
          : action
      )
    );

    setIsActionRunning(false);
    setLoadingMessage("");
    setCaseResolved(true);
  };

  // Start Action Flow
  const startActions = async () => {
    await action1();
    await action2();
    await action3();
    await action4();
    await action5();
    await action6();
  };

  const extractEmailFromSender = (sender: string): string => {
    const match = sender.match(/<([^>]+)>/);
    return match ? match[1] : sender;
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  // Monitor complainantDetails in localStorage and analyze every 10 seconds

  const hasRunAgent = useRef(false);

  useEffect(() => {
    if (!hasRunAgent.current) {
      (async () => await startActions())();
      hasRunAgent.current = true;
    }
  }, []);

  const getStatusIcon = (status: any) => {
    switch (status) {
      case "Done":
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="1"
              y="1"
              width="20"
              height="20"
              rx="10"
              stroke="#449680"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeDasharray="5 5"
            />
            <path
              d="M9.39573 13.4651L7.11748 11.2575C6.99471 11.1386 6.82821 11.0717 6.6546 11.0717C6.48099 11.0717 6.31449 11.1386 6.19173 11.2575C6.06897 11.3765 6 11.5378 6 11.706C6 11.7893 6.01693 11.8718 6.04983 11.9488C6.08273 12.0257 6.13094 12.0957 6.19173 12.1546L8.93614 14.8139C9.1922 15.062 9.60583 15.062 9.86189 14.8139L16.8083 8.08284C16.931 7.96388 17 7.80254 17 7.63431C17 7.46608 16.931 7.30474 16.8083 7.18579C16.6855 7.06683 16.519 7 16.3454 7C16.1718 7 16.0053 7.06683 15.8825 7.18579L9.39573 13.4651Z"
              fill="#449680"
            />
          </svg>
        );
      case "In Progress":
        return (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        );
      case "Started":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "Not Started":
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="1"
              y="1"
              width="20"
              height="20"
              rx="10"
              strokeWidth={1.5}
              stroke="#D5914D"
              strokeLinecap="round"
              strokeDasharray="5 5"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderActionContent = (action: any) => {
    switch (action.content) {
      case "request-card":
        return (
          <div className="bg-white border border-[#E9E4E2] rounded-lg p-4">
            <div className="mb-3">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">
                  {ReportData?.subject}
                </h4>
                <span className="text-xs text-gray-500">
                  {ReportData?.messageTimestamp}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                From: {ReportData?.sender}
              </p>
              <p className="text-sm text-gray-700">
                {ReportData?.preview?.body}
              </p>
            </div>
          </div>
        );

      case "response-email":
        return (
          <div className="bg-[#FAF9F8] border border-[#E9E4E2] rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">
              Email Response Sent
            </h5>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>To:</strong> {ReportData?.to}
              </p>
              <p>
                <strong>Subject:</strong> Re: {ReportData?.subject}
              </p>
              <p className="mt-3 bg-white p-3 rounded border">
                Generated media coverage... here it is:{" "}
                <a href={`/demo`} target="_blank">
                  https://localhost:3000/demo
                </a>
              </p>
            </div>
          </div>
        );

      case "media-sources-table":
        return (
          <div className="bg-white border border-[#E9E4E2] rounded-lg p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E9E4E2]">
                  <th className="text-left py-2 font-medium text-gray-900">
                    Source URL
                  </th>
                  <th className="text-left py-2 font-medium text-gray-900">
                    Priority Tier
                  </th>
                  <th className="text-left py-2 font-medium text-gray-900">
                    Coverage Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((result: any, index) => (
                  <tr key={result.url}>
                    <td className="py-2 text-gray-700 max-w-xs truncate">
                      {result.url}{" "}
                    </td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          result.score > 0.5
                            ? "bg-green-100 text-green-800"
                            : result.score > 0.3
                            ? "bg-blue-100 text-blue-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {result.score > 0.5
                          ? "Top-tier"
                          : result.score > 0.3
                          ? "Mid-tier"
                          : "Low-tier"}
                      </span>
                    </td>
                    <td className="py-2 text-gray-700">
                      {result.score > 0.3 ? "Headline Coverage" : "Mention"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "scraped-data":
        return (
          <div className="bg-[#FAF9F8] border border-[#E9E4E2] rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">
              Scraped Page Data
            </h5>
            <div className="space-y-4 text-sm">
              {searchResults.map((result: any) => (
                <div key={result.id}>
                  <h3 className="text-gray-800">
                    <span className="text-gray-500">Source:</span> {result.url}
                  </h3>
                  <h4 className="text-gray-800">
                    <span className="text-gray-500">Published Date:</span>{" "}
                    {result.published_date}
                  </h4>
                  <h4 className="text-gray-800">
                    <span className="text-gray-500">Title:</span> {result.title}
                  </h4>
                  <p className="text-gray-800">
                    <span className="text-gray-500">Content:</span>{" "}
                    {result.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case "screenshots-grid":
        return (
          <div className="bg-white border border-[#E9E4E2] rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">
              Coverage Screenshots
            </h5>
            <div className="grid grid-cols-2 gap-4">
              {searchResults.map((result: any, idx: number) => (
                <div className="space-y-2" key={idx}>
                  <img
                    src={screenshotsImages[idx]}
                    alt={result.title || `Screenshot ${idx + 1}`}
                    className="w-full rounded border"
                  />
                  <p className="text-xs text-gray-600">
                    {result.url.split("/")[2]} - {result.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case "analytics-table":
        // const analyticsData = [
        //   {
        //     siteName: searchResults[0].url.split("/")[2],
        //     globalRank: 92,
        //     engagements: {
        //       bounceRate: "0.55",
        //       monthlyVisits: "504M",
        //       timeOnSite: "154s",
        //       pagePerVisit: "2.3",
        //     },
        //     trafficSources: {
        //       social: 0.25,
        //       search: 0.45,
        //       direct: 0.3,
        //     },
        //   },
        //   {
        //     siteName: searchResults[1].url.split("/")[2],
        //     globalRank: 4247,
        //     engagements: {
        //       bounceRate: "0.6",
        //       monthlyVisits: "8.2M",
        //       timeOnSite: "92.7s",
        //       pagePerVisit: "3.1",
        //     },
        //     trafficSources: {
        //       social: 0.35,
        //       search: 0.4,
        //       direct: 0.25,
        //     },
        //   },
        //   {
        //     siteName: searchResults[2].url.split("/")[2],
        //     globalRank: 1243,
        //     engagements: {
        //       bounceRate: "0.55",
        //       monthlyVisits: "4.8M",
        //       timeOnSite: "156.4",
        //       pagePerVisit: "2.4",
        //     },
        //     trafficSources: {
        //       social: 0.45,
        //       search: 0.35,
        //       direct: 0.2,
        //     },
        //   },
        //   {
        //     siteName: searchResults[3].url.split("/")[2],
        //     globalRank: 1870,
        //     engagements: {
        //       bounceRate: "0.77",
        //       monthlyVisits: "2.1M",
        //       timeOnSite: "134.2",
        //       pagePerVisit: "2.1",
        //     },
        //     trafficSources: {
        //       social: 0.4,
        //       search: 0.35,
        //       direct: 0.25,
        //     },
        //   },
        //   {
        //     siteName: searchResults[4].url.split("/")[2],
        //     globalRank: 1368,
        //     engagements: {
        //       bounceRate: "0.62",
        //       monthlyVisits: "950K",
        //       timeOnSite: "112.8",
        //       pagePerVisit: "1.8",
        //     },
        //     trafficSources: {
        //       social: 0.35,
        //       search: 0.4,
        //       direct: 0.25,
        //     },
        //   },
        // ];

        return (
          <div className="bg-white border border-[#E9E4E2] rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">
              Analytics Summary
            </h5>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E9E4E2]">
                  <th className="text-left py-2 font-medium text-gray-900">
                    Media Source
                  </th>
                  <th className="text-left py-2 font-medium text-gray-900">
                    Global Rank
                  </th>
                  <th className="text-left py-2 font-medium text-gray-900">
                    Monthly Visits
                  </th>
                  <th className="text-left py-2 font-medium text-gray-900">
                    Avg Time (sec)
                  </th>
                  <th className="text-left py-2 font-medium text-gray-900">
                    Bounce Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {analyticsData &&
                  analyticsData.length > 0 &&
                  analyticsData.map((site: any, index: number) => (
                    <tr key={index}>
                      <td className="py-2 text-gray-700">{site.siteName}</td>
                      <td className="py-2 text-gray-700">#{site.globalRank}</td>
                      <td className="py-2 text-gray-700">
                        {site.engagements.monthlyVisits}
                      </td>
                      <td className="py-2 text-gray-700">
                        {site.engagements.timeOnSite}
                      </td>
                      <td className="py-2 text-gray-700">
                        {site.engagements.bounceRate}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        );

      default:
        if (action.status === "In Progress") {
          return (
            <TextShimmer
              duration={1.6}
              className="text-sm font-normal mb-3 pl-7 pt-2 font-display [--base-color:#11111133] [--base-gradient-color:#11111199] "
            >
              {loadingMessage}
            </TextShimmer>
          );
        }
        if (action.status === "Not Started") {
          return (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          );
        }
        return null;
    }
  };

  // Accordion open logic
  const openAccordions = actions
    .filter((a) => a.status === "In Progress" || a.status === "Done")
    .map((a) => a.id);

  // Streaming function for report text (append mode, always up-to-date)
  const streamReportText = async (html: string, delay: number = 10) => {
    for (let i = 0; i < html.length; i++) {
      setReportText((prev) => prev + html[i]);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F8]">
      {/* Main Content */}
      {/* <div className="flex gap-2 p-4 w-full">
        {Array.from({ length: 6 }).map((_, index) => (
          <button
            onClick={() => {
              if (index === 0) {
                action1();
              } else if (index === 1) {
                action2();
              } else if (index === 2) {
                action3();
              } else if (index === 3) {
                action4();
              } else if (index === 4) {
                action5();
              } else if (index === 5) {
                action6();
              }
            }}
            key={index}
            className="bg-primary text-white px-4 py-2 rounded-sm w-full"
          >
            Action {index + 1}
          </button>
        ))}
      </div> */}
      <div className="flex h-screen">
        {/* Left Panel - Report */}
        <div className="flex-1 w-2/5 flex flex-col h-screen overflow-y-scroll">
          {/* Header */}
          <div className="bg-[#FAF9F8] border-b px-6 py-[10.5px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {caseResolved ? (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Genrated
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    Generating...
                  </Badge>
                )}
                <span className="text-sm font-medium text-gray-600">
                  Report
                </span>
              </div>
              <button
                onClick={async () => {
                  await toPDF();
                }}
                className="cursor-pointer gap-1 rounded-sm flex items-center text-sm bg-[#EDECEB] px-2 py-1.5"
              >
                <Share className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 flex flex-col">
            <div
              ref={targetRef}
              className="flex-1 p-4 flex flex-col shadow-sm bg-white p-4 py-3 rounded-md"
            >
              <div dangerouslySetInnerHTML={{ __html: reportText }} />
            </div>
          </div>
        </div>

        {/* Right Panel - Actions */}
        <div className="w-3/5 bg-[#FAF9F8] border-l border-[#E9E4E2] p-0  h-screen overflow-y-scroll">
          {/* <button
            onClick={startActions}
            disabled={isActionRunning}
            className="bg-blue-100 text-blue-800 cursor-pointer w-full py-4 text-sm text-center hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isActionRunning ? loadingMessage : "Start Action"}
          </button> */}

          <div className="bg-[#F6F4F4] px-2 py-1.5">
            <div className="flex">
              <button
                onClick={() => setActiveTab("agent")}
                className={`w-full py-[7.2px] rounded-md flex items-center justify-center text-base font-normal ${
                  activeTab === "agent"
                    ? "bg-white shadow border border-gray-200"
                    : "bg-transparent"
                }`}
              >
                <span>AI Agents</span>
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`w-full  py-[7.2px] rounded-md flex items-center justify-center text-base font-normal ${
                  activeTab === "chat"
                    ? "bg-white shadow border border-gray-200"
                    : "bg-transparent"
                }`}
              >
                <span>AI Editor</span>
              </button>
              <button
                onClick={() => setActiveTab("brief")}
                className={`w-full  py-[7.2px] rounded-md flex items-center justify-center text-base font-normal ${
                  activeTab === "brief"
                    ? "bg-white shadow border border-gray-200"
                    : "bg-transparent"
                }`}
              >
                <span>AI Brief</span>
              </button>
            </div>
          </div>

          {activeTab === "agent" ? (
            <Accordion
              type="multiple"
              className="space-y-0"
              value={openAccordions}
              onValueChange={() => {}}
            >
              {actions.map((action: any, index: number) => (
                <AccordionItem
                  key={action.id}
                  value={action.id}
                  className="border border-gray-200 rounded-none"
                >
                  <AccordionTrigger className="cursor-pointer px-4 py-3.5 hover:no-underline hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 w-full">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(action.status)}
                        <span className="text-sm font-medium text-gray-900">
                          {action.title}
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`${action.statusColor} text-xs`}
                      >
                        {action.status}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-3 bg-white pt-3 border-t border-[#E9E4E2]">
                    {renderActionContent(action)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : activeTab === "chat" ? (
            <ChatInterface
              reportText={reportText}
              setReportText={setReportText}
            />
          ) : activeTab === "brief" ? (
            <AiBrief />
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}
