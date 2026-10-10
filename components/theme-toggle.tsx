"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMounted } from "@/hooks/use-mounted";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const mounted = useMounted();

  return (
    <Tabs value={mounted ? theme : ""} onValueChange={setTheme}>
      <TabsList>
        <TabsTrigger value="light">
          <Sun className="h-[1.2rem] w-[1.2rem] mr-2" />
          Light
        </TabsTrigger>
        <TabsTrigger value="dark">
          <Moon className="h-[1.2rem] w-[1.2rem] mr-2" />
          Dark
        </TabsTrigger>
        <TabsTrigger value="system">
          <Laptop className="h-[1.2rem] w-[1.2rem] mr-2" />
          System
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
