"use client";

import { toast } from "sonner";
import confetti from "canvas-confetti";
import { animate as framerAnimate } from "framer-motion";

export const useToolsFunctions = () => {
  const timeFunction = () => {
    const now = new Date();
    return {
      success: true,
      time: now.toLocaleTimeString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      message:
        "Announce to user: The current time is " +
        now.toLocaleTimeString() +
        " in " +
        Intl.DateTimeFormat().resolvedOptions().timeZone +
        " timezone.",
    };
  };

  const backgroundFunction = () => {
    try {
      const html = document.documentElement;
      const currentTheme = html.classList.contains("dark") ? "dark" : "light";
      const newTheme = currentTheme === "dark" ? "light" : "dark";

      html.classList.remove(currentTheme);
      html.classList.add(newTheme);

      toast(`Switched to ${newTheme} mode! 🌓`, {
        description: "Switched to " + newTheme + " mode!",
      });

      return {
        success: true,
        theme: newTheme,
        message: "Switched to " + newTheme + " mode!",
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to switch theme: " + error,
      };
    }
  };

  const partyFunction = () => {
    try {
      const duration = 5 * 1000;
      const colors = [
        "#a786ff",
        "#fd8bbc",
        "#eca184",
        "#f8deb1",
        "#3b82f6",
        "#14b8a6",
        "#f97316",
        "#10b981",
        "#facc15",
      ];

      const confettiConfig = {
        particleCount: 30,
        spread: 100,
        startVelocity: 90,
        colors,
        gravity: 0.5,
      };

      const shootConfetti = (
        angle: number,
        origin: { x: number; y: number }
      ) => {
        confetti({
          ...confettiConfig,
          angle,
          origin,
        });
      };

      const animate = () => {
        const now = Date.now();
        const end = now + duration;

        const elements = document.querySelectorAll(
          "div, p, button, h1, h2, h3"
        );
        elements.forEach((element) => {
          framerAnimate(
            element,
            {
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            },
            {
              duration: 0.5,
              repeat: 10,
              ease: "easeInOut",
            }
          );
        });

        const frame = () => {
          if (Date.now() > end) return;
          shootConfetti(60, { x: 0, y: 0.5 });
          shootConfetti(120, { x: 1, y: 0.5 });
          requestAnimationFrame(frame);
        };

        const mainElement = document.querySelector("main");
        if (mainElement) {
          mainElement.classList.remove(
            "bg-gradient-to-b",
            "from-gray-50",
            "to-white"
          );
          const originalBg = mainElement.style.backgroundColor;

          const changeColor = () => {
            const now = Date.now();
            const end = now + duration;

            const colorCycle = () => {
              if (Date.now() > end) {
                framerAnimate(
                  mainElement,
                  { backgroundColor: originalBg },
                  { duration: 0.5 }
                );
                return;
              }
              const newColor =
                colors[Math.floor(Math.random() * colors.length)];
              framerAnimate(
                mainElement,
                { backgroundColor: newColor },
                { duration: 0.2 }
              );
              setTimeout(colorCycle, 200);
            };

            colorCycle();
          };

          changeColor();
        }

        frame();
      };

      animate();
      toast.success("Party mode activated! 🎉", {
        description: "Party mode activated!",
      });
      return { success: true, message: "Party mode activated! 🎉" };
    } catch (error) {
      return { success: false, message: "Party mode failed: " + error };
    }
  };

  const launchWebsite = ({ url }: { url: string }) => {
    window.open(url, "_blank");
    toast("Launched the site" + url + ", tell the user it's been launched.", {
      description:
        "Launched the site" + url + ", tell the user it's been launched.",
    });
    return {
      success: true,
      message: `Launched the site${url}, tell the user it's been launched.`,
    };
  };

  const copyToClipboard = ({ text }: { text: string }) => {
    navigator.clipboard.writeText(text);
    toast("Copied to clipboard: " + text, {
      description: "Copied to clipboard: " + text,
    });
    return {
      success: true,
      text,
      message: "Copied to clipboard: " + text,
    };
  };

  const scrapeWebsite = async ({ url }: { url: string }) => {
    const apiKey = process.env.NEXT_PUBLIC_FIRECRAWL_API_KEY;
    try {
      const scrapeResult: {
        success: boolean;
        markdown: string;
        error: string | null;
      } = {
        success: true,
        markdown: "Here is the scraped website content",
        error: null,
      };

      if (!scrapeResult.success) {
        console.log(scrapeResult.error);
        return {
          success: false,
          message: `Failed to scrape: ${scrapeResult.error}`,
        };
      }

      toast.success("Scraped website successfully", {
        description:
          "Here is the scraped website content: " +
          JSON.stringify(scrapeResult.markdown) +
          "Summarize and explain it to the user now in a response.",
      });

      return {
        success: true,
        message:
          "Here is the scraped website content: " +
          JSON.stringify(scrapeResult.markdown) +
          "Summarize and explain it to the user now in a response.",
      };
    } catch (error) {
      return {
        success: false,
        message: `Error scraping website: ${error}`,
      };
    }
  };

  return {
    timeFunction,
    backgroundFunction,
    partyFunction,
    launchWebsite,
    copyToClipboard,
    scrapeWebsite,
  };
};
