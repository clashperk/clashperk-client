import { SiteFooterLegal } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeToggle } from "@/components/theme-toggle";

/** Landing header and legal footer around pages people reach without the dashboard. */
export function PublicShell({
  showLogin = true,
  children,
}: {
  showLogin?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader actions={<ThemeToggle />} showLogin={showLogin} />
      {children}
      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <SiteFooterLegal />
        </div>
      </footer>
    </div>
  );
}
