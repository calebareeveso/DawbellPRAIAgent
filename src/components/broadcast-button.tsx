import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BroadcastButtonProps {
  isSessionActive: boolean;
  onClick: () => void;
}

export function BroadcastButton({
  isSessionActive,
  onClick,
}: BroadcastButtonProps) {
  return (
    <Button
      variant={isSessionActive ? "destructive" : "default"}
      className="py-6 text-lg font-medium flex flex-col items-center justify-center gap-2 motion-preset-shake h-42 w-42 rounded-full"
      onClick={onClick}
    >
      {isSessionActive && (
        <Badge
          variant="secondary"
          className="animate-pulse bg-red-100 text-red-700"
        >
          Briefing
        </Badge>
      )}
      {isSessionActive ? "End Brief" : "Start Brief"}
    </Button>
  );
}
