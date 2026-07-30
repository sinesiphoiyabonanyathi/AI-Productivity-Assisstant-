import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Responsible-AI disclaimer. Use on any screen that shows generated content.
 */
export function AiDisclaimer({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
      role="note"
    >
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
      <p className="min-w-0">
        {children ??
          "Responses are AI-generated and may be inaccurate or biased. Review them before acting, never use them as the sole basis for a hiring decision, and avoid sharing confidential or personal data."}
      </p>
    </div>
  );
}
