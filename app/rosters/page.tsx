"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRightCircle,
  CheckSquare,
  ChevronRight,
  Lock,
  Menu,
  MoreVertical,
  Plus,
  Search,
  Shield,
  Swords,
  Trash2,
  Users,
  X,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { PLAYERS, type Player } from "./components/dummy";

interface Roster {
  id: string;
  name: string;
  playerIds: string[];
  isLocked: boolean;
  settings: {
    minTH: number;
    maxTH: number;
    maxMembers: number;
  };
}

// --- MOCK DATA ---

// --- HELPER COMPONENTS (DND wrappers) ---

function RosterSidebarContent({
  rosters,
  activeRosterId,
  onSelectRoster,
  onOpenCreate,
}: {
  rosters: Roster[];
  activeRosterId: string;
  onSelectRoster: (id: string) => void;
  onOpenCreate: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between p-4 bg-card border rounded-lg shadow-sm h-[72px] shrink-0">
        <div>
          <h2 className="text-lg font-bold leading-none">Your Rosters</h2>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium">
            {rosters.length} Total &middot;{" "}
            {rosters.filter((r) => r.isLocked).length} Locked
          </p>
        </div>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
          onClick={onOpenCreate}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-3">
        {rosters.map((r) => (
          <RosterTab
            key={r.id}
            isActive={activeRosterId === r.id}
            onSelect={() => onSelectRoster(r.id)}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "font-semibold truncate",
                    activeRosterId === r.id
                      ? "text-primary"
                      : "text-foreground",
                  )}
                >
                  {r.name}
                </div>
                {r.isLocked && (
                  <Lock className="size-3 text-muted-foreground" />
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1 py-0 h-4"
                >
                  {r.playerIds.length}/{r.settings.maxMembers}
                </Badge>
                <span>
                  TH {r.settings.minTH}-{r.settings.maxTH}
                </span>
              </div>
            </div>
            {activeRosterId === r.id && (
              <ChevronRight className="size-4 text-primary opacity-50 shrink-0" />
            )}
          </RosterTab>
        ))}
      </div>
    </>
  );
}

function RosterTab({
  isActive,
  onSelect,
  children,
}: {
  isActive: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between group relative overflow-hidden",
        isActive
          ? "bg-primary/10 border-primary/50 ring-1 ring-primary/20"
          : "bg-card border-border hover:border-primary/20",
      )}
    >
      {children}
    </button>
  );
}

// --- MAIN PAGE ---

