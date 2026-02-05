"use client";

import { Modal } from "@/components/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckCircle,
  GripVertical,
  Plus,
  ShieldAlert,
  Swords,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";

// Mock data
type ProfilePlayer = {
  tag: string;
  name: string;
  townHall: number;
  verified: boolean;
  role: string;
  league: string;
  warStars: number;
};

const initialPlayers: ProfilePlayer[] = [
  {
    tag: "#PJV202R9L",
    name: "Suvajit",
    townHall: 16,
    verified: true,
    role: "Leader",
    league: "Legends League",
    warStars: 1450,
  },
  {
    tag: "#GLU882R0",
    name: "Mini Suva",
    townHall: 13,
    verified: false,
    role: "Member",
    league: "Crystal I",
    warStars: 320,
  },
  {
    tag: "#2Q98Y2YJ",
    name: "War Chief",
    townHall: 15,
    verified: true,
    role: "Co-Leader",
    league: "Titan II",
    warStars: 890,
  },
];

// Sortable Item Component
function SortablePlayerItem({
  player,
  onUnlink,
  onVerify,
}: {
  player: ProfilePlayer;
  onUnlink: (tag: string) => void;
  onVerify: (tag: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: player.tag });

  const style = {
    transform: CSS.Translate.toString(
      transform ? { ...transform, x: 0 } : null,
    ),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: "relative" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center p-3 pl-2 rounded-lg border bg-card hover:border-primary/20 transition-all gap-3 shadow-sm group",
        isDragging && "opacity-50",
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="hidden sm:flex h-10 w-6 items-center justify-center cursor-grab text-muted-foreground/20 hover:text-foreground hover:bg-muted rounded transition-colors self-center"
      >
        <GripVertical className="size-4" />
      </div>

      {/* Town Hall Icon */}
      <div
        className={cn(
          "flex items-center justify-center size-10 md:size-12 rounded-lg font-bold text-white text-sm md:text-base shrink-0 shadow-sm transition-all",
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

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold leading-none text-base">
            {player.name}
          </h4>
          <span className="text-[10px] uppercase font-bold text-muted-foreground border px-1.5 py-0.5 rounded bg-muted/50">
            {player.role}
          </span>
          {player.verified ? (
            <Badge
              variant="secondary"
              className="gap-1 text-[10px] h-5 px-1.5 text-green-600 bg-green-500/10 border-green-500/20"
            >
              <CheckCircle className="h-3 w-3" />
              Verified
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="gap-1 text-[10px] h-5 px-1.5 text-yellow-600 bg-yellow-500/10 border-yellow-500/20"
            >
              <ShieldAlert className="h-3 w-3" />
              Unverified
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-muted-foreground text-xs font-medium">
          <span className="font-mono">{player.tag}</span>
          <span>•</span>
          <span>{player.league}</span>
          <span className="flex items-center gap-1">
            <Swords className="size-3" /> {player.warStars}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-end">
        {!player.verified && (
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 sm:flex-none h-8 text-xs bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 hover:text-yellow-700"
            onClick={() => onVerify(player.tag)}
          >
            Verify
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => onUnlink(player.tag)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Unlink</span>
        </Button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [players, setPlayers] = useState<ProfilePlayer[]>(initialPlayers);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPlayers((items) => {
        const oldIndex = items.findIndex((item) => item.tag === active.id);
        const newIndex = items.findIndex((item) => item.tag === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleUnlink = (tag: string) => {
    setPlayers(players.filter((p) => p.tag !== tag));
  };

  const handleVerify = () => {
    if (selectedTag) {
      setPlayers(
        players.map((p) =>
          p.tag === selectedTag ? { ...p, verified: true } : p,
        ),
      );
      setIsVerifyOpen(false);
      setSelectedTag(null);
    }
  };

  const openVerifyModal = (tag: string) => {
    setSelectedTag(tag);
    setIsVerifyOpen(true);
  };

  return (
    <div className="flex flex-1 flex-col h-full w-full">
      <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-10 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
            <p className="text-muted-foreground">
              Manage your linked Clash of Clans accounts.
            </p>
          </div>

          <Modal
            open={isLinkOpen}
            onOpenChange={setIsLinkOpen}
            title="Link Knowledge Account"
            description="Enter your player tag and API token to verify ownership."
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Link Account
              </Button>
            }
            footer={
              <Button onClick={() => setIsLinkOpen(false)}>Link Account</Button>
            }
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tag" className="text-right">
                  Player Tag
                </Label>
                <Input
                  id="tag"
                  placeholder="#PJV202R9"
                  className="col-span-3 uppercase font-mono"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="token" className="text-right">
                  API Token
                </Label>
                <Input
                  id="token"
                  type="password"
                  placeholder="Find in Settings > API Token"
                  className="col-span-3"
                />
              </div>
            </div>
          </Modal>
        </div>

        {/* Verification Modal (Shared) */}
        <Modal
          open={isVerifyOpen}
          onOpenChange={setIsVerifyOpen}
          title="Verify Account"
          description="To verify this account, please enter the API token found in Supcell ID Settings."
          footer={<Button onClick={handleVerify}>Verify Now</Button>}
        >
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="verify-token">API Token</Label>
              <Input
                id="verify-token"
                type="password"
                placeholder="xxxxxxxx"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Only you can see this token.
              </p>
            </div>
          </div>
        </Modal>

        {/* Players List */}
        <div className="space-y-6">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl">
                Linked Players ({players.length})
              </CardTitle>
              <CardDescription>
                These accounts are linked to your profile. Drag to reorder.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 px-0">
              {players.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
                  <User className="h-12 w-12 mb-4 opacity-20" />
                  <p>No players linked yet.</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={players.map((p) => p.tag)}
                    strategy={verticalListSortingStrategy}
                  >
                    {players.map((player) => (
                      <SortablePlayerItem
                        key={player.tag}
                        player={player}
                        onUnlink={handleUnlink}
                        onVerify={openVerifyModal}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
