"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bell,
  Check,
  Plus,
  Settings,
  Shield,
  Swords,
  Users,
} from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
  const [isPremium, setIsPremium] = useState(false);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Dashboard
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            Manage your subscription and server limits.
          </p>
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none">
            Download Report
          </Button>
          <Button className="flex-1 md:flex-none">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clans</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 active from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Rosters
            </CardTitle>
            <Swords className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Across 3 different leagues
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              +18 active this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Actions
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>
              {isPremium ? "Premium Plan Status" : "Subscription Status"}
            </CardTitle>
            <CardDescription>
              Manage your subscription and server limits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex flex-col items-start gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <span className="flex items-center gap-2 font-semibold">
                    {isPremium ? "Silver Plan" : "Free Plan"}
                    <Badge
                      variant={isPremium ? "secondary" : "outline"}
                      className={
                        isPremium
                          ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-0"
                          : "text-muted-foreground"
                      }
                    >
                      {isPremium ? "Active" : "Current"}
                    </Badge>
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {isPremium
                      ? "$5.00 / month • Renews April 12, 2024"
                      : "$0.00 / month • Upgrade for more features"}
                  </p>
                </div>
                {isPremium ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => setIsPremium(false)}
                  >
                    Manage Subscription
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => setIsPremium(true)}
                  >
                    Upgrade to Premium
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Linked Servers
                    </span>
                    <span className="font-medium">
                      {isPremium ? "2 / 5" : "1 / 1"}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${
                        isPremium
                          ? "w-[40%] bg-primary"
                          : "w-full bg-orange-500"
                      }`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Log Channels</span>
                    <span className="font-medium">
                      {isPremium ? "Unlimited" : "3 / 5"}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${
                        isPremium ? "w-full bg-green-500" : "w-[60%] bg-primary"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="text-2xl font-bold">
                    {isPremium ? "Standard" : "Basic"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Auto-Refresh Rate
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="text-2xl font-bold">
                    {isPremium ? "Enabled" : "Disabled"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Maintenance Alerts
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Your Servers</CardTitle>
            <CardDescription>
              Manage ClashPerk in your Discord communities.
            </CardDescription>
            <CardAction>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Server
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>CK</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Crimson Kings
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-5 px-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 border-0 gap-1"
                      >
                        <Check className="h-3 w-3" /> Bot Added
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] h-5 px-1.5 gap-1"
                      >
                        <Shield className="h-3 w-3" /> Admin
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>GA</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Global Alliance
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-5 px-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 border-0 gap-1"
                      >
                        <Check className="h-3 w-3" /> Bot Added
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" disabled>
                  View
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>NC</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      New Clan Server
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] h-5 px-1.5 gap-1"
                      >
                        <Shield className="h-3 w-3" /> Admin
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-primary/10 text-primary hover:bg-primary/20 shadow-none border-0"
                >
                  Invite
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>TS</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Tournament Server
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-5 px-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 border-0 gap-1"
                      >
                        <Check className="h-3 w-3" /> Bot Added
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] h-5 px-1.5 gap-1"
                      >
                        <Shield className="h-3 w-3" /> Admin
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
