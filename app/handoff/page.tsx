"use client";

import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const Page = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const loginByHandOffToken = async () => {
      const token = searchParams.get("handoff_token");
      const redirect = searchParams.get("redirect") || "/";

      if (!token) return;

      await signIn("credentials", {
        token,
        redirectTo: redirect,
      });
    };

    loginByHandOffToken();
  }, []); // eslint-disable-line

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 text-white">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        <h1 className="text-base font-medium tracking-tight">Signing you in</h1>
        <p className="text-sm text-neutral-500">Redirecting securely…</p>
      </div>
    </div>
  );
};

export default Page;
