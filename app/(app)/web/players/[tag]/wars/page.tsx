import { AttackHistoryDto, WarTypes } from "@/hooks/api/generated";
import { dataOrNull, serverApi } from "@/lib/server-api";
import { encodeTag, normalizeTag } from "@/lib/tags";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Chip,
  StatGrid,
  Stars,
  TownHall,
  WebCard,
  WebEmpty,
  WebPage,
  formatDate,
  townHallImage,
} from "../../../components/web-page";

type Props = { params: Promise<{ tag: string }> };

const HISTORY_MONTHS = 6;

const WAR_TYPE_LABELS: Record<WarTypes, string> = {
  [WarTypes.REGULAR]: "War",
  [WarTypes.FRIENDLY]: "Friendly",
  [WarTypes.CWL]: "CWL",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = normalizeTag((await params).tag);
  return { title: `War Attack History ${tag ?? ""} | ClashPerk` };
}

const ended = (war: AttackHistoryDto) =>
  new Date(war.endTime).getTime() < Date.now();

const missedAttacks = (war: AttackHistoryDto) =>
  ended(war) ? Math.max(0, war.attacksPerMember - war.attacks.length) : 0;

const formatSeason = (season: string) =>
  new Date(season).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export default async function PlayerWarsPage({ params }: Props) {
  const tag = normalizeTag((await params).tag);
  if (!tag) notFound();

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
  if (!wars.length) {
    return (
      <WebEmpty
        title="No war attacks yet"
        message={`ClashPerk has no wars for ${tag} in the last ${HISTORY_MONTHS} months.`}
      />
    );
  }

  const attacker = wars[0].attacker;
  const attacks = wars.flatMap((war) => war.attacks);
  const triples = attacks.filter((attack) => attack.stars === 3).length;
  const missed = wars.reduce((sum, war) => sum + missedAttacks(war), 0);

  // Supercell can run more than one CWL in a month, so a season may repeat.
  const items = cwl?.items ?? [];
  const seasons = items.map((season, i) => {
    const total = items.filter((s) => s.season === season.season).length;
    const index = items
      .slice(0, i + 1)
      .filter((s) => s.season === season.season).length;
    return {
      ...season,
      key: `${season.season}-${i}`,
      label: formatSeason(season.season),
      part: total > 1 ? `${index} of ${total}` : null,
      avgDestruction: season.totalAttacks
        ? `${Math.round(season.totalDestruction / season.totalAttacks)}%`
        : "–",
    };
  });

  return (
    <WebPage
      title={attacker.name}
      subtitle={`${attacker.tag} · War attacks from the last ${HISTORY_MONTHS} months`}
      image={{
        src: townHallImage(attacker.townHallLevel),
        alt: `Town Hall ${attacker.townHallLevel}`,
      }}
    >
      <StatGrid
        stats={[
          { label: "Wars", value: wars.length },
          { label: "Attacks", value: attacks.length },
          {
            label: "Three stars",
            value: attacks.length
              ? `${Math.round((triples / attacks.length) * 100)}%`
              : "–",
          },
          { label: "Missed", value: missed },
        ]}
      />

      <WebCard title="Wars">
        <ul className="divide-y">
          {wars.map((war) => (
            <li
              key={war.id}
              className="flex items-center gap-3 px-4 py-3 sm:gap-4"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/web/clans/${encodeTag(war.clan.tag)}/wars/${war.id}`}
                  className="block truncate text-sm font-medium hover:underline"
                >
                  {war.clan.name}{" "}
                  <span className="text-muted-foreground">vs</span>{" "}
                  {war.opponent.name}
                </Link>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Chip>{WAR_TYPE_LABELS[war.warType]}</Chip>
                  {formatDate(war.startTime)}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1 text-sm">
                {war.attacks.map((attack, i) => (
                  <div key={i} className="flex items-center gap-1.5 sm:gap-2">
                    <Stars stars={attack.stars} newStars={attack.trueStars} />
                    <span className="w-10 text-right tabular-nums">
                      {attack.destruction.toFixed(0)}%
                    </span>
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                      on
                    </span>
                    <span className="w-6 text-right text-xs tabular-nums text-muted-foreground">
                      #{attack.defender.mapPosition}
                    </span>
                    <TownHall
                      level={attack.defender.townHallLevel}
                      className="size-5"
                    />
                  </div>
                ))}
                {missedAttacks(war) > 0 && (
                  <span className="text-xs text-destructive">
                    {missedAttacks(war) === 1
                      ? "1 attack missed"
                      : `${missedAttacks(war)} attacks missed`}
                  </span>
                )}
                {!ended(war) && war.attacks.length === 0 && (
                  <span className="text-xs text-muted-foreground">
                    No attacks yet
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </WebCard>

      {seasons.length > 0 && (
        <WebCard title="CWL seasons">
          <table className="hidden w-full text-sm sm:table">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b">
                <th className="px-4 py-2 text-left font-normal">Season</th>
                <th className="px-4 py-2 text-right font-normal">Wars</th>
                <th className="px-4 py-2 text-right font-normal">Stars</th>
                <th className="px-4 py-2 text-right font-normal">
                  Avg. destruction
                </th>
                <th className="px-4 py-2 text-right font-normal">Missed</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {seasons.map((season) => (
                <tr key={season.key}>
                  <td className="px-4 py-2.5">
                    {season.label}
                    {season.part && <Chip className="ml-2">{season.part}</Chip>}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {season.totalWars}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {season.totalStars}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {season.avgDestruction}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right tabular-nums ${season.totalMissed > 0 ? "text-destructive" : ""}`}
                  >
                    {season.totalMissed}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="divide-y sm:hidden">
            {seasons.map((season) => (
              <li key={season.key} className="space-y-1 px-4 py-3 text-sm">
                <p className="font-medium">
                  {season.label}
                  {season.part && (
                    <Chip className="ml-2 font-normal">{season.part}</Chip>
                  )}
                </p>
                <p className="text-muted-foreground">
                  {season.totalWars} wars · {season.totalStars} stars ·{" "}
                  {season.avgDestruction} avg.
                  {season.totalMissed > 0 && (
                    <span className="text-destructive">
                      {" "}
                      · {season.totalMissed} missed
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </WebCard>
      )}
    </WebPage>
  );
}
