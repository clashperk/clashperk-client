import { notFound } from "next/navigation";

import { UserRoles } from "@/hooks/api/generated";
import { getSession } from "@/lib/auth";

// Hiding the sidebar link isn't enough: non-admins who type the URL get a 404.
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  if (!session?.user.roles?.includes(UserRoles.ADMIN)) notFound();

  return children;
}
