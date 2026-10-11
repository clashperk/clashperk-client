import { encodeTag } from "@/lib/tags";
import {
  actionRow,
  escapeMarkdown,
  fitEmbed,
  linkButton,
  section,
  separator,
  siteOrigin,
  starsText,
  text,
} from "../../../../../components/link-preview";
import { formatDate } from "../../../../../components/web-page";
import { getWar, warSummary } from "../data";

const TOP_ATTACKS = 5;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tag: string; id: string }> },
) {
  const { tag, id } = await params;
  const war = await getWar(tag, id);
  if (!war) return new Response(null, { status: 404 });

  const pageUrl = `${await siteOrigin()}/web/clans/${encodeTag(war.clan.tag)}/wars/${id}`;
  const summary = warSummary(war);
  const enemies = new Map(war.opponent.members.map((m) => [m.tag, m]));
  const best = war.clan.members
    .flatMap((member) =>
      (member.attacks ?? []).map((attack) => ({ member, attack })),
    )
    .sort(
      (a, b) =>
        b.attack.stars - a.attack.stars ||
        b.attack.destructionPercentage - a.attack.destructionPercentage,
    )
    .map(({ member, attack }) => {
      const defender = enemies.get(attack.defenderTag);
      return `${starsText(attack.stars)} ${attack.destructionPercentage.toFixed(0)}% **${escapeMarkdown(member.name)}** on #${defender?.mapPosition ?? "?"}`;
    });

  return Response.json(
    fitEmbed(
      (rows) => [
        section(
          `## [${escapeMarkdown(war.clan.name)} vs ${escapeMarkdown(war.opponent.name)}](${pageUrl})\n### ${summary.score}\n${summary.details}\n-# ${summary.meta} ${formatDate(war.endTime)}`,
          war.clan.badgeUrls.medium,
        ),
        ...(rows && best.length
          ? [
              separator,
              text(
                `-# Best attacks by ${escapeMarkdown(war.clan.name)}\n${best.slice(0, rows).join("\n")}`,
              ),
            ]
          : []),
        actionRow(linkButton("View war", pageUrl)),
      ],
      TOP_ATTACKS,
    ),
  );
}
