"use client";

import { setCookie } from "cookies-next";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

// Reads the client session so the API cookie follows a server switch without a reload.
export const LoginProvider = () => {
  const accessToken = useSession().data?.accessToken;

  useEffect(() => {
    if (accessToken) {
      setCookie("x-access-token", accessToken);
    }
  }, [accessToken]);

  return null;
};
