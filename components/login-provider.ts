"use client";

import { setCookie } from "cookies-next";
import { useEffect } from "react";

interface LoginProviderProps {
  accessToken?: string | null;
}

export const LoginProvider = ({ accessToken }: LoginProviderProps) => {
  useEffect(() => {
    if (accessToken) {
      setCookie("x-access-token", accessToken);
    }
  }, [accessToken]);

  return null;
};
