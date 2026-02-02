"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Bell,
  ChevronRight,
  Clock,
  Edit2,
  Menu,
  MoreVertical,
  Plus,
  Search,
  Shield,
  Swords,
  Trash2,
  Trophy,
} from "lucide-react";
import * as React from "react";

// --- TYPES & DUMMY DATA ---

type ReminderType = "war" | "raid" | "clanGames";

interface Reminder {
  id: string;
  type: ReminderType;
  duration: string; // e.g. "1h", "1d"
  message: string;
  channelId: string;
  channelName: string;
  clans: string[]; // List of clan tags/names
  excludeParticipantList?: boolean;
  isActive: boolean;
  lastRun?: Date;
}

const GENERATE_MOCK_REMINDERS = (count: number): Reminder[] => {
  const types: ReminderType[] = ["war", "raid", "clanGames"];
  return Array.from({ length: count }).map((_, i) => ({
    id: `rem-${i}`,
    type: types[Math.floor(Math.random() * types.length)],
    duration: `${Math.floor(Math.random() * 24) + 1}h`,
    message: `This is reminder message #${i} which is quite long and should not be fully displayed in the table view.`,
    channelId: "123456",
    channelName: i % 3 === 0 ? "war-log" : "general",
    clans:
      i % 2 === 0
        ? ["Air Hounds"]
        : ["Air Hounds", "Warriors", "Elite Force", "Builders"],
    isActive: Math.random() > 0.2,
    lastRun: new Date(Date.now() - Math.floor(Math.random() * 1000000000)),
  }));
};

const INITIAL_REMINDERS: Reminder[] = GENERATE_MOCK_REMINDERS(25);

// --- HELPER COMPONENTS ---

function ReminderSidebar({
  activeType,
  onSelectType,
  setIsOpen,
}: {
  activeType: ReminderType;
  onSelectType: (type: ReminderType) => void;
  setIsOpen?: (open: boolean) => void;
}) {
  const types: { id: ReminderType; label: string; icon: React.ReactNode }[] = [
    {
      id: "war",
      label: "Clan War",
      icon: <Swords className="size-4 text-red-500" />,
    },
    {
      id: "raid",
      label: "Capital Raid",
      icon: <Shield className="size-4 text-amber-500" />,
    },
    {
      id: "clanGames",
      label: "Clan Games",
      icon: <Trophy className="size-4 text-emerald-500" />,
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-card border rounded-lg shadow-sm h-[72px] shrink-0 mb-4">
        <div>
          <h2 className="text-lg font-bold leading-none">Categories</h2>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium">
            3 Active Types
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2">
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              onSelectType(t.id);
              setIsOpen?.(false);
            }}
            className={cn(
              "w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3 group relative overflow-hidden",
              activeType === t.id
                ? "bg-primary/10 border-primary/50 ring-1 ring-primary/20"
                : "bg-card border-border hover:border-primary/20",
            )}
          >
            <div
              className={cn(
                "p-2 rounded-full transition-colors",
                activeType === t.id ? "bg-background/80" : "bg-muted",
              )}
            >
              {t.icon}
            </div>
            <span
              className={cn(
                "font-medium transition-colors",
                activeType === t.id ? "text-primary" : "text-foreground",
              )}
            >
              {t.label}
            </span>
            {activeType === t.id && (
              <ChevronRight className="size-4 text-primary opacity-50 shrink-0 ml-auto" />
            )}
          </button>
        ))}
      </div>
    </>
  );
}

