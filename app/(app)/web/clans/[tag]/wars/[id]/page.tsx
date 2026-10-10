import { WarClanDto } from "@/hooks/api/generated";
import { dataOrNull, serverApi } from "@/lib/server-api";
import { encodeTag, normalizeTag } from "@/lib/tags";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Chip,
  Stars,
  TownHall,
  WebCard,
  WebEmpty,
  WebShell,
  formatDate,
} from "../../../../components/web-page";

type Props = {
  params: Promise<{ tag: string; id: string }>;
  searchParams: Promise<{ side?: string }>;
};

const RESULTS: Record<string, string> = {
  win: "Won",
  lose: "Lost",
  tie: "Tie",
};

const getWar = async (params: Props["params"]) => {
  const { tag: rawTag, id } = await params;
  const tag = normalizeTag(rawTag);
  if (!tag || !/^\d+$/.test(id)) notFound();

  return dataOrNull(
    serverApi.wars.getClanWar({ clanTag: encodeTag(tag), warId: id }),
  );
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const war = await getWar(params);
  return {
    title: war
      ? `${war.clan.name} vs ${war.opponent.name} | ClashPerk`
      : "War Log | ClashPerk",
  };
}

function Team({ team, align }: { team: WarClanDto; align: "left" | "right" }) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center gap-2 text-center sm:flex-row sm:text-left",
        align === "right" && "sm:flex-row-reverse sm:text-right",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={team.badgeUrls.medium}
        alt=""
        className="size-12 shrink-0 sm:size-14"
      />
      <div className="min-w-0">
        <p className="truncate font-medium">{team.name}</p>
        <p className="font-mono text-xs text-muted-foreground">{team.tag}</p>
      </div>
    </div>
  );
}

export default async function ClanWarPage({ params, searchParams }: Props) {
  const war = await getWar(params);
  if (!war) {
    return (
      <WebEmpty
        title="War not found"
        message="This war is not in ClashPerk's war log."
      />
    );
  }

  const { side } = await searchParams;
  const showOpponent = side === "opponent";
  const team = showOpponent ? war.opponent : war.clan;
  const enemies = new Map(
    (showOpponent ? war.clan : war.opponent).members.map((member) => [
      member.tag,
      member,
    ]),
  );
  const members = [...team.members].sort(
    (a, b) => a.mapPosition - b.mapPosition,
  );
  const attacksPerMember = war.attacksPerMember ?? 1;
  const result = RESULTS[war.result];
  const ended = war.state === "warEnded";

  const tabs = [
    { label: war.clan.name, href: "?", active: !showOpponent },
    { label: war.opponent.name, href: "?side=opponent", active: showOpponent },
  ];

  return (
    <WebShell>
      <WebCard>
        <div className="flex items-center gap-3 p-4 sm:gap-6 sm:p-6">
          <Team team={war.clan} align="left" />
          <div className="flex shrink-0 flex-col items-center gap-1">
            <p className="text-2xl font-medium tabular-nums sm:text-3xl">
              {war.clan.stars} <span className="text-muted-foreground">–</span>{" "}
              {war.opponent.stars}
            </p>
            <p className="text-xs tabular-nums text-muted-foreground">
              {war.clan.destructionPercentage.toFixed(1)}% –{" "}
              {war.opponent.destructionPercentage.toFixed(1)}%
            </p>
            {ended && result && (
              <span
                className={cn(
                  "mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  war.result === "win"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "bg-foreground/[0.07]",
                )}
              >
                {result}
              </span>
            )}
          </div>
          <Team team={war.opponent} align="right" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t px-4 py-2.5 text-xs text-muted-foreground">
          {war.warTag && (
            <Chip>CWL{war.round ? ` · Round ${war.round}` : ""}</Chip>
          )}
          <span>
            {war.teamSize} vs {war.teamSize}
          </span>
          <span>
            Attacks {war.clan.attacks}/{war.teamSize * attacksPerMember} –{" "}
            {war.opponent.attacks}/{war.teamSize * attacksPerMember}
          </span>
          <span>
            {ended
              ? `Ended ${formatDate(war.endTime)}`
              : `Ends ${formatDate(war.endTime)}`}
          </span>
        </div>
      </WebCard>

      <div className="space-y-3">
        <nav aria-label="Team" className="flex gap-5 overflow-x-auto border-b">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              replace
              scroll={false}
              aria-current={tab.active ? "page" : undefined}
              className={cn(
                "-mb-px max-w-[50%] shrink-0 truncate border-b-2 pb-2.5 text-sm transition-colors",
                tab.active
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <WebCard>
          <div className="hidden border-b px-4 py-2 text-xs text-muted-foreground sm:flex">
            <span className="w-8">#</span>
            <span className="flex-1">Player</span>
            <span>Attacks</span>
          </div>
          <ul className="divide-y">
            {members.map((member) => {
              const attacks = member.attacks ?? [];
              const missed = ended ? attacksPerMember - attacks.length : 0;
              return (
                <li
                  key={member.tag}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="w-5 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                      {member.mapPosition}
                    </span>
                    <TownHall level={member.townhallLevel} className="size-8" />
                    <div className="min-w-0">
                      <Link
                        href={`/web/players/${encodeTag(member.tag)}/wars`}
                        className="block truncate text-sm font-medium hover:underline"
                      >
                        {member.name}
                      </Link>
                      <p className="font-mono text-xs text-muted-foreground">
                        {member.tag}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 pl-8 text-sm sm:items-end sm:pl-0">
                    {attacks.map((attack) => {
                      const defender = enemies.get(attack.defenderTag);
                      return (
                        <div
                          key={attack.order}
                          className="flex items-center gap-2"
                        >
                          <Stars stars={attack.stars} />
                          <span className="w-10 text-right tabular-nums">
                            {attack.destructionPercentage.toFixed(0)}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            on
                          </span>
                          <span className="w-6 text-right text-xs tabular-nums text-muted-foreground">
                            #{defender?.mapPosition ?? "?"}
                          </span>
                          {defender && (
                            <TownHall
                              level={defender.townhallLevel}
                              className="size-5"
                            />
                          )}
                        </div>
                      );
                    })}
                    {missed > 0 && (
                      <span className="text-xs text-destructive">
                        {missed === 1
                          ? "1 attack missed"
                          : `${missed} attacks missed`}
                      </span>
                    )}
                    {!ended && attacks.length === 0 && (
                      <span className="text-xs text-muted-foreground">
                        No attacks yet
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </WebCard>
      </div>
    </WebShell>
  );
}
