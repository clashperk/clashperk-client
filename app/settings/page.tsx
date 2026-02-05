"use client";

import { ModeToggle } from "@/components/theme-toggle";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function SettingsPage() {
  const [autoWar, setAutoWar] = useState(false);
  const [autoRecruit, setAutoRecruit] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div className="flex flex-1 flex-col h-full w-full">
      <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-10 space-y-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            <p className="text-muted-foreground">
              Manage your bot configuration and preferences.
            </p>
          </div>
        </div>

        <div className="space-y-10">
          {/* General Settings */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b">
              <h3 className="text-xl font-semibold">General Configuration</h3>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 md:gap-8 items-center">
                <div className="space-y-1">
                  <Label htmlFor="language" className="text-base font-medium">
                    Language
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Preferred language for bot responses.
                  </p>
                </div>
                <Select defaultValue="en">
                  <SelectTrigger className="w-full max-w-[200px]">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 md:gap-8 items-center">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Maintenance Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Disable public commands.
                  </p>
                </div>
                <div className="flex justify-start">
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Automation & Features */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b">
              <h3 className="text-xl font-semibold">Automation</h3>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 md:gap-8 items-center">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Auto-Start War
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Start Friendly Wars automatically.
                  </p>
                </div>
                <div className="flex justify-start">
                  <Switch checked={autoWar} onCheckedChange={setAutoWar} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 md:gap-8 items-center">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Auto-Recruit</Label>
                  <p className="text-sm text-muted-foreground">
                    Post recruitment messages periodically.
                  </p>
                </div>
                <div className="flex justify-start">
                  <Switch
                    checked={autoRecruit}
                    onCheckedChange={setAutoRecruit}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 md:gap-8 items-center">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Donation Tracking
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Log donations in the database.
                  </p>
                </div>
                <div className="flex justify-start">
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b">
              <h3 className="text-xl font-semibold">Appearance</h3>
            </div>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 md:gap-8 items-center">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Select your interface theme.
                  </p>
                </div>
                <div className="flex items-center">
                  <ModeToggle />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
