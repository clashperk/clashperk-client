"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield, Star, Swords, Trophy, Zap } from "lucide-react";
import { useState } from "react";
import battlelogData from "./battlelog.json";

type Resource = { name: string; amount: number };

type BattleItem = {
  battleType: string;
  attack: boolean;
  armyShareCode: string;
  opponentPlayerTag: string;
  stars: number;
  destructionPercentage: number;
  lootedResources: Resource[];
  extraLootedResources: Resource[];
  availableLoot: Resource[];
};

const calculateTrophies = (
  stars: number,
  destruction: number,
  { isAttack, isLegendLeague }: { isAttack: boolean; isLegendLeague: boolean }
): number => {
  let attackerGain = 0;
  if (stars === 3) {
    attackerGain = 40;
  } else if (stars === 2) {
    attackerGain = 16 + Math.floor((destruction - 50) / 3);
  } else if (stars === 1) {
    attackerGain = 5 + Math.floor(destruction / 9);
  } else {
    if (destruction >= 10) attackerGain = Math.floor(destruction / 10);
  }
  if (attackerGain > 40) attackerGain = 40;
  if (isAttack) return attackerGain;
  if (isLegendLeague) return stars === 0 ? 0 : -attackerGain;
  if (stars === 0) return 40;
  return 40 - attackerGain;
};


