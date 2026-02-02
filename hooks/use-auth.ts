import { useSession } from "next-auth/react";

export const useAuth = () => {
  const { data: session } = useSession({ required: true });

  if (!session) {
    throw new Error("No session found");
  }

  return session;
};
