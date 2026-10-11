import { encodeTag, normalizeTag } from "@/lib/tags";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ComponentEmbedLink,
  previewMetadata,
} from "../../../components/link-preview";
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
import {
  HISTORY_MONTHS,
  WAR_TYPE_LABELS,
  ended,
  getPlayerWars,
  missedAttacks,
} from "./data";

type Props = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = normalizeTag((await params).tag);
  const title = `War Attack History ${tag ?? ""} | ClashPerk`;
  if (!tag) return { title };

  const { wars, stats } = await getPlayerWars(tag);
  if (!wars.length) return { title };

  const attacker = wars[0].attacker;
  return previewMetadata({
    title,
    previewTitle: `${attacker.name} (${attacker.tag}) · War attacks`,
    description: `${stats.wars} wars · ${stats.attacks} attacks · ${stats.threeStars} three stars · ${stats.missed} missed in the last ${HISTORY_MONTHS} months.`,
    image: { url: townHallImage(attacker.townHallLevel) },
  });
}

const formatSeason = (season: string) =>
  new Date(season).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export default async function PlayerWarsPage({ params }: Props) {
  const tag = normalizeTag((await params).tag);
  if (!tag) notFound();

  const { wars, seasons: items, stats } = await getPlayerWars(tag);
  if (!wars.length) {
    return (
      <WebEmpty
        title="No war attacks yet"
        message={`ClashPerk has no wars for ${tag} in the last ${HISTORY_MONTHS} months.`}
      />
    );
  }

  const attacker = wars[0].attacker;

  // Supercell can run more than one CWL in a month, so a season may repeat.
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
      <ComponentEmbedLink
        path={`/web/players/${encodeTag(tag)}/wars/embed.json`}
      />
      <StatGrid
        stats={[
          { label: "Wars", value: stats.wars },
          { label: "Attacks", value: stats.attacks },
          { label: "Three stars", value: stats.threeStars },
          { label: "Missed", value: stats.missed },
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
                  className="block text-sm font-medium hover:underline sm:truncate"
                >
                  <span className="block truncate sm:inline">
                    {war.clan.name}
                  </span>{" "}
                  <span className="block truncate sm:inline">
                    <span className="text-muted-foreground">vs</span>{" "}
                    {war.opponent.name}
                  </span>
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
