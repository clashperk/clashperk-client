import type { Metadata } from "next";
import { headers } from "next/headers";

const ACCENT_COLOR = 0xc44800;
const MAX_EMBED_BYTES = 3000;

type TextDisplay = { type: 10; content: string };
type Thumbnail = { type: 11; media: { url: string } };
type LinkButton = { type: 2; style: 5; label: string; url: string };
type Section = {
  type: 9;
  components: TextDisplay[];
  accessory: Thumbnail | LinkButton;
};
type Separator = { type: 14 };
type ActionRow = { type: 1; components: LinkButton[] };
type EmbedComponent = TextDisplay | Section | Separator | ActionRow;

export const text = (content: string): TextDisplay => ({ type: 10, content });
export const separator: Separator = { type: 14 };
export const linkButton = (label: string, url: string): LinkButton => ({
  type: 2,
  style: 5,
  label,
  url,
});
export const actionRow = (...buttons: LinkButton[]): ActionRow => ({
  type: 1,
  components: buttons,
});
export const section = (content: string, imageUrl: string): Section => ({
  type: 9,
  components: [text(content)],
  accessory: { type: 11, media: { url: imageUrl } },
});

export const escapeMarkdown = (value: string) =>
  value.replace(/[\\*_~`|>#\-[\]()]/g, "\\$&");

export const starsText = (stars: number) =>
  "★".repeat(stars) + "☆".repeat(3 - stars);

// Discord drops a component embed over 3,000 bytes, so list rows are trimmed until it fits.
export function fitEmbed(
  build: (rows: number) => EmbedComponent[],
  maxRows: number,
) {
  for (let rows = maxRows; ; rows--) {
    const payload = {
      component: {
        type: 17,
        accent_color: ACCENT_COLOR,
        components: build(rows),
      },
    };
    const size = new TextEncoder().encode(JSON.stringify(payload)).length;
    if (size <= MAX_EMBED_BYTES || rows === 0) return payload;
  }
}

export async function siteOrigin() {
  const h = await headers();
  const host = h.get("host");
  const proto =
    h.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Points Discord's crawler at the page's component embed JSON; React hoists it into <head>. */
export async function ComponentEmbedLink({ path }: { path: string }) {
  return (
    <link
      rel="discord:component-embed"
      type="application/json"
      href={`${await siteOrigin()}${path}`}
    />
  );
}

export function previewMetadata({
  title,
  previewTitle,
  description,
  image,
}: {
  title: string;
  previewTitle: string;
  description: string;
  image?: { url: string; width?: number; height?: number; large?: boolean };
}): Metadata {
  return {
    title,
    description,
    openGraph: {
      siteName: "ClashPerk",
      title: previewTitle,
      description,
      images: image && [
        { url: image.url, width: image.width, height: image.height },
      ],
    },
    twitter: {
      card: image?.large ? "summary_large_image" : "summary",
      title: previewTitle,
      description,
    },
  };
}
