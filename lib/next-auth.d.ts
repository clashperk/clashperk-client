import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
		username: string;
		guildId?: string;
		applicationId: string | null;
    roles: string[];
  }

  interface Session {
    accessToken: string;
    user: {
      id: string;
      displayName: string;
      username: string;
      avatarUrl: string;
			guildId: string;
      roles: string[];
    };
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    userId: string;
  }
}
