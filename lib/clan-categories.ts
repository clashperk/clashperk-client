import {
  CalendarDays,
  Gamepad2,
  GraduationCap,
  LucideIcon,
  Shield,
  Swords,
  Trophy,
  Wheat,
} from "lucide-react";

export type CategoryTheme = { Icon: LucideIcon; tile: string; dot: string };

// Category names are free text set by each server, so match on keywords.
const CATEGORY_THEMES: [RegExp, CategoryTheme][] = [
  [
    /cwl|league/i,
    {
      Icon: Trophy,
      tile: "bg-violet-500/12 text-violet-600 dark:text-violet-300",
      dot: "bg-violet-500",
    },
  ],
  [
    /war/i,
    {
      Icon: Swords,
      tile: "bg-rose-500/12 text-rose-600 dark:text-rose-300",
      dot: "bg-rose-500",
    },
  ],
  [
    /esport|competitive|tournament/i,
    {
      Icon: Gamepad2,
      tile: "bg-sky-500/12 text-sky-600 dark:text-sky-300",
      dot: "bg-sky-500",
    },
  ],
  [
    /event/i,
    {
      Icon: CalendarDays,
      tile: "bg-fuchsia-500/12 text-fuchsia-600 dark:text-fuchsia-300",
      dot: "bg-fuchsia-500",
    },
  ],
  [
    /farm/i,
    {
      Icon: Wheat,
      tile: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
      dot: "bg-emerald-500",
    },
  ],
  [
    /feeder|academy|training/i,
    {
      Icon: GraduationCap,
      tile: "bg-teal-500/12 text-teal-600 dark:text-teal-300",
      dot: "bg-teal-500",
    },
  ],
];

const DEFAULT_THEME: CategoryTheme = {
  Icon: Shield,
  tile: "bg-foreground/[0.06] text-foreground/70",
  dot: "bg-muted-foreground",
};

export const categoryTheme = (name: string) =>
  CATEGORY_THEMES.find(([pattern]) => pattern.test(name))?.[1] ?? DEFAULT_THEME;
