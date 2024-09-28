'use client';
import { UserProfilesEntity } from '@/lib/generated/graphql';
import { createContext, useState } from 'react';

interface UserInfo {
  fullName: string;
  userId: string;
  avatarUrl?: string | null;
  user: {
    email: string;
  };
}

const emptyUser = {
  userId: '',
  fullName: '',
  avatarUrl: '',
  user: { email: '' }
} satisfies UserInfo;

export const UserContext = createContext<
  [UserInfo, React.Dispatch<React.SetStateAction<UserInfo>>]
>([emptyUser, () => null]);

export function ContextWrapper({
  children,
  user
}: {
  children: React.ReactNode;
  user: UserProfilesEntity | null;
}) {
  const [userInfo, setUserInfo] = useState<UserInfo>(user || emptyUser);
  return (
    <UserContext.Provider value={[userInfo, setUserInfo]}>
      {children}
    </UserContext.Provider>
  );
}
