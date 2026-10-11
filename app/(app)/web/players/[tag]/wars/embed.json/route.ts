import { encodeTag, normalizeTag } from "@/lib/tags";
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
} from "../../../../components/link-preview";
import { formatDate, townHallImage } from "../../../../components/web-page";
import { HISTORY_MONTHS, WAR_TYPE_LABELS, getPlayerWars } from "../data";

const RECENT_WARS = 5;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tag: string }> },
) {
  const tag = normalizeTag((await params).tag);
  if (!tag) return new Response(null, { status: 404 });

  const { wars, stats } = await getPlayerWars(tag);
  if (!wars.length) return new Response(null, { status: 404 });

  const attacker = wars[0].attacker;
  const pageUrl = `${await siteOrigin()}/web/players/${encodeTag(tag)}/wars`;
  const recent = wars.slice(0, RECENT_WARS).map((war) => {
    const attacks = war.attacks.length
      ? war.attacks
          .map((a) => `${starsText(a.stars)} ${a.destruction.toFixed(0)}%`)
          .join(", ")
      : "No attacks";
    return `-# ${WAR_TYPE_LABELS[war.warType]} · ${formatDate(war.startTime)}\n${attacks} vs **${escapeMarkdown(war.opponent.name)}**`;
  });

  return Response.json(
    fitEmbed(
      (rows) => [
        section(
          `## [${escapeMarkdown(attacker.name)}](${pageUrl})\n${attacker.tag} · War attacks, last ${HISTORY_MONTHS} months\n**${stats.wars}** wars · **${stats.attacks}** attacks · **${stats.threeStars}** three stars · **${stats.missed}** missed`,
          townHallImage(attacker.townHallLevel),
        ),
        ...(rows ? [separator, text(recent.slice(0, rows).join("\n"))] : []),
        actionRow(linkButton("View all wars", pageUrl)),
      ],
      RECENT_WARS,
    ),
  );
}
