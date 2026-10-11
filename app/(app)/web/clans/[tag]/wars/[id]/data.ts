import { ClanWarDto } from "@/hooks/api/generated";
import { dataOrNull, serverApi } from "@/lib/server-api";
import { encodeTag, normalizeTag } from "@/lib/tags";
import { notFound } from "next/navigation";
import { cache } from "react";

export const RESULTS: Record<string, string> = {
  win: "Won",
  lose: "Lost",
  tie: "Tie",
};

// Shared by the page, its metadata and the Discord embed so one request fetches once.
export const getWar = cache(async (rawTag: string, id: string) => {
  const tag = normalizeTag(rawTag);
  if (!tag || !/^\d+$/.test(id)) notFound();

  return dataOrNull(
    serverApi.wars.getClanWar({ clanTag: encodeTag(tag), warId: id }),
  );
});

export function warSummary(war: ClanWarDto) {
  const ended = war.state === "warEnded";
  const result = ended ? RESULTS[war.result] : undefined;
  const type = war.warTag
    ? `CWL${war.round ? ` round ${war.round}` : ""}`
    : "War";
  return {
    score: `${war.clan.stars} – ${war.opponent.stars}${result ? ` · ${result}` : ""}`,
    details: `${war.clan.destructionPercentage.toFixed(1)}% – ${war.opponent.destructionPercentage.toFixed(1)}%`,
    meta: `${type} · ${war.teamSize} vs ${war.teamSize} · ${ended ? "Ended" : "Ends"}`,
  };
}
