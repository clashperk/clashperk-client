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
    <article className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-1 font-semibold text-muted-foreground">Last Updated: {lastUpdated}</p>

      {sections.map((doc, index) => (
        <section key={index} className="mt-6 space-y-2">
          {doc.section && <h2 className="text-xl font-bold">{doc.section}</h2>}

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
                    className="text-blue-500 hover:underline"
                  >
                    discord.gg/clashperk
                  </a>
                </>
              )}
            </p>
          )}

          {doc.details?.map((detail) => (
            <div key={detail.type} className="pl-4">
              <p className="font-semibold">{detail.type}</p>
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
  );
}
