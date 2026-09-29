/** Normalizes a player/clan tag from a URL segment (`%23ABC`, `abc`, `#ABC`) to `#ABC`. */
export const normalizeTag = (raw: string): string | null => {
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {}

  const tag = decoded
    .toUpperCase()
    .replace(/O/g, "0")
    .replace(/[^0-9A-Z]/g, "");

  return tag ? `#${tag}` : null;
};

/** Tags must be encoded before going into an API path, or `#` becomes a URL fragment. */
export const encodeTag = (tag: string) => encodeURIComponent(tag);
