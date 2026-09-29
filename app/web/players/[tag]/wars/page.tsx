import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WarTypes } from "@/hooks/api/generated";
import { dataOrNull, serverApi } from "@/lib/server-api";
import { encodeTag, normalizeTag } from "@/lib/tags";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Stars, WebEmpty, WebPage, formatDate, townHallImage } from "../../../components/web-page";

type Props = { params: Promise<{ tag: string }> };

const HISTORY_MONTHS = 6;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = normalizeTag((await params).tag);
  return { title: `War Attack History ${tag ?? ""} | ClashPerk` };
}

export default async function PlayerWarsPage({ params }: Props) {
  const tag = normalizeTag((await params).tag);
  if (!tag) notFound();

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - HISTORY_MONTHS);

  const query = { playerTag: encodeTag(tag), startDate: startDate.toISOString() };
  const [history, cwl] = await Promise.all([
    dataOrNull(serverApi.players.getAttackHistory(query)),
    dataOrNull(serverApi.players.aggregateClanWarLeagueHistory(query)),
  ]);

  const wars = history?.items ?? [];
  if (!wars.length) return <WebEmpty message="No war attacks found for this player." />;

  const attacker = wars[0].attacker;
  const seasons = cwl?.items ?? [];

  return (
    <WebPage
      title={`${attacker.name} (${attacker.tag})`}
      subtitle={`War attacks from the last ${HISTORY_MONTHS} months`}
      aside={
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={townHallImage(attacker.townHallLevel)}
          alt={`Town Hall ${attacker.townHallLevel}`}
          className="size-10 shrink-0"
        />
      }
    >
      <Table>
        <TableBody>
          {wars.map((war) => (
            <TableRow key={war.id}>
              <TableCell className="max-w-0 w-full">
                <Link
                  href={`/web/clans/${encodeTag(war.clan.tag)}/wars/${war.id}`}
                  className="block truncate font-medium hover:underline"
                >
                  {war.clan.name} vs {war.opponent.name}
                </Link>
                <div className="text-xs text-muted-foreground">
                  {war.warType === WarTypes.CWL && (
                    <span className="mr-1 font-semibold text-sky-400">CWL</span>
                  )}
                  {war.warType === WarTypes.FRIENDLY && (
                    <span className="mr-1 font-semibold text-yellow-400">Friendly</span>
                  )}
                  {formatDate(war.startTime)}
                </div>
              </TableCell>
              <TableCell className="text-right align-top text-xs">
                {war.attacks.length ? (
                  war.attacks.map((attack, i) => (
                    <div key={i} className="flex items-center justify-end gap-2 leading-5">
                      <span className="text-sky-400">{war.attacker.mapPosition}</span>
                      <span className="text-orange-400">{war.attacker.townHallLevel}</span>
                      <Stars stars={attack.stars} newStars={attack.trueStars} />
                      <span className="w-9">{attack.destruction.toFixed(0)}%</span>
                      <span className="text-muted-foreground">vs</span>
                      <span className="text-sky-400">{attack.defender.mapPosition}</span>
                      <span className="text-orange-400">{attack.defender.townHallLevel}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-red-400">Missed</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {seasons.length > 0 && (
        <div className="border-t">
          <h2 className="py-3 text-center text-sm font-bold text-sky-400">CWL Summary</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Season</TableHead>
                <TableHead className="text-right">Stars</TableHead>
                <TableHead className="text-right">Destruction</TableHead>
                <TableHead className="text-right">Missed</TableHead>
                <TableHead className="text-right">Wars</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seasons.map((season) => (
                <TableRow key={season.season}>
                  <TableCell>
                    {new Date(season.season).toLocaleDateString("en-GB", {
                      month: "long",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </TableCell>
                  <TableCell className="text-right">{season.totalStars}</TableCell>
                  <TableCell className="text-right">
                    {season.totalDestruction.toFixed(0)}%
                  </TableCell>
                  <TableCell
                    className={season.totalMissed > 0 ? "text-right text-red-400" : "text-right"}
                  >
                    {season.totalMissed}
                  </TableCell>
                  <TableCell className="text-right text-sky-400">{season.totalWars}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </WebPage>
  );
}
