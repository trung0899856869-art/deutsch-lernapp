import { WORTART_COLORS, type Wortart } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function WortartBadge({
  wortart,
  className,
}: {
  wortart: Wortart;
  className?: string;
}) {
  const colors = WORTART_COLORS[wortart];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        colors.badge,
        className
      )}
    >
      {wortart}
    </span>
  );
}
