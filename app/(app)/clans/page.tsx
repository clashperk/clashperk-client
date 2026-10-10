"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { api } from "@/hooks/api/axios";
import { CategoryDto, GuildClanDto } from "@/hooks/api/generated";
import { useAuth } from "@/hooks/use-auth";
import { categoryTheme } from "@/lib/clan-categories";
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
  ArrowRight,
  Check,
  ChevronDown,
  GripVertical,
  Layers,
  Loader2,
  RotateCw,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

// The backend always returns this category first and can't reorder it.
const UNCATEGORIZED_ID = "uncategorized";
const ALL = "all";

type Status = "loading" | "ready" | "error";

function useSortableStyle(id: string, disabled: boolean) {
  const sortable = useSortable({ id, disabled });
  const { transform, transition, isDragging } = sortable;
  return {
    ...sortable,
    style: {
      transform: CSS.Translate.toString(
        transform ? { ...transform, x: 0 } : null,
      ),
      transition,
      zIndex: isDragging ? 10 : undefined,
      position: "relative" as const,
    },
  };
}

function DragHandle(props: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label="Drag to reorder"
      style={{ touchAction: "none" }}
      className="flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-accent hover:text-foreground active:cursor-grabbing"
      {...props}
    >
      <GripVertical className="size-4" />
    </button>
  );
}

function CategoryItem({
  category,
  active,
  onSelect,
  sortable,
}: {
  category: CategoryDto;
  active: boolean;
  onSelect: () => void;
  sortable: boolean;
}) {
  const { attributes, listeners, setNodeRef, style, isDragging } =
    useSortableStyle(category._id, !sortable);
  const theme = categoryTheme(category.displayName);

  return (
    <li ref={setNodeRef} style={style} className="group">
      <div
        className={cn(
          "flex items-center gap-1 rounded-xl pr-1 transition-colors",
          active ? "bg-foreground/[0.07]" : "hover:bg-accent/60",
          isDragging && "bg-card shadow-lg ring-1 ring-border",
        )}
      >
        <button
          type="button"
          onClick={onSelect}
          aria-current={active}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl p-2 text-left"
        >
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              theme.tile,
            )}
          >
            <theme.Icon className="size-4" />
          </div>
          <span
            className={cn(
              "flex-1 truncate text-sm",
              active ? "font-medium" : "text-foreground/80",
            )}
          >
            {category.displayName}
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {category.clans.length}
          </span>
        </button>
        {sortable ? (
          <div className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <DragHandle {...attributes} {...listeners} />
          </div>
        ) : (
          <span className="size-7 shrink-0" />
        )}
      </div>
    </li>
  );
}

