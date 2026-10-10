"use client";

import { isLightOnlyRoute } from "@/lib/routelist";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";
import * as React from "react";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const pathname = usePathname();

  return (
    <NextThemesProvider
      {...props}
      forcedTheme={isLightOnlyRoute(pathname) ? "light" : undefined}
    >
      {children}
    </NextThemesProvider>
  );
}
