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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  ChevronDown,
  ChevronRight,
  GripVertical,
  Menu,
  Plus,
  Search,
  Shield,
  Users,
} from "lucide-react";
import * as React from "react";

import { api } from "@/hooks/api/axios";
import { CategoryDto, GuildClanDto } from "@/hooks/api/generated";

// --- COMPONENTS ---

// 1. Re-useable Draggable Item for CLANS
function SortableClanItem({
  clan,
  categories,
  onMove,
  categoryName,
}: {
  clan: GuildClanDto;
  categories: CategoryDto[];
  onMove: (categoryId: string) => void;
  categoryName: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: clan._id });

  const style = {
    // Restrict to Y axis to prevent horizontal scroll during drag
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
        "flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group pr-12 relative",
        isDragging && "opacity-50",
      )}
    >
      <div className="flex items-center gap-4">
        {/* Clan Name & Tag & Lvl */}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm">{clan.name}</h3>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-mono text-muted-foreground">
              {clan.tag}
            </span>
            <span className="text-[10px] bg-secondary px-1.5 py-0 rounded-sm text-secondary-foreground font-medium">
              Lvl {clan.level}
            </span>
          </div>
        </div>
      </div>

      {/* Stats & League & Category Dropdown */}
      <div className="flex items-center gap-2 md:gap-6">
        <span
          className={cn(
            "hidden md:inline-flex text-[10px] px-2 py-0.5 rounded font-medium whitespace-nowrap bg-secondary text-secondary-foreground",
          )}
        >
          {clan.league}
        </span>

        {/* Hidden on mobile */}
        <div className="hidden md:flex items-center gap-3 md:gap-4 text-xs text-muted-foreground">
          <span
            className="flex items-center gap-1.5 w-14 md:w-16"
            title="Members"
          >
            <Users className="size-3.5" /> {clan.members}/50
          </span>
        </div>

        {/* CATEGORY CHANGE DROPDOWN */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Badge
              variant="outline"
              className="w-28 justify-between h-6 px-2 text-[10px] cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors border-dashed"
            >
              <span className="truncate">{categoryName}</span>
              <ChevronDown className="size-2.5 opacity-50 shrink-0" />
            </Badge>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Move to Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {categories.map((category) => (
              <DropdownMenuItem
                key={category._id}
                onClick={() => onMove(category._id)}
                disabled={clan.categoryId === category._id}
                className={cn(
                  clan.categoryId === category._id &&
                    "bg-accent text-accent-foreground",
                )}
              >
                {category.displayName}
                {clan.categoryId === category._id && (
                  <span className="ml-2 text-[10px] text-muted-foreground">
                    (current)
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* DRAG HANDLE */}
      <div
        {...attributes}
        {...listeners}
        style={{ touchAction: "none" }}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground/30 hover:text-foreground cursor-grab active:cursor-grabbing rounded hover:bg-muted"
      >
        <GripVertical className="size-4" />
      </div>
    </div>
  );
}

// 2. Sortable Item for CATEGORIES
function SortableCategoryItem({
  category,
  isActive,
  onSelect,
  clanCount,
}: {
  category: CategoryDto;
  isActive: boolean;
  onSelect: () => void;
  clanCount: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category._id,
    disabled: category._id === "uncategorized",
  });

  const style = {
    // Restrict to Y axis from preventing horizontal scroll during drag
    transform: CSS.Translate.toString(
      transform ? { ...transform, x: 0 } : null,
    ),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: "relative" as const,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      <button
        onClick={onSelect}
        className={cn(
          "w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between overflow-hidden pr-8",
          isActive
            ? "bg-primary/10 border-primary/50 ring-1 ring-primary/20"
            : "bg-card border-border hover:border-primary/20",
          isDragging && "opacity-50",
          "cursor-pointer",
        )}
      >
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "font-semibold truncate text-sm",
              isActive ? "text-primary" : "text-foreground",
            )}
          >
            {category.displayName}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
            {clanCount} clans
          </div>
        </div>
        {isActive && (
          <ChevronRight className="size-4 text-primary opacity-50 shrink-0 absolute right-10" />
        )}
      </button>

      {/* DRAG HANDLE */}
      {category._id !== "uncategorized" && (
        <div
          {...attributes}
          {...listeners}
          style={{ touchAction: "none" }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground/30 hover:text-foreground cursor-grab active:cursor-grabbing rounded hover:bg-muted"
        >
          <GripVertical className="size-4" />
        </div>
      )}
    </div>
  );
}

function CategorySidebarContent({
  categories,
  activeCategoryId,
  onSelectCategory,
  onOpenCreate,
  onDragEnd,
}: {
  categories: CategoryDto[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  onOpenCreate: () => void;
  onDragEnd: (event: DragEndEvent) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-card border rounded-lg shadow-sm h-[72px] shrink-0">
        <div>
          <h2 className="text-lg font-bold leading-none">Clan Types</h2>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium">
            Filter your clan list
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

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-3">
        {/* Fixed "All Clans" Tab - Not Sortable */}
        <button
          onClick={() => onSelectCategory("all")}
          className={cn(
            "w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between group relative overflow-hidden",
            activeCategoryId === "all"
              ? "bg-primary/10 border-primary/50 ring-1 ring-primary/20"
              : "bg-card border-border hover:border-primary/20",
            "cursor-pointer",
          )}
        >
          <span className="font-semibold text-sm">All Clans</span>
          {activeCategoryId === "all" && (
            <ChevronRight className="size-4 text-primary opacity-50 shrink-0" />
          )}
        </button>

        {/* Sortable List */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={categories.map((c) => c._id)}
            strategy={verticalListSortingStrategy}
          >
            {categories.map((c) => (
              <SortableCategoryItem
                key={c._id}
                category={c}
                clanCount={c.clans.length}
                isActive={activeCategoryId === c._id}
                onSelect={() => onSelectCategory(c._id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </>
  );
}

export default function ClansPage() {
  const [categories, setCategories] = React.useState<CategoryDto[]>([]);
  const [activeCategoryId, setActiveCategoryId] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");

  // Dialog State
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");

  const loadClans = async () => {
    try {
      const { data } = await api.guilds.getGuildClans({
        guildId: "509784317598105619",
      });
      setCategories(data.categories);
    } catch (error) {
      console.error("Failed to load clans", error);
    }
  };

  const reorderClans = async (updatedCategories: CategoryDto[]) => {
    try {
      await api.guilds.reorderGuildClans(
        {
          guildId: "509784317598105619",
        },
        {
          categories: updatedCategories.map((c, cIdx) => ({
            _id: c._id,
            order: cIdx,
            clans: c.clans.map((clan, clanIdx) => ({
              _id: clan._id,
              order: clanIdx,
            })),
          })),
        },
      );
      loadClans();
    } catch (error) {
      console.error("Failed to reorder clans", error);
    }
  };

  React.useEffect(() => {
    loadClans();
  }, []);

  const filteredClans = React.useMemo(() => {
    let allClans: GuildClanDto[] = [];

    if (activeCategoryId === "all") {
      allClans = categories.flatMap((c) => c.clans);
    } else {
      const category = categories.find((c) => c._id === activeCategoryId);
      if (category) {
        allClans = category.clans;
      }
    }

    if (search) {
      const q = search.toLowerCase();
      return allClans.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.tag.toLowerCase().includes(q),
      );
    }

    return allClans;
  }, [categories, activeCategoryId, search]);

  const createCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCat: CategoryDto = {
      _id: `cat-${Date.now()}`,
      displayName: newCategoryName,
      order: categories.length,
      clans: [],
    };

    const newCategories = [...categories, newCat];
    setCategories(newCategories);
    // OPTIONAL: Call API to persist new category immediately or wait for reorder?
    // Usually creating a category should persist.
    // Assuming strictly frontend logic for now as per previous implementation pattern,
    // but typically you'd hit an API to create.
    setNewCategoryName("");
    setIsCreateOpen(false);
    setActiveCategoryId(newCat._id);
  };

  const handleMoveClan = (clanId: string, targetCategoryId: string) => {
    setCategories((prev) => {
      const newCategories = prev.map((c) => ({ ...c, clans: [...c.clans] }));

      // Find source
      let clanToMove: GuildClanDto | undefined;
      let sourceCategoryIndex = -1;

      for (let i = 0; i < newCategories.length; i++) {
        const idx = newCategories[i].clans.findIndex((c) => c._id === clanId);
        if (idx !== -1) {
          clanToMove = newCategories[i].clans[idx];
          sourceCategoryIndex = i;
          break;
        }
      }

      if (!clanToMove || sourceCategoryIndex === -1) return prev;

      // Remove from source
      newCategories[sourceCategoryIndex].clans.splice(
        newCategories[sourceCategoryIndex].clans.indexOf(clanToMove),
        1,
      );

      // Add to target
      const targetCategory = newCategories.find(
        (c) => c._id === targetCategoryId,
      );
      if (targetCategory) {
        targetCategory.clans.push({
          ...clanToMove,
          categoryId: targetCategoryId,
        });
      }

      reorderClans(newCategories); // Sync with API
      return newCategories;
    });
  };

  // --- DND HANDLERS ---
  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        reorderClans(newItems);
        return newItems;
      });
    }
  };

  const handleClanDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Only allow sorting if we are in a specific category view (not "all" and not searching)
    // Because "All" view implies cross-category representation which complicates "order".
    if (activeCategoryId === "all" || search) return;

    if (over && active.id !== over.id) {
      setCategories((prev) => {
        const categoryIndex = prev.findIndex((c) => c._id === activeCategoryId);
        if (categoryIndex === -1) return prev;

        const newCategories = [...prev];
        const category = { ...newCategories[categoryIndex] };
        category.clans = [...category.clans];

        const oldIndex = category.clans.findIndex((c) => c._id === active.id);
        const newIndex = category.clans.findIndex((c) => c._id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          category.clans = arrayMove(category.clans, oldIndex, newIndex);
          newCategories[categoryIndex] = category;
          reorderClans(newCategories);
          return newCategories;
        }
        return prev;
      });
    }
  };

  // Sensors for Main Area (Clan List)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <div className="h-[calc(100vh)] flex flex-col md:flex-row gap-6 p-4 md:px-6 md:pt-6 pb-10">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-72 shrink-0 flex-col gap-4">
        <CategorySidebarContent
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={setActiveCategoryId}
          onOpenCreate={() => setIsCreateOpen(true)}
          onDragEnd={handleCategoryDragEnd}
        />
      </aside>

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
            <CategorySidebarContent
              categories={categories}
              activeCategoryId={activeCategoryId}
              onSelectCategory={(id) => {
                setActiveCategoryId(id);
              }}
              onOpenCreate={() => setIsCreateOpen(true)}
              onDragEnd={handleCategoryDragEnd}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-h-0 bg-background/50 rounded-t-xl gap-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-2 bg-card border rounded-lg shadow-sm h-[72px] shrink-0">
          <div className="flex items-center gap-3 px-2 w-full">
            <div className="hidden md:block">
              <h1 className="text-lg font-bold leading-tight">
                {activeCategoryId === "all"
                  ? "All Clans"
                  : categories.find((c) => c._id === activeCategoryId)
                      ?.displayName}
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                {filteredClans.length} Clans found
              </p>
            </div>

            <div className="relative flex-1 md:max-w-xs md:ml-auto">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search clans..."
                className="pl-8 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Clan
            </Button>
          </div>
        </div>

        {/* CLAN LIST (Sortable) */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="flex flex-col gap-2 pb-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleClanDragEnd}
            >
              <SortableContext
                items={filteredClans.map((c) => c._id)}
                strategy={verticalListSortingStrategy}
                disabled={activeCategoryId === "all" || search.length > 0}
              >
                {filteredClans.map((clan) => (
                  <SortableClanItem
                    key={clan._id}
                    clan={clan}
                    categories={categories}
                    onMove={(catId) => handleMoveClan(clan._id, catId)}
                    categoryName={
                      categories.find((c) => c._id === clan.categoryId)
                        ?.displayName || "Unknown"
                    }
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
          {filteredClans.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground opacity-60 h-64">
              <Shield className="size-10 mb-2 opacity-20" />
              <p>No clans found in this category.</p>
            </div>
          )}
        </div>
      </main>

      {/* CREATE CATEGORY DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Clan Category</DialogTitle>
            <DialogDescription>
              Create a category to organize your clans
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Category Name</Label>
              <Input
                id="cat-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Feeder Clans"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={createCategory}>Create Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