export default function RemindersPage() {
  const [reminders, setReminders] =
    React.useState<Reminder[]>(INITIAL_REMINDERS);
  const [search, setSearch] = React.useState("");
  const [activeType, setActiveType] = React.useState<ReminderType>("war");
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingReminder, setEditingReminder] = React.useState<Reminder | null>(
    null,
  );
  const [mode, setMode] = React.useState<"view" | "edit" | "create">("create");

  // Form State (Same as before)
  const [type, setType] = React.useState<ReminderType>("war");
  const [duration, setDuration] = React.useState("1h");
  const [message, setMessage] = React.useState("");
  const [clansStr, setClansStr] = React.useState("");
  const [channelName, setChannelName] = React.useState("general");
  const [excludeParticipantList, setExcludeParticipantList] =
    React.useState(false);

  const filteredReminders = React.useMemo(() => {
    let filtered = reminders.filter((r) => r.type === activeType);

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.message.toLowerCase().includes(q) ||
          r.channelName.toLowerCase().includes(q) ||
          r.clans.some((c) => c.toLowerCase().includes(q)),
      );
    }

    return filtered;
  }, [reminders, activeType, search]);

  const resetForm = (defaultType: ReminderType = activeType) => {
    setType(defaultType);
    setDuration("1h");
    setMessage("");
    setClansStr("");
    setChannelName("general");
    setExcludeParticipantList(false);
    setEditingReminder(null);
  };

  const populateForm = (reminder: Reminder) => {
    setType(reminder.type);
    setDuration(reminder.duration);
    setMessage(reminder.message);
    setClansStr(reminder.clans.join(", "));
    setChannelName(reminder.channelName);
    setExcludeParticipantList(reminder.excludeParticipantList || false);
    setEditingReminder(reminder);
  };

  const handleOpenCreate = () => {
    setMode("create");
    resetForm(activeType);
    setIsDialogOpen(true);
  };

  const handleRowClick = (reminder: Reminder) => {
    setMode("view");
    populateForm(reminder);
    setIsDialogOpen(true);
  };

  const handleEdit = (e: React.MouseEvent, reminder: Reminder) => {
    e.stopPropagation();
    setMode("edit");
    populateForm(reminder);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    setIsDialogOpen(false);
  };

  const handleSave = () => {
    if (!message || !channelName) return;

    const newReminder: Reminder = {
      id: editingReminder ? editingReminder.id : `rem-${Date.now()}`,
      type,
      duration,
      message,
      channelId: "mock-id",
      channelName,
      clans: clansStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      excludeParticipantList,
      isActive: editingReminder ? editingReminder.isActive : true,
      lastRun: editingReminder ? editingReminder.lastRun : undefined,
    };

    if (editingReminder) {
      setReminders((prev) =>
        prev.map((r) => (r.id === editingReminder.id ? newReminder : r)),
      );
    } else {
      setReminders((prev) => [newReminder, ...prev]);
    }

    setIsDialogOpen(false);
  };

  const getTypeIcon = (type: ReminderType) => {
    switch (type) {
      case "war":
        return <Swords className="size-4 text-red-500" />;
      case "raid":
        return <Shield className="size-4 text-amber-500" />;
      case "clanGames":
        return <Trophy className="size-4 text-emerald-500" />;
    }
  };

  const getActiveTypeLabel = () => {
    switch (activeType) {
      case "war":
        return "Clan War Reminders";
      case "raid":
        return "Capital Raid Reminders";
      case "clanGames":
        return "Clan Games Reminders";
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <div className="h-[calc(100vh)] flex flex-col md:flex-row p-2 md:px-8 md:py-6 gap-4 md:gap-6">
        {/* LEFT SIDEBAR: DESKTOP ONLY */}
        <aside className="hidden md:flex w-72 shrink-0 flex-col">
          <ReminderSidebar
            activeType={activeType}
            onSelectType={setActiveType}
          />
        </aside>

        {/* MOBILE SHEET CONTENT */}
        <SheetContent side="left" className="p-4 pt-12 w-80">
          <ReminderSidebar
            activeType={activeType}
            onSelectType={setActiveType}
            setIsOpen={setIsSheetOpen}
          />
        </SheetContent>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col min-h-0 bg-transparent">
          {/* HEADER TOOLBAR */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 shrink-0 mb-3 bg-card border rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between w-full md:w-auto gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden -ml-2 shrink-0"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  {getTypeIcon(activeType)}
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-bold leading-tight truncate">
                    {getActiveTypeLabel()}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {filteredReminders.length} configured
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-60 min-w-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 h-9 bg-muted/50 border-transparent focus:bg-background focus:border-input transition-colors w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="h-6 w-px bg-border mx-1 hidden md:block" />
              <Button
                onClick={handleOpenCreate}
                size="sm"
                className="gap-2 shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Reminder</span>
                <span className="inline sm:hidden">Add</span>
              </Button>
            </div>
          </div>

          {/* LIST */}
          <div className="flex-1 flex flex-col min-h-0 bg-transparent overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col gap-2 pb-20">
                {filteredReminders.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl m-1 bg-muted/10">
                    <div className="p-4 bg-muted/50 rounded-full mb-3">
                      <Bell className="size-8 opacity-20" />
                    </div>
                    <p className="font-medium">No reminders found</p>
                    <p className="text-sm opacity-70">
                      Create a new reminder to get started
                    </p>
                    <Button
                      variant="link"
                      onClick={handleOpenCreate}
                      className="mt-2"
                    >
                      Create One
                    </Button>
                  </div>
                ) : (
                  filteredReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="group flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all cursor-pointer shadow-sm relative overflow-hidden"
                      onClick={() => handleRowClick(reminder)}
                    >
                      {/* Left Border Accent */}
                      <div
                        className={cn(
                          "absolute left-0 top-0 bottom-0 w-1 transition-colors",
                          reminder.type === "war" && "bg-red-500",
                          reminder.type === "raid" && "bg-amber-500",
                          reminder.type === "clanGames" && "bg-emerald-500",
                        )}
                      />

                      {/* Icon Column */}
                      <div className="mt-0.5 pl-2 shrink-0">
                        <div
                          className={cn(
                            "p-2 rounded-full",
                            reminder.type === "war" &&
                              "bg-red-500/10 text-red-600",
                            reminder.type === "raid" &&
                              "bg-amber-500/10 text-amber-600",
                            reminder.type === "clanGames" &&
                              "bg-emerald-500/10 text-emerald-600",
                          )}
                        >
                          {getTypeIcon(reminder.type)}
                        </div>
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        {/* Header: Channel + Duration */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-semibold text-sm truncate">
                              #{reminder.channelName}
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className="font-mono text-[10px] h-5 px-1.5 shrink-0 flex items-center gap-1"
                          >
                            <Clock className="size-3" />
                            {reminder.duration}
                          </Badge>
                        </div>

                        {/* Message (Secondary, Muted) */}
                        <p className="text-xs text-muted-foreground line-clamp-2 md:line-clamp-1 pr-2">
                          {reminder.message}
                        </p>

                        {/* Footer: Clans */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {reminder.clans.length > 0 ? (
                            <>
                              {reminder.clans.slice(0, 3).map((clan, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="px-1.5 py-0 text-[10px] h-5 font-normal bg-background/50 border-input"
                                >
                                  {clan}
                                </Badge>
                              ))}
                              {reminder.clans.length > 3 && (
                                <Badge
                                  variant="outline"
                                  className="px-1.5 py-0 text-[10px] h-5 font-normal bg-background/50 border-input"
                                >
                                  +{reminder.clans.length - 3}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">
                              All Clans
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions Column */}
                      <div className="flex flex-col items-center justify-between gap-2 pl-2 border-l border-border/50 shrink-0 ml-1">
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center pt-1"
                        >
                          <Switch
                            checked={reminder.isActive}
                            onCheckedChange={(checked) => {
                              setReminders((prev) =>
                                prev.map((r) =>
                                  r.id === reminder.id
                                    ? { ...r, isActive: checked }
                                    : r,
                                ),
                              );
                            }}
                            className="scale-75 origin-right"
                          />
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) =>
                                handleEdit(
                                  e as unknown as React.MouseEvent,
                                  reminder,
                                )
                              }
                            >
                              <Edit2 className="size-3.5 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(reminder.id);
                              }}
                            >
                              <Trash2 className="size-3.5 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>

        {/* CREATE/EDIT DIALOG */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {mode === "create" && "New Reminder"}
                {mode === "edit" && "Edit Reminder"}
                {mode === "view" && "Reminder Details"}
              </DialogTitle>
              <DialogDescription>
                {mode === "view"
                  ? "View details for this automated reminder."
                  : `Configure ${activeType === "war" ? "Clan War" : activeType === "raid" ? "Capital Raid" : "Clan Games"} reminder.`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* View Mode: Static Stats */}
              {mode === "view" && editingReminder && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "size-2 rounded-full",
                          editingReminder.isActive
                            ? "bg-green-500"
                            : "bg-red-500",
                        )}
                      />
                      <span className="text-sm font-medium">
                        {editingReminder.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                    <p className="text-xs text-muted-foreground">Last Run</p>
                    <p className="text-sm font-medium">
                      {editingReminder.lastRun
                        ? editingReminder.lastRun.toLocaleDateString()
                        : "Never"}
                    </p>
                  </div>
                </div>
              )}

              {/* If VIEW mode, we disable inputs or show read-only text */}
              <fieldset
                disabled={mode === "view"}
                className={cn("space-y-4", mode === "view" && "opacity-100")}
              >
                {/* Type Selection Removed in Edit/Create mainly, or locked to activeType? 
                  Rosters page doesn't let you change type. 
                  Users might want to change type while creating? 
                  "New Reminder" is generic. But context is specific. 
                  Let's lock it to activeType for simplicity or allow changing via Select if desired. 
                  The prompt implies "section for reminders type" which acts as a filter/context. 
                  So new reminders should probably default to that type. 
                  I'll keep the Select but default it. Or hide it if it's redundant.
                  Let's keep it visible but maybe disabled if we want to enforce structure?
                  Actually, let's allow changing it, but it might jump to another list.
                  Better to just lock it or hide it for clarity if the user is deep in "Clan War" settings.
                  But let's keep the Select for flexibility, just pre-filled.
              */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={type}
                      onValueChange={(v) => setType(v as ReminderType)}
                      disabled={mode === "view"}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="war">Clan War</SelectItem>
                        <SelectItem value="raid">Capital Raid</SelectItem>
                        <SelectItem value="clanGames">Clan Games</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className={
                        mode === "view"
                          ? "border-transparent bg-transparent px-0 h-auto font-medium"
                          : ""
                      }
                    />
                    {mode !== "view" && (
                      <p className="text-[10px] text-muted-foreground">
                        Time remaining (e.g. 1h, 30m)
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Target Channel</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">
                      #
                    </span>
                    <Input
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      className={cn(
                        "pl-7",
                        mode === "view" &&
                          "border-transparent bg-transparent pl-0 h-auto font-medium",
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Clan Filters</Label>
                  <div className="flex flex-wrap gap-2">
                    {clansStr
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                      .map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    {mode !== "view" && (
                      <Input
                        value={clansStr}
                        onChange={(e) => setClansStr(e.target.value)}
                        placeholder="Air Hounds, Warriors"
                        className="mt-2"
                      />
                    )}
                  </div>
                  {mode !== "view" && (
                    <p className="text-[10px] text-muted-foreground">
                      Leave empty for all clans.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={cn(
                      mode === "view"
                        ? "border-transparent bg-transparent px-0 resize-none font-medium h-auto min-h-0"
                        : "h-24",
                    )}
                  />
                </div>

                {type === "war" && (
                  <div className="flex items-center justify-between py-2">
                    <Label className="text-sm">Exclude Participant List</Label>
                    {mode === "view" ? (
                      <span className="text-sm font-medium">
                        {excludeParticipantList ? "Yes" : "No"}
                      </span>
                    ) : (
                      <Switch
                        checked={excludeParticipantList}
                        onCheckedChange={setExcludeParticipantList}
                      />
                    )}
                  </div>
                )}
              </fieldset>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              {mode === "view" ? (
                <div className="flex w-full justify-between items-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      editingReminder && handleDelete(editingReminder.id)
                    }
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Close
                    </Button>
                    <Button onClick={() => setMode("edit")}>
                      <Edit2 className="size-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save Reminder</Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Sheet>
  );
}
