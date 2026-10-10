"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const PIN_OFFSET = 16;

/** Filter bar pinned 16px from the top on md+; shows an edge once content scrolls under it. */
export function StickyBar({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    // Shrinking the root to just below the pin line makes a pinned bar report as clipped.
    const observer = new IntersectionObserver(
      ([entry]) =>
        setStuck(
          entry.intersectionRatio < 1 &&
            entry.boundingClientRect.top <= PIN_OFFSET,
        ),
      { rootMargin: `-${PIN_OFFSET + 1}px 0px 0px 0px`, threshold: 1 },
    );
    observer.observe(ref.current!);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        // ::before and ::after cover 16px above and below so rows stop short of the pinned bar.
        "md:sticky md:top-4 md:z-10 md:bg-background md:before:absolute md:before:inset-x-0 md:before:-top-4 md:before:h-4 md:before:bg-background md:before:content-[''] md:after:absolute md:after:inset-x-0 md:after:-bottom-4 md:after:h-4 md:after:bg-background md:after:content-['']",
        stuck && "md:after:shadow-[0_12px_12px_-12px_rgba(0,0,0,.35)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
