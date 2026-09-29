import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { dataOrNull, serverApi } from "@/lib/server-api";
import { encodeTag, normalizeTag } from "@/lib/tags";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Stars, WebEmpty, WebPage, formatDate } from "../../../../components/web-page";

type Props = { params: Promise<{ tag: string; id: string }> };

const getWar = async (params: Props["params"]) => {
  const { tag: rawTag, id } = await params;
  const tag = normalizeTag(rawTag);
  if (!tag || !/^\d+$/.test(id)) notFound();

  return dataOrNull(serverApi.wars.getClanWar({ clanTag: encodeTag(tag), warId: id }));
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const war = await getWar(params);
  return {
    title: war ? `${war.clan.name} vs ${war.opponent.name} | ClashPerk` : "War Log | ClashPerk",
  };
}

export default async function ClanWarPage({ params }: Props) {
  const war = await getWar(params);
  if (!war) return <WebEmpty message="This war could not be found." />;

  const defenders = new Map(war.opponent.members.map((member) => [member.tag, member]));
  const members = [...war.clan.members].sort((a, b) => a.mapPosition - b.mapPosition);

  return (
    <WebPage
      title={`${war.clan.name} vs ${war.opponent.name}`}
      subtitle={`${war.clan.stars} stars, ${war.clan.destructionPercentage.toFixed(2)}% destruction (${war.result}) · ${formatDate(war.endTime)}`}
      aside={
        // eslint-disable-next-line @next/next/no-img-element
        <img src={war.clan.badgeUrls.small} alt={war.clan.name} className="size-10 shrink-0" />
      }
    >
      <Table>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.tag}>
              <TableCell className="w-8 text-right align-top text-sky-400">
                {member.mapPosition}
              </TableCell>
              <TableCell className="w-8 text-right align-top text-orange-400">
                {member.townhallLevel}
              </TableCell>
              <TableCell className="max-w-0 w-full">
                <Link
                  href={`/web/players/${encodeTag(member.tag)}/wars`}
                  className="block truncate font-medium hover:underline"
                >
                  {member.name}
                </Link>
                <div className="text-xs text-muted-foreground">{member.tag}</div>
              </TableCell>
              <TableCell className="text-right align-top text-xs">
                {member.attacks?.length ? (
                  member.attacks.map((attack) => {
                    const defender = defenders.get(attack.defenderTag);
                    return (
                      <div
                        key={attack.order}
                        className="flex items-center justify-end gap-2 leading-5"
                      >
                        <Stars stars={attack.stars} />
                        <span className="w-9">{attack.destructionPercentage.toFixed(0)}%</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="text-sky-400">{defender?.mapPosition ?? "-"}</span>
                        <span className="text-orange-400">{defender?.townhallLevel ?? "-"}</span>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-red-400">
                    {war.state === "warEnded" ? "Missed" : "No attacks"}
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </WebPage>
  );
}