function StarDisplay({ count, max = 3 }: { count: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < count
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}


function BattleCard({
  item,
  index,
  isLegendLeague,
}: {
  item: BattleItem;
  index: number;
  isLegendLeague: boolean;
}) {
  const isAttack = item.attack;
  const isRanked = item.battleType === "ranked";
  const isThreeStars = item.stars === 3;
  const trophies = calculateTrophies(item.stars, item.destructionPercentage, {
    isAttack,
    isLegendLeague,
  });

  return (
    <Card
      className={`relative overflow-hidden transition-colors h-[76px] ${
        isThreeStars
          ? "border-yellow-500/30 bg-yellow-500/5"
          : "hover:bg-muted/30"
      }`}
    >
      {/* Left accent bar */}
      <div
        className={`absolute left-0 top-0 h-full w-1 ${
          item.stars === 3
            ? "bg-yellow-400"
            : item.stars === 2
              ? "bg-blue-400"
              : item.stars === 1
                ? "bg-muted-foreground/40"
                : "bg-destructive/50"
        }`}
      />

      <CardContent className="pl-4 pr-3 py-0 h-full flex items-center">
        <div className="flex items-center justify-between w-full gap-2 min-w-0">
          {/* Left: index + icon + stars + badges */}
          <div className="flex items-center gap-2 min-w-0 shrink-0">
            <span className="text-muted-foreground text-xs font-mono w-5 shrink-0">
              #{index + 1}
            </span>

            {/* Attack / Defense icon */}
            <div
              className={`flex items-center justify-center rounded-md p-1.5 shrink-0 ${
                isAttack
                  ? "bg-red-500/10 text-red-400"
                  : "bg-blue-500/10 text-blue-400"
              }`}
            >
              {isAttack ? (
                <Swords className="h-3.5 w-3.5" />
              ) : (
                <Shield className="h-3.5 w-3.5" />
              )}
            </div>

            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <StarDisplay count={item.stars} />
                <span className="text-xs font-medium whitespace-nowrap">
                  {item.destructionPercentage}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Badge
                  variant="secondary"
                  className={`text-[10px] h-4 px-1.5 ${
                    isRanked
                      ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                      : "bg-green-500/10 text-green-400 border-green-500/20"
                  }`}
                >
                  {isRanked ? "Ranked" : "Village"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Right: opponent + loot + trophies */}
          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                {item.opponentPlayerTag}
              </span>
              <span
                className={`flex items-center gap-0.5 text-xs font-semibold whitespace-nowrap ${
                  trophies > 0 ? "text-yellow-400" : trophies < 0 ? "text-red-400" : "text-muted-foreground"
                }`}
              >
                <Trophy className="h-3 w-3" />
                {trophies > 0 ? `+${trophies}` : trophies}
              </span>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BattlelogPage() {
  const [isLegendLeague, setIsLegendLeague] = useState(false);

  const items = (battlelogData.items as BattleItem[])
    .filter((i) => i.battleType !== "homeVillage")
    .reverse();

  // Summary stats
  const attacks = items.filter((i) => i.attack);
  const defenses = items.filter((i) => !i.attack);
  const threeStarAttacks = attacks.filter((i) => i.stars === 3);
  const totalStars = items.reduce((s, i) => s + i.stars, 0);
  const avgDestruction =
    items.length > 0
      ? Math.round(
          items.reduce((s, i) => s + i.destructionPercentage, 0) / items.length,
        )
      : 0;

  // Split into days of 16 (8 attacks + 8 defenses)
  const days: BattleItem[][] = [];
  for (let i = 0; i < items.length; i += 16) {
    days.push(items.slice(i, i + 16));
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Battle Log
          </h2>
          <p className="text-sm text-muted-foreground">
            Recent battles — {items.length} entries
          </p>
        </div>
        <div className="flex items-center gap-2 pt-1 shrink-0">
          <Switch
            id="legend-league"
            checked={isLegendLeague}
            onCheckedChange={setIsLegendLeague}
          />
          <Label htmlFor="legend-league" className="text-sm whitespace-nowrap cursor-pointer">
            Legend League
          </Label>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Battles</CardTitle>
            <Swords className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {attacks.length} attacks · {defenses.length} defenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">3-Star Rate</CardTitle>
            <Star className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attacks.length > 0
                ? Math.round((threeStarAttacks.length / attacks.length) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {threeStarAttacks.length} / {attacks.length} attacks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Destruction
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDestruction}%</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalStars} total stars earned
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Battle list — split by day */}
      <div className="flex flex-col gap-8">
        {days.map((day, dayIndex) => {
          const dayAttacks = day.filter((i) => i.attack);
          const dayDefenses = day.filter((i) => !i.attack);
          const dayStars = day.reduce((s, i) => s + i.stars, 0);
          const trophyGained = day.reduce((s, i) => {
            const t = calculateTrophies(i.stars, i.destructionPercentage, { isAttack: i.attack, isLegendLeague });
            return s + (t > 0 ? t : 0);
          }, 0);
          const trophyLost = day.reduce((s, i) => {
            const t = calculateTrophies(i.stars, i.destructionPercentage, { isAttack: i.attack, isLegendLeague });
            return s + (t < 0 ? t : 0);
          }, 0);
          const trophyNet = trophyGained + trophyLost;
          return (
            <div key={dayIndex} className="flex flex-col gap-2">
              {/* Day header */}
              <div className="flex items-center justify-between py-1 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    Day {dayIndex + 1}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {day.length} battles · {dayAttacks.length} attacks · {dayDefenses.length} defenses
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-green-400">
                    <Trophy className="h-3 w-3" />+{trophyGained}
                  </span>
                  <span className="flex items-center gap-1 text-red-400">
                    <Trophy className="h-3 w-3" />{trophyLost}
                  </span>
                  <span className={`flex items-center gap-1 font-semibold ${trophyNet >= 0 ? "text-yellow-400" : "text-red-400"}`}>
                    <Trophy className="h-3 w-3" />
                    {trophyNet >= 0 ? `+${trophyNet}` : trophyNet}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {dayStars}
                  </span>
                </div>
              </div>
              {/* Attacks & Defenses side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Attacks */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-red-400 flex items-center gap-1">
                    <Swords className="h-3.5 w-3.5" /> Attacks
                  </span>
                  {dayAttacks.length > 0 ? (
                    dayAttacks.map((item, i) => (
                      <BattleCard key={i} item={item} index={i} isLegendLeague={isLegendLeague} />
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground py-2">No attacks</p>
                  )}
                </div>
                {/* Defenses */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-blue-400 flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" /> Defenses
                  </span>
                  {dayDefenses.length > 0 ? (
                    dayDefenses.map((item, i) => (
                      <BattleCard key={i} item={item} index={i} isLegendLeague={isLegendLeague} />
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground py-2">No defenses</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
