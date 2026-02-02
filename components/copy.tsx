import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyTextProps {
  text: string;
  className?: string;
}

export const CopyText = ({ text, className }: CopyTextProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="flex items-center gap-1">
      <span
        className={cn(
          "truncate text-xs max-w-[180px] text-muted-foreground",
          className
        )}
        title={text}
      >
        {text}
      </span>
      <button
        onClick={handleCopy}
        className="rounded-md hover:bg-muted transition-colors"
        aria-label="Copy text"
      >
        {copied ? (
          <Check className="size-4 text-green-500" />
        ) : (
          <Copy className="size-4 text-muted-foreground" />
        )}
      </button>
    </div>
  );
};
