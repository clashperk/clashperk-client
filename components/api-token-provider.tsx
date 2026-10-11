"use client";

import { setApiToken } from "@/hooks/api/axios";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

export function ApiTokenProvider({ children }: { children: React.ReactNode }) {
  const accessToken = useSession().data?.accessToken;
  // Set during render, not in an effect: the page's effects (its first API calls) run before a parent's.
  useMemo(() => setApiToken(accessToken), [accessToken]);
  return children;
}
