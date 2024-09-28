import { authCookieKey } from '@/lib/constants';
import { getCookie } from 'cookies-next';
import { RostersEntity } from './types';

export const useRosters = () => {
  const getRosters = async (input: { guildId: string }) => {
    const accessToken = getCookie(authCookieKey);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/guilds/${input.guildId}/rosters`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    return data;
  };

  const getRoster = async (input: { rosterId: string }) => {
    const accessToken = getCookie(authCookieKey);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/rosters/${input.rosterId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    return data;
  };

  const changeRoster = async (input: {
    rosterId: string;
    body: {
      playerTags: string[];
      rosterId: string;
      categoryId: string | null;
    };
  }) => {
    const accessToken = getCookie(authCookieKey);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/rosters/${input.rosterId}/change-roster`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input.body)
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    return data as {
      result: {
        message: string;
        success: boolean;
        player: { name: string; tag: string };
      }[];
      roster: RostersEntity;
    };
  };

  const changeCategory = async (input: {
    rosterId: string;
    body: {
      playerTags: string[];
      categoryId: string;
    };
  }) => {
    const accessToken = getCookie(authCookieKey);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/rosters/${input.rosterId}/change-category`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input.body)
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    return data;
  };

  const removeMembers = async (input: {
    rosterId: string;
    body: {
      playerTags: string[];
    };
  }) => {
    const accessToken = getCookie(authCookieKey);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/rosters/${input.rosterId}/members`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input.body)
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    return data;
  };

  return { getRosters, getRoster, changeRoster, changeCategory, removeMembers };
};
