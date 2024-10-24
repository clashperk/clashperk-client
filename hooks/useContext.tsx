'use client';
import { UserProfilesEntity } from '@/lib/dto';
import { createContext, useState } from 'react';

interface UserInfo {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
}

const emptyUser = {
  userId: '',
  displayName: '',
  avatarUrl: ''
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
