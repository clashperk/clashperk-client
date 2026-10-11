import { AttackHistoryDto, WarTypes } from "@/hooks/api/generated";
import { dataOrNull, serverApi } from "@/lib/server-api";
import { encodeTag } from "@/lib/tags";
import { cache } from "react";

export const HISTORY_MONTHS = 6;

export const WAR_TYPE_LABELS: Record<WarTypes, string> = {
  [WarTypes.REGULAR]: "War",
  [WarTypes.FRIENDLY]: "Friendly",
  [WarTypes.CWL]: "CWL",
};

export const ended = (war: AttackHistoryDto) =>
  new Date(war.endTime).getTime() < Date.now();

export const missedAttacks = (war: AttackHistoryDto) =>
  ended(war) ? Math.max(0, war.attacksPerMember - war.attacks.length) : 0;

// Shared by the page and its metadata so one request fetches once.
export const getPlayerWars = cache(async (tag: string) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - HISTORY_MONTHS);

  const query = {
    playerTag: encodeTag(tag),
    startDate: startDate.toISOString(),
  };
  const [history, cwl] = await Promise.all([
    dataOrNull(serverApi.players.getAttackHistory(query)),
    dataOrNull(serverApi.players.aggregateClanWarLeagueHistory(query)),
  ]);

  const wars = history?.items ?? [];
  const attacks = wars.flatMap((war) => war.attacks);
  const triples = attacks.filter((attack) => attack.stars === 3).length;
  return {
    wars,
    seasons: cwl?.items ?? [],
    stats: {
      wars: wars.length,
      attacks: attacks.length,
      threeStars: attacks.length
        ? `${Math.round((triples / attacks.length) * 100)}%`
        : "–",
      missed: wars.reduce((sum, war) => sum + missedAttacks(war), 0),
    },
  };
});