function ClanRow({
  clan,
  categories,
  sortable,
  onMove,
}: {
  clan: GuildClanDto;
  categories: CategoryDto[];
  sortable: boolean;
  onMove: (categoryId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, style, isDragging } =
    useSortableStyle(clan._id, !sortable);
  const current = categories.find((c) => c._id === clan.categoryId);
  const theme = categoryTheme(current?.displayName ?? "");

  return (
    <li ref={setNodeRef} style={style}>
      <div
        className={cn(
          "group flex items-center gap-3 rounded-2xl border bg-card p-2.5 pr-3 shadow-[0_1px_2px_rgba(13,15,13,.04)] transition-shadow",
          isDragging && "shadow-xl ring-1 ring-border",
        )}
      >
        {sortable && <DragHandle {...attributes} {...listeners} />}
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            theme.tile,
            !sortable && "ml-0.5",
          )}
        >
          <theme.Icon className="size-[18px]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium tracking-tight">{clan.name}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {clan.tag}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-8 max-w-40 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <span
                className={cn("size-1.5 shrink-0 rounded-full", theme.dot)}
              />
              <span className="truncate">
                {current?.displayName ?? "Uncategorized"}
              </span>
              <ChevronDown className="size-3 shrink-0 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-xl">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              Move to category
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {categories.map((category) => {
              const isCurrent = category._id === clan.categoryId;
              const { Icon } = categoryTheme(category.displayName);
              return (
                <DropdownMenuItem
                  key={category._id}
                  disabled={isCurrent}
                  onClick={() => onMove(category._id)}
                >
                  <Icon />
                  <span className="flex-1 truncate">
                    {category.displayName}
                  </span>
                  {isCurrent && <Check className="size-3.5" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <Link
          href={`/links?tag=${encodeURIComponent(clan.tag)}`}
          title="Member links"
          aria-label={`Member links for ${clan.name}`}
          className="hidden size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:flex"
        >
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </li>
  );
}

export default function ClansPage() {
  const { user } = useAuth();
  const guildId = user.guild.id;

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string>(ALL);
  const [search, setSearch] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const load = useCallback(async () => {
    setStatus("loading");
    setLoadError(null);
    try {
      const { data } = await api.guilds.getGuildClans({ guildId });
      setCategories(data.categories);
      setStatus("ready");
    } catch (err) {
      setLoadError((err as Error).message);
      setStatus("error");
    }
  }, [guildId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (next: CategoryDto[]) => {
    const previous = categories;
    setCategories(next);
    setSaving(true);
    setSaveError(null);
    try {
      const { data } = await api.guilds.reorderGuildClans(
        { guildId },
        {
          categories: next.map((category, order) => ({
            _id: category._id,
            order,
            clans: category.clans.map((clan, clanOrder) => ({
              _id: clan._id,
              order: clanOrder,
            })),
          })),
        },
      );
      setCategories(data.categories);
    } catch (err) {
      setCategories(previous);
      setSaveError(`Couldn't save the new order: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const moveClan = (clan: GuildClanDto, targetId: string) => {
    save(
      categories.map((category) => {
        if (category._id === targetId) {
          return {
            ...category,
            clans: [...category.clans, { ...clan, categoryId: targetId }],
          };
        }
        return {
          ...category,
          clans: category.clans.filter((c) => c._id !== clan._id),
        };
      }),
    );
  };

  const onCategoryDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = categories.findIndex((c) => c._id === active.id);
    const to = categories.findIndex((c) => c._id === over.id);
    if (categories[to]?._id === UNCATEGORIZED_ID) return;
    save(arrayMove(categories, from, to));
  };

  const onClanDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    save(
      categories.map((category) => {
        if (category._id !== activeId) return category;
        const from = category.clans.findIndex((c) => c._id === active.id);
        const to = category.clans.findIndex((c) => c._id === over.id);
        return { ...category, clans: arrayMove(category.clans, from, to) };
      }),
    );
  };

  const total = categories.reduce((n, c) => n + c.clans.length, 0);
  const activeCategory = categories.find((c) => c._id === activeId);
  const query = search.trim().toLowerCase();

  const clans = useMemo(() => {
    const list = activeCategory
      ? activeCategory.clans
      : categories.flatMap((c) => c.clans);
    if (!query) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.tag.toLowerCase().includes(query),
    );
  }, [activeCategory, categories, query]);

  const canSortClans = !!activeCategory && !query && !saving;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-medium tracking-tight md:text-4xl">
            Clans
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            {status === "ready"
              ? `${total} clans in ${categories.length} categories. The bot lists them in this order.`
              : "Organize your server's clans into categories."}
          </p>
        </div>
        <div className="relative md:w-72">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name or tag"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {saveError && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
        >
          <span className="flex-1">{saveError}</span>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setSaveError(null)}
            className="cursor-pointer rounded-md p-1 hover:bg-destructive/10"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {status === "loading" ? (
        <div className="grid gap-6 md:grid-cols-[16rem_minmax(0,1fr)]">
          <div className="hidden space-y-2 md:block">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <div className="space-y-2.5">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="h-[3.75rem] animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        </div>
      ) : status === "error" ? (
        <Card className="items-center gap-3 py-10 text-center shadow-none">
          <p className="text-sm text-destructive">{loadError}</p>
          <Button variant="outline" size="sm" onClick={load}>
            <RotateCw />
            Try again
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[16rem_minmax(0,1fr)] md:items-start">
          <aside className="min-w-0 md:sticky md:top-6">
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden">
              {[
                { _id: ALL, displayName: "All clans", clans: [] },
                ...categories,
              ].map((category) => {
                const active = activeId === category._id;
                const count =
                  category._id === ALL ? total : category.clans.length;
                return (
                  <button
                    key={category._id}
                    type="button"
                    onClick={() => setActiveId(category._id)}
                    aria-pressed={active}
                    className={cn(
                      "flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-sm transition-colors",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "bg-card",
                    )}
                  >
                    {category.displayName}
                    <span
                      className={
                        active ? "text-background/60" : "text-muted-foreground"
                      }
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <nav className="hidden md:block" aria-label="Categories">
              <button
                type="button"
                onClick={() => setActiveId(ALL)}
                aria-current={activeId === ALL}
                className={cn(
                  "mb-1 flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 pr-9 text-left transition-colors",
                  activeId === ALL
                    ? "bg-foreground/[0.07]"
                    : "hover:bg-accent/60",
                )}
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
                  <Layers className="size-4" />
                </div>
                <span
                  className={cn(
                    "flex-1 text-sm",
                    activeId === ALL ? "font-medium" : "text-foreground/80",
                  )}
                >
                  All clans
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {total}
                </span>
              </button>

              <p className="px-2 pt-3 pb-1.5 text-xs text-muted-foreground">
                Categories
              </p>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onCategoryDragEnd}
              >
                <SortableContext
                  items={categories.map((c) => c._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="space-y-0.5">
                    {categories.map((category) => (
                      <CategoryItem
                        key={category._id}
                        category={category}
                        active={activeId === category._id}
                        onSelect={() => setActiveId(category._id)}
                        sortable={category._id !== UNCATEGORIZED_ID && !saving}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            </nav>
          </aside>

          <section className="min-w-0 space-y-3">
            <div className="flex h-5 items-center justify-between text-xs text-muted-foreground">
              <span>
                {query
                  ? `${clans.length} matching`
                  : activeCategory
                    ? "Drag clans to reorder them"
                    : "Pick a category to reorder its clans"}
              </span>
              {saving && (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="size-3 animate-spin" />
                  Saving
                </span>
              )}
            </div>

            {clans.length === 0 ? (
              <Card className="items-center gap-1 border-dashed py-12 text-center shadow-none">
                <p className="font-medium">
                  {query ? "No clans match your search" : "No clans here yet"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {query
                    ? "Try a different name or tag."
                    : "Move a clan into this category from its category menu."}
                </p>
              </Card>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onClanDragEnd}
              >
                <SortableContext
                  items={clans.map((c) => c._id)}
                  strategy={verticalListSortingStrategy}
                  disabled={!canSortClans}
                >
                  <ul className="space-y-2">
                    {clans.map((clan) => (
                      <ClanRow
                        key={clan._id}
                        clan={clan}
                        categories={categories}
                        sortable={canSortClans}
                        onMove={(targetId) => moveClan(clan, targetId)}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
