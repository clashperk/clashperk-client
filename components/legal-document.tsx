import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const SUPPORT_SERVER = "https://discord.gg/clashperk-support-509784317598105619";

export interface LegalSection {
  section: string;
  description?: string;
  details?: { type: string; description: string }[];
  uses?: string[];
  /** Appends a link to the support server after the description. */
  contact?: boolean;
}

export function LegalDocument({
  title,
  lastUpdated,
  sections,
}: {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}) {
  return (
    <div className="landing flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="flex-1 px-4 pb-20 pt-12 md:pt-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-medium tracking-[-1px] md:text-5xl">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated {lastUpdated}</p>

          <article className="mt-8 border-t border-border pt-8 leading-relaxed md:mt-10 md:pt-10">
            {sections.map((doc, index) => (
              <section key={index} className="space-y-3 [&+&]:mt-8">
                {doc.section && (
                  <h2 className="text-xl font-medium tracking-tight">{doc.section}</h2>
                )}

                {doc.description && (
                  <p className="text-muted-foreground">
                    {doc.description}
                    {doc.contact && (
                      <>
                        {" "}
                        <a
                          href={SUPPORT_SERVER}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          discord.gg/clashperk
                        </a>
                      </>
                    )}
                  </p>
                )}

                {doc.details?.map((detail) => (
                  <div key={detail.type} className="border-l-2 border-brand/30 pl-4">
                    <p className="font-medium">{detail.type}</p>
                    <p className="text-muted-foreground">{detail.description}</p>
                  </div>
                ))}

                {doc.uses && (
                  <ul className="list-disc space-y-1 pl-8 text-muted-foreground">
                    {doc.uses.map((use) => (
                      <li key={use}>{use}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </article>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
