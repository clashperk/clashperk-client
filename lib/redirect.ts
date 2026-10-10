const DEFAULT_REDIRECT = "/dashboard";

/** Keeps post-sign-in redirects on this site: only same-origin paths, never back to /login. */
export function safeRedirect(value: string | null) {
  if (
    !value?.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\")
  ) {
    return DEFAULT_REDIRECT;
  }
  if (value === "/login" || value.startsWith("/login?"))
    return DEFAULT_REDIRECT;
  return value;
}
