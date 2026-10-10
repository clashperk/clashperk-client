"use client";

import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import { WebShell } from "./components/web-page";

export default function WebError({ reset }: { reset: () => void }) {
  return (
    <WebShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border px-6 py-16 text-center">
        <p className="font-medium">This page could not be loaded</p>
        <p className="text-sm text-muted-foreground">
          The Clash of Clans data did not come through. Try again in a moment.
        </p>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCw />
          Try again
        </Button>
      </div>
    </WebShell>
  );
}
