import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    guild: {
      id: string;
      name: string;
      iconUrl: string | null;
    };
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
      guild: {
        id: string;
        name: string;
        iconUrl: string | null;
      };
      roles: string[];
    };
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    userId: string;
  }
}