export default function RosterPage() {
  const [rosters, setRosters] = React.useState<Roster[]>([
    {
      id: "default-1",
      name: "CWL - Champions",
      playerIds: ["1", "2", "3", "4", "5"],
      isLocked: false,
      settings: { minTH: 1, maxTH: 16, maxMembers: 15 },
    },
    {
      id: "default-2",
      name: "Regular War 50v50",
      playerIds: [],
      isLocked: false,
      settings: { minTH: 1, maxTH: 16, maxMembers: 50 },
    },
  ]);
  const [activeRosterId, setActiveRosterId] =
    React.useState<string>("default-1");
  const [search, setSearch] = React.useState("");
  const [activeMobileTab, setActiveMobileTab] = React.useState<
    "pool" | "lineup"
  >("pool");

  // Bulk Selection State
  const [selectedPlayerIds, setSelectedPlayerIds] = React.useState<string[]>(
    [],
  );
  const [isMultiSelectMode, setIsMultiSelectMode] = React.useState(false);

  // Dialog State
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newRosterName, setNewRosterName] = React.useState("");
  const [newRosterSettings, setNewRosterSettings] = React.useState({
    minTH: 10,
    maxTH: 16,
    maxMembers: 30,
  });

  const activeRoster = React.useMemo(
    () => rosters.find((r) => r.id === activeRosterId),
    [rosters, activeRosterId],
  );

  // Lists
  const availablePlayers = React.useMemo(() => {
    if (!activeRoster) return [];
    return (
      PLAYERS
        // Filter by Roster Settings
        .filter(
          (p) =>
            p.townHall >= activeRoster.settings.minTH &&
            p.townHall <= activeRoster.settings.maxTH,
        )
        // Filter out already in active roster
        .filter((p) => !activeRoster.playerIds.includes(p.id))
        // Filter by Search
        .filter(
          (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.tag.toLowerCase().includes(search.toLowerCase()),
        )
        .sort((a: Player, b: Player) => b.townHall - a.townHall)
    );
  }, [activeRoster, search]);

  const rosterPlayers = React.useMemo(() => {
    if (!activeRoster) return [];
    return activeRoster.playerIds
      .map((id) => PLAYERS.find((p) => p.id === id))
      .filter((p): p is Player => !!p)
      .sort((a: Player, b: Player) => b.townHall - a.townHall);
  }, [activeRoster]);

  // --- ACTIONS ---

  const createRoster = () => {
    if (!newRosterName.trim()) return;
    const newRoster: Roster = {
      id: Date.now().toString(),
      name: newRosterName,
      playerIds: [],
      isLocked: false,
      settings: newRosterSettings,
    };
    setRosters([...rosters, newRoster]);
    setActiveRosterId(newRoster.id);
    setNewRosterName("");
    setIsCreateOpen(false);
  };

  const deleteRoster = (id: string) => {
    const newRosters = rosters.filter((r) => r.id !== id);
    setRosters(newRosters);
    if (activeRosterId === id && newRosters.length > 0) {
      setActiveRosterId(newRosters[0].id);
    }
  };

  const toggleLock = (id: string) => {
    setRosters((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isLocked: !r.isLocked } : r)),
    );
  };

  const addPlayerToRoster = (playerId: string, rosterId: string) => {
    const targetRoster = rosters.find((r) => r.id === rosterId);
    if (!targetRoster || targetRoster.isLocked) return;
    if (targetRoster.playerIds.includes(playerId)) return;
    if (targetRoster.playerIds.length >= targetRoster.settings.maxMembers) {
      return;
    }

    setRosters((prev) =>
      prev.map((r) => {
        if (r.id === rosterId) {
          return { ...r, playerIds: [...r.playerIds, playerId] };
        }
        return r;
      }),
    );
  };

  const removePlayerFromRoster = (playerId: string, rosterId: string) => {
    const targetRoster = rosters.find((r) => r.id === rosterId);
    if (!targetRoster || targetRoster.isLocked) return;

    setRosters((prev) =>
      prev.map((r) => {
        if (r.id === rosterId) {
          return {
            ...r,
            playerIds: r.playerIds.filter((id) => id !== playerId),
          };
        }
        return r;
      }),
    );
    // Remove from selection if it was selected
    setSelectedPlayerIds((prev) => prev.filter((id) => id !== playerId));
  };

  const toggleSelection = (playerId: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId],
    );
  };

  const moveSelectedToRoster = (targetRosterId: string) => {
    // ... same code ...
    if (selectedPlayerIds.length === 0) return;

    const targetRoster = rosters.find((r) => r.id === targetRosterId);
    if (
      !targetRoster ||
      targetRoster.isLocked ||
      targetRoster.id === activeRoster?.id
    )
      return;

    // Filter eligible players (not already in target)
    const eligibleIds = selectedPlayerIds.filter(
      (id) => !targetRoster.playerIds.includes(id),
    );

    // Check limits (simplified)
    if (
      targetRoster.playerIds.length + eligibleIds.length >
      targetRoster.settings.maxMembers
    ) {
      return;
    }

    setRosters((prev) =>
      prev.map((r) => {
        if (r.id === targetRosterId) {
          return { ...r, playerIds: [...r.playerIds, ...eligibleIds] };
        }
        // Also remove from the active roster if it's the source
        if (r.id === activeRosterId) {
          return {
            ...r,
            playerIds: r.playerIds.filter(
              (id) => !selectedPlayerIds.includes(id),
            ),
          };
        }
        return r;
      }),
    );

    setSelectedPlayerIds([]);
    setIsMultiSelectMode(false);
  };

  const removeSelectedFromRoster = () => {
    if (
      selectedPlayerIds.length === 0 ||
      !activeRoster ||
      activeRoster.isLocked
    )
      return;

    setRosters((prev) =>
      prev.map((r) => {
        if (r.id === activeRosterId) {
          return {
            ...r,
            playerIds: r.playerIds.filter(
              (id) => !selectedPlayerIds.includes(id),
            ),
          };
        }
        return r;
      }),
    );
    setSelectedPlayerIds([]);
    setIsMultiSelectMode(false);
  };

  return (
    <div className="h-[calc(100vh)] flex flex-col md:flex-row gap-6 p-4 md:px-6 md:pt-6 pb-10">
      {/* LEFT SIDEBAR: ROSTER LIST */}
      {/* LEFT SIDEBAR: DESKTOP ONLY */}
      <aside className="hidden md:flex w-72 shrink-0 flex-col gap-4">
        <RosterSidebarContent
          rosters={rosters}
          activeRosterId={activeRosterId}
          onSelectRoster={setActiveRosterId}
          onOpenCreate={() => setIsCreateOpen(true)}
        />
      </aside>

      {/* CREATE DIALOG (Global) */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Roster</DialogTitle>
            <DialogDescription>
              Configure constraints for your Clan War roster.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Roster Name</Label>
              <Input
                id="name"
                value={newRosterName}
                onChange={(e) => setNewRosterName(e.target.value)}
                placeholder="e.g. CWL February Elite"
              />
            </div>
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <Label>Town Hall Range</Label>
                <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                  {newRosterSettings.minTH} - {newRosterSettings.maxTH}
                </span>
              </div>
              <div className="px-2">
                <Slider
                  min={1}
                  max={16}
                  step={1}
                  value={[newRosterSettings.minTH, newRosterSettings.maxTH]}
                  onValueChange={([min, max]) =>
                    setNewRosterSettings((prev) => ({
                      ...prev,
                      minTH: min,
                      maxTH: max,
                    }))
                  }
                  className="py-4"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Max Members</Label>
                <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                  {newRosterSettings.maxMembers}
                </span>
              </div>
              <Input
                type="number"
                min={5}
                max={50}
                value={newRosterSettings.maxMembers}
                onChange={(e) =>
                  setNewRosterSettings((prev) => ({
                    ...prev,
                    maxMembers: parseInt(e.target.value) || 30,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={createRoster}>Create Roster</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MOBILE SHEET */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden absolute top-4 right-4 z-50"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="p-0 w-80">
          <div className="h-full p-4 pt-12 flex flex-col gap-4">
            <RosterSidebarContent
              rosters={rosters}
              activeRosterId={activeRosterId}
              onSelectRoster={setActiveRosterId}
              onOpenCreate={() => setIsCreateOpen(true)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* RIGHT CONTENT: EDITOR */}
      <main className="flex-1 flex flex-col min-h-0 bg-background/50 rounded-t-xl">
        {activeRoster ? (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 p-2 bg-card border rounded-lg shadow-sm h-[72px] shrink-0">
              <div className="flex items-center gap-3 px-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {activeRoster.isLocked ? (
                    <Lock className="size-5" />
                  ) : (
                    <Shield className="size-5" />
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-bold leading-tight flex items-center gap-2">
                    {activeRoster.name}
                  </h1>
                  <p className="text-xs text-muted-foreground font-medium">
                    Avg TH:{" "}
                    {(
                      rosterPlayers.reduce((acc, p) => acc + p.townHall, 0) /
                      (rosterPlayers.length || 1)
                    ).toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLock(activeRoster.id)}
                  className={cn(
                    activeRoster.isLocked
                      ? "text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
                      : "text-muted-foreground",
                  )}
                >
                  {activeRoster.isLocked ? "Unlock" : "Lock"}
                </Button>
                <div className="h-6 w-px bg-border" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => deleteRoster(activeRoster.id)}
                      className="text-destructive"
                    >
                      Delete Roster
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* MOBILE TABS */}
            <div className="flex items-center p-1 bg-muted/50 rounded-lg mb-4 lg:hidden shrink-0">
              <Button
                variant={activeMobileTab === "pool" ? "secondary" : "ghost"}
                size="sm"
                className="flex-1 text-xs h-7 shadow-none"
                onClick={() => setActiveMobileTab("pool")}
              >
                Pool ({availablePlayers.length})
              </Button>
              <Button
                variant={activeMobileTab === "lineup" ? "secondary" : "ghost"}
                size="sm"
                className="flex-1 text-xs h-7 shadow-none"
                onClick={() => setActiveMobileTab("lineup")}
              >
                Lineup ({rosterPlayers.length})
              </Button>
            </div>

            {/* Dual Pane Editor */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 flex-1 min-h-0">
              {/* COLUMN 1: AVAILABLE POOL */}
              <div
                className={cn(
                  "flex-col gap-3 min-h-0 transition-all rounded-t-xl rounded-b-none p-2",
                  activeMobileTab === "pool" ? "flex flex-1" : "hidden lg:flex",
                )}
              >
                <div className="flex items-center justify-between px-1">
                  <div className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                    <Users className="size-4" />
                    Pool
                    <Badge variant="outline" className="text-[10px]">
                      {availablePlayers.length}
                    </Badge>
                  </div>
                  <div className="relative w-40">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                    <Input
                      placeholder="Filter..."
                      className="pl-7 h-7 text-xs bg-background/50"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <Card className="flex-1 overflow-hidden flex flex-col bg-muted/30 border-dashed border-2 shadow-none">
                  <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {availablePlayers.map((player) => (
                      <PlayerListItem
                        key={player.id}
                        player={player}
                        actionIcon={<Plus className="size-4" />}
                        onAction={() =>
                          addPlayerToRoster(player.id, activeRoster.id)
                        }
                        actionVariant="default"
                        // No select mode for pool for now
                      />
                    ))}
                    {availablePlayers.length === 0 && (
                      <EmptyState
                        icon={Users}
                        title="No Players Available"
                        description={
                          search
                            ? "Adjust your search filters."
                            : "All eligible players are in the roster."
                        }
                      />
                    )}
                  </div>
                </Card>
              </div>

              {/* COLUMN 2: SELECTED ROSTER */}
              <div
                className={cn(
                  "flex-col gap-3 min-h-0 transition-all rounded-t-xl rounded-b-none p-2",
                  activeMobileTab === "lineup"
                    ? "flex flex-1"
                    : "hidden lg:flex",
                )}
              >
                {/* LINEUP HEADER with SELECTION CONTROLS */}
                <div className="flex items-center justify-between px-1 min-h-[32px]">
                  <div className="text-sm font-semibold flex items-center gap-2 text-primary">
                    <Swords className="size-4" />
                    Lineup
                    <Badge className="text-[10px] h-5 bg-primary/20 text-primary hover:bg-primary/30 border-0">
                      {rosterPlayers.length} /{" "}
                      {activeRoster.settings.maxMembers}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Locked Badge */}
                    {activeRoster.isLocked && (
                      <Badge
                        variant="destructive"
                        className="text-[10px] h-5 mr-1"
                      >
                        <Lock className="size-3 mr-1" /> Locked
                      </Badge>
                    )}

                    {/* SELECTION ACTIONS */}
                    {isMultiSelectMode ? (
                      <div className="flex items-center gap-1 bg-background/50 p-0.5 rounded-lg border shadow-sm">
                        <span className="text-[10px] font-medium px-2 text-muted-foreground">
                          {selectedPlayerIds.length}
                        </span>

                        {/* Move Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 hover:bg-primary/10 hover:text-primary"
                              disabled={selectedPlayerIds.length === 0}
                            >
                              <ArrowRightCircle className="size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>
                              Move Selected To...
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {rosters
                              .filter((r) => r.id !== activeRoster?.id)
                              .map((r) => (
                                <DropdownMenuItem
                                  key={r.id}
                                  onClick={() => moveSelectedToRoster(r.id)}
                                  disabled={r.isLocked}
                                >
                                  <span className="truncate flex-1">
                                    {r.name}
                                  </span>
                                  {r.isLocked && (
                                    <Lock className="size-3 ml-2 text-muted-foreground" />
                                  )}
                                </DropdownMenuItem>
                              ))}
                            {rosters.filter((r) => r.id !== activeRoster?.id)
                              .length === 0 && (
                              <div className="p-2 text-xs text-muted-foreground text-center">
                                No other rosters.
                              </div>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                          onClick={removeSelectedFromRoster}
                          disabled={
                            selectedPlayerIds.length === 0 ||
                            activeRoster.isLocked
                          }
                        >
                          <Trash2 className="size-3.5" />
                        </Button>

                        <div className="w-px h-3 bg-border mx-0.5" />

                        {/* Close Selection */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            setIsMultiSelectMode(false);
                            setSelectedPlayerIds([]);
                          }}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setIsMultiSelectMode(true)}
                        // Hidden if roster is empty?
                        disabled={rosterPlayers.length === 0}
                      >
                        <CheckSquare className="size-3.5 mr-1.5" />
                        Select
                      </Button>
                    )}
                  </div>
                </div>

                <Card
                  className={cn(
                    "flex-1 overflow-hidden flex flex-col shadow-sm transition-all",
                    activeRoster.isLocked
                      ? "bg-background/80 opacity-90 border-orange-500/20"
                      : "bg-card border-primary/20",
                  )}
                >
                  <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    <AnimatePresence initial={false} mode="popLayout">
                      {rosterPlayers.map((player, idx) => (
                        <motion.div
                          key={player.id}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <PlayerListItem
                            player={player}
                            pdIndex={idx + 1}
                            actionIcon={<Trash2 className="size-4" />}
                            onAction={() =>
                              removePlayerFromRoster(player.id, activeRoster.id)
                            }
                            actionVariant="destructive"
                            highlight
                            selectionMode={isMultiSelectMode}
                            isSelected={selectedPlayerIds.includes(player.id)}
                            onToggleSelection={() => toggleSelection(player.id)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {rosterPlayers.length === 0 && (
                      <EmptyState
                        icon={Swords}
                        title="Roster Empty"
                        description={
                          activeRoster.isLocked
                            ? "Unlock to add."
                            : "Add players from the pool."
                        }
                      />
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Shield className="size-16 mb-4 opacity-10" />
            <h3 className="text-lg font-medium">Select a Roster</h3>
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center opacity-60">
      <Icon className="size-10 mb-3 opacity-20" />
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs mt-1">{description}</p>
    </div>
  );
}

function PlayerListItem({
  player,
  actionIcon,
  onAction,
  actionVariant = "ghost",
  highlight = false,
  pdIndex,
  selectionMode = false,
  isSelected = false,
  onToggleSelection,
}: {
  player: Player;
  actionIcon: React.ReactNode;
  onAction: () => void;
  actionVariant?: "ghost" | "default" | "destructive";
  highlight?: boolean;
  pdIndex?: number;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}) {
  return (
    <div
      onClick={
        selectionMode && onToggleSelection ? onToggleSelection : undefined
      }
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg border text-sm transition-all select-none touch-manipulation",
        highlight
          ? "bg-card border-primary/10"
          : "bg-card border-border hover:border-sidebar-accent hover:bg-sidebar-accent",
        isSelected &&
          highlight &&
          "bg-primary/5 border-primary/30 ring-1 ring-primary/20",
        selectionMode && "cursor-pointer",
      )}
    >
      {selectionMode && highlight && (
        <div
          className={cn(
            "size-4 rounded border flex items-center justify-center transition-colors",
            isSelected
              ? "bg-primary border-primary text-primary-foreground"
              : "border-muted-foreground",
          )}
        >
          {isSelected && <div className="size-2 bg-current rounded-sm" />}
        </div>
      )}

      {!selectionMode && pdIndex && (
        <span className="font-mono text-muted-foreground w-5 text-right font-medium text-xs">
          {pdIndex}
        </span>
      )}

      {/* TH Icon */}
      <div
        className={cn(
          "flex items-center justify-center size-8 rounded font-bold text-white text-xs shrink-0 shadow-sm",
          player.townHall >= 16
            ? "bg-amber-600 border-amber-500"
            : player.townHall === 15
              ? "bg-purple-600 border-purple-500"
              : player.townHall === 14
                ? "bg-yellow-700 border-yellow-600"
                : "bg-slate-500",
        )}
      >
        {player.townHall}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold truncate">{player.name}</span>
          <span className="text-[10px] uppercase font-bold text-muted-foreground border px-1 rounded">
            {player.role}
          </span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground text-xs mt-0.5">
          <span>{player.league}</span>
          <span className="flex items-center gap-1">
            <Swords className="size-3" /> {player.warStars}
          </span>
        </div>
      </div>

      {!selectionMode && (
        <Button
          size="icon"
          variant={actionVariant === "destructive" ? "ghost" : "secondary"}
          className={cn(
            "size-8 shrink-0",
            actionVariant === "destructive" &&
              "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
          )}
          onClick={(e) => {
            e.stopPropagation(); // Prevent drag start if clicking button
            onAction();
          }}
        >
          {actionIcon}
        </Button>
      )}
    </div>
  );
}
